---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 'ユーザーとロール'
title: 'アクセス制御とアカウント管理'
keywords: ['ClickHouse Cloud', 'アクセス制御', 'ユーザー管理', 'RBAC', 'セキュリティ']
description: 'ClickHouse Cloud におけるアクセス制御とアカウント管理について説明します。'
doc_type: 'guide'
---

# ClickHouse でのユーザーとロールの作成 {#creating-users-and-roles-in-clickhouse}

ClickHouse は、[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) に基づくアクセス制御をサポートしています。

ClickHouse のアクセスエンティティ:

- [User account](#user-account-management)
- [Role](#role-management)
- [Row Policy](#row-policy-management)
- [Settings Profile](#settings-profiles-management)
- [Quota](#quotas-management)

アクセスエンティティは次の方法で設定できます:

- SQL 駆動のワークフロー。

    この機能を利用するには、事前に[有効化](#enabling-access-control)する必要があります。

- サーバーの[設定ファイル](/operations/configuration-files.md) `users.xml` および `config.xml`。

SQL 駆動のワークフローを使用することを推奨します。どちらの設定方法も同時に動作するため、アカウントやアクセス権限の管理にサーバー設定ファイルを使用している場合でも、SQL 駆動のワークフローへスムーズに移行できます。

:::note
同じアクセスエンティティを 2 つの設定方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloud コンソールユーザーの管理方法を探している場合は、この[ページ](/cloud/security/manage-cloud-users)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなどと、それらに対するすべての権限付与を確認するには、[`SHOW ACCESS`](/sql-reference/statements/show#show-access) ステートメントを使用します。

## 概要 {#access-control-usage}

デフォルトでは、ClickHouse サーバーは `default` ユーザーアカウントを提供します。このアカウントは SQL ベースのアクセス制御およびアカウント管理には利用できませんが、すべての権限を持っています。`default` ユーザーアカウントは、たとえばクライアントからのログイン時や分散クエリ内など、ユーザー名が定義されていないすべての場合に使用されます。分散クエリ処理においては、サーバーまたはクラスタの設定で [user と password](/engines/table-engines/special/distributed.md) プロパティが指定されていない場合、`default` ユーザーアカウントが使用されます。

ClickHouse の利用を開始したばかりの場合は、次のシナリオを検討してください。

1. `default` ユーザーに対して、[SQL ベースのアクセス制御とアカウント管理を有効化](#enabling-access-control) します。
2. `default` ユーザーアカウントにログインし、必要なすべてのユーザーを作成します。管理者アカウント（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）の作成を忘れないでください。
3. `default` ユーザーの[権限を制限](/operations/settings/permissions-for-queries)し、そのユーザーに対する SQL ベースのアクセス制御とアカウント管理を無効化します。

### 現在の仕組みの特性 {#access-control-properties}

- 存在しないデータベースやテーブルに対しても権限を付与できます。
- テーブルが削除されても、そのテーブルに対応するすべての権限は取り消されません。つまり、後で同じ名前の新しいテーブルを作成した場合でも、すべての権限は有効なままです。削除されたテーブルに対応する権限を取り消すには、`REVOKE ALL PRIVILEGES ON db.table FROM ALL` クエリなどを実行する必要があります。
- 権限に対する有効期間の設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouse で誰かを認可するためのアクセスエンティティです。ユーザーアカウントには次の情報が含まれます。

- 識別情報
- ユーザーが実行できるクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)
- ClickHouse サーバーへの接続を許可されているホスト
- 割り当てられたロールおよびデフォルトロール
- ユーザーログイン時にデフォルトで適用される制約付き設定
- 割り当てられた設定プロファイル

権限は、[GRANT](/sql-reference/statements/grant.md) クエリ、または[ロール](#role-management)を割り当てることによってユーザーアカウントに付与できます。ユーザーから権限を取り消すには、ClickHouse は [REVOKE](/sql-reference/statements/revoke.md) クエリを提供します。ユーザーに対する権限の一覧を取得するには、[SHOW GRANTS](/sql-reference/statements/show#show-grants) ステートメントを使用します。

管理クエリ:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 設定の適用 {#access-control-settings-applying}

設定は、ユーザーアカウント、そのユーザーに付与されたロール、および設定プロファイルごとに異なる値を設定できます。ユーザーログイン時に、ある設定が複数のアクセスエンティティで設定されている場合、その値と制約は次のように適用されます（優先度の高い順）。

1. ユーザーアカウントの設定。
2. ユーザーアカウントのデフォルトロールに対する設定。ある設定が複数のロールで構成されている場合、その設定の適用順序は未定義です。
3. ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルからの設定。ある設定が複数のプロファイルで構成されている場合、その設定の適用順序は未定義です。
4. サーバー全体にデフォルトで適用される設定、または [default profile](/operations/server-configuration-parameters/settings#default_profile) からの設定。

### ロール {#role-management}

ロールは、ユーザーアカウントに付与できるアクセスエンティティのコンテナです。

ロールには次の内容が含まれます。

- [権限](/sql-reference/statements/grant#privileges)
- 設定と制約
- 割り当てられたロールのリスト

管理クエリ:

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

権限は、[GRANT](/sql-reference/statements/grant.md) クエリによってロールに付与できます。ロールから権限を取り消すには、ClickHouse は [REVOKE](/sql-reference/statements/revoke.md) クエリを提供します。

#### Row policy {#row-policy-management}

Row policy は、どの行がユーザーまたはロールから利用可能かを定義するフィルターです。Row policy には、特定の 1 つのテーブルに対するフィルターと、この row policy を適用すべきロールやユーザーの一覧が含まれます。

:::note
Row policy は、readonly アクセスしか持たないユーザーの場合にのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、row policy による制限は迂回されてしまいます。
:::

管理クエリ:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### Settings profile {#settings-profiles-management}

Settings profile は、[settings](/operations/settings/index.md) の集合です。Settings profile には、設定と制約、およびこのプロファイルが適用されるロールやユーザーの一覧が含まれます。

管理クエリ:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### Quota {#quotas-management}

Quota はリソース使用量を制限します。[Quotas](/operations/quotas.md) を参照してください。

Quota には、特定の期間に対する一連の制限と、この quota を使用すべきロールやユーザーの一覧が含まれます。

管理クエリ:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL ベースのアクセス制御とアカウント管理の有効化 {#enabling-access-control}

- 設定を保存するためのディレクトリをセットアップします。

    ClickHouse は、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path) サーバー設定パラメータで指定されたディレクトリにアクセスエンティティの設定を保存します。

- 少なくとも 1 つのユーザーアカウントに対して、SQL ベースのアクセス制御とアカウント管理を有効化します。

    既定では、SQL ベースのアクセス制御とアカウント管理はすべてのユーザーで無効になっています。`users.xml` 設定ファイルで少なくとも 1 つのユーザーを設定し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、`show_named_collections_secrets` 設定の値を 1 にする必要があります。

## SQL ユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloud を使用している場合は、[Cloud access management](/cloud/security/console-roles) を参照してください。
:::

この記事では、SQL ユーザーおよびロールの基本的な定義方法と、それらに付与した権限をデータベース、テーブル、行、列に適用する方法について説明します。

### SQL ユーザーモードの有効化 {#enabling-sql-user-mode}

1.  `users.xml` ファイル内の `<default>` ユーザーの下で SQL ユーザーモードを有効化します:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default` ユーザーは新規インストール時に作成される唯一のユーザーであり、デフォルトではノード間通信にも使用されます。

    本番環境では、SQL 管理者ユーザーでノード間通信を構成し、`<secret>`、クラスタ認証情報、および／またはノード間 HTTP・トランスポートプロトコルの認証情報を設定した後は、この `default` ユーザーを無効化することが推奨されます。`default` アカウントはノード間通信に使用されるためです。
    :::

2. 変更を反映するためにノードを再起動します。

3. ClickHouse クライアントを起動します:
    ```sql
    clickhouse-client --user default --password <password>
    ```

### ユーザーの定義 {#defining-users}

1. SQL 管理者アカウントを作成します:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. 新しいユーザーに完全な管理権限を付与します:
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## ALTER 権限 {#alter-permissions}

この記事は、権限の定義方法と、特権ユーザーが `ALTER` ステートメントを使用する際に権限がどのように機能するかについて、よりよく理解できるようにすることを目的としています。

`ALTER` ステートメントはいくつかのカテゴリーに分かれており、その一部は階層構造を持ちますが、そうでないものは明示的に定義する必要があります。

**DB・テーブル・ユーザー設定の例**

1. 管理者ユーザーとしてサンプルユーザーを作成します

```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. サンプルデータベースを作成

```sql
CREATE DATABASE my_db;
```

3. サンプルテーブルを作成する

```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 権限を付与／取り消しするためのサンプル管理ユーザーを作成する

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
権限を付与または取り消すには、管理ユーザーが `WITH GRANT OPTION` 権限を持っている必要があります。
例えば次のとおりです。

```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
```

`GRANT` または `REVOKE` で権限を付与・取り消しするには、そのユーザー自身が事前にその権限を保持している必要があります。
:::

**権限の付与と取り消し**

`ALTER` の階層:

```response
├── ALTER (only for table and view)/
│   ├── ALTER TABLE/
│   │   ├── ALTER UPDATE
│   │   ├── ALTER DELETE
│   │   ├── ALTER COLUMN/
│   │   │   ├── ALTER ADD COLUMN
│   │   │   ├── ALTER DROP COLUMN
│   │   │   ├── ALTER MODIFY COLUMN
│   │   │   ├── ALTER COMMENT COLUMN
│   │   │   ├── ALTER CLEAR COLUMN
│   │   │   └── ALTER RENAME COLUMN
│   │   ├── ALTER INDEX/
│   │   │   ├── ALTER ORDER BY
│   │   │   ├── ALTER SAMPLE BY
│   │   │   ├── ALTER ADD INDEX
│   │   │   ├── ALTER DROP INDEX
│   │   │   ├── ALTER MATERIALIZE INDEX
│   │   │   └── ALTER CLEAR INDEX
│   │   ├── ALTER CONSTRAINT/
│   │   │   ├── ALTER ADD CONSTRAINT
│   │   │   └── ALTER DROP CONSTRAINT
│   │   ├── ALTER TTL/
│   │   │   └── ALTER MATERIALIZE TTL
│   │   ├── ALTER SETTINGS
│   │   ├── ALTER MOVE PARTITION
│   │   ├── ALTER FETCH PARTITION
│   │   └── ALTER FREEZE PARTITION
│   └── ALTER LIVE VIEW/
│       ├── ALTER LIVE VIEW REFRESH
│       └── ALTER LIVE VIEW MODIFY QUERY
├── ALTER DATABASE
├── ALTER USER
├── ALTER ROLE
├── ALTER QUOTA
├── ALTER [ROW] POLICY
└── ALTER [SETTINGS] PROFILE
```

1. ユーザーまたはロールへの `ALTER` 権限の付与

`GRANT ALTER ON *.* TO my_user` を実行しても、トップレベルの `ALTER TABLE` と `ALTER VIEW` にのみ影響し、その他の `ALTER` 文には影響しません。その他の `ALTER` 文については、それぞれ個別に権限を付与または取り消す必要があります。

たとえば、基本的な `ALTER` 権限を付与する場合:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

最終的に付与される権限の一覧:

```sql
SHOW GRANTS FOR  my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 706befbc-525e-4ec1-a1a2-ba2508cc09e3

┌─GRANTS FOR my_user───────────────────────────────────────────┐
│ GRANT ALTER TABLE, ALTER VIEW ON my_db.my_table TO my_user   │
└──────────────────────────────────────────────────────────────┘
```

これは、上記の例において `ALTER TABLE` および `ALTER VIEW` 配下のすべての権限を付与しますが、`ALTER ROW POLICY` のような他の一部の `ALTER` 権限は付与しません（権限の階層を参照すると、`ALTER ROW POLICY` は `ALTER TABLE` や `ALTER VIEW` の子ではないことが分かります）。それらは明示的に付与または取り消す必要があります。

`ALTER` 権限の一部だけが必要な場合は、それぞれを個別に付与できます。その権限にサブ権限がある場合は、それらも自動的に付与されます。

例えば次のようにします。

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

権限は次のように設定されます：

```sql
SHOW GRANTS FOR my_user;
```


```response
SHOW GRANTS FOR my_user

Query id: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

1 row in set. Elapsed: 0.004 sec.
```

これにより、以下のサブ権限も与えられます。

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. ユーザーおよびロールからの `ALTER` 権限の取り消し

`REVOKE` 文は、`GRANT` 文と同様に動作します。

ユーザーまたはロールにサブ権限が付与されている場合、そのサブ権限を直接取り消すことも、そのサブ権限が継承しているより上位の権限を取り消すこともできます。

たとえば、ユーザーに `ALTER ADD COLUMN` が付与されている場合

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 61fe0fdc-1442-4cd6-b2f3-e8f2a853c739

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 27791226-a18f-46c8-b2b4-a9e64baeb683

┌─GRANTS FOR my_user──────────────────────────────────┐
│ GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user │
└─────────────────────────────────────────────────────┘
```

権限は個別に取り消すことができます。

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

または、いずれかの上位レベルから取り消すこともできます（COLUMN のサブ権限をすべて取り消す）:

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user;
```

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user

Query id: b882ba1b-90fb-45b9-b10f-3cda251e2ccc

Ok.

0 rows in set. Elapsed: 0.002 sec.
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: e7d341de-de65-490b-852c-fa8bb8991174

Ok.

0 rows in set. Elapsed: 0.003 sec.
```

**追加事項**

権限を付与するユーザーは、`WITH GRANT OPTION` を持っているだけでなく、その権限自体も保持している必要があります。

1. 管理者ユーザーに権限を付与し、さらに一連の権限を管理できるようにするには、
   以下はその例です。

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これでユーザーは `ALTER COLUMN` 権限とそのすべてのサブ権限を付与または取り消すことができます。

**テスト**

1. `SELECT` 権限を付与する

```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. ユーザーに ADD COLUMN 権限を付与する

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 制限付きユーザーでログインする

```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. カラムの追加をテストする

```sql
ALTER TABLE my_db.my_table ADD COLUMN column2 String;
```

```response
ALTER TABLE my_db.my_table
    ADD COLUMN `column2` String

Query id: d5d6bfa1-b80c-4d9f-8dcd-d13e7bd401a5

Ok.

0 rows in set. Elapsed: 0.010 sec.
```

```sql
DESCRIBE my_db.my_table;
```

```response
DESCRIBE TABLE my_db.my_table

Query id: ab9cb2d0-5b1a-42e1-bc9c-c7ff351cb272

┌─name────┬─type───┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

4. 列の削除をテストする

```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: Not enough privileges. To execute this query it's necessary to have grant ALTER DROP COLUMN(column2) ON my_db.my_table. (ACCESS_DENIED)
```

5. 権限を付与して ALTER ADMIN ロールをテストする

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. ALTER ADMIN ユーザーでログインする

```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. サブ権限を付与する

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. alter admin ユーザーが保持しておらず、admin ユーザーに付与されている権限のサブ権限でもない権限を付与しようとすると失敗することをテストします。

```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: Not enough privileges. To execute this query it's necessary to have grant ALTER UPDATE ON my_db.my_table WITH GRANT OPTION. (ACCESS_DENIED)
```

**概要**
`ALTER` の権限は、テーブルおよびビューを対象とする `ALTER` については階層構造になっていますが、その他の `ALTER` 文については階層化されません。権限は細かな粒度で設定することも、複数の権限をまとめて設定することもでき、取り消しも同様に行えます。権限を付与または取り消すユーザーは、対象ユーザー（自分自身を含む）の権限を設定するために `WITH GRANT OPTION` を保持している必要があり、かつその権限自体も既に所有していなければなりません。`WITH GRANT OPTION` を持たないユーザーは、自分自身の権限を取り消すことはできません。
