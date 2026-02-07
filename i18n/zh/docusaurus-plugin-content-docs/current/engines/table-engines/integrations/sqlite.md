---
description: '该引擎允许向 SQLite 导入数据、从 SQLite 导出数据，并支持在 ClickHouse 中直接查询 SQLite 表。'
sidebar_label: 'SQLite'
sidebar_position: 185
slug: /engines/table-engines/integrations/sqlite
title: 'SQLite 表引擎'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# SQLite 表引擎 \{#sqlite-table-engine\}

<CloudNotSupportedBadge/>

该引擎用于向 SQLite 导入数据或从 SQLite 导出数据，并支持在 ClickHouse 中直接查询 SQLite 表。

## 创建数据表 \{#creating-a-table\}

```sql
    CREATE TABLE [IF NOT EXISTS] [db.]table_name
    (
        name1 [type1],
        name2 [type2], ...
    ) ENGINE = SQLite('db_path', 'table')
```

**引擎参数**

* `db_path` — SQLite 数据库文件的路径。
* `table` — SQLite 数据库中表的名称。


## 支持的数据类型 \{#data-types-support\}

当在表定义中显式指定 ClickHouse 列类型时，可以将 SQLite 的 TEXT 列解析为以下 ClickHouse 类型：

- [Date](../../../sql-reference/data-types/date.md), [Date32](../../../sql-reference/data-types/date32.md)
- [DateTime](../../../sql-reference/data-types/datetime.md), [DateTime64](../../../sql-reference/data-types/datetime64.md)
- [UUID](../../../sql-reference/data-types/uuid.md)
- [Enum8, Enum16](../../../sql-reference/data-types/enum.md)
- [Decimal32, Decimal64, Decimal128, Decimal256](../../../sql-reference/data-types/decimal.md)
- [FixedString](../../../sql-reference/data-types/fixedstring.md)
- 所有整数类型（[UInt8, UInt16, UInt32, UInt64, Int8, Int16, Int32, Int64](../../../sql-reference/data-types/int-uint.md)）
- [Float32, Float64](../../../sql-reference/data-types/float.md)

有关默认类型映射，请参阅 [SQLite database engine](../../../engines/database-engines/sqlite.md#data_types-support)。

## 使用示例 \{#usage-example\}

展示一个用于创建 SQLite 表的查询：

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

返回表中的数据：

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

**另请参阅**

* [SQLite](../../../engines/database-engines/sqlite.md) 引擎
* [sqlite](../../../sql-reference/table-functions/sqlite.md) 表函数
