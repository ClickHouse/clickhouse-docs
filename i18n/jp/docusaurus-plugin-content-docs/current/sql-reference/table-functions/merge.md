---
description: '一時的なMergeテーブルを作成します。構造は、基になるテーブルからの列のunionおよび共通の型の導出によって派生されます。'
sidebar_label: 'マージ'
sidebar_position: 130
slug: '/sql-reference/table-functions/merge'
title: 'Merge'
---




# merge Table Function

一時的な [Merge](../../engines/table-engines/special/merge.md) テーブルを作成します。構造は、基になるテーブルのカラムの結合を使用し、共通のタイプを導出することによって導き出されます。

## Syntax {#syntax}

```sql
merge(['db_name',] 'tables_regexp')
```
## Arguments {#arguments}

| Argument        | Description                                                                                                                                                                                                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `db_name`       | 使用可能な値（省略可能、デフォルトは `currentDatabase()`）：<br/>    - データベース名,<br/>    - データベース名を含む文字列を返す定数式、たとえば `currentDatabase()`、<br/>    - `REGEXP(expression)`、ここで `expression` は DB 名に一致する正規表現です。 |
| `tables_regexp` | 指定された DB または DB 内のテーブル名に一致する正規表現。                                                                                                                                                                                                                       |

## Related {#related}

- [Merge](../../engines/table-engines/special/merge.md) テーブルエンジン
