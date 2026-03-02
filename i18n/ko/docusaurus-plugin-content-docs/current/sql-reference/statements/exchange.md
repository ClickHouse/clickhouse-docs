---
description: 'EXCHANGE SQL 문 문서'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'EXCHANGE SQL 문'
doc_type: 'reference'
---

# EXCHANGE 문 \{#exchange-statement\}

두 테이블 또는 딕셔너리의 이름을 원자적으로 교환합니다.
이 작업은 임시 이름을 사용한 [`RENAME`](./rename.md) 쿼리로도 수행할 수 있지만, 그 경우 연산은 원자적이지 않습니다.

:::note
`EXCHANGE` 쿼리는 [`Atomic`](../../engines/database-engines/atomic.md) 및 [`Shared`](/cloud/reference/shared-catalog#shared-database-engine) 데이터베이스 엔진에서만 지원됩니다.
:::

**구문**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES \{#exchange-tables\}

두 테이블의 이름을 서로 교환합니다.

**구문**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

### 여러 테이블 교환(EXCHANGE MULTIPLE TABLES) \{#exchange-multiple-tables\}

쉼표로 구분하여 하나의 쿼리에서 여러 테이블 쌍을 교환할 수 있습니다.

:::note
여러 테이블 쌍을 교환할 때, 교환 작업은 **순차적으로 수행되며, 원자적(atomic)으로 수행되지는 않습니다.** 작업 중 오류가 발생하면 일부 테이블 쌍은 이미 교환된 반면 다른 테이블 쌍은 교환되지 않았을 수 있습니다.
:::

**예시**

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

## EXCHANGE DICTIONARIES \{#exchange-dictionaries\}

두 개의 사전(Dictionary)의 이름을 서로 교환합니다.

**구문**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**함께 보기**

* [Dictionaries](./create/dictionary/overview.md)
