---
description: 'USEステートメントのドキュメント'
sidebar_label: 'USE'
sidebar_position: 53
slug: /sql-reference/statements/use
title: 'USEステートメント'
---


# USEステートメント

```sql
USE db
```

現在のセッションのために、現在のデータベースを設定できるようにします。

現在のデータベースは、テーブル名の前にドットを付けてクエリ内でデータベースが明示的に定義されていない場合に、テーブルを検索するために使用されます。

HTTPプロトコルを使用する場合、このクエリは実行できません。なぜなら、セッションの概念がないからです。
