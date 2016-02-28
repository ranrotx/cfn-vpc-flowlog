var AWS = require('aws-sdk');


exports.handler = function(event, context) {

    var ec2 = new AWS.EC2({region: event.ResourceProperties.Region}); 

    var vpcId = event.ResourceProperties.VpcId;
    var FlowLogId = event.ResourceProperties.FlowLogId;
    var LogGroupToCreate = event.ResourceProperties.LogGroupName;
    var Arn = event.ResourceProperties.DeliverLogsPermissionArn;
    var responseData = {};

    
     // For Delete requests, immediately send a SUCCESS response (we're not going to delete anything).
    if (event.RequestType == "Delete") {
        sendResponse(event, context, "SUCCESS");
        return;
    }
    

    if (event.RequestType == "Create") {
        var params = {
          DeliverLogsPermissionArn: Arn, 
          LogGroupName: LogGroupToCreate, 
          ResourceIds: [ 
            vpcId
          ],
          ResourceType: 'VPC', 
          TrafficType: 'ALL' 
        };
        ec2.createFlowLogs(params, function(err, data) {
          if (err) {
            responseData = {Error: "Could not create flow log"};
            console.log(responseData.Error + ":\n", err);
          }
          else     {  
            responseData["Id"] = data.FlowLogIds[0];
            sendResponse(event, context, "SUCCESS", responseData);
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