---
slug: /integrations/clickpipes/secure-rds
sidebar_label: 'AWS IAM 数据库身份验证（RDS/Aurora）'
title: 'AWS IAM 数据库身份验证（RDS/Aurora）'
description: '本文演示 ClickPipes 客户如何利用基于角色的访问控制与 Amazon RDS/Aurora 进行身份验证，并安全访问其数据库。'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'security', 'aws', 'private connection']
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

本文演示 ClickPipes 客户如何利用基于角色的访问，与 Amazon Aurora 和 RDS 进行身份验证，并安全访问其数据库。

:::warning
对于 AWS RDS Postgres 和 Aurora Postgres，由于 AWS IAM DB Authentication 的限制，您只能运行 `Initial Load Only` 类型的 ClickPipes。

对于 MySQL 和 MariaDB，此限制不适用，您可以同时运行 `Initial Load Only` 和 `CDC` 类型的 ClickPipes。
:::


## 设置 {#setup}

### 获取 ClickHouse 服务 IAM 角色 ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录您的 ClickHouse Cloud 账户。

2 - 选择您要创建集成的 ClickHouse 服务。

3 - 选择 **Settings** 选项卡。

4 - 向下滚动到页面底部的 **Network security information** 部分。

5 - 复制该服务的 **Service role ID (IAM)** 值,如下所示。

<Image img={secures3_arn} alt='安全 S3 ARN' size='lg' border />

我们将此值称为 `{ClickHouse_IAM_ARN}`。这是用于访问您的 RDS/Aurora 实例的 IAM 角色。

### 配置 RDS/Aurora 实例 {#configuring-the-rds-aurora-instance}

#### 启用 IAM 数据库身份验证 {#enabling-iam-db-authentication}

1. 登录您的 AWS 账户并导航到您要配置的 RDS 实例。
2. 点击 **Modify** 按钮。
3. 向下滚动到 **Database authentication** 部分。
4. 启用 **Password and IAM database authentication** 选项。
5. 点击 **Continue** 按钮。
6. 检查更改并点击 **Apply immediately** 选项。

#### 获取 RDS/Aurora 资源 ID {#obtaining-the-rds-resource-id}

1. 登录您的 AWS 账户并导航到您要配置的 RDS 实例/Aurora 集群。
2. 点击 **Configuration** 选项卡。
3. 记录 **Resource ID** 值。对于 RDS,它应该类似于 `db-xxxxxxxxxxxxxx`,对于 Aurora 集群,它应该类似于 `cluster-xxxxxxxxxxxxxx`。我们将此值称为 `{RDS_RESOURCE_ID}`。这是将在 IAM 策略中使用的资源 ID,用于授予对 RDS 实例的访问权限。

#### 设置数据库用户 {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. 连接到您的 RDS/Aurora 实例并使用以下命令创建新的数据库用户:
   ```sql
   CREATE USER clickpipes_iam_user;
   GRANT rds_iam TO clickpipes_iam_user;
   ```
2. 按照 [PostgreSQL 源设置指南](postgres/source/rds) 中的其余步骤为 ClickPipes 配置您的 RDS 实例。

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. 连接到您的 RDS/Aurora 实例并使用以下命令创建新的数据库用户:
   ```sql
   CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
   ```
2. 按照 [MySQL 源设置指南](mysql/source/rds) 中的其余步骤为 ClickPipes 配置您的 RDS/Aurora 实例。

### 设置 IAM 角色 {#setting-up-iam-role}

#### 手动创建 IAM 角色 {#manually-create-iam-role}

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
      "Action": ["sts:AssumeRole", "sts:TagSession"]
    }
  ]
}
```

IAM 策略(请将 `{RDS_RESOURCE_ID}` 替换为您的 RDS 实例的资源 ID)。请确保将 `{RDS_REGION}` 替换为您的 RDS/Aurora 实例的区域,将 `{AWS_ACCOUNT}` 替换为您的 AWS 账户 ID:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["rds-db:connect"],
      "Resource": [
        "arn:aws:rds-db:{RDS_REGION}:{AWS_ACCOUNT}:dbuser:{RDS_RESOURCE_ID}/clickpipes_iam_user"
      ]
    }
  ]
}
```

4 - 创建后复制新的 **IAM Role Arn**。这是从 ClickPipes 安全访问您的 AWS 数据库所需的内容。我们将其称为 `{RDS_ACCESS_IAM_ROLE_ARN}`。

现在您可以使用此 IAM 角色从 ClickPipes 对您的 RDS/Aurora 实例进行身份验证。
