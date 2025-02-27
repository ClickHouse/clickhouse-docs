## 管理者権限のテスト {#test-admin-privileges}

ユーザー `default` からログアウトし、ユーザー `clickhouse_admin` として再度ログインします。

以下のすべてが成功するはずです：

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

ユーザーは必要な特権を持っている必要がありますが、すべてが管理者ユーザーである必要はありません。このドキュメントの残りの部分では、例となるシナリオと必要な役割を提供します。

### 準備 {#preparation}

以下のテーブルとユーザーを作成します。

#### サンプルデータベース、テーブル、行の作成 {#creating-a-sample-database-table-and-rows}

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

3. テーブルにサンプル行を挿入します

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

5. 特定のカラムへのアクセスを制限するために使用する通常のユーザーを作成します：

   ```sql
   CREATE USER column_user IDENTIFIED BY 'password';
   ```

6. 特定の値を持つ行へのアクセスを制限するために使用する通常のユーザーを作成します：
   ```sql
   CREATE USER row_user IDENTIFIED BY 'password';
   ```

#### 役割の作成 {#creating-roles}

この例のセットでは：

- カラムや行に対する異なる特権のための役割が作成されます
- 特権が役割に付与されます
- ユーザーが各役割に割り当てられます

役割は、各ユーザーを個別に管理する代わりに、特定の特権のためのユーザーグループを定義するために使用されます。

1. この役割のユーザーに `db1` の `table1` で `column1` だけを見ることを制限するための役割を作成します：

    ```sql
    CREATE ROLE column1_users;
    ```

2. `column1`のビューを許可するための特権を設定します

    ```sql
    GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
    ```

3. `column_user` ユーザーを `column1_users` 役割に追加します

    ```sql
    GRANT column1_users TO column_user;
    ```

4. この役割のユーザーに選択された行だけを見ることを制限するための役割を作成します。ここでは、`column1` に `A` を含む行だけです。

    ```sql
    CREATE ROLE A_rows_users;
    ```

5. `row_user` を `A_rows_users` 役割に追加します

    ```sql
    GRANT A_rows_users TO row_user;
    ```

6. `column1` が `A` の値を持つ場合にのみ表示を許可するポリシーを作成します

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

7. データベースとテーブルへの特権を設定します

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

8. 他の役割に対して明示的な権限を付与し、すべての行にアクセスできるようにします

    ```sql
    CREATE ROW POLICY allow_other_users_filter 
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```

    :::note
    テーブルにポリシーを添付すると、システムはそのポリシーを適用し、定義されたユーザーと役割だけがテーブルで操作を実行でき、他のすべては操作が拒否されます。他のユーザーに制約的な行ポリシーを適用しないようにするには、他のユーザーと役割が通常または他のタイプのアクセスを持てるようにするための別のポリシーを定義する必要があります。
    :::

## 検証 {#verification}

### カラム制限ユーザーでの役割特権のテスト {#testing-role-privileges-with-column-restricted-user}

1. `clickhouse_admin` ユーザーを使用して ClickHouse クライアントにログインします

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

3. `column_user` ユーザーを使用して ClickHouse クライアントにログインします

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
   すべてのカラムが指定されており、ユーザーは `id` と `column1` のみにアクセスできるため、アクセスが拒否されます
   :::

5. 指定されたカラムおよび許可されたカラムのみで `SELECT` クエリを確認します：

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

### 行制限ユーザーでの役割特権のテスト {#testing-role-privileges-with-row-restricted-user}

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
   上記の2行だけが返されることを確認してください。`column1` の値が `B` の行は除外されるべきです。
   :::

## ユーザーと役割の変更 {#modifying-users-and-roles}

ユーザーは必要な特権の組み合わせのために複数の役割を割り当てることができます。複数の役割を使用する場合、システムは特権を判断するために役割を組み合わせ、最終的な効果は役割の権限が累積的になることです。

たとえば、`role1` が `column1` のみに対して選択を許可し、`role2` が `column1` と `column2` の選択を許可する場合、ユーザーは両方のカラムにアクセスできます。

1. 管理者アカウントを使用して、行とカラムの両方で制限された新しいユーザーをデフォルトの役割で作成します

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

2. `A_rows_users` 役割の以前の特権を削除します

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

3. `A_rows_users` 役割が `column1` のみを選択できるように許可します

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

4. `row_and_column_user` を使用して ClickHouse クライアントにログインします

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

6. 許可されたカラムが制限されたテストをします：

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

特権が交差したり組み合わさったりして予期しない結果を生じることがあります。以下のコマンドは、管理者アカウントを使用して問題を絞り込むために使用できます。

### ユーザーの権限と役割のリスト {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### ClickHouse の役割のリスト {#list-roles-in-clickhouse}

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

### ポリシーの定義方法と現在の特権の表示 {#view-how-a-policy-was-defined-and-current-privileges}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 役割、ポリシー、およびユーザーを管理するためのコマンドの例 {#example-commands-to-manage-roles-policies-and-users}

以下のコマンドを使用して：

- 特権を削除
- ポリシーを削除
- ユーザーを役割から解除
- ユーザーおよび役割を削除
  <br />

:::tip
これらのコマンドは管理者ユーザーまたは `default` ユーザーとして実行してください
:::

### 役割から特権を削除 {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### ポリシーを削除 {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### ユーザーを役割から解除 {#unassign-a-user-from-a-role}

```sql
REVOKE A_rows_users FROM row_user;
```

### 役割を削除 {#delete-a-role}

```sql
DROP ROLE A_rows_users;
```

### ユーザーを削除 {#delete-a-user}

```sql
DROP USER row_user;
```

## まとめ {#summary}

この記事では、SQLユーザーと役割を作成する基本を示し、ユーザーと役割の特権を設定および変更する手順を提供しました。各詳細情報については、ユーザーガイドおよびリファレンス文書を参照してください。
