---
'description': 'EXISTS ステートメントのドキュメント'
'sidebar_label': 'EXISTS'
'sidebar_position': 45
'slug': '/sql-reference/statements/exists'
'title': 'EXISTS ステートメント'
'doc_type': 'reference'
---


# EXISTS Statement

```sql
EXISTS [TEMPORARY] [TABLE|DICTIONARY|DATABASE] [db.]name [INTO OUTFILE filename] [FORMAT format]
```

存在しない場合、テーブルまたはデータベースが存在しない場合は `0` の単一の `UInt8` 型カラムを返し、指定されたデータベースにテーブルが存在する場合は `1` を返します。
