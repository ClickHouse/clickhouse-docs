---
slug: /cloud/security/secure-s3
sidebar_label: 安全访问 S3 数据
title: 安全访问 S3 数据
---

import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

本文演示了 ClickHouse Cloud 客户如何利用基于角色的访问权限与 Amazon Simple Storage Service (S3) 进行身份验证，并安全访问他们的数据。

## 介绍 {#introduction}

在深入了解安全的 S3 访问设置之前，重要的是了解其工作原理。以下是 ClickHouse 服务如何通过假设客户 AWS 账户中的角色来访问私有 S3 存储桶的概述。

<img src={secure_s3} alt="ClickHouse 安全 S3 访问概述" />

这种方法允许客户在一个地方（假设角色的 IAM 策略）管理对其 S3 存储桶的所有访问，而无需逐一查看所有存储桶策略来添加或删除访问权限。

## 设置 {#setup}

### 获取 ClickHouse 服务 IAM 角色 Arn {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到您的 ClickHouse Cloud 账户。

2 - 选择您想要创建集成的 ClickHouse 服务

3 - 选择 **设置** 标签

4 - 向下滚动到页面底部的 **网络安全信息** 部分

5 - 复制服务的 **服务角色 ID (IAM)** 值，如下所示。

<img src={s3_info} alt="获取 ClickHouse 服务 IAM 角色 ARN" />

### 设置 IAM 假设角色 {#setting-up-iam-assume-role}

#### 选项 1：使用 CloudFormation 堆栈部署 {#option-1-deploying-with-cloudformation-stack}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户在浏览器中登录到您的 AWS 账户。

2 - 访问 [这个链接](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) 以填充 CloudFormation 堆栈。

3 - 输入（或粘贴）属于 ClickHouse 服务的 **IAM 角色**

4 - 配置 CloudFormation 堆栈。以下是这些参数的附加信息。

| 参数                      | 默认值                | 描述                                                                                               |
| :---                     |    :----:            | :----                                                                                              |
| RoleName                 | ClickHouseAccess-001 | ClickHouse Cloud 将用来访问您的 S3 存储桶的新角色名称                                             |
| Role Session Name        |      *               | 角色会话名称可作为共享密钥以进一步保护您的存储桶。                                                |
| ClickHouse Instance Roles |                      | 可以使用此安全 S3 集成的 ClickHouse 服务 IAM 角色的逗号分隔列表。                                  |
| Bucket Access            |    Read              | 设置提供的存储桶的访问级别。                                                                       |
| Bucket Names             |                      | 该角色将有权访问的 **存储桶名称** 的逗号分隔列表。                                                |

*注意*: 不要放置完整的存储桶 ARN，而只需存储桶名称。

5 - 选择 **我承认 AWS CloudFormation 可能会创建具有自定义名称的 IAM 资源。** 复选框

6 - 点击右下角的 **创建堆栈** 按钮

7 - 确保 CloudFormation 堆栈完成且没有错误。

8 - 选择 CloudFormation 堆栈的 **输出**

9 - 复制该集成的 **RoleArn** 值。此值需要访问您的 S3 存储桶。

<img src={s3_output} alt="CloudFormation 堆栈输出显示 IAM 角色 ARN" />

#### 选项 2：手动创建 IAM 角色。 {#option-2-manually-create-iam-role}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户在浏览器中登录到您的 AWS 账户。

2 - 浏览到 IAM 服务控制台

3 - 创建新 IAM 角色，使用以下 IAM 和信任策略。

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

4 - 创建后复制新的 **IAM 角色 ARN**。此值需要访问您的 S3 存储桶。

## 使用 ClickHouseAccess 角色访问您的 S3 存储桶 {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud 有一个新功能，允许您在 S3 表函数中指定 `extra_credentials`。以下是如何使用从上面复制的新创建角色运行查询的示例。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```


以下是使用 `role_session_name` 作为共享密钥从存储桶查询数据的示例查询。如果 `role_session_name` 不正确，则此操作将失败。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
我们建议您的源 S3 与您的 ClickHouse Cloud 服务位于同一地区，以减少数据传输成本。有关更多信息，请参阅 [S3 定价](https://aws.amazon.com/s3/pricing/)
:::
