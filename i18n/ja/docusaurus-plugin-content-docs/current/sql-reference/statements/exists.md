---
slug: /sql-reference/statements/exists
sidebar_position: 45
sidebar_label: EXISTS
---

# EXISTS ステートメント

``` sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

テーブルまたはデータベースが存在しない場合は `0` の単一値を含む `UInt8` 型のカラムを返します。指定されたデータベースにテーブルが存在する場合は `1` を返します。
