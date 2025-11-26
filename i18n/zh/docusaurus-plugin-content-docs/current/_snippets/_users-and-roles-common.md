## 测试管理员权限

先以用户 `default` 登出，然后以用户 `clickhouse_admin` 重新登录。

以下所有操作都应成功：

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

用户应具备必要的权限，而非全部设为管理员用户。本文档的其余部分提供了示例场景及所需的角色配置。

### 准备工作 {#preparation}

创建示例中使用的表和用户。

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

创建一个普通用户，用于演示对特定列的访问限制：

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### 创建 `row_user` {#create-a-user-with-restricted-access-to-rows-with-certain-values}

创建一个普通用户，用于演示对特定值行的访问限制：

```sql
CREATE USER row_user IDENTIFIED BY 'password';
```

</VerticalStepper>

#### 创建角色 {#creating-roles}

通过以下示例：

- 将创建用于不同权限的角色，例如列和行权限
- 将向角色授予权限
- 将用户分配到各个角色

角色用于为特定权限定义用户组，而非单独管理每个用户。

<VerticalStepper headerLevel="h5">

##### 创建一个角色，将该角色的用户限制为仅可查看数据库 `db1` 和表 `table1` 中的 `column1`： {#create-column-role}

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

##### 创建一个角色，将该角色的用户限制为仅可查看选定的行，在本例中，仅查看 `column1` 中包含 `A` 的行 {#create-row-role}

    ```sql
    CREATE ROLE A_rows_users;
    ```

##### 将 `row_user` 添加到 `A_rows_users` 角色 {#add-row-user-to-role}

    ```sql
    GRANT A_rows_users TO row_user;
    ```

##### 创建策略，仅允许查看 `column1` 值为 `A` 的行 {#create-row-policy}

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

##### 设置数据库和表的权限 {#set-db-table-privileges}

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

##### 授予其他角色显式权限以保持对所有行的访问 {#grant-other-roles-access}

    ```sql
    CREATE ROW POLICY allow_other_users_filter
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```


    :::note
    将策略附加到表时,系统将应用该策略,仅允许已定义的用户和角色对表执行操作,其他所有用户的任何操作都将被拒绝。为避免将限制性行策略应用于其他用户,必须定义另一个策略,以允许其他用户和角色进行常规访问或其他类型的访问。
    :::

</VerticalStepper>


## 验证 {#verification}

### 使用列受限用户测试角色权限 {#testing-role-privileges-with-column-restricted-user}

<VerticalStepper headerLevel="h5">

##### 使用 `clickhouse_admin` 用户登录 ClickHouse 客户端 {#login-admin-user}

   ```bash
   clickhouse-client --user clickhouse_admin --password password
   ```

##### 使用管理员用户验证对数据库、表以及所有行的访问权限。 {#verify-admin-access}

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

##### 使用所有列测试 `SELECT` 查询 {#test-select-all-columns}

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
   访问被拒绝，因为查询中使用了所有列，而该用户只具有对 `id` 和 `column1` 的访问权限。
   :::

##### 验证仅使用被允许列的 `SELECT` 查询： {#verify-allowed-columns}

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
   验证仅返回以上两行，`column1` 中值为 `B` 的行应被排除。
   :::

</VerticalStepper>



## 修改用户和角色 {#modifying-users-and-roles}

可以为用户分配多个角色，以组合满足需求的权限。当使用多个角色时，系统会合并这些角色来确定最终权限，其结果是各角色的权限会累加生效。

例如，如果 `role1` 只允许对 `column1` 执行 SELECT，而 `role2` 允许对 `column1` 和 `column2` 执行 SELECT，那么该用户将可以访问这两列。

<VerticalStepper headerLevel="h5">

##### 使用管理员账号创建新用户，并通过默认角色同时按行和列进行限制 {#create-restricted-user}

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

##### 移除 `A_rows_users` 角色之前已有的权限 {#remove-prior-privileges}

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

##### 仅允许 `A_rows_users` 角色对 `column1` 执行 SELECT {#allow-column1-select}

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

##### 使用 `row_and_column_user` 登录 ClickHouse 客户端 {#login-restricted-user}

   ```bash
   clickhouse-client --user row_and_column_user --password password;
   ```

##### 使用所有列进行测试：{#test-all-columns-restricted}

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

##### 使用受限的允许列进行测试：{#test-limited-columns}

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



## 故障排查

在某些情况下，权限之间会相互交叉或组合，从而产生意外结果。可以使用以下命令配合管理员账号来帮助定位问题。

### 列出某个用户的权限授予和角色

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
查询 ID: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### 列出 ClickHouse 中的角色

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

### 查看策略

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

### 查看策略的定义和当前权限

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```


## 管理角色、策略和用户的示例命令

可以使用以下命令：

* 删除权限
* 删除策略
* 将用户从角色中移除
* 删除用户和角色
  <br />

:::tip
请以管理员用户或 `default` 用户身份运行这些命令
:::

### 从角色中移除权限

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### 删除策略

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### 取消用户的角色分配

```sql
REVOKE A_rows_users FROM row_user;
```

### 删除角色

```sql
DROP ROLE A_rows_users;
```

### 删除用户

```sql
DROP USER row_user;
```


## 总结 {#summary}

本文介绍了创建 SQL 用户和角色的基础方法，并提供了为用户和角色设置和修改权限的步骤。若需了解各项内容的更详细信息，请参阅我们的用户指南和参考文档。
