---
slug: /en/integrations/clickpipes/secure-kinesis
sidebar_label: Kinesis Role-Based Access
title: Kinesis Role-Based Access
---

This article demonstrates how ClickPipes customers can leverage role-based access to authenticate with Amazon Kinesis and access their data streams securely.

## Introduction

Before diving into the setup for secure Kinesis access, it's important to understand the mechanism. Here's an overview of how ClickPipes can access Amazon Kinesis streams by assuming a role within customers' AWS accounts.

![securekinesis](@site/docs/en/integrations/data-ingestion/clickpipes/images/securekinesis.jpg)

Using this approach, customers can manage all access to their Kinesis data streams in a single place (the IAM policy of the assumed-role) without having to modify each stream's access policy individually.

## Setup

### Obtaining the ClickHouse service IAM role Arn

1 - Login to your ClickHouse cloud account.

2 - Select the ClickHouse service you want to create the integration

3 - Select the **Settings** tab

4 - Scroll down to the **About this service** section at the bottom of the page

5 - Copy the **IAM Role** value belong to the service as shown below.

![s3info](@site/docs/en/cloud/security/images/secures3_arn.jpg)

### Setting up IAM assume role

#### Manually create IAM role.

1 - Login to your AWS Account in the web browser with an IAM user that has permission to create & manage IAM role.

2 - Browse to IAM Service Console

3 - Create a new IAM role with the following IAM & Trust policy. Note that the name of the IAM role **must start with** `ClickHouseAccessRole-` for this to work.

Trust policy (Please replace `{ClickHouse_IAM_ARN}` with the IAM Role arn belong to your ClickHouse instance):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

IAM policy (Please replace `{STREAM_NAME}` with your kinesis stream name):

```
{
    "Version": "2012-10-17",
        "Statement": [
        {
            "Action": [
                "kinesis:DescribeStream",
                "kinesis:GetShardIterator",
                "kinesis:GetRecords",
                "kinesis:ListShards",
                "kinesis:SubscribeToShard",
                "kinesis:DescribeStreamConsumer",
                "kinesis:RegisterStreamConsumer",
                "kinesis:DeregisterStreamConsumer",
                "kinesis:ListStreamConsumers"
            ],
            "Resource": [
                "arn:aws:kinesis:region:account-id:stream/{STREAM_NAME}"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "kinesis:ListStreams"
            ],
            "Resource": "*",
            "Effect": "Allow"
        }
    ]

}
```

4 - Copy the new **IAM Role Arn** after creation. This is what needed to access your Kinesis stream.
