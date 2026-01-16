---
description: 'サブクエリをテーブルとして扱います。ビューを実装する関数です。'
sidebar_label: 'view'
sidebar_position: 210
slug: /sql-reference/table-functions/view
title: 'view'
doc_type: 'reference'
---

# view テーブル関数 \{#view-table-function\}

副問い合わせをテーブルに変換します。この関数はビューを実装します（[CREATE VIEW](/sql-reference/statements/create/view) を参照）。生成されるテーブルはデータを保存せず、指定された `SELECT` クエリのみを保持します。テーブルから読み出すとき、ClickHouse はこのクエリを実行し、結果から不要なカラムをすべて削除します。

## 構文 \{#syntax\}

```sql
view(subquery)
```

## 引数 \{#arguments\}

- `subquery` — `SELECT` クエリ。

## 戻り値 \{#returned_value\}

- テーブル

## 例 \{#examples\}

入力テーブル：

```text
┌─id─┬─name─────┬─days─┐
│  1 │ January  │   31 │
│  2 │ February │   29 │
│  3 │ March    │   31 │
│  4 │ April    │   30 │
└────┴──────────┴──────┘
```

クエリ：

```sql
SELECT * FROM view(SELECT name FROM months);
```

結果:

```text
┌─name─────┐
│ January  │
│ February │
│ March    │
│ April    │
└──────────┘
```

`view` 関数は、[remote](/sql-reference/table-functions/remote) および [cluster](/sql-reference/table-functions/cluster) テーブル関数の引数として使用できます。

```sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

```sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```

## 関連項目 \{#related\}

- [View テーブルエンジン](/engines/table-engines/special/view/)
