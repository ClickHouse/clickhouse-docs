---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: ユーザーとロール
title: アクセス制御とアカウント管理
keywords: [ClickHouse Cloud, アクセス制御, ユーザー管理, RBAC, セキュリティ]
---

# ClickHouseにおけるユーザーとロールの作成

ClickHouseは、[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control)アプローチに基づいたアクセス制御管理をサポートしています。

ClickHouseのアクセスエンティティ:
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [行ポリシー](#row-policy-management)
- [設定プロファイル](#settings-profiles-management)
- [クォータ](#quotas-management)

アクセスエンティティは次の方法で構成できます：

- SQL主導のワークフロー。

    この機能を[有効にする](#enabling-access-control)必要があります。

- サーバーの[設定ファイル](/operations/configuration-files.md) `users.xml`および `config.xml`。

SQL主導のワークフローを使用することをお勧めします。どちらの設定方法も同時に機能するため、アカウントとアクセス権の管理にサーバー設定ファイルを使用する場合でも、スムーズにSQL主導のワークフローに切り替えることができます。

:::note
同じアクセスエンティティを両方の設定方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloud Consoleのユーザーを管理したい場合は、こちらの[ページ](/cloud/security/cloud-access-management)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなどとその権限のリストを表示するには、[`SHOW ACCESS`](/sql-reference/statements/show.md#show-access-statement)ステートメントを使用します。

## 概要 {#access-control-usage}

デフォルトでは、ClickHouseサーバーは、SQL主導のアクセス制御およびアカウント管理を許可しない`default`ユーザーアカウントを提供しますが、すべての権限と許可を持っています。`default`ユーザーアカウントは、ユーザー名が定義されていない場合、例えばクライアントからのログインや分散クエリにおいて使用されます。分散クエリ処理では、サーバーまたはクラスタの構成で[user and password](/engines/table-engines/special/distributed.md)プロパティが指定されていない場合にデフォルトのユーザーアカウントが使用されます。

ClickHouseの使用を始めたばかりである場合、次のシナリオを考慮してください：

1. `default`ユーザーのためにSQL主導のアクセス制御とアカウント管理を[有効にする](#enabling-access-control)。
2. `default`ユーザーアカウントにログインし、必要なすべてのユーザーを作成します。管理者アカウント（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）の作成もお忘れなく。
3. `default`ユーザーの権限を[制限する](/operations/settings/permissions-for-queries.md#permissions_for_queries)と、SQL主導のアクセス制御およびアカウント管理を無効にします。

### 現在のソリューションのプロパティ {#access-control-properties}

- データベースとテーブルに対する権限を、存在しなくても付与できます。
- テーブルが削除された場合、そのテーブルに対応するすべての権限は取り消されません。これは、後で同じ名前の新しいテーブルを作成しても、すべての権限が有効なまま残ることを意味します。削除されたテーブルに対応する権限を取り消すには、例えば `REVOKE ALL PRIVILEGES ON db.table FROM ALL` クエリを実行する必要があります。
- 権限に有効期限に関する設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouseで誰かを認証できるアクセスエンティティです。ユーザーアカウントには以下が含まれます：

- 身分証明情報。
- ユーザーが実行できるクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)。
- ClickHouseサーバーに接続を許可されたホスト。
- 割り当てられたロールとデフォルトロール。
- ユーザーログイン時にデフォルトで適用された制約を持つ設定。
- 割り当てられた設定プロファイル。

権限は、[GRANT](/sql-reference/statements/grant.md)クエリを使用してユーザーアカウントに付与したり、[ロール](#role-management)を割り当てたりできます。ユーザーから権限を取り消すために、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。ユーザーの権限をリスト表示するには、[SHOW GRANTS](/sql-reference/statements/show.md#show-grants-statement)ステートメントを使用してください。

管理クエリ：

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user.md#alter-user-statement)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show.md#show-create-user-statement)
- [SHOW USERS](/sql-reference/statements/show.md#show-users-statement)

### 設定の適用 {#access-control-settings-applying}

設定は、ユーザーアカウント、付与されたロール、設定プロファイルに対して異なる方法で構成できます。ユーザーログイン時に、設定が異なるアクセスエンティティに対して構成されている場合、この設定の値と制約は以下の優先順位で適用されます（高いものから低いものへ）：

1. ユーザーアカウント設定。
2. ユーザーアカウントのデフォルトロールの設定。設定が複数のロールに構成されている場合、設定の適用順序は未定義です。
3. ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルからの設定。設定が複数のプロファイルに構成されている場合、設定の適用順序は未定義です。
4. サーバー全体にデフォルトまたは[デフォルトプロファイル](/operations/server-configuration-parameters/settings#default_profile)から適用される設定。

### ロール {#role-management}

ロールは、ユーザーアカウントに付与できるアクセスエンティティのコンテナです。

ロールには以下が含まれます：

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

権限は[GRANT](/sql-reference/statements/grant.md)クエリを使用してロールに付与できます。ロールから権限を取り消すために、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。

#### 行ポリシー {#row-policy-management}

行ポリシーは、ユーザーまたはロールにどの行が利用可能であるかを定義するフィルターです。行ポリシーには特定のテーブルのフィルターが含まれ、この行ポリシーを使用する必要のあるロールおよび/またはユーザーのリストも含まれます。

:::note
行ポリシーは、読み取り専用アクセス権を持つユーザーに対してのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーしたりできる場合、行ポリシーの制約は無効化されます。
:::

管理クエリ：

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 設定プロファイル {#settings-profiles-management}

設定プロファイルは、[設定](/operations/settings/index.md)のコレクションです。設定プロファイルには設定と制約が含まれ、このプロファイルが適用されるロールおよび/またはユーザーのリストも含まれます。

管理クエリ：

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### クォータ {#quotas-management}

クォータはリソースの使用を制限します。詳細は[Quotas](/operations/quotas.md)を参照してください。

クォータには、特定の期間の制限のセットと、このクォータを使用する必要のあるロールおよび/またはユーザーのリストが含まれます。

管理クエリ：

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL主導のアクセス制御とアカウント管理の有効化 {#enabling-access-control}

- 構成ストレージ用のディレクトリを設定します。

    ClickHouseは、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path)サーバー設定パラメータで設定されたフォルダにアクセスエンティティの設定を保存します。

- 少なくとも1つのユーザーアカウントについて、SQL主導のアクセス制御とアカウント管理を有効にする。

    デフォルトでは、すべてのユーザーに対してSQL主導のアクセス制御およびアカウント管理は無効になっています。`users.xml`設定ファイルで少なくとも1つのユーザーを構成し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、および`show_named_collections_secrets`の設定を1に設定する必要があります。

## SQLユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloudで作業している場合は、[Cloud access management](/cloud/security/cloud-access-management)をご覧ください。
:::

この記事では、SQLユーザーとロールの定義の基本、およびそれらの権限と許可をデータベース、テーブル、行、列に適用する方法を示します。

### SQLユーザーモードの有効化 {#enabling-sql-user-mode}

1. `users.xml`ファイル内の`<default>`ユーザーでSQLユーザーモードを有効にします：
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default`ユーザーは新しいインストール時に作成される唯一のユーザーであり、デフォルトでノード間通信に使用されるアカウントでもあります。

    本番環境では、ノード間通信がSQL管理ユーザーで構成され、ノード間通信が`<secret>`、クラスタ資格情報、またはノード間HTTPおよびトランスポートプロトコル資格情報で設定されたら、このユーザーを無効にすることをお勧めします。なぜなら、`default`アカウントはノード間通信に使用されるからです。
    :::

2. 変更を適用するためにノードを再起動します。

3. ClickHouseクライアントを起動します：
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

この記事は、権限の定義方法、および特権ユーザーによる`ALTER`ステートメントの使用時に権限がどのように機能するかについての理解を深めることを目的としています。

`ALTER`ステートメントは、いくつかのカテゴリに分かれており、その一部は階層的で、一部はそうではなく、明示的に定義する必要があります。

**例：DB、テーブル、ユーザーの構成**
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

4. 権限を付与/取り消すためのサンプル管理者ユーザーを作成します
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
権限を付与または取り消すためには、管理者ユーザーが`WITH GRANT OPTION`権限を持っている必要があります。
例えば：
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
権限を`GRANT`または`REVOKE`するには、ユーザー自身がその権限を最初に保持している必要があります。
:::

**権限の付与または取り消し**

`ALTER`階層：

```response
├── ALTER（テーブルとビュー専用）/
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

`GRANT ALTER on *.* TO my_user`を使用すると、トップレベルの`ALTER TABLE`と`ALTER VIEW`のみに影響し、他の`ALTER`ステートメントは個別に付与または取り消す必要があります。

例えば、基本的な`ALTER`権限を付与する：

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

権限のセットを表示：

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 706befbc-525e-4ec1-a1a2-ba2508cc09e3

┌─GRANTS FOR my_user───────────────────────────────────────────┐
│ GRANT ALTER TABLE, ALTER VIEW ON my_db.my_table TO my_user   │
└──────────────────────────────────────────────────────────────┘
```

これは、上記の例から`ALTER TABLE`および`ALTER VIEW`の下のすべての権限を付与しますが、`ALTER ROW POLICY`などの特定の他の`ALTER`権限は付与されません（階層を参照すると、`ALTER ROW POLICY`は`ALTER TABLE`または`ALTER VIEW`の子ではないことがわかります）。それらは明示的に付与または取り消す必要があります。

必要な`ALTER`権限のサブセットのみが必要な場合、それぞれを個別に付与できます。もしその権限にサブ権限があるなら、それも自動的に付与されます。

例えば：

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

権限が設定される：

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

2. ユーザーやロールから`ALTER`権限を取り消す

`REVOKE`ステートメントは、`GRANT`ステートメントと同様に機能します。

ユーザー/ロールがサブ権限を付与されていた場合、直接そのサブ権限を取り消すか、継承された上位権限を取り消すことができます。

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

権限は個別に取り消すことができます：

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

または、上位レベルから取り消すこともできます（COLUMNサブ権限のすべてを取り消す）：

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

**追加**

権限は、`WITH GRANT OPTION`だけでなく、その権限を自身がすでに持っているユーザーによって付与されなければなりません。

1. 管理者ユーザーに権限を付与し、その権限を一群として管理できるようにする
以下はその例です：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これにより、ユーザーは`ALTER COLUMN`およびすべてのサブ権限を付与または取り消すことができます。

**テスト**

1. `SELECT`権限を追加します
```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. ユーザーにカラム追加権限を追加します
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 制限付きユーザーでログインします
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. カラムの追加をテストします
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

4. カラム削除をテストします
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

サーバーから例外を受信しました (バージョン 22.5.1):
コード: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: 権限が不十分です。このクエリを実行するには、my_db.my_tableのALTER DROP COLUMN(column2)が必要です。（ACCESS_DENIED）
```

5. 権限を付与することによるalter adminのテスト
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. alter adminユーザーでログインします
```bash
clickhouse-client --user my_alter_admin --password password --port 9000 --host <my_clickhouse_host>
```

7. サブ権限を付与します
```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 1c7622fa-9df1-4c54-9fc3-f984c716aeba

Ok.
```

8. alter adminユーザーが持たない権限を付与しようとする場合、それは管理者ユーザーの権限内にないサブ権限です。
```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545

0 rows in set. Elapsed: 0.004 sec.

サーバーから例外を受信しました (バージョン 22.5.1):
コード: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: 権限が不十分です。このクエリを実行するには、my_db.my_tableのALTER UPDATEが必要で、WITH GRANT OPTIONも必要です。(ACCESS_DENIED)
```

**概要**
ALTER権限は、テーブルおよびビューに対しては階層的ですが、他の`ALTER`ステートメントに対してはそうではありません。権限は詳細なレベルまたは権限のグループ化によって設定され、同様に取り消すこともできます。権限を付与または取り消すユーザーは、他のユーザーに権限を設定するために`WITH GRANT OPTION`を有する必要があり、アクションを行うユーザー自身もその権限を保持している必要があります。アクションを行うユーザーは、権限オプションを保持していない場合、自身の権限を取り消すことはできません。
