---
'description': 'Dictionaryのためのドキュメント'
'sidebar_label': 'DICTIONARY'
'sidebar_position': 38
'slug': '/sql-reference/statements/create/dictionary'
'title': 'CREATE DICTIONARY'
---



Creates a new [dictionary](../../../sql-reference/dictionaries/index.md) with given [structure](../../../sql-reference/dictionaries/index.md#dictionary-key-and-fields), [source](../../../sql-reference/dictionaries/index.md#dictionary-sources), [layout](/sql-reference/dictionaries#storing-dictionaries-in-memory) and [lifetime](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime).

## Syntax {#syntax}

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name [ON CLUSTER cluster]
(
    key1 type1  [DEFAULT|EXPRESSION expr1] [IS_OBJECT_ID],
    key2 type2  [DEFAULT|EXPRESSION expr2],
    attr1 type2 [DEFAULT|EXPRESSION expr3] [HIERARCHICAL|INJECTIVE],
    attr2 type2 [DEFAULT|EXPRESSION expr4] [HIERARCHICAL|INJECTIVE]
)
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Comment'
```

辞書の構造は属性で構成されています。辞書属性はテーブルカラムと同様に指定されます。唯一必須の属性プロパティはその型であり、他のすべてのプロパティにはデフォルト値が設定される可能性があります。

`ON CLUSTER` 句を使用すると、クラスタ上で辞書を作成できます。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

辞書の [layout](/sql-reference/dictionaries#storing-dictionaries-in-memory) に応じて、一つまたは複数の属性を辞書キーとして指定することができます。

## SOURCE {#source}

辞書のソースは以下のいずれかです：
- 現在の ClickHouse サービス内のテーブル
- リモートの ClickHouse サービス内のテーブル
- HTTP(S) で利用可能なファイル
- 別のデータベース

### 現在の ClickHouse サービス内のテーブルから辞書を作成 {#create-a-dictionary-from-a-table-in-the-current-clickhouse-service}

入力テーブル `source_table`：

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

辞書の作成：

```sql
CREATE DICTIONARY id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
```

辞書の出力：

```sql
SHOW CREATE DICTIONARY id_value_dictionary;
```

```response
CREATE DICTIONARY default.id_value_dictionary
(
    `id` UInt64,
    `value` String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LIFETIME(MIN 0 MAX 1000)
LAYOUT(FLAT())
```

:::note
[ClickHouse Cloud](https://clickhouse.com) の SQL コンソールを使用する場合、辞書を作成する際にはユーザー (`default` または `default_role` 権限を持つ他のユーザー) とパスワードを指定する必要があります。
:::

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'passworD43$x';

GRANT default_role TO clickhouse_admin;

CREATE DATABASE foo_db;

CREATE TABLE foo_db.source_table (
    id UInt64,
    value String
) ENGINE = MergeTree
PRIMARY KEY id;

CREATE DICTIONARY foo_db.id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table' USER 'clickhouse_admin' PASSWORD 'passworD43$x' DB 'foo_db' ))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000);
```

### リモート ClickHouse サービス内のテーブルから辞書を作成 {#create-a-dictionary-from-a-table-in-a-remote-clickhouse-service}

リモート ClickHouse サービス内の入力テーブル `source_table`：

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

辞書の作成：

```sql
CREATE DICTIONARY id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'HOSTNAME' PORT 9000 USER 'default' PASSWORD 'PASSWORD' TABLE 'source_table' DB 'default'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
```

### HTTP(S) で利用可能なファイルから辞書を作成 {#create-a-dictionary-from-a-file-available-by-https}

```sql
CREATE DICTIONARY default.taxi_zone_dictionary
(
    `LocationID` UInt16 DEFAULT 0,
    `Borough` String,
    `Zone` String,
    `service_zone` String
)
PRIMARY KEY LocationID
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(HASHED())
```

### 別のデータベースから辞書を作成 {#create-a-dictionary-from-another-database}

詳細は [Dictionary sources](/sql-reference/dictionaries#dbms) を参照してください。

**参照**

- 詳細については、[Dictionaries](../../../sql-reference/dictionaries/index.md) セクションを参照してください。
- [system.dictionaries](../../../operations/system-tables/dictionaries.md) — このテーブルには [Dictionaries](../../../sql-reference/dictionaries/index.md) に関する情報が含まれています。
