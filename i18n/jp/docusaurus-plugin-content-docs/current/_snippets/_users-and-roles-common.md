---
{}
---



## Test admin privileges {#test-admin-privileges}

ユーザー `default` からログアウトし、ユーザー `clickhouse_admin` として再ログインします。

これらすべてが成功するはずです：

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

ユーザーは必要な権限を持っている必要があり、すべてが管理者ユーザーである必要はありません。この文書の残りの部分では、例となるシナリオと必要な役割が提供されます。

### Preparation {#preparation}

例で使用するために、これらのテーブルとユーザーを作成します。

#### Creating a sample database, table, and rows {#creating-a-sample-database-table-and-rows}

1. テストデータベースを作成します

   ```sql
   CREATE DATABASE db1;
   ```

2. テーブルを作成します

   ```sql
   CREATE TABLE db1.table1 (
       id UInt64,
       column1 String,
       column2 String
   )
   ENGINE MergeTree
   ORDER BY id;
   ```

3. テーブルにサンプル行を入力します

   ```sql
   INSERT INTO db1.table1
       (id, column1, column2)
   VALUES
       (1, 'A', 'abc'),
       (2, 'A', 'def'),
       (3, 'B', 'abc'),
       (4, 'B', 'def');
   ```

4. テーブルを確認します：

   ```sql
   SELECT *
   FROM db1.table1
   ```

   ```response
   Query id: 475015cc-6f51-4b20-bda2-3c9c41404e49

   ┌─id─┬─column1─┬─column2─┐
   │  1 │ A       │ abc     │
   │  2 │ A       │ def     │
   │  3 │ B       │ abc     │
   │  4 │ B       │ def     │
   └────┴─────────┴─────────┘
   ```

5. 特定のカラムへのアクセス制限をデモするために使用される通常のユーザーを作成します：

   ```sql
   CREATE USER column_user IDENTIFIED BY 'password';
   ```

6. 特定の値を持つ行へのアクセス制限をデモするために使用される通常のユーザーを作成します：
   ```sql
   CREATE USER row_user IDENTIFIED BY 'password';
   ```

#### Creating roles {#creating-roles}

以下の例セットで：

- カラムや行に対するさまざまな権限のためのロールが作成されます
- 権限がロールに付与されます
- 各ロールにユーザーが割り当てられます

ロールは、各ユーザーを個別に管理する代わりに、特定の権限のためのユーザーグループを定義するために使用されます。

1. このロールのユーザーがデータベース `db1` の `table1` で `column1` のみを表示できるように制限するロールを作成します：

    ```sql
    CREATE ROLE column1_users;
    ```

2. `column1` の閲覧を許可する権限を設定します

    ```sql
    GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
    ```

3. `column_user` ユーザーを `column1_users` ロールに追加します

    ```sql
    GRANT column1_users TO column_user;
    ```

4. このロールのユーザーが選択された行のみを表示できるように制限するロールを作成します。この場合、`column1` に `A` を含む行のみです。

    ```sql
    CREATE ROLE A_rows_users;
    ```

5. `row_user` を `A_rows_users` ロールに追加します

    ```sql
    GRANT A_rows_users TO row_user;
    ```

6. `column1` が `A` の値を持つ行のみを表示できるポリシーを作成します

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

7. データベースおよびテーブルに権限を設定します

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

8. 他のロールがすべての行にアクセスできるように明示的な権限を付与します

    ```sql
    CREATE ROW POLICY allow_other_users_filter 
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```

    :::note
    テーブルにポリシーを添付すると、システムはそのポリシーを適用し、定義されたユーザーおよびロールのみがテーブルで操作を行うことができるようになり、それ以外はすべての操作が拒否されます。他のユーザーに制限を適用しないためには、通常のアクセスや他のタイプのアクセスを許可する別のポリシーを定義する必要があります。
    :::

## Verification {#verification}

### Testing role privileges with column restricted user {#testing-role-privileges-with-column-restricted-user}

1. `clickhouse_admin` ユーザーで ClickHouse クライアントにログインします

   ```bash
   clickhouse-client --user clickhouse_admin --password password
   ```

2. 管理者ユーザーとしてデータベース、テーブル、およびすべての行へのアクセスを確認します。

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

3. `column_user` ユーザーで ClickHouse クライアントにログインします

   ```bash
   clickhouse-client --user column_user --password password
   ```

4. すべてのカラムを使用して `SELECT` をテストします

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
   すべてのカラムが指定されたため、アクセスが拒否されています。ユーザーは `id` と `column1` のみアクセス権を持っています。
   :::

5. 許可されたカラムのみを指定した `SELECT` クエリを確認します：

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

### Testing role privileges with row restricted user {#testing-role-privileges-with-row-restricted-user}

1. `row_user` を使用して ClickHouse クライアントにログインします

   ```bash
   clickhouse-client --user row_user --password password
   ```

2. 利用可能な行を表示します

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
   上記の2行のみが返されることを確認します。`column1` に `B` の値を持つ行は除外されるべきです。
   :::

## Modifying Users and Roles {#modifying-users-and-roles}

ユーザーには必要な権限の組み合わせのために複数のロールが割り当てられることがあります。複数のロールを使用する場合、システムは権限を決定するためにロールを組み合わせ、ロールの権限は累積的な効果を持つことになります。

たとえば、`role1` が `column1` のみを選択することを許可し、`role2` が `column1` と `column2` の選択を許可する場合、ユーザーは両方のカラムにアクセスできるようになります。

1. 管理者アカウントを使用して、デフォルトのロールで行とカラムの両方で制限する新しいユーザーを作成します

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

2. `A_rows_users` ロールの以前の権限を削除します

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

3. `A_rows_users` ロールに `column1` のみを選択することを許可します

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

4. `row_and_column_user` を使用して ClickHouse クライアントにログインします

   ```bash
   clickhouse-client --user row_and_column_user --password password;
   ```

5. すべてのカラムを含むクエリをテストします：

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

6. 許可されたカラムのみを指定してテストします：

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

## Troubleshooting {#troubleshooting}

権限が交差または組み合わさることで予期しない結果が生じることがあります。以下のコマンドを使用して、管理者アカウントを使用して問題を特定できます。

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

以下のコマンドを使用して：

- 権限を削除する
- ポリシーを削除する
- ユーザーをロールから外す
- ユーザーとロールを削除する
  <br />

:::tip
これらのコマンドは管理者ユーザーまたは `default` ユーザーとして実行してください。
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

この記事では、SQLユーザーとロールの基本的な作成方法を示し、ユーザーとロールの権限を設定および変更する手順を提供しました。各詳細については、ユーザーガイドおよびリファレンス文書を参照してください。
