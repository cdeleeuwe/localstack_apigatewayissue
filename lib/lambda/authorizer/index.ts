import {
  APIGatewayRequestAuthorizerEvent,
  CustomAuthorizerResult,
} from "aws-lambda";

export const handler = async (
  event: APIGatewayRequestAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  const { methodArn } = event;

  console.log({ AUTHORIZER: event });

  const policy: CustomAuthorizerResult = {
    principalId: "TEST",
    context: {
      PASSED_THROUGH_AUTHORIZER: true,
    },
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: "Deny",
          Resource: methodArn,
        },
      ],
    },
  };

  return policy;
};
