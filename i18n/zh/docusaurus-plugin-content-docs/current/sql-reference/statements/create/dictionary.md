---
'description': '字典的 Documentation'
'sidebar_label': 'DICTIONARY'
'sidebar_position': 38
'slug': '/sql-reference/statements/create/dictionary'
'title': 'CREATE DICTIONARY'
---

创建一个新的 [dictionary](../../../sql-reference/dictionaries/index.md)，其具有给定的 [structure](../../../sql-reference/dictionaries/index.md#dictionary-key-and-fields)、[source](../../../sql-reference/dictionaries/index.md#dictionary-sources)、[layout](/sql-reference/dictionaries#storing-dictionaries-in-memory) 和 [lifetime](/sql-reference/dictionaries#refreshing-dictionary-data-using-lifetime)。

## 语法 {#syntax}

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

字典结构由属性组成。字典属性的指定方式类似于表列。唯一必需的属性是其类型，所有其他属性可以具有默认值。

`ON CLUSTER` 子句允许在集群上创建字典，请参见 [Distributed DDL](../../../sql-reference/distributed-ddl.md)。

根据字典的 [layout](/sql-reference/dictionaries#storing-dictionaries-in-memory)，可以指定一个或多个属性作为字典键。

## 源 {#source}

字典的源可以是：
- 当前 ClickHouse 服务中的表
- 远程 ClickHouse 服务中的表
- 通过 HTTP(S) 可用的文件
- 另一个数据库

### 从当前 ClickHouse 服务中的表创建字典 {#create-a-dictionary-from-a-table-in-the-current-clickhouse-service}

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
在 [ClickHouse Cloud](https://clickhouse.com) 中使用 SQL 控制台时，创建字典时必须指定用户（`default` 或任何其他具有 `default_role` 角色的用户）和密码。
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

### 从远程 ClickHouse 服务中的表创建字典 {#create-a-dictionary-from-a-table-in-a-remote-clickhouse-service}

输入表（在远程 ClickHouse 服务中） `source_table`：

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

### 从通过 HTTP(S) 可用的文件创建字典 {#create-a-dictionary-from-a-file-available-by-https}

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

### 从另一个数据库创建字典 {#create-a-dictionary-from-another-database}

请查看 [Dictionary sources](/sql-reference/dictionaries#dbms) 中的详细信息。

**另见**

- 有关更多信息，请参见 [Dictionaries](../../../sql-reference/dictionaries/index.md) 部分。
- [system.dictionaries](../../../operations/system-tables/dictionaries.md) — 此表包含有关 [Dictionaries](../../../sql-reference/dictionaries/index.md) 的信息。
