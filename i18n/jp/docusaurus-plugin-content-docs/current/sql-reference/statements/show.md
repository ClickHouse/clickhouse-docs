---
slug: '/sql-reference/statements/show'
sidebar_position: 37
sidebar_label: 'SHOW'
title: 'SHOW 文'
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` は、以下の設定がオンになっていない限り、秘密情報を隠します：

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (サーバー設定)
- [`format_display_secrets_in_show_and_select`](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (フォーマット設定)  

加えて、ユーザーは[`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect)特権を持っている必要があります。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE {#show-create-table--dictionary--view--database}

これらの文は、指定されたオブジェクトの作成に使用された`CREATE`クエリを含む、文字列型の1つのカラムを返します。

### 構文 {#syntax}

```sql title="構文"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
この文を使用してシステムテーブルの`CREATE`クエリを取得すると、テーブル構造を宣言するだけの*フェイク*クエリが返され、テーブルを作成することはできません。
:::

## SHOW DATABASES {#show-databases}

この文は、すべてのデータベースのリストを印刷します。

### 構文 {#syntax-1}

```sql title="構文"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

これは以下のクエリと同じです：

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

### 例 {#examples}

この例では、`SHOW`を使用して名前に'se'を含むデータベース名を取得します：

```sql title="クエリ"
SHOW DATABASES LIKE '%de%'
```

```text title="応答"
┌─name────┐
│ default │
└─────────┘
```

また、ケースインセンシティブな方法でも行えます：

```sql title="クエリ"
SHOW DATABASES ILIKE '%DE%'
```

```text title="応答"
┌─name────┐
│ default │
└─────────┘
```

名前に'de'を含まないデータベース名を取得することも可能です：

```sql title="クエリ"
SHOW DATABASES NOT LIKE '%de%'
```

```text title="応答"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ system                         │
│ test                           │
│ tutorial                       │
└────────────────────────────────┘
```

最後に、最初の2つのデータベース名だけを取得することもできます：

```sql title="クエリ"
SHOW DATABASES LIMIT 2
```

```text title="応答"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```

### 関連項目 {#see-also}

- [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES {#show-tables}

`SHOW TABLES`文は、テーブルのリストを表示します。

### 構文 {#syntax-2}

```sql title="構文"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM`句が指定されていない場合、クエリは現在のデータベースのテーブルのリストを返します。

この文は以下のクエリと同じです：

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-1}

この例では、`SHOW TABLES`文を使用して名前に'user'を含むすべてのテーブルを見つけます：

```sql title="クエリ"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="応答"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

ケースインセンシティブな方法でも行えます：

```sql title="クエリ"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="応答"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

名前に's'を含まないテーブルを見つけるためにも使用できます：

```sql title="クエリ"
SHOW TABLES FROM system NOT LIKE '%s%'
```

```text title="応答"
┌─name─────────┐
│ metric_log   │
│ metric_log_0 │
│ metric_log_1 │
└──────────────┘
```

最後に、最初の2つのテーブル名だけを取得できます：

```sql title="クエリ"
SHOW TABLES FROM system LIMIT 2
```

```text title="応答"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```

### 関連項目 {#see-also-1}

- [`Create Tables`](/sql-reference/statements/create/table)
- [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS {#show_columns}

`SHOW COLUMNS`文は、カラムのリストを表示します。

### 構文 {#syntax-3}

```sql title="構文"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

データベースとテーブル名は、`<db>.<table>`の省略形で指定することができ、`FROM tab FROM db`と`FROM db.tab`は同等です。データベースが指定されていない場合、クエリは現在のデータベースからのカラムリストを返します。

`EXTENDED`と`FULL`の2つのオプションのキーワードもあります。`EXTENDED`キーワードは現在影響がなく、MySQLとの互換性のために存在します。`FULL`キーワードは、出力に照合順序、コメント、および特権カラムを含めるようにします。

`SHOW COLUMNS`文は、以下の構造の結果テーブルを生成します：

| Column      | Description                                                                                                                   | Type               |
|-------------|-------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `field`     | カラムの名前                                                                                                                | `String`           |
| `type`      | カラムのデータ型。クエリがMySQLワイヤプロトコルを介して行われた場合、MySQLの対応する型名が表示されます。                 | `String`           |
| `null`      | カラムのデータ型がNullableの場合は`YES`、そうでない場合は`NO`                                                               | `String`           |
| `key`       | カラムが主キーの一部である場合は`PRI`、ソートキーの一部である場合は`SOR`、それ以外は空                                                                 | `String`           |
| `default`   | カラムのデフォルト式が、型が`ALIAS`、`DEFAULT`、または`MATERIALIZED`の場合。そうでなければ`NULL`。                          | `Nullable(String)` |
| `extra`     | 追加情報、現在は未使用                                                                                                      | `String`           |
| `collation` | (`FULL`キーワードが指定された場合のみ) カラムの照合、ClickHouseにはカラムごとの照合がないため常に`NULL`                     | `Nullable(String)` |
| `comment`   | (`FULL`キーワードが指定された場合のみ) カラムについてのコメント                                                              | `String`           |
| `privilege` | (`FULL`キーワードが指定された場合のみ) このカラムに対して持っている特権、現在は利用できない                                   | `String`           |

### 例 {#examples-2}

この例では、`SHOW COLUMNS`文を使用して、'orders'テーブルのすべてのカラムに関する情報を取得します。'delivery_'から始めます：

```sql title="クエリ"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="応答"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```

### 関連項目 {#see-also-2}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES {#show-dictionaries}

`SHOW DICTIONARIES`文は、[ディクショナリ](../../sql-reference/dictionaries/index.md)のリストを表示します。

### 構文 {#syntax-4}

```sql title="構文"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM`句が指定されていない場合、クエリは現在のデータベースからのディクショナリのリストを返します。

`SHOW DICTIONARIES`クエリと同じ結果を以下のように得ることができます：

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

### 例 {#examples-3}

次のクエリは、名前に`reg`を含む`system`データベース内のテーブルのリストから最初の2つの行を選択します：

```sql title="クエリ"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="応答"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```

## SHOW INDEX {#show-index}

テーブルの主キーおよびデータスキッピングインデックスのリストを表示します。

この文は主にMySQLとの互換性のために存在します。システムテーブル[`system.tables`](../../operations/system-tables/tables.md)（主キー用）および[`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)（データスキッピングインデックス用）は、ClickHouseによりネイティブな形式で同等の情報を提供します。

### 構文 {#syntax-5}

```sql title="構文"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

データベースおよびテーブル名は、`<db>.<table>`の省略形で指定することができ、`FROM tab FROM db`と`FROM db.tab`は同等です。データベースが指定されていない場合、クエリは現在のデータベースをデータベースと仮定します。

オプションのキーワード`EXTENDED`は現在無効であり、MySQLとの互換性のために存在します。

次の構造の結果テーブルを生成します：

| Column          | Description                                                                                                              | Type               |
|-----------------|--------------------------------------------------------------------------------------------------------------------------|--------------------|
| `table`         | テーブルの名前。                                                                                                        | `String`           |
| `non_unique`    | ClickHouseは一意性制約をサポートしないため、常に`1`。                                                                  | `UInt8`            |
| `key_name`      | インデックスの名前、プライマリキーインデックスの場合は`PRIMARY`。                                                      | `String`           |
| `seq_in_index`  | プライマリキーインデックスの場合、カラムの位置を`1`から始める。データスキッピングインデックスの場合は常に`1`。       | `UInt8`            |
| `column_name`   | プライマリキーインデックスではカラムの名前。データスキッピングインデックスの場合は`''`（空文字列）、フィールド "expression"を参照。 | `String`           |
| `collation`     | インデックス内カラムのソート：昇順の場合は`A`、降順の場合は`D`、未ソートの場合は`NULL`。                             | `Nullable(String)` |
| `cardinality`   | インデックスのカーディナリティ（インデックス内の一意の値の数）の推定値。現在は常に0。                                | `UInt64`           |
| `sub_part`      | ClickHouseはMySQLのインデックスプレフィックスをサポートしないため常に`NULL`。                                        | `Nullable(String)` |
| `packed`        | ClickHouseはパックされたインデックスをサポートしないため常に`NULL`。                                                  | `Nullable(String)` |
| `null`          | 現在未使用                                                                                                             |                    |
| `index_type`    | インデックスタイプ、例：`PRIMARY`、`MINMAX`、`BLOOM_FILTER`など。                                                    | `String`           |
| `comment`       | インデックスについての追加情報、現在は常に`''`（空文字列）。                                                        | `String`           |
| `index_comment` | インデックスには`COMMENT`フィールドを持てないため`''`（空文字列）。                                                | `String`           |
| `visible`       | インデックスがオプティマイザに見える場合、常に`YES`。                                                                | `String`           |
| `expression`    | データスキッピングインデックスの場合、インデックス表現。プライマリキーインデックスの場合は`''`（空文字列）。          | `String`           |

### 例 {#examples-4}

この例では、`SHOW INDEX`文を使用して'tbl'テーブルのすべてのインデックスに関する情報を取得します：

```sql title="クエリ"
SHOW INDEX FROM 'tbl'
```

```text title="応答"
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

[`system.processes`](/operations/system-tables/processes)テーブルの内容を出力し、現在処理されているクエリのリストを表示します。`SHOW PROCESSLIST`クエリを除きます。

### 構文 {#syntax-6}

```sql title="構文"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes`クエリは、すべての現在のクエリに関するデータを返します。

:::tip
コンソールで実行：

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```
:::

## SHOW GRANTS {#show-grants}

`SHOW GRANTS`文は、ユーザーの特権を表示します。

### 構文 {#syntax-7}

```sql title="構文"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

ユーザーが指定されていない場合、クエリは現在のユーザーの特権を返します。

`WITH IMPLICIT`修飾子を使用すると、暗黙のグラント（例：`GRANT SELECT ON system.one`）を表示できます。

`FINAL`修飾子は、ユーザーとその付与されたロールからのすべてのグラントをマージします（継承を伴う）

## SHOW CREATE USER {#show-create-user}

`SHOW CREATE USER`文は、[ユーザー作成](../../sql-reference/statements/create/user.md)時に使用されたパラメーターを表示します。

### 構文 {#syntax-8}

```sql title="構文"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```

## SHOW CREATE ROLE {#show-create-role}

`SHOW CREATE ROLE`文は、[ロール作成](../../sql-reference/statements/create/role.md)時に使用されたパラメーターを表示します。

### 構文 {#syntax-9}

```sql title="構文"
SHOW CREATE ROLE name1 [, name2 ...]
```

## SHOW CREATE ROW POLICY {#show-create-row-policy}

`SHOW CREATE ROW POLICY`文は、[行ポリシー作成](../../sql-reference/statements/create/row-policy.md)時に使用されたパラメーターを表示します。

### 構文 {#syntax-10}

```sql title="構文"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```

## SHOW CREATE QUOTA {#show-create-quota}

`SHOW CREATE QUOTA`文は、[クォータ作成](../../sql-reference/statements/create/quota.md)時に使用されたパラメーターを表示します。

### 構文 {#syntax-11}

```sql title="構文"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```

## SHOW CREATE SETTINGS PROFILE {#show-create-settings-profile}

`SHOW CREATE SETTINGS PROFILE`文は、[設定プロファイル作成](../../sql-reference/statements/create/settings-profile.md)時に使用されたパラメーターを表示します。

### 構文 {#syntax-12}

```sql title="構文"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```

## SHOW USERS {#show-users}

`SHOW USERS`文は、[ユーザーアカウント](../../guides/sre/user-management/index.md#user-account-management)の名前のリストを返します。 
ユーザーアカウントのパラメータを表示するには、システムテーブル[`system.users`](/operations/system-tables/users)を参照してください。

### 構文 {#syntax-13}

```sql title="構文"
SHOW USERS
```

## SHOW ROLES {#show-roles}

`SHOW ROLES`文は、[ロール](../../guides/sre/user-management/index.md#role-management)のリストを返します。 
他のパラメータを表示するには、システムテーブル[`system.roles`](/operations/system-tables/roles)および[`system.role_grants`](/operations/system-tables/role-grants)を参照してください。

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

`SHOW QUOTAS`文は、[クォータ](../../guides/sre/user-management/index.md#quotas-management)のリストを返します。 
クォータのパラメータを表示するには、システムテーブル[`system.quotas`](/operations/system-tables/quotas)を参照してください。

### 構文 {#syntax-17}

```sql title="構文"
SHOW QUOTAS
```

## SHOW QUOTA {#show-quota}

`SHOW QUOTA`文は、すべてのユーザーまたは現在のユーザーの[クォータ](../../operations/quotas.md)の消費を返します。 
他のパラメータを表示するには、システムテーブル[`system.quotas_usage`](/operations/system-tables/quotas_usage)および[`system.quota_usage`](/operations/system-tables/quota_usage)を参照してください。

### 構文 {#syntax-18}

```sql title="構文"
SHOW [CURRENT] QUOTA
```
## SHOW ACCESS {#show-access}

`SHOW ACCESS`文は、すべての[ユーザー](../../guides/sre/user-management/index.md#user-account-management)、[ロール](../../guides/sre/user-management/index.md#role-management)、[プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)などを示し、すべての[グラント](../../sql-reference/statements/grant.md#privileges)を表示します。

### 構文 {#syntax-19}

```sql title="構文"
SHOW ACCESS
```

## SHOW CLUSTER(S) {#show-clusters}

`SHOW CLUSTER(S)`文は、クラスターのリストを返します。 
利用可能なすべてのクラスターは、[`system.clusters`](../../operations/system-tables/clusters.md)テーブルにリストされています。

:::note
`SHOW CLUSTER name`クエリは、指定されたクラスタ名の`system.clusters`テーブルの内容を表示します。
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

```text title="応答"
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

```text title="応答"
┌─cluster─────────────────┐
│ test_cluster_two_shards │
└─────────────────────────┘
```

```sql title="クエリ"
SHOW CLUSTER 'test_shard_localhost' FORMAT Vertical;
```

```text title="応答"
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

`SHOW SETTINGS`文は、システム設定とその値のリストを返します。 
[`system.settings`](../../operations/system-tables/settings.md)テーブルからデータを選択します。

### 構文 {#syntax-21}

```sql title="構文"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```

### 句 {#clauses}

`LIKE|ILIKE`を使用すると、設定名の一致パターンを指定できます。 `%`や`_`のようなグロブを含めることができます。`LIKE`句は大文字と小文字を区別し、`ILIKE`は大文字と小文字を区別しません。

`CHANGED`句を使用すると、デフォルト値から変更された設定のみがクエリで返されます。

### 例 {#examples-6}

`LIKE`句を使用したクエリ：

```sql title="クエリ"
SHOW SETTINGS LIKE 'send_timeout';
```

```text title="応答"
┌─name─────────┬─type────┬─value─┐
│ send_timeout │ Seconds │ 300   │
└──────────────┴─────────┴───────┘
```

`ILIKE`句を使用したクエリ：

```sql title="クエリ"
SHOW SETTINGS ILIKE '%CONNECT_timeout%'
```

```text title="応答"
┌─name────────────────────────────────────┬─type─────────┬─value─┐
│ connect_timeout                         │ Seconds      │ 10    │
│ connect_timeout_with_failover_ms        │ Milliseconds │ 50    │
│ connect_timeout_with_failover_secure_ms │ Milliseconds │ 100   │
└─────────────────────────────────────────┴──────────────┴───────┘
```

`CHANGED`句を使用したクエリ：

```sql title="クエリ"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="応答"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```

## SHOW SETTING {#show-setting}

`SHOW SETTING`文は、指定された設定名の設定値を出力します。

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

```text title="応答"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```

### 関連項目 {#see-also-5}

- [`system.settings`](../../operations/system-tables/settings.md)テーブル

## SHOW ENGINES {#show-engines}

`SHOW ENGINES`文は、[`system.table_engines`](../../operations/system-tables/table_engines.md)テーブルの内容を出力し、サーバーがサポートするテーブルエンジンの説明とその機能サポート情報を含みます。

### 構文 {#syntax-23}

```sql title="構文"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```

### 関連項目 {#see-also-6}

- [system.table_engines](../../operations/system-tables/table_engines.md)テーブル

## SHOW FUNCTIONS {#show-functions}

`SHOW FUNCTIONS`文は、[`system.functions`](../../operations/system-tables/functions.md)テーブルの内容を出力します。

### 構文 {#syntax-24}

```sql title="構文"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE`または`ILIKE`句が指定された場合、クエリは指定された`<pattern>`に一致するシステム関数のリストを返します。

### 関連項目 {#see-also-7}

- [`system.functions`](../../operations/system-tables/functions.md)テーブル

## SHOW MERGES {#show-merges}

`SHOW MERGES`文は、マージのリストを返します。 
すべてのマージは[`system.merges`](../../operations/system-tables/merges.md)テーブルにリストされています：

| Column              | Description                                                |
|---------------------|------------------------------------------------------------|
| `table`             | テーブル名。                                              |
| `database`          | テーブルが属するデータベースの名前。                      |
| `estimate_complete` | 完了までの推定時間（秒単位）。                          |
| `elapsed`           | マージ開始からの経過時間（秒単位）。                    |
| `progress`          | 完了した作業の割合（0-100パーセント）。                 |
| `is_mutation`       | このプロセスが部分的な変更である場合は1。              |
| `size_compressed`   | マージされたパーツの圧縮データの合計サイズ。            |
| `memory_usage`      | マージプロセスのメモリ消費。                             |

### 構文 {#syntax-25}

```sql title="構文"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```

### 例 {#examples-8}

```sql title="クエリ"
SHOW MERGES;
```

```text title="応答"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```

```sql title="クエリ"
SHOW MERGES LIKE 'your_t%' LIMIT 1;
```

```text title="応答"
┌─table──────┬─database─┬─estimate_complete─┬─elapsed─┬─progress─┬─is_mutation─┬─size_compressed─┬─memory_usage─┐
│ your_table │ default  │              0.14 │    0.36 │    73.01 │           0 │        5.40 MiB │    10.25 MiB │
└────────────┴──────────┴───────────────────┴─────────┴──────────┴─────────────┴─────────────────┴──────────────┘
```
