---
'description': 'Documentation for USE Statement'
'sidebar_label': 'USE'
'sidebar_position': 53
'slug': '/sql-reference/statements/use'
'title': 'USE Statement'
---




# USEステートメント

```sql
USE db
```

現在のセッションのために、現在のデータベースを設定します。

現在のデータベースは、クエリでテーブル名の前にドットでデータベースが明示的に定義されていない場合に、テーブルを検索するために使用されます。

このクエリは、HTTPプロトコルを使用する際には実行できません。セッションの概念がないためです。
