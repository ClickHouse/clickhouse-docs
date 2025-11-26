---
description: 'EXISTS 语句文档'
sidebar_label: 'EXISTS'
sidebar_position: 45
slug: /sql-reference/statements/exists
title: 'EXISTS 语句'
doc_type: 'reference'
---

# EXISTS 语句

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

返回一个 `UInt8` 类型的单列：如果表或数据库不存在，则该列仅包含值 `0`；如果指定数据库中存在该表，则该列仅包含值 `1`。
