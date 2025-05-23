---
'description': 'EXISTS 语句的文档'
'sidebar_label': 'EXISTS'
'sidebar_position': 45
'slug': '/sql-reference/statements/exists'
'title': 'EXISTS 语句'
---


# EXISTS 语句

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

返回一个单一的 `UInt8` 类型列，如果表或数据库不存在，则该值为 `0`，如果表在指定的数据库中存在，则该值为 `1`。
