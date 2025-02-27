---
slug: /sql-reference/statements/create/dictionary
sidebar_position: 38
sidebar_label: 辞書
title: "辞書の作成"
---

指定された[構造](../../../sql-reference/dictionaries/index.md#dictionary-key-and-fields)、[ソース](../../../sql-reference/dictionaries/index.md#dictionary-sources)、[レイアウト](../../../sql-reference/dictionaries/index.md#storig-dictionaries-in-memory)、および[有効期限](../../../sql-reference/dictionaries/index.md#dictionary-updates)を持つ新しい[辞書](../../../sql-reference/dictionaries/index.md)を作成します。

## 構文 {#syntax}

``` sql
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
COMMENT 'コメント'
```

辞書の構造は属性で構成されています。辞書の属性は、テーブルのカラムと同様に指定されます。唯一必要な属性プロパティはそのタイプであり、その他のプロパティはデフォルト値を持つことができます。

`ON CLUSTER` 句を使用すると、クラスター上に辞書を作成できます。詳細は[分散DDL](../../../sql-reference/distributed-ddl.md)を参照してください。

辞書の[レイアウト](../../../sql-reference/dictionaries/index.md#storig-dictionaries-in-memory)に応じて、1つ以上の属性を辞書キーとして指定できます。

## ソース {#source}

辞書のソースとして使用できるのは：
- 現在のClickHouseサービス内のテーブル
- リモートのClickHouseサービス内のテーブル
- HTTP(S)で利用可能なファイル
- 別のデータベース

### 現在のClickHouseサービス内のテーブルから辞書を作成する {#create-a-dictionary-from-a-table-in-the-current-clickhouse-service}

入力テーブル `source_table`:

``` text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

辞書の作成:

``` sql
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

辞書の出力:

``` sql
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
[ClickHouse Cloud](https://clickhouse.com) のSQLコンソールを使用する場合、辞書を作成するときにユーザー（`default` または `default_role`の役割を持つその他のユーザー）およびパスワードを指定する必要があります。
:::note

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

### リモートのClickHouseサービス内のテーブルから辞書を作成する {#create-a-dictionary-from-a-table-in-a-remote-clickhouse-service}

入力テーブル（リモートのClickHouseサービス内） `source_table`:

``` text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

辞書の作成:

``` sql
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

### HTTP(S)で利用可能なファイルから辞書を作成する {#create-a-dictionary-from-a-file-available-by-https}

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

### 別のデータベースから辞書を作成する {#create-a-dictionary-from-another-database}

詳細については[辞書ソース](/sql-reference/dictionaries/index.md#dictionary-sources/#dbms)を参照してください。

**関連情報**

- 詳細については[辞書](../../../sql-reference/dictionaries/index.md)セクションを参照してください。
- [system.dictionaries](../../../operations/system-tables/dictionaries.md) — このテーブルは[辞書](../../../sql-reference/dictionaries/index.md)に関する情報を含んでいます。
