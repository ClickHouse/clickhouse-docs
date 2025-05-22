---
sidebar_label: '概览'
slug: /cloud/security/cloud-access-management/overview
title: '云访问管理'
description: '描述 ClickHouse 云中访问控制的工作方式，包括角色类型信息'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';

# ClickHouse Cloud中的访问控制 {#access-control-in-clickhouse-cloud}
ClickHouse在两个地方控制用户访问：通过控制台和通过数据库。控制台访问由clickhouse.cloud用户界面管理。数据库访问则由数据库用户账户和角色管理。此外，控制台用户可以被授予不同的角色，使其能够通过我们的SQL控制台与数据库进行交互。

## 控制台用户和角色 {#console-users-and-roles}
在控制台 > 用户和角色页面中配置组织和服务角色分配。在每个服务的设置页面中配置SQL控制台角色分配。

用户必须被分配一个组织级角色，并且可以选择性地为一个或多个服务分配服务角色。服务角色可以选配配置，以便用户能够在服务设置页面中访问SQL控制台。
- 被分配为组织管理员角色的用户默认授予服务管理员角色。
- 通过SAML集成添加到组织的用户自动分配为成员角色。
- 服务管理员默认被分配为SQL控制台管理员角色。可以在服务设置页面中移除SQL控制台权限。


| 上下文       | 角色                   | 描述                                      |
|:-------------|:-----------------------|:-----------------------------------------|
| 组织        | 管理员                  | 执行组织的所有管理活动并控制所有设置。默认分配给组织中的第一个用户。 |
| 组织        | 开发者                  | 查看除服务外的所有内容，并能够生成只读API密钥。 |
| 组织        | 账单                    | 查看使用情况和发票，并管理付款方式。   |
| 组织        | 成员                    | 仅登录，能够管理个人个人资料设置。默认分配给SAML SSO用户。 |
| 服务        | 服务管理员             | 管理服务设置。                          |
| 服务        | 服务只读               | 查看服务和设置。                        |
| SQL控制台   | SQL控制台管理员         | 对服务中的数据库具有等同于默认数据库角色的管理访问权限。 |
| SQL控制台   | SQL控制台只读           | 对服务中的数据库具有只读访问权限。      |
| SQL控制台   | 自定义                   | 使用SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置；将角色分配给SQL控制台用户，角色名称与用户同名 |
  
要为SQL控制台用户创建自定义角色并授予通用角色，请运行以下命令。电子邮件地址必须与控制台中的用户电子邮件地址匹配。 

1. 创建database_developer角色，并授予`SHOW`、`CREATE`、`ALTER`和`DELETE`权限。
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```
    
2. 为SQL控制台用户my.user@domain.com创建一个角色，并将其分配database_developer角色。
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

### SQL控制台无密码身份验证 {#sql-console-passwordless-authentication}
每个会话都会为SQL控制台用户创建并使用自动轮换的X.509证书进行身份验证。会话终止时用户会被移除。在生成审计访问列表时，请导航到控制台中服务的设置选项卡，并记录SQL控制台访问和数据库中存在的数据库用户。如果配置了自定义角色，则用户的访问列在以用户的用户名结尾的角色中。

## 数据库权限 {#database-permissions}
使用SQL [GRANT](/sql-reference/statements/grant) 语句在服务和数据库中配置以下内容。

| 角色                 | 描述                                                                   |
|:----------------------|:-------------------------------------------------------------------------|
| 默认                  | 对服务具有完全的管理访问权限                                          |
| 自定义                | 使用SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置 |


- 数据库角色是累加的。这意味着如果用户是两个角色的成员，用户将拥有这两个角色授予的最多权限。添加角色不会减少访问权限。
- 数据库角色可以授予其他角色，从而形成层次结构。角色继承其成员角色的所有权限。
- 数据库角色在每个服务中是唯一的，并且可以在同一服务的多个数据库中应用。

下面的插图展示了用户可以获得权限的不同方式。

<Image img={user_grant_permissions_options} alt='展示用户获取权限的不同方式的插图' size="md" background="black"/>

### 初始设置 {#initial-settings} 
数据库有一个名为`default`的账户，该账户在服务创建时自动添加并授予default_role。创建服务的用户会在服务创建时看到自动生成的随机密码，该密码分配给`default`账户。初始设置后不会显示密码，但以后任何具有服务管理员权限的用户都可以在控制台中进行更改。该账户或具有服务管理员权限的账户可以随时设置其他数据库用户和角色。

:::note
要更改分配给控制台中`default`账户的密码，请转到左侧的服务菜单，访问该服务，转到设置选项卡，然后单击重置密码按钮。
:::

我们建议创建一个与个人关联的新用户账户，并授予该用户default_role。这样用户执行的活动就可以被识别到他们的用户ID，并且`default`账户保留用于紧急情况活动。 

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

用户可以使用SHA256哈希生成器或类似于Python中的`hashlib`的代码函数，将一个具有适当复杂度的12个字符以上的密码转换为SHA256字符串，并将该字符串提供给系统管理员作为密码。这样管理人员就不会看到或处理明文密码。

### 使用SQL控制台用户的数据库访问列表 {#database-access-listings-with-sql-console-users}
可以使用以下过程生成组织中SQL控制台和数据库的完整访问列表。

1. 运行以下查询以获取数据库中所有授权的列表。 

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
    
2. 将此列表与具有SQL控制台访问权限的控制台用户相关联。
   
    a. 转到控制台。

    b. 选择相关服务。

    c. 在左侧选择设置。

    d. 滚动到SQL控制台访问部分。

    e. 单击“访问该服务的用户数量”的链接`There are # users with access to this service.`以查看用户列表。
