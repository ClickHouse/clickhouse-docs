---
slug: '/operations/access-rights'
sidebar_position: 1
sidebar_label: 'ユーザーとロール'
title: 'アクセス制御とアカウント管理'
keywords:
- 'ClickHouse Cloud'
- 'Access Control'
- 'User Management'
- 'RBAC'
- 'Security'
description: 'ClickHouse Cloud におけるアクセス制御とアカウント管理の説明'
---




# ClickHouseにおけるユーザーとロールの作成

ClickHouseは、[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) アプローチに基づくアクセス制御管理をサポートしています。

ClickHouseのアクセスエンティティ:
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [行ポリシー](#row-policy-management)
- [設定プロファイル](#settings-profiles-management)
- [クォータ](#quotas-management)

アクセスエンティティは次の方法で設定できます:

- SQL駆動型ワークフロー。

    この機能を[有効にする](#enabling-access-control)必要があります。

- サーバーの[設定ファイル](/operations/configuration-files.md) `users.xml` と `config.xml`。

SQL駆動型ワークフローの使用をお勧めします。両方の設定方法は同時に機能するため、アカウントおよびアクセス権を管理するためにサーバー設定ファイルを使用する場合は、スムーズにSQL駆動型ワークフローに切り替えることができます。

:::note
同じアクセスエンティティを両方の設定方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloud Consoleのユーザーを管理する場合は、この[ページ](/cloud/security/cloud-access-management)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなどとその付与内容を確認するには、[`SHOW ACCESS`](/sql-reference/statements/show#show-access) ステートメントを使用します。

## 概要 {#access-control-usage}

デフォルトでは、ClickHouseサーバーは `default` ユーザーアカウントを提供します。このアカウントはSQL駆動型アクセス制御やアカウント管理の使用を許可されていませんが、すべての権限と許可があります。 `default` ユーザーアカウントは、ログイン時にユーザー名が定義されていない場合や、分散クエリの際に使用されます。分散クエリ処理では、サーバーまたはクラスタの構成で[ユーザーとパスワード](/engines/table-engines/special/distributed.md)のプロパティが指定されていない場合、デフォルトのユーザーアカウントが使用されます。

ClickHouseの使用を開始したばかりの場合は、次のシナリオを考慮してください:

1. `default` ユーザーのためにSQL駆動型アクセス制御およびアカウント管理を[有効にする](#enabling-access-control)。
2. `default` ユーザーアカウントにログインし、必要なすべてのユーザーを作成します。管理者アカウントを作成することを忘れないでください（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）。
3. `default` ユーザーのために[権限を制限](/operations/settings/permissions-for-queries)し、そのユーザーに対するSQL駆動型アクセス制御およびアカウント管理を無効にします。

### 現在のソリューションのプロパティ {#access-control-properties}

- 存在しないデータベースやテーブルに対しても権限を付与できます。
- テーブルが削除された場合、そのテーブルに対応するすべての権限は取り消されません。つまり、後で同じ名前の新しいテーブルを作成しても、すべての権限は有効のままとなります。削除されたテーブルに対応する権限を取り消すには、例えば `REVOKE ALL PRIVILEGES ON db.table FROM ALL` クエリを実行する必要があります。
- 権限に対する有効期限の設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouseでの認証を可能にするアクセスエンティティです。ユーザーアカウントには以下が含まれます:

- 識別情報。
- ユーザーが実行できるクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)。
- ClickHouseサーバーに接続できるホスト。
- 複数のロール（役割）。
- ユーザーログイン時に適用される設定とその制約。
- 割り当てられた設定プロファイル。

権限は、[GRANT](/sql-reference/statements/grant.md)クエリを使用してユーザーアカウントに付与することができ、[ロール](#role-management)を割り当てることによっても付与できます。ユーザーから権限を取り消すために、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。ユーザーの権限を一覧表示するには、[SHOW GRANTS](/sql-reference/statements/show#show-grants)ステートメントを使用します。

管理クエリ:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 設定の適用 {#access-control-settings-applying}

設定は異なる方法で構成できます: ユーザーアカウントのために、その付与されたロール内、および設定プロファイルの中で。ユーザーのログイン時に、異なるアクセスエンティティに設定が構成されている場合、設定の値と制約は以下のように適用されます（優先順位が高いものから低いものへ）:

1. ユーザーアカウントの設定。
2. ユーザーアカウントのデフォルトロール用の設定。いくつかのロールに設定が構成されている場合、設定の適用順序は未定義です。
3. ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルからの設定。いくつかのプロファイルに設定が構成されている場合、設定の適用順序は未定義です。
4. デフォルトとして、または[デフォルトプロファイル](/operations/server-configuration-parameters/settings#default_profile)からサーバー全体に適用される設定。

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

権限は、[GRANT](/sql-reference/statements/grant.md)クエリを使用してロールに付与できます。ロールから権限を取り消すために、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。

#### 行ポリシー {#row-policy-management}

行ポリシーは、ユーザーまたはロールにどの行が利用できるかを定義するフィルタです。行ポリシーには特定のテーブルのためのフィルタと、この行ポリシーを使用する必要があるロールやユーザーのリストが含まれます。

:::note
行ポリシーは、読み取り専用アクセスを持つユーザーに対してのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、行ポリシーの制約は無効になります。
:::

管理クエリ:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 設定プロファイル {#settings-profiles-management}

設定プロファイルは、[設定](/operations/settings/index.md)のコレクションです。設定プロファイルには設定や制約が含まれており、このプロファイルが適用されるロールやユーザーのリストも含まれています。

管理クエリ:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### クォータ {#quotas-management}

クォータはリソース使用量を制限します。詳細は[クォータ](/operations/quotas.md)を参照してください。

クォータは、特定の期間のための制限のセットと、このクォータを使用するロールやユーザーのリストを含みます。

管理クエリ:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL駆動型アクセス制御およびアカウント管理の有効化 {#enabling-access-control}

- 設定ストレージ用のディレクトリをセットアップします。

    ClickHouseは、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path)サーバー設定パラメータで設定されたフォルダにアクセスエンティティの設定を保存します。

- 少なくとも1つのユーザーアカウントに対してSQL駆動型アクセス制御およびアカウント管理を有効にします。

    デフォルトでは、すべてのユーザーに対してSQL駆動型アクセス制御とアカウント管理は無効になっています。 `users.xml` 設定ファイルに少なくとも1つのユーザーを構成し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、および `show_named_collections_secrets` の値を 1 に設定する必要があります。

## SQLユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloudを使用している場合は、[クラウドアクセス管理](/cloud/security/cloud-access-management)を参照してください。
:::

この記事では、SQLユーザーおよびロールの定義の基本と、それらの権限や許可をデータベース、テーブル、行、カラムに適用する方法を示します。

### SQLユーザーモードを有効にする {#enabling-sql-user-mode}

1. `<default>` ユーザーの `users.xml` ファイルでSQLユーザーモードを有効にします:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default` ユーザーは、新規インストール時に作成される唯一のユーザーであり、デフォルトではノード間通信に使用されるアカウントでもあります。

    本番環境では、SQL管理ユーザーでノード間通信が構成され、ノード間通信が `<secret>`、クラスタ認証情報、および/またはノード間HTTPおよびトランスポートプロトコル認証情報で設定された後、このユーザーを無効にすることが推奨されます。なぜなら、`default` アカウントはノード間通信に使用されるからです。
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
2. 新しいユーザーにフル管理権限を付与します
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```

## ALTER権限 {#alter-permissions}

この記事は、権限の定義方法や、特権ユーザーが `ALTER` ステートメントを使用する際に権限がどのように機能するかを理解するのに役立つことを目的としています。

`ALTER` ステートメントは、いくつかのカテゴリに分かれており、その中には階層的なものとそうでないものがあり、明示的に定義する必要があります。

**例：DB、テーブル、およびユーザーの構成**
1. 管理ユーザーでサンプルユーザーを作成します
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

4. 権限を付与または取り消すためのサンプル管理ユーザーを作成します
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
権限を付与または取り消すためには、管理ユーザーは `WITH GRANT OPTION` 権限を持っている必要があります。
例えば:
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
権限を `GRANT` または `REVOKE` するためには、そのユーザーはまずその権限を持っている必要があります。
:::

**権限を付与または取り消す**

`ALTER` 階層:

```response
├── ALTER (テーブルとビューのみ)/
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

1. ユーザーまたはロールに `ALTER` 権限を付与する

`GRANT ALTER ON *.* TO my_user`を使用すると、トップレベルの `ALTER TABLE` と `ALTER VIEW` にのみ影響します。他の `ALTER` ステートメントは、個別に付与または取り消す必要があります。

例えば、基本的な `ALTER` 権限を付与する:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

権限の結果セット:

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

これにより、上記の例での `ALTER TABLE` と `ALTER VIEW` の下にあるすべての権限が付与されますが、 `ALTER ROW POLICY` のような他の特定の `ALTER` 権限は付与されません（階層を参照すると、`ALTER ROW POLICY` は `ALTER TABLE` または `ALTER VIEW` の子ではないことがわかります）。それらは明示的に付与または取り消す必要があります。

`ALTER` 権限のサブセットのみが必要な場合は、それぞれを個別に付与できますが、その権限にサブ権限がある場合は自動的に付与されます。

例えば:

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

権限は次のように設定されます:

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

これにより、以下のサブ権限も付与されます:

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. ユーザーとロールから `ALTER` 権限を取り消す

`REVOKE` ステートメントは、`GRANT` ステートメントと同様に機能します。

ユーザー/ロールにサブ権限が付与されている場合、そのサブ権限を直接取り消すか、継承している上位の権限を取り消すことができます。

例えば、ユーザーに `ALTER ADD COLUMN`が付与されている場合

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

または、すべての上位レベルから取り消すこともできます（すべてのCOLUMNサブ権限を取り消す）:

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

権限は、`WITH GRANT OPTION`だけでなく、実際にその権限を持っているユーザーによって付与されなければなりません。

1. 管理ユーザーに権限を付与し、一連の権限を管理できるようにします
以下はその例です:

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これで、ユーザーは `ALTER COLUMN` とそのすべてのサブ権限を付与または取り消すことができます。

**テスト**

1. `SELECT` 権限を追加します
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

4. カラムを追加するテスト
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

4. カラムを削除するテスト
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47


0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: 権限が不足しています。このクエリを実行するには、my_db.my_table の ALTER DROP COLUMN(column2) の権限が必要です。(ACCESS_DENIED)
```

5. 権限を付与するために管理者をテスト
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. アルターユーザーでログインします
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

8. アルターユーザーが持っていない権限を付与しようとするテスト
```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545


0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: 権限が不足しています。このクエリを実行するには、my_db.my_table に対し ALTER UPDATE ON の権限を WITH GRANT OPTION で付与する必要があります。(ACCESS_DENIED)
```

**まとめ**
`ALTER` 権限はテーブルおよびビューに対して階層的ですが、他の `ALTER` ステートメントではそうではありません。権限は細かいレベルで設定することも、一群の権限として設定することもでき、同様に取り消すこともできます。権限を付与または取り消すユーザーには、ユーザーに権限を設定するための `WITH GRANT OPTION` が必要であり、またその権限自体を持っている必要があります。実行ユーザーは、自分自身が権限付与オプションを持っていない場合、自分の権限を取り消すことはできません。
