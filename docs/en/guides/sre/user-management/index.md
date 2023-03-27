---
slug: /en/operations/access-rights
sidebar_position: 1
sidebar_label: Users and Roles
title: Access Control and Account Management
---

# Creating Users and Roles in ClickHouse

ClickHouse supports access control management based on [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) approach.

ClickHouse access entities:
- [User account](#user-account-management)
- [Role](#role-management)
- [Row Policy](#row-policy-management)
- [Settings Profile](#settings-profiles-management)
- [Quota](#quotas-management)

You can configure access entities using:

-   SQL-driven workflow.

    You need to [enable](#enabling-access-control) this functionality.

-   Server [configuration files](/docs/en/operations/configuration-files.md) `users.xml` and `config.xml`.

We recommend using SQL-driven workflow. Both of the configuration methods work simultaneously, so if you use the server configuration files for managing accounts and access rights, you can smoothly switch to SQL-driven workflow.

:::note
You can’t manage the same access entity by both configuration methods simultaneously.
:::

To see all users, roles, profiles, etc. and all their grants use [SHOW ACCESS](/docs/en/sql-reference/statements/show.md#show-access-statement) statement.

## Overview {#access-control-usage}

By default, the ClickHouse server provides the `default` user account which is not allowed using SQL-driven access control and account management but has all the rights and permissions. The `default` user account is used in any cases when the username is not defined, for example, at login from client or in distributed queries. In distributed query processing a default user account is used, if the configuration of the server or cluster does not specify the [user and password](/docs/en/engines/table-engines/special/distributed.md) properties.

If you just started using ClickHouse, consider the following scenario:

1.  [Enable](#enabling-access-control) SQL-driven access control and account management for the `default` user.
2.  Log in to the `default` user account and create all the required users. Don’t forget to create an administrator account (`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`).
3.  [Restrict permissions](/docs/en/operations/settings/permissions-for-queries.md#permissions_for_queries) for the `default` user and disable SQL-driven access control and account management for it.

### Properties of Current Solution {#access-control-properties}

-   You can grant permissions for databases and tables even if they do not exist.
-   If a table was deleted, all the privileges that correspond to this table are not revoked. This means that even if you create a new table with the same name later, all the privileges remain valid. To revoke privileges corresponding to the deleted table, you need to execute, for example, the `REVOKE ALL PRIVILEGES ON db.table FROM ALL` query.
-   There are no lifetime settings for privileges.

### User Account {#user-account-management}

A user account is an access entity that allows to authorize someone in ClickHouse. A user account contains:

-   Identification information.
-   [Privileges](/docs/en/sql-reference/statements/grant.md#grant-privileges) that define a scope of queries the user can execute.
-   Hosts allowed to connect to the ClickHouse server.
-   Assigned and default roles.
-   Settings with their constraints applied by default at user login.
-   Assigned settings profiles.

Privileges can be granted to a user account by the [GRANT](/docs/en/sql-reference/statements/grant.md) query or by assigning [roles](#role-management). To revoke privileges from a user, ClickHouse provides the [REVOKE](/docs/en/sql-reference/statements/revoke.md) query. To list privileges for a user, use the [SHOW GRANTS](/docs/en/sql-reference/statements/show.md#show-grants-statement) statement.

Management queries:

-   [CREATE USER](/docs/en/sql-reference/statements/create/user.md)
-   [ALTER USER](/docs/en/sql-reference/statements/alter/user.md#alter-user-statement)
-   [DROP USER](/docs/en/sql-reference/statements/drop.md)
-   [SHOW CREATE USER](/docs/en/sql-reference/statements/show.md#show-create-user-statement)
-   [SHOW USERS](/docs/en/sql-reference/statements/show.md#show-users-statement)

### Settings Applying {#access-control-settings-applying}

Settings can be configured differently: for a user account, in its granted roles and in settings profiles. At user login, if a setting is configured for different access entities, the value and constraints of this setting are applied as follows (from higher to lower priority):

1.  User account settings.
2.  The settings of default roles of the user account. If a setting is configured in some roles, then order of the setting application is undefined.
3.  The settings from settings profiles assigned to a user or to its default roles. If a setting is configured in some profiles, then order of setting application is undefined.
4.  Settings applied to all the server by default or from the [default profile](/docs/en/operations/server-configuration-parameters/settings.md#default-profile).

### Role {#role-management}

Role is a container for access entities that can be granted to a user account.

Role contains:

-   [Privileges](/docs/en/sql-reference/statements/grant.md#grant-privileges)
-   Settings and constraints
-   List of assigned roles

Management queries:

-   [CREATE ROLE](/docs/en/sql-reference/statements/create/role.md)
-   [ALTER ROLE](/docs/en/sql-reference/statements/alter/role.md#alter-role-statement)
-   [DROP ROLE](/docs/en/sql-reference/statements/drop.md)
-   [SET ROLE](/docs/en/sql-reference/statements/set-role.md)
-   [SET DEFAULT ROLE](/docs/en/sql-reference/statements/set-role.md#set-default-role-statement)
-   [SHOW CREATE ROLE](/docs/en/sql-reference/statements/show.md#show-create-role-statement)
-   [SHOW ROLES](/docs/en/sql-reference/statements/show.md#show-roles-statement)

Privileges can be granted to a role by the [GRANT](/docs/en/sql-reference/statements/grant.md) query. To revoke privileges from a role ClickHouse provides the [REVOKE](/docs/en/sql-reference/statements/revoke.md) query.

#### Row Policy {#row-policy-management}

Row policy is a filter that defines which of the rows are available to a user or a role. Row policy contains filters for one particular table, as well as a list of roles and/or users which should use this row policy.

:::note
Row policies makes sense only for users with readonly access. If user can modify table or copy partitions between tables, it defeats the restrictions of row policies.
:::

Management queries:

-   [CREATE ROW POLICY](/docs/en/sql-reference/statements/create/row-policy.md)
-   [ALTER ROW POLICY](/docs/en/sql-reference/statements/alter/row-policy.md#alter-row-policy-statement)
-   [DROP ROW POLICY](/docs/en/sql-reference/statements/drop.md#drop-row-policy-statement)
-   [SHOW CREATE ROW POLICY](/docs/en/sql-reference/statements/show.md#show-create-row-policy-statement)
-   [SHOW POLICIES](/docs/en/sql-reference/statements/show.md#show-policies-statement)

### Settings Profile {#settings-profiles-management}

Settings profile is a collection of [settings](/docs/en/operations/settings/index.md). Settings profile contains settings and constraints, as well as a list of roles and/or users to which this profile is applied.

Management queries:

-   [CREATE SETTINGS PROFILE](/docs/en/sql-reference/statements/create/settings-profile.md#create-settings-profile-statement)
-   [ALTER SETTINGS PROFILE](/docs/en/sql-reference/statements/alter/settings-profile.md#alter-settings-profile-statement)
-   [DROP SETTINGS PROFILE](/docs/en/sql-reference/statements/drop.md#drop-settings-profile-statement)
-   [SHOW CREATE SETTINGS PROFILE](/docs/en/sql-reference/statements/show.md#show-create-settings-profile-statement)
-   [SHOW PROFILES](/docs/en/sql-reference/statements/show.md#show-profiles-statement)

### Quota {#quotas-management}

Quota limits resource usage. See [Quotas](/docs/en/operations/quotas.md).

Quota contains a set of limits for some durations, as well as a list of roles and/or users which should use this quota.

Management queries:

-   [CREATE QUOTA](/docs/en/sql-reference/statements/create/quota.md)
-   [ALTER QUOTA](/docs/en/sql-reference/statements/alter/quota.md#alter-quota-statement)
-   [DROP QUOTA](/docs/en/sql-reference/statements/drop.md#drop-quota-statement)
-   [SHOW CREATE QUOTA](/docs/en/sql-reference/statements/show.md#show-create-quota-statement)
-   [SHOW QUOTA](/docs/en/sql-reference/statements/show.md#show-quota-statement)
-   [SHOW QUOTAS](/docs/en/sql-reference/statements/show.md#show-quotas-statement)

### Enabling SQL-driven Access Control and Account Management {#enabling-access-control}

-   Setup a directory for configurations storage.

    ClickHouse stores access entity configurations in the folder set in the [access_control_path](/docs/en/operations/server-configuration-parameters/settings.md#access_control_path) server configuration parameter.

-   Enable SQL-driven access control and account management for at least one user account.

    By default, SQL-driven access control and account management is disabled for all users. You need to configure at least one user in the `users.xml` configuration file and set the value of the [access_management](/docs/en/operations/settings/settings-users.md#access_management-user-setting) setting to 1.


## Defining SQL Users and Roles

:::tip
If you are working in ClickHouse Cloud please see [Cloud users and roles](/docs/en/cloud/manage/users-and-roles.md).
:::

This article shows the basics of defining SQL users and roles and applying those privileges and permissions to databases, tables, rows, and columns.

### Enabling SQL user mode

1.  Enable SQL user mode in the `users.xml` file under the `<default>` user:
    ```xml
    <access_management>1</access_management>
    ```

    :::note
    The `default` user is the only user that gets created with a fresh install and is also the account used for internode communications, by default.

    In production, it is recommended to disable this user once the inter-node communication has been configured with a SQL admin user and inter-node communications have been set with `<secret>`, cluster credentials, and/or internode HTTP and transport protocol credentials since the `default` account is used for internode communication.
    :::

2. Restart the nodes to apply the changes.

3. Start the ClickHouse client:
    ```sql
    clickhouse-client --user default --password <password>
    ```
### Defining users

1. Create a SQL administrator account:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. Grant the new user full administrative rights
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

<Content />



## ALTER permissions

This article is intended to provide you with a better understanding of how to define permissions, and how permissions work when using `ALTER` statements for privileged users.

The `ALTER` statements are divided into several categories, some of which are hierarchical and some of which are not and must be explicitly defined.


**Example DB, table and user configuration**
1. With an admin user, create a sample user
```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. Create sample database
```sql
CREATE DATABASE my_db;
```

3. Create a sample table
```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. Create a sample admin user to grant/revoke privileges
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
To grant or revoke permissions, the admin user must have the `WITH GRANT OPTION` privilege.
For example:
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
In order to GRANT or REVOKE privileges the user must have those privileges themselves first.
:::

**Granting or Revoking Privileges**

The `ALTER` hierarchy:

```
.
├── ALTER (only for table and view)/
│   ├── ALTER TABLE/
│   │   ├── ALTER UPDATE
│   │   ├── ALTER DELETE
│   │   ├── ALTER COLUMN/
│   │   │   ├── ALTER ADD COLUMN
│   │   │   ├── ALTER DROP COLUMN
│   │   │   ├── ALTER MODIFY COLUMN
│   │   │   ├── ALTER COMMENT COLUMN
│   │   │   ├── ALTER CLEAR COLUMN
│   │   │   └── ALTER RENAME COLUMN
│   │   ├── ALTER INDEX/
│   │   │   ├── ALTER ORDER BY
│   │   │   ├── ALTER SAMPLE BY
│   │   │   ├── ALTER ADD INDEX
│   │   │   ├── ALTER DROP INDEX
│   │   │   ├── ALTER MATERIALIZE INDEX
│   │   │   └── ALTER CLEAR INDEX
│   │   ├── ALTER CONSTRAINT/
│   │   │   ├── ALTER ADD CONSTRAINT
│   │   │   └── ALTER DROP CONSTRAINT
│   │   ├── ALTER TTL/
│   │   │   └── ALTER MATERIALIZE TTL
│   │   ├── ALTER SETTINGS
│   │   ├── ALTER MOVE PARTITION
│   │   ├── ALTER FETCH PARTITION
│   │   └── ALTER FREEZE PARTITION
│   └── ALTER LIVE VIEW/
│       ├── ALTER LIVE VIEW REFRESH
│       └── ALTER LIVE VIEW MODIFY QUERY
├── ALTER DATABASE
├── ALTER USER
├── ALTER ROLE
├── ALTER QUOTA
├── ALTER [ROW] POLICY
└── ALTER [SETTINGS] PROFILE
```

1. Granting `ALTER` Privileges to a User or Role

Using an `GRANT ALTER on *.* TO my_user` will only affect top-level `ALTER TABLE` and `ALTER VIEW` , other `ALTER` statements must be individually granted or revoked.

for example, granting basic `ALTER` privilege:
```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

Resulting set of privileges:
```sql
SHOW GRANTS FOR  my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 706befbc-525e-4ec1-a1a2-ba2508cc09e3

┌─GRANTS FOR my_user───────────────────────────────────────────┐
│ GRANT ALTER TABLE, ALTER VIEW ON my_db.my_table TO my_user   │
└──────────────────────────────────────────────────────────────┘
```

This will grant all permissions under `ALTER TABLE` and `ALTER VIEW` from the example above, however, it will not grant certain other `ALTER` permissions such as `ALTER ROW POLICY` (Refer back to the hierarchy and you will see that `ALTER ROW POLICY` is not a child of `ALTER TABLE` or `ALTER VIEW`). Those must be explicitly granted or revoked.

If only a subset of `ALTER` permissions is needed then each can be granted separately, if there are sub-privileges to that permission then those would be automatically granted also.

For example:
```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

Grants would be set as:
```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

This also gives the following sub-privileges:
```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. Revoking `ALTER` privileges from Users and Roles

The `REVOKE` statement works similarly to the `GRANT` statement.

If a user/role was granted a sub-privilege, you may either revoke that sub-privilege directly or can revoke the next upline privilege.

For example, if the user was granted `ALTER ADD COLUMN`
```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 61fe0fdc-1442-4cd6-b2f3-e8f2a853c739

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 27791226-a18f-46c8-b2b4-a9e64baeb683

┌─GRANTS FOR my_user──────────────────────────────────┐
│ GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user │
└─────────────────────────────────────────────────────┘
```

A privilege can be revoked individually:
```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

Or can be revoked from any of the upper levels (revoke all of the COLUMN sub privileges):
```
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user;
```

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user

Query id: b882ba1b-90fb-45b9-b10f-3cda251e2ccc

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: e7d341de-de65-490b-852c-fa8bb8991174

Ok.

0 rows in set. Elapsed: 0.003 sec.
```

**Additonal**
The privileges must be granted by a user that not only has the `WITH GRANT OPTION` but also has the privileges themselves.

1. To grant an admin user the privilege and also allow them to administer a set of privileges
Below is an example:
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

Now the user can grant or revoke `ALTER COLUMN` and all sub-privileges.

**Testing**

1. Add the `SELECT` privilege
```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. Add the add column privilege to the user
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. Log in with the restricted user
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. Test adding a column
```sql
ALTER TABLE my_db.my_table ADD COLUMN column2 String;
```

```response
ALTER TABLE my_db.my_table
    ADD COLUMN `column2` String

Query id: d5d6bfa1-b80c-4d9f-8dcd-d13e7bd401a5

Ok.

0 rows in set. Elapsed: 0.010 sec.
```

```sql
DESCRIBE my_db.my_table;
```

```response
DESCRIBE TABLE my_db.my_table

Query id: ab9cb2d0-5b1a-42e1-bc9c-c7ff351cb272

┌─name────┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

4. Test deleting a column
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47


0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: Not enough privileges. To execute this query it's necessary to have grant ALTER DROP COLUMN(column2) ON my_db.my_table. (ACCESS_DENIED)
```

5. Testing the alter admin by granting the permission
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. Log in with the alter admin user
```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. Grant a sub-privilege
```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. Test granting a privilege that the alter admin user does not have is not a sub privilege of the grants for the admin user.
```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545


0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: Not enough privileges. To execute this query it's necessary to have grant ALTER UPDATE ON my_db.my_table WITH GRANT OPTION. (ACCESS_DENIED)
```

**Summary**
The ALTER privileges are hierarchical for `ALTER` with tables and views but not for other `ALTER` statements.  The permissions can be set in granular level or by grouping of permissions and also revoked similarly. The user granting or revoking must have `WITH GRANT OPTION` to set privileges on users, including the acting user themselves, and must have the privilege already. The acting user cannot revoke their own privileges if they do not have the grant option privilege themselves.
