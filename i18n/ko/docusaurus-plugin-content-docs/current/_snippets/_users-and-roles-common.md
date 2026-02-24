## 관리자 권한 테스트 \{#test-admin-privileges\}

`default` 사용자에서 로그아웃한 후 `clickhouse_admin` 사용자로 다시 로그인합니다.

다음 작업이 모두 성공해야 합니다.

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


## 비관리자 사용자 \{#non-admin-users\}

사용자는 필요한 권한만 보유해야 하며, 모든 사용자가 관리자일 필요는 없습니다. 이 문서의 나머지 부분에서는 예제 시나리오와 필요한 역할을 제공합니다.

### 준비 \{#preparation\}

예제에서 사용할 테이블과 사용자를 생성하세요.

#### 샘플 데이터베이스, 테이블 및 행 생성 \{#creating-a-sample-database-table-and-rows\}

<VerticalStepper headerLevel="h5">

##### 테스트 데이터베이스 생성 \{#create-a-test-database\}

```sql
CREATE DATABASE db1;
```

##### 테이블 생성 \{#create-a-table\}

```sql
CREATE TABLE db1.table1 (
   id UInt64,
   column1 String,
   column2 String
)
ENGINE MergeTree
ORDER BY id;
```

##### 샘플 행으로 테이블 채우기 \{#populate\}

```sql
INSERT INTO db1.table1
   (id, column1, column2)
VALUES
   (1, 'A', 'abc'),
   (2, 'A', 'def'),
   (3, 'B', 'abc'),
   (4, 'B', 'def');
```

##### 테이블 확인 \{#verify\}

```sql title="쿼리"
SELECT *
FROM db1.table1
```

```response title="응답"
쿼리 id: 475015cc-6f51-4b20-bda2-3c9c41404e49

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
│  3 │ B       │ abc     │
│  4 │ B       │ def     │
└────┴─────────┴─────────┘
```

##### `column_user` 생성 \{#create-a-user-with-restricted-access-to-columns\}

특정 컬럼에 대한 제한된 액세스를 시연하는 데 사용할 일반 사용자를 생성하세요:

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### `row_user` 생성 \{#create-a-user-with-restricted-access-to-rows-with-certain-values\}

특정 값을 가진 행에 대한 제한된 액세스를 시연하는 데 사용할 일반 사용자를 생성하세요:

```sql
CREATE USER row_user IDENTIFIED BY 'password';
```

</VerticalStepper>

#### 역할 생성 \{#creating-roles\}

이 예제 세트에서는 다음을 수행합니다:

- 컬럼 및 행과 같은 다양한 권한에 대한 역할을 생성합니다
- 역할에 권한을 부여합니다
- 각 역할에 사용자를 할당합니다

역할은 각 사용자를 개별적으로 관리하는 대신 특정 권한에 대한 사용자 그룹을 정의하는 데 사용됩니다.

<VerticalStepper headerLevel="h5">

##### 이 역할의 사용자가 데이터베이스 `db1`과 `table1`에서 `column1`만 볼 수 있도록 제한하는 역할 생성: \{#create-column-role\}

    ```sql
    CREATE ROLE column1_users;
    ```

##### `column1`에 대한 조회를 허용하는 권한 설정 \{#set-column-privileges\}

    ```sql
    GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
    ```

##### `column_user` 사용자를 `column1_users` 역할에 추가 \{#add-column-user-to-role\}

    ```sql
    GRANT column1_users TO column_user;
    ```

##### 이 역할의 사용자가 선택된 행만 볼 수 있도록 제한하는 역할 생성, 이 경우 `column1`에 `A`가 포함된 행만 표시 \{#create-row-role\}

    ```sql
    CREATE ROLE A_rows_users;
    ```

##### `row_user`를 `A_rows_users` 역할에 추가 \{#add-row-user-to-role\}

    ```sql
    GRANT A_rows_users TO row_user;
    ```

##### `column1`의 값이 `A`인 경우에만 조회를 허용하는 정책 생성 \{#create-row-policy\}

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

##### 데이터베이스 및 테이블에 권한 설정 \{#set-db-table-privileges\}

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

##### 다른 역할이 모든 행에 계속 액세스할 수 있도록 명시적 권한 부여 \{#grant-other-roles-access\}

    ```sql
    CREATE ROW POLICY allow_other_users_filter
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```


    :::note
    테이블에 정책을 연결하면 시스템이 해당 정책을 적용하며, 정의된 사용자와 역할만 테이블 작업을 수행할 수 있고 그 외의 모든 사용자는 모든 작업이 거부됩니다. 제한적인 ROW POLICY가 다른 사용자에게 적용되지 않도록 하려면, 다른 사용자와 역할이 일반 접근 또는 다른 유형의 접근을 할 수 있도록 별도의 정책을 정의해야 합니다.
    :::

</VerticalStepper>


## 검증 \{#verification\}

### 컬럼 제한 사용자의 역할 권한 테스트 \{#testing-role-privileges-with-column-restricted-user\}

<VerticalStepper headerLevel="h5">

##### `clickhouse_admin` 사용자로 clickhouse 클라이언트에 로그인합니다 \{#login-admin-user\}

   ```bash
   clickhouse-client --user clickhouse_admin --password password
   ```

##### 관리자 사용자로 데이터베이스, 테이블 및 모든 행에 모두 접근 가능한지 확인합니다. \{#verify-admin-access\}

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

##### `column_user` 사용자로 ClickHouse 클라이언트에 로그인합니다 \{#login-column-user\}

   ```bash
   clickhouse-client --user column_user --password password
   ```

##### 모든 컬럼을 사용하여 `SELECT`를 테스트합니다 \{#test-select-all-columns\}

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
   사용자에게 `id`와 `column1`에만 접근 권한이 있으므로, 모든 컬럼을 지정하면 접근이 거부됩니다.
   :::

##### 허용된 컬럼만 지정한 `SELECT` 쿼리를 실행해 확인합니다: \{#verify-allowed-columns\}

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

### 행 제한 사용자의 역할 권한 테스트 \{#testing-role-privileges-with-row-restricted-user\}

<VerticalStepper headerLevel="h5">

##### `row_user`를 사용하여 ClickHouse 클라이언트에 로그인합니다 \{#login-row-user\}

   ```bash
   clickhouse-client --user row_user --password password
   ```

##### 사용 가능한 행을 확인합니다 \{#view-available-rows\}

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
   위의 두 행만 반환되는지 검증합니다. `column1`의 값이 `B`인 행은 제외되어야 합니다.
   :::

</VerticalStepper>



## 사용자와 역할 수정 \{#modifying-users-and-roles\}

사용자에게 필요한 권한 조합을 위해 여러 역할을 할당할 수 있습니다. 여러 역할을 사용하는 경우 시스템은 역할을 결합하여 권한을 결정하며, 최종적으로 역할 권한이 누적되어 적용됩니다.

예를 들어, `role1`이 `column1`에 대해서만 SELECT를 허용하고, `role2`가 `column1`과 `column2`에 대한 SELECT를 허용하는 경우 사용자는 두 컬럼 모두에 접근할 수 있습니다.

<VerticalStepper headerLevel="h5">

##### 관리자 계정을 사용하여 행과 컬럼 둘 다에 대한 제한을 갖는 새 사용자 생성 (기본 역할 포함) \{#create-restricted-user\}

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

##### `A_rows_users` 역할에 대한 기존 권한 제거 \{#remove-prior-privileges\}

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

##### `A_row_users` 역할이 `column1`에서만 SELECT할 수 있도록 허용 \{#allow-column1-select\}

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

##### `row_and_column_user`로 ClickHouse 클라이언트에 로그인 \{#login-restricted-user\}

   ```bash
   clickhouse-client --user row_and_column_user --password password;
   ```

##### 모든 컬럼을 대상으로 테스트: \{#test-all-columns-restricted\}

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

##### 허용된 컬럼만으로 테스트: \{#test-limited-columns\}

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



## 문제 해결 \{#troubleshooting\}

권한이 서로 교차하거나 결합되어 예상치 못한 결과가 발생하는 경우가 있을 수 있습니다. 이러한 상황에서는 관리자 계정을 사용하여 다음 명령을 실행해 문제 범위를 좁힐 수 있습니다.

### 사용자에 대한 권한(grant) 및 역할(role) 나열 \{#listing-the-grants-and-roles-for-a-user\}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### ClickHouse에서 역할 목록 보기 \{#list-roles-in-clickhouse\}

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

### 정책 표시하기 \{#display-the-policies\}

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

### 정책 정의 방식 및 현재 권한 보기 \{#view-how-a-policy-was-defined-and-current-privileges\}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```


## 역할, 정책, 사용자 관리를 위한 예제 명령 \{#example-commands-to-manage-roles-policies-and-users\}

다음 명령은 다음과 같은 작업에 사용할 수 있습니다:

* 권한 삭제
* 정책 삭제
* 역할에서 사용자 연결 해제
* 사용자 및 역할 삭제
  <br />

:::tip
이 명령은 관리자 권한 사용자 또는 `default` 사용자로 실행하십시오
:::

### 역할에서 권한 제거 \{#remove-privilege-from-a-role\}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### 정책 삭제 \{#delete-a-policy\}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### 역할에서 사용자 할당 해제하기 \{#unassign-a-user-from-a-role\}

```sql
REVOKE A_rows_users FROM row_user;
```

### 역할 삭제 \{#delete-a-role\}

```sql
DROP ROLE A_rows_users;
```

### USER 삭제 \{#delete-a-user\}

```sql
DROP USER row_user;
```


## 요약 \{#summary\}

이 문서에서는 SQL 사용자와 역할을 생성하는 기본적인 방법을 살펴보고, 사용자와 역할의 권한을 설정하고 수정하는 절차를 설명했습니다. 각 항목에 대한 보다 자세한 내용은 사용자 가이드와 참고 문서를 참조하십시오.
