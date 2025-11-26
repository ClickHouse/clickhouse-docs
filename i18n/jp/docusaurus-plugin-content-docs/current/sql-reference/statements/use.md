---
description: 'USE ステートメントに関するドキュメント'
sidebar_label: 'USE'
sidebar_position: 53
slug: /sql-reference/statements/use
title: 'USE ステートメント'
doc_type: 'reference'
---

# USE ステートメント

```sql
USE [DATABASE] db
```

セッションの現在のデータベースを設定します。

現在のデータベースは、クエリ内でテーブル名の前にピリオドを付けてデータベースが明示的に指定されていない場合に、テーブルを検索する際に使用されます。

HTTP プロトコルを使用している場合はセッションという概念がないため、このクエリは実行できません。
