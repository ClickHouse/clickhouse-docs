---
description: 'このエンジンは、SQLite との間でデータのインポートおよびエクスポートを行うことができ、ClickHouse から SQLite のテーブルに対する直接クエリをサポートします。'
sidebar_label: 'SQLite'
sidebar_position: 185
slug: /engines/table-engines/integrations/sqlite
title: 'SQLite テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite テーブルエンジン

<CloudNotSupportedBadge/>

このエンジンを使用すると、SQLite へのデータのインポートおよびエクスポートが可能になり、ClickHouse から SQLite テーブルへ直接クエリを実行することもできます。



## テーブルの作成

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = SQLite('db_path', 'table')
```

**エンジンのパラメータ**

* `db_path` — データベースを含む SQLite ファイルへのパス。
* `table` — SQLite データベース内のテーブル名。


## 使用例

SQLite テーブルを作成するクエリを次に示します。

```sql
SHOW CREATE TABLE sqlite_db.table2;
```

```text
CREATE TABLE SQLite.table2
(
    `col1` Nullable(Int32),
    `col2` Nullable(String)
)
ENGINE = SQLite('sqlite.db','table2');
```

テーブル内のデータを返します：

```sql
SELECT * FROM sqlite_db.table2 ORDER BY col1;
```

```text
┌─col1─┬─col2──┐
│    1 │ text1 │
│    2 │ text2 │
│    3 │ text3 │
└──────┴───────┘
```

**関連項目**

* [SQLite](../../../engines/database-engines/sqlite.md) エンジン
* [sqlite](../../../sql-reference/table-functions/sqlite.md) テーブル関数
