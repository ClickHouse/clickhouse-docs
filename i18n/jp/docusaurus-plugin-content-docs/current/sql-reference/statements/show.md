---
description: 'SHOW に関するドキュメント'
sidebar_label: 'SHOW'
sidebar_position: 37
slug: /sql-reference/statements/show
title: 'SHOW ステートメント'
doc_type: 'reference'
---

:::note

`SHOW CREATE (TABLE|DATABASE|USER)` は、次の設定が有効化されていない限りシークレットを非表示にします：

- [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings/#display_secrets_in_show_and_select) (サーバー設定)
- [`format_display_secrets_in_show_and_select` ](../../operations/settings/formats/#format_display_secrets_in_show_and_select) (フォーマット設定)  

さらに、ユーザーは [`displaySecretsInShowAndSelect`](grant.md/#displaysecretsinshowandselect) 権限を持っている必要があります。
:::

## SHOW CREATE TABLE | DICTIONARY | VIEW | DATABASE \\{#show-create-table--dictionary--view--database\\}

これらのステートメントは、指定したオブジェクトの作成に使用された `CREATE` クエリを含む、`String` 型の単一列を返します。

### 構文 \{#syntax\}

```sql title="Syntax"
SHOW [CREATE] TABLE | TEMPORARY TABLE | DICTIONARY | VIEW | DATABASE [db.]table|view [INTO OUTFILE filename] [FORMAT format]
```

:::note
このステートメントを使用してシステムテーブルの `CREATE` クエリを取得しようとすると、
テーブル構造だけを定義していてテーブルの作成には使用できない
*擬似的な* クエリが返されます。
:::


## SHOW DATABASES \\{#show-databases\\}

このステートメントは、すべてのデータベースを一覧表示します。

### 構文 \{#syntax-1\}

```sql title="Syntax"
SHOW DATABASES [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```

これは次のクエリと同じです：

```sql
SELECT name FROM system.databases [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE filename] [FORMAT format]
```


### 例 \{#examples\}

この例では、`SHOW` を使用して、名前に文字列 &#39;de&#39; を含むデータベース名を取得します。

```sql title="Query"
SHOW DATABASES LIKE '%de%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

大文字小文字を区別せずに検索することもできます。

```sql title="Query"
SHOW DATABASES ILIKE '%DE%'
```

```text title="Response"
┌─name────┐
│ default │
└─────────┘
```

または、名前に &#39;de&#39; を含まないデータベース名を取得します：

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

最後に、最初の 2 つのデータベース名のみを取得します。

```sql title="Query"
SHOW DATABASES LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ _temporary_and_external_tables │
│ default                        │
└────────────────────────────────┘
```


### 関連項目 \\{#see-also\\}

* [`CREATE DATABASE`](/sql-reference/statements/create/database)

## SHOW TABLES \\{#show-tables\\}

`SHOW TABLES` ステートメントは、テーブルの一覧を表示します。

### 構文 \{#syntax-2\}

```sql title="Syntax"
SHOW [FULL] [TEMPORARY] TABLES [{FROM | IN} <db>] [[NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベース内のテーブルの一覧を返します。

このステートメントは次のクエリと同一です。

```sql
SELECT name FROM system.tables [WHERE name [NOT] LIKE | ILIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```


### 例 \{#examples-1\}

この例では、`SHOW TABLES` ステートメントを使用して、名前に&#39;user&#39; が含まれるすべてのテーブルを検索します。

```sql title="Query"
SHOW TABLES FROM system LIKE '%user%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

同じことを大文字・小文字を区別せずに行うこともできます：

```sql title="Query"
SHOW TABLES FROM system ILIKE '%USER%'
```

```text title="Response"
┌─name─────────────┐
│ user_directories │
│ users            │
└──────────────────┘
```

または、名前に「s」を含まないテーブルを検索するには次のようにします。

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

最後に、先頭 2 つのテーブル名だけを取得します。

```sql title="Query"
SHOW TABLES FROM system LIMIT 2
```

```text title="Response"
┌─name───────────────────────────┐
│ aggregate_function_combinators │
│ asynchronous_metric_log        │
└────────────────────────────────┘
```


### 関連項目 \\{#see-also-1\\}

* [`Create Tables`](/sql-reference/statements/create/table)
* [`SHOW CREATE TABLE`](#show-create-table--dictionary--view--database)

## SHOW COLUMNS \\{#show_columns\\}

`SHOW COLUMNS` ステートメントは、列の一覧を表示します。

### 構文 \{#syntax-3\}

```sql title="Syntax"
SHOW [EXTENDED] [FULL] COLUMNS {FROM | IN} <table> [{FROM | IN} <db>] [{[NOT] {LIKE | ILIKE} '<pattern>' | WHERE <expr>}] [LIMIT <N>] [INTO
OUTFILE <filename>] [FORMAT <format>]
```

データベース名とテーブル名は、省略形として `<db>.<table>` の形式で指定できます。
これは `FROM tab FROM db` と `FROM db.tab` が同等であることを意味します。
データベースが指定されていない場合、クエリは現在のデータベースのカラム一覧を返します。

オプションのキーワードとして `EXTENDED` と `FULL` も利用できます。`EXTENDED` キーワードは現在は効果はなく、
MySQL との互換性のために存在しています。`FULL` キーワードを指定すると、出力に照合順序（collation）、コメント、権限（privilege）カラムが含まれます。

`SHOW COLUMNS` 文は、次の構造を持つ結果テーブルを生成します。

| Column      | Description                                                                | Type               |
| ----------- | -------------------------------------------------------------------------- | ------------------ |
| `field`     | カラム名                                                                       | `String`           |
| `type`      | カラムのデータ型。クエリが MySQL のワイヤプロトコル経由で実行された場合は、MySQL における同等の型名が表示されます。           | `String`           |
| `null`      | カラムのデータ型が Nullable の場合は `YES`、それ以外は `NO`                                   | `String`           |
| `key`       | カラムがプライマリキーの一部であれば `PRI`、ソートキーの一部であれば `SOR`、それ以外は空文字                       | `String`           |
| `default`   | カラムが `ALIAS`、`DEFAULT`、`MATERIALIZED` のいずれかの型である場合のデフォルト式。それ以外の場合は `NULL`。 | `Nullable(String)` |
| `extra`     | 追加情報。現在は未使用                                                                | `String`           |
| `collation` | （`FULL` キーワードが指定された場合のみ）カラムの照合順序。ClickHouse にはカラムごとの照合順序がないため、常に `NULL`    | `Nullable(String)` |
| `comment`   | （`FULL` キーワードが指定された場合のみ）カラムに対するコメント                                        | `String`           |
| `privilege` | （`FULL` キーワードが指定された場合のみ）このカラムに対して持っている権限。現在は利用できません                        | `String`           |


### Examples \{#examples-2\}

この例では、テーブル &#39;orders&#39; のすべてのカラムについて、
&#39;delivery&#95;&#39; で始まるカラムの情報を取得するために `SHOW COLUMNS` 文を使用します。

```sql title="Query"
SHOW COLUMNS FROM 'orders' LIKE 'delivery_%'
```

```text title="Response"
┌─field───────────┬─type─────┬─null─┬─key─────┬─default─┬─extra─┐
│ delivery_date   │ DateTime │    0 │ PRI SOR │ ᴺᵁᴸᴸ    │       │
│ delivery_status │ Bool     │    0 │         │ ᴺᵁᴸᴸ    │       │
└─────────────────┴──────────┴──────┴─────────┴─────────┴───────┘
```


### 関連項目 \\{#see-also-2\\}

- [`system.columns`](../../operations/system-tables/columns.md)

## SHOW DICTIONARIES \\{#show-dictionaries\\}

`SHOW DICTIONARIES` ステートメントは、[Dictionaries](../../sql-reference/dictionaries/index.md) の一覧を表示します。

### 構文 \{#syntax-4\}

```sql title="Syntax"
SHOW DICTIONARIES [FROM <db>] [LIKE '<pattern>'] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

`FROM` 句が指定されていない場合、クエリは現在のデータベース内の辞書一覧を返します。

次のようにして、`SHOW DICTIONARIES` クエリと同じ結果を取得できます。

```sql
SELECT name FROM system.dictionaries WHERE database = <db> [AND name LIKE <pattern>] [LIMIT <N>] [INTO OUTFILE <filename>] [FORMAT <format>]
```


### 例 \{#examples-3\}

次のクエリは、`system` データベース内のテーブル一覧から、名前に `reg` を含む先頭の 2 行を選択します。

```sql title="Query"
SHOW DICTIONARIES FROM db LIKE '%reg%' LIMIT 2
```

```text title="Response"
┌─name─────────┐
│ regions      │
│ region_names │
└──────────────┘
```


## SHOW INDEX \\{#show-index\\}

テーブルのプライマリインデックスおよびデータスキッピングインデックスの一覧を表示します。

このステートメントは主に MySQL との互換性のために存在します。システムテーブル [`system.tables`](../../operations/system-tables/tables.md)（プライマリキー用）および [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)（データスキッピングインデックス用）は、ClickHouse にとってより自然な形で同等の情報を提供します。

### Syntax \{#syntax-5\}

```sql title="Syntax"
SHOW [EXTENDED] {INDEX | INDEXES | INDICES | KEYS } {FROM | IN} <table> [{FROM | IN} <db>] [WHERE <expr>] [INTO OUTFILE <filename>] [FORMAT <format>]
```

データベース名およびテーブル名は `<db>.<table>` のような省略形で指定できます。つまり、`FROM tab FROM db` と `FROM db.tab` は同等です。データベースが指定されていない場合、クエリは現在のデータベースを使用すると仮定します。

オプションのキーワード `EXTENDED` は現在何の効果もなく、MySQL 互換性のために存在しています。

このステートメントは、次の構造を持つ結果テーブルを生成します。

| Column          | Description                                                                | Type               |
| --------------- | -------------------------------------------------------------------------- | ------------------ |
| `table`         | テーブル名。                                                                     | `String`           |
| `non_unique`    | ClickHouse は一意制約をサポートしないため、常に `1`。                                         | `UInt8`            |
| `key_name`      | インデックス名。インデックスがプライマリキーインデックスの場合は `PRIMARY`。                                | `String`           |
| `seq_in_index`  | プライマリキーインデックスの場合、そのカラムの位置（`1` から）。データスキップインデックスの場合は常に `1`。                 | `UInt8`            |
| `column_name`   | プライマリキーインデックスの場合、そのカラム名。データスキップインデックスの場合は `''`（空文字列）。フィールド「expression」を参照。 | `String`           |
| `collation`     | インデックス内でのカラムのソート順。昇順なら `A`、降順なら `D`、ソートされていない場合は `NULL`。                   | `Nullable(String)` |
| `cardinality`   | インデックスのカーディナリティ（インデックス内の一意値の数）の推定値。現在は常に 0。                                | `UInt64`           |
| `sub_part`      | ClickHouse は MySQL のようなインデックスプレフィックスをサポートしないため、常に `NULL`。                  | `Nullable(String)` |
| `packed`        | ClickHouse は（MySQL のような）パックドインデックスをサポートしないため、常に `NULL`。                    | `Nullable(String)` |
| `null`          | 現在は未使用。                                                                    |                    |
| `index_type`    | インデックスの種類。例: `PRIMARY`, `MINMAX`, `BLOOM_FILTER` など。                       | `String`           |
| `comment`       | インデックスに関する追加情報。現在は常に `''`（空文字列）。                                           | `String`           |
| `index_comment` | ClickHouse のインデックスには MySQL のような `COMMENT` フィールドを持たせることができないため、`''`（空文字列）。  | `String`           |
| `visible`       | インデックスがオプティマイザーから可視である場合、常に `YES`。                                         | `String`           |
| `expression`    | データスキップインデックスの場合、そのインデックス式。プライマリキーインデックスの場合は `''`（空文字列）。                   | `String`           |


### 例 \{#examples-4\}

この例では、`SHOW INDEX` 文を使用して、テーブル &#39;tbl&#39; に存在するすべての索引に関する情報を取得します。

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


### 関連項目 \\{#see-also-3\\}

* [`system.tables`](../../operations/system-tables/tables.md)
* [`system.data_skipping_indices`](../../operations/system-tables/data_skipping_indices.md)

## SHOW PROCESSLIST \\{#show-processlist\\}

現在処理中のクエリの一覧を含む [`system.processes`](/operations/system-tables/processes) テーブルの内容を出力します。ただし、`SHOW PROCESSLIST` クエリは除外されます。

### 構文 \{#syntax-6\}

```sql title="Syntax"
SHOW PROCESSLIST [INTO OUTFILE filename] [FORMAT format]
```

`SELECT * FROM system.processes` クエリは、現在実行中のすべてのクエリに関するデータを返します。

:::tip
コンソールで実行します：

```bash
$ watch -n1 "clickhouse-client --query='SHOW PROCESSLIST'"
```

:::


## SHOW GRANTS \\{#show-grants\\}

`SHOW GRANTS` ステートメントは、ユーザーの権限を表示します。

### 構文 \{#syntax-7\}

```sql title="Syntax"
SHOW GRANTS [FOR user1 [, user2 ...]] [WITH IMPLICIT] [FINAL]
```

ユーザーが指定されていない場合、クエリは現在のユーザーに対する権限を返します。

`WITH IMPLICIT` 修飾子を使用すると、暗黙的な権限付与（例：`GRANT SELECT ON system.one`）も表示できます。

`FINAL` 修飾子は、ユーザー自身の権限と、そのユーザーに付与されたロール（継承分を含む）からのすべての権限を統合します。


## SHOW CREATE USER \\{#show-create-user\\}

`SHOW CREATE USER` 文は、[ユーザー作成](../../sql-reference/statements/create/user.md) 時に指定されたパラメータを表示します。

### 構文 \{#syntax-8\}

```sql title="Syntax"
SHOW CREATE USER [name1 [, name2 ...] | CURRENT_USER]
```


## SHOW CREATE ROLE \\{#show-create-role\\}

`SHOW CREATE ROLE` ステートメントは、[ロールの作成](../../sql-reference/statements/create/role.md)時に使用されたパラメータを表示します。

### 構文 \{#syntax-9\}

```sql title="Syntax"
SHOW CREATE ROLE name1 [, name2 ...]
```


## SHOW CREATE ROW POLICY \\{#show-create-row-policy\\}

`SHOW CREATE ROW POLICY` ステートメントは、[行ポリシーの作成](../../sql-reference/statements/create/row-policy.md) の際に使用されたパラメーターを表示します。

### 構文 \{#syntax-10\}

```sql title="Syntax"
SHOW CREATE [ROW] POLICY name ON [database1.]table1 [, [database2.]table2 ...]
```


## SHOW CREATE QUOTA \\{#show-create-quota\\}

`SHOW CREATE QUOTA` ステートメントは、[クォータ作成](../../sql-reference/statements/create/quota.md)時に指定されたパラメーターを表示します。

### 構文 \{#syntax-11\}

```sql title="Syntax"
SHOW CREATE QUOTA [name1 [, name2 ...] | CURRENT]
```


## SHOW CREATE SETTINGS PROFILE \\{#show-create-settings-profile\\}

`SHOW CREATE SETTINGS PROFILE` ステートメントは、[設定プロファイルの作成](../../sql-reference/statements/create/settings-profile.md) で使用されたパラメーターを表示します。

### 構文 \{#syntax-12\}

```sql title="Syntax"
SHOW CREATE [SETTINGS] PROFILE name1 [, name2 ...]
```


## SHOW USERS \\{#show-users\\}

`SHOW USERS` ステートメントは、[ユーザーアカウント](../../guides/sre/user-management/index.md#user-account-management)名の一覧を返します。
ユーザーアカウントのパラメータを表示するには、システムテーブル [`system.users`](/operations/system-tables/users) を参照してください。

### 構文 \{#syntax-13\}

```sql title="Syntax"
SHOW USERS
```


## SHOW ROLES \\{#show-roles\\}

`SHOW ROLES` ステートメントは、[ロール](../../guides/sre/user-management/index.md#role-management)の一覧を返します。
他のパラメータを確認するには、
システムテーブル [`system.roles`](/operations/system-tables/roles) および [`system.role_grants`](/operations/system-tables/role_grants) を参照してください。

### 構文 \{#syntax-14\}

```sql title="Syntax"
SHOW [CURRENT|ENABLED] ROLES
```


## SHOW PROFILES \\{#show-profiles\\}

`SHOW PROFILES` ステートメントは、[設定プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)のリストを返します。
ユーザーアカウントに関するパラメータを確認するには、システムテーブル [`settings_profiles`](/operations/system-tables/settings_profiles) を参照してください。

### 構文 \{#syntax-15\}

```sql title="Syntax"
SHOW [SETTINGS] PROFILES
```


## SHOW POLICIES \\{#show-policies\\}

`SHOW POLICIES` ステートメントは、指定したテーブルに対する [行ポリシー](../../guides/sre/user-management/index.md#row-policy-management) の一覧を返します。
ユーザーアカウントのパラメータを表示するには、システムテーブル [`system.row_policies`](/operations/system-tables/row_policies) を参照してください。

### 構文 \{#syntax-16\}

```sql title="Syntax"
SHOW [ROW] POLICIES [ON [db.]table]
```


## SHOW QUOTAS \\{#show-quotas\\}

`SHOW QUOTAS` ステートメントは、[クオータ](../../guides/sre/user-management/index.md#quotas-management)の一覧を返します。
クオータのパラメータを確認するには、システムテーブル [`system.quotas`](/operations/system-tables/quotas) を参照してください。

### 構文 \{#syntax-17\}

```sql title="Syntax"
SHOW QUOTAS
```


## SHOW QUOTA \\{#show-quota\\}

`SHOW QUOTA` ステートメントは、すべてのユーザーまたは現在のユーザーの[クオータ](../../operations/quotas.md)の消費状況を返します。
その他のパラメータを表示するには、システムテーブル [`system.quotas_usage`](/operations/system-tables/quotas_usage) および [`system.quota_usage`](/operations/system-tables/quota_usage) を参照してください。

### 構文 \{#syntax-18\}

```sql title="Syntax"
SHOW [CURRENT] QUOTA
```


## SHOW ACCESS \\{#show-access\\}

`SHOW ACCESS` ステートメントは、すべての[ユーザー](../../guides/sre/user-management/index.md#user-account-management)、[ロール](../../guides/sre/user-management/index.md#role-management)、[プロファイル](../../guides/sre/user-management/index.md#settings-profiles-management)などと、それらに付与されているすべての[権限](../../sql-reference/statements/grant.md#privileges)を表示します。

### 構文 \{#syntax-19\}

```sql title="Syntax"
SHOW ACCESS
```


## SHOW CLUSTER(S) \\{#show-clusters\\}

`SHOW CLUSTER(S)` ステートメントは、クラスタの一覧を返します。
利用可能なすべてのクラスタは、[`system.clusters`](../../operations/system-tables/clusters.md) テーブルに一覧されています。

:::note
`SHOW CLUSTER name` クエリは、指定したクラスタ名に対応する `system.clusters` テーブルの `cluster`、`shard_num`、`replica_num`、`host_name`、`host_address`、`port` を表示します。
:::

### 構文 \{#syntax-20\}

```sql title="Syntax"
SHOW CLUSTER '<name>'
SHOW CLUSTERS [[NOT] LIKE|ILIKE '<pattern>'] [LIMIT <N>]
```


### 例 \{#examples-5\}

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


## SHOW SETTINGS \\{#show-settings\\}

`SHOW SETTINGS` ステートメントは、システム設定とその値の一覧を返します。
[`system.settings`](../../operations/system-tables/settings.md) テーブルからデータを取得します。

### 構文 \{#syntax-21\}

```sql title="Syntax"
SHOW [CHANGED] SETTINGS LIKE|ILIKE <name>
```


### 句 \\{#clauses\\}

`LIKE|ILIKE` は設定名に対してマッチパターンを指定できます。`%` や `_` といったワイルドカードを含めることができます。`LIKE` 句は大文字と小文字を区別し、`ILIKE` 句は大文字と小文字を区別しません。

`CHANGED` 句を使用すると、クエリはデフォルト値から変更された設定のみを返します。

### 例 \{#examples-6\}

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

`CHANGED` 句を用いたクエリ:

```sql title="Query"
SHOW CHANGED SETTINGS ILIKE '%MEMORY%'
```

```text title="Response"
┌─name─────────────┬─type───┬─value───────┐
│ max_memory_usage │ UInt64 │ 10000000000 │
└──────────────────┴────────┴─────────────┘
```


## SHOW SETTING \\{#show-setting\\}

`SHOW SETTING` ステートメントは、指定した設定名の設定値を表示します。

### 構文 \{#syntax-22\}

```sql title="Syntax"
SHOW SETTING <name>
```


### 関連項目 \\{#see-also-4\\}

* [`system.settings`](../../operations/system-tables/settings.md) テーブル

## SHOW FILESYSTEM CACHES \\{#show-filesystem-caches\\}

### 使用例 \{#examples-7\}

```sql title="Query"
SHOW FILESYSTEM CACHES
```

```text title="Response"
┌─Caches────┐
│ s3_cache  │
└───────────┘
```


### 関連項目 \\{#see-also-5\\}

* [`system.settings`](../../operations/system-tables/settings.md) テーブル

## SHOW ENGINES \\{#show-engines\\}

`SHOW ENGINES` ステートメントは、サーバーがサポートするテーブルエンジンの説明と、その機能のサポート状況が格納されている [`system.table_engines`](../../operations/system-tables/table_engines.md) テーブルの内容を出力します。

### 構文 \{#syntax-23\}

```sql title="Syntax"
SHOW ENGINES [INTO OUTFILE filename] [FORMAT format]
```


### 関連項目 \\{#see-also-6\\}

- [system.table_engines](../../operations/system-tables/table_engines.md) テーブル

## SHOW FUNCTIONS \\{#show-functions\\}

`SHOW FUNCTIONS` ステートメントは、[`system.functions`](../../operations/system-tables/functions.md) テーブルの内容を表示します。

### 構文 \{#syntax-24\}

```sql title="Syntax"
SHOW FUNCTIONS [LIKE | ILIKE '<pattern>']
```

`LIKE` 句または `ILIKE` 句が指定されている場合、クエリは名前が指定された `<pattern>` に一致するシステム関数の一覧を返します。


### 関連項目 \\{#see-also-7\\}

* [`system.functions`](../../operations/system-tables/functions.md) テーブル

## SHOW MERGES \\{#show-merges\\}

`SHOW MERGES` ステートメントは、マージの一覧を返します。
すべてのマージは [`system.merges`](../../operations/system-tables/merges.md) テーブルに一覧表示されます。

| Column              | Description              |
| ------------------- | ------------------------ |
| `table`             | テーブル名。                   |
| `database`          | テーブルが属するデータベース名。         |
| `estimate_complete` | 完了までの推定時間（秒）。            |
| `elapsed`           | マージ開始からの経過時間（秒）。         |
| `progress`          | 完了済み作業の進捗率（0〜100 パーセント）。 |
| `is_mutation`       | この処理がパーツのミューテーションであれば 1。 |
| `size_compressed`   | マージされたパーツの圧縮データの合計サイズ。   |
| `memory_usage`      | マージ処理のメモリ使用量。            |

### 構文 \{#syntax-25\}

```sql title="Syntax"
SHOW MERGES [[NOT] LIKE|ILIKE '<table_name_pattern>'] [LIMIT <N>]
```


### 例 \{#examples-8\}

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


## SHOW CREATE MASKING POLICY \\{#show-create-masking-policy\\}

`SHOW CREATE MASKING POLICY` ステートメントは、[マスキングポリシーの作成](../../sql-reference/statements/create/masking-policy.md) の際に使用されたパラメーターを表示します。

### 構文 \{#syntax-26\}

```sql title="Syntax"
SHOW CREATE MASKING POLICY name ON [database.]table
```
