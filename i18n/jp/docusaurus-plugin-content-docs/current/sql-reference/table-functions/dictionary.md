---
description: '辞書データを ClickHouse のテーブルとして表示します。Dictionary エンジンと同様に動作します。'
sidebar_label: 'dictionary'
sidebar_position: 47
slug: /sql-reference/table-functions/dictionary
title: 'dictionary'
doc_type: 'reference'
---

[Dictionary](../statements/create/dictionary/overview.md) のデータを ClickHouse のテーブルとして表示します。[Dictionary](../../engines/table-engines/special/dictionary.md) エンジンと同様に動作します。

## 構文 \{#syntax\}

```sql
dictionary('dict')
```


## 引数 \{#arguments\}

- `dict` — 辞書名。[String](../../sql-reference/data-types/string.md) 型。

## 戻り値 \{#returned_value\}

ClickHouse テーブルです。

## 例 \{#examples\}

入力テーブル `dictionary_source_table`:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

Dictionaryを作成する：

```sql title="Query"
CREATE DICTIONARY new_dictionary(id UInt64, value UInt64 DEFAULT 0) PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() USER 'default' TABLE 'dictionary_source_table')) LAYOUT(DIRECT());
```

```sql title="Query"
SELECT * FROM dictionary('new_dictionary');
```

```text title="Response"
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

## 関連 \{#related\}

- [Dictionary エンジン](/engines/table-engines/special/dictionary)