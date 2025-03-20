---
slug: /integrations/clickpipes/secure-kinesis
sidebar_label: Kinesis 基于角色的访问
title: Kinesis 基于角色的访问
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';

本文演示了 ClickPipes 客户如何利用基于角色的访问来与 Amazon Kinesis 进行身份验证，并安全访问他们的数据流。

## 介绍 {#introduction}

在深入了解安全 Kinesis 访问的设置之前，了解机制是很重要的。以下是 ClickPipes 如何通过假设客户的 AWS 账户中的角色来访问 Amazon Kinesis 数据流的概述。

<img src={secure_kinesis} alt="安全 Kinesis" />

通过这种方式，客户可以在一个地方（假设角色的 IAM 策略）管理对其 Kinesis 数据流的所有访问，无需单独修改每个数据流的访问策略。

## 设置 {#setup}

### 获取 ClickHouse 服务 IAM role Arn {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到您的 ClickHouse 云账户。

2 - 选择您想要创建集成的 ClickHouse 服务。

3 - 选择 **设置** 选项卡。

4 - 滚动到页面底部的 **网络安全信息** 部分。

5 - 复制如下所示的属于该服务的 **服务角色 ID (IAM)** 值。

<img src={secures3_arn} alt="安全 S3 ARN" />

### 设置 IAM 假设角色 {#setting-up-iam-assume-role}

#### 手动创建 IAM 角色。 {#manually-create-iam-role}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户登录到您的 AWS 账户。

2 - 浏览到 IAM 服务控制台。

3 - 创建一个新的 IAM 角色，并使用以下 IAM 和信任策略。请注意，IAM 角色的名称 **必须以** `ClickHouseAccessRole-` 开头才能正常工作。

信任策略（请将 `{ClickHouse_IAM_ARN}` 替换为属于您的 ClickHouse 实例的 IAM 角色 ARN）：

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

IAM 策略（请将 `{STREAM_NAME}` 替换为您的 Kinesis 数据流名称）：

```json
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

4 - 创建后复制新的 **IAM 角色 ARN**。这是访问您的 Kinesis 数据流所需的内容。
