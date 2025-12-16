---
slug: /integrations/clickpipes/secure-rds
sidebar_label: 'AWS IAM 数据库身份验证（RDS/Aurora）'
title: 'AWS IAM 数据库身份验证（RDS/Aurora）'
description: '本文演示 ClickPipes 客户如何利用基于角色的访问，与 Amazon RDS/Aurora 进行身份验证并安全访问其数据库。'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', 'security', 'aws', 'private connection']
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

本文演示 ClickPipes 客户如何利用基于角色的访问控制与 Amazon Aurora 和 RDS 进行身份验证，并安全访问其数据库。

:::warning
对于 AWS RDS Postgres 和 Aurora Postgres，由于 AWS IAM DB Authentication 的限制，只能运行 `Initial Load Only` 类型的 ClickPipes。

对于 MySQL 和 MariaDB，则不受此限制，可以同时运行 `Initial Load Only` 和 `CDC` 类型的 ClickPipes。
:::

## 设置 {#setup}

### 获取 ClickHouse 服务 IAM 角色 ARN {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到你的 ClickHouse Cloud 账号。

2 - 选择你要为其创建集成的 ClickHouse 服务。

3 - 选择 **Settings** 选项卡。

4 - 滚动到页面底部的 **Network security information** 部分。

5 - 复制该服务对应的 **Service role ID (IAM)** 值，如下所示。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border />

我们将这个值记为 `{ClickHouse_IAM_ARN}`。这是用于访问你的 RDS/Aurora 实例的 IAM 角色。

### 配置 RDS/Aurora 实例 {#configuring-the-rds-aurora-instance}

#### 启用 IAM 数据库认证 {#enabling-iam-db-authentication}

1. 登录到你的 AWS 账号并导航到你要配置的 RDS 实例。
2. 点击 **Modify** 按钮。
3. 向下滚动到 **Database authentication** 部分。
4. 启用 **Password and IAM database authentication** 选项。
5. 点击 **Continue** 按钮。
6. 检查变更并勾选 **Apply immediately** 选项。

#### 获取 RDS/Aurora Resource ID {#obtaining-the-rds-resource-id}

1. 登录到你的 AWS 账号并导航到你要配置的 RDS 实例 / Aurora 集群。
2. 点击 **Configuration** 选项卡。
3. 记下 **Resource ID** 值。对于 RDS，它类似于 `db-xxxxxxxxxxxxxx`；对于 Aurora 集群，它类似于 `cluster-xxxxxxxxxxxxxx`。我们将这个值记为 `{RDS_RESOURCE_ID}`。这是将在 IAM 策略中用于授予对 RDS 实例访问权限的资源 ID。

#### 设置数据库用户 {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. 连接到你的 RDS/Aurora 实例，并使用以下命令创建一个新的数据库用户：
   ```sql
    CREATE USER clickpipes_iam_user; 
    GRANT rds_iam TO clickpipes_iam_user;
    ```
2. 按照 [PostgreSQL source setup guide](postgres/source/rds) 中其余步骤配置你的 RDS 实例以用于 ClickPipes。

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. 连接到你的 RDS/Aurora 实例，并使用以下命令创建一个新的数据库用户：
   ```sql
    CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
    ```
2. 按照 [MySQL source setup guide](mysql/source/rds) 中其余步骤配置你的 RDS/Aurora 实例以用于 ClickPipes。

### 设置 IAM 角色 {#setting-up-iam-role}

#### 手动创建 IAM 角色 {#manually-create-iam-role}

1 - 在 Web 浏览器中使用具有创建和管理 IAM 角色权限的 IAM 用户登录到你的 AWS 账号。

2 - 进入 IAM 服务控制台。

3 - 使用以下 IAM 策略和信任策略创建一个新的 IAM 角色。

信任策略（请将 `{ClickHouse_IAM_ARN}` 替换为你的 ClickHouse 实例对应的 IAM 角色 ARN）：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "{ClickHouse_IAM_ARN}"
      },
      "Action": [
        "sts:AssumeRole",
        "sts:TagSession"
      ]
    }
  ]
}
```

IAM 策略（请将 `{RDS_RESOURCE_ID}` 替换为你的 RDS 实例的资源 ID）。请务必将 `{RDS_REGION}` 替换为你的 RDS/Aurora 实例所在的区域，将 `{AWS_ACCOUNT}` 替换为你的 AWS 账户 ID：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rds-db:connect"
      ],
      "Resource": [
        "arn:aws:rds-db:{RDS_REGION}:{AWS_ACCOUNT}:dbuser:{RDS_RESOURCE_ID}/clickpipes_iam_user"
      ]
    }
  ]
}
```

4 - 在创建完成后复制新的 **IAM Role Arn**。这是让 ClickPipes 能够安全访问你的 AWS 数据库所需要的。我们将其称为 `{RDS_ACCESS_IAM_ROLE_ARN}`。

现在你可以在 ClickPipes 中使用这个 IAM 角色对你的 RDS/Aurora 实例进行身份验证并访问它。
