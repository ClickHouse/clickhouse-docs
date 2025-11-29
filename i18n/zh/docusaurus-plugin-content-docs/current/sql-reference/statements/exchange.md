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
也可以通过使用临时名称的 [`RENAME`](./rename.md) 查询来完成此任务，但在这种情况下，该操作不是原子的。

:::note\
`EXCHANGE` 查询仅在 [`Atomic`](../../engines/database-engines/atomic.md) 和 [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) 数据库引擎中受支持。
:::

**语法**

```sql
交换表|字典 [db0.]name_A 和 [db1.]name_B [在集群 cluster 上]
```

## EXCHANGE TABLES {#exchange-tables}

互换两个表的名称。

**语法**

```sql
交换表 [db0.]table_A 和 [db1.]table_B [在集群 cluster 上]
```

### 交换多个表 {#exchange-multiple-tables}

你可以在单条查询中，用逗号分隔的方式交换多对表。

:::note
在交换多对表时，交换操作是**按顺序依次执行的，而不是作为一个原子操作执行**。如果在操作过程中发生错误，可能会出现部分表对已交换而其他表对尚未交换的情况。
:::

**示例**

```sql title="Query"
-- 创建表
CREATE TABLE a (a UInt8) ENGINE=Memory;
CREATE TABLE b (b UInt8) ENGINE=Memory;
CREATE TABLE c (c UInt8) ENGINE=Memory;
CREATE TABLE d (d UInt8) ENGINE=Memory;

-- 在单个查询中交换两对表
EXCHANGE TABLES a AND b, c AND d;

SHOW TABLE a;
SHOW TABLE b;
SHOW TABLE c;
SHOW TABLE d;
```

```sql title="Response"
-- 现在表 'a' 拥有表 'b' 的结构,表 'b' 拥有表 'a' 的结构
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

-- 现在表 'c' 拥有表 'd' 的结构,表 'd' 拥有表 'c' 的结构
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

互换两个字典的名称。

**语法**

```sql
交换字典 [db0.]dict_A 和 [db1.]dict_B [ON CLUSTER cluster]
```

**另请参阅**

* [字典](../../sql-reference/dictionaries/index.md)
