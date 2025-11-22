---
description: 'Show に関するドキュメント'
sidebar_label: 'SHOW'
sidebar_position: 37
slug: /sql-reference/statements/show
title: 'SHOW ステートメント'
doc_type: 'reference'
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` は、次の設定が有効になっていない限り、シークレット情報を表示しません。

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (サーバー設定)
- [`format_display_secrets_in_show_and_select` ](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (フォーマット設定)  

さらに、ユーザーは [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 権限を持っている必要があります。
:::



## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

これらのステートメントは、指定されたオブジェクトを作成する際に使用された`CREATE`クエリを含む、String型の単一カラムを返します。

### 構文 {#syntax}

```sql title="構文"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
このステートメントを使用してシステムテーブルの`CREATE`クエリを取得した場合、テーブル構造のみを宣言する_疑似的な_クエリが返されますが、実際のテーブル作成には使用できません。
:::


## SHOW DATABASES {#show-databases}

このステートメントは、すべてのデータベースのリストを出力します。

### 構文 {#syntax-1}

```sql title="構文"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

これは次のクエリと同一です:

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### 例 {#examples}

この例では、`SHOW`を使用して名前に文字列'de'を含むデータベース名を取得します:

```sql title="クエリ"
SHOW DATABASES LIKE '%de%'
```

```text title="レスポンス"
┌─name────┐
│ default │
└─────────┘
```

大文字小文字を区別しない方法でも同様に実行できます:

```sql title="クエリ"
SHOW DATABASES ILIKE '%DE%'
```

```text title="レスポンス"
┌─name────┐
│ default │
└─────────┘
```

または、名前に'de'を含まないデータベース名を取得することもできます:

```sql title="クエリ"
SHOW DATABASES NOT LIKE '%de%'
```

```text title="レスポンス"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ system                         │
│ test                           │
│ tutorial                       │
└────────────────────────────────┘
```

最後に、最初の2つのデータベースの名前のみを取得できます:

```sql title="クエリ"
SHOW DATABASES LIMIT 2
```

```text title="レスポンス"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### 関連項目 {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)


## SHOW TABLES {#show-tables}

`SHOW TABLES`文はテーブルの一覧を表示します。

### 構文 {#syntax-2}

```sql title="構文"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM`句が指定されていない場合、クエリは現在のデータベースからテーブルの一覧を返します。

この文は次のクエリと同一です:

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-1}

この例では、`SHOW TABLES`文を使用して名前に'user'を含むすべてのテーブルを検索します:

```sql title="クエリ"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="結果"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

大文字小文字を区別せずに同様の検索を行うこともできます:

```sql title="クエリ"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="結果"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

または、名前に文字's'を含まないテーブルを検索する場合:

```sql title="クエリ"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="結果"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

最後に、最初の2つのテーブルの名前のみを取得することもできます:

```sql title="クエリ"
SHOW TABLES FROM system LIMIT 2
```

```text title="結果"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### 関連項目 {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)


## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS`ステートメントはカラムのリストを表示します。

### 構文 {#syntax-3}

```sql title="構文"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

データベース名とテーブル名は`<db>.<table>`という省略形で指定できます。
つまり、`FROM tab FROM db`と`FROM db.tab`は同等です。
データベースが指定されていない場合、クエリは現在のデータベースからカラムのリストを返します。

また、2つのオプションキーワード`EXTENDED`と`FULL`があります。`EXTENDED`キーワードは現在効果がなく、
MySQLとの互換性のために存在します。`FULL`キーワードを指定すると、出力に照合順序、コメント、権限のカラムが含まれます。

`SHOW COLUMNS`ステートメントは以下の構造を持つ結果テーブルを生成します:

| カラム      | 説明                                                                                                                   | 型               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `field`     | カラムの名前                                                                                                        | `String`           |
| `type`      | カラムのデータ型。クエリがMySQL wireプロトコル経由で実行された場合、MySQLでの同等の型名が表示されます。 | `String`           |
| `null`      | カラムのデータ型がNullableの場合は`YES`、それ以外は`NO`                                                                     | `String`           |
| `key`       | カラムが主キーの一部である場合は`PRI`、ソートキーの一部である場合は`SOR`、それ以外は空                               | `String`           |
| `default`   | カラムが`ALIAS`、`DEFAULT`、または`MATERIALIZED`型の場合はそのデフォルト式、それ以外は`NULL`。                    | `Nullable(String)` |
| `extra`     | 追加情報、現在は未使用                                                                                      | `String`           |
| `collation` | (`FULL`キーワードが指定された場合のみ) カラムの照合順序、ClickHouseにはカラム単位の照合順序がないため常に`NULL` | `Nullable(String)` |
| `comment`   | (`FULL`キーワードが指定された場合のみ) カラムのコメント                                                                  | `String`           |
| `privilege` | (`FULL`キーワードが指定された場合のみ) このカラムに対する権限、現在は利用不可                         | `String`           |

### 例 {#examples-2}

この例では、`SHOW COLUMNS`ステートメントを使用して、テーブル'orders'内の'delivery\_'で始まる
すべてのカラムに関する情報を取得します:

```sql title="クエリ"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="レスポンス"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### 関連項目 {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)


## SHOW DICTIONARIES {#show-dictionaries}

`SHOW DICTIONARIES`ステートメントは、[ディクショナリ](../../sql-reference/dictionaries/index.md)のリストを表示します。

### 構文 {#syntax-4}

```sql title="構文"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM`句が指定されていない場合、クエリは現在のデータベースからディクショナリのリストを返します。

`SHOW DICTIONARIES`クエリと同じ結果を次の方法で取得できます:

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-3}

次のクエリは、`system`データベース内のディクショナリのリストから、名前に`reg`を含む最初の2行を選択します。

```sql title="クエリ"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="レスポンス"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```


## SHOW INDEX {#show-index}

テーブルのプライマリインデックスとデータスキッピングインデックスの一覧を表示します。

このステートメントは主にMySQLとの互換性のために存在します。システムテーブル[`system.tables`](../../operations/system-tables/tables.md)(プライマリキー用)および[`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)(データスキッピングインデックス用)は、ClickHouseにより適した形式で同等の情報を提供します。

### 構文 {#syntax-5}

```sql title="構文"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

データベース名とテーブル名は`<db>.<table>`という省略形式で指定できます。つまり、`FROM tab FROM db`と`FROM db.tab`は同等です。データベースが指定されていない場合、クエリは現在のデータベースを使用します。

オプションのキーワード`EXTENDED`は現在効果がなく、MySQLとの互換性のために存在します。

このステートメントは以下の構造を持つ結果テーブルを生成します:

| カラム          | 説明                                                                                                              | 型               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `table`         | テーブルの名前。                                                                                                   | `String`           |
| `non_unique`    | ClickHouseは一意性制約をサポートしていないため、常に`1`。                                                        | `UInt8`            |
| `key_name`      | インデックスの名前。プライマリキーインデックスの場合は`PRIMARY`。                                                    | `String`           |
| `seq_in_index`  | プライマリキーインデックスの場合、`1`から始まるカラムの位置。データスキッピングインデックスの場合は常に`1`。            | `UInt8`            |
| `column_name`   | プライマリキーインデックスの場合、カラムの名前。データスキッピングインデックスの場合は`''`(空文字列)。"expression"フィールドを参照してください。 | `String`           |
| `collation`     | インデックス内のカラムのソート順:`A`は昇順、`D`は降順、`NULL`はソートなし。                         | `Nullable(String)` |
| `cardinality`   | インデックスのカーディナリティ(インデックス内の一意な値の数)の推定値。現在は常に0。                       | `UInt64`           |
| `sub_part`      | ClickHouseはMySQLのようなインデックスプレフィックスをサポートしていないため、常に`NULL`。                                             | `Nullable(String)` |
| `packed`        | ClickHouseはパックされたインデックス(MySQLのような)をサポートしていないため、常に`NULL`。                                           | `Nullable(String)` |
| `null`          | 現在未使用                                                                                                         |                    |
| `index_type`    | インデックスの種類。例:`PRIMARY`、`MINMAX`、`BLOOM_FILTER`など。                                                            | `String`           |
| `comment`       | インデックスに関する追加情報。現在は常に`''`(空文字列)。                                            | `String`           |
| `index_comment` | ClickHouseのインデックスは`COMMENT`フィールドを持つことができない(MySQLのような)ため、`''`(空文字列)。                         | `String`           |
| `visible`       | インデックスがオプティマイザから可視である場合、常に`YES`。                                                                  | `String`           |
| `expression`    | データスキッピングインデックスの場合、インデックス式。プライマリキーインデックスの場合は`''`(空文字列)。                           | `String`           |

### 例 {#examples-4}

この例では、`SHOW INDEX`ステートメントを使用してテーブル'tbl'内のすべてのインデックスに関する情報を取得します。

```sql title="クエリ"
SHOW INDEX FROM 'tbl'
```


```text title="Response"
┌─table─┬─non_unique─┬─key_name─┬─seq_in_index─┬─column_name─┬─collation─┬─cardinality─┬─sub_part─┬─packed─┬─null─┬─index_type───┬─comment─┬─index_comment─┬─visible─┬─expression─┐
│ tbl   │          1 │ blf_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ BLOOM_FILTER │         │               │ YES     │ d, b       │
│ tbl   │          1 │ mm1_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ a, c, d    │
│ tbl   │          1 │ mm2_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ c, d, e    │
│ tbl   │          1 │ PRIMARY  │ 1            │ c           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ PRIMARY  │ 2            │ a           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ set_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ SET          │         │               │ YES     │ e          │
└───────┴────────────┴──────────┴──────────────┴─────────────┴───────────┴─────────────┴──────────┴────────┴──────┴──────────────┴─────────┴───────────────┴─────────┴────────────┘
```

### 関連項目 {#see-also-3}

- [`system.tables`](../../operations/system-tables/tables.md)
- [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)


## SHOW PROCESSLIST {#show-processlist}

現在処理中のクエリのリストを含む[`system.processes`](/operations/system-tables/processes)テーブルの内容を出力します。ただし、`SHOW PROCESSLIST`クエリ自体は除外されます。

### 構文 {#syntax-6}

```sql title="構文"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes`クエリは、現在実行中のすべてのクエリに関するデータを返します。

:::tip
コンソールで実行:

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```

:::


## SHOW GRANTS {#show-grants}

`SHOW GRANTS`文は、ユーザーの権限を表示します。

### 構文 {#syntax-7}

```sql title="構文"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

ユーザーが指定されていない場合、クエリは現在のユーザーの権限を返します。

`WITH IMPLICIT`修飾子を使用すると、暗黙的な権限付与を表示できます(例: `GRANT SELECT ON system.one`)。

`FINAL`修飾子は、ユーザーと付与されたロール(継承を含む)からのすべての権限付与をマージします。


## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER`文は、[ユーザー作成](../../sql-reference/statements/create/user.md)時に使用されたパラメータを表示します。

### 構文 {#syntax-8}

```sql title="構文"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```


## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE`ステートメントは、[ロール作成](../../sql-reference/statements/create/role.md)時に使用されたパラメータを表示します。

### 構文 {#syntax-9}

```sql title="構文"
SHOW CREATE ROLE name1 [, name2 ...]
```


## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY`文は、[行ポリシーの作成](../../sql-reference/statements/create/row-policy.md)時に使用されたパラメータを表示します。

### 構文 {#syntax-10}

```sql title="構文"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```


## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA`文は、[クォータ作成](../../sql-reference/statements/create/quota.md)時に使用されたパラメータを表示します。

### 構文 {#syntax-11}

```sql title="構文"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```


## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE`文は、[設定プロファイルの作成](../../sql-reference/statements/create/settings-profile.md)時に使用されたパラメータを表示します。

### 構文 {#syntax-12}

```sql title="構文"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```


## SHOW USERS {#show-users}

`SHOW USERS`ステートメントは、[ユーザーアカウント](../../guides/sre/user-management/index.md#user-account-management)名のリストを返します。
ユーザーアカウントのパラメータを表示するには、システムテーブル[`system.users`](/operations/system-tables/users)を参照してください。

### 構文 {#syntax-13}

```sql title="構文"
SHOW USERS
```


## SHOW ROLES {#show-roles}

`SHOW ROLES`ステートメントは、[ロール](../../guides/sre/user-management/index.md#role-management)のリストを返します。
その他のパラメータを表示するには、システムテーブル[`system.roles`](/operations/system-tables/roles)および[`system.role_grants`](/operations/system-tables/role_grants)を参照してください。

### 構文 {#syntax-14}


```sql title="構文"
SHOW [CURRENT|ENABLED] ROLES
```

## SHOW PROFILES {#show-profiles}

`SHOW PROFILES`文は、[設定プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)のリストを返します。
ユーザーアカウントのパラメータを表示するには、システムテーブル[`settings_profiles`](/operations/system-tables/settings_profiles)を参照してください。

### 構文 {#syntax-15}

```sql title="構文"
SHOW [SETTINGS] PROFILES
```


## SHOW POLICIES {#show-policies}

`SHOW POLICIES`文は、指定されたテーブルの[行ポリシー](../../guides/sre/user-management/index.md#row-policy-management)のリストを返します。
ユーザーアカウントのパラメータを表示するには、システムテーブル[`system.row_policies`](/operations/system-tables/row_policies)を参照してください。

### 構文 {#syntax-16}

```sql title="構文"
SHOW [ROW] POLICIES [ON [db.]table]
```


## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS`ステートメントは[クォータ](../../guides/sre/user-management/index.md#quotas-management)の一覧を返します。
クォータパラメータを確認するには、システムテーブル[`system.quotas`](/operations/system-tables/quotas)を参照してください。

### 構文 {#syntax-17}

```sql title="構文"
SHOW QUOTAS
```


## SHOW QUOTA {#show-quota}

`SHOW QUOTA`ステートメントは、すべてのユーザーまたは現在のユーザーの[クォータ](../../operations/quotas.md)消費量を返します。
その他のパラメータを表示するには、システムテーブル[`system.quotas_usage`](/operations/system-tables/quotas_usage)および[`system.quota_usage`](/operations/system-tables/quota_usage)を参照してください。

### 構文 {#syntax-18}


```sql title="構文"
SHOW [CURRENT] QUOTA
```

## SHOW ACCESS {#show-access}

`SHOW ACCESS`文は、すべての[ユーザー](../../guides/sre/user-management/index.md#user-account-management)、[ロール](../../guides/sre/user-management/index.md#role-management)、[プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)等と、それらに付与されたすべての[権限](../../sql-reference/statements/grant.md#privileges)を表示します。

### 構文 {#syntax-19}

```sql title="構文"
SHOW ACCESS
```


## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)`文はクラスタのリストを返します。
利用可能なすべてのクラスタは[`system.clusters`](../../operations/system-tables/clusters.md)テーブルに一覧表示されます。

:::note
`SHOW CLUSTER name`クエリは、指定されたクラスタ名に対して`system.clusters`テーブルの`cluster`、`shard_num`、`replica_num`、`host_name`、`host_address`、および`port`を表示します。
:::

### 構文 {#syntax-20}

```sql title="構文"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```

### 例 {#examples-5}

```sql title="クエリ"
SHOW CLUSTERS;
```

```text title="レスポンス"
┌─cluster──────────────────────────────────────┐
│ test_cluster_two_shards                      │
│ test_cluster_two_shards_internal_replication │
│ test_cluster_two_shards_localhost            │
│ test_shard_localhost                         │
│ test_shard_localhost_secure                  │
│ test_unavailable_shard                       │
└──────────────────────────────────────────────┘
```

```sql title="クエリ"
SHOW CLUSTERS LIKE 'test%' LIMIT 1;
```

```text title="レスポンス"
┌─cluster─────────────────┐
│ test_cluster_two_shards │
└─────────────────────────┘
```

```sql title="クエリ"
SHOW CLUSTER 'test_shard_localhost' FORMAT Vertical;
```

```text title="レスポンス"
Row 1:
──────
cluster:                 test_shard_localhost
shard_num:               1
replica_num:             1
host_name:               localhost
host_address:            127.0.0.1
port:                    9000
```


## SHOW SETTINGS {#show-settings}

`SHOW SETTINGS`文は、システム設定とその値のリストを返します。
[`system.settings`](../../operations/system-tables/settings.md)テーブルからデータを取得します。

### 構文 {#syntax-21}

```sql title="構文"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### 句 {#clauses}

`LIKE|ILIKE`を使用して、設定名の一致パターンを指定できます。`%`や`_`などのグロブ文字を含めることができます。`LIKE`句は大文字小文字を区別し、`ILIKE`は区別しません。

`CHANGED`句を使用すると、デフォルト値から変更された設定のみが返されます。

### 例 {#examples-6}

`LIKE`句を使用したクエリ:

```sql title="クエリ"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="レスポンス"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

`ILIKE`句を使用したクエリ:

```sql title="クエリ"
SHOW SETTINGS ILIKE '%CONNECT_timeout%'
```

```text title="レスポンス"
┌─name────────────────────────────────────┬─type─────────┬─value─┐
│ connect_timeout                         │ Seconds      │ 10    │
│ connect_timeout_with_failover_ms        │ Milliseconds │ 50    │
│ connect_timeout_with_failover_secure_ms │ Milliseconds │ 100   │
└─────────────────────────────────────────┴──────────────┴───────┘
```

`CHANGED`句を使用したクエリ:

```sql title="クエリ"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="レスポンス"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```


## SHOW SETTING {#show-setting}

`SHOW SETTING`ステートメントは、指定された設定名に対する設定値を出力します。

### 構文 {#syntax-22}

```sql title="構文"
SHOW SETTING <name>
```

### 関連項目 {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md)テーブル


## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### 例 {#examples-7}

```sql title="クエリ"
SHOW FILESYSTEM CACHES
```

```text title="レスポンス"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### 関連項目 {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) テーブル


## SHOW ENGINES {#show-engines}

`SHOW ENGINES`文は、[`system.table_engines`](../../operations/system-tables/table_engines.md)テーブルの内容を出力します。このテーブルには、サーバーがサポートするテーブルエンジンの説明とその機能サポート情報が含まれています。

### 構文 {#syntax-23}

```sql title="構文"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### 関連項目 {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md)テーブル


## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS`ステートメントは、[`system.functions`](../../operations/system-tables/functions.md)テーブルの内容を出力します。

### 構文 {#syntax-24}

```sql title="構文"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE`または`ILIKE`句を指定した場合、クエリは指定された`<pattern>`に一致する名前のシステム関数のリストを返します。

### 関連項目 {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md)テーブル


## SHOW MERGES {#show-merges}

`SHOW MERGES`文はマージのリストを返します。
すべてのマージは[`system.merges`](../../operations/system-tables/merges.md)テーブルに一覧表示されます:

| Column              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `table`             | テーブル名。                                                |
| `database`          | テーブルが属するデータベースの名前。                          |
| `estimate_complete` | 完了までの推定時間(秒)。                                 |
| `elapsed`           | マージ開始からの経過時間(秒)。                            |
| `progress`          | 完了した作業の割合(0-100%)。                         |
| `is_mutation`       | このプロセスがパートミューテーションの場合は1。                 |
| `size_compressed`   | マージされたパートの圧縮データの合計サイズ。                   |
| `memory_usage`      | マージプロセスのメモリ消費量。                                |

### 構文 {#syntax-25}

```sql title="構文"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### 例 {#examples-8}

```sql title="クエリ"
SHOW MERGES;
```

```text title="レスポンス"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="クエリ"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="レスポンス"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```
