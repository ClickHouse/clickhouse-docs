---
'description': 'SQLite データベースに格納されたデータに対してクエリを実行することを可能にします。'
'sidebar_label': 'sqlite'
'sidebar_position': 185
'slug': '/sql-reference/table-functions/sqlite'
'title': 'sqlite'
'doc_type': 'reference'
---


# sqlite テーブル関数

SQLite データベースに保存されたデータに対してクエリを実行することができます。[SQLite](../../engines/database-engines/sqlite.md)。

## 構文 {#syntax}

```sql
sqlite('db_path', 'table_name')
```

## 引数 {#arguments}

- `db_path` — SQLite データベースファイルのパス。[String](../../sql-reference/data-types/string.md)。
- `table_name` — SQLite データベース内のテーブル名。[String](../../sql-reference/data-types/string.md)。

## 戻り値 {#returned_value}

- オリジナルの `SQLite` テーブルと同じカラムを持つテーブルオブジェクト。

## 例 {#example}

クエリ:

```sql
SELECT * FROM sqlite('sqlite.db', 'table1') ORDER BY col2;
```

結果:

```text
┌─col1──┬─col2─┐
│ line1 │    1 │
│ line2 │    2 │
│ line3 │    3 │
└───────┴──────┘
```

## 関連 {#related}

- [SQLite](../../engines/table-engines/integrations/sqlite.md) テーブルエンジン
