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
import s3_output from '@site/static/images/cloud/security/secures3_output.png';

本指南演示 ClickHouse Cloud 客户如何利用基于角色的访问控制，与 Amazon Simple Storage Service (S3) 进行身份验证并安全访问其数据。
在深入了解安全 S3 访问的配置之前，了解其工作原理非常重要。下面是一个概览，说明 ClickHouse 服务如何通过在客户的 AWS 账户中承担某个角色来访问私有 S3 存储桶。

<Image img={secure_s3} size="lg" alt="ClickHouse 安全访问 S3 的概览" />

<br />

<Image img={secure_s3} size="md" alt="ClickHouse 安全访问 S3 的概览" />

<br />

这种方式允许客户在单一位置（所承担角色的 IAM 策略）管理对其 S3 存储桶的全部访问权限，而无需逐一修改所有存储桶策略来添加或移除访问权限。
在下面的章节中，您将学习如何完成这一配置。


## 获取 ClickHouse 服务 IAM 角色 ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1. 登录到你的 ClickHouse cloud 账户。

2. 选择你要为其创建集成的 ClickHouse 服务。

3. 选择 **Settings** 选项卡。

4. 向下滚动到页面底部的 **Network security information** 部分。

5. 复制该服务对应的 **Service role ID (IAM)** 值，如下所示。

<Image img={s3_info} size="lg" alt="获取 ClickHouse 服务 IAM 角色 ARN" border />

## 设置用于 AssumeRole 的 IAM 角色 {#setting-up-iam-assume-role}

可以通过以下两种方式之一来设置该 IAM 角色：

- [使用 CloudFormation 堆栈](#option-1-deploying-with-cloudformation-stack)
- [手动创建 IAM 角色](#option-2-manually-create-iam-role)

### 使用 CloudFormation 堆栈部署 {#option-1-deploying-with-cloudformation-stack}

1. 在浏览器中使用具备创建和管理 IAM 角色权限的 IAM 用户登录到您的 AWS 账户。

2. 访问以下 [CloudFormation URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3)，以预填 CloudFormation 堆栈。

3. 将之前为您的服务获取到的 **service role ID (IAM)** 输入（或粘贴）到名为 "ClickHouse Instance Roles" 的输入框中。  
   您可以按其在 Cloud 控制台中显示的方式原样粘贴该 service role ID。

4. 在名为 "Bucket Names" 的输入框中输入您的 bucket 名称。如果您的 bucket URL 是 `https://ch-docs-s3-bucket.s3.eu-central-1.amazonaws.com/clickhouseS3/`，那么 bucket 名称就是 `ch-docs-s3-bucket`。

:::note
不要填写完整的 bucket ARN，而只填写 bucket 名称。
:::

5. 配置 CloudFormation 堆栈。以下是这些参数的补充说明。

| Parameter                 | Default Value        | Description                                                                                        |
| :---                      |    :----:            | :----                                                                                              |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud 用来访问您的 S3 bucket 的新角色名称。                   |
| Role Session Name         |      *               | Role Session Name 可用作共享密钥，以进一步保护您的 bucket。                   |
| ClickHouse Instance Roles |                      | 允许使用此安全 S3 集成的 ClickHouse 服务 IAM 角色的逗号分隔列表。      |
| Bucket Access             |    Read              | 为指定的 bucket 设置访问权限级别。                                                 |
| Bucket Names              |                      | 此角色可访问的 bucket 名称的逗号分隔列表。**注意：**使用 bucket 名称，而不是完整的 bucket ARN。                       |

6. 选中 **I acknowledge that AWS CloudFormation might create IAM resources with custom names.** 复选框。

7. 点击右下角的 **Create stack** 按钮。

8. 确认 CloudFormation 堆栈创建完成且没有错误。

9. 选择新创建的 Stack，然后在 CloudFormation 堆栈中选择 **Outputs** 选项卡。

10. 复制此集成的 **RoleArn** 值，这是访问您的 S3 bucket 所需的值。

<Image img={s3_output} size="lg" alt="显示 IAM Role ARN 的 CloudFormation stack 输出" border />

### 手动创建 IAM 角色 {#option-2-manually-create-iam-role}

1. 在浏览器中登录到您的 AWS 账户，使用具有创建和管理 IAM 角色权限的 IAM 用户。

2. 打开 IAM 服务控制台。

3. 使用以下信任策略和 IAM 策略创建一个新的 IAM 角色。将 `{ClickHouse_IAM_ARN}` 替换为属于您 ClickHouse 实例的 IAM 角色 ARN。

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

4. 在创建完成后复制新的 **IAM Role Arn**，这是访问您的 S3 bucket 所需的标识。


## 使用 ClickHouseAccess 角色访问你的 S3 bucket {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud 允许你在 S3 表函数中指定 `extra_credentials`。下面是一个示例，展示如何使用上面新创建的角色来运行查询。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

下面是一个示例查询，使用 `role_session_name` 作为共享密钥从存储桶中查询数据。
如果 `role_session_name` 不正确，此操作将会失败。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
我们建议将您的源 S3 与 ClickHouse Cloud 服务部署在同一地域，以降低数据传输费用。
有关更多信息，请参阅 [S3 定价](https://aws.amazon.com/s3/pricing/)。
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
