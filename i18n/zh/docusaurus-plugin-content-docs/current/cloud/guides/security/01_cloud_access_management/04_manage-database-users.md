---
sidebar_label: '管理数据库用户'
slug: /cloud/security/manage-database-users
title: '管理数据库用户'
description: '本页面介绍管理员如何添加数据库用户、管理权限分配以及删除数据库用户'
doc_type: 'guide'
keywords: ['数据库用户', '访问管理', '安全性', '权限', '用户管理']
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';

本指南介绍了两种管理数据库用户的方式：在 SQL 控制台中管理，以及直接在数据库中管理。


### SQL 控制台免密认证 \{#sql-console-passwordless-authentication\}

SQL 控制台用户会为每个会话单独创建，并使用会自动轮换的 X.509 证书进行身份验证。会话终止时，该用户会被删除。在为审计生成访问列表时，请在控制台中进入相应服务的 Settings 选项卡，在记录数据库中现有数据库用户的同时，也一并记录 SQL 控制台访问情况。如果配置了自定义角色，用户的访问权限会列在以该用户用户名结尾的角色中。

## SQL 控制台用户和角色 \{#sql-console-users-and-roles\}

具有 Service Read Only 和 Service Admin 权限的用户可以被分配基本的 SQL 控制台角色。有关更多信息，请参阅 [管理 SQL 控制台角色分配](/cloud/guides/sql-console/manage-sql-console-role-assignments)。本指南演示如何为 SQL 控制台用户创建自定义角色。

要为 SQL 控制台用户创建自定义角色并为其授予通用角色，请运行以下命令。电子邮件地址必须与该用户在控制台中的电子邮件地址一致。 

<VerticalStepper headerLevel="h4">

#### 创建 `database_developer` 并授予权限 \{#create-role-grant-permissions\}

创建 `database_developer` 角色并授予 `SHOW`、`CREATE`、`ALTER` 和 `DELETE` 权限。
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### 创建 SQL 控制台用户角色 \{#create-sql-console-user-role\}

为 SQL 控制台用户 my.user@domain.com 创建角色，并为其分配 database_developer 角色。
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

#### 用户在使用 SQL 控制台时将被分配新角色 \{#use-assigned-new-role\}

每当用户使用 SQL 控制台时，系统都会为其分配与其电子邮件地址关联的角色。 

</VerticalStepper>

## 数据库身份验证 \{#database-authentication\}

### 数据库用户 ID 和密码 \{#database-user-id--password\}

在[创建用户账户](/sql-reference/statements/create/user.md)时使用 SHA256&#95;hash 方法来保护密码。ClickHouse 数据库密码长度至少为 12 个字符，并且必须满足复杂性要求：包含大写字符、小写字符、数字和/或特殊字符。

:::tip 安全生成密码
由于非管理员用户无法自行设置密码，请让用户先使用诸如[此工具](https://tools.keycdn.com/sha256-online-generator)之类的生成器对其密码进行哈希处理，然后再将生成的哈希值提供给管理员以设置账户。
:::

```sql
CREATE USER userName IDENTIFIED WITH sha256_hash BY 'hash';
```


### 使用安全外壳（SSH）身份验证的数据库用户 \{#database-ssh\}

为 ClickHouse Cloud 数据库用户配置 SSH 身份验证。

1. 使用 ssh-keygen 创建一对密钥。
2. 使用公钥创建用户。
3. 为该用户分配角色和/或权限。
4. 使用私钥对服务进行身份验证。

如需包含示例的详细操作说明，请参阅我们知识库中的[如何使用 SSH 密钥连接到 ClickHouse Cloud](/knowledgebase/how-to-connect-to-ch-cloud-using-ssh-keys)。

## 数据库权限 \{#database-permissions\}

在服务和数据库中使用 SQL [GRANT](/sql-reference/statements/grant) 语句配置以下内容。

| 角色      | 描述                                                       |
| :------ | :------------------------------------------------------- |
| Default | 对服务具有完整的管理访问权限                                           |
| Custom  | 使用 SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置 |

* 数据库角色具有叠加效果。也就是说，如果一个用户同时属于两个角色，该用户将拥有这两个角色中权限更高的一方所授予的访问权限。添加角色不会导致用户失去访问权限。
* 数据库角色可以授予给其他角色，从而形成分层结构。角色会继承其作为成员角色的所有权限。
* 数据库角色在每个服务内是唯一的，并且可以应用到同一服务内的多个数据库。

下图展示了用户可以被授予权限的不同方式。

<Image img={user_grant_permissions_options} alt="An illustration showing the different ways a user could be granted permissions" size="md" background="black" />

### 初始设置 \{#initial-settings\}

数据库中有一个名为 `default` 的账户，在创建服务时会自动添加，并被授予 `default_role`。创建服务的用户在服务创建时会看到自动生成并随机分配给 `default` 账户的密码。该密码在初始设置之后将不会再次显示，但之后可以由控制台中具有 Service Admin 权限的任意用户进行修改。该账户或在控制台中具有 Service Admin 权限的账户可以在任何时间创建其他数据库用户和角色。

:::note
要在控制台中更改分配给 `default` 账户的密码，请在左侧进入 Services 菜单，打开对应服务，进入 Settings 选项卡，然后点击 Reset password 按钮。
:::

我们建议创建一个与具体个人关联的新用户账户，并为该用户授予 `default_role`。这样可以确保用户执行的操作能够映射到其各自的用户 ID，同时将 `default` 账户保留用于紧急兜底（break-glass）类操作场景。

```sql
  CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
  GRANT default_role to userID;
```

用户可以使用 SHA256 哈希生成器，或使用 Python 中的 `hashlib` 等函数，将一个长度不少于 12 个字符且复杂度足够的密码转换为 SHA256 字符串，并以该字符串作为密码传递给系统管理员。这样可以确保管理员不会看到或接触明文密码。


### 使用 SQL 控制台用户生成数据库访问清单 \{#database-access-listings-with-sql-console-users\}

以下流程可用于在你的组织中生成涵盖 SQL 控制台及各数据库的完整访问清单。

<VerticalStepper headerLevel="h4">

#### 获取所有数据库授权列表 \{#get-a-list-of-all-database-grants\}

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

#### 将授权列表关联到拥有 SQL 控制台访问权限的 Console 用户 \{#associate-grant-list-to-console-users-with-access-to-sql-console\}

将此列表与拥有 SQL 控制台访问权限的 Console 用户进行关联。
   
a. 进入 Console。

b. 选择相关的服务（service）。

c. 在左侧选择设置（Settings）。

d. 向下滚动到 SQL console access 部分。

e. 点击显示具有该服务数据库访问权限用户数量的链接 `There are # users with access to this service.`，以查看用户列表。

</VerticalStepper>

## Warehouse users \{#warehouse-users\}

Warehouse 用户在同一 Warehouse 内由各服务共享。有关详细信息，请参阅 [Warehouse 访问控制](/cloud/reference/warehouses#access-controls)。