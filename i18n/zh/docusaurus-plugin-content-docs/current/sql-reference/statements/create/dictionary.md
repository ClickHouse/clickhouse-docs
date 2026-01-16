---
description: '字典文档'
sidebar_label: 'DICTIONARY'
sidebar_position: 38
slug: /sql-reference/statements/create/dictionary
title: 'CREATE DICTIONARY'
doc_type: 'reference'
---

根据给定的[结构](../../../sql-reference/dictionaries/index.md#dictionary-key-and-fields)、[数据源](../../../sql-reference/dictionaries/index.md#dictionary-sources)、[布局](/sql-reference/dictionaries#storing-dictionaries-in-memory)和[生命周期](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)创建一个新的[字典](../../../sql-reference/dictionaries/index.md)。

## 语法 \{#syntax\}

```sql
CREATE [OR REPLACE] DICTIONARY [IF NOT EXISTS] [db.]dictionary_name [ON CLUSTER cluster]
(
    key1 type1  [DEFAULT|EXPRESSION expr1] [IS_OBJECT_ID],
    key2 type2  [DEFAULT|EXPRESSION expr2],
    attr1 type2 [DEFAULT|EXPRESSION expr3] [HIERARCHICAL|INJECTIVE],
    attr2 type2 [DEFAULT|EXPRESSION expr4] [HIERARCHICAL|INJECTIVE]
)
PRIMARY KEY key1, key2
SOURCE(SOURCE_NAME([param1 value1 ... paramN valueN]))
LAYOUT(LAYOUT_NAME([param_name param_value]))
LIFETIME({MIN min_val MAX max_val | max_val})
SETTINGS(setting_name = setting_value, setting_name = setting_value, ...)
COMMENT 'Comment'
```

字典结构由属性组成。字典属性的定义方式与表列类似。唯一必须显式指定的属性是类型，其余属性都可以使用默认值。

`ON CLUSTER` 子句允许在集群上创建字典，参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md)。

根据字典的 [layout](/sql-reference/dictionaries#storing-dictionaries-in-memory)，可以将一个或多个属性指定为字典键。

## 源 \{#source\}

字典的来源可以是：

* 当前 ClickHouse 服务中的表
* 远程 ClickHouse 服务中的表
* 通过 HTTP(S) 访问的文件
* 另一个数据库

### 从当前 ClickHouse 服务中的表创建字典 \{#create-a-dictionary-from-a-table-in-the-current-clickhouse-service\}

输入表 `source_table`：

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

创建字典：

```sql
CREATE DICTIONARY id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
```

输出字典：

```sql
SHOW CREATE DICTIONARY id_value_dictionary;
```

```response
CREATE DICTIONARY default.id_value_dictionary
(
    `id` UInt64,
    `value` String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table'))
LIFETIME(MIN 0 MAX 1000)
LAYOUT(FLAT())
```

:::note
在 [ClickHouse Cloud](https://clickhouse.com) 中使用 SQL 控制台创建字典时，必须指定用户（`default` 或任何具有 `default_role` 角色的其他用户）和密码。
:::

```sql
CREATE USER IF NOT EXISTS clickhouse_admin
IDENTIFIED WITH sha256_password BY 'passworD43$x';

GRANT default_role TO clickhouse_admin;

CREATE DATABASE foo_db;

CREATE TABLE foo_db.source_table (
    id UInt64,
    value String
) ENGINE = MergeTree
PRIMARY KEY id;

CREATE DICTIONARY foo_db.id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(TABLE 'source_table' USER 'clickhouse_admin' PASSWORD 'passworD43$x' DB 'foo_db' ))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000);
```

### 基于远程 ClickHouse 服务中的表创建字典 \{#create-a-dictionary-from-a-table-in-a-remote-clickhouse-service\}

输入表（位于远程 ClickHouse 服务中）`source_table`：

```text
┌─id─┬─value──┐
│  1 │ First  │
│  2 │ Second │
└────┴────────┘
```

创建字典：

```sql
CREATE DICTIONARY id_value_dictionary
(
    id UInt64,
    value String
)
PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'HOSTNAME' PORT 9000 USER 'default' PASSWORD 'PASSWORD' TABLE 'source_table' DB 'default'))
LAYOUT(FLAT())
LIFETIME(MIN 0 MAX 1000)
```

### 从可通过 HTTP(S) 访问的文件创建字典 \{#create-a-dictionary-from-a-file-available-by-https\}

```sql
CREATE DICTIONARY default.taxi_zone_dictionary
(
    `LocationID` UInt16 DEFAULT 0,
    `Borough` String,
    `Zone` String,
    `service_zone` String
)
PRIMARY KEY LocationID
SOURCE(HTTP(URL 'https://datasets-documentation.s3.eu-west-3.amazonaws.com/nyc-taxi/taxi_zone_lookup.csv' FORMAT 'CSVWithNames'))
LIFETIME(MIN 0 MAX 0)
LAYOUT(HASHED())
```

### 从另一个数据库创建字典 \{#create-a-dictionary-from-another-database\}

详细信息请参阅[字典源](/sql-reference/dictionaries#dbms)。

**另请参阅**

* 更多信息请参见[字典](../../../sql-reference/dictionaries/index.md)章节。
* [system.dictionaries](../../../operations/system-tables/dictionaries.md) — 此表包含关于[字典](../../../sql-reference/dictionaries/index.md)的信息。
