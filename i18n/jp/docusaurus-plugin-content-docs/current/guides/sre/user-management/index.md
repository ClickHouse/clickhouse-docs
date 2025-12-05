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

ClickHouse は、[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) アプローチに基づいたアクセス制御管理をサポートしています。

ClickHouse のアクセスエンティティ：
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [Row Policy](#row-policy-management)
- [Settings Profile](#settings-profiles-management)
- [Quota](#quotas-management)

次の方法でアクセスエンティティを設定できます。

- SQL 駆動のワークフロー

    この機能を使用するには、[有効化](#enabling-access-control) する必要があります。

- サーバーの[設定ファイル](/operations/configuration-files.md) `users.xml` および `config.xml`

SQL 駆動のワークフローの使用を推奨します。どちらの設定方法も同時に動作するため、アカウントやアクセス権の管理にサーバー設定ファイルを使用している場合でも、SQL 駆動のワークフローにスムーズに切り替えることができます。

:::note
同じアクセスエンティティを 2 つの設定方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloud コンソールユーザーを管理したい場合は、この[ページ](/cloud/security/manage-cloud-users)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなどと、それらに対するすべての権限付与を確認するには、[`SHOW ACCESS`](/sql-reference/statements/show#show-access) 文を使用します。



## 概要 {#access-control-usage}

デフォルトでは、ClickHouse サーバーは `default` ユーザーアカウントを提供します。このアカウントは SQL ベースのアクセス制御およびアカウント管理を利用できませんが、すべての権限を持ちます。`default` ユーザーアカウントは、たとえばクライアントからのログイン時や分散クエリでユーザー名が定義されていない場合に使用されます。分散クエリ処理において、サーバーまたはクラスターの設定で [user と password](/engines/table-engines/special/distributed.md) プロパティが指定されていない場合は、`default` ユーザーアカウントが使用されます。

ClickHouse の利用を開始したばかりの場合は、次のシナリオを検討してください。

1.  `default` ユーザーに対して、[有効化](#enabling-access-control) により SQL ベースのアクセス制御およびアカウント管理を有効にします。
2.  `default` ユーザーアカウントでログインし、必要なユーザーをすべて作成します。管理者アカウント（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）を作成することを忘れないでください。
3.  `default` ユーザーの[権限を制限](/operations/settings/permissions-for-queries)し、そのユーザーに対する SQL ベースのアクセス制御およびアカウント管理を無効化します。

### 現行ソリューションの特性 {#access-control-properties}

- 存在しないデータベースやテーブルに対しても権限を付与できます。
- テーブルが削除されても、そのテーブルに対応するすべての権限は取り消されません。つまり、後で同じ名前の新しいテーブルを作成した場合でも、すべての権限は有効なままです。削除されたテーブルに対応する権限を取り消すには、`REVOKE ALL PRIVILEGES ON db.table FROM ALL` クエリなどを実行する必要があります。
- 権限に対する有効期限設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouse での認証・認可に使用されるアクセスエンティティです。ユーザーアカウントには次の情報が含まれます。

- 識別情報。
- ユーザーが実行可能なクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)。
- ClickHouse サーバーへの接続を許可されるホスト。
- 割り当て済みおよびデフォルトのロール。
- ユーザーのログイン時にデフォルトで適用される制約付きの設定。
- 割り当てられた設定プロファイル (settings profile)。

権限は、[GRANT](/sql-reference/statements/grant.md) クエリ、または[ロール](#role-management)の割り当てによってユーザーアカウントに付与できます。ユーザーから権限を取り消すために、ClickHouse は [REVOKE](/sql-reference/statements/revoke.md) クエリを提供します。ユーザーの権限を一覧表示するには、[SHOW GRANTS](/sql-reference/statements/show#show-grants) 文を使用します。

管理用クエリ:

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 設定の適用方法 {#access-control-settings-applying}

設定は、ユーザーアカウント自身、付与されたロール、および設定プロファイル (settings profile) で別々に構成できます。ユーザーのログイン時に、ある設定が異なるアクセスエンティティで構成されている場合、その値と制約は次のように（優先度の高い順に）適用されます。

1.  ユーザーアカウントの設定。
2.  ユーザーアカウントのデフォルトロールに対する設定。ある設定が複数のロールで構成されている場合、その適用順序は未定義です。
3.  ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルによる設定。ある設定が複数のプロファイルで構成されている場合、その適用順序は未定義です。
4.  サーバー全体にデフォルトで適用される設定、または [default profile](/operations/server-configuration-parameters/settings#default_profile) からの設定。

### ロール {#role-management}

ロールは、アクセスエンティティをまとめるコンテナであり、ユーザーアカウントに付与できます。

ロールには次の情報が含まれます。

- [権限](/sql-reference/statements/grant#privileges)
- 設定および制約
- 割り当てられたロールの一覧

管理用クエリ:

- [CREATE ROLE](/sql-reference/statements/create/role)
- [ALTER ROLE](/sql-reference/statements/alter/role)
- [DROP ROLE](/sql-reference/statements/drop#drop-role)
- [SET ROLE](/sql-reference/statements/set-role)
- [SET DEFAULT ROLE](/sql-reference/statements/set-role)
- [SHOW CREATE ROLE](/sql-reference/statements/show#show-create-role)
- [SHOW ROLES](/sql-reference/statements/show#show-roles)

権限は、[GRANT](/sql-reference/statements/grant.md) クエリによってロールに付与できます。ロールから権限を取り消すために、ClickHouse は [REVOKE](/sql-reference/statements/revoke.md) クエリを提供します。

#### 行ポリシー {#row-policy-management}



Row policy は、どの行がユーザーまたはロールに対して利用可能かを定義するフィルターです。Row policy には、特定の 1 つのテーブルに対するフィルターと、この row policy を使用するロールおよび/またはユーザーのリストが含まれます。

:::note
Row policy は、読み取り専用アクセス権を持つユーザーに対してのみ有効です。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、row policy による制限は回避できてしまいます。
:::

管理用クエリ:

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### Settings profile {#settings-profiles-management}

Settings profile は、[settings](/operations/settings/index.md) のコレクションです。Settings profile には、settings と制約に加えて、このプロファイルが適用されるロールおよび/またはユーザーのリストが含まれます。

管理用クエリ:

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### Quota {#quotas-management}

Quota はリソース使用量を制限します。[Quotas](/operations/quotas.md) を参照してください。

Quota には、複数の期間に対する制限セットと、この quota を使用するロールおよび/またはユーザーのリストが含まれます。

管理用クエリ:

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL ベースのアクセス制御とアカウント管理の有効化 {#enabling-access-control}

- 設定ストレージ用のディレクトリを準備します。

    ClickHouse は、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path) サーバー設定パラメーターで指定されたフォルダにアクセスエンティティ設定を保存します。

- 少なくとも 1 つのユーザーアカウントに対して、SQL ベースのアクセス制御とアカウント管理を有効にします。

    既定では、SQL ベースのアクセス制御とアカウント管理はすべてのユーザーに対して無効になっています。少なくとも 1 つのユーザーを `users.xml` 設定ファイルで構成し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、`show_named_collections_secrets` の各設定値を 1 に設定する必要があります。



## SQL ユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloud を利用している場合は、[Cloud access management](/cloud/security/console-roles) を参照してください。
:::

この記事では、SQL ユーザーおよびロールの基本的な定義方法と、それらの権限をデータベース、テーブル、行、カラムに適用する方法を説明します。

### SQL ユーザーモードの有効化 {#enabling-sql-user-mode}

1.  `users.xml` ファイル内の `<default>` ユーザーのセクションで SQL ユーザーモードを有効化します:
    ```xml
    <access_management>1</access_management>
    <named_collection_control>1</named_collection_control>
    <show_named_collections>1</show_named_collections>
    <show_named_collections_secrets>1</show_named_collections_secrets>
    ```

    :::note
    `default` ユーザーは、新規インストール時に作成される唯一のユーザーであり、デフォルトではノード間通信にも使用されるアカウントです。

    本番環境では、SQL 管理ユーザーでノード間通信を構成し、`<secret>`、クラスタの認証情報、および／またはノード間 HTTP およびトランスポートプロトコルの認証情報を設定した後に、このユーザーを無効化することを推奨します。これは、`default` アカウントがノード間通信に使用されるためです。
    :::

2.  ノードを再起動して変更を適用します。

3.  ClickHouse クライアントを起動します:
    ```sql
    clickhouse-client --user default --password <password>
    ```
### ユーザーの定義 {#defining-users}

1.  SQL 管理者アカウントを作成します:
    ```sql
    CREATE USER clickhouse_admin IDENTIFIED BY 'password';
    ```
2.  新しいユーザーに完全な管理権限を付与します:
    ```sql
    GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
    ```



## 権限の変更 {#alter-permissions}

この記事では、権限の定義方法と、特権ユーザーが `ALTER` 文を使用する際に権限がどのように機能するかについての理解を深めることを目的としています。

`ALTER` 文はいくつかのカテゴリに分類されており、一部は階層構造になっていますが、そうでないものは明示的に定義する必要があります。

**DB、テーブル、およびユーザー構成の例**

1. 管理者ユーザーでサンプルユーザーを作成します

```sql
CREATE USER my_user IDENTIFIED BY 'password';
```

2. サンプルデータベースの作成

```sql
CREATE DATABASE my_db;
```

3. サンプルテーブルを作成する

```sql
CREATE TABLE my_db.my_table (id UInt64, column1 String) ENGINE = MergeTree() ORDER BY id;
```

4. 権限を付与・取り消しするためのサンプル管理者ユーザーを作成する

```sql
CREATE USER my_alter_admin IDENTIFIED BY 'password';
```

:::note
権限を付与または取り消すには、管理者ユーザーが `WITH GRANT OPTION` 権限を持っている必要があります。
例：

```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```

`GRANT` または `REVOKE` で権限を付与または取り消しするには、そのユーザー自身がまず対象の権限を保有している必要があります。
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

1. `ALTER` 権限をユーザーまたはロールに付与する

`GRANT ALTER ON *.* TO my_user` を使用しても、影響を受けるのはトップレベルの `ALTER TABLE` および `ALTER VIEW` のみであり、その他の `ALTER` 文は個別に付与または取り消す必要があります。

例えば、基本的な `ALTER` 権限を付与する場合:

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

結果として得られる権限セット：

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

これは、上記の例における `ALTER TABLE` および `ALTER VIEW` 配下のすべての権限を付与しますが、`ALTER ROW POLICY` のような他の特定の `ALTER` 権限は付与しません（権限階層を参照すると、`ALTER ROW POLICY` は `ALTER TABLE` や `ALTER VIEW` の子ではないことが分かります）。それらの権限は明示的に付与または取り消す必要があります。

`ALTER` 権限の一部だけが必要な場合は、それぞれを個別に付与できます。その権限にサブ権限が存在する場合は、それらも自動的に付与されます。

例えば、次のとおりです。

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

権限は次のように付与します:

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

これにより、以下のサブ権限も付与されます。

```sql
ALTER ADD COLUMN
ALTER DROP COLUMN
ALTER MODIFY COLUMN
ALTER COMMENT COLUMN
ALTER CLEAR COLUMN
ALTER RENAME COLUMN
```

2. ユーザーおよびロールからの `ALTER` 権限の取り消し

`REVOKE` ステートメントは `GRANT` ステートメントと同様に動作します。

ユーザーまたはロールにサブ権限が付与されている場合は、そのサブ権限を直接取り消すことも、そのサブ権限が継承している上位レベルの権限を取り消すこともできます。

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

権限は個別に取り消すこともできます。

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

または、いずれの上位レベルからでも取り消すことができます（COLUMN のサブ権限をすべて取り消します）:

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

**補足**

権限を付与するユーザーは、`WITH GRANT OPTION` を持っているだけでなく、付与しようとしている権限自体も持っている必要があります。

1. 管理者ユーザーに権限を付与し、さらにその管理者ユーザーが一連の権限を管理できるようにするには
   以下に例を示します。

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これでユーザーは `ALTER COLUMN` と、そのすべてのサブ権限を付与または取り消しできるようになりました。

**テスト**

1. `SELECT` 権限を追加します

```sql
 GRANT SELECT ON my_db.my_table TO my_user;
```

2. ユーザーにカラム追加の権限を付与する

```sql
GRANT ADD COLUMN ON my_db.my_table TO my_user;
```

3. 権限が制限されたユーザーでログインする

```bash
clickhouse-client --user my_user --password password --port 9000 --host <your_clickhouse_host>
```

4. カラム追加をテストする

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

4. Test deleting a column
```sql
ALTER TABLE my_db.my_table DROP COLUMN column2;
````

```response
ALTER TABLE my_db.my_table
    DROP COLUMN column2

Query id: 50ad5f6b-f64b-4c96-8f5f-ace87cea6c47

0 rows in set. Elapsed: 0.004 sec.

Received exception from server (version 22.5.1):
Code: 497. DB::Exception: Received from chnode1.marsnet.local:9440. DB::Exception: my_user: Not enough privileges. To execute this query it's necessary to have grant ALTER DROP COLUMN(column2) ON my_db.my_table. (ACCESS_DENIED)
```

5. 権限を付与して alter&#95;admin をテストする

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. alter admin ユーザーとしてログインする

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

8. ALTER 管理ユーザーが持っていない権限を付与しようとしても、その権限が admin ユーザーに付与された権限のサブ権限とはみなされないことをテストします。

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
`ALTER` 権限は、テーブルおよびビューに対する `ALTER` では階層的ですが、他の `ALTER` 文に対しては階層的ではありません。権限は細かなレベルで、または権限をグループ化して設定でき、同様の方法で取り消すこともできます。権限を付与または取り消すユーザーは、対象ユーザー（自分自身を含む）に対して権限を設定するために `WITH GRANT OPTION` を持っている必要があり、かつその権限自体もすでに持っていなければなりません。実行ユーザーは、自分自身がその GRANT オプション権限を持っていない場合、自分の権限を取り消すことはできません。
