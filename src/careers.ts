import { z } from "zod";
import { randomUUID, createHash } from "node:crypto";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import net from "node:net";
import yauzl from "yauzl";
import { query, transaction } from "./db";
import { sesSettings } from "./ses-newsletter";
export const cvRoot = () =>
  path.resolve(process.env.PRIVATE_CV_DIR ?? ".data/cvs");
export const vacancySchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(150),
    title: z.string().min(3).max(200),
    department: z.string().min(1).max(100),
    location: z.string().min(1).max(200),
    employment_type: z.string().min(1).max(100),
    description: z.string().min(30).max(20000),
    status: z.enum(["open", "closed"]),
    verified: z.boolean(),
  })
  .strict();
export async function validateCV(bytes: Buffer, filename: string) {
  if (bytes.length === 0 || bytes.length > 5 * 1024 * 1024)
    throw new Error("CV must be no larger than 5 MB");
  if (
    /\.pdf$/i.test(filename) &&
    bytes.subarray(0, 5).toString() === "%PDF-" &&
    /%%EOF/.test(bytes.subarray(-1024).toString())
  )
    return "application/pdf";
  if (!/\.docx$/i.test(filename) || bytes.readUInt32LE(0) !== 0x04034b50)
    throw new Error("Upload a valid PDF or DOCX");
  await new Promise<void>((resolve, reject) => {
    yauzl.fromBuffer(
      bytes,
      { lazyEntries: true, validateEntrySizes: true },
      (error, zip) => {
        if (error || !zip) {
          reject(new Error("Invalid DOCX archive"));
          return;
        }
        let count = 0,
          size = 0,
          document = false,
          types = false;
        const fail = (message: string) => {
          zip.close();
          reject(new Error(message));
        };
        zip.on("error", () => fail("Invalid DOCX archive"));
        zip.on("entry", (entry) => {
          count++;
          size += entry.uncompressedSize;
          if (
            count > 2000 ||
            size > 30 * 1024 * 1024 ||
            entry.fileName.includes("..") ||
            entry.fileName.startsWith("/") ||
            /vbaProject|embeddings\//i.test(entry.fileName) ||
            entry.generalPurposeBitFlag & 1
          ) {
            fail("Unsupported DOCX contents");
            return;
          }
          if (entry.fileName === "word/document.xml") document = true;
          if (entry.fileName === "[Content_Types].xml") types = true;
          if (
            /\.rels$/.test(entry.fileName) ||
            entry.fileName === "[Content_Types].xml"
          ) {
            zip.openReadStream(entry, (err, stream) => {
              if (err || !stream) {
                fail("Invalid DOCX contents");
                return;
              }
              const chunks: Buffer[] = [];
              stream.on("data", (c) => chunks.push(c));
              stream.on("error", () => fail("Invalid DOCX contents"));
              stream.on("end", () => {
                const xml = Buffer.concat(chunks).toString();
                if (
                  /TargetMode\s*=\s*["']External|macroEnabled|<!ENTITY|<!DOCTYPE/i.test(
                    xml,
                  )
                ) {
                  fail("Unsupported DOCX contents");
                  return;
                }
                zip.readEntry();
              });
            });
          } else zip.readEntry();
        });
        zip.on("end", () => {
          if (document && types) resolve();
          else reject(new Error("Invalid DOCX document"));
        });
        zip.readEntry();
      },
    );
  });
  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}
export function scanCV(bytes: Buffer): Promise<void> {
  const host = process.env.CLAMAV_HOST;
  if (!host)
    return Promise.reject(
      new Error("CV scanning is unavailable. Please try again later."),
    );
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({
      host,
      port: Number(process.env.CLAMAV_PORT ?? 3310),
    });
    let response = "";
    socket.setTimeout(30000);
    socket.on("connect", () => {
      socket.write("zINSTREAM\0");
      for (let i = 0; i < bytes.length; i += 65536) {
        const chunk = bytes.subarray(i, i + 65536),
          size = Buffer.alloc(4);
        size.writeUInt32BE(chunk.length);
        socket.write(size);
        socket.write(chunk);
      }
      socket.write(Buffer.alloc(4));
    });
    socket.on("data", (chunk) => {
      response += chunk.toString();
      if (response.length > 2048)
        socket.destroy(new Error("Invalid scanner response"));
    });
    socket.on("timeout", () =>
      socket.destroy(new Error("CV scanner timed out")),
    );
    socket.on("error", () =>
      reject(new Error("CV scanning is unavailable. Please try again later.")),
    );
    socket.on("end", () => {
      if (/^stream: OK\0?$/.test(response.trim())) resolve();
      else reject(new Error("CV did not pass the security scan"));
    });
  });
}
export async function submitApplication(form: FormData) {
  const details = z
    .object({
      vacancyId: z.string().uuid(),
      name: z.string().trim().min(1).max(120),
      email: z
        .string()
        .email()
        .max(254)
        .transform((s) => s.toLowerCase()),
      phone: z.string().max(100),
      coverMessage: z.string().max(5000),
      consent: z.literal("on"),
    })
    .parse(
      Object.fromEntries(
        ["vacancyId", "name", "email", "phone", "coverMessage", "consent"].map(
          (key) => [key, String(form.get(key) ?? "")],
        ),
      ),
    );
  const [vacancy] = await query(
    "SELECT * FROM vacancies WHERE id=$1 AND status='open' AND verified=true",
    [details.vacancyId],
  );
  if (!vacancy) throw new Error("This position is not accepting applications");
  const [duplicate] = await query(
    "SELECT id FROM career_applications WHERE vacancy_id=$1 AND email=$2",
    [details.vacancyId, details.email],
  );
  if (duplicate) return { duplicate: true };
  const cv = form.get("cv");
  if (!(cv instanceof File)) throw new Error("Attach your CV");
  if (cv.size > 5 * 1024 * 1024)
    throw new Error("CV must be no larger than 5 MB");
  const bytes = Buffer.from(await cv.arrayBuffer()),
    mime = await validateCV(bytes, cv.name);
  await scanCV(bytes);
  const settings = await sesSettings(); // Acknowledgements must have a configured sender.
  const id = randomUUID(),
    filename = id + (mime === "application/pdf" ? ".pdf" : ".docx"),
    hash = createHash("sha256").update(bytes).digest("hex");
  await mkdir(cvRoot(), { recursive: true, mode: 0o700 });
  await writeFile(path.join(cvRoot(), filename), bytes, {
    flag: "wx",
    mode: 0o600,
  });
  try {
    await transaction(async (c) => {
      const current = await c.query(
        "SELECT id FROM vacancies WHERE id=$1 AND status='open' AND verified=true FOR SHARE",
        [details.vacancyId],
      );
      if (!current.rows.length)
        throw new Error("This position is no longer accepting applications");
      await c.query(
        "INSERT INTO career_applications(id,vacancy_id,email,name,phone,cover_message,consent_at,cv_filename,cv_hash,cv_mime,scan_result) VALUES($1,$2,$3,$4,$5,$6,now(),$7,$8,$9,'clean')",
        [
          id,
          details.vacancyId,
          details.email,
          details.name,
          details.phone,
          details.coverMessage,
          filename,
          hash,
          mime,
        ],
      );
      await c.query(
        "INSERT INTO email_outbox(recipient,subject,body,purpose,dedupe_key) VALUES($1,$2,$3,'career-ack',$4)",
        [
          details.email,
          "Application received: " + vacancy.title,
          "We received your application for " +
            vacancy.title +
            ". Our team will review it and contact you if there is a next step.",
          "career-ack:" + id,
        ],
      );
      await c.query(
        "INSERT INTO email_outbox(recipient,subject,body,purpose,dedupe_key) VALUES($1,$2,$3,'career-notification',$4)",
        [
          settings.careersRecipient,
          "New application: " + vacancy.title,
          "Review the application in the owner workspace:\n" +
            new URL("/admin/publishing?view=careers", process.env.SITE_URL!)
              .href,
          "career-notification:" + id,
        ],
      );
    });
  } catch (error) {
    await unlink(path.join(cvRoot(), filename)).catch(() => {});
    if ((error as { code?: string }).code === "23505")
      return { duplicate: true };
    throw error;
  }
  return { duplicate: false };
}
export async function readCV(filename: string, expectedHash?: string) {
  if (!/^[a-f0-9-]{36}\.(pdf|docx)$/.test(filename))
    throw new Error("Invalid CV filename");
  const bytes = await readFile(path.join(cvRoot(), filename));
  if (
    expectedHash &&
    createHash("sha256").update(bytes).digest("hex") !== expectedHash
  )
    throw new Error("CV integrity check failed");
  return bytes;
}
export async function deleteApplication(id: string) {
  z.string().uuid().parse(id);
  const [application] = await query(
    "SELECT cv_filename FROM career_applications WHERE id=$1",
    [id],
  );
  if (!application) return;
  await unlink(path.join(cvRoot(), application.cv_filename)).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error;
    },
  );
  await query("DELETE FROM career_applications WHERE id=$1", [id]);
  await query("DELETE FROM email_outbox WHERE dedupe_key=ANY($1::text[])", [
    ["career-ack:" + id, "career-notification:" + id],
  ]);
}
export async function expireApplications() {
  const [setting] = await query(
    "SELECT value FROM settings WHERE key='career_retention_days'",
  );
  const days = z
    .number()
    .int()
    .min(7)
    .max(730)
    .parse(setting?.value ?? 180);
  const applications = await query(
    "SELECT id FROM career_applications WHERE created_at<now()-$1*interval '1 day' LIMIT 50",
    [days],
  );
  for (const application of applications)
    await deleteApplication(application.id);
}
