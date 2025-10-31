---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: 'Kinesis Role-Based Access'
title: 'Kinesis Role-Based Access'
description: 'This article demonstrates how ClickPipes customers can leverage role-based access to authenticate with Amazon Kinesis and access their data streams securely.'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

This article demonstrates how ClickPipes customers can leverage role-based access to authenticate with Amazon Kinesis and access their data streams securely.

## Prerequisites {#prerequisite}

To follow this guide, you will need:
- An active ClickHouse Cloud service
- An AWS account

## Introduction {#introduction}

Before diving into the setup for secure Kinesis access, it's important to understand the mechanism. Here's an overview of how ClickPipes can access Amazon Kinesis streams by assuming a role within customers' AWS accounts.

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

Using this approach, customers can manage all access to their Kinesis data streams in a single place (the IAM policy of the assumed-role) without having to modify each stream's access policy individually.

## Setup {#setup}

<VerticalStepper headerLevel="h3"/>

### Obtaining the ClickHouse service IAM role Arn {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. Login to your ClickHouse cloud account.
- 2. Select the ClickHouse service you want to create the integration
- 3. Select the **Settings** tab
- 4. Scroll down to the **Network security information** section at the bottom of the page
- 5. Copy the **Service role ID (IAM)** value belong to the service as shown below.

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### Setting up IAM assume role {#setting-up-iam-assume-role}

#### Manually create IAM role. {#manually-create-iam-role}

- 1. Login to your AWS Account in the web browser with an IAM user that has permission to create & manage IAM role.
- 2. Browse to IAM Service Console
- 3. Create a new IAM role with Trusted Entity Type of `AWS account`. Note that the name of the IAM role **must start with** `ClickHouseAccessRole-` for this to work.

   **i. Configure the Trust Policy**

   The trust policy allows the ClickHouse IAM role to assume this role. Replace `{ClickHouse_IAM_ARN}` with the IAM Role ARN from your ClickHouse service (obtained in the previous step).

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

   **ii. Configure the Permission Policy**

   The permission policy grants access to your Kinesis stream. Replace the following placeholders:
  - `{REGION}`: Your AWS region (e.g., `us-east-1`)
  - `{ACCOUNT_ID}`: Your AWS account ID
  - `{STREAM_NAME}`: Your Kinesis stream name

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "kinesis:DescribeStream",
           "kinesis:GetShardIterator",
           "kinesis:GetRecords",
           "kinesis:ListShards",
           "kinesis:RegisterStreamConsumer",
           "kinesis:DeregisterStreamConsumer",
           "kinesis:ListStreamConsumers"
         ],
         "Resource": [
           "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "kinesis:SubscribeToShard",
           "kinesis:DescribeStreamConsumer"
         ],
         "Resource": [
           "arn:aws:kinesis:{REGION}:{ACCOUNT_ID}:stream/{STREAM_NAME}/*"
         ]
       },
       {
         "Effect": "Allow",
         "Action": [
           "kinesis:ListStreams"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

- 4. Copy the new **IAM Role Arn** after creation. This is what is needed to access your Kinesis stream.
