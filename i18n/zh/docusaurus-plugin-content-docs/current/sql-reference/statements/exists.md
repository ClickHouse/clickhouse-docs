---
'description': 'EXISTS语句的文档'
'sidebar_label': 'EXISTS'
'sidebar_position': 45
'slug': '/sql-reference/statements/exists'
'title': 'EXISTS查询语句'
---




# EXISTS 语句

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

返回一个单一的 `UInt8` 类型列，如果表或数据库不存在，则包含单一值 `0`；如果表在指定数据库中存在，则包含值 `1`。
