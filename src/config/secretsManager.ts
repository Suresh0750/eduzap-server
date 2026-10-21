
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({
  region: process.env.AWS_REGION || "ap-southeast-2",
});

export async function getSecret(secretName: string): Promise<string> {
  const response = await client.send(
    new GetSecretValueCommand({
      SecretId: secretName,
    })
  );

  if (!response.SecretString) {
    throw new Error(`Secret ${secretName} has no string value`);
  }

  return response.SecretString;
}
