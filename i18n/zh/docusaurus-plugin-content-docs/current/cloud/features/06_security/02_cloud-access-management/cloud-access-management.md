---
'sidebar_label': '概览'
'slug': '/cloud/security/cloud-access-management/overview'
'title': '云访问管理'
'description': '描述了 ClickHouse 云中访问控制是如何工作的，包括角色类型的信息'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import user_grant_permissions_options from '@site/static/images/cloud/security/cloud-access-management/user_grant_permissions_options.png';


# 在 ClickHouse Cloud 中的访问控制 {#access-control-in-clickhouse-cloud}

ClickHouse Cloud 控制对控制台本身及其内部可用功能的访问。
**控制台用户** 是这种访问的基础，所有权限、角色和访问控制通过这些用户分配和管理。
当 [与控制台用户关联的数据库级权限](/cloud/security/common-access-management-queries#modifying-users-and-roles) 存在时，它们将管理通过 SQL 控制台查询时的数据访问。

## 控制台用户和角色 {#console-users-and-roles}

在控制台 > 用户和角色页面中 [配置组织和服务角色分配](/cloud/guides/sql-console/configure-org-service-role-assignments)。
在每个服务的设置页面中 [配置 SQL 控制台角色分配](/cloud/guides/sql-console/config-sql-console-role-assignments)。

用户必须被分配一个组织级角色，并可以选择性地被分配一个或多个服务角色。可以选择性地为用户配置服务角色，以便他们在服务设置页面访问 SQL 控制台。
- 被分配组织管理员角色的用户默认会获得服务管理员权限。
- 通过 SAML 集成添加到组织的用户会自动被分配会员角色，以最小权限访问，且在配置之前无法访问任何服务。
- 服务管理员默认被分配 SQL 控制台管理员角色。可以在服务设置页面中移除 SQL 控制台权限。

| 上下文         | 角色                     | 描述                                           |
|:--------------|:-------------------------|:-----------------------------------------------|
| 组织          | 管理员                  | 执行组织的所有管理活动并控制所有设置。默认分配给组织中的第一个用户。 |
| 组织          | 开发者                  | 查看访问所有内容，但不能访问服务，有权生成只读 API 密钥。 |
| 组织          | 账单                    | 查看使用情况和发票，并管理付款方式。              |
| 组织          | 会员                    | 仅能登录，具有管理个人资料设置的能力。默认分配给 SAML SSO 用户。 |
| 服务          | 服务管理员             | 管理服务设置。                                |
| 服务          | 服务只读               | 查看服务和设置。                              |
| SQL 控制台    | SQL 控制台管理员       | 对服务中的数据库具有相当于默认数据库角色的管理访问权限。 |
| SQL 控制台    | SQL 控制台只读         | 对服务中的数据库具有只读访问权限                 |
| SQL 控制台    | 自定义                  | 使用 SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置；通过以用户命名角色来将角色分配给 SQL 控制台用户 |
  
要为 SQL 控制台用户创建自定义角色并授予它一个通用角色，请运行以下命令。电子邮件地址必须与控制台中用户的电子邮件地址匹配。

<VerticalStepper headerLevel="h4">

#### 创建 `database_developer` 并授予权限 {#create-database_developer-and-grant-permissions}

创建 `database_developer` 角色并授予 `SHOW`、`CREATE`、`ALTER` 和 `DELETE` 权限。
    
```sql
CREATE ROLE OR REPLACE database_developer;
GRANT SHOW ON * TO database_developer;
GRANT CREATE ON * TO database_developer;
GRANT ALTER ON * TO database_developer;
GRANT DELETE ON * TO database_developer;
```

#### 创建 SQL 控制台用户角色 {#create-sql-console-user-role}

为 SQL 控制台用户 my.user@domain.com 创建一个角色并将其分配为 database_developer 角色。
    
```sql
CREATE ROLE OR REPLACE `sql-console-role:my.user@domain.com`;
GRANT database_developer TO `sql-console-role:my.user@domain.com`;
```

</VerticalStepper>

### SQL 控制台无密码身份验证 {#sql-console-passwordless-authentication}
为每个会话创建 SQL 控制台用户，并使用自动轮换的 X.509 证书进行身份验证。当会话终止时，用户将被移除。在生成审计的访问列表时，请导航到控制台中服务的设置选项卡，并记录 SQL 控制台访问和存在于数据库中的数据库用户。如果配置了自定义角色，则用户的访问权限将列在以用户的用户名结尾的角色中。

## 数据库权限 {#database-permissions}
在服务和数据库中使用 SQL [GRANT](/sql-reference/statements/grant) 语句配置以下内容。

| 角色                   | 描述                                                                       |
|:----------------------|:---------------------------------------------------------------------------|
| 默认                  | 对服务的全面管理访问                                                       |
| 自定义                | 使用 SQL [`GRANT`](/sql-reference/statements/grant) 语句进行配置         |

- 数据库角色是加法的。这意味着如果用户是两个角色的成员，则用户具有这两个角色中授予的最大访问权限。添加角色不会失去访问权限。
- 数据库角色可以被授予其他角色，从而形成层次结构。角色继承其成员角色的所有权限。
- 数据库角色在每个服务中是唯一的，并且可以在同一服务中的多个数据库之间应用。

下图示例展示了用户可以以不同方式被授予权限。

<Image img={user_grant_permissions_options} alt='An illustration showing the different ways a user could be granted permissions' size="md" background="black"/>

### 初始设置 {#initial-settings} 
数据库具有一个名为 `default` 的账户，自动添加并在服务创建时授予 default_role。在创建服务时，由创建服务的用户提供分配给 `default` 账户的自动生成的随机密码。初始设置后不再显示该密码，但任何具有服务管理员权限的用户可以在控制台中随时更改。此账户或控制台中具有服务管理员权限的账户可以在任何时候设置额外的数据库用户和角色。

:::note
要在控制台中更改分配给 `default` 账户的密码，请转到左侧的服务菜单，访问服务，转到设置选项卡，然后点击重置密码按钮。
:::

我们建议创建一个与某个人关联的新用户账户，并授予该用户 default_role。这样可以确保用户所执行的活动与其用户 ID 相关联，同时保留 `default` 账户用于应急活动。

```sql
CREATE USER userID IDENTIFIED WITH sha256_hash by 'hashed_password';
GRANT default_role to userID;
```

用户可以使用 SHA256 哈希生成器或 Python 中的 `hashlib` 等代码函数，将具有适当复杂度的 12 个以上字符的密码转换为 SHA256 字符串，以提供给系统管理员作为密码。这确保了管理员不会看到或处理明文密码。

### 与 SQL 控制台用户的数据库访问列表 {#database-access-listings-with-sql-console-users}
可以使用以下过程生成您组织中 SQL 控制台和数据库的完整访问列表。

<VerticalStepper headerLevel="h4">

#### 获取所有数据库授予的列表 {#get-a-list-of-all-database-grants}

运行以下查询以获取数据库中所有授予的列表。

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

#### 将授予列表与访问 SQL 控制台的控制台用户关联 {#associate-grant-list-to-console-users-with-access-to-sql-console}

将此列表与可以访问 SQL 控制台的控制台用户关联。
   
a. 转到控制台。

b. 选择相关服务。

c. 在左侧选择设置。

d. 滚动到 SQL 控制台访问部分。

e. 单击有关访问数据库的用户数量的链接 `There are # users with access to this service.` 以查看用户列表。

</VerticalStepper>
