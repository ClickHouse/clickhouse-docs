---
'slug': '/cloud/security/secure-s3'
'sidebar_label': '安全地访问 S3 数据'
'title': '安全地访问 S3 数据'
'description': '本文演示了 ClickHouse Cloud 客户如何利用基于角色的访问来与 Amazon Simple Storage Service(S3)
  进行身份验证并安全地访问他们的数据。'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

这篇文章演示了 ClickHouse Cloud 客户如何利用基于角色的访问，安全地通过 Amazon 简单存储服务（S3）进行身份验证并访问他们的数据。

## 介绍 {#introduction}

在深入安全 S3 访问的设置之前，了解其工作原理是重要的。以下是 ClickHouse 服务如何通过假设客户 AWS 账户中的角色访问私有 S3 存储桶的概述。

<Image img={secure_s3} size="md" alt="与 ClickHouse 一起使用安全 S3 访问的概述"/>

这种方法允许客户在一个地方管理对他们 S3 存储桶的所有访问（即假设角色的 IAM 策略），而无需逐个查看所有存储桶策略来添加或移除访问权限。

## 设置 {#setup}

### 获取 ClickHouse 服务 IAM 角色 ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到您的 ClickHouse cloud 账户。

2 - 选择您想要创建集成的 ClickHouse 服务。

3 - 选择 **设置** 选项卡。

4 - 向下滚动到页面底部的 **网络安全信息** 部分。

5 - 复制如下所示的服务的 **服务角色 ID (IAM)** 值。

<Image img={s3_info} size="lg" alt="获取 ClickHouse 服务 IAM 角色 ARN" border />

### 设置 IAM 假设角色 {#setting-up-iam-assume-role}

#### 选项 1：使用 CloudFormation 堆栈部署 {#option-1-deploying-with-cloudformation-stack}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户登录到您的 AWS 账户。

2 - 访问 [此网址](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) 来填充 CloudFormation 堆栈。

3 - 输入（或粘贴）属于 ClickHouse 服务的 **IAM 角色**。

4 - 配置 CloudFormation 堆栈。以下是有关这些参数的额外信息。

| 参数                     | 默认值               | 描述                                                                                             |
| :---                    |    :----:           | :----                                                                                             |
| RoleName                | ClickHouseAccess-001 | ClickHouse Cloud 用于访问您的 S3 存储桶的新角色名称                                              |
| Role Session Name       |      *              | 角色会话名称可作为共享密钥，进一步保护您的存储桶。                                                |
| ClickHouse Instance Roles|                     | 可以使用此安全 S3 集成的 ClickHouse 服务 IAM 角色的逗号分隔列表。                                |
| Bucket Access           |    Read             | 设置提供的存储桶的访问级别。                                                                      |
| Bucket Names            |                     | 此角色将有权访问的 **存储桶名称** 的逗号分隔列表。                                                |

*注意*：请勿输入完整的存储桶 ARN，仅需输入存储桶名称。

5 - 选中 **我确认 AWS CloudFormation 可能会创建具有自定义名称的 IAM 资源。** 复选框。

6 - 点击右下角的 **创建堆栈** 按钮。

7 - 确保 CloudFormation 堆栈完成且没有错误。

8 - 选择 CloudFormation 堆栈的 **输出**。

9 - 复制该集成的 **RoleArn** 值。该值是访问您的 S3 存储桶所需的。

<Image img={s3_output} size="lg" alt="显示 IAM 角色 ARN 的 CloudFormation 堆栈输出" border />

#### 选项 2：手动创建 IAM 角色 {#option-2-manually-create-iam-role}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户登录到您的 AWS 账户。

2 - 浏览到 IAM 服务控制台。

3 - 使用以下 IAM 和信任策略创建新 IAM 角色。

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

4 - 创建后复制新 **IAM 角色 Arn**。该值是访问您的 S3 存储桶所需的。

## 使用 ClickHouseAccess 角色访问您的 S3 存储桶 {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud 具有一项新功能，允许您将 `extra_credentials` 作为 S3 表函数的一部分来指定。以下是如何使用从上面复制的新创建角色运行查询的示例。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下是一个示例查询，它使用 `role_session_name` 作为共享密钥从存储桶中查询数据。如果 `role_session_name` 不正确，此操作将失败。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
我们建议您的源 S3 存储在与您的 ClickHouse Cloud 服务相同的区域，以减少数据传输成本。有关更多信息，请参阅 [S3 定价]( https://aws.amazon.com/s3/pricing/)
:::
