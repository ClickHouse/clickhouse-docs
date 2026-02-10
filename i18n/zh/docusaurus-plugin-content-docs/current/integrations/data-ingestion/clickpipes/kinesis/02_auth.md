---
slug: /integrations/clickpipes/kinesis/auth
sidebar_label: 'Kinesis 基于角色的访问'
title: 'Kinesis 基于角色的访问'
description: '本文演示 ClickPipes 客户如何利用基于角色的访问与 Amazon Kinesis 进行身份验证，并安全访问其数据流。'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

本文演示 ClickPipes 客户如何利用基于角色的访问权限与 Amazon Kinesis 完成身份验证，并安全访问其数据流。


## 前提条件 \{#prerequisite\}

要按照本指南进行操作，您需要：

- 一个有效的 ClickHouse Cloud 服务
- 一个 AWS 账户

## 简介 \{#introduction\}

在开始配置安全访问 Kinesis 之前，首先需要理解其工作机制。下面概述了 ClickPipes 如何通过在客户的 AWS 账户中假设一个角色来访问 Amazon Kinesis 流。

<Image img={secure_kinesis} alt="安全访问 Kinesis" size="lg" border/>

通过这种方式，客户可以在一个统一的位置（所假设角色的 IAM 策略）集中管理对其 Kinesis 数据流的所有访问，而无需逐一修改每个流的访问策略。

## 设置 \{#setup\}

<VerticalStepper headerLevel="h3"/>

### 获取 ClickHouse 服务 IAM 角色 ARN \{#obtaining-the-clickhouse-service-iam-role-arn\}

- 1. 登录 ClickHouse Cloud 账户。
- 2. 选择要创建集成的 ClickHouse 服务。
- 3. 选择 **Settings** 选项卡。
- 4. 向下滚动到页面底部的 **Network security information** 部分。
- 5. 复制该服务对应的 **Service role ID (IAM)** 值，如下所示。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

### 配置 IAM Assume Role \{#setting-up-iam-assume-role\}

#### 手动创建 IAM 角色。 \{#manually-create-iam-role\}

- 1. 使用具有创建和管理 IAM 角色权限的 IAM 用户，在浏览器中登录到你的 AWS 账户。
- 2. 打开 IAM 服务控制台。
- 3. 创建一个新的 IAM 角色，将受信任实体类型（Trusted Entity Type）设置为 `AWS account`。注意，为了使其生效，该 IAM 角色的名称**必须以** `ClickHouseAccessRole-` 开头。

   **i. 配置信任策略（Trust Policy）**

   信任策略允许 ClickHouse 的 IAM 角色来 assume 此角色。将 `{ClickHouse_IAM_ARN}` 替换为来自 ClickHouse 服务的 IAM 角色 ARN（在上一步中获取）。

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

   **ii. 配置权限策略（Permission Policy）**

   权限策略授予对你的 Kinesis 流的访问权限。请替换以下占位符：
  - `{REGION}`：你的 AWS 区域（例如 `us-east-1`）
  - `{ACCOUNT_ID}`：你的 AWS 账户 ID
  - `{STREAM_NAME}`：你的 Kinesis 流名称

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

- 4. 创建完成后复制新的 **IAM 角色 ARN**。这是访问你的 Kinesis 流所需要的值。