var AWS = require('aws-sdk');


exports.handler = function(event, context) {

    var ec2 = new AWS.EC2({region: 'us-east-1'}); //TODO: need to replace

    var vpcId = event.ResourceProperties.VpcId;
    var FlowLogId = event.ResourceProperties.FlowLogId;
    var LogGroupToCreate = event.ResourceProperties.LogGroupName;
    var Arn = event.ResourceProperties.DeliverLogsPermissionArn;

	
    if (event.RequestType == "Delete") {
        var params = {
          FlowLogIds: [ /* required */
            FlowLogId
          ]
        };
        ec2.deleteFlowLogs(params, function(err, data) {
          if (err) {
            responseData = {Error: "Could not delete flow log"};
            console.log(responseData.Error + ":\n", err);
          }
          else sendResponse(event, context, "SUCCESS");           // successful response
        });
     
    }
    

    if (event.RequestType == "Create") {
        var params = {
          DeliverLogsPermissionArn: Arn, 
          LogGroupName: LogGroupToCreate, 
          ResourceIds: [ /* required */
            vpcId
            /* more items */
          ],
          ResourceType: 'VPC', /* required */
          TrafficType: 'ALL' /* required */
        };
        ec2.createFlowLogs(params, function(err, data) {
          if (err) {
            responseData = {Error: "Could not create flow log"};
            console.log(responseData.Error + ":\n", err);
          }
          else     {  // successful response
            var FlowLogsCreated = data.FlowLogIds;
            sendResponse(event, context, "SUCCESS", FlowLogCreated);
          }           
        });
    }
    
}

function sendResponse(event, context, responseStatus, responseData) {
 
    var responseBody = JSON.stringify({
        Status: responseStatus,
        Reason: "See the details in CloudWatch Log Stream: " + context.logStreamName,
        PhysicalResourceId: context.logStreamName,
        StackId: event.StackId,
        RequestId: event.RequestId,
        LogicalResourceId: event.LogicalResourceId,
        Data: responseData
    });
 
    console.log("RESPONSE BODY:\n", responseBody);
 
    var https = require("https");
    var url = require("url");
 
    var parsedUrl = url.parse(event.ResponseURL);
    var options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: parsedUrl.path,
        method: "PUT",
        headers: {
            "content-type": "",
            "content-length": responseBody.length
        }
    };
 
    console.log("SENDING RESPONSE...\n");
 
    var request = https.request(options, function(response) {
        console.log("STATUS: " + response.statusCode);
        console.log("HEADERS: " + JSON.stringify(response.headers));
        // Tell AWS Lambda that the function execution is done  
        context.done();
    });
 
    request.on("error", function(error) {
        console.log("sendResponse Error:" + error);
        // Tell AWS Lambda that the function execution is done  
        context.done();
    });
  
    // write data to request body
    request.write(responseBody);
    request.end();
}