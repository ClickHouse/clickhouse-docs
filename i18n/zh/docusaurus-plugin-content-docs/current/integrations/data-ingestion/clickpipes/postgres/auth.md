---
slug: /integrations/clickpipes/postgres/auth
sidebar_label: 'AWS IAM 数据库身份验证（RDS/Aurora）'
title: 'AWS IAM 数据库身份验证（RDS/Aurora）'
description: '本文演示 ClickPipes 客户如何利用基于角色的访问控制与 Amazon RDS/Aurora 进行身份验证，并安全访问其数据库。'
doc_type: 'guide'
keywords: ['clickpipes', 'rds', '安全', 'aws', '私有连接']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

本文演示 ClickPipes 客户如何利用基于角色的访问控制与 Amazon Aurora 和 RDS 进行身份验证，并安全访问相应的数据库。

:::warning
对于 AWS RDS Postgres 和 Aurora Postgres，由于 AWS IAM DB Authentication 的限制，您只能运行 `Initial Load Only` 类型的 ClickPipes。

对于 MySQL 和 MariaDB，则不受此限制，您可以同时运行 `Initial Load Only` 和 `CDC` 类型的 ClickPipes。
:::


## 设置 \{#setup\}

### 获取 ClickHouse 服务 IAM 角色 ARN \{#obtaining-the-clickhouse-service-iam-role-arn\}

1 - 登录到你的 ClickHouse Cloud 帐户。

2 - 选择你要为其创建集成的 ClickHouse 服务。

3 - 选择 **Settings** 选项卡。

4 - 滚动到页面底部的 **Network security information** 部分。

5 - 复制如下所示、属于该服务的 **Service role ID (IAM)** 值。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

我们将这个值记作 `{ClickHouse_IAM_ARN}`。这是用于访问你的 RDS/Aurora 实例的 IAM 角色。

### 配置 RDS/Aurora 实例 \{#configuring-the-rds-aurora-instance\}

#### 启用 IAM DB 身份验证 \{#enabling-iam-db-authentication\}

1. 登录 AWS 账户，并进入要配置的 RDS 实例。
2. 点击 **Modify** 按钮。
3. 向下滚动至 **Database authentication** 部分。
4. 启用 **Password and IAM database authentication** 选项。
5. 点击 **Continue** 按钮。
6. 检查更改并点击 **Apply immediately** 选项。

#### 获取 RDS/Aurora 资源 ID \{#obtaining-the-rds-resource-id\}

1. 登录到您的 AWS 账户，并导航到要配置的 RDS 实例或 Aurora 集群。
2. 点击 **Configuration** 选项卡。
3. 记录下 **Resource ID** 的值。对于 RDS，其格式类似于 `db-xxxxxxxxxxxxxx`，对于 Aurora 集群，其格式类似于 `cluster-xxxxxxxxxxxxxx`。我们将该值记为 `{RDS_RESOURCE_ID}`。这是将在 IAM 策略中用于允许访问 RDS 实例的资源 ID。

#### 配置数据库用户 \{#setting-up-the-database-user\}

##### PostgreSQL \{#setting-up-the-database-user-postgres\}

1. 连接到 RDS/Aurora 实例，并使用以下命令创建一个新的数据库用户：
    ```sql
    CREATE USER clickpipes_iam_user; 
    GRANT rds_iam TO clickpipes_iam_user;
    ```
2. 按照 [PostgreSQL 源设置指南](./source/rds) 中的其余步骤，将 RDS 实例配置为用于 ClickPipes。

##### MySQL / MariaDB \{#setting-up-the-database-user-mysql\}

1. 连接到您的 RDS/Aurora 实例，并使用以下命令创建一个新的数据库用户：
    ```sql
    CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
    ```
2. 按照 [MySQL 源设置指南](../mysql/source/rds) 中其余步骤，将您的 RDS/Aurora 实例配置为与 ClickPipes 集成。

### 配置 IAM 角色 \{#setting-up-iam-role\}

#### 手动创建 IAM 角色。 \{#manually-create-iam-role\}

1 - 在浏览器中使用具有创建和管理 IAM 角色权限的 IAM 用户登录到您的 AWS 账号。

2 - 打开 IAM 服务控制台。

3 - 使用以下 IAM 策略和信任策略创建一个新的 IAM 角色。

信任策略（请将 `{ClickHouse_IAM_ARN}` 替换为您的 ClickHouse 实例对应的 IAM 角色 ARN）：

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

IAM 策略（请将 `{RDS_RESOURCE_ID}` 替换为 RDS 实例的资源 ID）。请确保将 `{RDS_REGION}` 替换为 RDS/Aurora 实例所在的区域，将 `{AWS_ACCOUNT}` 替换为 AWS 账户 ID：

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

4 - 创建完成后，复制新的 **IAM Role Arn**。这是使 ClickPipes 能够安全访问您的 AWS 数据库所需的凭据。我们将其称为 `{RDS_ACCESS_IAM_ROLE_ARN}`。

现在，您可以使用此 IAM role，在 ClickPipes 访问 RDS/Aurora 实例时进行身份验证。
