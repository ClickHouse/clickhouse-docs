---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: 'Kinesis 基于角色的访问控制'
title: 'Kinesis 基于角色的访问控制'
description: '本文演示 ClickPipes 客户如何利用基于角色的访问控制，与 Amazon Kinesis 进行身份验证并安全访问其数据流。'
doc_type: 'guide'
keywords: ['Amazon Kinesis']
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

本文演示 ClickPipes 客户如何利用基于角色的访问机制与 Amazon Kinesis 进行身份验证，并安全地访问其数据流。


## 前提条件 {#prerequisite}

要按照本指南操作,您需要:

- 一个正在运行的 ClickHouse Cloud 服务
- 一个 AWS 账户


## 简介 {#introduction}

在深入了解安全 Kinesis 访问的配置之前,了解其工作机制非常重要。以下概述了 ClickPipes 如何通过代入客户 AWS 账户中的角色来访问 Amazon Kinesis 数据流。

<Image img={secure_kinesis} alt='Secure Kinesis' size='lg' border />

采用这种方式,客户可以在单一位置(代入角色的 IAM 策略)集中管理对其 Kinesis 数据流的所有访问权限,而无需逐个修改每个数据流的访问策略。


## 设置 {#setup}

<VerticalStepper headerLevel='h3' />

### 获取 ClickHouse 服务 IAM 角色 ARN {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. 登录您的 ClickHouse Cloud 账户。
- 2. 选择您要创建集成的 ClickHouse 服务。
- 3. 选择 **Settings** 选项卡。
- 4. 向下滚动到页面底部的 **Network security information** 部分。
- 5. 复制该服务的 **Service role ID (IAM)** 值,如下所示。

<Image img={secures3_arn} alt='安全 S3 ARN' size='lg' border />

### 设置 IAM 代入角色 {#setting-up-iam-assume-role}

#### 手动创建 IAM 角色 {#manually-create-iam-role}

- 1. 使用具有创建和管理 IAM 角色权限的 IAM 用户在 Web 浏览器中登录您的 AWS 账户。
- 2. 进入 IAM 服务控制台。
- 3. 创建一个新的 IAM 角色,受信任实体类型为 `AWS account`。请注意,IAM 角色的名称**必须以** `ClickHouseAccessRole-` 开头才能正常工作。

  **i. 配置信任策略**

  信任策略允许 ClickHouse IAM 角色代入此角色。将 `{ClickHouse_IAM_ARN}` 替换为您的 ClickHouse 服务的 IAM 角色 ARN(在上一步中获取)。

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

  **ii. 配置权限策略**

  权限策略授予对您的 Kinesis 流的访问权限。替换以下占位符:
  - `{REGION}`:您的 AWS 区域(例如 `us-east-1`)
  - `{ACCOUNT_ID}`:您的 AWS 账户 ID
  - `{STREAM_NAME}`:您的 Kinesis 流名称

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
        "Action": ["kinesis:ListStreams"],
        "Resource": "*"
      }
    ]
  }
  ```

- 4. 创建后复制新的 **IAM Role Arn**。这是访问您的 Kinesis 流所需的凭证。
