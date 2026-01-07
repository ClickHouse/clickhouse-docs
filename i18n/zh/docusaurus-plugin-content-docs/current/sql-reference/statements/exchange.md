---
description: 'EXCHANGE 语句文档'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'EXCHANGE 语句'
doc_type: 'reference'
---

# EXCHANGE 语句 {#exchange-statement}

以原子方式交换两个表或字典的名称。
也可以通过使用临时名称的 [`RENAME`](./rename.md) 查询来实现这一操作，但在这种情况下该操作不是原子的。

:::note
`EXCHANGE` 查询仅由 [`Atomic`](../../engines/database-engines/atomic.md) 和 [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) 数据库引擎支持。
:::

**语法**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES {#exchange-tables}

交换两张表的名称。

**语法**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

### 交换多个表 {#exchange-multiple-tables}

你可以在单个查询中交换多个表对，用逗号将它们分隔开。

:::note
在交换多个表对时，交换操作是**顺序执行的，而非原子性操作**。如果在操作过程中发生错误，某些表对可能已经完成交换，而其他表对尚未交换。
:::

**示例**

```sql title="Query"
-- Create tables
CREATE TABLE a (a UInt8) ENGINE=Memory;
CREATE TABLE b (b UInt8) ENGINE=Memory;
CREATE TABLE c (c UInt8) ENGINE=Memory;
CREATE TABLE d (d UInt8) ENGINE=Memory;

-- Exchange two pairs of tables in one query
EXCHANGE TABLES a AND b, c AND d;

SHOW TABLE a;
SHOW TABLE b;
SHOW TABLE c;
SHOW TABLE d;
```

```sql title="Response"
-- Now table 'a' has the structure of 'b', and table 'b' has the structure of 'a'
┌─statement──────────────┐
│ CREATE TABLE default.a↴│
│↳(                     ↴│
│↳    `b` UInt8         ↴│
│↳)                     ↴│
│↳ENGINE = Memory        │
└────────────────────────┘
┌─statement──────────────┐
│ CREATE TABLE default.b↴│
│↳(                     ↴│
│↳    `a` UInt8         ↴│
│↳)                     ↴│
│↳ENGINE = Memory        │
└────────────────────────┘

-- Now table 'c' has the structure of 'd', and table 'd' has the structure of 'c'
┌─statement──────────────┐
│ CREATE TABLE default.c↴│
│↳(                     ↴│
│↳    `d` UInt8         ↴│
│↳)                     ↴│
│↳ENGINE = Memory        │
└────────────────────────┘
┌─statement──────────────┐
│ CREATE TABLE default.d↴│
│↳(                     ↴│
│↳    `c` UInt8         ↴│
│↳)                     ↴│
│↳ENGINE = Memory        │
└────────────────────────┘
```

## EXCHANGE DICTIONARIES {#exchange-dictionaries}

交换两个字典的名称。

**语法**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**另请参阅**

* [字典](../../sql-reference/dictionaries/index.md)
