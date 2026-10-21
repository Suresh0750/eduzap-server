
import dotenv from "dotenv";

async function bootstrap() {
  dotenv.config();

  if (process.env.NODE_ENV === "production") {
    const { getSecret } = await import("./config/secretsManager");

    const secretString = await getSecret(
      "eduzap/prod/app-secrets"
    );

    const secrets = JSON.parse(secretString) as Record<string, string>;

    const requiredKeys = [
      "AWS_REGION",
      "AWS_S3_BUCKET",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "CLOUDINARY_CLOUD_NAME",
      "MONGO_URL",
      "PORT",
    ];

    for (const key of requiredKeys) {
      if (!secrets[key]) {
        throw new Error(`Required configuration is missing: ${key}`);
      }

      process.env[key] = secrets[key];
    }

    console.log("Production configuration loaded successfully.");
  } else {
    console.log("Using local .env configuration.");
  }

  await import("./server");
}

bootstrap().catch((error) => {
  console.error("Application startup failed:", error.message);
  process.exitCode = 1;
});
