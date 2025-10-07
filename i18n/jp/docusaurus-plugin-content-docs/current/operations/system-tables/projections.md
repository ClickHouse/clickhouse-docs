---
'description': 'システムテーブルには、すべてのテーブルに存在するプロジェクションに関する情報が含まれています。'
'keywords':
- 'system table'
- 'projections'
'slug': '/operations/system-tables/projections'
'title': 'system.projections'
'doc_type': 'reference'
---


# system.projections

すべてのテーブルに存在するプロジェクションに関する情報を含みます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — データベース名。
- `table` ([String](../../sql-reference/data-types/string.md)) — テーブル名。
- `name` ([String](../../sql-reference/data-types/string.md)) — プロジェクション名。
- `type` ([Enum](../../sql-reference/data-types/enum.md)) — プロジェクションの型 ('Normal' = 0, 'Aggregate' = 1)。
- `sorting_key` ([Array(String)](../../sql-reference/data-types/array.md)) — プロジェクションのソートキー。
- `query` ([String](../../sql-reference/data-types/string.md)) — プロジェクションのクエリ。

**例**

```sql
SELECT * FROM system.projections LIMIT 2 FORMAT Vertical;
```

```text
Row 1:
──────
database:    default
table:       landing
name:        improved_sorting_key
type:        Normal
sorting_key: ['user_id','date']
query:       SELECT * ORDER BY user_id, date

Row 2:
──────
database:    default
table:       landing
name:        agg_no_key
type:        Aggregate
sorting_key: []
query:       SELECT count()
```
