import {
  BedrockClient,
  ListFoundationModelsCommand,
  ListInferenceProfilesCommand,
} from "@aws-sdk/client-bedrock";
import type { Provider } from "./providers";
import {
  providerCredentials,
  type ProviderCredentials,
} from "./provider-credentials";
export type ModelChoice = {
  id: string;
  name: string;
  kind: string;
  context?: number;
  outputLimit?: number;
};
export async function modelCatalog(
  provider: Provider,
  suppliedCredentials?: ProviderCredentials,
) {
  if (provider === "openrouter") {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("OpenRouter model catalog unavailable");
    const body = await response.json();
    const models: ModelChoice[] = (body.data ?? [])
      .filter(
        (m: any) =>
          !m.architecture?.output_modalities ||
          m.architecture.output_modalities.includes("text"),
      )
      .map((m: any) => ({
        id: m.id,
        name: m.name ?? m.id,
        kind: "Model",
        context: m.context_length,
        outputLimit: m.top_provider?.max_completion_tokens,
      }));
    return {
      models: models.sort((a, b) => a.name.localeCompare(b.name)),
      warnings: [] as string[],
    };
  }
  const credentials =
    suppliedCredentials ?? (await providerCredentials(provider));
  if (credentials.provider !== "bedrock")
    throw new Error("Provider credentials do not match");
  const client = new BedrockClient({
    region: credentials.region,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken || undefined,
    },
    maxAttempts: 1,
  });
  const models: ModelChoice[] = [],
    warnings: string[] = [];
  try {
    const results = await Promise.allSettled([
      client.send(
        new ListFoundationModelsCommand({
          byOutputModality: "TEXT",
          byInferenceType: "ON_DEMAND",
        }),
        { abortSignal: AbortSignal.timeout(15000) },
      ),
      (async () => {
        const profiles: ModelChoice[] = [];
        let nextToken: string | undefined;
        for (let i = 0; i < 10; i++) {
          const r = await client.send(
            new ListInferenceProfilesCommand({ maxResults: 100, nextToken }),
            { abortSignal: AbortSignal.timeout(15000) },
          );
          for (const p of r.inferenceProfileSummaries ?? [])
            if (p.status === "ACTIVE" && p.inferenceProfileId)
              profiles.push({
                id: p.inferenceProfileId,
                name: p.inferenceProfileName ?? p.inferenceProfileId,
                kind: "Inference profile",
              });
          nextToken = r.nextToken;
          if (!nextToken) break;
        }
        if (nextToken)
          warnings.push(
            "Additional profiles exist; enter an exact ID if yours is not listed.",
          );
        return profiles;
      })(),
    ]);
    if (results[0].status === "fulfilled") {
      for (const m of results[0].value.modelSummaries ?? [])
        if (m.modelId && m.modelLifecycle?.status !== "LEGACY")
          models.push({
            id: m.modelId,
            name: m.modelName ?? m.modelId,
            kind: m.providerName ?? "Foundation model",
          });
    } else
      warnings.push(
        "Foundation model listing unavailable. Check bedrock:ListFoundationModels permission.",
      );
    if (results[1].status === "fulfilled") models.push(...results[1].value);
    else
      warnings.push(
        "Inference profile listing unavailable. Check bedrock:ListInferenceProfiles permission.",
      );
    if (!models.length)
      throw new Error(
        "No Bedrock models could be listed. Check AWS region and catalog permissions, or enter an exact model/profile ID.",
      );
    return {
      models: [...new Map(models.map((m) => [m.id, m])).values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      warnings,
    };
  } finally {
    client.destroy();
  }
}
