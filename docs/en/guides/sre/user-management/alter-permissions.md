---
slug: /en/guides/sre/user-management/alter-permissions
sidebar_label: ALTER permissions
---

# ALTER permissions

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

