---
description: 'このエンジンは、SQLite との間でデータのインポートおよびエクスポートを行うことができ、ClickHouse から SQLite のテーブルに対する直接クエリをサポートします。'
sidebar_label: 'SQLite'
sidebar_position: 185
slug: /engines/table-engines/integrations/sqlite
title: 'SQLite テーブルエンジン'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite テーブルエンジン \{#sqlite-table-engine\}

<CloudNotSupportedBadge />

このエンジンを使用すると、SQLite へのデータのインポートおよびエクスポートが可能になり、ClickHouse から SQLite テーブルへ直接クエリを実行することもできます。

## テーブルの作成 \{#creating-a-table\}

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


## データ型のサポート \{#data-types-support\}

テーブル定義で ClickHouse のカラム型を明示的に指定した場合、SQLite の TEXT 型カラムからは次の ClickHouse 型を解釈できます:

- [Date](../../../sql-reference/data-types/date.md)、[Date32](../../../sql-reference/data-types/date32.md)
- [DateTime](../../../sql-reference/data-types/datetime.md)、[DateTime64](../../../sql-reference/data-types/datetime64.md)
- [UUID](../../../sql-reference/data-types/uuid.md)
- [Enum8, Enum16](../../../sql-reference/data-types/enum.md)
- [Decimal32, Decimal64, Decimal128, Decimal256](../../../sql-reference/data-types/decimal.md)
- [FixedString](../../../sql-reference/data-types/fixedstring.md)
- すべての整数型（[UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../../../sql-reference/data-types/int-uint.md)）
- [Float32, Float64](../../../sql-reference/data-types/float.md)

デフォルトの型マッピングについては、[SQLite database engine](../../../engines/database-engines/sqlite.md#data_types-support) を参照してください。

## 使用例 \{#usage-example\}

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
