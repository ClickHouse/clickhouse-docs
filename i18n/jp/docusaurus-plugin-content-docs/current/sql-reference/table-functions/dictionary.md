---
description: 'ディクショナリデータをClickHouseテーブルとして表示します。Dictionaryエンジンと同様に動作します。'
sidebar_label: 'dictionary'
sidebar_position: 47
slug: /sql-reference/table-functions/dictionary
title: 'dictionary'
---


# dictionary テーブル関数

[ディクショナリ](../../sql-reference/dictionaries/index.md)データをClickHouseテーブルとして表示します。 [Dictionary](../../engines/table-engines/special/dictionary.md)エンジンと同様に動作します。

**構文**

```sql
dictionary('dict')
```

**引数**

- `dict` — ディクショナリ名。 [String](../../sql-reference/data-types/string.md)。

**戻り値**

ClickHouseテーブル。

**例**

入力テーブル `dictionary_source_table`:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

ディクショナリを作成する:

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

**関連情報**

- [Dictionaryエンジン](/engines/table-engines/special/dictionary)
