---
description: 'Документация по оператору EXCHANGE'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'Оператор EXCHANGE'
doc_type: 'reference'
---



# Оператор EXCHANGE

Атомарно меняет местами имена двух таблиц или двух словарей.
Эту задачу также можно выполнить с помощью запроса [`RENAME`](./rename.md), используя временное имя, но в этом случае операция не является атомарной.

:::note\
Запрос `EXCHANGE` поддерживается только движками баз данных [`Atomic`](../../engines/database-engines/atomic.md) и [`Shared`](/cloud/reference/shared-catalog#shared-database-engine).
:::

**Синтаксис**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]имя_A AND [db1.]имя_B [ON CLUSTER кластер]
```


## EXCHANGE TABLES

Меняет местами имена двух таблиц.

**Синтаксис**

```sql
ОБМЕН ТАБЛИЦАМИ [db0.]table_A И [db1.]table_B [НА КЛАСТЕРЕ cluster]
```


## EXCHANGE DICTIONARIES

Меняет местами имена двух словарей.

**Синтаксис**

```sql
ОБМЕН СЛОВАРЯМИ [db0.]dict_A И [db1.]dict_B [ON CLUSTER cluster]
```

**См. также**

* [Словари](../../sql-reference/dictionaries/index.md)
