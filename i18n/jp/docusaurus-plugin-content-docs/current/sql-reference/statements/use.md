---
slug: /sql-reference/statements/use
sidebar_position: 53
sidebar_label: USE
---


# USEステートメント

``` sql
USE db
```

セッションの現在のデータベースを設定します。

現在のデータベースは、クエリでテーブル名の前にドットを付けてデータベースが明示的に定義されていない場合にテーブルを検索するために使用されます。

HTTPプロトコルを使用している場合は、セッションの概念がないため、このクエリは実行できません。
