---
description: 'サブクエリをテーブルに変換します。この関数はビューを実装します。'
sidebar_label: 'view'
sidebar_position: 210
slug: /sql-reference/table-functions/view
title: 'view'
doc_type: 'reference'
---



# view テーブル関数

サブクエリをテーブルとして扱います。この関数はビューを実装します（[CREATE VIEW](/sql-reference/statements/create/view) を参照）。生成されるテーブル自体はデータを保持せず、指定された `SELECT` クエリのみを保持します。テーブルを読み込む際、ClickHouse はそのクエリを実行し、結果から不要な列をすべて削除します。



## 構文 {#syntax}

```sql
view(subquery)
```


## 引数 {#arguments}

- `subquery` — `SELECT`クエリ。


## 戻り値 {#returned_value}

- テーブル


## 例 {#examples}

入力テーブル:

```text
┌─id─┬─name─────┬─days─┐
│  1 │ January  │   31 │
│  2 │ February │   29 │
│  3 │ March    │   31 │
│  4 │ April    │   30 │
└────┴──────────┴──────┘
```

クエリ:

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

`view`関数は、[remote](/sql-reference/table-functions/remote)および[cluster](/sql-reference/table-functions/cluster)テーブル関数のパラメータとして使用できます:

```sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

```sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```


## 関連項目 {#related}

- [Viewテーブルエンジン](/engines/table-engines/special/view/)
