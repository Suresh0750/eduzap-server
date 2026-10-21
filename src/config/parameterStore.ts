
import {
  GetParameterCommand,
  SSMClient,
} from "@aws-sdk/client-ssm";

const ssm = new SSMClient({
  region: process.env.AWS_REGION || "ap-southeast-2",
});

export async function getParameter(name: string): Promise<string> {
  const response = await ssm.send(
    new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    })
  );

  const value = response.Parameter?.Value;

  if (value === undefined) {
    throw new Error("SSM parameter value was not returned");
  }

  return value;
}
