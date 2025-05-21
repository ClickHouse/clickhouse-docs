---
description: '一時的な Merge テーブルを作成します。構造は、基になるテーブルのカラムのユニオンを使用し、共通の型を導出することによって派生します。'
sidebar_label: 'merge'
sidebar_position: 130
slug: /sql-reference/table-functions/merge
title: 'merge'
---


# merge テーブル関数

一時的な [Merge](../../engines/table-engines/special/merge.md) テーブルを作成します。構造は、基になるテーブルのカラムのユニオンを使用し、共通の型を導出することによって派生します。

**構文**

```sql
merge(['db_name',] 'tables_regexp')
```
**引数**

- `db_name` — 可能な値（省略可能、デフォルトは `currentDatabase()`）：
    - データベース名、
    - データベース名の文字列を返す定数式、例えば `currentDatabase()`、
    - `REGEXP(expression)`、ここで `expression` は DB 名を一致させるための正規表現です。

- `tables_regexp` — 指定された DB または DBs 内のテーブル名と一致させる正規表現です。

**関連事項**

- [Merge](../../engines/table-engines/special/merge.md) テーブルエンジン
