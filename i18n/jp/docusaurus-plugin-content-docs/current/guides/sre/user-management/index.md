---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 'ユーザーとロール'
title: 'アクセス制御とアカウント管理'
keywords: ['ClickHouse Cloud', 'アクセス制御', 'ユーザー管理', 'RBAC', 'セキュリティ']
description: 'ClickHouse Cloud のアクセス制御とアカウント管理について説明します'
doc_type: 'guide'
---



# ClickHouse でのユーザーおよびロールの作成

ClickHouse は [RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) アプローチに基づくアクセス制御管理をサポートしています。

ClickHouse のアクセスエンティティ：
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [行ポリシー](#row-policy-management)
- [設定プロファイル](#settings-profiles-management)
- [クオータ](#quotas-management)

アクセスエンティティは次の方法で構成できます：

- SQL ベースのワークフロー

    この機能を使用するには、[有効化](#enabling-access-control) する必要があります。

- サーバーの [設定ファイル](/operations/configuration-files.md) `users.xml` および `config.xml`

SQL ベースのワークフローの使用を推奨します。両方の設定方法は同時に動作するため、アカウントとアクセス権限の管理にサーバー設定ファイルを使用している場合でも、SQL ベースのワークフローへスムーズに移行できます。

:::note
同じアクセスエンティティを両方の設定方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloud コンソールユーザーの管理方法を探している場合は、この[ページ](/cloud/security/manage-cloud-users) を参照してください。
:::

すべてのユーザー、ロール、プロファイルなどと、それらに対するすべての付与を確認するには、[`SHOW ACCESS`](/sql-reference/statements/show#show-access) ステートメントを使用します。



## 概要 {#access-control-usage}

デフォルトでは、ClickHouseサーバーは`default`ユーザーアカウントを提供します。このアカウントはSQLベースのアクセス制御とアカウント管理の使用は許可されていませんが、すべての権限とパーミッションを持っています。`default`ユーザーアカウントは、ユーザー名が定義されていない場合に使用されます。例えば、クライアントからのログイン時や分散クエリなどです。分散クエリ処理では、サーバーまたはクラスターの設定で[ユーザーとパスワード](/engines/table-engines/special/distributed.md)プロパティが指定されていない場合、デフォルトユーザーアカウントが使用されます。

ClickHouseを使い始めたばかりの場合は、次のシナリオを検討してください:

1.  `default`ユーザーに対してSQLベースのアクセス制御とアカウント管理を[有効化](#enabling-access-control)します。
2.  `default`ユーザーアカウントでログインし、必要なすべてのユーザーを作成します。管理者アカウント(`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`)の作成を忘れないでください。
3.  `default`ユーザーの[権限を制限](/operations/settings/permissions-for-queries)し、SQLベースのアクセス制御とアカウント管理を無効化します。

### 現在のソリューションの特性 {#access-control-properties}

- データベースやテーブルが存在しない場合でも、それらに対する権限を付与できます。
- テーブルが削除されても、そのテーブルに対応するすべての権限は取り消されません。つまり、後で同じ名前の新しいテーブルを作成した場合でも、すべての権限は有効なままです。削除されたテーブルに対応する権限を取り消すには、例えば`REVOKE ALL PRIVILEGES ON db.table FROM ALL`クエリを実行する必要があります。
- 権限に有効期限の設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouseで認証を行うためのアクセスエンティティです。ユーザーアカウントには以下が含まれます:

- 識別情報。
- ユーザーが実行できるクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)。
- ClickHouseサーバーへの接続が許可されるホスト。
- 割り当てられたロールとデフォルトロール。
- ユーザーログイン時にデフォルトで適用される設定とその制約。
- 割り当てられた設定プロファイル。

ユーザーアカウントへの権限付与は、[GRANT](/sql-reference/statements/grant.md)クエリまたは[ロール](#role-management)の割り当てによって行うことができます。ユーザーから権限を取り消すには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供しています。ユーザーの権限を一覧表示するには、[SHOW GRANTS](/sql-reference/statements/show#show-grants)ステートメントを使用します。

管理クエリ:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 設定の適用 {#access-control-settings-applying}

設定は、ユーザーアカウント、付与されたロール、設定プロファイルなど、さまざまな方法で構成できます。ユーザーログイン時に、設定が異なるアクセスエンティティに対して構成されている場合、その設定の値と制約は次の順序で適用されます(優先度の高い順):

1.  ユーザーアカウントの設定。
2.  ユーザーアカウントのデフォルトロールの設定。設定が複数のロールで構成されている場合、設定の適用順序は未定義です。
3.  ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルからの設定。設定が複数のプロファイルで構成されている場合、設定の適用順序は未定義です。
4.  デフォルトでサーバー全体に適用される設定、または[デフォルトプロファイル](/operations/server-configuration-parameters/settings#default_profile)からの設定。

### ロール {#role-management}

ロールは、ユーザーアカウントに付与できるアクセスエンティティのコンテナです。

ロールには以下が含まれます:

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

ロールへの権限付与は、[GRANT](/sql-reference/statements/grant.md)クエリによって行うことができます。ロールから権限を取り消すには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供しています。

#### 行ポリシー {#row-policy-management}


行ポリシーは、ユーザーまたはロールがアクセス可能な行を定義するフィルターです。行ポリシーには、特定のテーブルに対するフィルターと、この行ポリシーを使用するロールやユーザーのリストが含まれます。

:::note
行ポリシーは、読み取り専用アクセス権を持つユーザーに対してのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、行ポリシーの制限は無効になります。
:::

管理クエリ:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 設定プロファイル {#settings-profiles-management}

設定プロファイルは[設定](/operations/settings/index.md)の集合です。設定プロファイルには、設定と制約、およびこのプロファイルが適用されるロールやユーザーのリストが含まれます。

管理クエリ:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### クォータ {#quotas-management}

クォータはリソース使用量を制限します。[クォータ](/operations/quotas.md)を参照してください。

クォータには、特定の期間に対する制限のセットと、このクォータを使用するロールやユーザーのリストが含まれます。

管理クエリ:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL駆動のアクセス制御とアカウント管理の有効化 {#enabling-access-control}

- 設定ストレージ用のディレクトリを設定します。

  ClickHouseは、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path)サーバー設定パラメータで指定されたフォルダーにアクセスエンティティの設定を保存します。

- 少なくとも1つのユーザーアカウントに対してSQL駆動のアクセス制御とアカウント管理を有効にします。

  デフォルトでは、すべてのユーザーに対してSQL駆動のアクセス制御とアカウント管理が無効になっています。`users.xml`設定ファイルで少なくとも1人のユーザーを設定し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、および`show_named_collections_secrets`設定の値を1に設定する必要があります。


## SQLユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloudをご利用の場合は、[クラウドアクセス管理](/cloud/security/console-roles)を参照してください。
:::

この記事では、SQLユーザーとロールの定義の基本、およびデータベース、テーブル、行、列に対する権限とパーミッションの適用方法について説明します。

### SQLユーザーモードの有効化 {#enabling-sql-user-mode}

1.  `users.xml`ファイルの`<default>`ユーザー配下でSQLユーザーモードを有効化します:

    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default`ユーザーは、新規インストール時に作成される唯一のユーザーであり、デフォルトでノード間通信に使用されるアカウントでもあります。

    本番環境では、SQL管理者ユーザーによるノード間通信の設定が完了し、`<secret>`、クラスター認証情報、および/またはノード間HTTPおよびトランスポートプロトコル認証情報によるノード間通信が設定された後、このユーザーを無効化することを推奨します。これは、`default`アカウントがノード間通信に使用されるためです。
    :::

2.  変更を適用するためにノードを再起動します。

3.  ClickHouseクライアントを起動します:
    ```sql
    clickhouse-client --user default --password <password>
    ```

### ユーザーの定義 {#defining-users}

1. SQL管理者アカウントを作成します:
   ```sql
   CREATE USER clickhouse_admin IDENTIFIED BY 'password';
   ```
2. 新しいユーザーに完全な管理者権限を付与します:
   ```sql
   GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
   ```


## ALTER権限 {#alter-permissions}

この記事では、権限の定義方法と、特権ユーザーが`ALTER`文を使用する際の権限の動作について理解を深めることを目的としています。

`ALTER`文はいくつかのカテゴリに分類されており、階層構造を持つものと持たないものがあります。後者は明示的に定義する必要があります。

**データベース、テーブル、ユーザー設定の例**

1. 管理者ユーザーでサンプルユーザーを作成します

```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. サンプルデータベースを作成します

```sql
CREATE DATABASE my_db;
```

3. サンプルテーブルを作成します

```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 権限を付与/取り消しするためのサンプル管理者ユーザーを作成します

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
権限を付与または取り消すには、管理者ユーザーが`WITH GRANT OPTION`権限を持っている必要があります。
例:

```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```

`GRANT`または`REVOKE`で権限を操作するには、ユーザー自身がまずその権限を持っている必要があります。
:::

**権限の付与または取り消し**

`ALTER`の階層構造:

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

1. ユーザーまたはロールへの`ALTER`権限の付与

`GRANT ALTER on *.* TO my_user`を使用すると、最上位の`ALTER TABLE`と`ALTER VIEW`にのみ影響します。他の`ALTER`文は個別に付与または取り消す必要があります。

例えば、基本的な`ALTER`権限を付与する場合:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

結果として得られる権限セット:

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

これにより、上記の例における`ALTER TABLE`と`ALTER VIEW`配下のすべての権限が付与されますが、`ALTER ROW POLICY`などの特定の他の`ALTER`権限は付与されません(階層構造を参照すると、`ALTER ROW POLICY`は`ALTER TABLE`や`ALTER VIEW`の子要素ではないことがわかります)。これらは明示的に付与または取り消す必要があります。

`ALTER`権限の一部のみが必要な場合は、それぞれを個別に付与できます。その権限に下位権限がある場合は、それらも自動的に付与されます。

例:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

付与される権限は次のようになります:

```sql
SHOW GRANTS FOR my_user;
```


```response
SHOW GRANTS FOR my_user

クエリID: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

1行のセット。経過時間: 0.004秒
```

これにより、以下のサブ権限も付与されます。

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. ユーザーおよびロールから `ALTER` 権限を取り消す

`REVOKE` ステートメントは、`GRANT` ステートメントと同様に動作します。

ユーザーやロールにサブ権限が付与されている場合は、そのサブ権限を直接取り消すことも、そのサブ権限が継承しているより上位の権限を取り消すこともできます。

たとえば、ユーザーに `ALTER ADD COLUMN` 権限が付与されている場合

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

クエリID: 27791226-a18f-46c8-b2b4-a9e64baeb683

┌─GRANTS FOR my_user──────────────────────────────────┐
│ GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user │
└─────────────────────────────────────────────────────┘
```

権限は個別に取り消せます。

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

または、上位レベルのいずれかから取り消すこともできます（COLUMN のサブ権限をすべて取り消します）:

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user;
```

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user

Query id: b882ba1b-90fb-45b9-b10f-3cda251e2ccc

Ok.

0行のセット。経過時間: 0.002秒
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

**追加**

特権は、`WITH GRANT OPTION` を持っているだけでなく、その特権自体も保持しているユーザーによって付与される必要があります。

1. 管理ユーザーに特権を付与し、さらに一連の特権を管理できるようにするには\
   次に例を示します：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これでユーザーは `ALTER COLUMN` とそのすべての下位権限を付与または取り消すことができます。

**テスト**

1. `SELECT` 権限を付与します

```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. ユーザーに `ADD COLUMN` 権限を付与する

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 権限が制限されたユーザーでログインする

```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. 列追加のテスト

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
```


┌─name────┬─type───┬─default&#95;type─┬─default&#95;expression─┬─comment─┬─codec&#95;expression─┬─ttl&#95;expression─┐
│ id      │ UInt64 │              │                    │         │                  │                │
│ column1 │ String │              │                    │         │                  │                │
│ column2 │ String │              │                    │         │                  │                │
└─────────┴────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

````

4. カラムの削除をテストする
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
````

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

サーバーから例外を受信しました (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: 権限が不足しています。このクエリを実行するには、my_db.my_tableに対してALTER DROP COLUMN(column2)の権限が必要です。(ACCESS_DENIED)
```

5. 権限を付与して alter admin を検証する

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. alter admin ユーザーでログインします

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

8. ALTER 管理ユーザーが保持しておらず、管理ユーザーに付与されている権限のサブ権限でもない特権を付与しようとするケースをテストします。

```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545

0行のセット。経過時間: 0.004秒

サーバーから例外を受信しました (バージョン 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: 権限が不足しています。このクエリを実行するには、ALTER UPDATE ON my_db.my_table WITH GRANT OPTION の権限付与が必要です。(ACCESS_DENIED)
```

**概要**
`ALTER` 権限は、テーブルおよびビューに対する `ALTER` については階層構造になっていますが、その他の `ALTER` ステートメントについては階層構造ではありません。権限はきめ細かいレベル、または権限のグループ化によって付与でき、同様の方法で取り消すこともできます。権限を付与または取り消すユーザーは、対象ユーザー（自身を含む）に対して権限を設定するために `WITH GRANT OPTION` を持っている必要があり、かつその権限自体も既に保有していなければなりません。実行ユーザーは、自身が `WITH GRANT OPTION` を持っていない場合、自分の権限を取り消すことはできません。
