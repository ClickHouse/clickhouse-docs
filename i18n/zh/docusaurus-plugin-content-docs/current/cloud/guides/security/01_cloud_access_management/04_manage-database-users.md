---
sidebar_label: "管理数据库用户"
slug: /cloud/security/manage-database-users
title: "管理数据库用户"
description: "本页面介绍管理员如何添加数据库用户、管理权限分配以及删除数据库用户"
doc_type: "guide"
keywords:
  [
    "数据库用户",
    "访问管理",
    "安全",
    "权限",
    "用户管理"
  ]
---

import Image from "@theme/IdealImage"
import user_grant_permissions_options from "@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png"

本指南介绍了管理数据库用户的两种方式:通过 SQL 控制台和直接在数据库中操作。

### SQL 控制台无密码身份验证 {#sql-console-passwordless-authentication}

SQL 控制台会为每个会话创建用户,并使用自动轮换的 X.509 证书进行身份验证。会话终止时,该用户将被删除。在生成审计访问列表时,请导航到控制台中服务的"设置"选项卡,除了记录数据库中存在的数据库用户外,还需记录 SQL 控制台的访问情况。如果配置了自定义角色,用户的访问权限将列在以该用户名结尾的角色中。


## SQL 控制台用户和角色 {#sql-console-users-and-roles}

拥有 Service Read Only 和 Service Admin 权限的用户可以被分配基本的 SQL 控制台角色。有关更多信息,请参阅[管理 SQL 控制台角色分配](/cloud/guides/sql-console/manage-sql-console-role-assignments)。本指南演示如何为 SQL 控制台用户创建自定义角色。

要为 SQL 控制台用户创建自定义角色并授予通用角色,请运行以下命令。电子邮件地址必须与控制台中用户的电子邮件地址一致。

<VerticalStepper headerLevel="h4">

#### 创建 `database_developer` 并授予权限 {#create-role-grant-permissions}

创建 `database_developer` 角色并授予 `SHOW`、`CREATE`、`ALTER` 和 `DELETE` 权限。

```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### 创建 SQL 控制台用户角色 {#create-sql-console-user-role}

为 SQL 控制台用户 my.user@domain.com 创建角色并分配 database_developer 角色。

```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

#### 用户使用 SQL 控制台时将被分配新角色 {#use-assigned-new-role}

用户每次使用 SQL 控制台时,都会被分配与其电子邮件地址关联的角色。

</VerticalStepper>


## 数据库身份验证 {#database-authentication}

### 数据库用户 ID 和密码 {#database-user-id--password}

在[创建用户账户](/sql-reference/statements/create/user.md)时使用 SHA256_hash 方法来保护密码。ClickHouse 数据库密码必须至少包含 12 个字符,并满足复杂度要求:大写字母、小写字母、数字和/或特殊字符。

:::tip 安全生成密码
由于非管理员权限的用户无法自行设置密码,请要求用户使用密码生成器(例如[此工具](https://tools.keycdn.com/sha256-online-generator))对其密码进行哈希处理,然后再将其提供给管理员以设置账户。
:::

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```

### 使用安全外壳 (SSH) 身份验证的数据库用户 {#database-ssh}

为 ClickHouse Cloud 数据库用户设置 SSH 身份验证:

1. 使用 ssh-keygen 创建密钥对。
2. 使用公钥创建用户。
3. 为用户分配角色和/或权限。
4. 使用私钥对服务进行身份验证。

有关详细的示例演练,请查看我们知识库中的[如何使用 SSH 密钥连接到 ClickHouse Cloud](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)。


## 数据库权限 {#database-permissions}

使用 SQL [GRANT](/sql-reference/statements/grant) 语句在服务和数据库中配置以下内容。

| 角色    | 描述                                                                  |
| :------ | :--------------------------------------------------------------------------- |
| Default | 服务的完全管理访问权限                                       |
| Custom  | 使用 SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置 |

- 数据库角色是累加的。这意味着如果用户是两个角色的成员,该用户将拥有这两个角色授予的最高访问权限。添加角色不会导致失去访问权限。
- 数据库角色可以授予其他角色,从而形成层次结构。角色继承其所属角色的所有权限。
- 数据库角色在每个服务中是唯一的,可以应用于同一服务内的多个数据库。

下图展示了授予用户权限的不同方式。

<Image
  img={user_grant_permissions_options}
  alt='展示授予用户权限的不同方式的示意图'
  size='md'
  background='black'
/>

### 初始设置 {#initial-settings}

数据库有一个名为 `default` 的账户,该账户在服务创建时自动添加并被授予 default_role。创建服务的用户会看到为 `default` 账户自动生成的随机密码。初始设置后不再显示该密码,但稍后可以由控制台中具有服务管理员权限的任何用户更改。此账户或控制台中具有服务管理员权限的账户可以随时设置其他数据库用户和角色。

:::note
要在控制台中更改分配给 `default` 账户的密码,请转到左侧的服务菜单,访问该服务,转到设置选项卡并单击重置密码按钮。
:::

我们建议创建一个与个人关联的新用户账户,并授予该用户 default_role。这样用户执行的活动可以通过其用户 ID 进行识别,而 `default` 账户则保留用于应急访问。

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

用户可以使用 SHA256 哈希生成器或代码函数(例如 Python 中的 `hashlib`)将具有适当复杂度的 12 个以上字符的密码转换为 SHA256 字符串,并将其作为密码提供给系统管理员。这确保管理员不会看到或处理明文密码。

### 使用 SQL 控制台用户的数据库访问列表 {#database-access-listings-with-sql-console-users}

可以使用以下流程生成组织中 SQL 控制台和数据库的完整访问列表。

<VerticalStepper headerLevel="h4">

#### 获取所有数据库授权列表 {#get-a-list-of-all-database-grants}

运行以下查询以获取数据库中所有授权的列表。

```sql
SELECT grants.user_name,
grants.role_name,
users.name AS role_member,
grants.access_type,
grants.database,
grants.table
FROM system.grants LEFT OUTER JOIN system.role_grants ON grants.role_name = role_grants.granted_role_name
LEFT OUTER JOIN system.users ON role_grants.user_name = users.name

UNION ALL

SELECT grants.user_name,
grants.role_name,
role_grants.role_name AS role_member,
grants.access_type,
grants.database,
grants.table
FROM system.role_grants LEFT OUTER JOIN system.grants ON role_grants.granted_role_name = grants.role_name
WHERE role_grants.user_name is null;
```

#### 将授权列表关联到有权访问 SQL 控制台的控制台用户 {#associate-grant-list-to-console-users-with-access-to-sql-console}

将此列表与有权访问 SQL 控制台的控制台用户关联。

a. 转到控制台。

b. 选择相关服务。

c. 选择左侧的设置。

d. 滚动到 SQL 控制台访问部分。

e. 单击有权访问数据库的用户数量链接 `There are # users with access to this service.` 以查看用户列表。

</VerticalStepper>


## 仓库用户 {#warehouse-users}

仓库用户在同一仓库内的各个服务间共享。更多信息请参阅[仓库访问控制](/cloud/reference/warehouses#access-controls)。
