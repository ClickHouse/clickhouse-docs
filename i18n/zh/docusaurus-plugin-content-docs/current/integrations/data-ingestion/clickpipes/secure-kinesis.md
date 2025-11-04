---
'slug': '/integrations/clickpipes/secure-kinesis'
'sidebar_label': 'Kinesis 基于角色的访问'
'title': 'Kinesis 基于角色的访问'
'description': '本文演示了ClickPipes客户如何利用基于角色的访问来进行身份验证，以安全访问Amazon Kinesis及其数据流。'
'doc_type': 'guide'
'keywords':
- 'Amazon Kinesis'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

这篇文章演示了 ClickPipes 客户如何利用基于角色的访问来通过 Amazon Kinesis 进行身份验证，并安全地访问他们的数据流。

## 前提条件 {#prerequisite}

要遵循本指南，您需要：
- 一项有效的 ClickHouse Cloud 服务
- 一个 AWS 账户

## 介绍 {#introduction}

在深入了解安全 Kinesis 访问的设置之前，理解机制非常重要。以下是 ClickPipes 如何通过假设客户 AWS 账户中的角色来访问 Amazon Kinesis 流的概述。

<Image img={secure_kinesis} alt="安全 Kinesis" size="lg" border/>

使用这种方法，客户可以在一个地方（假设角色的 IAM 策略）管理对其 Kinesis 数据流的所有访问，而无需单独修改每个流的访问策略。

## 设置 {#setup}

<VerticalStepper headerLevel="h3"/>

### 获取 ClickHouse 服务的 IAM 角色 Arn {#obtaining-the-clickhouse-service-iam-role-arn}

- 1. 登录到您的 ClickHouse 云账户。
- 2. 选择您要创建集成的 ClickHouse 服务。
- 3. 选择 **设置** 标签。
- 4. 向下滚动到页面底部的 **网络安全信息** 部分。
- 5. 复制服务的 **服务角色 ID (IAM)** 值，如下所示。

<Image img={secures3_arn} alt="安全 S3 ARN" size="lg" border/>

### 设置 IAM 假设角色 {#setting-up-iam-assume-role}

#### 手动创建 IAM 角色 {#manually-create-iam-role}

- 1. 使用具有创建和管理 IAM 角色权限的 IAM 用户在网页浏览器中登录到您的 AWS 账户。
- 2. 浏览到 IAM 服务控制台。
- 3. 创建一个新的 IAM 角色，可信实体类型为 `AWS account`。注意，该 IAM 角色的名称 **必须以** `ClickHouseAccessRole-` 开头，以使其正常工作。

对于信任策略，请将 `{ClickHouse_IAM_ARN}` 替换为属于您的 ClickHouse 实例的 IAM 角色 Arn。
对于 IAM 策略，请将 `{STREAM_NAME}` 替换为您的 Kinesis 流名称。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": "sts:AssumeRole"
    },
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
        "arn:aws:kinesis:region:account-id:stream/{STREAM_NAME}/*"
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

</VerticalStepper>

```

- 4. 创建后复制新生成的 **IAM 角色 Arn**。这是访问您的 Kinesis 流所需的内容。
