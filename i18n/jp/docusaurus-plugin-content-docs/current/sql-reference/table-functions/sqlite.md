---
description: 'SQLiteデータベースに格納されたデータに対してクエリを実行することを可能にします。'
sidebar_label: 'sqlite'
sidebar_position: 185
slug: /sql-reference/table-functions/sqlite
title: 'sqlite'
---


# sqlite テーブル関数

[SQLite](../../engines/database-engines/sqlite.md)データベースに格納されたデータに対してクエリを実行することを可能にします。

**構文**

```sql
sqlite('db_path', 'table_name')
```

**引数**

- `db_path` — SQLiteデータベースのファイルパス。[文字列](../../sql-reference/data-types/string.md)。
- `table_name` — SQLiteデータベース内のテーブル名。[文字列](../../sql-reference/data-types/string.md)。

**返される値**

- 元の`SQLite`テーブルと同じカラムを持つテーブルオブジェクト。

**例**

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

**その他の参照**

- [SQLite](../../engines/table-engines/integrations/sqlite.md) テーブルエンジン
