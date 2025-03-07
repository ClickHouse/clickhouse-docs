---
slug: '/sql-reference/table-functions/dictionary'
sidebar_position: 47
sidebar_label: '辞書'
title: '辞書'
description: 'ClickHouse テーブルとして辞書データを表示します。Dictionary エンジンと同様に機能します。'
---


# 辞書テーブル関数

[dictionary](../../sql-reference/dictionaries/index.md) データを ClickHouse テーブルとして表示します。 [Dictionary](../../engines/table-engines/special/dictionary.md) エンジンと同じように機能します。

**構文**

``` sql
dictionary('dict')
```

**引数**

- `dict` — 辞書の名前。[String](../../sql-reference/data-types/string.md)。

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

辞書を作成:

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

- [Dictionary engine](/engines/table-engines/special/dictionary)
