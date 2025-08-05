---
description: 'Displays the dictionary data as a ClickHouse table. Works the same
  way as the Dictionary engine.'
sidebar_label: '辞書'
sidebar_position: 47
slug: '/sql-reference/table-functions/dictionary'
title: 'dictionary'
---




# dictionary テーブル関数

[dictionary](../../sql-reference/dictionaries/index.md) データを ClickHouse テーブルとして表示します。 [Dictionary](../../engines/table-engines/special/dictionary.md) エンジンと同じように機能します。

## 構文 {#syntax}

```sql
dictionary('dict')
```

## 引数 {#arguments}

- `dict` — ディクショナリ名。 [String](../../sql-reference/data-types/string.md)。

## 返される値 {#returned_value}

ClickHouse テーブル。

## 例 {#examples}

入力テーブル `dictionary_source_table`:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

ディクショナリを作成:

```sql
CREATE DICTIONARY new_dictionary(id UInt64, value UInt64 DEFAULT 0) PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() USER 'default' TABLE 'dictionary_source_table')) LAYOUT(DIRECT());
```

クエリ:

```sql
SELECT * FROM dictionary('new_dictionary');
```

結果:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

## 関連 {#related}

- [Dictionary エンジン](/engines/table-engines/special/dictionary)
