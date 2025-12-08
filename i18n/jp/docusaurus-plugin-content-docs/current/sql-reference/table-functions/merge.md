---
description: '一時的な Merge テーブルを作成します。テーブル構造は、基になるテーブルの列の和集合を取り、共通する型を導出することで決定されます。'
sidebar_label: 'merge'
sidebar_position: 130
slug: /sql-reference/table-functions/merge
title: 'merge'
doc_type: 'reference'
---

# merge テーブル関数 {#merge-table-function}

一時的な [Merge](../../engines/table-engines/special/merge.md) テーブルを作成します。
テーブルのスキーマは、元となるテーブルの列の和集合と、共通の型を導出することで定義されます。
[Merge](../../engines/table-engines/special/merge.md) テーブルエンジンと同じ仮想列を使用できます。

## 構文 {#syntax}

```sql
merge(['db_name',] 'tables_regexp')
```

## 引数 {#arguments}

| 引数              | 説明                                                                                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `db_name`       | 指定可能な値（省略可能。既定値は `currentDatabase()`）:<br />    - データベース名、<br />    - データベース名の文字列を返す定数式（例: `currentDatabase()`）、<br />    - `REGEXP(expression)`。ここで `expression` は DB 名にマッチする正規表現。 |
| `tables_regexp` | 指定された 1 つまたは複数の DB 内のテーブル名にマッチする正規表現。                                                                                                                                               |

## 関連項目 {#related}

- [Merge](../../engines/table-engines/special/merge.md) テーブルエンジン
