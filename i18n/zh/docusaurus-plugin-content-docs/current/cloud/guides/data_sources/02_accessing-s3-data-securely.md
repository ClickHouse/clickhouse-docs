---
slug: /cloud/data-sources/secure-s3
sidebar_label: '安全访问 S3 数据'
title: '安全访问 S3 数据'
description: '本文演示 ClickHouse Cloud 客户如何使用基于角色的访问控制与 Amazon Simple Storage Service (S3) 进行身份验证，并安全地访问其数据。'
keywords: ['RBAC', 'Amazon S3', 'authentication']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.png';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

本文演示如何利用基于角色的访问控制与 Amazon Simple Storage Service (S3) 完成身份验证，并从 ClickHouse Cloud 安全地访问您的数据。


## 介绍 {#introduction}

在开始配置安全 S3 访问之前，了解其工作原理非常重要。下面概述了 ClickHouse 服务如何通过在您的 AWS 账户中扮演一个角色来访问私有 S3 存储桶。

<Image img={secure_s3} size="lg" alt="Overview of Secure S3 Access with ClickHouse"/>

这种方式使您可以在同一处（被扮演角色的 IAM 策略）集中管理对您的 S3 存储桶的所有访问，而无需逐一修改各个存储桶策略来增加或移除访问权限。

## 安装与配置 {#setup}

### 获取 ClickHouse 服务 IAM 角色 ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到你的 ClickHouse Cloud 账户。

2 - 选择你要从中进行连接的 ClickHouse 服务。

3 - 选择 **Settings** 选项卡。

4 - 向下滚动到页面底部的 **Network security information** 部分。

5 - 复制该服务对应的 **Service role ID (IAM)** 值，如下所示。

<Image img={s3_info} size="lg" alt="获取 ClickHouse 服务 IAM 角色 ARN" border />

### 配置 IAM 角色切换（Assume Role）{#setting-up-iam-assume-role}

#### 选项 1：使用 CloudFormation 堆栈部署 {#option-1-deploying-with-cloudformation-stack}

1 - 在浏览器中使用具备足够权限以创建和管理 IAM 角色的 IAM 用户登录到您的 AWS 账户。

2 - 访问[此 URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)，以预填 CloudFormation 堆栈。

3 - 输入您在[上一步](#obtaining-the-clickhouse-service-iam-role-arn)中记录的 ClickHouse 服务 **IAM Role**。

4 - 配置 CloudFormation 堆栈。以下是这些参数的补充说明。

| Parameter                 | Default Value        | Description                                                                                        |
| :---                      |    :----:            | :----                                                                                              |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud 用来访问您的 S3 bucket 的新角色名称。                   |
| Role Session Name         |      *               | Role Session Name 可用作共享密钥，以进一步保护您的 bucket。                   |
| ClickHouse Instance Roles |                      | 允许使用此安全 S3 集成的 ClickHouse 服务 IAM 角色的逗号分隔列表。      |
| Bucket Access             |    Read              | 为指定的 bucket 设置访问权限级别。                                                 |
| Bucket Names              |                      | 此角色可访问的 bucket 名称的逗号分隔列表。**注意：**使用 bucket 名称，而不是完整的 bucket ARN。                       |

5 - 勾选 **I acknowledge that AWS CloudFormation might create IAM resources with custom names** 复选框。

6 - 点击右下角的 **Create stack** 按钮。

7 - 确认 CloudFormation 堆栈创建完成且没有错误。

8 - 在 CloudFormation 堆栈中选择 **Outputs**。

9 - 复制此集成的 **RoleArn** 值。在[下一步（使用 ClickHouseAccess 角色访问您的 S3 bucket）](#access-your-s3-bucket-with-the-clickhouseaccess-role)时需要用到该值。

<Image img={s3_output} size="lg" alt="显示 IAM Role ARN 的 CloudFormation stack 输出" border />

#### 选项 2：手动创建 IAM 角色 {#option-2-manually-create-iam-role}

1 - 在浏览器中登录到您的 AWS 账户，使用具有创建和管理 IAM 角色权限的 IAM 用户。

2 - 打开 IAM 服务控制台。

3 - 使用以下信任策略和 IAM 策略创建一个新的 IAM 角色，并将 `{ClickHouse_IAM_ARN}` 替换为属于您 ClickHouse 实例的 IAM 角色 ARN，将 `{BUCKET_NAME}` 替换为存储桶名称。

**信任策略**

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

**IAM 策略**

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

4 - 在创建完成后复制新的 **IAM Role Arn**。在[下一步](#access-your-s3-bucket-with-the-clickhouseaccess-role)中配置访问 S3 bucket 时会用到它。


## 使用 ClickHouseAccess 角色访问你的 S3 bucket {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud 新增了一个功能，允许你在 S3 表函数中指定 `extra_credentials`。下面是一个示例，展示如何使用上面新创建的角色来运行查询。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

下面是一个示例查询，使用 `role_session_name` 作为共享密钥从存储桶中查询数据。如果 `role_session_name` 不正确，此操作将会失败。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
我们建议将您的 S3 bucket 与 ClickHouse Cloud 服务部署在同一地域，以降低数据传输费用。有关更多信息，请参阅 [S3 定价](https://aws.amazon.com/s3/pricing/)。
:::


## 高级操作控制 {#advanced-action-control}

为了实现更严格的访问控制，可以使用 [`aws:SourceVpce` 条件](https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies-vpc-endpoint.html#example-bucket-policies-restrict-accesss-vpc-endpoint)，将存储桶策略限制为仅接受来源于 ClickHouse Cloud 的 VPC 端点的请求。要获取 ClickHouse Cloud 所在区域的 VPC 端点，请打开终端并运行：

```bash
# Replace <your-region> with your ClickHouse Cloud region
curl -s https://api.clickhouse.cloud/static-ips.json | jq -r '.aws[] | select(.region == "<your-region>") | .s3_endpoints[]'
```

然后，在 IAM 策略中添加一条使用前面获取到的端点的拒绝规则：

```json
{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "VisualEditor0",
                "Effect": "Allow",
                "Action": [
                    "s3:List*",
                    "s3:Get*"
                ],
                "Resource": [
                    "arn:aws:s3:::{BUCKET_NAME}",
                    "arn:aws:s3:::{BUCKET_NAME}/*"
                ]
            },
            {
                "Sid": "VisualEditor3",
                "Effect": "Deny",
                "Action": [
                    "s3:GetObject"
                ],
                "Resource": "*",
                "Condition": {
                    "StringNotEquals": {
                        "aws:SourceVpce": [
                            "{ClickHouse VPC ID from your S3 region}",
                            "{ClickHouse VPC ID from your S3 region}",
                            "{ClickHouse VPC ID from your S3 region}"
                        ]
                    }
                }
            }
        ]
}
```

有关访问 ClickHouse Cloud 服务端点的更多详细信息，请参阅 [Cloud IP Addresses](/manage/data-sources/cloud-endpoints-api)。
