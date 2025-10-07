## 测试管理员权限 {#test-admin-privileges}

注销当前用户 `default`，并以用户 `clickhouse_admin` 重新登录。

以下所有操作应成功：

```sql
SHOW GRANTS FOR clickhouse_admin;
```

```sql
CREATE DATABASE db1
```

```sql
CREATE TABLE db1.table1 (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

```sql
INSERT INTO db1.table1 (id, column1) VALUES (1, 'abc');
```

```sql
SELECT * FROM db1.table1;
```

```sql
DROP TABLE db1.table1;
```

```sql
DROP DATABASE db1;
```

## 非管理员用户 {#non-admin-users}

用户应具备必要的权限，而不必全是管理员用户。本文档的其余部分提供了示例场景和所需的角色。

### 准备工作 {#preparation}

创建以下表和用户以供示例使用。

#### 创建示例数据库、表和行 {#creating-a-sample-database-table-and-rows}

<VerticalStepper headerLevel="h5">

##### 创建测试数据库 {#create-a-test-database}

```sql
CREATE DATABASE db1;
```

##### 创建表 {#create-a-table}

```sql
CREATE TABLE db1.table1 (
   id UInt64,
   column1 String,
   column2 String
)
ENGINE MergeTree
ORDER BY id;
```

##### 用示例行填充表 {#populate}

```sql
INSERT INTO db1.table1
   (id, column1, column2)
VALUES
   (1, 'A', 'abc'),
   (2, 'A', 'def'),
   (3, 'B', 'abc'),
   (4, 'B', 'def');
```

##### 验证表 {#verify}

```sql title="Query"
SELECT *
FROM db1.table1
```

```response title="Response"
Query id: 475015cc-6f51-4b20-bda2-3c9c41404e49

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
│  3 │ B       │ abc     │
│  4 │ B       │ def     │
└────┴─────────┴─────────┘
```

##### 创建 `column_user` {#create-a-user-with-restricted-access-to-columns}

创建一个常规用户，用于演示如何限制对某些列的访问：

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### 创建 `row_user` {#create-a-user-with-restricted-access-to-rows-with-certain-values}

创建一个常规用户，用于演示如何限制对具有特定值的行的访问：
   
```sql
CREATE USER row_user IDENTIFIED BY 'password';
```
   
</VerticalStepper>

#### 创建角色 {#creating-roles}

通过这一系列示例：

- 创建不同权限的角色，例如列和行
- 将权限授予角色
- 将用户分配给每个角色

角色用于定义用户组，以获取特定权限，而不是分别管理每个用户。

1. 创建一个角色，以限制该角色的用户只能查看数据库 `db1` 中的 `table1` 的 `column1`：

```sql
CREATE ROLE column1_users;
```

2. 设置权限以允许查看 `column1`

```sql
GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
```

3. 将 `column_user` 用户添加到 `column1_users` 角色

```sql
GRANT column1_users TO column_user;
```

4. 创建一个角色，以限制该角色的用户只能查看选定的行，在这种情况下，只能查看 `column1` 中包含 `A` 的行

```sql
CREATE ROLE A_rows_users;
```

5. 将 `row_user` 添加到 `A_rows_users` 角色

```sql
GRANT A_rows_users TO row_user;
```

6. 创建一项策略，以仅允许查看 `column1` 值为 `A` 的行

```sql
CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
```

7. 设置数据库和表的权限

```sql
GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
```

8. 授予其他角色的显式权限，以便仍然可以访问所有行

```sql
CREATE ROW POLICY allow_other_users_filter 
ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
```

    :::note
    当将策略附加到表时，系统将应用该策略，只有那些被定义的用户和角色才能对该表进行操作，所有其他用户将被拒绝任何操作。为了不对其他用户施加限制性行策略，必须定义另一项策略以允许其他用户和角色进行常规或其他类型的访问。
    :::

## 验证 {#verification}

### 使用列限制用户测试角色权限 {#testing-role-privileges-with-column-restricted-user}

1. 使用 `clickhouse_admin` 用户登录 ClickHouse 客户端

```bash
clickhouse-client --user clickhouse_admin --password password
```

2. 使用管理员用户验证对数据库、表和所有行的访问。

```sql
SELECT *
FROM db1.table1
```

```response
Query id: f5e906ea-10c6-45b0-b649-36334902d31d

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
│  3 │ B       │ abc     │
│  4 │ B       │ def     │
└────┴─────────┴─────────┘
```

3. 使用 `column_user` 用户登录 ClickHouse 客户端

```bash
clickhouse-client --user column_user --password password
```

4. 使用所有列测试 `SELECT`

```sql
SELECT *
FROM db1.table1
```

```response
Query id: 5576f4eb-7450-435c-a2d6-d6b49b7c4a23

0 rows in set. Elapsed: 0.006 sec.

Received exception from server (version 22.3.2):
Code: 497. DB::Exception: Received from localhost:9000. 
DB::Exception: column_user: Not enough privileges. 
To execute this query it's necessary to have grant 
SELECT(id, column1, column2) ON db1.table1. (ACCESS_DENIED)
```

   :::note
   访问被拒绝，因为指定了所有列，而用户仅对 `id` 和 `column1` 有访问权限。
   :::

5. 验证只指定和允许的列的 `SELECT` 查询：

```sql
SELECT
    id,
    column1
FROM db1.table1
```

```response
Query id: cef9a083-d5ce-42ff-9678-f08dc60d4bb9

┌─id─┬─column1─┐
│  1 │ A       │
│  2 │ A       │
│  3 │ B       │
│  4 │ B       │
└────┴─────────┘
```

### 使用行限制用户测试角色权限 {#testing-role-privileges-with-row-restricted-user}

1. 使用 `row_user` 登录 ClickHouse 客户端

```bash
clickhouse-client --user row_user --password password
```

2. 查看可用行

```sql
SELECT *
FROM db1.table1
```

```response
Query id: a79a113c-1eca-4c3f-be6e-d034f9a220fb

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
└────┴─────────┴─────────┘
```

   :::note
   验证仅返回上述两个行，`column1` 中值为 `B` 的行应被排除。
   :::

## 修改用户和角色 {#modifying-users-and-roles}

用户可以被分配多个角色，以满足所需权限的组合。当使用多个角色时，系统将组合这些角色以确定权限，最终效果是角色权限将是累积的。

例如，如果一个 `role1` 仅允许在 `column1` 上进行选择，而 `role2` 允许在 `column1` 和 `column2` 上进行选择，则用户将同时访问这两列。

1. 使用管理员帐户创建新用户，以通过行和列的方式限制，并指定默认角色

```sql
CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
```

2. 移除 `A_rows_users` 角色的先前权限

```sql
REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
```

3. 允许 `A_row_users` 角色仅从 `column1` 中选择

```sql
GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
```

4. 使用 `row_and_column_user` 登录 ClickHouse 客户端

```bash
clickhouse-client --user row_and_column_user --password password;
```

5. 使用所有列测试：

```sql
SELECT *
FROM db1.table1
```

```response
Query id: 8cdf0ff5-e711-4cbe-bd28-3c02e52e8bc4

0 rows in set. Elapsed: 0.005 sec.

Received exception from server (version 22.3.2):
Code: 497. DB::Exception: Received from localhost:9000. 
DB::Exception: row_and_column_user: Not enough privileges. 
To execute this query it's necessary to have grant 
SELECT(id, column1, column2) ON db1.table1. (ACCESS_DENIED)
```

6. 使用有限的允许列进行测试：

```sql
SELECT
    id,
    column1
FROM db1.table1
```

```response
Query id: 5e30b490-507a-49e9-9778-8159799a6ed0

┌─id─┬─column1─┐
│  1 │ A       │
│  2 │ A       │
└────┴─────────┘
```

## 故障排除 {#troubleshooting}

有时权限交错或组合会产生意想不到的结果，以下命令可以在使用管理员帐户时用于缩小问题范围

### 列出用户的权限和角色 {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### 列出 ClickHouse 中的角色 {#list-roles-in-clickhouse}

```sql
SHOW ROLES
```

```response
Query id: 1e21440a-18d9-4e75-8f0e-66ec9b36470a

┌─name────────────┐
│ A_rows_users    │
│ column1_users   │
└─────────────────┘
```

### 显示策略 {#display-the-policies}

```sql
SHOW ROW POLICIES
```

```response
Query id: f2c636e9-f955-4d79-8e80-af40ea227ebc

┌─name───────────────────────────────────┐
│ A_row_filter ON db1.table1             │
│ allow_other_users_filter ON db1.table1 │
└────────────────────────────────────────┘
```

### 查看策略的定义和当前权限 {#view-how-a-policy-was-defined-and-current-privileges}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 管理角色、策略和用户的示例命令 {#example-commands-to-manage-roles-policies-and-users}

以下命令可以用于：

- 删除权限
- 删除策略
- 将用户从角色中撤回
- 删除用户和角色
  <br />

:::tip
以管理员用户或 `default` 用户身份运行这些命令
:::

### 从角色中移除权限 {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### 删除策略 {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### 从角色中撤回用户 {#unassign-a-user-from-a-role}

```sql
REVOKE A_rows_users FROM row_user;
```

### 删除角色 {#delete-a-role}

```sql
DROP ROLE A_rows_users;
```

### 删除用户 {#delete-a-user}

```sql
DROP USER row_user;
```

## 总结 {#summary}

本文介绍了创建 SQL 用户和角色的基础知识，并提供了设置和修改用户和角色权限的步骤。有关每个方面的更详细信息，请参阅我们的用户指南和参考文档。
