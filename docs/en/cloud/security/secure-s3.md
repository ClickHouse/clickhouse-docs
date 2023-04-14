---
slug: /en/cloud/manage/security/secure-s3
sidebar_label: S3 Role-based Access
title: S3 Role-based Access
hide_table_of_contents: true
---

This article demonstrates how ClickHouse Cloud customers can leverage role-based access to authenticate with Amazon Simple Storage Service(S3) and access their data securely.

## Reach out to ClickHouse Support

This feature is only available for select customers and is enabled by our cloud support engineers.

Role-based S3 access is currently available through a ClickHouse Support request. Click on **Help** in the ClickHouse Cloud console and choose **Support** to open a case. Please specify the name of the service you would like this role-based access to be used for. 

Upon receiving the case, our support engineer will provide you with the following:
 - The Cloudformation template that can be used to create a ClickHouseAccess IAM role in your account 
 - The ARN of the IAM role associated with the service you specified in the request.

## Setup 

For this next step, you will need an AWS administrator to help set up the ClickHouseAccess IAM role via the Cloudformation template.

 - Login to your AWS Account
 - Go to Cloudformation, click on **Create Stack**
 - Select **Upload a template file**, upload the provided template file, and click **Next****
 - Enter the following information 

| Parameter                 | Default Value | Description                                                                                        |
| :---                      |    :----:     | ----:                                                                                              |
| Role Unique ID            |     001       | Unique ID that is appended to the ClickHouseAccessRole name.                                       |
| Role Session Name         |      *        | Role Session Name can be used as a shared secret to further protect your bucket.                   |
| ClickHouse Instance Roles |               | Comma separated list of ClickHouse instance roles that can assume the new ClickHouse service role. |
| Bucket Access             |    Read       | Sets the level of access for the provided buckets.                                                 |
| Bucket Names              |               | Comma separated list of bucket names that this role will have access to.                           |

- Click **Next**
- Review Stack options then click **Next**
- Review the stack details one last time, scroll to the bottom and tick *I acknowledge that AWS CloudFormation might create IAM resources with custom names.* 
- Hit **Submit** to start creating the IAM role.
- Make sure the Cloudformation stack completes with no error and double-check that the new IAM role is created.


## Use the ClickHouseAccess Role to access a bucket inside your AWS account

ClickHouse Cloud has a new feature that allows you to specify `extra_credentials` as part of the S3 table function. Below is an example of how to run a query using the newly created role.

```
describe table s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```


Below is an example query that uses the `role_session_name` as a shared secret to query data from a bucket. If the `role_session_name` is not correct, this operation will fail.

```
describe table s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

**Note:**: We recommend that your source S3 is in the same region as your ClickHouse Cloud Service to reduce on data transfer costs. For more information, refer to S3 pricing: https://aws.amazon.com/s3/pricing/
