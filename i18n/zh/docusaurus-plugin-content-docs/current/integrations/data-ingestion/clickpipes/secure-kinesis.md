---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: 'Kinesis 基于角色的访问'
title: 'Kinesis 基于角色的访问'
description: '本文演示 ClickPipes 客户如何利用基于角色的访问与 Amazon Kinesis 进行身份验证，并安全地访问其数据流。'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

本文演示 ClickPipes 客户如何利用基于角色的访问机制，与 Amazon Kinesis 进行身份验证，并安全访问其数据流。

## 前提条件 \{#prerequisite\}

要按照本指南操作，你需要：

- 一个已开通的 ClickHouse Cloud 服务
- 一个 AWS 账户

## 简介 \{#introduction\}

在深入配置安全访问 Kinesis 之前，先理解其工作机制非常重要。下面概述了 ClickPipes 如何通过在客户的 AWS 账户中假设一个角色来访问 Amazon Kinesis 流。

<Image img={secure_kinesis} alt="Secure Kinesis" size="lg" border/>

通过这种方式，客户可以在单一位置（被假设角色的 IAM 策略）统一管理对其 Kinesis 数据流的所有访问，而无需单独修改每个流的访问策略。

## 设置 \{#setup\}

<VerticalStepper headerLevel="h3"/>

### 获取 ClickHouse 服务 IAM 角色 Arn \{#obtaining-the-clickhouse-service-iam-role-arn\}

- 1. 登录到您的 ClickHouse Cloud 账户。
- 2. 选择要为其创建集成的 ClickHouse 服务。
- 3. 选择 **Settings** 选项卡。
- 4. 向下滚动到页面底部的 **Network security information** 部分。
- 5. 复制该服务对应的 **Service role ID (IAM)** 值，如下所示。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### 设置 IAM Assume Role \{#setting-up-iam-assume-role\}

#### 手动创建 IAM 角色。\{#manually-create-iam-role\}

- 1. 使用具有创建和管理 IAM 角色权限的 IAM 用户，通过浏览器登录到您的 AWS 账户。
- 2. 打开 IAM 服务控制台。
- 3. 创建一个新的 IAM 角色，Trusted Entity Type 选择 `AWS account`。注意，为使其生效，IAM 角色名称**必须以** `ClickHouseAccessRole-` 开头。

   **i. 配置 Trust Policy**

   Trust Policy 允许 ClickHouse IAM 角色来 assume 此角色。将 `{ClickHouse_IAM_ARN}` 替换为您的 ClickHouse 服务的 IAM Role ARN（在上一步中获取）。

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

   **ii. 配置 Permission Policy**

   Permission Policy 授予对您的 Kinesis 流的访问权限。替换以下占位符：
  - `{REGION}`：您的 AWS 区域（例如，`us-east-1`）
  - `{ACCOUNT_ID}`：您的 AWS 账户 ID
  - `{STREAM_NAME}`：您的 Kinesis 流名称

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

- 4. 创建完成后，复制新的 **IAM Role ARN**。这是访问您的 Kinesis 流所需的角色 ARN。