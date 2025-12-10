## 管理者権限をテストする {#test-admin-privileges}

ユーザー `default` からログアウトし、ユーザー `clickhouse_admin` として再ログインします。

次のすべてが成功するはずです:

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

## 管理者以外のユーザー {#non-admin-users}

ユーザーには必要な権限のみを付与し、全員を管理者ユーザーにすべきではありません。本ドキュメントの以降では、シナリオ例と必要なロールについて説明します。

### 準備 {#preparation}

例で使用するテーブルとユーザーを作成します。

#### サンプルデータベース、テーブル、および行の作成 {#creating-a-sample-database-table-and-rows}

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

##### サンプル行のテーブルへの投入 {#populate}

```sql
INSERT INTO db1.table1
   (id, column1, column2)
VALUES
   (1, 'A', 'abc'),
   (2, 'A', 'def'),
   (3, 'B', 'abc'),
   (4, 'B', 'def');
```

##### テーブルの検証 {#verify}

```sql title="クエリ"
SELECT *
FROM db1.table1
```

```response title="レスポンス"
Query id: 475015cc-6f51-4b20-bda2-3c9c41404e49

┌─id─┬─column1─┬─column2─┐
│  1 │ A       │ abc     │
│  2 │ A       │ def     │
│  3 │ B       │ abc     │
│  4 │ B       │ def     │
└────┴─────────┴─────────┘
```

##### `column_user`の作成 {#create-a-user-with-restricted-access-to-columns}

特定の列へのアクセス制限を実演するための通常ユーザーを作成します:

```sql
CREATE USER column_user IDENTIFIED BY 'password';
```

##### `row_user`の作成 {#create-a-user-with-restricted-access-to-rows-with-certain-values}

特定の値を持つ行へのアクセス制限を実演するための通常ユーザーを作成します:

```sql
CREATE USER row_user IDENTIFIED BY 'password';
```

</VerticalStepper>

#### ロールの作成 {#creating-roles}

この一連の例では:

- 列や行など、異なる権限のためのロールを作成します
- ロールに権限を付与します
- 各ロールにユーザーを割り当てます

ロールは、各ユーザーを個別に管理する代わりに、特定の権限に対するユーザーグループを定義するために使用されます。

<VerticalStepper headerLevel="h5">

##### データベース`db1`の`table1`で`column1`のみを参照できるようにこのロールのユーザーを制限するロールを作成: {#create-column-role}

    ```sql
    CREATE ROLE column1_users;
    ```

##### `column1`の参照を許可する権限を設定 {#set-column-privileges}

    ```sql
    GRANT SELECT(id, column1) ON db1.table1 TO column1_users;
    ```

##### `column_user`ユーザーを`column1_users`ロールに追加 {#add-column-user-to-role}

    ```sql
    GRANT column1_users TO column_user;
    ```

##### 選択された行のみを参照できるようにこのロールのユーザーを制限するロールを作成。この場合、`column1`に`A`を含む行のみ {#create-row-role}

    ```sql
    CREATE ROLE A_rows_users;
    ```

##### `row_user`を`A_rows_users`ロールに追加 {#add-row-user-to-role}

    ```sql
    GRANT A_rows_users TO row_user;
    ```

##### `column1`の値が`A`である場合のみ参照を許可するポリシーを作成 {#create-row-policy}

    ```sql
    CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users;
    ```

##### データベースとテーブルに権限を設定 {#set-db-table-privileges}

    ```sql
    GRANT SELECT(id, column1, column2) ON db1.table1 TO A_rows_users;
    ```

##### 他のロールが引き続き全ての行にアクセスできるよう明示的な権限を付与 {#grant-other-roles-access}

    ```sql
    CREATE ROW POLICY allow_other_users_filter
    ON db1.table1 FOR SELECT USING 1 TO clickhouse_admin, column1_users;
    ```

    :::note
    テーブルにポリシーをアタッチすると、システムはそのポリシーを適用し、定義されたユーザーとロールのみがテーブルに対する操作を実行できます。その他のすべてのユーザーは、すべての操作が拒否されます。制限的な行ポリシーを他のユーザーに適用しないようにするには、他のユーザーとロールが通常のアクセスまたはその他のタイプのアクセスを持てるように、別のポリシーを定義する必要があります。
    :::

</VerticalStepper>

## 検証 {#verification}

### 列制限ユーザーを使用したロール権限のテスト {#testing-role-privileges-with-column-restricted-user}

<VerticalStepper headerLevel="h5">

##### `clickhouse_admin` ユーザーを使用して clickhouse クライアントにログインする {#login-admin-user}

   ```bash
   clickhouse-client --user clickhouse_admin --password password
   ```

##### 管理者ユーザーでデータベース、テーブル、およびすべての行へのアクセスを確認する {#verify-admin-access}

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

##### `column_user` ユーザーを使用して ClickHouse クライアントにログインする {#login-column-user}

   ```bash
   clickhouse-client --user column_user --password password
   ```

##### すべての列を指定して `SELECT` をテストする {#test-select-all-columns}

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
   すべての列が指定されており、このユーザーには `id` と `column1` にしかアクセス権がないため、アクセスは拒否されます。
   :::

##### 許可されている列のみを指定した `SELECT` クエリを確認する {#verify-allowed-columns}

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

### 行制限ユーザーを使用したロール権限のテスト {#testing-role-privileges-with-row-restricted-user}

<VerticalStepper headerLevel="h5">

##### `row_user` を使用して ClickHouse クライアントにログインする {#login-row-user}

   ```bash
   clickhouse-client --user row_user --password password
   ```

##### 利用可能な行を表示する {#view-available-rows}

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
   上記の 2 行のみが返されることを確認します。`column1` が `B` の行は除外されている必要があります。
   :::

</VerticalStepper>

## ユーザーとロールの変更 {#modifying-users-and-roles}

ユーザーには、必要な権限の組み合わせを実現するために複数のロールを割り当てることができます。複数のロールを使用する場合、システムはそれらのロールを組み合わせて権限を決定し、その結果、ロールの権限は累積されます。

例えば、ある `role1` が `column1` に対する `SELECT` のみを許可し、`role2` が `column1` と `column2` に対する `SELECT` を許可する場合、そのユーザーは両方のカラムにアクセスできます。

<VerticalStepper headerLevel="h5">

##### 管理者アカウントを使用して、新しいユーザーを作成し、デフォルトロールを利用して行レベルおよび列レベルの両方で制限する {#create-restricted-user}

   ```sql
   CREATE USER row_and_column_user IDENTIFIED BY 'password' DEFAULT ROLE A_rows_users;
   ```

##### `A_rows_users` ロールに対する既存の権限を削除する {#remove-prior-privileges}

   ```sql
   REVOKE SELECT(id, column1, column2) ON db1.table1 FROM A_rows_users;
   ```

##### `A_row_users` ロールが `column1` からのみ `SELECT` できるようにする {#allow-column1-select}

   ```sql
   GRANT SELECT(id, column1) ON db1.table1 TO A_rows_users;
   ```

##### `row_and_column_user` を使用して ClickHouse クライアントにログインする {#login-restricted-user}

   ```bash
   clickhouse-client --user row_and_column_user --password password;
   ```

##### すべてのカラムを指定してテストする: {#test-all-columns-restricted}

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

##### 許可されたカラムのみを指定してテストする: {#test-limited-columns}

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

## トラブルシューティング {#troubleshooting}

権限が重なり合ったり組み合わさったりして、予期しない結果を生む場合があります。そのようなときは、管理者アカウントを使用して次のコマンドを実行し、問題の原因を切り分けることができます。

### ユーザーに付与されている権限およびロールの一覧表示 {#listing-the-grants-and-roles-for-a-user}

```sql
SHOW GRANTS FOR row_and_column_user
```

```response
Query id: 6a73a3fe-2659-4aca-95c5-d012c138097b

┌─GRANTS FOR row_and_column_user───────────────────────────┐
│ GRANT A_rows_users, column1_users TO row_and_column_user │
└──────────────────────────────────────────────────────────┘
```

### ClickHouse のロール一覧を表示する {#list-roles-in-clickhouse}

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

### ポリシーを表示 {#display-the-policies}

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

### ポリシーの定義と現在の権限を確認する {#view-how-a-policy-was-defined-and-current-privileges}

```sql
SHOW CREATE ROW POLICY A_row_filter ON db1.table1
```

```response
Query id: 0d3b5846-95c7-4e62-9cdd-91d82b14b80b

┌─CREATE ROW POLICY A_row_filter ON db1.table1────────────────────────────────────────────────┐
│ CREATE ROW POLICY A_row_filter ON db1.table1 FOR SELECT USING column1 = 'A' TO A_rows_users │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

## ロール、ポリシー、ユーザーを管理するためのコマンド例 {#example-commands-to-manage-roles-policies-and-users}

次のコマンドは以下の目的で使用できます:

* 権限を削除する
* ポリシーを削除する
* ロールからユーザーの割り当てを解除する
* ユーザーおよびロールを削除する
  <br />

:::tip
これらのコマンドは管理者ユーザーまたは `default` ユーザーとして実行してください
:::

### ロールから権限を削除する {#remove-privilege-from-a-role}

```sql
REVOKE SELECT(column1, id) ON db1.table1 FROM A_rows_users;
```

### ポリシーを削除する {#delete-a-policy}

```sql
DROP ROW POLICY A_row_filter ON db1.table1;
```

### ユーザーをロールから外す {#unassign-a-user-from-a-role}

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

この記事では、SQL ユーザーおよびロール作成の基本を説明し、ユーザーおよびロールに対する権限を設定・変更する手順を示しました。各トピックの詳細については、ユーザーガイドおよびリファレンスドキュメントを参照してください。
