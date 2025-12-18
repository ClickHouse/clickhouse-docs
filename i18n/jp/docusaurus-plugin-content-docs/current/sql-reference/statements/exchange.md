---
description: 'EXCHANGE 文に関するドキュメント'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'EXCHANGE 文'
doc_type: 'reference'
---

# EXCHANGE ステートメント {#exchange-statement}

2 つのテーブルまたは辞書の名前をアトミックに入れ替えます。
この操作は一時的な名前を用いた [`RENAME`](./rename.md) クエリでも行えますが、その場合はアトミックではありません。

:::note
`EXCHANGE` クエリは [`Atomic`](../../engines/database-engines/atomic.md) および [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) データベースエンジンでのみサポートされています。
:::

**構文**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES {#exchange-tables}

2つのテーブルの名前を入れ替えます。

**構文**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

### 複数テーブルの EXCHANGE {#exchange-multiple-tables}

カンマで区切ることで、1つのクエリで複数のテーブルペアを入れ替えることができます。

:::note
複数のテーブルペアを入れ替える場合、入れ替えは**アトミックではなく順次**実行されます。操作中にエラーが発生した場合、一部のテーブルペアだけが入れ替えられ、他のペアは入れ替えられていない可能性があります。
:::

**例**

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

2つの辞書の名前を入れ替えます。

**構文**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**関連項目**

* [辞書](../../sql-reference/dictionaries/index.md)
