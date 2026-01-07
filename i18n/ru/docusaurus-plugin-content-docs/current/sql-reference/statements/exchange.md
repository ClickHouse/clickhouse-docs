---
description: 'Документация по команде EXCHANGE'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'Команда EXCHANGE'
doc_type: 'reference'
---

# Оператор EXCHANGE {#exchange-statement}

Атомарно меняет местами имена двух таблиц или двух словарей.
Эту задачу можно также выполнить с помощью запроса [`RENAME`](./rename.md) с использованием временного имени, но в этом случае операция не является атомарной.

:::note
Запрос `EXCHANGE` поддерживается только движками баз данных [`Atomic`](../../engines/database-engines/atomic.md) и [`Shared`](/cloud/reference/shared-catalog#shared-database-engine).
:::

**Синтаксис**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES {#exchange-tables}

Обменивает имена двух таблиц.

**Синтаксис**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

### ОБМЕН НЕСКОЛЬКИМИ ТАБЛИЦАМИ {#exchange-multiple-tables}

Вы можете поменять местами несколько пар таблиц в одном запросе, разделяя их запятыми.

:::note
При обмене несколькими парами таблиц операции выполняются **последовательно, а не атомарно**. Если во время операции произойдет ошибка, некоторые пары таблиц уже могут быть обменяны местами, а другие — нет.
:::

**Пример**

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

Меняет местами имена двух словарей.

**Синтаксис**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**См. также**

* [Справочники](../../sql-reference/dictionaries/index.md)
