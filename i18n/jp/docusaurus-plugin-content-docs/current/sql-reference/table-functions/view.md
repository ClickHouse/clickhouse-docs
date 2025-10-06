---
'description': 'サブクエリをテーブルに変換します。関数はビューを実装します。'
'sidebar_label': 'ビュー'
'sidebar_position': 210
'slug': '/sql-reference/table-functions/view'
'title': 'ビュー'
'doc_type': 'reference'
---


# view Table Function

サブクエリをテーブルに変換します。この関数はビューを実装しています（[CREATE VIEW](/sql-reference/statements/create/view)を参照）。結果のテーブルはデータを保存せず、指定された `SELECT` クエリのみを保存します。テーブルから読み取るとき、ClickHouse はクエリを実行し、結果からすべての不要なカラムを削除します。

## Syntax {#syntax}

```sql
view(subquery)
```

## Arguments {#arguments}

- `subquery` — `SELECT` クエリ。

## Returned value {#returned_value}

- テーブル。

## Examples {#examples}

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

結果：

```text
┌─name─────┐
│ January  │
│ February │
│ March    │
│ April    │
└──────────┘
```

`view` 関数を [remote](/sql-reference/table-functions/remote) および [cluster](/sql-reference/table-functions/cluster) テーブル関数のパラメータとして使用できます：

```sql
SELECT * FROM remote(`127.0.0.1`, view(SELECT a, b, c FROM table_name));
```

```sql
SELECT * FROM cluster(`cluster_name`, view(SELECT a, b, c FROM table_name));
```

## Related {#related}

- [View Table Engine](/engines/table-engines/special/view/)
