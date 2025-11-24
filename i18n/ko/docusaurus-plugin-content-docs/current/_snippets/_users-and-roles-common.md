## Test admin privileges {#test-admin-privileges}

사용자 `default`로 로그아웃하고 사용자 `clickhouse_admin`로 다시 로그인합니다.

다음 모든 작업이 성공해야 합니다:

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

## Non-admin users {#non-admin-users}

사용자는 필요한 권한을 가져야 하며, 모두 admin 사용자일 필요는 없습니다. 이 문서의 나머지 부분에서는 예시 시나리오와 필요한 역할을 제공합니다.

### Preparation {#preparation}

예시에서 사용할 테이블과 사용자를 생성합니다.

#### Creating a sample database, table, and rows {#creating-a-sample-database-table-and-rows}

<VerticalStepper headerLevel="h5">

##### Create a test database {#create-a-test-database}

```sql
CREATE DATABASE db1;
```

##### Create a table {#create-a-table}

```sql
CREATE TABLE db1.table1 (
   id UInt64,
   column1 String,
   column2 String
)
ENGINE MergeTree
ORDER BY id;
```

##### Populate the table with sample rows {#populate}

```sql
INSERT INTO db1.table1
   (id, column1, column2)
VALUES
   (1, 'A', 'abc'),
   (2, 'A', 'def'),
   (3, 'B', 'abc'),
   (4, 'B', 'def');
```

##### Verify the table {#verify}

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

##### Create `column_user` {#create-a-user-with-restricted-access-to-columns}

특정 컬럼에 대한 접근을 제한하는 것을 시연하기 위해 사용할 일반 사용자를 생성합니다:

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### Create `row_user` {#create-a-user-with-restricted-access-to-rows-with-certain-values}

특정 값들에 대한 행 접근을 제한하는 것을 시연하기 위해 사용할 일반 사용자를 생성합니다:
   
```sql
CREATE USER row_user IDENTIFIED BY 'password';
```
   
</VerticalStepper>

#### Creating roles {#creating-roles}

이 예시 세트를 사용하여:

- 특정 권한(예: 컬럼 및 행)에 대한 역할을 생성합니다.
- 역할에 권한을 부여합니다.
- 각 역할에 사용자를 할당합니다.

역할은 각 사용자를 개별적으로 관리하는 대신, 특정 권한에 대한 사용자 그룹을 정의하는 데 사용됩니다.

<VerticalStepper headerLevel="h5">

##### Create a role to restrict users of this role to only see `column1` in database `db1` and `table1`: {#create-column-role}

```sql
CREATE ROLE column1_users;
```

##### Set privileges to allow view on `column1` {#set-column-privileges}

```sql
GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
```

##### Add the `column_user` user to the `column1_users` role {#add-column-user-to-role}

```sql
GRANT column1_users TO column_user;
```

##### Create a role to restrict users of this role to only see selected rows, in this case, only rows containing `A` in `column1` {#create-row-role}

```sql
CREATE ROLE A_rows_users;
```

##### Add the `row_user` to the `A_rows_users` role {#add-row-user-to-role}

```sql
GRANT A_rows_users TO row_user;
```

##### Create a policy to allow view on only where `column1` has the values of `A` {#create-row-policy}

```sql
CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
```

##### Set privileges to the database and table {#set-db-table-privileges}

```sql
GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
```

##### Grant explicit permissions for other roles to still have access to all rows {#grant-other-roles-access}

```sql
CREATE ROW POLICY allow_other_users_filter 
ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
```

    :::note
    테이블에 정책을 부착하면 시스템은 해당 정책을 적용하며, 정의된 사용자와 역할만이 테이블에서 작업을 수행할 수 있고, 나머지는 모든 작업이 거부됩니다. 다른 사용자와 역할이 일반 또는 다른 유형의 접근을 할 수 있도록 하려면 제한적인 행 정책 대신 다른 정책을 정의해야 합니다.
    :::

</VerticalStepper>

## Verification {#verification}

### Testing role privileges with column restricted user {#testing-role-privileges-with-column-restricted-user}

<VerticalStepper headerLevel="h5">

##### Log into the clickhouse client using the `clickhouse_admin` user {#login-admin-user}

```bash
clickhouse-client --user clickhouse_admin --password password
```

##### Verify access to database, table and all rows with the admin user. {#verify-admin-access}

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

##### Log into the ClickHouse client using the `column_user` user {#login-column-user}

```bash
clickhouse-client --user column_user --password password
```

##### Test `SELECT` using all columns {#test-select-all-columns}

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
   모든 컬럼이 지정되었으므로 접근이 거부됩니다. 사용자는 `id`와 `column1`에만 접근할 수 있습니다.
   :::

##### Verify `SELECT` query with only columns specified and allowed: {#verify-allowed-columns}

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

### Testing role privileges with row restricted user {#testing-role-privileges-with-row-restricted-user}

<VerticalStepper headerLevel="h5">

##### Log into the ClickHouse client using `row_user` {#login-row-user}

```bash
clickhouse-client --user row_user --password password
```

##### View rows available {#view-available-rows}

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
   위의 두 행만 반환되도록 확인합니다. `column1`에 값이 `B`인 행은 제외되어야 합니다.
   :::

</VerticalStepper>

## Modifying users and roles {#modifying-users-and-roles}

사용자는 필요한 권한 조합을 위해 여러 역할을 할당받을 수 있습니다. 여러 역할을 사용하는 경우 시스템은 역할을 결합하여 권한을 결정하며, 결과적으로 역할 권한이 누적됩니다.

예를 들어, `role1`이 `column1`의 선택만 허용하고 `role2`가 `column1`과 `column2`의 선택을 허용하면 사용자는 두 컬럼 모두에 접근할 수 있습니다.

<VerticalStepper headerLevel="h5">

##### Using the admin account, create new user to restrict by both row and column with default roles {#create-restricted-user}

```sql
CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
```

##### Remove prior privileges for `A_rows_users` role {#remove-prior-privileges}

```sql
REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
```

##### Allow `A_row_users` role to only select from `column1` {#allow-column1-select}

```sql
GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
```

##### Log into the ClickHouse client using `row_and_column_user` {#login-restricted-user}

```bash
clickhouse-client --user row_and_column_user --password password;
```

##### Test with all columns: {#test-all-columns-restricted}

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

##### Test with limited allowed columns: {#test-limited-columns}

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

## Troubleshooting {#troubleshooting}

권한이 교차하거나 결합되어 예기치 않은 결과를 생성하는 경우가 발생할 수 있으며, 다음 명령은 admin 계정을 사용하여 문제를 좁히는 데 사용될 수 있습니다.

### Listing the grants and roles for a user {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### List roles in ClickHouse {#list-roles-in-clickhouse}

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

### Display the policies {#display-the-policies}

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

### View how a policy was defined and current privileges {#view-how-a-policy-was-defined-and-current-privileges}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Example commands to manage roles, policies, and users {#example-commands-to-manage-roles-policies-and-users}

다음 명령은 다음 작업을 수행하는 데 사용될 수 있습니다:

- 권한 삭제
- 정책 삭제
- 역할에서 사용자 할당 해제
- 사용자 및 역할 삭제
  <br />

:::tip
이 명령은 admin 사용자 또는 `default` 사용자로 실행하세요.
:::

### Remove privilege from a role {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### Delete a policy {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### Unassign a user from a role {#unassign-a-user-from-a-role}

```sql
REVOKE A_rows_users FROM row_user;
```

### Delete a role {#delete-a-role}

```sql
DROP ROLE A_rows_users;
```

### Delete a user {#delete-a-user}

```sql
DROP USER row_user;
```

## Summary {#summary}

이 문서는 SQL 사용자 및 역할 생성의 기초를 보여주었고, 사용자 및 역할의 권한을 설정하고 수정하는 단계도 제공했습니다. 각 항목에 대한 보다 자세한 정보는 사용자 가이드 및 참조 문서를 참조하시기 바랍니다.
