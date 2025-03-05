## テスト管理者権限 {#test-admin-privileges}

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

## 非管理者ユーザー {#non-admin-users}

ユーザーは必要な権限を持っていなければならず、すべてが管理者ユーザーである必要はありません。このドキュメントの残りの部分では、例となるシナリオと必要な役割を提供します。

### 準備 {#preparation}

以下のテーブルとユーザーを作成して、例で使用します。

#### サンプルデータベース、テーブル、行の作成 {#creating-a-sample-database-table-and-rows}

1. テストデータベースを作成します。

   ```sql
   CREATE DATABASE db1;
   ```

2. テーブルを作成します。

   ```sql
   CREATE TABLE db1.table1 (
       id UInt64,
       column1 String,
       column2 String
   )
   ENGINE MergeTree
   ORDER BY id;
   ```

3. サンプル行でテーブルにデータを入れます。

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

5. 特定のカラムへのアクセスを制限するために使用されるレギュラーユーザーを作成します：

   ```sql
   CREATE USER column_user IDENTIFIED BY 'password';
   ```

6. 特定の値を持つ行へのアクセスを制限するために使用されるレギュラーユーザーを作成します：
   ```sql
   CREATE USER row_user IDENTIFIED BY 'password';
   ```

#### ロールの作成 {#creating-roles}

この例のセットで：

- 列や行に対する異なる権限のためのロールが作成されます。
- 権限がロールに付与されます。
- ユーザーが各ロールに割り当てられます。

ロールは、各ユーザーを個別に管理するのではなく、特定の権限のためのユーザーのグループを定義するために使用されます。

1. `db1` の `table1` において、ユーザーが `column1` のみを見ることができるように制限するロールを作成します：

    ```sql
    CREATE ROLE column1_users;
    ```

2. `column1` のビューを許可する権限を設定します。

    ```sql
    GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
    ```

3. `column_user` ユーザーを `column1_users` ロールに追加します。

    ```sql
    GRANT column1_users TO column_user;
    ```

4. このロールのユーザーが、`column1` に `A` の値を持つ行のみを見ることができるように制限するロールを作成します。

    ```sql
    CREATE ROLE A_rows_users;
    ```

5. `row_user` を `A_rows_users` ロールに追加します。

    ```sql
    GRANT A_rows_users TO row_user;
    ```

6. `column1` が `A` の値を持つ行のみを表示するポリシーを作成します。

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

7. データベースとテーブルに権限を設定します。

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

8. 他のロールがすべての行にアクセスできるようにするための明示的な権限を付与します。

    ```sql
    CREATE ROW POLICY allow_other_users_filter 
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```

    :::note
    テーブルにポリシーを添付すると、システムはそのポリシーを適用し、定義されたユーザーとロールのみがテーブルの操作を行うことができ、他のすべてのユーザーには操作が拒否されます。他のユーザーのために制限されない行ポリシーを適用しないようにするためには、他のユーザーやロールが通常または他のタイプのアクセスを持てるようにする別のポリシーを定義する必要があります。
    :::

## 検証 {#verification}

### カラム制限ユーザーによるロールの権限テスト {#testing-role-privileges-with-column-restricted-user}

1. `clickhouse_admin` ユーザーを使用して ClickHouse クライアントにログインします。

   ```bash
   clickhouse-client --user clickhouse_admin --password password
   ```

2. 管理者ユーザーでデータベース、テーブル、およびすべての行へのアクセスを確認します。

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

3. `column_user` ユーザーを使用して ClickHouse クライアントにログインします。

   ```bash
   clickhouse-client --user column_user --password password
   ```

4. すべてのカラムを使用して `SELECT` をテストします。

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
   すべてのカラムが指定されたため、アクセスが拒否されました。ユーザーは `id` と `column1` のみアクセスがあります。
   :::

5. 許可されたカラムのみを指定して `SELECT` クエリを確認します。

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

### 行制限ユーザーによるロールの権限テスト {#testing-role-privileges-with-row-restricted-user}

1. `row_user` を使用して ClickHouse クライアントにログインします。

   ```bash
   clickhouse-client --user row_user --password password
   ```

2. 利用可能な行を表示します。

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

## ユーザーとロールの変更 {#modifying-users-and-roles}

ユーザーには、必要な権限の組み合わせのために複数のロールを割り当てることができます。複数のロールを使用すると、システムは権限を決定するためにロールを組み合わせます。最終的な効果は、ロールの権限が累積的になることです。

たとえば、`role1` が `column1` のみの選択を許可し、`role2` が `column1` および `column2` の選択を許可する場合、ユーザーは両方のカラムにアクセスできます。

1. 管理者アカウントを使用して、行とカラムで制限された新しいユーザーをデフォルトのロールで作成します。

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

2. `A_rows_users` ロールの以前の権限を削除します。

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

3. `A_row_users` ロールに `column1` からのみ選択を許可します。

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

4. `row_and_column_user` を使用して ClickHouse クライアントにログインします。

   ```bash
   clickhouse-client --user row_and_column_user --password password;
   ```

5. すべてのカラムでテストします：

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

6. 許可されたカラムを限定してテストします。

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

## トラブルシューティング {#troubleshooting}

権限が交差したり組み合わさったりして予期しない結果が生じる場合がありますが、次のコマンドを使用して管理者アカウントを使用して問題を特定できます。

### ユーザーの権限とロールのリスト {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### ClickHouse のロールのリスト {#list-roles-in-clickhouse}

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

### ポリシーの表示 {#display-the-policies}

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

### ポリシーの定義方法と現在の権限の表示 {#view-how-a-policy-was-defined-and-current-privileges}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## ロール、ポリシー、ユーザーを管理するための例コマンド {#example-commands-to-manage-roles-policies-and-users}

次のコマンドを使用して：

- 権限を削除する
- ポリシーを削除する
- ユーザーをロールから解除する
- ユーザーとロールを削除する
  <br />

:::tip
これらのコマンドは管理者ユーザーまたは `default` ユーザーとして実行します。
:::

### ロールから権限を削除する {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### ポリシーを削除する {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### ユーザーをロールから解除する {#unassign-a-user-from-a-role}

```sql
REVOKE A_rows_users FROM row_user;
```

### ロールを削除する {#delete-a-role}

```sql
DROP ROLE A_rows_users;
```

### ユーザーを削除する {#delete-a-user}

```sql
DROP USER row_user;
```

## まとめ {#summary}

この記事では、SQLユーザーとロールを作成する基本を示し、ユーザーとロールの権限を設定および変更する手順を提供しました。各内容の詳細情報については、ユーザーガイドとリファレンス文書を参照してください。
