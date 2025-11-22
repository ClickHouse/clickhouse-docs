---
description: '一時的な Merge テーブルを作成します。構造は、列の和集合を取り、共通のデータ型を導出することで、基となるテーブルから決定されます。'
sidebar_label: 'merge'
sidebar_position: 130
slug: /sql-reference/table-functions/merge
title: 'merge'
doc_type: 'reference'
---



# merge テーブル関数

一時的な [Merge](../../engines/table-engines/special/merge.md) テーブルを作成します。
テーブルスキーマは、基になるテーブルの列の和集合と、それらから導出される共通の型に基づいて決定されます。
[Merge](../../engines/table-engines/special/merge.md) テーブルエンジンと同じ仮想列を利用できます。



## 構文 {#syntax}


```sql
merge(['db_name',] 'tables_regexp')
```

## 引数 {#arguments}

| 引数        | 説明                                                                                                                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db_name`       | 指定可能な値(オプション、デフォルトは `currentDatabase()`):<br/> - データベース名<br/> - データベース名を含む文字列を返す定数式(例: `currentDatabase()`)<br/> - `REGEXP(expression)` - `expression` はデータベース名にマッチする正規表現 |
| `tables_regexp` | 指定されたデータベース内のテーブル名にマッチする正規表現 |


## 関連項目 {#related}

- [Merge](../../engines/table-engines/special/merge.md) テーブルエンジン
