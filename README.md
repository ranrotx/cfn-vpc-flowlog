# cfn-vpc-flowlog
CloudFormation custom resource in Lambda to create/delete VPC flow logs.
This was created since CloudFormation does not allow a way to enable VPC flow logging when creating new VPCs.

This is a work in progress. So far, it's been tested from grunt using lambda_invoke with some test data.

Next step is to call it via a CloudFormation custom resource and test for any issues there.
