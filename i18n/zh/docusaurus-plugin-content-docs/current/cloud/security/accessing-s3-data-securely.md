---
'slug': '/cloud/security/secure-s3'
'sidebar_label': '安全访问 S3 数据'
'title': '安全访问 S3 数据'
'description': '本文演示了 ClickHouse Cloud 客户如何利用基于角色的访问来与 Amazon Simple Storage Service
  (S3) 进行身份验证，并安全地访问他们的数据。'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

This article demonstrates how ClickHouse Cloud customers can leverage role-based access to authenticate with Amazon Simple Storage Service(S3) and access their data securely.

## Introduction {#introduction}

在深入了解安全 S3 访问设置之前，了解其工作原理是非常重要的。以下是 ClickHouse 服务如何通过在客户的 AWS 账户中假设角色来访问私有 S3 桶的概述。

<Image img={secure_s3} size="md" alt="Overview of Secure S3 Access with ClickHouse"/>

这种方法允许客户在一个地方（假设角色的 IAM 策略）管理对其 S3 桶的所有访问，而无需遍历其所有桶策略来添加或删除访问权限。

## Setup {#setup}

### Obtaining the ClickHouse service IAM role Arn {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到您的 ClickHouse 云账户。

2 - 选择您要创建集成的 ClickHouse 服务。

3 - 选择 **设置** 选项卡。

4 - 向下滚动到页面底部的 **网络安全信息** 部分。

5 - 复制该服务的 **服务角色 ID (IAM)** 值，如下所示。

<Image img={s3_info} size="lg" alt="Obtaining ClickHouse service IAM Role ARN" border />

### Setting up IAM assume role {#setting-up-iam-assume-role}

#### Option 1: Deploying with CloudFormation stack {#option-1-deploying-with-cloudformation-stack}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户登录到您的 AWS 账户。

2 - 访问 [this url](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) 来填充 CloudFormation 堆栈。

3 - 输入（或粘贴）属于 ClickHouse 服务的 **IAM 角色**。

4 - 配置 CloudFormation 堆栈。以下是关于这些参数的额外信息。

| 参数                       | 默认值                     | 描述                                                                                         |
| :---                      |    :----:                 | :----                                                                                         |
| RoleName                  | ClickHouseAccess-001      | ClickHouse Cloud 将用于访问您的 S3 桶的新角色的名称                                            |
| Role Session Name         |      *                    | 角色会话名称可以用作共享密钥以进一步保护您的桶。                                              |
| ClickHouse Instance Roles |                           | 可使用此安全 S3 集成的 ClickHouse 服务 IAM 角色的逗号分隔列表。                                 |
| Bucket Access             |    Read                   | 设置提供桶的访问级别。                                                                         |
| Bucket Names              |                           | 此角色将有权访问的 **桶名称** 的逗号分隔列表。                                                 |

*注意*: 请勿填写完整的桶 Arn，而只需填写桶名称。

5 - 选择 **我承认 AWS CloudFormation 可能会创建带有自定义名称的 IAM 资源。** 复选框。

6 - 点击右下角的 **创建堆栈** 按钮。

7 - 确保 CloudFormation 堆栈完成且没有错误。

8 - 选择 CloudFormation 堆栈的 **输出**。

9 - 复制该集成的 **RoleArn** 值。这是访问您的 S3 桶所需的。

<Image img={s3_output} size="lg" alt="CloudFormation stack output showing IAM Role ARN" border />

#### Option 2: Manually create IAM role. {#option-2-manually-create-iam-role}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户登录到您的 AWS 账户。

2 - 浏览到 IAM 服务控制台。

3 - 创建一个新的 IAM 角色，使用以下 IAM 和信任策略。

信任策略（请将 `{ClickHouse_IAM_ARN}` 替换为属于您的 ClickHouse 实例的 IAM 角色 Arn）：

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

IAM 策略（请将 `{BUCKET_NAME}` 替换为您的桶名称）：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:GetBucketLocation",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::{BUCKET_NAME}"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:Get*",
                "s3:List*"
            ],
            "Resource": [
                "arn:aws:s3:::{BUCKET_NAME}/*"
            ],
            "Effect": "Allow"
        }
    ]
}
```

4 - 创建后复制新的 **IAM 角色 Arn**。这是访问您的 S3 桶所需的。

## Access your S3 bucket with the ClickHouseAccess Role {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud 具有一个新功能，允许您在 S3 表函数中指定 `extra_credentials`。以下是如何使用从上面复制的新角色运行查询的示例。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

下面是一个示例查询，它使用 `role_session_name` 作为共享密钥从桶中查询数据。如果 `role_session_name` 不正确，此操作将失败。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
我们建议您的源 S3 位于与您 ClickHouse 云服务相同的区域，以减少数据传输成本。有关更多信息，请参考 [S3 pricing]( https://aws.amazon.com/s3/pricing/)
:::
