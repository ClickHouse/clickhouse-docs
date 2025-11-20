## 测试管理员权限 {#test-admin-privileges}

以 `default` 用户身份退出登录,然后以 `clickhouse_admin` 用户身份重新登录。

以下所有操作都应成功执行:

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

用户应该拥有必要的权限,而不应全部设为管理员用户。本文档的其余部分提供了示例场景和所需的角色。

### 准备工作 {#preparation}

创建以下表和用户以供示例使用。

#### 创建示例数据库、表和数据行 {#creating-a-sample-database-table-and-rows}

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

##### 向表中填充示例数据 {#populate}

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

```sql title="查询"
SELECT *
FROM db1.table1
```

```response title="响应"
Query id: 475015cc-6f51-4b20-bda2-3c9c41404e49

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
│  3 │ B       │ abc     │
│  4 │ B       │ def     │
└────┴─────────┴─────────┘
```

##### 创建 `column_user` {#create-a-user-with-restricted-access-to-columns}

创建一个普通用户,用于演示对特定列的访问限制:

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### 创建 `row_user` {#create-a-user-with-restricted-access-to-rows-with-certain-values}

创建一个普通用户,用于演示对具有特定值的行的访问限制:

```sql
CREATE USER row_user IDENTIFIED BY 'password';
```

</VerticalStepper>

#### 创建角色 {#creating-roles}

在这组示例中:

- 将创建用于不同权限的角色,例如列和行权限
- 将向角色授予权限
- 将用户分配到各个角色

角色用于为特定权限定义用户组,而不是单独管理每个用户。

<VerticalStepper headerLevel="h5">

##### 创建一个角色,将此角色的用户限制为仅能查看数据库 `db1` 和表 `table1` 中的 `column1`: {#create-column-role}

    ```sql
    CREATE ROLE column1_users;
    ```

##### 设置权限以允许查看 `column1` {#set-column-privileges}

    ```sql
    GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
    ```

##### 将 `column_user` 用户添加到 `column1_users` 角色 {#add-column-user-to-role}

    ```sql
    GRANT column1_users TO column_user;
    ```

##### 创建一个角色,将此角色的用户限制为仅能查看选定的行,在本例中,仅查看 `column1` 中包含 `A` 的行 {#create-row-role}

    ```sql
    CREATE ROLE A_rows_users;
    ```

##### 将 `row_user` 添加到 `A_rows_users` 角色 {#add-row-user-to-role}

    ```sql
    GRANT A_rows_users TO row_user;
    ```

##### 创建策略以仅允许查看 `column1` 值为 `A` 的行 {#create-row-policy}

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

##### 设置数据库和表的权限 {#set-db-table-privileges}

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

##### 为其他角色授予显式权限以保持对所有行的访问 {#grant-other-roles-access}

    ```sql
    CREATE ROW POLICY allow_other_users_filter
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```


    :::note
    将策略附加到表时,系统会应用该策略,此时只有策略中定义的用户和角色能够对表执行操作,其他所有用户的任何操作都将被拒绝。为了避免将限制性行策略应用于其他用户,必须定义另一个策略来允许其他用户和角色进行常规访问或其他类型的访问。
    :::

</VerticalStepper>


## 验证 {#verification}

### 使用列受限用户测试角色权限 {#testing-role-privileges-with-column-restricted-user}

<VerticalStepper headerLevel="h5">

##### 使用 `clickhouse_admin` 用户登录 ClickHouse 客户端 {#login-admin-user}

```bash
clickhouse-client --user clickhouse_admin --password password
```

##### 使用管理员用户验证对数据库、表和所有行的访问权限 {#verify-admin-access}

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

##### 使用 `column_user` 用户登录 ClickHouse 客户端 {#login-column-user}

```bash
clickhouse-client --user column_user --password password
```

##### 测试使用所有列的 `SELECT` 查询 {#test-select-all-columns}

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
访问被拒绝,因为指定了所有列,而该用户仅有权访问 `id` 和 `column1` 列
:::

##### 验证仅使用指定且允许的列的 `SELECT` 查询 {#verify-allowed-columns}

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

</VerticalStepper>

### 使用行受限用户测试角色权限 {#testing-role-privileges-with-row-restricted-user}

<VerticalStepper headerLevel="h5">

##### 使用 `row_user` 登录 ClickHouse 客户端 {#login-row-user}

```bash
clickhouse-client --user row_user --password password
```

##### 查看可访问的行 {#view-available-rows}

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
验证仅返回上述两行,`column1` 中值为 `B` 的行应被排除
:::

</VerticalStepper>


## 修改用户和角色 {#modifying-users-and-roles}

用户可以被分配多个角色以组合所需的权限。当使用多个角色时,系统会组合这些角色来确定权限,最终效果是角色权限将累积叠加。

例如,如果 `role1` 仅允许查询 `column1`,而 `role2` 允许查询 `column1` 和 `column2`,那么用户将可以访问这两列。

<VerticalStepper headerLevel="h5">

##### 使用管理员账户创建新用户,通过默认角色同时限制行和列 {#create-restricted-user}

```sql
CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
```

##### 移除 `A_rows_users` 角色的先前权限 {#remove-prior-privileges}

```sql
REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
```

##### 允许 `A_row_users` 角色仅查询 `column1` {#allow-column1-select}

```sql
GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
```

##### 使用 `row_and_column_user` 登录 ClickHouse 客户端 {#login-restricted-user}

```bash
clickhouse-client --user row_and_column_user --password password;
```

##### 测试查询所有列: {#test-all-columns-restricted}

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

##### 测试查询受限列: {#test-limited-columns}

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

</VerticalStepper>


## 故障排查 {#troubleshooting}

有时权限会交叉或组合产生意外结果,可以使用管理员账户执行以下命令来定位问题

### 列出用户的授权和角色 {#listing-the-grants-and-roles-for-a-user}

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

### 查看策略定义和当前权限 {#view-how-a-policy-was-defined-and-current-privileges}

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

以下命令可用于:

- 删除权限
- 删除策略
- 从角色中移除用户
- 删除用户和角色
  <br />

:::tip
以管理员用户或 `default` 用户身份运行这些命令
:::

### 从角色中撤销权限 {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### 删除策略 {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### 从角色中移除用户 {#unassign-a-user-from-a-role}

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

本文介绍了创建 SQL 用户和角色的基础知识,并提供了设置和修改用户及角色权限的操作步骤。如需了解更多详细信息,请参阅我们的用户指南和参考文档。
