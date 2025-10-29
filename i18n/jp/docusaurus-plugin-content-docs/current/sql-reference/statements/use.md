---
'description': 'USE ステートメントに関するドキュメント'
'sidebar_label': 'USE'
'sidebar_position': 53
'slug': '/sql-reference/statements/use'
'title': 'USE 文'
'doc_type': 'reference'
---


# USE Statement

```sql
USE [DATABASE] db
```

セッションの現在のデータベースを設定できます。

現在のデータベースは、クエリでテーブル名の前にドットを指定してデータベースが明示的に定義されていない場合に、テーブルを検索するために使用されます。

HTTPプロトコルを使用している場合には、セッションの概念がないため、このクエリは実行できません。
