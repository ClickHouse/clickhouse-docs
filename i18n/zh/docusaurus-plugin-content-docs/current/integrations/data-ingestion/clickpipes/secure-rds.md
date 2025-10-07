---
'slug': '/integrations/clickpipes/secure-rds'
'sidebar_label': 'AWS IAM DB 认证 (RDS/Aurora)'
'title': 'AWS IAM DB 认证 (RDS/Aurora)'
'description': '本文演示了 ClickPipes 客户如何利用基于角色的访问来与 Amazon RDS/Aurora 进行身份验证，并安全访问他们的
  DATABASE。'
'doc_type': 'guide'
---

import secures3_arn from '@site/static/images/cloud/security/secures3_arn.png';
import Image from '@theme/IdealImage';

这篇文章演示了 ClickPipes 用户如何利用基于角色的访问来使用 Amazon Aurora 和 RDS 进行身份验证并安全地访问他们的数据库。

:::warning
对于 AWS RDS Postgres 和 Aurora Postgres，您只能运行 `Initial Load Only` 的 ClickPipes，因为 AWS IAM 数据库身份验证的限制。

对于 MySQL 和 MariaDB，这个限制不适用，您可以同时运行 `Initial Load Only` 和 `CDC` ClickPipes。
:::

## 设置 {#setup}

### 获取 ClickHouse 服务 IAM 角色 Arn {#obtaining-the-clickhouse-service-iam-role-arn}

1 - 登录到您的 ClickHouse 云账户。

2 - 选择您要创建集成的 ClickHouse 服务。

3 - 选择 **设置** 选项卡。

4 - 向下滚动到页面底部的 **网络安全信息** 部分。

5 - 复制下方显示的与该服务对应的 **服务角色 ID (IAM)** 值。

<Image img={secures3_arn} alt="Secure S3 ARN" size="lg" border/>

我们将该值称为 `{ClickHouse_IAM_ARN}`。这是用于访问您的 RDS/Aurora 实例的 IAM 角色。

### 配置 RDS/Aurora 实例 {#configuring-the-rds-aurora-instance}

#### 启用 IAM 数据库身份验证 {#enabling-iam-db-authentication}
1. 登录到您的 AWS 账户，导航到您要配置的 RDS 实例。
2. 点击 **修改** 按钮。
3. 向下滚动到 **数据库身份验证** 部分。
4. 启用 **密码和 IAM 数据库身份验证** 选项。
5. 点击 **继续** 按钮。
6. 审查更改，然后点击 **立即应用** 选项。

#### 获取 RDS/Aurora 资源 ID {#obtaining-the-rds-resource-id}

1. 登录到您的 AWS 账户，导航到您要配置的 RDS/Aurora 实例。
2. 点击 **配置** 选项卡。
3. 注意 **资源 ID** 值。它应该看起来像 `db-xxxxxxxxxxxxxx`。我们将该值称为 `{RDS_RESOURCE_ID}`。这是将在 IAM 策略中用于允许访问 RDS 实例的资源 ID。

#### 设置数据库用户 {#setting-up-the-database-user}

##### PostgreSQL {#setting-up-the-database-user-postgres}

1. 连接到您的 RDS/Aurora 实例，并使用以下命令创建一个新的数据库用户：
```sql
CREATE USER clickpipes_iam_user; 
GRANT rds_iam TO clickpipes_iam_user;
```
2. 在 [PostgreSQL 源设置指南](postgres/source/rds) 中按照其余步骤配置您的 RDS 实例以用于 ClickPipes。

##### MySQL / MariaDB {#setting-up-the-database-user-mysql}

1. 连接到您的 RDS/Aurora 实例，并使用以下命令创建一个新的数据库用户：
```sql
CREATE USER 'clickpipes_iam_user' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS';
```
2. 在 [MySQL 源设置指南](mysql/source/rds) 中按照其余步骤配置您的 RDS/Aurora 实例以用于 ClickPipes。

### 设置 IAM 角色 {#setting-up-iam-role}

#### 手动创建 IAM 角色。 {#manually-create-iam-role}

1 - 使用具有创建和管理 IAM 角色权限的 IAM 用户，在网页浏览器中登录到您的 AWS 账户。

2 - 浏览到 IAM 服务控制台。

3 - 创建一个新的 IAM 角色，并添加以下 IAM 和信任策略。

信任策略（请将 `{ClickHouse_IAM_ARN}` 替换为属于您的 ClickHouse 实例的 IAM 角色 arn）：

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

IAM 策略（请将 `{RDS_RESOURCE_ID}` 替换为您的 RDS 实例的资源 ID）。请确保将 `{RDS_REGION}` 替换为您的 RDS/Aurora 实例所在的区域，以及将 `{AWS_ACCOUNT}` 替换为您的 AWS 账户 ID：

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

4 - 创建后复制新的 **IAM 角色 Arn**。这就是从 ClickPipes 安全访问您的 AWS 数据库所需的。我们将其称为 `{RDS_ACCESS_IAM_ROLE_ARN}`。

现在，您可以使用此 IAM 角色从 ClickPipes 进行身份验证，以访问您的 RDS/Aurora 实例。
