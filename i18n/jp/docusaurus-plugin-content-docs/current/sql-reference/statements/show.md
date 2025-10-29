---
'description': 'SHOWに関するドキュメント'
'sidebar_label': 'SHOW'
'sidebar_position': 37
'slug': '/sql-reference/statements/show'
'title': 'SHOW ステートメント'
'doc_type': 'reference'
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)`は、以下の設定がオンになっている場合を除き、秘密情報を非表示にします。

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (サーバー設定)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (フォーマット設定)

さらに、ユーザーは [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 権限を持っている必要があります。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

これらのステートメントは、指定されたオブジェクトを作成するために使用された `CREATE` クエリを含む、String 型の単一カラムを返します。

### 構文 {#syntax}

```sql title="Syntax"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
このステートメントを使用してシステムテーブルの `CREATE` クエリを取得した場合、テーブル構造のみを宣言する*偽の*クエリが得られ、テーブルを作成するためには使用できません。
:::

## SHOW DATABASES {#show-databases}

このステートメントは、すべてのデータベースのリストを印刷します。

### 構文 {#syntax-1}

```sql title="Syntax"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

これはクエリと同一です：

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### 例 {#examples}

この例では、名前に'se'というシンボルシーケンスが含まれているデータベース名を取得するために `SHOW` を使用します：

```sql title="Query"
SHOW DATABASES LIKE '%de%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

無視大文字小文字の方式でも行うことができます：

```sql title="Query"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

あるいは、名前に'de'が含まれていないデータベース名を取得する場合：

```sql title="Query"
SHOW DATABASES NOT LIKE '%de%'
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ system                         │
│ test                           │
│ tutorial                       │
└────────────────────────────────┘
```

最後に、最初の2つのデータベースの名前のみを取得できます：

```sql title="Query"
SHOW DATABASES LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### 関連項目 {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

`SHOW TABLES` ステートメントは、テーブルのリストを表示します。

### 構文 {#syntax-2}

```sql title="Syntax"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベースからテーブルのリストを返します。

このステートメントはクエリと同一です：

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-1}

この例では、名前に 'user' が含まれているすべてのテーブルを見つけるために `SHOW TABLES` ステートメントを使用します：

```sql title="Query"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

無視大文字小文字の方式でも行うことができます：

```sql title="Query"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

あるいは、名前に 's' の文字が含まれていないテーブルを見つける場合：

```sql title="Query"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="Response"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

最後に、最初の2つのテーブルの名前のみを取得できます：

```sql title="Query"
SHOW TABLES FROM system LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### 関連項目 {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS` ステートメントは、カラムのリストを表示します。

### 構文 {#syntax-3}

```sql title="Syntax"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

データベース名とテーブル名は、 `<db>.<table>` の略称で指定できます。つまり、 `FROM tab FROM db` と `FROM db.tab` は同じです。データベースが指定されていない場合、クエリは現在のデータベースからカラムのリストを返します。

2つのオプションキーワード `EXTENDED` と `FULL` があります。 `EXTENDED` キーワードは現在影響がなく、MySQLの互換性のために存在します。 `FULL` キーワードは、出力に照合、コメント、権限カラムを含むことを引き起こします。

`SHOW COLUMNS` ステートメントは以下の構造の結果テーブルを生成します：

| Column      | Description                                                                                                                   | Type               |
|-------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`     | カラムの名前                                                                                                                | `String`           |
| `type`      | カラムのデータ型。クエリがMySQLワイヤプロトコルを介して行われた場合、MySQLの同等の型名が表示されます。                     | `String`           |
| `null`      | カラムのデータ型がNullableの場合は`YES`、そうでなければ`NO`                                                               | `String`           |
| `key`       | カラムが主キーの一部であれば`PRI`、ソートキーの一部であれば`SOR`、そうでなければ空                                                                                          | `String`           |
| `default`   | カラムが `ALIAS`、 `DEFAULT`、または `MATERIALIZED` の型の場合はデフォルト式、それ以外は `NULL`。                                   | `Nullable(String)` |
| `extra`     | 追加情報、現在は未使用                                                                                                     | `String`           |
| `collation` | （`FULL` キーワードが指定された場合のみ） カラムの照合、ClickHouseはカラムごとの照合を持たないため常に`NULL`                      | `Nullable(String)` |
| `comment`   | （`FULL` キーワードが指定された場合のみ）カラムに関するコメント                                                            | `String`           |
| `privilege` | （`FULL` キーワードが指定された場合のみ）このカラムに対するあなたの権限、現在は利用できない                                  | `String`           |

### 例 {#examples-2}

この例では、`orders` テーブルのすべてのカラムに関する情報を取得するために `SHOW COLUMNS` ステートメントを使用します。開始されるのは 'delivery_' からです：

```sql title="Query"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Response"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### 関連項目 {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

`SHOW DICTIONARIES` ステートメントは、[Dictionaries](../../sql-reference/dictionaries/index.md)のリストを表示します。

### 構文 {#syntax-4}

```sql title="Syntax"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベースからディクショナリのリストを返します。

以下の方法で `SHOW DICTIONARIES` クエリと同じ結果を得ることができます：

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-3}

以下のクエリは、名前に `reg` が含まれている `system` データベース内のテーブルリストから最初の2行を選択します。

```sql title="Query"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="Response"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```

## SHOW INDEX {#show-index}

テーブルの主キーとデータスキッピングインデックスのリストを表示します。

このステートメントは主にMySQLとの互換性のために存在します。システムテーブル [`system.tables`](../../operations/system-tables/tables.md) （主キー用）および[`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)（データスキッピングインデックス用）は、ClickHouseによりネイティブな形式で同等の情報を提供します。

### 構文 {#syntax-5}

```sql title="Syntax"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

データベース名とテーブル名は、 `<db>.<table>` の略称で指定できます。つまり、 `FROM tab FROM db` と `FROM db.tab` は同じです。データベースが指定されていない場合、クエリは現在のデータベースをデータベースと見なします。

オプションのキーワード `EXTENDED` は現在無効であり、MySQLとの互換性のために存在します。

このステートメントは以下の構造の結果テーブルを生成します：

| Column          | Description                                                                                                              | Type               |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`         | テーブル名。                                                                                                | `String`           |
| `non_unique`    | ClickHouseは一意性制約をサポートしていないため常に `1`。                                                             | `UInt8`            |
| `key_name`      | インデックスの名前。インデックスが主キーインデックスであれば `PRIMARY`。                                                 | `String`           |
| `seq_in_index`  | 主キーインデックスの場合、1から始まるカラムの位置。データスキッピングインデックスの場合は常に `1`。                          | `UInt8`            |
| `column_name`   | 主キーインデックスの場合、カラムの名前。データスキッピングインデックスの場合は空の文字列、フィールド "expression" を参照。 | `String`           |
| `collation`     | インデックス内のカラムのソート：昇順の場合は `A`、降順の場合は `D`、未ソートの場合は `NULL`。                                    | `Nullable(String)` |
| `cardinality`   | インデックスの推定カーディナリティ（インデックス内の一意な値の数）の推定値。現在は常に0。                                       | `UInt64`           |
| `sub_part`      | ClickHouseはMySQLのようなインデックスのプレフィックスをサポートしていないため常に `NULL`。                                        | `Nullable(String)` |
| `packed`        | ClickHouseはMySQLのようなパックインデックスをサポートしていないため常に `NULL`。                                             | `Nullable(String)` |
| `null`          | 現在未使用                                                                                                         |                    |
| `index_type`    | インデックスの種類、例： `PRIMARY`、 `MINMAX`、 `BLOOM_FILTER` など。                                                   | `String`           |
| `comment`       | インデックスに関する追加情報。現在は常に空の文字列。                                                                          | `String`           |
| `index_comment` | ClickHouseのインデックスには `COMMENT` フィールドがないため、空の文字列。                                                                      | `String`           |
| `visible`       | インデックスがオプティマイザに見える場合は常に `YES`。                                                                  | `String`           |
| `expression`    | データスキッピングインデックスの場合、インデックス式。主キーインデックスの場合は空の文字列。                                    | `String`           |

### 例 {#examples-4}

この例では、`tbl` テーブルのすべてのインデックスに関する情報を取得するために `SHOW INDEX` ステートメントを使用します。

```sql title="Query"
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

[`system.processes`](/operations/system-tables/processes) テーブルの内容を出力します。このテーブルには、現在処理中のクエリのリストが含まれ、 `SHOW PROCESSLIST` クエリは除外されます。

### 構文 {#syntax-6}

```sql title="Syntax"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` クエリは、すべての現在のクエリに関するデータを返します。

:::tip
コンソールで実行します：

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS` ステートメントは、ユーザーの権限を表示します。

### 構文 {#syntax-7}

```sql title="Syntax"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

ユーザーが指定されていない場合、クエリは現在のユーザーの権限を返します。

`WITH IMPLICIT` 修飾子を使用すると、暗黙の権限（例： `GRANT SELECT ON system.one`）を表示できます。

`FINAL` 修飾子は、ユーザーとその付与されたロール（継承あり）からのすべての権限をマージします。

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER` ステートメントは、[ユーザー作成](../../sql-reference/statements/create/user.md)時に使用されたパラメータを示します。

### 構文 {#syntax-8}

```sql title="Syntax"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE` ステートメントは、[ロール作成](../../sql-reference/statements/create/role.md)時に使用されたパラメータを示します。

### 構文 {#syntax-9}

```sql title="Syntax"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY` ステートメントは、[ロウポリシー作成](../../sql-reference/statements/create/row-policy.md)時に使用されたパラメータを示します。

### 構文 {#syntax-10}

```sql title="Syntax"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA` ステートメントは、[クォータ作成](../../sql-reference/statements/create/quota.md)時に使用されたパラメータを示します。

### 構文 {#syntax-11}

```sql title="Syntax"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE` ステートメントは、[設定プロファイル作成](../../sql-reference/statements/create/settings-profile.md)時に使用されたパラメータを示します。

### 構文 {#syntax-12}

```sql title="Syntax"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS` ステートメントは、[ユーザーアカウント](../../guides/sre/user-management/index.md#user-account-management)の名前のリストを返します。ユーザーアカウントパラメータを見るには、システムテーブル [`system.users`](/operations/system-tables/users) を参照してください。

### 構文 {#syntax-13}

```sql title="Syntax"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES` ステートメントは、[ロール](../../guides/sre/user-management/index.md#role-management)のリストを返します。他のパラメータを表示するには、システムテーブル [`system.roles`](/operations/system-tables/roles) と [`system.role_grants`](/operations/system-tables/role_grants) を参照してください。

### 構文 {#syntax-14}

```sql title="Syntax"
SHOW [CURRENT|ENABLED] ROLES
```

## SHOW PROFILES {#show-profiles}

`SHOW PROFILES` ステートメントは、[設定プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)のリストを返します。ユーザーアカウントパラメータを見るには、システムテーブル [`settings_profiles`](/operations/system-tables/settings_profiles) を参照してください。

### 構文 {#syntax-15}

```sql title="Syntax"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

`SHOW POLICIES` ステートメントは、指定されたテーブルの[ロウポリシー](../../guides/sre/user-management/index.md#row-policy-management)のリストを出力します。ユーザーアカウントパラメータを確認するには、システムテーブル [`system.row_policies`](/operations/system-tables/row_policies) を参照してください。

### 構文 {#syntax-16}

```sql title="Syntax"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS` ステートメントは、[クォータ](../../guides/sre/user-management/index.md#quotas-management)のリストを返します。クォータパラメータを確認するには、システムテーブル [`system.quotas`](/operations/system-tables/quotas) を参照してください。

### 構文 {#syntax-17}

```sql title="Syntax"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA` ステートメントは、すべてのユーザーまたは現在のユーザーの[クォータ](../../operations/quotas.md)の消費状況を返します。他のパラメータを表示するには、システムテーブル [`system.quotas_usage`](/operations/system-tables/quotas_usage) と [`system.quota_usage`](/operations/system-tables/quota_usage) を参照してください。

### 構文 {#syntax-18}

```sql title="Syntax"
SHOW [CURRENT] QUOTA
```

## SHOW ACCESS {#show-access}

`SHOW ACCESS` ステートメントは、すべての[ユーザー](../../guides/sre/user-management/index.md#user-account-management)、[ロール](../../guides/sre/user-management/index.md#role-management)、[プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)など、およびそのすべての[権限](../../sql-reference/statements/grant.md#privileges)を表示します。

### 構文 {#syntax-19}

```sql title="Syntax"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)` ステートメントはクラスターのリストを返します。すべての利用可能なクラスターは [`system.clusters`](../../operations/system-tables/clusters.md) テーブルにリストされています。

:::note
`SHOW CLUSTER name` クエリは、指定されたクラスター名の `system.clusters` テーブルに対して `cluster`、 `shard_num`、 `replica_num`、 `host_name`、 `host_address`、および `port` を表示します。
:::

### 構文 {#syntax-20}

```sql title="Syntax"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```

### 例 {#examples-5}

```sql title="Query"
SHOW CLUSTERS;
```

```text title="Response"
┌─cluster──────────────────────────────────────┐
│ test_cluster_two_shards                      │
│ test_cluster_two_shards_internal_replication │
│ test_cluster_two_shards_localhost            │
│ test_shard_localhost                         │
│ test_shard_localhost_secure                  │
│ test_unavailable_shard                       │
└──────────────────────────────────────────────┘
```

```sql title="Query"
SHOW CLUSTERS LIKE 'test%' LIMIT 1;
```

```text title="Response"
┌─cluster─────────────────┐
│ test_cluster_two_shards │
└─────────────────────────┘
```

```sql title="Query"
SHOW CLUSTER 'test_shard_localhost' FORMAT Vertical;
```

```text title="Response"
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

`SHOW SETTINGS` ステートメントは、システム設定とその値のリストを返します。これは、[`system.settings`](../../operations/system-tables/settings.md) テーブルからデータを選択します。

### 構文 {#syntax-21}

```sql title="Syntax"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### 句 {#clauses}

`LIKE|ILIKE` は設定名に対するマッチングパターンを指定できます。 `%` や `_` のようなグロブを含めることができます。 `LIKE` 句は大文字小文字を区別し、 `ILIKE` は大文字小文字を区別しません。

`CHANGED` 句が使用されると、クエリはデフォルト値から変更された設定のみを返します。

### 例 {#examples-6}

`LIKE` 句を持つクエリ：

```sql title="Query"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="Response"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

`ILIKE` 句を持つクエリ：

```sql title="Query"
SHOW SETTINGS ILIKE '%CONNECT_timeout%'
```

```text title="Response"
┌─name────────────────────────────────────┬─type─────────┬─value─┐
│ connect_timeout                         │ Seconds      │ 10    │
│ connect_timeout_with_failover_ms        │ Milliseconds │ 50    │
│ connect_timeout_with_failover_secure_ms │ Milliseconds │ 100   │
└─────────────────────────────────────────┴──────────────┴───────┘
```

`CHANGED` 句を持つクエリ：

```sql title="Query"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="Response"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```

## SHOW SETTING {#show-setting}

`SHOW SETTING` ステートメントは、指定された設定名の設定値を出力します。

### 構文 {#syntax-22}

```sql title="Syntax"
SHOW SETTING <name>
```

### 関連項目 {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md) テーブル

## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### 例 {#examples-7}

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### 関連項目 {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) テーブル

## SHOW ENGINES {#show-engines}

`SHOW ENGINES` ステートメントは、[`system.table_engines`](../../operations/system-tables/table_engines.md) テーブルの内容を出力します。このテーブルには、サーバーによってサポートされるテーブルエンジンの説明とその機能サポート情報が含まれています。

### 構文 {#syntax-23}

```sql title="Syntax"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### 関連項目 {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md) テーブル

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS` ステートメントは、[`system.functions`](../../operations/system-tables/functions.md) テーブルの内容を出力します。

### 構文 {#syntax-24}

```sql title="Syntax"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE` または `ILIKE` 句が指定された場合、クエリは提供された `<pattern>` に一致するシステム関数のリストを返します。

### 関連項目 {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) テーブル

## SHOW MERGES {#show-merges}

`SHOW MERGES` ステートメントは、マージのリストを返します。すべてのマージは、[`system.merges`](../../operations/system-tables/merges.md) テーブルにリストされています：

| Column              | Description                                                |
|---------------------|------------------------------------------------------------|
| `table`             | テーブル名。                                                |
| `database`          | テーブルがあるデータベースの名前。                          |
| `estimate_complete` | 完了推定時間（秒単位）。                                   |
| `elapsed`           | マージが開始されてから経過した時間（秒単位）。               |
| `progress`          | 完了した作業の割合（0-100％）。                           |
| `is_mutation`       | このプロセスが部分的な変異であれば1。                       |
| `size_compressed`   | マージされたパーツの圧縮データの合計サイズ。                |
| `memory_usage`      | マージプロセスのメモリ消費。                               |

### 構文 {#syntax-25}

```sql title="Syntax"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### 例 {#examples-8}

```sql title="Query"
SHOW MERGES;
```

```text title="Response"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="Query"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="Response"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```
