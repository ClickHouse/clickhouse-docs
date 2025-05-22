---
'description': 'Documentation for Show'
'sidebar_label': 'SHOW'
'sidebar_position': 37
'slug': '/sql-reference/statements/show'
'title': 'SHOW Statements'
---




:::note

`SHOW CREATE (TABLE|DATABASE|USER)` は、以下の設定が有効でない限り、シークレットを隠します:

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (サーバー設定)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (フォーマット設定)  

さらに、ユーザーは [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 権限を持っている必要があります。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

これらのステートメントは、指定されたオブジェクトを作成するために使用された `CREATE` クエリを含む、String 型の単一カラムを返します。

### Syntax {#syntax}

```sql title="Syntax"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
このステートメントを使用して、システムテーブルの `CREATE` クエリを取得すると、
テーブル構造を宣言するだけの *偽* クエリが得られ、テーブルを作成するためには使用できません。
:::

## SHOW DATABASES {#show-databases}

このステートメントは、すべてのデータベースのリストを表示します。

### Syntax {#syntax-1}

```sql title="Syntax"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

これは、次のクエリと同じです：

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### Examples {#examples}

この例では、`SHOW` を使用して、名前にシンボルのシーケンス 'de' を含むデータベース名を取得します：

```sql title="Query"
SHOW DATABASES LIKE '%de%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

大文字小文字を区別せずに行うこともできます：

```sql title="Query"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

また、名前に 'de' を含まないデータベース名を取得することもできます：

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

最終的に、最初の2つのデータベースの名前を取得できます：

```sql title="Query"
SHOW DATABASES LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### See also {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

`SHOW TABLES` ステートメントは、テーブルのリストを表示します。

### Syntax {#syntax-2}

```sql title="Syntax"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベースからのテーブルのリストを返します。

このステートメントは、次のクエリと同じです：

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Examples {#examples-1}

この例では、`SHOW TABLES` ステートメントを使用して、名前に 'user' を含むすべてのテーブルを検索します：

```sql title="Query"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

大文字小文字を区別せずに行うこともできます：

```sql title="Query"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

また、名前に 's' を含まないテーブルを見つけることもできます：

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

最終的に、最初の2つのテーブルの名前を取得できます：

```sql title="Query"
SHOW TABLES FROM system LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### See also {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS` ステートメントは、カラムのリストを表示します。

### Syntax {#syntax-3}

```sql title="Syntax"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

データベースとテーブル名は `<db>.<table>` として省略形で指定でき、  
これは `FROM tab FROM db` と `FROM db.tab` が同等であることを意味します。  
データベースが指定されていない場合、クエリは現在のデータベースからのカラムのリストを返します。

`EXTENDED` と `FULL` の2つのオプションのキーワードがあります。`EXTENDED` キーワードは現在は効果がなく、MySQLの互換性のために存在します。`FULL` キーワードは、出力に照合順序、コメント、権限カラムを含ませます。

`SHOW COLUMNS` ステートメントは、次の構造の結果テーブルを生成します：

| Column      | Description                                                                                                                   | Type               |
|-------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`     | カラムの名前                                                                                                                | `String`           |
| `type`      | カラムのデータ型。クエリがMySQLワイヤプロトコルを介して行われた場合、同等の型名がMySQLで表示されます。                               | `String`           |
| `null`      | カラムのデータ型がNullableであれば `YES`、そうでなければ `NO`                                                                | `String`           |
| `key`       | カラムが主キーの一部であれば `PRI`、ソートキーの一部であれば `SOR`、それ以外は空                                            | `String`           |
| `default`   | カラムが `ALIAS`、 `DEFAULT`、または `MATERIALIZED` の型の場合のデフォルト表現、それ以外は `NULL`。                             | `Nullable(String)` |
| `extra`     | 追加情報、現在は未使用                                                                                                      | `String`           |
| `collation` | ( `FULL` キーワードが指定された場合のみ) カラムの照合順序、ClickHouseにはカラムごとの照合順序がないため常に `NULL`                    | `Nullable(String)` |
| `comment`   | ( `FULL` キーワードが指定された場合のみ) カラムに関するコメント                                                                    | `String`           |
| `privilege` | ( `FULL` キーワードが指定された場合のみ) このカラムに対する権限、現在は利用不可                                                  | `String`           |

### Examples {#examples-2}

この例では、`SHOW COLUMNS` ステートメントを使用して、テーブル 'orders' のすべてのカラムに関する情報を取得します。  
'delivery_' で始まるカラムを対象にします：

```sql title="Query"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Response"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### See also {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

`SHOW DICTIONARIES` ステートメントは、[Dictionaries](../../sql-reference/dictionaries/index.md)のリストを表示します。

### Syntax {#syntax-4}

```sql title="Syntax"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベースからの辞書のリストを返します。

次のようにして、`SHOW DICTIONARIES` クエリと同じ結果を取得できます：

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### Examples {#examples-3}

以下のクエリは、`system` データベース内のテーブルのリストから最初の2行を選択し、名前に `reg` を含むものを表示します。

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

このステートメントは主にMySQLとの互換性のために存在します。  
システムテーブル [`system.tables`](../../operations/system-tables/tables.md) (主キー用) および [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md) (データスキッピングインデックス用) は、ClickHouseによりよりネイティブな方法で同等の情報を提供します。

### Syntax {#syntax-5}

```sql title="Syntax"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

データベースとテーブル名は `<db>.<table>` として省略形で指定でき、  
つまり`FROM tab FROM db` と `FROM db.tab` が同等です。  
データベースが指定されていない場合、クエリは現在のデータベースを前提とします。

オプションのキーワード `EXTENDED` は現在効果がなく、MySQLの互換性のために存在します。

ステートメントは次の構造の結果テーブルを生成します：

| Column          | Description                                                                                                              | Type               |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`         | テーブルの名前。                                                                                                       | `String`           |
| `non_unique`    | ClickHouseは一意制約を支持していないため、常に `1` 。                                                                          | `UInt8`            |
| `key_name`      | インデックスの名前、インデックスが主キーインデックスの場合は `PRIMARY`。                                                  | `String`           |
| `seq_in_index`  | 主キーインデックスの場合、1から始まるカラムの位置。データスキッピングインデックスの場合は常に `1` 。                     | `UInt8`            |
| `column_name`   | 主キーインデックスの場合、『カラムの名前。データスキッピングインデックスの場合、空文字列、"expression" フィールドを参照。 | `String`           |
| `collation`     | インデックス内のカラムのソート：昇順の場合は `A`、降順の場合は `D`、ソートされていない場合は `NULL`。                         | `Nullable(String)` |
| `cardinality`   | インデックスのカーディナリティの推定 (インデックス内の一意の値の数)。現在は常に 0。                                           | `UInt64`           |
| `sub_part`      | ClickHouseはMySQLのようなインデックスプレフィックスをサポートしないため、常に `NULL`。                                      | `Nullable(String)` |
| `packed`        | ClickHouseはMySQLのような圧縮されたインデックスをサポートしないため、常に `NULL`。                                         | `Nullable(String)` |
| `null`          | 現在未使用                                                                                                            |                    |
| `index_type`    | インデックスのタイプ、例： `PRIMARY`, `MINMAX`, `BLOOM_FILTER` など。                                                     | `String`           |
| `comment`       | インデックスに関する追加情報、現在は常に空文字列。                                                                        | `String`           |
| `index_comment` | ClickHouseではインデックスに `COMMENT` フィールドを持つことができないため、空文字列。                                          | `String`           |
| `visible`       | インデックスがオプティマイザーに見える場合、常に `YES`。                                                                  | `String`           |
| `expression`    | データスキッピングインデックスの場合、インデックスの式。主キーインデックスの場合は、空文字列。                               | `String`           |

### Examples {#examples-4}

この例では、`SHOW INDEX` ステートメントを使用して、テーブル 'tbl' のすべてのインデックスに関する情報を取得します。

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

### See also {#see-also-3}

- [`system.tables`](../../operations/system-tables/tables.md)
- [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)

## SHOW PROCESSLIST {#show-processlist}

[`system.processes`](/operations/system-tables/processes) テーブルの内容を出力します。  
このテーブルには、現在処理中のクエリのリストが含まれており、 `SHOW PROCESSLIST` クエリは除外されます。

### Syntax {#syntax-6}

```sql title="Syntax"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` クエリは、現在のすべてのクエリに関するデータを返します。

:::tip
コンソールで実行する：

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS` ステートメントは、ユーザーの権限を表示します。

### Syntax {#syntax-7}

```sql title="Syntax"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

ユーザーが指定されていない場合、クエリは現在のユーザーの権限を返します。

`WITH IMPLICIT` 修飾子を使うと、暗黙の権限（例： `GRANT SELECT ON system.one`）を表示できます。

`FINAL` 修飾子は、ユーザーとその付与されたロール（継承を含む）のすべての権限をマージします。

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER` ステートメントは、[ユーザー作成時](../../sql-reference/statements/create/user.md) に使用されたパラメーターを表示します。

### Syntax {#syntax-8}

```sql title="Syntax"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE` ステートメントは、[ロール作成時](../../sql-reference/statements/create/role.md) に使用されたパラメーターを表示します。

### Syntax {#syntax-9}

```sql title="Syntax"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY` ステートメントは、[行ポリシー作成時](../../sql-reference/statements/create/row-policy.md) に使用されたパラメーターを表示します。

### Syntax {#syntax-10}

```sql title="Syntax"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA` ステートメントは、[クォータ作成時](../../sql-reference/statements/create/quota.md) に使用されたパラメーターを表示します。

### Syntax {#syntax-11}

```sql title="Syntax"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE` ステートメントは、[設定プロファイル作成時](../../sql-reference/statements/create/settings-profile.md) に使用されたパラメーターを表示します。

### Syntax {#syntax-12}

```sql title="Syntax"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS` ステートメントは、[ユーザーアカウント](../../guides/sre/user-management/index.md#user-account-management)名のリストを返します。  
ユーザーアカウントパラメータを表示するには、システムテーブル [`system.users`](/operations/system-tables/users) を参照してください。

### Syntax {#syntax-13}

```sql title="Syntax"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES` ステートメントは、[ロール](../../guides/sre/user-management/index.md#role-management)のリストを返します。  
他のパラメータを表示するには、システムテーブル [`system.roles`](/operations/system-tables/roles) および [`system.role_grants`](/operations/system-tables/role-grants) を参照してください。

### Syntax {#syntax-14}

```sql title="Syntax"
SHOW [CURRENT|ENABLED] ROLES
```

## SHOW PROFILES {#show-profiles}

`SHOW PROFILES` ステートメントは、[設定プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)のリストを返します。  
ユーザーアカウントパラメータを表示するには、システムテーブル [`settings_profiles`](/operations/system-tables/settings_profiles) を参照してください。

### Syntax {#syntax-15}

```sql title="Syntax"
SHOW [SETTINGS] PROFILES
```

## SHOW POLICIES {#show-policies}

`SHOW POLICIES` ステートメントは、指定されたテーブルに対する[行ポリシー](../../guides/sre/user-management/index.md#row-policy-management)のリストを返します。  
ユーザーアカウントパラメータを表示するには、システムテーブル [`system.row_policies`](/operations/system-tables/row_policies) を参照してください。

### Syntax {#syntax-16}

```sql title="Syntax"
SHOW [ROW] POLICIES [ON [db.]table]
```

## SHOW QUOTAS {#show-quotas}

`SHOW QUOTAS` ステートメントは、[クォータ](../../guides/sre/user-management/index.md#quotas-management)のリストを返します。  
クォータパラメータを表示するには、システムテーブル [`system.quotas`](/operations/system-tables/quotas) を参照してください。

### Syntax {#syntax-17}

```sql title="Syntax"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA` ステートメントは、すべてのユーザーまたは現在のユーザーの[クォータ](../../operations/quotas.md)消費量を返します。  
他のパラメータを表示するには、システムテーブル [`system.quotas_usage`](/operations/system-tables/quotas_usage) および [`system.quota_usage`](/operations/system-tables/quota_usage) を参照してください。

### Syntax {#syntax-18}

```sql title="Syntax"
SHOW [CURRENT] QUOTA
```

## SHOW ACCESS {#show-access}

`SHOW ACCESS` ステートメントは、すべての[ユーザー](../../guides/sre/user-management/index.md#user-account-management)、[ロール](../../guides/sre/user-management/index.md#role-management)、[プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)などとそのすべての[権限](../../sql-reference/statements/grant.md#privileges)を表示します。

### Syntax {#syntax-19}

```sql title="Syntax"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)` ステートメントは、クラスタのリストを返します。  
すべての利用可能なクラスタは、[`system.clusters`](../../operations/system-tables/clusters.md) テーブルにリストされています。

:::note
`SHOW CLUSTER name` クエリは指定されたクラスタ名に対して、 `system.clusters` テーブルから `cluster`、`shard_num`、`replica_num`、`host_name`、`host_address`、`port` を表示します。
:::

### Syntax {#syntax-20}

```sql title="Syntax"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```

### Examples {#examples-5}

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

`SHOW SETTINGS` ステートメントは、システム設定とその値のリストを返します。  
[`system.settings`](../../operations/system-tables/settings.md) テーブルからデータを選択します。

### Syntax {#syntax-21}

```sql title="Syntax"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### Clauses {#clauses}

`LIKE|ILIKE` は、設定名に対する一致パターンを指定することを可能にします。  
ワイルドカード（ `%` や `_` ）を含めることができます。 `LIKE` 句は大文字小文字を区別し、`ILIKE` は区別しません。

`CHANGED` 句が使用されている場合、クエリはデフォルト値から変更された設定のみを返します。

### Examples {#examples-6}

`LIKE` 句を使用したクエリ：

```sql title="Query"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="Response"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

`ILIKE` 句を使用したクエリ：

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

`CHANGED` 句を使用したクエリ：

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

### Syntax {#syntax-22}

```sql title="Syntax"
SHOW SETTING <name>
```

### See also {#see-also-4}

- [`system.settings`](../../operations/system-tables/settings.md) テーブル

## SHOW FILESYSTEM CACHES {#show-filesystem-caches}

### Examples {#examples-7}

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### See also {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md) テーブル

## SHOW ENGINES {#show-engines}

`SHOW ENGINES` ステートメントは、[`system.table_engines`](../../operations/system-tables/table_engines.md) テーブルの内容を出力します。  
このテーブルには、サーバーがサポートするテーブルエンジンの説明とその機能サポート情報が含まれています。

### Syntax {#syntax-23}

```sql title="Syntax"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### See also {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md) テーブル

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS` ステートメントは、[`system.functions`](../../operations/system-tables/functions.md) テーブルの内容を出力します。

### Syntax {#syntax-24}

```sql title="Syntax"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE` または `ILIKE` 句が指定されている場合、クエリは指定された `<pattern>` に一致するシステム関数のリストを返します。

### See Also {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md) テーブル

## SHOW MERGES {#show-merges}

`SHOW MERGES` ステートメントは、マージのリストを返します。  
すべてのマージは [`system.merges`](../../operations/system-tables/merges.md) テーブルにリストされています：

| Column              | Description                                                |
|---------------------|------------------------------------------------------------|
| `table`             | テーブル名。                                               |
| `database`          | テーブルが属するデータベース名。                         |
| `estimate_complete` | 完了推定時間（秒単位）。                                 |
| `elapsed`           | マージが開始されてから経過した時間（秒単位）。           |
| `progress`          | 完了した作業の割合（0-100％）。                          |
| `is_mutation`       | このプロセスが部分的なマージであれば 1。                  |
| `size_compressed`   | マージされた部分の圧縮データの合計サイズ。               |
| `memory_usage`      | マージプロセスのメモリ消費。                             |

### Syntax {#syntax-25}

```sql title="Syntax"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### Examples {#examples-8}

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
