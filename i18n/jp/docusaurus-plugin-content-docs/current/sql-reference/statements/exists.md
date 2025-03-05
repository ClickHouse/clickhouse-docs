---
slug: /sql-reference/statements/exists
sidebar_position: 45
sidebar_label: EXISTS
---


# EXISTS ステートメント

``` sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

存在しないテーブルまたはデータベースの場合は `0` の単一値を含む `UInt8` 型のカラムを返し、指定されたデータベースにテーブルが存在する場合は `1` を返します。
