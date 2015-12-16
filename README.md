# cfn-vpc-flowlog
CloudFormation custom resource in Lambda to create/delete VPC flow logs.
This was created since CloudFormation does not allow a way to enable VPC flow logging when creating new VPCs.

## Work in progress
The project is stil a work in progress. I'm still working through some issues, so you may end up with a stack in an inconsistent state or with resources you can't be deleted by CloudFormation.

If this is the case, my best advice is to manually delete the resources manually, then replace the Lambda function with a function that will always return success to CloudFormation. Then try to delete the stack again and it should succeed.

## How to use

1. Create a IAM role that the Lambda function will use. You can use the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": "ec2:CreateFlowLogs",
      "Resource": "*"
    }
  ]
}
```

2. Upload the Lambda function `index.js`. Use the IAM role created above for permissions.
3. Take note of the ARN of the lambda function.
4. Use the `sample.template` CloudFormation template and create a VPC with flow logs enabled.
5. Use the `Gruntfile.sample` to create your own `Gruntfile.js`. Replace the `region`, `000000000000`, and `functionname` in the ARN with values that make sense for you.

