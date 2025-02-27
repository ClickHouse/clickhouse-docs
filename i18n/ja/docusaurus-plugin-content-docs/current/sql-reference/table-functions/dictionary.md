---
slug: /sql-reference/table-functions/dictionary
sidebar_position: 47
sidebar_label: dictionary
title: Dictionary
---

ClickHouse テーブルとして [辞書](../../sql-reference/dictionaries/index.md) データを表示します。 [辞書](../../engines/table-engines/special/dictionary.md) エンジンと同様に動作します。

**構文**

``` sql
dictionary('dict')
```

**引数**

- `dict` — 辞書の名前。 [文字列](../../sql-reference/data-types/string.md)。

**返される値**

ClickHouse テーブル。

**例**

入力テーブル `dictionary_source_table`:

``` text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

辞書を作成します:

``` sql
CREATE DICTIONARY new_dictionary(id UInt64, value UInt64 DEFAULT 0) PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() USER 'default' TABLE 'dictionary_source_table')) LAYOUT(DIRECT());
```

クエリ:

``` sql
SELECT * FROM dictionary('new_dictionary');
```

結果:

``` text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

**関連項目**

- [辞書エンジン](../../engines/table-engines/special/dictionary.md#dictionary)
