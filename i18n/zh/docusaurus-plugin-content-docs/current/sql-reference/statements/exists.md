---
slug: /sql-reference/statements/exists
sidebar_position: 45
sidebar_label: EXISTS
---


# EXISTS 语句

``` sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

返回一个单一的 `UInt8` 类型列，如果表或数据库不存在则包含单一值 `0`，如果表在指定数据库中存在则包含 `1`。
