---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: ユーザーとロール
title: アクセス管理とアカウント管理
keywords: [ClickHouse Cloud, アクセス管理, ユーザー管理, RBAC, セキュリティ]
---


# ClickHouseにおけるユーザーとロールの作成

ClickHouseは、[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) アプローチに基づくアクセス管理をサポートしています。

ClickHouseのアクセスエンティティ:
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [行ポリシー](#row-policy-management)
- [設定プロファイル](#settings-profiles-management)
- [クオータ](#quotas-management)

以下の方法でアクセスエンティティを構成できます:

- SQL駆動のワークフロー。

    この機能を[有効化する](#enabling-access-control)必要があります。

- サーバーの[設定ファイル](/operations/configuration-files.md) `users.xml`と`config.xml`。

SQL駆動のワークフローを使用することを推奨します。両方の設定方法は同時に機能するため、アカウントとアクセス権の管理にサーバー設定ファイルを使用している場合、スムーズにSQL駆動のワークフローに切り替えることができます。

:::note
同じアクセスエンティティを両方の設定方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloud Consoleのユーザーを管理する場合は、この[ページ](/cloud/security/cloud-access-management)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなどを表示し、それらのすべての権限を確認するには、[`SHOW ACCESS`](/sql-reference/statements/show.md#show-access-statement)文を使用します。

## 概要 {#access-control-usage}

デフォルトでは、ClickHouseサーバーは、SQL駆動のアクセス制御およびアカウント管理が許可されていない`default`ユーザーアカウントを提供しますが、すべての権限と許可があります。`default`ユーザーアカウントは、ユーザー名が定義されていない場合に使用され、クライアントからのログインや分散クエリなどのケースで使用されます。分散クエリ処理では、サーバーまたはクラスターの設定が[user and password](/engines/table-engines/special/distributed.md)のプロパティを指定しない場合、`default`ユーザーアカウントが使用されます。

ClickHouseを使い始めたばかりの場合、次のシナリオを考慮してください：

1.  `default`ユーザーのSQL駆動のアクセス制御とアカウント管理を[有効化する](#enabling-access-control)。
2.  `default`ユーザーアカウントにログインし、必要なすべてのユーザーを作成してください。管理者アカウント（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）を作成することを忘れないでください。
3.  `default`ユーザーのための[権限を制限する](/operations/settings/permissions-for-queries.md#permissions_for_queries)と、それに対するSQL駆動のアクセス制御およびアカウント管理を無効化します。

### 現行ソリューションの特性 {#access-control-properties}

- データベースやテーブルが存在しなくても、権限を付与できます。
- テーブルが削除された場合、このテーブルに対応するすべての権利は剥奪されません。これは、後で同じ名前の新しいテーブルを作成しても、すべての権限が有効であることを意味します。削除されたテーブルに対応する権限を剥奪するには、例えば、`REVOKE ALL PRIVILEGES ON db.table FROM ALL`クエリを実行する必要があります。
- 権限の有効期間設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouseで誰かを認証するためのアクセスエンティティです。ユーザーアカウントには次の情報が含まれます：

- 識別情報。
- ユーザーが実行できるクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)。
- ClickHouseサーバーに接続を許可されているホスト。
- 割り当てられたロールおよびデフォルトロール。
- ユーザーログイン時にデフォルトで適用される制約を伴う設定。
- 割り当てられた設定プロファイル。

権限は、[GRANT](/sql-reference/statements/grant.md)クエリまたは[ロール](#role-management)を割り当てることで、ユーザーアカウントに付与できます。また、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供して、ユーザーから権限を剥奪します。ユーザーの権限を一覧表示するには、[SHOW GRANTS](/sql-reference/statements/show.md#show-grants-statement)文を使用します。

管理クエリ：

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user.md#alter-user-statement)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show.md#show-create-user-statement)
- [SHOW USERS](/sql-reference/statements/show.md#show-users-statement)

### 設定の適用 {#access-control-settings-applying}

設定は、ユーザーアカウント、付与されたロール、および設定プロファイルごとに異なる方法で構成できます。ユーザーログイン時に、異なるアクセスエンティティに対して設定が構成されている場合、この設定の値と制約は次のように適用されます（優先度が高いものから低いものへ）：

1.  ユーザーアカウントの設定。
2.  ユーザーアカウントのデフォルトロールの設定。あるロールに設定が構成されている場合、その設定の適用順序は未定義です。
3.  ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルの設定。あるプロファイルに設定が構成されている場合、その設定の適用順序は未定義です。
4.  デフォルトで、または[デフォルトプロファイル](/operations/server-configuration-parameters/settings#default_profile)から適用されるサーバー全体の設定。

### ロール {#role-management}

ロールは、ユーザーアカウントに付与されるアクセスエンティティのコンテナです。

ロールには次のものが含まれます：

- [権限](/sql-reference/statements/grant#privileges)
- 設定と制約
- 割り当てられたロールのリスト

管理クエリ：

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

ロールに権限を付与するには、[GRANT](/sql-reference/statements/grant.md)クエリを使用します。ロールから権限を剥奪するには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。

#### 行ポリシー {#row-policy-management}

行ポリシーは、ユーザーまたはロールに対してどの行が利用可能であるかを定義するフィルターです。行ポリシーは、特定のテーブルに対するフィルターおよびこの行ポリシーを使用する必要がある役割と/またはユーザーのリストを含みます。

:::note
行ポリシーは、読み取り専用アクセスを持つユーザーにのみ意味があります。ユーザーがテーブルを修正したり、テーブル間でパーティションをコピーできる場合、行ポリシーの制限は無効になります。
:::

管理クエリ：

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 設定プロファイル {#settings-profiles-management}

設定プロファイルは、[設定](/operations/settings/index.md)のコレクションです。設定プロファイルには、設定や制約、そしてこのプロファイルが適用される役割やユーザーのリストが含まれます。

管理クエリ：

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### クオータ {#quotas-management}

クオータはリソース使用量を制限します。 [クオータ](/operations/quotas.md)を参照してください。

クオータには、ある期間の制限のセットと、このクオータを使用する役割やユーザーのリストが含まれます。

管理クエリ：

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL駆動アクセス制御とアカウント管理の有効化 {#enabling-access-control}

- 設定ストレージ用のディレクトリをセットアップします。

    ClickHouseは、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path)サーバー設定パラメーターで設定されたフォルダーにアクセスエンティティの設定を保存します。

- 少なくとも1つのユーザーアカウントについて、SQL駆動のアクセス制御およびアカウント管理を有効にします。

    デフォルトでは、すべてのユーザーに対してSQL駆動のアクセス制御およびアカウント管理は無効です。`users.xml`設定ファイルに少なくとも1つのユーザーを構成し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、及び`show_named_collections_secrets`の設定を1に設定する必要があります。

## SQLユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloudで作業している場合は、[Cloudアクセス管理](/cloud/security/cloud-access-management)を参照してください。
:::

この記事では、SQLユーザーとロールの定義の基本、およびそれらの権限とアクセスをデータベース、テーブル、行、およびカラムに適用する方法を示します。

### SQLユーザーモードの有効化 {#enabling-sql-user-mode}

1.  `<default>`ユーザーの`users.xml`ファイルでSQLユーザーモードを有効にします：
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default`ユーザーは、初回インストール時に作成される唯一のユーザーであり、デフォルトではノード間通信に使用されるアカウントです。

    本番環境では、SQL管理者ユーザーでノード間通信が設定されたら、このユーザーを無効にすることをお勧めします。また、`<secret>`、クラスターの資格情報、またはノード間のHTTPおよびトランスポートプロトコルの資格情報でノード間通信が設定されますので、`default`アカウントはノード間通信に使用されます。
    :::

2.  変更を適用するためにノードを再起動します。

3.  ClickHouseクライアントを起動します：
    ```sql
    clickhouse-client --user default --password <password>
    ```

### ユーザーの定義 {#defining-users}

1. SQL管理者アカウントを作成します：
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. 新しいユーザーに完全な管理権限を付与します：
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## ALTER権限 {#alter-permissions}

この記事は、権限を定義する方法と、特権ユーザーが`ALTER`文を使用したときに権限がどのように機能するかについて、より良い理解を提供することを目的としています。

`ALTER`文は、いくつかのカテゴリに分かれており、いくつかは階層的であり、いくつかは階層的でないため、明示的に定義する必要があります。

**例のDB、テーブル、およびユーザー構成**
1. 管理者ユーザーでサンプルユーザーを作成します。
```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. サンプルデータベースを作成します。
```sql
CREATE DATABASE my_db;
```

3. サンプルテーブルを作成します。
```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 権限を付与/剥奪するためのサンプル管理者ユーザーを作成します。
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
権限を付与または剥奪するには、管理者ユーザーは`WITH GRANT OPTION`権限を持っている必要があります。
例えば：
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
権限を`GRANT`または`REVOKE`するには、ユーザー自身が最初にそれらの権限を持っている必要があります。
:::

**権限の付与または剥奪**

`ALTER`の階層：

```response
├── ALTER (テーブルおよびビュー専用)/
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

1. ユーザーまたはロールに`ALTER`権限を付与する

`GRANT ALTER on *.* TO my_user`を使用すると、最上位の`ALTER TABLE`と`ALTER VIEW`のみが影響を受け、他の`ALTER`文は個別に付与または剥奪する必要があります。

例えば、基本的な`ALTER`権限を付与する場合：

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

権限のセットは次のようになります：

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

これにより、上記の例から`ALTER TABLE`および`ALTER VIEW`の下のすべての権限が付与されますが、`ALTER ROW POLICY`などの他の`ALTER`権限は付与されません（階層を参照すると、`ALTER ROW POLICY`は`ALTER TABLE`や`ALTER VIEW`の子ではないことがわかります）。これらは明示的に付与または剥奪する必要があります。

必要な`ALTER`権限のサブセットだけが必要な場合は、各権限を個別に付与できます。サブ権限がその権限にある場合、それらも自動的に付与されます。

例えば：

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

付与された権限は次のようになります：

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

これにより、次のサブ権限も付与されます：

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. ユーザーおよびロールから`ALTER`権限を剥奪する

`REVOKE`文は、`GRANT`文と同様に機能します。

ユーザー/ロールにサブ権限が付与されていた場合、そのサブ権限を直接剥奪するか、継承した上位権限を剥奪できます。

例えば、ユーザーに`ALTER ADD COLUMN`が付与されていた場合：

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

権限は個別に剥奪できます：

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

または、上位レベルから剥奪することもできます（COLUMNサブ権限をすべて剥奪する）：

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

**追加情報**

権限は、`WITH GRANT OPTION`を持っているだけでなく、自身がその権限を持っているユーザーによって付与される必要があります。

1. 管理者ユーザーに権限を付与し、権限のセットを管理できるようにする例を以下に示します：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これで、そのユーザーは`ALTER COLUMN`およびすべてのサブ権限を付与または剥奪できるようになります。

**テスト**

1. `SELECT`権限を追加します：
```sql
GRANT SELECT ON my_db.my_table TO my_user;
```

2. ユーザーにカラム追加権限を追加します：
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 制限されたユーザーでログインします：
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. カラムを追加するテストを行います：
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

4. カラムを削除するテストを行います：
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: 権限が不十分です。このクエリを実行するには、my_db.my_tableでALTER DROP COLUMN(column2)の権限が必要です。 (ACCESS_DENIED)
```

5. 権限を付与することでalter administratorをテストします。
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. alter administratorユーザーでログインします。
```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. サブ権限を付与します：
```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. alter adminユーザーが持っていない権限を付与しようとすると、管理者ユーザーが持っている権限のサブ権限ではない場合はエラーになります。
```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: 権限が不十分です。このクエリを実行するには、my_db.my_tableでALTER UPDATE ON my_db.my_table WITH GRANT OPTIONの権限が必要です。(ACCESS_DENIED)
```

**要約**
`ALTER`権限は、テーブルやビューに対しては階層的ですが、他の`ALTER`文に対してはそうではありません。権限は、詳細なレベルで設定することも、権限のグループ化で設定することもでき、剥奪も同様です。権限を付与または剥奪するユーザーは、付与する権限を持ち、`WITH GRANT OPTION`を持っている必要があります。また、権限を剥奪しているユーザーは、自己自身の権限を剥奪できません。

