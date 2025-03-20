---
slug: /sql-reference/table-functions/merge
sidebar_position: 130
sidebar_label: merge
title: "merge"
description: "一時的なMergeテーブルを作成します。テーブルの構造は、指定された正規表現に一致する最初のテーブルから取得されます。"
---


# merge テーブル関数

一時的な[Merge](../../engines/table-engines/special/merge.md)テーブルを作成します。テーブルの構造は、指定された正規表現に一致する最初のテーブルから取得されます。

**構文**

```sql
merge(['db_name',] 'tables_regexp')
```
**引数**

- `db_name` — 可能な値（オプション、デフォルトは `currentDatabase()`）:
    - データベース名、
    - データベース名を返す定数式、例えば `currentDatabase()`、
    - `REGEXP(expression)`、ここで `expression` はDB名と一致させるための正規表現です。

- `tables_regexp` — 指定されたDBまたはDBのテーブル名と一致させるための正規表現。

**関連情報**

- [Merge](../../engines/table-engines/special/merge.md)テーブルエンジン
