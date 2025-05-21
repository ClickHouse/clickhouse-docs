---
'sidebar_label': '概述'
'slug': '/cloud/security/cloud-access-management/overview'
'title': '云访问管理'
'description': '描述 ClickHouse 云中访问控制的工作方式，包括角色类型信息'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';


# ClickHouse Cloud 的访问控制 {#access-control-in-clickhouse-cloud}
ClickHouse 在两个地方控制用户访问：通过控制台和通过数据库。控制台访问通过 clickhouse.cloud 用户界面进行管理。数据库访问通过数据库用户帐户和角色进行管理。此外，控制台用户可以在数据库中被授予角色，以便允许控制台用户通过我们的 SQL 控制台与数据库进行交互。

## 控制台用户和角色 {#console-users-and-roles}
在控制台 > 用户和角色页面中配置组织和服务角色分配。在每个服务的设置页面中配置 SQL 控制台角色分配。

用户必须被分配一个组织级别的角色，并可以选择性地被分配一个或多个服务角色。服务角色可以在服务设置页面中可选地配置，以允许用户访问 SQL 控制台。
- 被分配组织管理员角色的用户默认被授予服务管理员。
- 通过 SAML 集成添加到组织的用户会被自动分配为成员角色。
- 服务管理员默认被分配 SQL 控制台管理员角色。服务设置页面中可以移除 SQL 控制台权限。


| 上下文       | 角色                   | 描述                                        |
|:-------------|:-----------------------|:---------------------------------------------|
| 组织         | 管理员                 | 执行组织的所有管理活动并控制所有设置。 默认情况下分配给组织中的第一个用户。 |
| 组织         | 开发者                 | 除服务外对一切事物的查看访问权限，能够生成只读 API 密钥。 |
| 组织         | 账单                   | 查看使用情况和发票，并管理支付方式。 |
| 组织         | 成员                   | 仅限登录，能够管理个人资料设置。 默认情况下分配给 SAML SSO 用户。 |
| 服务         | 服务管理员            | 管理服务设置。                       |
| 服务         | 服务只读              | 查看服务和设置。                     |
| SQL 控制台   | SQL 控制台管理员      | 对服务内数据库的行政访问权限，相当于默认数据库角色。 |
| SQL 控制台   | SQL 控制台只读        | 对服务内数据库的只读访问权限 |
| SQL 控制台   | 自定义                 | 使用 SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置；通过将角色命名为用户来分配角色给 SQL 控制台用户 |
  
要为 SQL 控制台用户创建自定义角色并授予其一般角色，请运行以下命令。电子邮件地址必须与控制台中用户的电子邮件地址匹配。 
    
1. 创建 database_developer 角色并授予 `SHOW`、`CREATE`、`ALTER` 和 `DELETE` 权限。
    
```sql
    CREATE ROLE OR REPLACE database_developer;
    GRANT SHOW ON * TO database_developer;
    GRANT CREATE ON * TO database_developer;
    GRANT ALTER ON * TO database_developer;
    GRANT DELETE ON * TO database_developer;
```
    
2. 为 SQL 控制台用户 my.user@domain.com 创建角色，并分配 database_developer 角色。
    
```sql
    CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
    GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

### SQL 控制台无密码认证 {#sql-console-passwordless-authentication}
SQL 控制台用户为每个会话创建，并使用自动轮换的 X.509 证书进行身份验证。会话终止时，用户将被移除。在生成审核的访问列表时，请导航到控制台中服务的设置选项卡，并注意 SQL 控制台访问以及数据库中存在的数据库用户。如果配置了自定义角色，用户的访问权限会列在以用户用户名结尾的角色中。

## 数据库权限 {#database-permissions}
使用 SQL [GRANT](/sql-reference/statements/grant) 语句在服务和数据库中配置以下内容。

| 角色                | 描述                                                                  |
|:--------------------|:-----------------------------------------------------------------------|
| 默认                | 对服务的完全行政访问权限                                             |
| 自定义              | 使用 SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置 |


- 数据库角色是累加的。这意味着如果用户是两个角色的成员，则用户将获得两个角色中最广泛的访问权限。添加角色不会使他们失去访问权限。
- 数据库角色可以被授予其他角色，从而形成层次结构。角色继承其成员的所有权限。
- 数据库角色在每个服务中是唯一的，并且可以在同一服务中的多个数据库中应用。

以下插图显示了用户可以通过不同方式获得权限。

<Image img={user_grant_permissions_options} alt='一幅插图显示用户可以通过不同方式获得权限' size="md" background="black"/>

### 初始设置 {#initial-settings} 
数据库中有一个名为 `default` 的帐户，该帐户在服务创建时自动添加并授予 default_role。创建服务的用户在服务创建时获得分配给 `default` 帐户的自动生成的随机密码。初始设置后，密码不再显示，但任何具有服务管理员权限的用户可以在控制台中随时更改。此帐户或在控制台中具有服务管理员权限的帐户可以随时设置额外的数据库用户和角色。

:::note
要更改控制台中 `default` 帐户分配的密码，请转到左侧的服务菜单，访问服务，转到设置选项卡并单击重置密码按钮。
:::

我们建议创建一个与某个人相关联的新用户帐户，并授予用户 default_role。这是为了使用户执行的活动与他们的用户 ID 相关联，并将 `default` 帐户保留用于紧急活动。 

```sql
  CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
  GRANT default_role to userID;
```

用户可以使用 SHA256 哈希生成器或如 Python 中的 `hashlib` 等代码功能，将适当复杂的 12+ 字符密码转换为 SHA256 字符串，并提供给系统管理员作为密码。这确保管理员不会查看或处理明文密码。

### 带 SQL 控制台用户的数据库访问列表 {#database-access-listings-with-sql-console-users}
可以使用以下过程生成您组织中 SQL 控制台和数据库的完整访问列表。

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
    
2. 将此列表关联到具有 SQL 控制台访问权限的控制台用户。
   
    a. 转到控制台。

    b. 选择相关服务。

    c. 在左侧选择设置。

    d. 滚动到 SQL 控制台访问部分。

    e. 单击有关数据库访问的用户数量的链接 `There are # users with access to this service.` 以查看用户列表。
