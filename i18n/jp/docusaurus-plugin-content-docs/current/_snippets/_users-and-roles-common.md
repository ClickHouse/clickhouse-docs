

## テスト管理者権限 {#test-admin-privileges}

ユーザー `default` からログアウトし、ユーザー `clickhouse_admin` として再ログインします。

これらはすべて成功するべきです:

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

ユーザーは必要な権限を持っているべきであり、全員が管理者ユーザーであってはいけません。この文書の残りの部分では、例示的なシナリオと必要な役割を提供します。

### 準備 {#preparation}

例で使用するために、これらのテーブルとユーザーを作成します。

#### サンプルデータベース、テーブル、行の作成 {#creating-a-sample-database-table-and-rows}

<VerticalStepper headerLevel="h5">

##### テストデータベースの作成 {#create-a-test-database}

```sql
CREATE DATABASE db1;
```

##### テーブルの作成 {#create-a-table}

```sql
CREATE TABLE db1.table1 (
   id UInt64,
   column1 String,
   column2 String
)
ENGINE MergeTree
ORDER BY id;
```

##### サンプル行を使ってテーブルをポピュレートする {#populate}

```sql
INSERT INTO db1.table1
   (id, column1, column2)
VALUES
   (1, 'A', 'abc'),
   (2, 'A', 'def'),
   (3, 'B', 'abc'),
   (4, 'B', 'def');
```

##### テーブルを検証する {#verify}

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

##### `column_user` を作成する {#create-a-user-with-restricted-access-to-columns}

特定のカラムへのアクセスを制限するために使われる通常のユーザーを作成します:

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### `row_user` を作成する {#create-a-user-with-restricted-access-to-rows-with-certain-values}

特定の値を持つ行へのアクセスを制限するために使われる通常のユーザーを作成します:
   
```sql
CREATE USER row_user IDENTIFIED BY 'password';
```
   
</VerticalStepper>

#### 役割の作成 {#creating-roles}

この例に基づいて:

- カラムや行に対するさまざまな権限のための役割が作成されます
- 権限が役割に付与されます
- ユーザーが各役割に割り当てられます

役割は、各ユーザーを個別に管理するのではなく、特定の権限のためにユーザーのグループを定義するために使用されます。

1. データベース `db1` のテーブル `table1` で `column1` のみを表示できるようにこの役割のユーザーを制限する役割を作成します:

```sql
CREATE ROLE column1_users;
```

2. `column1` の表示を許可する権限を設定します

```sql
GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
```

3. `column_user` ユーザーを `column1_users` 役割に追加します

```sql
GRANT column1_users TO column_user;
```

4. この役割のユーザーを選択された行、つまり `column1` に `'A'` を含む行のみを見ることができるように制限する役割を作成します

```sql
CREATE ROLE A_rows_users;
```

5. `row_user` を `A_rows_users` 役割に追加します

```sql
GRANT A_rows_users TO row_user;
```

6. `column1` が `A` の値を持っている場所のみを表示するポリシーを作成します

```sql
CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
```

7. データベースとテーブルに対する権限を設定します

```sql
GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
```

8. 他の役割がすべての行にアクセスできるように明示的な権限を付与します

```sql
CREATE ROW POLICY allow_other_users_filter 
ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
```

    :::note
    テーブルにポリシーを添付すると、システムはそのポリシーを適用し、定義されたユーザーと役割のみがテーブルで操作を行うことができます。他のユーザーはすべての操作を拒否されます。他のユーザーや役割に通常または他の種類のアクセスを許可するためには、別のポリシーを定義する必要があります。
    :::

## 検証 {#verification}

### カラム制限ユーザーでの役割権限のテスト {#testing-role-privileges-with-column-restricted-user}

1. `clickhouse_admin` ユーザーを使用して ClickHouse クライアントにログインします

```bash
clickhouse-client --user clickhouse_admin --password password
```

2. 管理者ユーザーでデータベース、テーブル、すべての行へのアクセスを確認します。

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

4. すべてのカラムを使用した `SELECT` をテストします

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
   すべてのカラムが指定されたため、アクセスが拒否され、ユーザーは `id` と `column1` のみにアクセスできます。
   :::

5. 指定されたカラムのみを使用した `SELECT` クエリを検証します:

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

### 行制限ユーザーでの役割権限のテスト {#testing-role-privileges-with-row-restricted-user}

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
   上記の2行のみが返されることを確認します。`column1` に値 `B` の行は除外されるべきです。
   :::

## ユーザーと役割の修正 {#modifying-users-and-roles}

ユーザーには必要な権限の組み合わせのために複数の役割を割り当てることができます。複数の役割を使用する場合、システムは役割を組み合わせて権限を決定します。その結果、役割の権限は累積されます。

たとえば、`role1` が `column1` のみを選択することを許可し、`role2` が `column1` と `column2` の選択を許可する場合、ユーザーは両方のカラムにアクセスできます。

1. 管理者アカウントを使用して、デフォルトの役割で行とカラムの両方で制限された新しいユーザーを作成します

```sql
CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
```

2. `A_rows_users` 役割の以前の権限を削除します

```sql
REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
```

3. `A_row_users` 役割が `column1` からのみ選択できるようにします

```sql
GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
```

4. `row_and_column_user` を使用して ClickHouse クライアントにログインします

```bash
clickhouse-client --user row_and_column_user --password password;
```

5. すべてのカラムでテストします:

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

6. 限定された許可されたカラムでテストします:

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

権限が交差または結合して予期しない結果を引き起こす場合があるため、以下のコマンドを管理者アカウントを使用して問題を絞り込むために使用できます。

### ユーザーの付与と役割の一覧 {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### ClickHouse の役割を一覧表示 {#list-roles-in-clickhouse}

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

### ポリシーを表示する {#display-the-policies}

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

### ポリシーがどのように定義されているかと現在の権限を表示 {#view-how-a-policy-was-defined-and-current-privileges}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## 役割、ポリシー、ユーザーを管理するための例コマンド {#example-commands-to-manage-roles-policies-and-users}

以下のコマンドを使用できます:

- 権限を削除する
- ポリシーを削除する
- ユーザーを役割から割り当て解除する
- ユーザーと役割を削除する
  <br />

:::tip
これらのコマンドは管理者ユーザーまたは `default` ユーザーとして実行してください
:::

### 役割から権限を削除する {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### ポリシーを削除する {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### ユーザーの役割からの割り当て解除 {#unassign-a-user-from-a-role}

```sql
REVOKE A_rows_users FROM row_user;
```

### 役割を削除する {#delete-a-role}

```sql
DROP ROLE A_rows_users;
```

### ユーザーを削除する {#delete-a-user}

```sql
DROP USER row_user;
```

## まとめ {#summary}

この記事では、SQL ユーザーと役割を作成する基本を示し、ユーザーと役割の権限を設定および修正する手順を提供しました。各項目についての詳細情報は、ユーザーガイドとリファレンスドキュメントを参照してください。
