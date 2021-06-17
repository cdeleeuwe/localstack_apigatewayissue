import * as cdk from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import { LambdaIntegration } from "@aws-cdk/aws-apigateway";

export class CdkapiTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authorizerLambda = new lambda.Function(this, "AuthorizerLambda", {
      code: lambda.Code.fromAsset(`dist/lambda/authorizer`),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    const privateLambda = new lambda.Function(this, "PrivateLambda", {
      code: lambda.Code.fromAsset(`dist/lambda/private`),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    const publicLambda = new lambda.Function(this, "PublicLambda", {
      code: lambda.Code.fromAsset(`dist/lambda/public`),
      handler: "index.handler",
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    const authorizer = new apigateway.RequestAuthorizer(
      this,
      "DefaultAuthorizer",
      {
        handler: authorizerLambda,
        identitySources: [apigateway.IdentitySource.context("path")],
      }
    );

    const api = new apigateway.RestApi(this, "BackendApi", {
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      apiKeySourceType: apigateway.ApiKeySourceType.AUTHORIZER,
      defaultMethodOptions: {
        apiKeyRequired: false,
      },
    });

    const apiV1 = api.root.addResource("api");

    apiV1
      .addResource("public")
      .addMethod("GET", new LambdaIntegration(publicLambda));
    apiV1
      .addResource("private")
      .addMethod("GET", new LambdaIntegration(privateLambda), {
        authorizer,
      });

    new cdk.CfnOutput(this, "ApiGatewayFullUrl", {
      value: `http://localhost:4566/restapis/${api.restApiId}/prod/_user_request_/`,
    });
  }
}
