import {
  SESv2Client,
  GetAccountCommand,
  GetEmailIdentityCommand,
  SendEmailCommand,
  GetSuppressedDestinationCommand,
} from "@aws-sdk/client-sesv2";
import { z } from "zod";
import { randomBytes, createHash, verify } from "node:crypto";
import { query, transaction } from "./db";
import { sealSecret, openSecret } from "./provider-credentials";
export const sesSchema = z
  .object({
    region: z.string().regex(/^[a-z]{2}(?:-[a-z]+)+-\d+$/),
    accessKeyId: z.string().min(16).max(128),
    secretAccessKey: z.string().min(20).max(2048),
    sender: z.string().email(),
    replyTo: z.string().email(),
    notificationRecipient: z.string().email(),
    careersRecipient: z.string().email(),
    identity: z.string().min(3).max(254),
    configurationSet: z
      .string()
      .regex(/^[A-Za-z0-9_-]+$/)
      .max(64),
    snsTopicArn: z
      .string()
      .regex(/^arn:aws:sns:[a-z0-9-]+:\d{12}:[A-Za-z0-9_-]+$/),
    retentionDays: z.number().int().min(7).max(730).default(180),
  })
  .strict();
export type SesSettings = z.infer<typeof sesSchema>;
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const token = () => randomBytes(32).toString("hex");
export async function sesSettings() {
  const [row] = await query(
    "SELECT value FROM settings WHERE key='ses_credentials'",
  );
  if (!row) throw new Error("Configure AWS SES first");
  return sesSchema.parse(openSecret("ses", row.value));
}
export async function saveSesSettings(value: unknown) {
  const input = sesSchema.parse(value);
  await transaction(async (c) => {
    await c.query(
      "INSERT INTO settings(key,value) VALUES('ses_credentials',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      [JSON.stringify(sealSecret("ses", input))],
    );
    await c.query("DELETE FROM settings WHERE key='ses_delivery_status'");
  });
}
function client(settings: SesSettings) {
  return new SESv2Client({
    region: settings.region,
    credentials: {
      accessKeyId: settings.accessKeyId,
      secretAccessKey: settings.secretAccessKey,
    },
    maxAttempts: 1,
  });
}
export async function checkSes(test = false) {
  const settings = await sesSettings(),
    ses = client(settings);
  const [account, identity] = await Promise.all([
    ses.send(new GetAccountCommand({})),
    ses.send(new GetEmailIdentityCommand({ EmailIdentity: settings.identity })),
  ]);
  const verified = identity.VerifiedForSendingStatus === true;
  const senderMatches =
    settings.identity === settings.sender ||
    settings.sender.endsWith("@" + settings.identity);
  let messageId: string | undefined;
  if (test && verified && senderMatches && account.SendingEnabled)
    messageId = (
      await ses.send(
        new SendEmailCommand({
          FromEmailAddress: settings.sender,
          ReplyToAddresses: [settings.replyTo],
          ConfigurationSetName: settings.configurationSet,
          Destination: { ToAddresses: [settings.notificationRecipient] },
          Content: {
            Simple: {
              Subject: {
                Data: "Netofficials SES delivery test",
                Charset: "UTF-8",
              },
              Body: {
                Text: {
                  Data: "AWS SES connection and sender checks passed. This test email confirms the send request was accepted.",
                  Charset: "UTF-8",
                },
              },
            },
          },
        }),
      )
    ).MessageId;
  const [previous] = await query(
    "SELECT value FROM settings WHERE key='ses_delivery_status'",
  );
  const status = {
    verified,
    senderMatches,
    sendingEnabled: account.SendingEnabled === true,
    productionAccess: account.ProductionAccessEnabled === true,
    testAccepted: !!messageId || previous?.value?.testAccepted === true,
    testMessageId: messageId ?? previous?.value?.testMessageId ?? null,
    deliveryConfirmed:
      !messageId && previous?.value?.deliveryConfirmed === true,
    checkedAt: new Date().toISOString(),
  };
  await query(
    "INSERT INTO settings(key,value) VALUES('ses_delivery_status',$1) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    [JSON.stringify(status)],
  );
  return status;
}
export async function newsletterReady() {
  const [status] = await query(
    "SELECT value FROM settings WHERE key='ses_delivery_status'",
  );
  const s = status?.value;
  return !!(
    s?.verified &&
    s.senderMatches &&
    s.sendingEnabled &&
    s.productionAccess &&
    s.testAccepted &&
    s.deliveryConfirmed &&
    Date.now() - Date.parse(s.checkedAt) < 7 * 86400000
  );
}
export async function queueEmail(
  recipient: string,
  subject: string,
  body: string,
  purpose: string,
  dedupeKey: string,
) {
  await query(
    "INSERT INTO email_outbox(recipient,subject,body,purpose,dedupe_key) VALUES($1,$2,$3,$4,$5) ON CONFLICT(dedupe_key) DO NOTHING",
    [recipient, subject, body, purpose, dedupeKey],
  );
}
export async function subscribe(email: string) {
  if (!(await newsletterReady()))
    throw new Error("Newsletter signup is unavailable");
  email = z.string().email().max(254).parse(email).toLowerCase();
  const confirmation = token(),
    unsubscribe = token(),
    base = new URL(process.env.SITE_URL!);
  await transaction(async (c) => {
    const existing = await c.query(
      "SELECT * FROM newsletter_subscribers WHERE email=$1 FOR UPDATE",
      [email],
    );
    if (
      existing.rows[0] &&
      (["active", "suppressed"].includes(existing.rows[0].status) ||
        Date.now() - new Date(existing.rows[0].updated_at).getTime() < 3600000)
    )
      return;
    const inserted = await c.query(
      "INSERT INTO newsletter_subscribers(email,confirmation_hash,confirmation_expires_at,unsubscribe_hash) VALUES($1,$2,now()+interval '24 hours',$3) ON CONFLICT(email) DO UPDATE SET status='pending',confirmation_hash=excluded.confirmation_hash,confirmation_expires_at=excluded.confirmation_expires_at,unsubscribe_hash=excluded.unsubscribe_hash,updated_at=now() RETURNING id",
      [email, tokenHash(confirmation), tokenHash(unsubscribe)],
    );
    const confirmUrl = new URL(
      "/newsletter/confirm?token=" + confirmation,
      base,
    ).href;
    const unsubUrl = new URL(
      "/newsletter/unsubscribe?token=" + unsubscribe,
      base,
    ).href;
    await c.query(
      "INSERT INTO email_outbox(recipient,subject,body,purpose,dedupe_key) VALUES($1,$2,$3,'newsletter-confirm',$4)",
      [
        email,
        "Confirm your Netofficials subscription",
        "Confirm your subscription within 24 hours:\n" +
          confirmUrl +
          "\n\nUnsubscribe:\n" +
          unsubUrl,
        "newsletter-confirm:" +
          inserted.rows[0].id +
          ":" +
          tokenHash(confirmation),
      ],
    );
  });
}
export async function confirmSubscription(value: string) {
  if (!/^[a-f0-9]{64}$/.test(value)) return false;
  const rows = await query(
    "UPDATE newsletter_subscribers SET status='active',confirmed_at=now(),confirmation_hash=NULL,confirmation_expires_at=NULL,updated_at=now() WHERE confirmation_hash=$1 AND confirmation_expires_at>now() AND status='pending' RETURNING id",
    [tokenHash(value)],
  );
  return rows.length > 0;
}
export async function unsubscribe(value: string) {
  if (!/^[a-f0-9]{64}$/.test(value)) return;
  await query(
    "UPDATE newsletter_subscribers SET status=CASE WHEN status='suppressed' THEN 'suppressed' ELSE 'unsubscribed' END,confirmation_hash=NULL,updated_at=now() WHERE unsubscribe_hash=$1",
    [tokenHash(value)],
  );
}
export async function sendOutbox() {
  const [row] = await query(
    "UPDATE email_outbox SET status='sending',attempts=attempts+1,lease_until=now()+interval '2 minutes',updated_at=now() WHERE id=(SELECT id FROM email_outbox WHERE (status='queued' OR (status='sending' AND lease_until<now())) AND attempts<5 AND next_attempt_at<=now() ORDER BY created_at LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *",
  );
  if (!row) return false;
  try {
    const settings = await sesSettings(),
      ses = client(settings);
    const [subscriber] = await query(
      "SELECT status FROM newsletter_subscribers WHERE email=$1",
      [row.recipient],
    );
    if (
      subscriber?.status === "suppressed" ||
      (row.purpose === "newsletter-confirm" &&
        subscriber?.status === "unsubscribed")
    ) {
      await query(
        "UPDATE email_outbox SET status='suppressed',lease_until=NULL WHERE id=$1",
        [row.id],
      );
      return true;
    }
    try {
      const suppression = await ses.send(
        new GetSuppressedDestinationCommand({ EmailAddress: row.recipient }),
      );
      if (suppression.SuppressedDestination) {
        await query(
          "UPDATE email_outbox SET status='suppressed',lease_until=NULL WHERE id=$1",
          [row.id],
        );
        return true;
      }
    } catch (e) {
      if ((e as { name?: string }).name !== "NotFoundException") throw e;
    }
    const sent = await ses.send(
      new SendEmailCommand({
        FromEmailAddress: settings.sender,
        ReplyToAddresses: [settings.replyTo],
        ConfigurationSetName: settings.configurationSet,
        Destination: { ToAddresses: [row.recipient] },
        Content: {
          Simple: {
            Subject: { Data: row.subject, Charset: "UTF-8" },
            Body: { Text: { Data: row.body, Charset: "UTF-8" } },
          },
        },
      }),
    );
    await query(
      "UPDATE email_outbox SET status='sent',provider_message_id=$1,lease_until=NULL,error=NULL,updated_at=now() WHERE id=$2",
      [sent.MessageId, row.id],
    );
  } catch (error) {
    await query(
      "UPDATE email_outbox SET status=CASE WHEN attempts>=5 THEN 'failed' ELSE 'queued' END,error=$1,next_attempt_at=now()+interval '1 minute'*attempts,lease_until=NULL,updated_at=now() WHERE id=$2",
      [error instanceof Error ? error.name : "Delivery failed", row.id],
    );
  }
  return true;
}
export async function validateSns(input: unknown, topicArn: string) {
  const message = z
    .object({
      Type: z.enum(["Notification", "SubscriptionConfirmation"]),
      MessageId: z.string(),
      TopicArn: z.literal(topicArn),
      Message: z.string().max(100000),
      Timestamp: z.string().datetime(),
      SignatureVersion: z.enum(["1", "2"]),
      Signature: z.string().max(4096),
      SigningCertURL: z.string().url(),
      Subject: z.string().optional(),
      SubscribeURL: z.string().url().optional(),
      Token: z.string().max(8192).optional(),
    })
    .passthrough()
    .parse(input);
  const cert = new URL(message.SigningCertURL);
  if (
    cert.protocol !== "https:" ||
    cert.port ||
    cert.username ||
    cert.password ||
    !/^sns\.[a-z0-9-]+\.amazonaws\.com$/.test(cert.hostname) ||
    !/^\/SimpleNotificationService-[a-zA-Z0-9_-]+\.pem$/.test(cert.pathname) ||
    cert.search
  )
    throw new Error("Invalid SNS certificate URL");
  if (Math.abs(Date.now() - Date.parse(message.Timestamp)) > 15 * 60000)
    throw new Error("Expired notification");
  if (
    message.Type === "SubscriptionConfirmation" &&
    (!message.SubscribeURL || !message.Token)
  )
    throw new Error("Invalid subscription confirmation");
  const keys =
    message.Type === "SubscriptionConfirmation"
      ? [
          "Message",
          "MessageId",
          "SubscribeURL",
          "Timestamp",
          "Token",
          "TopicArn",
          "Type",
        ]
      : [
          "Message",
          "MessageId",
          ...(message.Subject !== undefined ? ["Subject"] : []),
          "Timestamp",
          "TopicArn",
          "Type",
        ];
  const canonical = keys
    .map((k) => k + "\n" + String(message[k]) + "\n")
    .join("");
  const response = await fetch(cert, {
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("SNS certificate unavailable");
  const pem = await response.text();
  if (
    pem.length > 20000 ||
    !verify(
      message.SignatureVersion === "2" ? "RSA-SHA256" : "RSA-SHA1",
      Buffer.from(canonical),
      pem,
      Buffer.from(message.Signature, "base64"),
    )
  )
    throw new Error("Invalid SNS signature");
  return message;
}
export async function handleSesEvent(input: unknown) {
  const settings = await sesSettings(),
    envelope = await validateSns(input, settings.snsTopicArn);
  if (envelope.Type === "SubscriptionConfirmation") {
    const url = new URL(envelope.SubscribeURL!);
    if (
      url.protocol !== "https:" ||
      url.hostname !==
        "sns." + settings.snsTopicArn.split(":")[3] + ".amazonaws.com" ||
      url.port ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.searchParams.get("Action") !== "ConfirmSubscription" ||
      url.searchParams.get("TopicArn") !== settings.snsTopicArn ||
      url.searchParams.get("Token") !== envelope.Token ||
      [...url.searchParams.keys()].some(
        (k) => !["Action", "TopicArn", "Token"].includes(k),
      )
    )
      throw new Error("Invalid subscription confirmation URL");
    const confirmed = await fetch(url, {
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    if (!confirmed.ok) throw new Error("SNS subscription confirmation failed");
    return;
  }
  const event = JSON.parse(envelope.Message);
  const type = event.notificationType ?? event.eventType;
  if (type === "Delivery") {
    await query(
      "UPDATE settings SET value=jsonb_set(value,'{deliveryConfirmed}','true'::jsonb) WHERE key='ses_delivery_status' AND value->>'testMessageId'=$1",
      [event.mail?.messageId],
    );
  }
  if (type === "Bounce" || type === "Complaint") {
    const recipients =
      (type === "Bounce"
        ? event.bounce?.bouncedRecipients
        : event.complaint?.complainedRecipients) ?? [];
    for (const recipient of recipients) {
      const email = z
        .string()
        .email()
        .parse(recipient.emailAddress)
        .toLowerCase();
      await transaction(async (c) => {
        await c.query(
          "UPDATE newsletter_subscribers SET status='suppressed',confirmation_hash=NULL,updated_at=now() WHERE email=$1",
          [email],
        );
        await c.query(
          "UPDATE email_outbox SET status='suppressed',lease_until=NULL WHERE recipient=$1 AND status IN ('queued','sending')",
          [email],
        );
      });
    }
  }
}
