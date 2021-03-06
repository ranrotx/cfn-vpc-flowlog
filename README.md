# cfn-vpc-flowlog
CloudFormation custom resource in Lambda to create/delete VPC flow logs.
This was created since CloudFormation does not allow a way to enable VPC flow logging when creating new VPCs.

## Deprecation

CloudFormation now supports the ability to create flow logs for VPCs. Please see the blog post [here](https://aws.amazon.com/about-aws/whats-new/2016/06/aws-cloudformation-adds-support-for-amazon-vpc-flow-logs-amazon-kinesis-firehose-streams-and-other-updates/) and use native functionality instead.

That being said, this is probably a good example for the future on how to handle needs for services/features that aren't met (yet) by CloudFormation when new items are introduced.

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

2. Upload the Lambda function `index.js`. Use the IAM role created above for permissions. A 30 second execuation timeout should be fine.
3. Take note of the ARN of the lambda function.
4. Use the `sample.template` CloudFormation template and create a VPC with flow logs enabled. You'll need to specify the ARN of your Lambda function along with other inputs such as the VPC CIDR to create, log retention time etc.

## Other notes

This project was mainly created for demonstration purposes. As such, I can easily see it being modified to make the Lambda function more modular. For example, when I get the time one idea I have is to modify it to take generic inputs so that it can be re-used to enable flow logging on not just an entire VPC but maybe at the subnet and/or ENI level.



