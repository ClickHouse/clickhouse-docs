---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: 'ユーザーとロール'
title: 'アクセス制御とアカウント管理'
keywords: ['ClickHouse Cloud', 'アクセス制御', 'ユーザー管理', 'RBAC', 'セキュリティ']
description: 'ClickHouse Cloudにおけるアクセス制御とアカウント管理について説明します'
---


# ClickHouseにおけるユーザーとロールの作成

ClickHouseは、[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control)アプローチに基づくアクセス制御管理をサポートしています。

ClickHouseのアクセスエンティティ：
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [行ポリシー](#row-policy-management)
- [設定プロファイル](#settings-profiles-management)
- [クォータ](#quotas-management)

アクセスエンティティは以下の方法で構成できます：

- SQL駆動型ワークフロー。

    この機能を[有効に](#enabling-access-control)する必要があります。

- サーバーの[構成ファイル](/operations/configuration-files.md) `users.xml`と`config.xml`。

SQL駆動型ワークフローの使用をお勧めします。両方の構成方法は同時に機能するので、アカウントとアクセス権の管理にサーバー構成ファイルを使用している場合でも、スムーズにSQL駆動型ワークフローに切り替えることができます。

:::note
同じアクセスエンティティを両方の構成方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloud Consoleのユーザーを管理する場合は、こちらの[ページ](/cloud/security/cloud-access-management)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなど、及びそれらのすべての権限を表示するには、[`SHOW ACCESS`](/sql-reference/statements/show#show-access)ステートメントを使用してください。

## 概要 {#access-control-usage}

デフォルトでは、ClickHouseサーバーは`default`ユーザーアカウントを提供します。このアカウントはSQL駆動型のアクセス制御とアカウント管理を使用することが許可されていませんが、すべての権利と権限を持っています。`default`ユーザーアカウントは、ユーザー名が定義されていない場合、例えばクライアントからのログイン時や分散クエリ時に使用されます。分散クエリ処理では、サーバーまたはクラスターの構成が[ユーザーとパスワード](/engines/table-engines/special/distributed.md)のプロパティを指定していない場合に、デフォルトのユーザーアカウントが使用されます。

ClickHouseを使い始めたばかりの場合は、以下のシナリオを検討してください：

1. `default`ユーザーのためにSQL駆動型のアクセス制御とアカウント管理を[有効に](#enabling-access-control)します。
2. `default`ユーザーアカウントにログインして、必要なすべてのユーザーを作成します。管理者アカウントも作成することを忘れないでください（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）。
3. `default`ユーザーの権限を[制限し](/operations/settings/permissions-for-queries)、そのためのSQL駆動型のアクセス制御とアカウント管理を無効にします。

### 現在のソリューションの特性 {#access-control-properties}

- 存在しないデータベースやテーブルに対しても権限を付与できます。
- テーブルが削除されると、そのテーブルに対応するすべての権利は剥奪されません。これにより、後で同じ名前の新しいテーブルを作成しても、すべての権利が有効なままになります。削除されたテーブルに対応する権利を取り消すには、例えば`REVOKE ALL PRIVILEGES ON db.table FROM ALL`クエリを実行する必要があります。
- 権限に設定された有効期限はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouseで誰かを認証するためのアクセスエンティティです。ユーザーアカウントには以下が含まれます：

- 識別情報。
- ユーザーが実行できるクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)。
- ClickHouseサーバーに接続できるホスト。
- 割り当てられたロールおよびデフォルトロール。
- ユーザーログイン時にデフォルトで適用される設定とその制約。
- 割り当てられた設定プロファイル。

権限は、[GRANT](/sql-reference/statements/grant.md)クエリを使用するか、[ロール](#role-management)を割り当てることによってユーザーアカウントに付与できます。ユーザーから権限を剥奪するには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。ユーザーの権限をリストするには、[SHOW GRANTS](/sql-reference/statements/show#show-grants)ステートメントを使用します。

管理クエリ：

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 設定の適用 {#access-control-settings-applying}

設定は異なる方法で構成できます：ユーザーアカウント、付与されたロール、および設定プロファイル。ユーザーログイン時に、異なるアクセスエンティティのために設定が構成されている場合、その設定の値と制約が次のように適用されます（優先順位の高いものから低いものへ）：

1. ユーザーアカウントの設定。
2. デフォルトロールの設定。このユーザーアカウントの設定がいくつかのロールで構成されている場合、設定の適用順序は定義されていません。
3. ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルからの設定。この設定がいくつかのプロファイルで構成されている場合、設定の適用順序は定義されていません。
4. デフォルトであるいは[デフォルトプロファイル](/operations/server-configuration-parameters/settings#default_profile)からサーバー全体に適用される設定。

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

権限は[GRANT](/sql-reference/statements/grant.md)クエリによってロールに付与できます。ロールから権限を剥奪するにはClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。

#### 行ポリシー {#row-policy-management}

行ポリシーは、ユーザーやロールがどの行にアクセスできるかを定義するフィルターです。行ポリシーは特定のテーブルに対するフィルターと、これを適用すべきロールおよび/またはユーザーのリストを含みます。

:::note
行ポリシーは、読み取り専用アクセスを持つユーザーに対してのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーしたりできる場合、行ポリシーによる制約が無効になります。
:::

管理クエリ：

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 設定プロファイル {#settings-profiles-management}

設定プロファイルは、[設定](/operations/settings/index.md)のコレクションです。設定プロファイルには設定と制約、およびこのプロファイルが適用されるロールおよび/またはユーザーのリストが含まれます。

管理クエリ：

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### クォータ {#quotas-management}

クォータはリソース使用を制限します。詳細は[クォータ](/operations/quotas.md)を参照してください。

クォータは、特定の期間に対する制限のセットと、このクォータを使用すべきロールおよび/またはユーザーのリストを含みます。

管理クエリ：

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL駆動型アクセス制御とアカウント管理の有効化 {#enabling-access-control}

- 構成ストレージのためのディレクトリを設定します。

    ClickHouseは、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path)サーバー構成パラメータで設定されたフォルダーにアクセスエンティティの構成を保存します。

- 少なくとも1つのユーザーアカウントのためにSQL駆動型のアクセス制御とアカウント管理を有効にします。

    デフォルトでは、すべてのユーザーに対してSQL駆動型のアクセス制御とアカウント管理は無効になっています。`users.xml`構成ファイルで少なくとも1つのユーザーを構成し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、および`show_named_collections_secrets`の各設定値を1に設定する必要があります。


## SQLユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloudで作業している場合は、[クラウドアクセス管理](/cloud/security/cloud-access-management)をご覧ください。
:::

この記事では、SQLユーザーとロールの基本的な定義、およびそれらの権限とアクセスをデータベース、テーブル、行、およびカラムに適用する方法を示します。

### SQLユーザーモードの有効化 {#enabling-sql-user-mode}

1. `<default>`ユーザーの下にある`users.xml`ファイルでSQLユーザーモードを有効にします：
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default`ユーザーは、新しいインストール時に作成される唯一のユーザーであり、デフォルトでノード間通信で使用されるアカウントでもあります。

    本番環境では、ノード間通信がSQL管理者ユーザーで構成され、ノード間通信が`<secret>`、クラスターの資格情報、および/またはノード間のHTTPおよびトランスポートプロトコルの資格情報で設定された後に、このユーザーを無効にすることをお勧めします。なぜなら、`default`アカウントはノード間通信に使用されるからです。
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
2. 新しいユーザーに完全な管理権限を付与します
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## ALTER権限 {#alter-permissions}

この記事では、権限を定義する方法や、特権ユーザーに対して`ALTER`ステートメントを使用する際の権限の働きについて説明することを目的としています。

`ALTER`ステートメントは複数のカテゴリに分かれており、それぞれのカテゴリの一部は階層的であり、他の一部は階層的ではなく、明示的に定義される必要があります。

**例：DB、テーブル、およびユーザーの構成**

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

4. 権限を付与/剥奪するためのサンプル管理者ユーザーを作成します
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
権限を付与または剥奪するには、管理者ユーザーは`WITH GRANT OPTION`特権を持っている必要があります。
例えば：
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
権限を`GRANT`または`REVOKE`するには、まずそのユーザー自身がこれらの権限を持っている必要があります。
:::

**権限の付与または剥奪**

`ALTER`階層：

```response
├── ALTER (テーブルとビューのみに適用)/
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

`GRANT ALTER on *.* TO my_user`を使用すると、最上位の`ALTER TABLE`および`ALTER VIEW`にのみ影響します。他の`ALTER`ステートメントは個別に付与または剥奪する必要があります。

例えば、基本的な`ALTER`権限を付与するには：

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

権限セットは次のようになります：

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

これは、`ALTER TABLE`および`ALTER VIEW`のすべての権限を付与しますが、`ALTER ROW POLICY`などの他の特定の`ALTER`権限は付与されません（階層に戻ると、`ALTER ROW POLICY`は`ALTER TABLE`や`ALTER VIEW`の子ではないことがわかります）。これらは明示的に付与または剥奪される必要があります。

必要な`ALTER`権限のサブセットのみが必要な場合は、それぞれを個別に付与できます。その権限にサブ権限がある場合、それらも自動的に付与されます。

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

これにより、次のサブ権限が付与されます：

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. ユーザーとロールから`ALTER`権限を剥奪する

`REVOKE`ステートメントは`GRANT`ステートメントと同様に機能します。

ユーザー/ロールがサブ権限を付与された場合、そのサブ権限を直接剥奪するか、継承された上位権限を剥奪することができます。

例えば、ユーザーが`ALTER ADD COLUMN`権限を付与されていた場合：

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

または、上位レベルから剥奪できます（COLUMNのサブ権限をすべて剥奪する）：

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

権限は、`WITH GRANT OPTION`を持っているだけでなく、自身も権限を持っているユーザーによって付与されなければなりません。

1. 管理者ユーザーに権限を付与し、権限のセットを管理できるようにする例：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これにより、ユーザーは`ALTER COLUMN`およびすべてのサブ権限を付与または剥奪できます。

**テスト**

1. `SELECT`権限を追加します
```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. ユーザーにカラム追加権限を付与します
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 制限付きユーザーでログインします
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. カラム追加をテストします
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

サーバーからの例外を受信しました (バージョン22.5.1):
コード: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: 権限が不十分です。このクエリを実行するには、my_db.my_tableのALTER DROP COLUMN(column2)の権限が必要です。(ACCESS_DENIED)
```

5. 権限を付与して変更管理者をテストします
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. 変更管理者ユーザーでログインします
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

8. 変更管理者ユーザーが持たない権限を付与することをテストします。
```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545


0 rows in set. Elapsed: 0.004 sec.

サーバーからの例外を受信しました (バージョン22.5.1):
コード: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: 権限が不十分です。このクエリを実行するには、my_db.my_tableのALTER UPDATE WITH GRANT OPTIONの権限が必要です。(ACCESS_DENIED)
```

**要約**
ALTER権限は、テーブルとビューのALTERに関しては階層的ですが、他のALTERステートメントには階層的ではありません。権限はグラニュラーなレベルで設定することも、権限のグループ化によって設定することもでき、同様に剥奪することもできます。権限を付与または剥奪するユーザーは、ユーザーに対して権限を設定するために`WITH GRANT OPTION`を持っていなければならず、またその権限をすでに持っている必要があります。アクティングユーザーは、自分自身が権利を持っていない場合には、自らの権利を剥奪することはできません。

