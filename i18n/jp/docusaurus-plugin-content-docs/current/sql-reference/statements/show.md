---
slug: /sql-reference/statements/show
sidebar_position: 37
sidebar_label: SHOW
title: SHOW ステートメント
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` は、以下の設定が有効でない限り、秘密が隠されます:

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (サーバー設定)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (フォーマット設定)  

加えて、ユーザーは [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 権限を持っている必要があります。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

これらのステートメントは、指定したオブジェクトを作成するために使用された `CREATE` クエリを含む、文字列型の単一カラムを返します。

### 構文 {#syntax}

```sql title="構文"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
システムテーブルの `CREATE` クエリを取得するためにこのステートメントを使用すると、
テーブル構造のみを宣言する*偽*クエリが得られ、テーブルを作成するためには使用できません。
:::

## SHOW DATABASES {#show-databases}

このステートメントは、すべてのデータベースのリストを印刷します。

### 構文 {#syntax-1}

```sql title="構文"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

これは次のクエリと同じです:

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### 例 {#examples}

この例では、データベースの名前に 'de' シンボルシーケンスを含むものを取得するために `SHOW` を使用します:

```sql title="クエリ"
SHOW DATABASES LIKE '%de%'
```

```text title="レスポンス"
┌─name────┐
│ default │
└─────────┘
```

大文字小文字を区別しない方法でも行うことができます:

```sql title="クエリ"
SHOW DATABASES ILIKE '%DE%'
```

```text title="レスポンス"
┌─name────┐
│ default │
└─────────┘
```

また、名前に 'de' を含まないデータベースの名前を取得することもできます:

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

最後に、最初の2つのデータベースだけの名前を取得できます:

```sql title="クエリ"
SHOW DATABASES LIMIT 2
```

```text title="レスポンス"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### 参照 {#see-also}

- [`CREATE DATABASE`](create/database.md/#query-language-create-database)

## SHOW TABLES {#show-tables}

`SHOW TABLES` ステートメントは、テーブルのリストを表示します。

### 構文 {#syntax-2}

```sql title="構文"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベースからのテーブルのリストを返します。

このステートメントは次のクエリと同じです:

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-1}

この例では、テーブル名に 'user' を含むすべてのテーブルを見つけるために `SHOW TABLES` ステートメントを使用します:

```sql title="クエリ"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="レスポンス"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

大文字小文字を区別しない方法でも行うことができます:

```sql title="クエリ"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="レスポンス"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

また、名前に 's' を含まないテーブルを見つけることもできます:

```sql title="クエリ"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="レスポンス"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

最後に、最初の2つのテーブルだけの名前を取得できます:

```sql title="クエリ"
SHOW TABLES FROM system LIMIT 2
```

```text title="レスポンス"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### 参照 {#see-also-1}

- [`Create Tables`](../../tutorial.md/#create-tables)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS` ステートメントは、カラムのリストを表示します。

### 構文 {#syntax-3}

```sql title="構文"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO 
OUTFILE <filename>] [FORMAT <format>]
```

データベース名とテーブル名は `<db>.<table>` の短縮形として指定でき、 
つまり `FROM tab FROM db` と `FROM db.tab` は等価です。 
データベースが指定されていない場合、クエリは現在のデータベースからのカラムのリストを返します。

また、2つのオプションのキーワード `EXTENDED` と `FULL` があります。`EXTENDED` キーワードは現在効果がなく、
MySQL との互換性のために存在します。`FULL` キーワードは、出力に照合順序、コメント、および権限のカラムを含めるようにします。

`SHOW COLUMNS` ステートメントは以下の構造を持つ結果テーブルを生成します:

| Column      | 説明                                                                                                                          | Type               |
|-------------|-----------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`     | カラムの名前                                                                                                                 | `String`           |
| `type`      | カラムのデータ型。 MySQL ワイヤプロトコルを通じてクエリが行われた場合、MySQL における同等の型名が表示されます。                     | `String`           |
| `null`      | カラムのデータ型が Nullable の場合は `YES`、それ以外は `NO`                                                                      | `String`           |
| `key`       | カラムが主キーの一部である場合は `PRI`、ソートキーの一部である場合は `SOR`、それ以外の場合は空                                                                 | `String`           |
| `default`   | カラムが `ALIAS`、`DEFAULT`、または `MATERIALIZED` 型の場合のデフォルト式、それ以外の場合は `NULL`。                                          | `Nullable(String)` |
| `extra`     | 追加情報、現在は使用されていません                                                                                          | `String`           |
| `collation` | (ただし `FULL`キーワードが指定されている場合のみ) カラムの照合順序、ClickHouse にはカラムごとの照合順序がないため常に `NULL`               | `Nullable(String)` |
| `comment`   | (ただし `FULL`キーワードが指定されている場合のみ) カラムに関するコメント                                                                 | `String`           |
| `privilege` | (ただし `FULL`キーワードが指定されている場合のみ) このカラムに対する権限、現在は利用できません                                                                                | `String`           |

### 例 {#examples-2}

この例では、テーブル 'orders' のすべてのカラムに関する情報を取得するために `SHOW COLUMNS` ステートメントを使用します。 'delivery_' から始まるカラムを対象としています:

```sql title="クエリ"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="レスポンス"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### 参照 {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

`SHOW DICTIONARIES` ステートメントは、[Dictionary](../../sql-reference/dictionaries/index.md) のリストを表示します。

### 構文 {#syntax-4}

```sql title="構文"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベースからの辞書のリストを返します。

以下の方法で `SHOW DICTIONARIES` クエリと同じ結果を得ることができます:

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-3}

次のクエリは、`system` データベースのテーブルリストから最初の2行を選択し、その名前に `reg` を含むものを取得します。

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

テーブルの主キーとデータスキッピングインデックスのリストを表示します。

このステートメントは主に MySQL との互換性のために存在します。システムテーブル [`system.tables`](../../operations/system-tables/tables.md) (主キー用) と [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md) (データスキッピングインデックス用) は、ClickHouse によりネイティブな形式で同等の情報を提供します。

### 構文 {#syntax-5}

```sql title="構文"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

データベース名とテーブル名は `<db>.<table>` の短縮形として指定でき、 
つまり `FROM tab FROM db` と `FROM db.tab` は等価です。 
データベースが指定されていない場合、クエリは現在のデータベースを前提とします。

オプションのキーワード `EXTENDED` は現在効果がなく、MySQL との互換性のために存在します。

このステートメントは以下の構造を持つ結果テーブルを生成します:

| Column          | 説明                                                                                                               | Type               |
|-----------------|-------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`         | テーブルの名前.                                                                                                     | `String`           |
| `non_unique`    | ClickHouse は一意性制約をサポートしていないため、常に `1`                                                          | `UInt8`            |
| `key_name`      | インデックスの名前、インデックスが主キーインデックスの場合は `PRIMARY`                                           | `String`           |
| `seq_in_index`  | 主キーインデックスの場合、カラムの位置は `1` から始まります。データスキッピングインデックスの場合は常に `1`。 | `UInt8`            |
| `column_name`   | 主キーインデックスの場合、カラムの名前。データスキッピングインデックスの場合は `''` (空文字列)、フィールド "expression" を参照。 | `String`           |
| `collation`     | インデックス内のカラムの並び順: 昇順の場合は `A`、降順の場合は `D`、未ソートの場合は `NULL`                                     | `Nullable(String)` |
| `cardinality`   | インデックスの基数推定（インデックス内の一意の値の数）。現在は常に 0。                                               | `UInt64`           |
| `sub_part`      | ClickHouse は MySQL のようなインデックスプレフィックスをサポートしていないため、常に `NULL`                               | `Nullable(String)` |
| `packed`        | ClickHouse は MySQL のようなパックされたインデックスをサポートしていないため、常に `NULL`                               | `Nullable(String)` |
| `null`          | 現在未使用                                                                                                        |                    |
| `index_type`    | インデックスの型、例: `PRIMARY`、`MINMAX`、`BLOOM_FILTER` 等。                                                      | `String`           |
| `comment`       | インデックスに関する追加情報、現在は常に `''` (空文字列)。                                                         | `String`           |
| `index_comment` | `''` (空文字列)で、ClickHouse ではインデックスに `COMMENT` フィールドを持つことはできません。                       | `String`           |
| `visible`       | インデックスがオプティマイザーに見える場合、常に `YES`。                                                            | `String`           |
| `expression`    | データスキッピングインデックスの場合、インデックス式。主キーインデックスの場合: `''` (空文字列)。                       | `String`           |

### 例 {#examples-4}

この例では、`SHOW INDEX` ステートメントを使用してテーブル 'tbl' のすべてのインデックスに関する情報を取得します。

```sql title="クエリ"
SHOW INDEX FROM 'tbl'
```

```text title="レスポンス"
┌─table─┬─non_unique─┬─key_name─┬─seq_in_index─┬─column_name─┬─collation─┬─cardinality─┬─sub_part─┬─packed─┬─null─┬─index_type───┬─comment─┬─index_comment─┬─visible─┬─expression─┐
│ tbl   │          1 │ blf_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ BLOOM_FILTER │         │               │ YES     │ d, b       │
│ tbl   │          1 │ mm1_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ a, c, d    │
│ tbl   │          1 │ mm2_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ MINMAX       │         │               │ YES     │ c, d, e    │
│ tbl   │          1 │ PRIMARY  │ 1            │ c           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ PRIMARY  │ 2            │ a           │ A         │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ PRIMARY      │         │               │ YES     │            │
│ tbl   │          1 │ set_idx  │ 1            │ 1           │ ᴺᵁᴸᴸ      │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ SET          │         │               │ YES     │ e          │
└───────┴────────────┴──────────┴──────────────┴─────────────┴───────────┴─────────────┴──────────┴────────┴──────┴──────────────┴─────────┴───────────────┴─────────┴────────────┘
```

### 参照 {#see-also-3}

- [`system.tables`](../../operations/system-tables/tables.md)
- [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)

## SHOW PROCESSLIST {#show-processlist}

`SHOW PROCESSLIST` ステートメントは、現在処理中のクエリのリストを含む [`system.processes`](../../operations/system-tables/processes.md#system_tables-processes) テーブルの内容を出力します。`SHOW PROCESSLIST` クエリを除きます。

### 構文 {#syntax-6}

```sql title="構文"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` クエリは、現在のすべてのクエリに関するデータを返します。

:::tip
コンソールで実行します:

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS` ステートメントは、ユーザーに対する権限を表示します。

### 構文 {#syntax-7}

```sql title="構文"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

ユーザーが指定されていない場合、クエリは現在のユーザーに対する権限を返します。

`WITH IMPLICIT` 修飾子は暗黙的な付与（例: `GRANT SELECT ON system.one`）を表示することを可能にします。

`FINAL` 修飾子は、ユーザーとその付与されたロールからのすべての権限を統合します（継承あり）。

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER` ステートメントは、[ユーザー作成](../../sql-reference/statements/create/user.md)に使用されたパラメーターを表示します。

### 構文 {#syntax-8}

```sql title="構文"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE` ステートメントは、[ロール作成](../../sql-reference/statements/create/role.md)に使用されたパラメーターを表示します。

### 構文 {#syntax-9}

```sql title="構文"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY` ステートメントは、[行ポリシー作成](../../sql-reference/statements/create/row-policy.md)に使用されたパラメーターを表示します。

### 構文 {#syntax-10}

```sql title="構文"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA` ステートメントは、[クォータ作成](../../sql-reference/statements/create/quota.md)に使用されたパラメーターを表示します。

### 構文 {#syntax-11}

```sql title="構文"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE` ステートメントは、[設定プロファイル作成](../../sql-reference/statements/create/settings-profile.md)に使用されたパラメーターを表示します。

### 構文 {#syntax-12}

```sql title="構文"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS` ステートメントは、[ユーザーアカウント](../../guides/sre/user-management/index.md#user-account-management)の名前のリストを返します。 
ユーザーアカウントパラメーターを見るには、システムテーブル [`system.users`](../../operations/system-tables/users.md#system_tables-users) を参照してください。

### 構文 {#syntax-13}

```sql title="構文"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES` ステートメントは、[ロール](../../guides/sre/user-management/index.md#role-management)のリストを返します。 
他のパラメーターを表示するには、 
システムテーブル [`system.roles`](../../operations/system-tables/roles.md#system_tables-roles) と [`system.role_grants`](../../operations/system-tables/role-grants.md#system_tables-role_grants) を参照してください。

### 構文 {#syntax-14}

```sql title="構文"
SHOW [CURRENT|ENABLED] ROLES
```
## SHOW PROFILES {#show-profiles}

`SHOW PROFILES` ステートメントは、[設定プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)のリストを返します。 
ユーザーアカウントパラメーターを見るには、システムテーブル [`settings_profiles`](../../operations/system-tables/settings_profiles.md#system_tables-settings_profiles) を参照してください。

### 構文 {#syntax-15}

```sql title="構文"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

`SHOW POLICIES` ステートメントは、指定したテーブルに対する [行ポリシー](../../guides/sre/user-management/index.md#row-policy-management) のリストを返します。 
ユーザーアカウントパラメーターを見るには、システムテーブル [`system.row_policies`](../../operations/system-tables/row_policies.md#system_tables-row_policies) を参照してください。

### 構文 {#syntax-16}

```sql title="構文"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS` ステートメントは、[クォータ](../../guides/sre/user-management/index.md#quotas-management)のリストを返します。 
クォータパラメーターを見るには、システムテーブル [`system.quotas`](../../operations/system-tables/quotas.md#system_tables-quotas) を参照してください。

### 構文 {#syntax-17}

```sql title="構文"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA` ステートメントは、すべてのユーザーまたは現在のユーザーの [クォータ](../../operations/quotas.md) 消費を返します。 
他のパラメーターが必要な場合は、システムテーブル [`system.quotas_usage`](../../operations/system-tables/quotas_usage.md#system_tables-quotas_usage) と [`system.quota_usage`](../../operations/system-tables/quota_usage.md#system_tables-quota_usage) を参照してください。

### 構文 {#syntax-18}

```sql title="構文"
SHOW [CURRENT] QUOTA
```
## SHOW ACCESS {#show-access}

`SHOW ACCESS` ステートメントは、すべての [ユーザー](../../guides/sre/user-management/index.md#user-account-management)、 [ロール](../../guides/sre/user-management/index.md#role-management)、 [プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management) など、およびそれらのすべての [付与](../../sql-reference/statements/grant.md#privileges) を表示します。

### 構文 {#syntax-19}

```sql title="構文"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)` ステートメントは、クラスターのリストを返します。 
すべての利用可能なクラスターは [`system.clusters`](../../operations/system-tables/clusters.md) テーブルにリストされています。

:::note
`SHOW CLUSTER name` クエリは、指定されたクラスター名の `system.clusters` テーブルの内容を表示します。
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
shard_weight:            1
replica_num:             1
host_name:               localhost
host_address:            127.0.0.1
port:                    9000
is_local:                1
user:                    default
default_database:
errors_count:            0
estimated_recovery_time: 0
```

## SHOW SETTINGS {#show-settings}

`SHOW SETTINGS` ステートメントは、システム設定とその値のリストを返します。 
これは [`system.settings`](../../operations/system-tables/settings.md) テーブルからデータを選択します。

### 構文 {#syntax-21}

```sql title="構文"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### 構文 {#clauses}

`LIKE|ILIKE` は設定名の一致パターンを指定できます。 `%` や `_` のようなワイルドカードを含めることができます。 `LIKE` 句は大文字小文字を区別し、`ILIKE` は大文字小文字を区別しません。

`CHANGED` 句が使用されると、クエリはデフォルト値から変更された設定のみを返します。

### 例 {#examples-6}

`LIKE` 句を使用したクエリ:

```sql title="クエリ"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="レスポンス"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

`ILIKE` 句を使用したクエリ:

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

`CHANGED` 句を使用したクエリ:

```sql title="クエリ"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="レスポンス"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```

## SHOW SETTING {#show-setting}

`SHOW SETTING` ステートメントは、指定された設定名の設定値を出力します。

### 構文 {#syntax-22}

```sql title="構文"
SHOW SETTING <name>
```

### 参照 {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md) テーブル

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

### 参照 {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) テーブル

## SHOW ENGINES {#show-engines}

`SHOW ENGINES` ステートメントは、[`system.table_engines`](../../operations/system-tables/table_engines.md) テーブルの内容を出力し、 
サーバーによってサポートされるテーブルエンジンの説明とその機能サポート情報を提供します。

### 構文 {#syntax-23}

```sql title="構文"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### 参照 {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md) テーブル

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS` ステートメントは、[`system.functions`](../../operations/system-tables/functions.md) テーブルの内容を出力します。

### 構文 {#syntax-24}

```sql title="構文"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE` または `ILIKE` 句が指定されている場合は、クエリが指定された `<pattern>` に一致するシステム関数のリストを返します。

### 参照 {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) テーブル

## SHOW MERGES {#show-merges}

`SHOW MERGES` ステートメントは、マージのリストを返します。 
すべてのマージは [`system.merges`](../../operations/system-tables/merges.md) テーブルにリストされています:

| Column              | 説明                                                    |
|---------------------|---------------------------------------------------------|
| `table`             | テーブル名。                                           |
| `database`          | テーブルが所属するデータベースの名前。                  |
| `estimate_complete` | 完了までの推定時間（秒単位）。                         |
| `elapsed`           | マージが開始されてから経過した時間（秒単位）。           |
| `progress`          | 完了した作業のパーセント（0-100%）。                    |
| `is_mutation`       | プロセスが部分的な変異である場合は 1。                 |
| `size_compressed`   | マージされたパーツの圧縮データの合計サイズ。          |
| `memory_usage`      | マージプロセスのメモリ消費。                           |

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
