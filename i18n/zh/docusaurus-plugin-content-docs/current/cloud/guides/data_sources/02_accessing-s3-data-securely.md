---
slug: /cloud/data-sources/secure-s3
sidebar_label: '安全访问 S3 数据'
title: '安全访问 S3 数据'
description: '本文介绍 ClickHouse Cloud 用户如何通过基于角色的访问控制对 Amazon Simple Storage Service (S3) 进行身份验证,从而安全地访问数据。'
keywords: ['RBAC', 'Amazon S3', '身份验证']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import secure_s3 from '@site/static/images/cloud/security/secures3.jpg';
import s3_info from '@site/static/images/cloud/security/secures3_arn.png';
import s3_output from '@site/static/images/cloud/security/secures3_output.jpg';

本文演示 ClickHouse Cloud 客户如何利用基于角色的访问控制与 Amazon Simple Storage Service (S3) 进行身份验证，并安全访问其数据。


## 简介 {#introduction}

在深入了解安全 S3 访问的配置之前,理解其工作原理非常重要。下面概述了 ClickHouse 服务如何通过代入客户 AWS 账户中的角色来访问私有 S3 存储桶。

<Image
  img={secure_s3}
  size='md'
  alt='ClickHouse 安全 S3 访问概览'
/>

这种方法允许客户在单一位置(代入角色的 IAM 策略)管理对其 S3 存储桶的所有访问权限,而无需逐一检查所有存储桶策略来添加或删除访问权限。


## 设置 {#setup}

### 获取 ClickHouse 服务 IAM 角色 ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录您的 ClickHouse Cloud 账户。

2 - 选择您要创建集成的 ClickHouse 服务。

3 - 选择 **Settings** 选项卡。

4 - 向下滚动到页面底部的 **Network security information** 部分。

5 - 复制该服务的 **Service role ID (IAM)** 值,如下所示。

<Image
  img={s3_info}
  size='lg'
  alt='获取 ClickHouse 服务 IAM 角色 ARN'
  border
/>

### 设置 IAM 代入角色 {#setting-up-iam-assume-role}

#### 选项 1:使用 CloudFormation 堆栈部署 {#option-1-deploying-with-cloudformation-stack}

1 - 在 Web 浏览器中使用具有创建和管理 IAM 角色权限的 IAM 用户登录您的 AWS 账户。

2 - 访问[此 URL](https://us-west-2.console.aws.amazon.com/cloudformation/home?region=us-west-2#/stacks/quickcreate?templateURL=https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/secure-s3.yaml&stackName=ClickHouseSecureS3) 以创建 CloudFormation 堆栈。

3 - 输入(或粘贴)ClickHouse 服务的 **IAM Role**。

4 - 配置 CloudFormation 堆栈。以下是有关这些参数的详细说明。

| 参数                      |      默认值          | 描述                                                                                          |
| :------------------------ | :------------------: | :-------------------------------------------------------------------------------------------- |
| RoleName                  | ClickHouseAccess-001 | ClickHouse Cloud 用于访问您的 S3 存储桶的新角色名称                                            |
| Role Session Name         |          \*          | 角色会话名称可用作共享密钥以进一步保护您的存储桶。                                              |
| ClickHouse Instance Roles |                      | 可以使用此安全 S3 集成的 ClickHouse 服务 IAM 角色的逗号分隔列表。                              |
| Bucket Access             |         Read         | 设置所提供存储桶的访问级别。                                                                   |
| Bucket Names              |                      | 此角色可以访问的**存储桶名称**的逗号分隔列表。                                                 |

_注意_:请勿填写完整的存储桶 ARN,仅填写存储桶名称即可。

5 - 选中 **I acknowledge that AWS CloudFormation might create IAM resources with custom names.** 复选框。

6 - 点击右下角的 **Create stack** 按钮。

7 - 确保 CloudFormation 堆栈成功完成且没有错误。

8 - 选择 CloudFormation 堆栈的 **Outputs**。

9 - 复制此集成的 **RoleArn** 值。这是访问您的 S3 存储桶所需的信息。

<Image
  img={s3_output}
  size='lg'
  alt='显示 IAM 角色 ARN 的 CloudFormation 堆栈输出'
  border
/>

#### 选项 2:手动创建 IAM 角色 {#option-2-manually-create-iam-role}

1 - 在 Web 浏览器中使用具有创建和管理 IAM 角色权限的 IAM 用户登录您的 AWS 账户。

2 - 浏览到 IAM 服务控制台。

3 - 使用以下 IAM 策略和信任策略创建新的 IAM 角色。

信任策略(请将 `{ClickHouse_IAM_ARN}` 替换为您的 ClickHouse 实例的 IAM 角色 ARN):

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

IAM 策略(请将 `{BUCKET_NAME}` 替换为您的存储桶名称):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["s3:GetBucketLocation", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::{BUCKET_NAME}"],
      "Effect": "Allow"
    },
    {
      "Action": ["s3:Get*", "s3:List*"],
      "Resource": ["arn:aws:s3:::{BUCKET_NAME}/*"],
      "Effect": "Allow"
    }
  ]
}
```

4 - 创建后复制新的 **IAM Role Arn**。这是访问您的 S3 存储桶所需的信息。


## 使用 ClickHouseAccess 角色访问 S3 存储桶 {#access-your-s3-bucket-with-the-clickhouseaccess-role}

ClickHouse Cloud 提供了一项新功能,允许您在 S3 表函数中指定 `extra_credentials` 参数。以下示例展示了如何使用上面创建的角色来运行查询。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001'))
```

以下示例查询使用 `role_session_name` 作为共享密钥来查询存储桶中的数据。如果 `role_session_name` 不正确,该操作将会失败。

```sql
DESCRIBE TABLE s3('https://s3.amazonaws.com/BUCKETNAME/BUCKETOBJECT.csv','CSVWithNames',extra_credentials(role_arn = 'arn:aws:iam::111111111111:role/ClickHouseAccessRole-001', role_session_name = 'secret-role-name'))
```

:::note
我们建议将源 S3 存储桶与 ClickHouse Cloud 服务部署在同一区域,以降低数据传输成本。更多信息请参阅 [S3 定价](https://aws.amazon.com/s3/pricing/)
:::
