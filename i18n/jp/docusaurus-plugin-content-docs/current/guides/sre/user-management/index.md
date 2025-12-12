---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 'ユーザーとロール'
title: 'アクセス制御とアカウント管理'
keywords: ['ClickHouse Cloud', 'Access Control', 'User Management', 'RBAC', 'Security']
description: 'ClickHouse Cloudにおけるアクセス制御とアカウント管理について説明します'
doc_type: 'guide'
---

# ClickHouseでのユーザーとロールの作成

ClickHouseは[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control)アプローチに基づいたアクセス制御管理をサポートしています。

ClickHouseのアクセスエンティティ:
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [行ポリシー](#row-policy-management)
- [設定プロファイル](#settings-profiles-management)
- [クォータ](#quotas-management)

アクセスエンティティは次の方法で設定できます:

- SQL駆動型ワークフロー

    この機能を使用するには[有効化](#enabling-access-control)する必要があります。

- サーバー[設定ファイル](/operations/configuration-files.md) `users.xml` および `config.xml`

SQL駆動型ワークフローの使用を推奨します。両方の設定方法は同時に動作するため、サーバー設定ファイルを使用してアカウントとアクセス権を管理している場合でも、SQL駆動型ワークフローにスムーズに移行できます。

:::note
同じアクセスエンティティを両方の設定方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloudコンソールユーザーを管理する場合は、こちらの[ページ](/cloud/security/manage-cloud-users)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなど、およびすべての付与権限を確認するには、[`SHOW ACCESS`](/sql-reference/statements/show#show-access)ステートメントを使用してください。

## 概要 {#access-control-usage}

デフォルトでは、ClickHouseサーバーは`default`ユーザーアカウントを提供しますが、このアカウントではSQL駆動型アクセス制御とアカウント管理を使用できず、すべての権限とパーミッションを持っています。`default`ユーザーアカウントは、ユーザー名が定義されていない場合、たとえばクライアントからのログイン時や分散クエリで使用されます。分散クエリ処理では、サーバーまたはクラスターの設定で[ユーザーとパスワード](/engines/table-engines/special/distributed.md)プロパティが指定されていない場合、defaultユーザーアカウントが使用されます。

ClickHouseを使い始めたばかりの場合は、次のシナリオを検討してください:

1.  `default`ユーザーに対してSQL駆動型アクセス制御とアカウント管理を[有効化](#enabling-access-control)します。
2.  `default`ユーザーアカウントでログインし、必要なすべてのユーザーを作成します。管理者アカウントの作成を忘れないでください(`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`)。
3.  `default`ユーザーの[権限を制限](/operations/settings/permissions-for-queries)し、SQL駆動型アクセス制御とアカウント管理を無効化します。

### 現在のソリューションの特性 {#access-control-properties}

- 存在しないデータベースやテーブルに対しても権限を付与できます。
- テーブルが削除されても、そのテーブルに対応するすべての権限は取り消されません。つまり、後で同じ名前の新しいテーブルを作成しても、すべての権限は有効なままです。削除されたテーブルに対応する権限を取り消すには、たとえば`REVOKE ALL PRIVILEGES ON db.table FROM ALL`クエリを実行する必要があります。
- 権限の有効期限設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouseで誰かを認証するためのアクセスエンティティです。ユーザーアカウントには次のものが含まれます:

- 識別情報
- ユーザーが実行できるクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)
- ClickHouseサーバーへの接続を許可されているホスト
- 割り当てられたロールとデフォルトロール
- ユーザーログイン時にデフォルトで適用される制約付き設定
- 割り当てられた設定プロファイル

権限は[GRANT](/sql-reference/statements/grant.md)クエリまたは[ロール](#role-management)の割り当てによってユーザーアカウントに付与できます。ユーザーから権限を取り消すには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供しています。ユーザーの権限をリストするには、[SHOW GRANTS](/sql-reference/statements/show#show-grants)ステートメントを使用します。

管理クエリ:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 設定の適用 {#access-control-settings-applying}

設定は、ユーザーアカウント、付与されたロール、設定プロファイルで異なる方法で構成できます。ユーザーログイン時に、設定が異なるアクセスエンティティに対して構成されている場合、この設定の値と制約は次のように適用されます(優先度の高い順):

1.  ユーザーアカウントの設定
2.  ユーザーアカウントのデフォルトロールの設定。設定が一部のロールで構成されている場合、設定の適用順序は未定義です。
3.  ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルからの設定。設定が一部のプロファイルで構成されている場合、設定の適用順序は未定義です。
4.  デフォルトでサーバー全体に適用される設定、または[デフォルトプロファイル](/operations/server-configuration-parameters/settings#default_profile)からの設定

### ロール {#role-management}

ロールは、ユーザーアカウントに付与できるアクセスエンティティのコンテナです。

ロールには次のものが含まれます:

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

権限は[GRANT](/sql-reference/statements/grant.md)クエリによってロールに付与できます。ロールから権限を取り消すには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供しています。

#### 行ポリシー {#row-policy-management}

行ポリシーは、ユーザーまたはロールが利用できる行を定義するフィルターです。行ポリシーには、特定のテーブルのフィルター、およびこの行ポリシーを使用すべきロールやユーザーのリストが含まれます。

:::note
行ポリシーは読み取り専用アクセスの場合にのみ意味があります。テーブルを変更したり、テーブル間でパーティションをコピーしたりできる場合、行ポリシーの制限は無効になります。
:::

管理クエリ:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 設定プロファイル {#settings-profiles-management}

設定プロファイルは[設定](/operations/settings/index.md)のコレクションです。設定プロファイルには設定と制約、およびこのプロファイルが適用されるロールやユーザーのリストが含まれます。

管理クエリ:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### クォータ {#quotas-management}

クォータはリソース使用量を制限します。[クォータ](/operations/quotas.md)を参照してください。

クォータには、一定期間の制限セット、およびこのクォータを使用すべきロールやユーザーのリストが含まれます。

管理クエリ:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL駆動型アクセス制御とアカウント管理の有効化 {#enabling-access-control}

- 設定保存用のディレクトリを設定します。

    ClickHouseは、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path)サーバー設定パラメータで設定されたフォルダーにアクセスエンティティ設定を保存します。

- 少なくとも1つのユーザーアカウントに対してSQL駆動型アクセス制御とアカウント管理を有効化します。

    デフォルトでは、SQL駆動型アクセス制御とアカウント管理はすべてのユーザーに対して無効になっています。`users.xml`設定ファイルで少なくとも1人のユーザーを設定し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、`show_named_collections_secrets`設定の値を1に設定する必要があります。

## SQLユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloudで作業している場合は、[Cloudアクセス管理](/cloud/security/console-roles)を参照してください。
:::

この記事では、SQLユーザーとロールを定義し、それらの権限とパーミッションをデータベース、テーブル、行、列に適用する基本について説明します。

### SQLユーザーモードの有効化 {#enabling-sql-user-mode}

1.  `users.xml`ファイルの`<default>`ユーザーでSQLユーザーモードを有効化します:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default`ユーザーは、新規インストール時に作成される唯一のユーザーであり、デフォルトではノード間通信にも使用されるアカウントです。

    本番環境では、ノード間通信がSQL管理ユーザーで設定され、ノード間通信が`<secret>`、クラスター認証情報、および/またはノード間HTTPおよびトランスポートプロトコル認証情報で設定された後、このユーザーを無効にすることを推奨します。`default`アカウントはノード間通信に使用されるためです。
    :::

2. 変更を適用するためにノードを再起動します。

3. ClickHouseクライアントを起動します:
    ```sql
    clickhouse-client --user default --password <password>
    ```
### ユーザーの定義 {#defining-users}

1. SQL管理者アカウントを作成します:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2. 新しいユーザーに完全な管理者権限を付与します
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## ALTER権限 {#alter-permissions}

この記事は、権限の定義方法と、特権ユーザーが`ALTER`ステートメントを使用する際の権限の動作をより理解するためのものです。

`ALTER`ステートメントはいくつかのカテゴリに分かれており、一部は階層的で、一部はそうではなく、明示的に定義する必要があります。

**DBの例、テーブル、ユーザー設定**
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
権限を付与または取り消すには、管理者ユーザーは`WITH GRANT OPTION`権限を持っている必要があります。
例:
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
`GRANT`または`REVOKE`権限を行使するには、ユーザーは最初にそれらの権限自体を持っている必要があります。
:::

**権限の付与または取り消し**

`ALTER`の階層:

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

`GRANT ALTER on *.* TO my_user`を使用すると、トップレベルの`ALTER TABLE`および`ALTER VIEW`にのみ影響します。他の`ALTER`ステートメントは個別に付与または取り消す必要があります。

たとえば、基本的な`ALTER`権限を付与する場合:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

結果として得られる権限のセット:

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

これにより、上記の例の`ALTER TABLE`および`ALTER VIEW`配下のすべての権限が付与されますが、`ALTER ROW POLICY`などの他の特定の`ALTER`権限は付与されません(階層を振り返ると、`ALTER ROW POLICY`は`ALTER TABLE`または`ALTER VIEW`の子ではないことがわかります)。これらは明示的に付与または取り消す必要があります。

`ALTER`権限のサブセットのみが必要な場合は、それぞれを個別に付与できます。その権限にサブ権限がある場合、それらも自動的に付与されます。

例:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

付与される権限:

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

これにより、次のサブ権限も付与されます:

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. ユーザーとロールからの`ALTER`権限の取り消し

`REVOKE`ステートメントは`GRANT`ステートメントと同様に機能します。

ユーザー/ロールにサブ権限が付与されている場合、そのサブ権限を直接取り消すか、それが継承される上位レベルの権限を取り消すことができます。

たとえば、ユーザーに`ALTER ADD COLUMN`が付与されている場合:

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

権限は個別に取り消すことができます:

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

または、上位レベルのいずれかから取り消すことができます(すべてのCOLUMNサブ権限を取り消す):

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

権限は、`WITH GRANT OPTION`を持っているだけでなく、権限自体も持っているユーザーによって付与される必要があります。

1. 管理者ユーザーに権限を付与し、権限セットを管理することを許可するには
以下は例です:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これで、ユーザーは`ALTER COLUMN`とすべてのサブ権限を付与または取り消すことができます。

**テスト**

1. `SELECT`権限を追加します
```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. ユーザーにカラム追加権限を追加します
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 制限されたユーザーでログインします
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

4. カラムの削除をテストします
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

5. 権限を付与してalter adminをテストします
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

8. alter adminユーザーが持っていない権限を付与するテストを行います。これは、adminユーザーの付与権限のサブ権限ではありません。
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

**まとめ**
ALTER権限は、テーブルとビューに関する`ALTER`については階層的ですが、他の`ALTER`ステートメントについては階層的ではありません。権限は、細かいレベルで設定することも、権限のグループ化によって設定することもでき、同様に取り消すこともできます。権限を付与または取り消すユーザーは、ユーザー(実行ユーザー自身を含む)に権限を設定するために`WITH GRANT OPTION`を持っている必要があり、かつすでにその権限を持っている必要があります。実行ユーザーは、自分自身がgrant option権限を持っていない場合、自分自身の権限を取り消すことはできません。
