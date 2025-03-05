---
slug: /operations/access-rights
sidebar_position: 1
sidebar_label: ユーザーとロール
title: アクセス制御とアカウント管理
keywords: [ClickHouse Cloud, アクセス制御, ユーザー管理, RBAC, セキュリティ]
---


# ClickHouseでのユーザーとロールの作成

ClickHouseは、[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control)アプローチに基づくアクセス制御管理をサポートしています。

ClickHouseのアクセスエンティティ:
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [行ポリシー](#row-policy-management)
- [設定プロファイル](#settings-profiles-management)
- [クォータ](#quotas-management)

アクセスエンティティは以下を使用して構成できます:

- SQL駆動のワークフロー。

    この機能を[有効にする](#enabling-access-control)必要があります。

- サーバーの[構成ファイル](/operations/configuration-files.md) `users.xml`および`config.xml`。

我々はSQL駆動のワークフローの使用を推奨します。両方の構成方法は同時に機能し、サーバーの構成ファイルを使用してアカウントおよびアクセス権を管理している場合、SQL駆動のワークフローにスムーズに切り替えることができます。

:::note
同じアクセスエンティティを両方の構成方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloud Consoleユーザーを管理する場合は、この[ページ](/cloud/security/cloud-access-management)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなど、及びそのすべての権限を表示するには、[`SHOW ACCESS`](/sql-reference/statements/show#show-access)文を使用してください。

## 概要 {#access-control-usage}

デフォルトでは、ClickHouseサーバは`default`ユーザーアカウントを提供しており、このアカウントはSQL駆動のアクセス制御およびアカウント管理を使用することは許可されていませんが、すべての権利と権限を持っています。`default`ユーザーアカウントは、ユーザー名が定義されていない場合、例としてクライアントからのログインや分散クエリの処理で使用されます。分散クエリ処理では、サーバーまたはクラスタの設定が[user and password](/engines/table-engines/special/distributed.md)プロパティを指定していない場合に、デフォルトのユーザーアカウントが使用されます。

ClickHouseの使用を始めたばかりの場合、次のシナリオを検討してください：

1. `default`ユーザーのSQL駆動アクセス制御およびアカウント管理を[有効にする](#enabling-access-control)。
2. `default`ユーザーアカウントにログインし、必要なすべてのユーザーを作成します。管理者アカウントを作成することを忘れないでください（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）。
3. `default`ユーザーの権限を[制限する](/operations/settings/permissions-for-queries)とともに、SQL駆動のアクセス制御およびアカウント管理を無効にします。

### 現在のソリューションの特性 {#access-control-properties}

- 存在しないデータベースやテーブルに対しても権限を付与できます。
- テーブルが削除された場合、このテーブルに対応するすべての権限が取り消されることはありません。つまり、後で同じ名前の新しいテーブルを作成した場合でも、すべての権限が有効なままです。削除されたテーブルに対応する権限を取り消すには、例えば`REVOKE ALL PRIVILEGES ON db.table FROM ALL`クエリを実行する必要があります。
- 権限に対する有効期限の設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouse内で何かを認証することを可能にするアクセスエンティティです。ユーザーアカウントには以下が含まれます：

- 身元情報。
- ユーザーが実行できるクエリの範囲を定義する[特権](/sql-reference/statements/grant.md#privileges)。
- ClickHouseサーバーに接続を許可されているホスト。
- 割り当てられたロールおよびデフォルトのロール。
- ユーザーのログイン時にデフォルトで適用される制約を持つ設定。
- 割り当てられた設定プロファイル。

特権は、[GRANT](/sql-reference/statements/grant.md)クエリによってユーザーアカウントに付与することができ、または[ロール](#role-management)を割り当てることによって付与できます。ユーザーから特権を取り消すには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。ユーザーの特権をリストするには、[SHOW GRANTS](/sql-reference/statements/show#show-grants)文を使用します。

管理クエリ:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 設定の適用 {#access-control-settings-applying}

設定は、ユーザーアカウント、付与されたロール、および設定プロファイルに対して異なって構成できます。ユーザーのログイン時に、設定が異なるアクセスエンティティに対して構成されている場合、この設定の値と制約は以下のように優先順位が適用されます（高い方から低い方へ）：

1. ユーザーアカウント設定。
2. ユーザーアカウントのデフォルトロールの設定。ロールのいくつかに設定が構成されている場合、設定の適用順序は未定義です。
3. ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルの設定。いくつかのプロファイルに設定が構成されている場合、設定の適用順序は未定義です。
4. デフォルトでサーバ全体に適用される設定、または[デフォルトプロファイル](/operations/server-configuration-parameters/settings#default_profile)からの設定。

### ロール {#role-management}

ロールは、ユーザーアカウントに付与できるアクセスエンティティのコンテナです。

ロールは以下を含みます：

- [特権](/sql-reference/statements/grant#privileges)
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

特権は[GRANT](/sql-reference/statements/grant.md)クエリによってロールに与えられることができます。ロールから特権を取り消すために、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。

#### 行ポリシー {#row-policy-management}

行ポリシーは、ユーザーまたはロールにどの行が利用可能かを定義するフィルターです。行ポリシーは特定のテーブルのフィルターを含み、この行ポリシーを使用すべきロールおよび/またはユーザーのリストも含みます。

:::note
行ポリシーは、読み取り専用アクセスを持つユーザーにのみ意味があります。ユーザーがテーブルを修正したり、テーブル間でパーティションをコピーできる場合、行ポリシーの制限は無効になります。
:::

管理クエリ:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 設定プロファイル {#settings-profiles-management}

設定プロファイルは、[設定](/operations/settings/index.md)のコレクションです。設定プロファイルには、設定と制約、およびこのプロファイルが適用されるロールやユーザーのリストが含まれています。

管理クエリ:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### クォータ {#quotas-management}

クォータはリソース使用を制限します。詳細は[クォータ](/operations/quotas.md)を参照してください。

クォータには、一定の期間にわたる制限のセットと、このクォータを使用すべきロールやユーザーのリストが含まれています。

管理クエリ:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL駆動のアクセス制御およびアカウント管理の有効化 {#enabling-access-control}

- 構成保存用ディレクトリをセットアップします。

    ClickHouseは、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path)サーバ構成パラメータで設定されたフォルダーにアクセスエンティティの構成を保存します。

- 少なくとも1つのユーザーアカウントのSQL駆動のアクセス制御およびアカウント管理を有効にします。

    デフォルトでは、すべてのユーザーに対してSQL駆動のアクセス制御およびアカウント管理は無効です。`users.xml`構成ファイルで少なくとも1つのユーザーを構成し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、`show_named_collections_secrets`の各設定の値を1に設定する必要があります。


## SQLユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloudで作業している場合は、[Cloudアクセス管理](/cloud/security/cloud-access-management)を参照してください。
:::

この記事では、SQLユーザーとロールを定義する基本と、それらの特権や権限をデータベース、テーブル、行、カラムに適用する方法を示します。

### SQLユーザーモードの有効化 {#enabling-sql-user-mode}

1. `users.xml`ファイルの`<default>`ユーザーの下でSQLユーザーモードを有効にします：
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default`ユーザーは、新しいインストール時にのみ作成される唯一のユーザーであり、デフォルトではノード間通信にも使用されます。

    本番環境では、このユーザーをSQL管理者ユーザーでノード間通信が設定された後に無効にすることをお勧めします。なぜなら、`default`アカウントはノード間通信に使用されるからです。
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

この記事は、権限を定義する方法と、特権ユーザーが`ALTER`文を使用する際に権限がどのように機能するかを理解するのに役立つことを目的としています。

`ALTER`文は、いくつかのカテゴリに分かれており、一部は階層的で、一部は明示的に定義する必要があります。

**サンプルDB、テーブル、ユーザー構成**
1. 管理者ユーザーでサンプルユーザーを作成します：
```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. サンプルデータベースを作成します：
```sql
CREATE DATABASE my_db;
```

3. サンプルテーブルを作成します：
```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 権限の付与や取り消しをするためのサンプル管理ユーザーを作成します：
```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
権限の付与や取り消しを行うには、管理ユーザーが`WITH GRANT OPTION`特権を有している必要があります。例えば：
  ```sql
  GRANT ALTER ON my_db.* WITH GRANT OPTION
  ```
権限を`GRANT`または`REVOKE`するには、ユーザー自身がそれらの権限を最初に持っている必要があります。
:::

**権限の付与または取り消し**

`ALTER`の階層：

```response
├── ALTER (テーブルとビューのみに対応)/
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

`GRANT ALTER on *.* TO my_user`を使用することで、トップレベルの`ALTER TABLE`および`ALTER VIEW`にのみ影響します。他の`ALTER`文は個別に付与または取り消す必要があります。

例えば、基本的な`ALTER`権限を付与します：

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

権限のセットをリストします：

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

これにより、上記の例の`ALTER TABLE`および`ALTER VIEW`の下にあるすべての権限が付与されますが、`ALTER ROW POLICY`などの特定の他の`ALTER`権限は付与されません（階層に戻ってみると、`ALTER ROW POLICY`は`ALTER TABLE`や`ALTER VIEW`の子ではないことがわかります）。これらは明示的に付与または取り消す必要があります。

もし必要なのが`ALTER`権限のサブセットだけであれば、それぞれを個別に付与できます。もしその権限にサブ権限がある場合、それらも自動的に付与されます。

例えば：

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

付与された権限は以下のようになります：

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: 47b3d03f-46ac-4385-91ec-41119010e4e2

┌─GRANTS FOR my_user────────────────────────────────┐
│ GRANT ALTER COLUMN ON default.my_table TO my_user │
└───────────────────────────────────────────────────┘

1行の結果。経過時間: 0.004秒。
```

これにより、以下のサブ権限も付与されます：

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. ユーザーとロールから`ALTER`権限を取り消す

`REVOKE`文は`GRANT`文と同様に機能します。

ユーザー/ロールにサブ権限が付与されている場合、そのサブ権限を直接取り消すか、上位レベルの権限を取り消すことができます。

例えば、ユーザーに`ALTER ADD COLUMN`が付与されている場合：

```sql
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user;
```

```response
GRANT ALTER ADD COLUMN ON my_db.my_table TO my_user

Query id: 61fe0fdc-1442-4cd6-b2f3-e8f2a853c739

Ok.

0行の結果。経過時間: 0.002秒。
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

または、上位のすべてのレベルから取り消すことができます（COLUMNサブ権限のすべてを取り消します）：

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user;
```

```response
REVOKE ALTER COLUMN ON my_db.my_table FROM my_user

Query id: b882ba1b-90fb-45b9-b10f-3cda251e2ccc

Ok.

0行の結果。経過時間: 0.002秒。
```

```sql
SHOW GRANTS FOR my_user;
```

```response
SHOW GRANTS FOR my_user

Query id: e7d341de-de65-490b-852c-fa8bb8991174

Ok.

0行の結果。経過時間: 0.003秒。
```

**追加情報**

権限は、`WITH GRANT OPTION`を持つだけでなく、その権限自体を持つユーザーによって付与されなければなりません。

1. 管理ユーザーにその権限を付与し、さらに権限のセットを管理できるようにする
以下はその例です：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これにより、ユーザーは`ALTER COLUMN`およびすべてのサブ権限を付与または取り消すことができます。

**テスト**

1. `SELECT`権限を追加します：
```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. ユーザーに追加カラム権限を追加します：
```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 制限されたユーザーでログインします：
```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. カラムを追加するテストを実施します：
```sql
ALTER TABLE my_db.my_table ADD COLUMN column2 String;
```

```response
ALTER TABLE my_db.my_table
    ADD COLUMN `column2` String

Query id: d5d6bfa1-b80c-4d9f-8dcd-d13e7bd401a5

Ok.

0行の結果。経過時間: 0.010秒。
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

4. カラム削除のテスト：
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
```

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47


0行の結果。経過時間: 0.004秒。

サーバーからの例外を受信しました (バージョン 22.5.1):
コード: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: 権限が不足しています。このクエリを実行するには、my_db.my_tableに対するALTER DROP COLUMN(column2)の権限が必要です。(ACCESS_DENIED)
```

5. アルタ管理者によって権限を付与するテスト：
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. アルタ管理者ユーザーでログインします：
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

8. アルタ管理者ユーザーが持っていない権限を付与するテスト（管理者ユーザーの付与のサブ権限でない）：
```sql
GRANT ALTER UPDATE ON my_db.my_table TO my_user;
```

```response
GRANT ALTER UPDATE ON my_db.my_table TO my_user

Query id: 191690dc-55a6-4625-8fee-abc3d14a5545


0行の結果。経過時間: 0.004秒。

サーバーからの例外を受信しました (バージョン 22.5.1):
コード: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_alter_admin: 権限が不足しています。このクエリを実行するには、my_db.my_tableに対するALTER UPDATEの権限が必要です。(ACCESS_DENIED)
```

**まとめ**
`ALTER`権限は、テーブルおよびビューに対しては階層的ですが、他の`ALTER`文についてはそうではありません。権限は細かく設定することも、権限のグループとして設定することもでき、同様に取り消すことができます。権限を付与または取り消すユーザーは、ユーザーに対して権限を設定するために、`WITH GRANT OPTION`を持っている必要があり、またその権限を最初に持っていなければなりません。操作を行うユーザーが自分自身の権限を取り消すことはできません。
