---
description: '辞書のドキュメント'
sidebar_label: 'DICTIONARY'
sidebar_position: 38
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
doc_type: 'reference'
---

指定された[構造](../../../sql-reference/dictionaries/index.md#dictionary-key-and-fields)、[ソース](../../../sql-reference/dictionaries/index.md#dictionary-sources)、[レイアウト](/sql-reference/dictionaries#storing-dictionaries-in-memory)、および[有効期間](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)を持つ新しい[辞書](../../../sql-reference/dictionaries/index.md)を作成します。

## 構文 {#syntax}

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

辞書の構造は属性から構成されます。辞書属性はテーブルのカラムと同様に指定します。必須の属性プロパティは型のみであり、それ以外のプロパティにはデフォルト値を使用できます。

`ON CLUSTER` 句を使用すると、クラスタ全体に辞書を作成できます。詳細は [Distributed DDL](../../../sql-reference/distributed-ddl.md) を参照してください。

辞書の [layout](/sql-reference/dictionaries#storing-dictionaries-in-memory) に応じて、1 つ以上の属性を辞書キーとして指定できます。

## ソース {#source}

辞書のソースには、次のようなものを使用できます。

* 現在の ClickHouse サービス内のテーブル
* リモートの ClickHouse サービス内のテーブル
* HTTP(S) 経由で利用可能なファイル
* 別のデータベース

### 現在の ClickHouse サービス内のテーブルから辞書を作成する {#create-a-dictionary-from-a-table-in-the-current-clickhouse-service}

入力テーブル `source_table`:

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

辞書を出力する：

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
[ClickHouse Cloud](https://clickhouse.com) の SQL コンソールを使用する場合、ディクショナリを作成するときには、ユーザー名（`default` またはロール `default_role` を持つ任意のユーザー）とパスワードを必ず指定してください。
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

### リモートの ClickHouse サービス上のテーブルからディクショナリを作成する {#create-a-dictionary-from-a-table-in-a-remote-clickhouse-service}

リモートの ClickHouse サービス上の入力テーブル `source_table`:

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

辞書を作成する:

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

### HTTP(S) 経由で取得可能なファイルから辞書を作成する {#create-a-dictionary-from-a-file-available-by-https}

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

詳細については、[Dictionary sources](/sql-reference/dictionaries#dbms) を参照してください。

**関連項目**

* 詳細は、[Dictionaries](../../../sql-reference/dictionaries/index.md) セクションを参照してください。
* [system.dictionaries](../../../operations/system-tables/dictionaries.md) — このテーブルには [Dictionaries](../../../sql-reference/dictionaries/index.md) に関する情報が含まれています。
