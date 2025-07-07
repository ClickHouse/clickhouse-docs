---
'sidebar_label': '概述'
'slug': '/cloud/security/cloud-access-management/overview'
'title': '云访问管理'
'description': '描述了 ClickHouse 云中访问控制如何工作，包括角色类型的信息'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';


# Access control in ClickHouse Cloud {#access-control-in-clickhouse-cloud}
ClickHouse 在两个地方控制用户访问: 通过控制台和通过数据库。控制台访问通过 clickhouse.cloud 用户界面管理。数据库访问通过数据库用户账户和角色管理。此外，可以在数据库中授予控制台用户角色，使控制台用户能够通过我们的 SQL 控制台与数据库交互。

## Console users and roles {#console-users-and-roles}
在控制台 > 用户和角色页面中配置组织和服务角色分配。在每个服务的设置页面中配置 SQL 控制台角色分配。

用户必须被分配一个组织级别的角色，并可以选择性地为一个或多个服务分配服务角色。可以选择性地为用户在服务设置页面中配置服务角色以访问 SQL 控制台。
- 被分配为组织管理员角色的用户默认获得服务管理员角色。
- 通过 SAML 集成添加到组织的用户会自动分配为成员角色。
- 服务管理员默认被分配为 SQL 控制台管理员角色。SQL 控制台权限可以在服务设置页面中移除。

| Context      | Role                   | Description                                      |
|:-------------|:-----------------------|:-------------------------------------------------|
| Organization | Admin                  | 执行组织的所有管理活动并控制所有设置。默认分配给组织中的第一个用户。 |
| Organization | Developer             | 查看对除了服务以外的所有内容的访问权限，有能力生成只读 API 密钥。 |
| Organization | Billing               | 查看使用情况和发票，并管理付款方式。 |
| Organization | Member                | 仅能登录，能够管理个人档案设置。默认分配给 SAML SSO 用户。 |
| Service      | Service Admin         | 管理服务设置。                        |
| Service      | Service Read Only     | 查看服务和设置。                     |
| SQL console  | SQL console admin     | 对服务中的数据库具有管理员访问权限，等同于默认数据库角色。 |
| SQL console  | SQL console read only | 对服务中的数据库具有只读访问权限。 |
| SQL console  | Custom                | 使用 SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置；通过为用户命名角色为用户的 SQL 控制台用户分配角色。 |
  
要为 SQL 控制台用户创建自定义角色并授予一般角色，请运行以下命令。电子邮件地址必须与控制台中用户的电子邮件地址匹配。
    
1. 创建 database_developer 角色并授予 `SHOW`、`CREATE`、`ALTER` 和 `DELETE` 权限。
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```
    
2. 为 SQL 控制台用户 my.user@domain.com 创建一个角色并将其分配给 database_developer 角色。
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

### SQL console passwordless authentication {#sql-console-passwordless-authentication}
SQL 控制台用户在每个会话中创建，并使用自动轮换的 X.509 证书进行身份验证。用户在会话结束时被移除。在生成审计的访问列表时，请导航到控制台服务的设置选项卡，并注意 SQL 控制台访问以及数据库中存在的数据库用户。如果配置了自定义角色，用户的访问将在以用户用户名结尾的角色中列出。

## Database permissions {#database-permissions}
使用 SQL [GRANT](/sql-reference/statements/grant) 语句在服务和数据库中配置以下内容。

| Role                  | Description                                                                   |
|:----------------------|:------------------------------------------------------------------------------|
| Default               | 对服务具有完全的管理访问权限                                                |
| Custom                | 使用 SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置            |


- 数据库角色是累加的。这意味着如果用户是两个角色的成员，该用户将获得两个角色授予的最大访问权限。添加角色不会失去访问权限。
- 数据库角色可以授予其他角色，形成层次结构。角色会继承其成员角色的所有权限。
- 数据库角色在每个服务中是唯一的，并且可以在同一服务中的多个数据库中应用。

下图显示了授予用户权限的不同方式。

<Image img={user_grant_permissions_options} alt='An illustration showing the different ways a user could be granted permissions' size="md" background="black"/>

### Initial settings {#initial-settings} 
数据库中有一个名为 `default` 的账户，该账户在服务创建时自动添加并授予 default_role。创建服务的用户会看到为 `default` 账户分配的自动生成的随机密码。初始设置后不会显示密码，但任何具有服务管理员权限的用户都可以在控制台中稍后更改此密码。该账户或在控制台中具有服务管理员权限的账户可以随时设置其他数据库用户和角色。

:::note
要在控制台中更改分配给 `default` 账户的密码，请转到左侧的服务菜单，访问服务，进入设置选项卡并单击重置密码按钮。
:::

我们建议创建一个与个人关联的新用户账户，并将 default_role 授予该用户。这是为了将用户执行的活动标识到其用户 ID，并且保留 `default` 账户用于紧急操作。

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

用户可以使用 SHA256 哈希生成器或 Python 中的 `hashlib` 等代码函数，将具有适当复杂度的 12 个以上字符的密码转换为 SHA256 字符串，以提供给系统管理员作为密码。这可确保管理员不会看到或处理明文密码。

### Database access listings with SQL console users {#database-access-listings-with-sql-console-users}
可以使用以下过程生成组织中 SQL 控制台和数据库的完整访问列表。

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
    
2. 将此列表与访问 SQL 控制台的控制台用户关联。
   
    a. 转到控制台。

    b. 选择相关服务。

    c. 在左侧选择设置。

    d. 滚动到 SQL 控制台访问部分。

    e. 单击具有访问数据库的用户数量的链接 `There are # users with access to this service.` 以查看用户列表。
