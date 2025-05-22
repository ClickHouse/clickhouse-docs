
# EXISTS语句

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

返回一个单一的 `UInt8` 类型列，该列包含单一值 `0`，如果表或数据库不存在；如果表存在于指定数据库中，则返回 `1`。
