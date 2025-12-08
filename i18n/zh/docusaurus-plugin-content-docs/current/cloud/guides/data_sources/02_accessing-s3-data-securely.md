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

本文演示 ClickHouse Cloud 客户如何利用基于角色的访问控制与 Amazon Simple Storage Service (S3) 完成身份验证，并安全访问其数据。

## 介绍 {#introduction}

在开始配置安全 S3 访问之前，了解其工作原理非常重要。下面概述了 ClickHouse 服务如何通过在客户的 AWS 账户中扮演一个角色来访问私有 S3 存储桶。

<Image img={secure_s3} size="lg" alt="Overview of Secure S3 Access with ClickHouse"/>

这种方式使客户可以在同一处（被扮演角色的 IAM 策略）集中管理对其 S3 存储桶的所有访问，而无需逐一修改各个存储桶策略来增加或移除访问权限。

## 安装与配置 {#setup}

### 获取 ClickHouse 服务 IAM 角色 ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到你的 ClickHouse Cloud 账户。

2 - 选择要为其创建集成的 ClickHouse 服务。

3 - 选择 **Settings** 选项卡。

4 - 向下滚动到页面底部的 **Network security information** 部分。

5 - 复制该服务对应的 **Service role ID (IAM)** 值，如下所示。

<Image img={s3_info} size="lg" alt="获取 ClickHouse 服务 IAM 角色 ARN" border />

### 配置 IAM 角色切换（Assume Role）{#setting-up-iam-assume-role}

#### 选项 1：使用 CloudFormation 堆栈部署 {#option-1-deploying-with-cloudformation-stack}

1 - 在浏览器中使用具有创建和管理 IAM 角色权限的 IAM 用户登录到你的 AWS 账户。

2 - 访问 [此 URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) 以创建并填充 CloudFormation 堆栈。

3 - 输入（或粘贴）ClickHouse 服务使用的 **IAM 角色**。

4 - 配置 CloudFormation 堆栈。以下是这些参数的补充说明。

| Parameter                 | Default Value        | Description                                                                                         |
| :---                      |    :----:            | :----                                                                                               |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud 用于访问你的 S3 bucket 的新角色名称                                               |
| Role Session Name         |      *               | Role Session Name 可作为共享密钥，以进一步保护你的 bucket。                                        |
| ClickHouse Instance Roles |                      | 允许使用此 Secure S3 集成的 ClickHouse 服务 IAM 角色的逗号分隔列表。                               |
| Bucket Access             |    Read              | 为所提供的 bucket 设置访问级别。                                                                    |
| Bucket Names              |                      | 此角色可访问的 **bucket 名称** 的逗号分隔列表。                                                     |

*Note*: 不要填写完整的 bucket ARN，只需填写 bucket 名称。

5 - 勾选 **I acknowledge that AWS CloudFormation might create IAM resources with custom names.** 复选框。

6 - 点击右下角的 **Create stack** 按钮。

7 - 确认 CloudFormation 堆栈成功完成且没有错误。

8 - 选择 CloudFormation 堆栈的 **Outputs**。

9 - 复制此集成的 **RoleArn** 值。该值用于访问你的 S3 bucket。

<Image img={s3_output} size="lg" alt="显示 IAM Role ARN 的 CloudFormation 堆栈输出" border />

#### 选项 2：手动创建 IAM 角色 {#option-2-manually-create-iam-role}

1 - 在浏览器中登录到您的 AWS 账户，使用具有创建和管理 IAM 角色权限的 IAM 用户。

2 - 打开 IAM 服务控制台。

3 - 使用以下 IAM 策略和信任策略创建一个新的 IAM 角色。

信任策略（请将 `{ClickHouse_IAM_ARN}` 替换为属于您 ClickHouse 实例的 IAM 角色 ARN）：

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

IAM 策略（请将 `{BUCKET_NAME}` 替换为您的存储桶名称）：

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

4 - 在创建完成后复制新的 **IAM Role Arn**。这是访问你的 S3 bucket 所需的 Arn。

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
我们建议将您的源 S3 与 ClickHouse Cloud Service 部署在同一地域，以降低数据传输费用。有关更多信息，请参阅 [S3 定价](https://aws.amazon.com/s3/pricing/)。
:::
