---
'slug': '/integrations/clickpipes/secure-kinesis'
'sidebar_label': 'Kinesis Role-Based Access'
'title': 'Kinesis Role-Based Access'
'description': '本文演示了ClickPipes客户如何利用基于角色的访问权限来使用Amazon Kinesis进行身份验证，安全访问其数据流。'
---

import secure_kinesis from '@site/static/images/integrations/data-ingestion/clickpipes/securekinesis.jpg';
import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

这篇文章演示了 ClickPipes 客户如何利用基于角色的访问来安全地与 Amazon Kinesis 进行身份验证并访问他们的数据流。

## 介绍 {#introduction}

在深入设置安全 Kinesis 访问之前，了解机制是很重要的。以下是 ClickPipes 如何通过假设客户的 AWS 账户中的角色来访问 Amazon Kinesis 数据流的概述。

<Image img={secure_kinesis} alt="安全 Kinesis" size="lg" border/>

通过这种方式，客户可以在一个地方（假设角色的 IAM 策略）管理对 Kinesis 数据流的所有访问，而无需单独修改每个流的访问策略。

## 设置 {#setup}

### 获取 ClickHouse 服务的 IAM 角色 Arn {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到您的 ClickHouse 云账户。

2 - 选择您希望创建集成的 ClickHouse 服务。

3 - 选择 **设置** 选项卡。

4 - 向下滚动到页面底部的 **网络安全信息** 部分。

5 - 复制服务对应的 **服务角色 ID (IAM)** 值，如下所示。

<Image img={secures3_arn} alt="安全 S3 ARN" size="lg" border/>

### 设置 IAM 假设角色 {#setting-up-iam-assume-role}

#### 手动创建 IAM 角色。 {#manually-create-iam-role}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户，在网页浏览器中登录到您的 AWS 账户。

2 - 浏览到 IAM 服务控制台。

3 - 创建一个新的 IAM 角色，使用以下的 IAM 和信任策略。请注意，IAM 角色的名称 **必须以** `ClickHouseAccessRole-` 开头，否则将无法正常工作。

信任策略（请将 `{ClickHouse_IAM_ARN}` 替换为属于您 ClickHouse 实例的 IAM 角色 Arn）：

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

IAM 策略（请将 `{STREAM_NAME}` 替换为您的 Kinesis 流名称）：

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

4 - 创建后复制新的 **IAM 角色 Arn**。这是访问您的 Kinesis 流所需的内容。
