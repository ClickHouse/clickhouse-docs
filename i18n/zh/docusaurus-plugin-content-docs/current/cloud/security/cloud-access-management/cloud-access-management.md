---
sidebar_label: '概述'
slug: /cloud/security/cloud-access-management/overview
title: '云访问管理'
---


# ClickHouse Cloud 中的访问控制
ClickHouse 在两个地方控制用户访问：通过控制台和通过数据库。控制台访问通过 clickhouse.cloud 用户界面管理。数据库访问通过数据库用户账户和角色管理。此外，控制台用户可以在数据库中被授予角色，使控制台用户能够通过我们的 SQL 控制台与数据库进行交互。

## 角色类型 {#types-of-roles}
以下描述了可用的不同类型的角色：
- **控制台角色**       启用访问 clickhouse.cloud 控制台
- **数据库角色**      启用在单个服务内管理权限
- **SQL 控制台角色**   特殊命名的数据库角色，允许控制台用户通过 SQL 控制台访问具有分配权限的数据库。

## 预定义角色 {#predefined-roles}
ClickHouse Cloud 提供有限数量的预定义角色以启用访问管理。可以随时使用 [CREATE ROLE](/sql-reference/statements/create/role) 和 [GRANT](/sql-reference/statements/grant) 命令在数据库中创建额外的自定义数据库角色。

| 上下文       | 角色名称             | 描述                                                                                       |
|--------------|-----------------------|-------------------------------------------------------------------------------------------|
| 控制台       | Admin                 | 对 ClickHouse 组织的完全访问                                                              |
| 控制台       | Developer             | 对 ClickHouse 组织的只读访问                                                              | 
| 控制台       | Billing               | 查看账单和使用信息，管理付款方式和账单联系人                                             |
| SQL 控制台   | sql_console_admin     | 对数据库的管理员访问                                                                      |
| SQL 控制台   | sql_console_read_only | 对数据库的只读访问                                                                        |
| 数据库       | default               | 对数据库的管理员访问；在服务创建时自动授予 `default` 用户                                |

## 初始设置 {#initial-settings}
第一个设置 ClickHouse Cloud 账户的用户会自动获得控制台中的 Admin 角色。此用户可以邀请其他用户加入组织并将 Admin 或 Developer 角色分配给用户。

:::note
要在控制台中更改用户的角色，请转到左侧的用户菜单并在下拉菜单中更改用户的角色。
:::

数据库有一个名为 `default` 的账户，该账户在服务创建时自动添加并被授予 default_role。创建服务的用户会看到分配给 `default` 账户的自动生成的随机密码。初始设置后，密码将不再显示，但任何具有控制台 Admin 权限的用户可以在稍后更改此密码。此账户或控制台内具有 Admin 权限的账户可以随时设置其他数据库用户和角色。

:::note
要在控制台中更改分配给 `default` 账户的密码，请转到左侧的服务菜单，访问服务，转到设置选项卡并单击重置密码按钮。
:::

我们建议创建一个与个人关联的新用户账户并授予用户 default_role。这样可以识别用户执行的活动到他们的用户 ID，而保留 `default` 账户用于突发情况类型的活动。 

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

用户可以使用 SHA256 哈希生成器或如 `hashlib` 的代码函数（在 Python 中）将具有适当复杂度的 12 个字符以上的密码转换为 SHA256 字符串，以作为密码提供给系统管理员。这确保了管理员不会看到或处理明文密码。

## 控制台角色 {#console-roles}
控制台用户必须被分配一个角色，并可以分配 Admin 或 Developer 角色。每个角色相关的权限如下所示。

| 组件                             | 功能                       | Admin  | Developer | Billing |
|-----------------------------------|----------------------------|--------|-----------|---------|
| 管理服务                         | 查看服务                    |   ✅   |    ✅     |    ❌   |
|                                   | 创建服务                    |   ✅   |    ❌     |    ❌   |
|                                   | 删除服务                    |   ✅   |    ❌     |    ❌   |
|                                   | 停止服务                    |   ✅   |    ❌     |    ❌   |
|                                   | 重启服务                    |   ✅   |    ❌     |    ❌   |
|                                   | 重置服务密码                |   ✅   |    ❌     |    ❌   |
|                                   | 查看服务指标                |   ✅   |    ✅     |    ❌   |
| 云 API                           | 查看 API 密钥记录          |   ✅   |    ✅     |    ❌   |
|                                   | 创建 API 密钥              |   ✅   | 只读      |    ❌   |
|                                   | 删除 API 密钥              |   ✅   | 自有密钥   |    ❌   |
| 管理控制台用户                  | 查看用户                    |   ✅   |    ✅     |    ❌   |
|                                   | 邀请用户                    |   ✅   |    ❌     |    ❌   |
|                                   | 更改用户角色                |   ✅   |    ❌     |    ❌   |
|                                   | 删除用户                    |   ✅   |    ❌     |    ❌   |
| 计费、组织和支持                 | 查看账单                    |   ✅   |    ✅     |    ✅   |
|                                   | 管理账单                    |   ✅   |    ❌     |    ✅   |
|                                   | 查看组织活动                |   ✅   |    ❌     |    ✅   |
|                                   | 提交支持请求                |   ✅   |    ✅     |    ✅   |
|                                   | 查看集成                    |   ✅   |    ✅     |    ❌   |

## SQL 控制台角色 {#sql-console-roles}
我们的控制台包括一个 SQL 控制台，用于使用无密码身份验证与数据库交互。授予控制台 Admin 权限的用户对组织的所有数据库具有管理员访问权限。授予 Developer 角色的用户默认没有访问权限，但可以从控制台被分配 '完全访问' 或 '只读' 数据库权限。'只读' 角色最初授予账户只读访问权限。但是，一旦授予只读访问权限，可以为该 SQL 控制台用户创建一个专门的新自定义角色，并在通过 SQL 控制台连接到数据库时与该用户相关联。

:::note
要允许控制台中具有 Developer 角色的用户访问 SQL 控制台，请转到左侧的服务菜单，访问服务，单击设置，向下滚动到 SQL 控制台访问部分，然后选择 '完全访问' 或 '只读'。授予访问权限后，使用下面的 ***创建 SQL 控制台角色*** 中显示的过程分配自定义角色。
:::

### 更多关于无密码身份验证 {#more-on-passwordless-authentication}
SQL 控制台用户为每个会话创建并使用自动轮换的 X.509 证书进行身份验证。会话终止后用户将被移除。在生成审核的访问列表时，请导航到控制台中服务的设置选项卡，并注意 SQL 控制台访问以及数据库中存在的数据库用户。如果配置了自定义角色，则该用户的访问权限在角色中列出，角色以用户的用户名结尾。

## 创建 SQL 控制台角色 {#creating-sql-console-roles}
可以创建自定义角色并与 SQL 控制台用户关联。由于 SQL 控制台每次用户打开新会话时都会创建一个新的用户账户，系统使用角色命名约定将自定义数据库角色与用户关联。这意味着每个用户被分配一个单独的角色。可以通过 GRANT 语句直接分配这些单独的角色的访问权限，或者用户可以建立新的通用角色，例如 database_developer 或 security_administrator，并通过更通用的角色分配单独用户角色的访问权限。

要为 SQL 控制台用户创建自定义角色并授予它一个通用角色，请运行以下命令。电子邮件地址必须与控制台中用户的电子邮件地址匹配。 
1. 创建 database_developer 角色，并授予 SHOW、CREATE、ALTER 和 DELETE 权限。

```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

2. 为 SQL 控制台用户 my.user@domain.com 创建角色并将其分配为 database_developer 角色。

```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

使用此角色构造时，查询以显示用户访问权限需要修改，以包括当用户不存在时的角色到角色授予。

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

## 数据库角色 {#database-roles}
也可以使用 CREATE User、CREATE Role 和 GRANT 语句在数据库内直接创建用户和自定义角色。除了为 SQL 控制台创建的角色外，这些用户和角色与控制台用户和角色是独立的。

数据库角色是累加的。这意味着如果用户是两个角色的成员，则用户拥有这两个角色所授予的最大访问权限。添加角色不会使其失去访问权限。

数据库角色可以授予其他角色，从而形成层次结构。角色继承其成员的所有权限。

数据库角色在每个服务中是唯一的，可以跨同一服务中的多个数据库应用。

下面的插图显示了用户可以授予权限的不同方式。

![Screenshot 2024-01-18 at 5 14 41 PM](https://github.com/ClickHouse/clickhouse-docs/assets/110556185/94b45f98-48cc-4907-87d8-5eff1ac468e5)
