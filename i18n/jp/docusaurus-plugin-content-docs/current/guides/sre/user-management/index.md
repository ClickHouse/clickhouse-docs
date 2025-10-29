---
'slug': '/operations/access-rights'
'sidebar_position': 1
'sidebar_label': 'ユーザーとロール'
'title': 'アクセス制御とアカウント管理'
'keywords':
- 'ClickHouse Cloud'
- 'Access Control'
- 'User Management'
- 'RBAC'
- 'Security'
'description': 'ClickHouse Cloudにおけるアクセス制御とアカウント管理について説明します'
'doc_type': 'guide'
---


# ClickHouseでのユーザーとロールの作成

ClickHouseは、[RBAC](https://en.wikipedia.org/wiki/Role-based_access_control) アプローチに基づくアクセス制御管理をサポートしています。

ClickHouseのアクセスエンティティ:
- [ユーザーアカウント](#user-account-management)
- [ロール](#role-management)
- [行ポリシー](#row-policy-management)
- [設定プロファイル](#settings-profiles-management)
- [クォータ](#quotas-management)

アクセスエンティティは次の方法で構成できます：

- SQL主導のワークフロー。

    この機能を[有効にする](#enabling-access-control)必要があります。

- サーバーの[構成ファイル](/operations/configuration-files.md) `users.xml` と `config.xml`。

SQL主導のワークフローの使用をお勧めします。両方の構成方法は同時に機能するため、アカウントとアクセス権を管理するためにサーバー構成ファイルを使用している場合、SQL主導のワークフローにスムーズに切り替えることができます。

:::note
同じアクセスエンティティを両方の構成方法で同時に管理することはできません。
:::

:::note
ClickHouse Cloudコンソールのユーザーを管理する場合は、この[ページ](/cloud/security/cloud-access-management)を参照してください。
:::

すべてのユーザー、ロール、プロファイルなど、およびすべての権限を見るには、[`SHOW ACCESS`](/sql-reference/statements/show#show-access) ステートメントを使用します。

## 概要 {#access-control-usage}

デフォルトで、ClickHouseサーバーは`default`ユーザーアカウントを提供します。このアカウントはSQL主導のアクセス制御とアカウント管理に使用できず、すべての権利と権限を持っています。`default`ユーザーアカウントは、クライアントからのログインや分散クエリでユーザー名が定義されていない場合に使用されます。分散クエリ処理では、サーバーまたはクラスターの設定が[user and password](/engines/table-engines/special/distributed.md)プロパティを指定していない場合にデフォルトユーザーアカウントが使用されます。

ClickHouseの使用を開始したばかりの場合、以下のシナリオを考慮してください：

1. `default`ユーザーに対してSQL主導のアクセス制御とアカウント管理を[有効にする](#enabling-access-control)。
2. `default`ユーザーアカウントにログインし、必要なすべてのユーザーを作成します。管理者アカウントを作成するのを忘れないでください（`GRANT ALL ON *.* TO admin_user_account WITH GRANT OPTION`）。
3. `default`ユーザーの権限を[制限する](/operations/settings/permissions-for-queries)と、そのためのSQL主導のアクセス制御とアカウント管理を無効にします。

### 現行ソリューションの特性 {#access-control-properties}

- データベースやテーブルが存在しなくても、権限を付与できます。
- テーブルが削除された場合、そのテーブルに対応するすべての権限は取り消されません。これは、後で同じ名前の新しいテーブルを作成しても、すべての権限が有効であることを意味します。削除されたテーブルに対応する権限を取り消すには、たとえば、`REVOKE ALL PRIVILEGES ON db.table FROM ALL` クエリを実行する必要があります。
- 権限の寿命に関する設定はありません。

### ユーザーアカウント {#user-account-management}

ユーザーアカウントは、ClickHouseで誰かを認証するためのアクセスエンティティです。ユーザーアカウントには次の情報が含まれます。

- 識別情報。
- ユーザーが実行できるクエリの範囲を定義する[権限](/sql-reference/statements/grant.md#privileges)。
- ClickHouseサーバーに接続を許可されたホスト。
- 設定されたロールおよびデフォルトのロール。
- ユーザーがログインしたときに適用される設定とその制約。
- 割り当てられた設定プロファイル。

権限は、[GRANT](/sql-reference/statements/grant.md)クエリを介してユーザーアカウントに付与することができるか、[ロール](#role-management)を割り当てることによって付与することができます。ユーザーから権限を取り消すには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。ユーザーの権限をリストするには、[SHOW GRANTS](/sql-reference/statements/show#show-grants)ステートメントを使用します。

管理クエリ：

- [CREATE USER](/sql-reference/statements/create/user.md)
- [ALTER USER](/sql-reference/statements/alter/user)
- [DROP USER](/sql-reference/statements/drop.md)
- [SHOW CREATE USER](/sql-reference/statements/show#show-create-user)
- [SHOW USERS](/sql-reference/statements/show#show-users)

### 設定の適用 {#access-control-settings-applying}

設定は、ユーザーアカウント、付与されたロール、および設定プロファイルで異なる方法で構成できます。ユーザーのログイン時に、異なるアクセエンティティに対して設定が構成されている場合、その設定の値と制約は以下のように適用されます（優先度が高い順）：

1. ユーザーアカウントの設定。
2. ユーザーアカウントのデフォルトロールに対する設定。あるロールで設定が構成されている場合、その設定の適用順序は未定義です。
3. ユーザーまたはそのデフォルトロールに割り当てられた設定プロファイルの設定。あるプロファイルで設定が構成されている場合、その設定の適用順序は未定義です。
4. サーバー全体にデフォルトで適用される設定または[デフォルトプロファイル](/operations/server-configuration-parameters/settings#default_profile)からの設定。

### ロール {#role-management}

ロールは、ユーザーアカウントに付与できるアクセスエンティティのコンテナです。

ロールには次の情報が含まれます。

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

権限は、[GRANT](/sql-reference/statements/grant.md)クエリを介してロールに付与できます。ロールから権限を取り消すには、ClickHouseは[REVOKE](/sql-reference/statements/revoke.md)クエリを提供します。

#### 行ポリシー {#row-policy-management}

行ポリシーは、ユーザーまたはロールに対してどの行が利用可能であるかを定義するフィルターです。行ポリシーには、特定のテーブルに対するフィルターが含まれ、またこの行ポリシーを使用するロールおよび/またはユーザーのリストが含まれます。

:::note
行ポリシーは、読み取り専用アクセスを持つユーザーに対してのみ意味があります。ユーザーがテーブルを変更したり、テーブル間でパーティションをコピーできる場合、行ポリシーの制約が無効になります。
:::

管理クエリ：

- [CREATE ROW POLICY](/sql-reference/statements/create/row-policy)
- [ALTER ROW POLICY](/sql-reference/statements/alter/row-policy)
- [DROP ROW POLICY](/sql-reference/statements/drop#drop-row-policy)
- [SHOW CREATE ROW POLICY](/sql-reference/statements/show#show-create-row-policy)
- [SHOW POLICIES](/sql-reference/statements/show#show-policies)

### 設定プロファイル {#settings-profiles-management}

設定プロファイルは、[設定](/operations/settings/index.md)のコレクションです。設定プロファイルには、設定および制約、ならびにこのプロファイルが適用されるロールおよび/またはユーザーのリストが含まれます。

管理クエリ：

- [CREATE SETTINGS PROFILE](/sql-reference/statements/create/settings-profile)
- [ALTER SETTINGS PROFILE](/sql-reference/statements/alter/settings-profile)
- [DROP SETTINGS PROFILE](/sql-reference/statements/drop#drop-settings-profile)
- [SHOW CREATE SETTINGS PROFILE](/sql-reference/statements/show#show-create-settings-profile)
- [SHOW PROFILES](/sql-reference/statements/show#show-profiles)

### クォータ {#quotas-management}

クォータはリソース使用を制限します。詳細は[クォータ](/operations/quotas.md)を参照してください。

クォータには、特定の期間に対する制限のセットと、このクォータを使用するロールおよび/またはユーザーのリストが含まれます。

管理クエリ：

- [CREATE QUOTA](/sql-reference/statements/create/quota)
- [ALTER QUOTA](/sql-reference/statements/alter/quota)
- [DROP QUOTA](/sql-reference/statements/drop#drop-quota)
- [SHOW CREATE QUOTA](/sql-reference/statements/show#show-create-quota)
- [SHOW QUOTA](/sql-reference/statements/show#show-quota)
- [SHOW QUOTAS](/sql-reference/statements/show#show-quotas)

### SQL主導のアクセス制御とアカウント管理の有効化 {#enabling-access-control}

- 構成ストレージ用のディレクトリを設定します。

    ClickHouseは、[access_control_path](/operations/server-configuration-parameters/settings.md#access_control_path)サーバー構成パラメータで設定されたフォルダーにアクセスエンティティ構成を保存します。

- 少なくとも1つのユーザーアカウントに対してSQL主導のアクセス制御とアカウント管理を有効にします。

    デフォルトでは、SQL主導のアクセス制御とアカウント管理はすべてのユーザーに対して無効になっています。`users.xml`構成ファイルで少なくとも1つのユーザーを構成し、[`access_management`](/operations/settings/settings-users.md#access_management-user-setting)、`named_collection_control`、`show_named_collections`、`show_named_collections_secrets`の各設定の値を1に設定する必要があります。

## SQLユーザーとロールの定義 {#defining-sql-users-and-roles}

:::tip
ClickHouse Cloudで作業している場合は、[クラウドアクセス管理](/cloud/security/cloud-access-management)を参照してください。
:::

この記事では、SQLユーザーとロールの定義および、それらの権限と許可をデータベース、テーブル、行、カラムに適用する基本を示します。

### SQLユーザーモードの有効化 {#enabling-sql-user-mode}

1. `<default>`ユーザーの下にある`users.xml`ファイルでSQLユーザーモードを有効にします：
```xml
<access_management>1</access_management>
<named_collection_control>1</named_collection_control>
<show_named_collections>1</show_named_collections>
<show_named_collections_secrets>1</show_named_collections_secrets>
```

    :::note
    `default`ユーザーは、クリーンインストールで作成される唯一のユーザーであり、デフォルトでノード間通信に使用されるアカウントです。

    本番環境では、SQL管理者ユーザーを使用してノード間通信を設定し、通信が`<secret>`、クラスター資格情報、および/またはノード間のHTTPおよびトランスポートプロトコル資格情報で設定されると、`default`ユーザーは無効にすることをお勧めします。 
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

2. 新しいユーザーに完全な管理権を付与します
```sql
GRANT ALL ON *.* TO clickhouse_admin WITH GRANT OPTION;
```

## 権限の変更 {#alter-permissions}

この記事は、権限の定義方法と、特権ユーザーが`ALTER`ステートメントを使用する際の権限の動作についての理解を深めるためのものです。

`ALTER`ステートメントは、階層的なものとそうでないものに分かれ、階層的なものは明示的に定義する必要があります。

**例：データベース、テーブル、ユーザー構成**
1. 管理者ユーザーを使用して、サンプルユーザーを作成します
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
権限を付与または取り消すには、管理者ユーザーが`WITH GRANT OPTION`権限を持っている必要があります。
たとえば：
```sql
GRANT ALTER ON my_db.* WITH GRANT OPTION
```
権限を`GRANT`または`REVOKE`するには、ユーザー自身が最初にそれらの権限を持っている必要があります。
:::

**権限の付与または取り消し**

`ALTER`の階層：

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

1. ユーザーまたはロールに`ALTER`権限を付与

`GRANT ALTER on *.* TO my_user`を使用すると、最上位の`ALTER TABLE`および`ALTER VIEW`にのみ影響します。他の`ALTER`ステートメントは、個別に付与または取り消す必要があります。

たとえば、基本的な`ALTER`権限を付与します：

```sql
GRANT ALTER ON my_db.my_table TO my_user;
```

結果として得られる権限のセット：

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

これは、上記の例から`ALTER TABLE`および`ALTER VIEW`のすべての権限を付与しますが、`ALTER ROW POLICY`などの特定の他の`ALTER`権限は付与されません（階層に戻ると、`ALTER ROW POLICY`が`ALTER TABLE`や`ALTER VIEW`の子ではないことが分かります）。それらは明示的に付与または取り消される必要があります。

`ALTER`権限のサブセットのみが必要な場合は、それぞれを個別に付与できます。その権限にサブ権限がある場合は、それらも自動的に付与されます。

たとえば：

```sql
GRANT ALTER COLUMN ON my_db.my_table TO my_user;
```

付与される権限は：

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

2. ユーザーおよびロールから`ALTER`権限を取り消す

`REVOKE`ステートメントは、`GRANT`ステートメントと同様に機能します。

ユーザー/ロールがサブ権限を付与されている場合、そのサブ権限を直接取り消すか、継承先の上位権限を取り消すことができます。

たとえば、ユーザーに`ALTER ADD COLUMN`が付与されている場合

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

権限を個別に取り消すことができます：

```sql
REVOKE ALTER ADD COLUMN ON my_db.my_table FROM my_user;
```

または、上位レベルのいずれかから取り消すこともできます（COLUMNのサブ権限をすべて取り消す）：

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

権限は、`WITH GRANT OPTION`だけでなく、その権限自体も持っているユーザーによって付与される必要があります。

1. 管理者ユーザーに権限を付与し、権限セットを管理できるようにします
以下に例を示します：

```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

これで、そのユーザーは`ALTER COLUMN`およびすべてのサブ権限を付与または取り消すことができます。

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

5. 権限を付与することによる管理者のテスト
```sql
GRANT SELECT, ALTER COLUMN ON my_db.my_table TO my_alter_admin WITH GRANT OPTION;
```

6. ALTER管理者ユーザーでログインします
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

8. ALTER管理者ユーザーが持っていない権限を付与しようとするが、それは管理者ユーザーの付与のサブ権限ではないことをテストします。
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

**要約**
`ALTER`権限は、テーブルとビューに関しては階層的ですが、他の`ALTER`ステートメントには階層がありません。権限は細かいレベルで設定することもできますし、権限のグループ化によって設定することもできますし、同様に取り消すことも可能です。権限を付与または取り消すユーザーは、ユーザーに権限を設定するために`WITH GRANT OPTION`を必要とし、そのユーザー自身もその権限を持っている必要があります。権限を取り消すことは、権限を持っていない場合はできません。
