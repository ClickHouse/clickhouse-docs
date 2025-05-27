---
'description': 'Documentation for EXISTS Statement'
'sidebar_label': 'EXISTS'
'sidebar_position': 45
'slug': '/sql-reference/statements/exists'
'title': 'EXISTS Statement'
---




# EXISTS ステートメント

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

テーブルまたはデータベースが存在しない場合は単一の値 `0` を含む `UInt8` 型のカラムを返し、指定されたデータベースにテーブルが存在する場合は `1` を返します。
