---
slug: /sql-reference/statements/show
sidebar_position: 37
sidebar_label: SHOW
title: SHOW ステートメント
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` は、以下の設定がオンになっていない限り、秘密を隠します：

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (サーバー設定)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (フォーマット設定)  

加えて、ユーザーは [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 権限を持っている必要があります。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

これらのステートメントは、指定されたオブジェクトを作成するために使用された `CREATE` クエリを含む、String 型の単一カラムを返します。

### 構文 {#syntax}

```sql title="構文"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
このステートメントを使用してシステムテーブルの `CREATE` クエリを取得する場合、テーブル構造を宣言するだけの*偽*クエリが返されます。
このクエリではテーブルを作成できません。
:::

## SHOW DATABASES {#show-databases}

このステートメントは、すべてのデータベースのリストを印刷します。

### 構文 {#syntax-1}

```sql title="構文"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

これは、以下のクエリと同等です：

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### 例 {#examples}

この例では、名前に 'de' の文字列シーケンスを含むデータベース名を取得するために `SHOW` を使用します：

```sql title="クエリ"
SHOW DATABASES LIKE '%de%'
```

```text title="レスポンス"
┌─name────┐
│ default │
└─────────┘
```

大文字と小文字を区別しない方法でも同様に行えます：

```sql title="クエリ"
SHOW DATABASES ILIKE '%DE%'
```

```text title="レスポンス"
┌─name────┐
│ default │
└─────────┘
```

または、名前に 'de' を含まないデータベース名を取得できます：

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

最後に、最初の2つのデータベースの名前を取得できます：

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

- [`CREATE DATABASE`](create/database.md/#query-language-create-database)

## SHOW TABLES {#show-tables}

`SHOW TABLES` ステートメントは、テーブルのリストを表示します。

### 構文 {#syntax-2}

```sql title="構文"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベースからのテーブルのリストを返します。

このステートメントは以下のクエリと同等です：

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-1}

この例では、名前に 'user' を含むすべてのテーブルを見つけるために `SHOW TABLES` ステートメントを使用します：

```sql title="クエリ"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="レスポンス"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

大文字と小文字を区別しない方法でも同様に行えます：

```sql title="クエリ"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="レスポンス"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

または、名前に 's' を含まないテーブルを見つけることもできます：

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

最後に、最初の2つのテーブルの名前を取得できます：

```sql title="クエリ"
SHOW TABLES FROM system LIMIT 2
```

```text title="レスポンス"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### 関連項目 {#see-also-1}

- [`Create Tables`](../../tutorial.md/#create-tables)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS` ステートメントは、列のリストを表示します。

### 構文 {#syntax-3}

```sql title="構文"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

データベースとテーブル名は `<db>.<table>` の短縮形で指定でき、`FROM tab FROM db` と `FROM db.tab` は同等です。
データベースが指定されていない場合、クエリは現在のデータベースからの列のリストを返します。

オプションのキーワードとして `EXTENDED` および `FULL` があり、`EXTENDED` キーワードは現在影響を持たず、MySQL との互換性のために存在します。`FULL` キーワードは、出力に照合、コメント、および特権カラムを含めるようになります。

`SHOW COLUMNS` ステートメントは以下の構造の結果テーブルを生成します：

| カラム      | 説明                                                                                               | 型               |
|-------------|---------------------------------------------------------------------------------------------------|------------------|
| `field`     | 列の名前                                                                                          | `String`         |
| `type`      | 列のデータ型。MySQL ワイヤプロトコルを介してクエリが行われた場合、MySQL での同等の型名が表示されます。 | `String`         |
| `null`      | 列のデータ型が Nullable の場合は `YES`、そうでない場合は `NO`                                   | `String`         |
| `key`       | 列が主キーの一部である場合は `PRI`、ソートキーの一部である場合は `SOR`、それ以外は空白             | `String`         |
| `default`   | 列が `ALIAS`、`DEFAULT`、または `MATERIALIZED` 型の場合のデフォルト表現、それ以外は `NULL`      | `Nullable(String)` |
| `extra`     | 追加情報、現在は未使用                                                                           | `String`         |
| `collation` | （`FULL` キーワードが指定された場合のみ）列の照合、ClickHouse は列毎の照合を行わないため常に `NULL` | `Nullable(String)` |
| `comment`   | （`FULL` キーワードが指定された場合のみ）列に関するコメント                                     | `String`         |
| `privilege` | （`FULL` キーワードが指定された場合のみ）この列に対するあなたの特権、現在は利用できません       | `String`         |

### 例 {#examples-2}

この例では、`SHOW COLUMNS` ステートメントを使用して 'orders' テーブル内のすべての列の情報を取得します。列名が 'delivery_' で始まります：

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

`SHOW DICTIONARIES` ステートメントは、[Dictionary](../../sql-reference/dictionaries/index.md) のリストを表示します。

### 構文 {#syntax-4}

```sql title="構文"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベースからのディクショナリのリストを返します。

以下のようにして `SHOW DICTIONARIES` クエリと同じ結果が得られます：

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-3}

以下のクエリは、`system` データベース内のテーブルのリストから最初の2行を選択し、名前に `reg` を含むものを取得します。

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

テーブルの主キーおよびデータスキッピングインデックスのリストを表示します。

このステートメントは主に MySQL との互換性のために存在します。システムテーブル [`system.tables`](../../operations/system-tables/tables.md)（主キー用）および [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)（データスキッピングインデックス用）は、よりClickHouseに特有な方法で同等の情報を提供します。

### 構文 {#syntax-5}

```sql title="構文"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

データベースとテーブル名は `<db>.<table>` の短縮形で指定でき、すなわち `FROM tab FROM db` と `FROM db.tab` は同等です。データベースが指定されていない場合、クエリは現在のデータベースをデータベースとして扱います。

オプションのキーワード `EXTENDED` は現在効果がなく、MySQL との互換性のために存在します。

このステートメントは以下の構造の結果テーブルを生成します：

| カラム          | 説明                                                                                             | 型               |
|-----------------|-------------------------------------------------------------------------------------------------|------------------|
| `table`         | テーブルの名前。                                                                                   | `String`         |
| `non_unique`    | ClickHouse は一意性制約をサポートしていないため、常に `1` となります。                           | `UInt8`          |
| `key_name`      | インデックスの名前、主キーインデックスの場合は `PRIMARY`。                                       | `String`         |
| `seq_in_index`  | 主キーインデックスの場合、カラムの位置は `1` から始まります。データスキッピングインデックスの場合は常に `1` となります。   | `UInt8`          |
| `column_name`   | 主キーインデックスの場合はカラムの名前。データスキッピングインデックスの場合は `''`（空文字列）、フィールド "expression" を参照してください。| `String`         |
| `collation`     | インデックス内のカラムの並び順：昇順の場合は `A`、降順の場合は `D`、未ソートの場合は `NULL`。         | `Nullable(String)` |
| `cardinality`   | インデックスのカーディナリティの推定（インデックス内の一意の値の数）。現在は常に `0`。                      | `UInt64`         |
| `sub_part`      | ClickHouse は MySQL のようなインデックスプレフィックスをサポートしていないため、常に `NULL`。             | `Nullable(String)` |
| `packed`        | ClickHouse は MySQL のような圧縮インデックスをサポートしていないため、常に `NULL`。                      | `Nullable(String)` |
| `null`          | 現在は未使用                                                                                      |                  |
| `index_type`    | インデックスのタイプ、例えば `PRIMARY`、`MINMAX`、`BLOOM_FILTER` など。                            | `String`         |
| `comment`       | インデックスに関する追加情報、現在は常に `''`（空文字列）。                                      | `String`         |
| `index_comment` | インデックスが Comment フィールドを持てないため `''`（空文字列）。                                | `String`         |
| `visible`       | インデックスが最適化エンジンに見える場合、常に `YES`。                                            | `String`         |
| `expression`    | データスキッピングインデックスの場合、インデックスの式。主キーインデックスの場合は `''`（空文字列）。  | `String`         |

### 例 {#examples-4}

この例では、`SHOW INDEX` ステートメントを使用して 'tbl' テーブル内のすべてのインデックスに関する情報を取得します。

```sql title="クエリ"
SHOW INDEX FROM 'tbl'
```

```text title="レスポンス"
┌─table─┬─non_unique─┬─key_name─┬─seq_in_index─┬─column_name─┬─collation─┬─cardinality─┬─sub_part─┬─packed─┬─null─┬─index_type───┬─comment─┬─index_comment─┬─visible─┬─expression─┐
│ tbl   │          1 │ blf_idx  │ 1            │ 1           │ ᴺᵁᴺᴵᴺ  │ 0           │ ᴺᵁᴸᴸ     │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ │ BLOOM_FILTER │         │               │ YES     │ d, b       │
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

現在処理中のクエリのリストを含む [`system.processes`](../../operations/system-tables/processes.md#system_tables-processes) テーブルの内容を出力します。`SHOW PROCESSLIST` クエリは除外されます。

### 構文 {#syntax-6}

```sql title="構文"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` クエリは、すべての現在のクエリに関するデータを返します。

:::tip
コンソールで実行：

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS` ステートメントは、ユーザーの特権を表示します。

### 構文 {#syntax-7}

```sql title="構文"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

ユーザーが指定されていない場合、クエリは現在のユーザーの特権を返します。

`WITH IMPLICIT` 修飾子を使用すると、暗黙の付与を表示できます（例： `GRANT SELECT ON system.one`）

`FINAL` 修飾子は、ユーザーとその付与されたロールからのすべての付与を統合します（継承を持って）。

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER` ステートメントは、[ユーザー作成](../../sql-reference/statements/create/user.md) に使用されたパラメータを表示します。

### 構文 {#syntax-8}

```sql title="構文"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE` ステートメントは、[ロール作成](../../sql-reference/statements/create/role.md) に使用されたパラメータを表示します。

### 構文 {#syntax-9}

```sql title="構文"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY` ステートメントは、[行ポリシー作成](../../sql-reference/statements/create/row-policy.md) に使用されたパラメータを表示します。

### 構文 {#syntax-10}

```sql title="構文"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA` ステートメントは、[クォータ作成](../../sql-reference/statements/create/quota.md) に使用されたパラメータを表示します。

### 構文 {#syntax-11}

```sql title="構文"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE` ステートメントは、[設定プロファイル作成](../../sql-reference/statements/create/settings-profile.md) に使用されたパラメータを表示します。

### 構文 {#syntax-12}

```sql title="構文"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS` ステートメントは、[ユーザーアカウント](../../guides/sre/user-management/index.md#user-account-management) 名のリストを返します。 
ユーザーアカウントのパラメータを表示するには、システムテーブル [`system.users`](../../operations/system-tables/users.md#system_tables-users) を参照してください。

### 構文 {#syntax-13}

```sql title="構文"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES` ステートメントは、[ロール](../../guides/sre/user-management/index.md#role-management) のリストを返します。 
その他のパラメータを表示するには、システムテーブル [`system.roles`](../../operations/system-tables/roles.md#system_tables-roles) および [`system.role_grants`](../../operations/system-tables/role-grants.md#system_tables-role_grants) を参照してください。

### 構文 {#syntax-14}

```sql title="構文"
SHOW [CURRENT|ENABLED] ROLES
```
## SHOW PROFILES {#show-profiles}

`SHOW PROFILES` ステートメントは、[設定プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management) のリストを返します。 
ユーザーアカウントのパラメータを表示するには、システムテーブル [`settings_profiles`](../../operations/system-tables/settings_profiles.md#system_tables-settings_profiles) を参照してください。

### 構文 {#syntax-15}

```sql title="構文"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

`SHOW POLICIES` ステートメントは、指定されたテーブルの [行ポリシー](../../guides/sre/user-management/index.md#row-policy-management) のリストを返します。 
ユーザーアカウントのパラメータを表示するには、システムテーブル [`system.row_policies`](../../operations/system-tables/row_policies.md#system_tables-row_policies) を参照してください。

### 構文 {#syntax-16}

```sql title="構文"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS` ステートメントは、[クォータ](../../guides/sre/user-management/index.md#quotas-management) のリストを返します。 
クォータのパラメータを表示するには、システムテーブル [`system.quotas`](../../operations/system-tables/quotas.md#system_tables-quotas) を参照してください。

### 構文 {#syntax-17}

```sql title="構文"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA` ステートメントは、すべてのユーザーまたは現在のユーザーの [クォータ](../../operations/quotas.md) 消費量を返します。 
その他のパラメータを表示するには、システムテーブル [`system.quotas_usage`](../../operations/system-tables/quotas_usage.md#system_tables-quotas_usage) および [`system.quota_usage`](../../operations/system-tables/quota_usage.md#system_tables-quota_usage) を参照してください。

### 構文 {#syntax-18}

```sql title="構文"
SHOW [CURRENT] QUOTA
```
## SHOW ACCESS {#show-access}

`SHOW ACCESS` ステートメントは、すべての [ユーザー](../../guides/sre/user-management/index.md#user-account-management)、[ロール](../../guides/sre/user-management/index.md#role-management)、[プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management) などとそのすべての [付与](../../sql-reference/statements/grant.md#privileges) を表示します。

### 構文 {#syntax-19}

```sql title="構文"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)` ステートメントは、クラスターのリストを返します。 
利用可能なすべてのクラスターは、[`system.clusters`](../../operations/system-tables/clusters.md) テーブルに一覧表示されています。

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

### 句 {#clauses}

`LIKE|ILIKE` は設定名の一致パターンを指定することを許可します。 `%` や `_` のようなワイルドカードを含むことができます。 `LIKE` 句は大文字と小文字を区別し、`ILIKE` は大文字と小文字を区別しません。

`CHANGED` 句を使用すると、デフォルト値から変更された設定のみが返されます。

### 例 {#examples-6}

`LIKE` 句を使用したクエリ：

```sql title="クエリ"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="レスポンス"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

`ILIKE` 句を使用したクエリ：

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

`CHANGED` 句を使用したクエリ：

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

### 関連項目 {#see-also-4}

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

### 関連項目 {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) テーブル

## SHOW ENGINES {#show-engines}

`SHOW ENGINES` ステートメントは、[`system.table_engines`](../../operations/system-tables/table_engines.md) テーブルの内容を出力します。 
このテーブルにはサーバーがサポートするテーブルエンジンの説明と、機能サポート情報が含まれています。

### 構文 {#syntax-23}

```sql title="構文"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### 関連項目 {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md) テーブル

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS` ステートメントは、[`system.functions`](../../operations/system-tables/functions.md) テーブルの内容を出力します。

### 構文 {#syntax-24}

```sql title="構文"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE` または `ILIKE` 句が指定されている場合、クエリは提供された `<pattern>` に一致するシステム関数のリストを返します。

### 関連項目 {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) テーブル

## SHOW MERGES {#show-merges}

`SHOW MERGES` ステートメントは、マージのリストを返します。 
すべてのマージは、[`system.merges`](../../operations/system-tables/merges.md) テーブルに一覧表示されています：

| カラム              | 説明                                                       |
|---------------------|------------------------------------------------------------|
| `table`             | テーブル名。                                               |
| `database`          | テーブルが存在するデータベースの名前。                     |
| `estimate_complete` | 完了までの推定時間（秒単位）。                             |
| `elapsed`           | マージが開始してから経過した時間（秒単位）。               |
| `progress`          | 完了した作業の割合（0-100パーセント）。                    |
| `is_mutation`       | このプロセスが部分的なミューテーションである場合は 1。    |
| `size_compressed`   | マージされたパーツの圧縮データの合計サイズ。              |
| `memory_usage`      | マージプロセスのメモリ消費量。                             |


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
