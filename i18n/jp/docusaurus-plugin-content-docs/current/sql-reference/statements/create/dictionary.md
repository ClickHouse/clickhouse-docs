---
description: '辞書に関するドキュメント'
sidebar_label: 'DICTIONARY'
sidebar_position: 38
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
doc_type: 'reference'
---

指定された[構造](../../../sql-reference/dictionaries/index.md#dictionary-key-and-fields)、[ソース](../../../sql-reference/dictionaries/index.md#dictionary-sources)、[レイアウト](/sql-reference/dictionaries#storing-dictionaries-in-memory)、および[有効期間](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)を備えた新しい[辞書](../../../sql-reference/dictionaries/index.md)を作成します。



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

ディクショナリ構造は属性で構成されます。ディクショナリ属性の指定方法はテーブルカラムと同様です。属性で必須のプロパティは型のみで、その他のプロパティにはすべてデフォルト値を設定できます。

`ON CLUSTER`句を使用すると、クラスタ上でディクショナリを作成できます。詳細は[分散DDL](../../../sql-reference/distributed-ddl.md)を参照してください。

ディクショナリの[レイアウト](/sql-reference/dictionaries#storing-dictionaries-in-memory)に応じて、1つ以上の属性をディクショナリキーとして指定できます。


## SOURCE {#source}

ディクショナリのソースとして以下を使用できます:

- 現在のClickHouseサービス内のテーブル
- リモートのClickHouseサービス内のテーブル
- HTTP(S)経由でアクセス可能なファイル
- 別のデータベース

### 現在のClickHouseサービス内のテーブルからディクショナリを作成する {#create-a-dictionary-from-a-table-in-the-current-clickhouse-service}

入力テーブル `source_table`:

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

ディクショナリの作成:

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

ディクショナリの出力:

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
[ClickHouse Cloud](https://clickhouse.com)のSQLコンソールを使用する場合、ディクショナリを作成する際にユーザー(`default`または`default_role`ロールを持つその他のユーザー)とパスワードを指定する必要があります。
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

### リモートのClickHouseサービス内のテーブルからディクショナリを作成する {#create-a-dictionary-from-a-table-in-a-remote-clickhouse-service}

入力テーブル(リモートのClickHouseサービス内) `source_table`:

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

ディクショナリの作成:

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

### HTTP(S)経由でアクセス可能なファイルからディクショナリを作成する {#create-a-dictionary-from-a-file-available-by-https}

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

### 別のデータベースからディクショナリを作成する {#create-a-dictionary-from-another-database}

詳細は[ディクショナリソース](/sql-reference/dictionaries#dbms)を参照してください。

**関連項目**

- 詳細については、[ディクショナリ](../../../sql-reference/dictionaries/index.md)セクションを参照してください。
- [system.dictionaries](../../../operations/system-tables/dictionaries.md) — このテーブルには[ディクショナリ](../../../sql-reference/dictionaries/index.md)に関する情報が含まれています。
