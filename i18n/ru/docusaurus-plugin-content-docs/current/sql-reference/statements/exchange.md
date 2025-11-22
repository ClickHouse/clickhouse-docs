---
description: 'Документация по оператору EXCHANGE'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'Оператор EXCHANGE'
doc_type: 'reference'
---



# Оператор EXCHANGE

Атомарно меняет местами имена двух таблиц или словарей.
Эту задачу также можно выполнить с помощью запроса [`RENAME`](./rename.md) с использованием временного имени, но в этом случае операция не является атомарной.

:::note\
Запрос `EXCHANGE` поддерживается только движками баз данных [`Atomic`](../../engines/database-engines/atomic.md) и [`Shared`](/cloud/reference/shared-catalog#shared-database-engine).
:::

**Синтаксис**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]имя_A AND [db1.]имя_B [ON CLUSTER кластер]
```


## EXCHANGE TABLES {#exchange-tables}

Меняет местами имена двух таблиц.

**Синтаксис**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```


## EXCHANGE DICTIONARIES {#exchange-dictionaries}

Обменивает имена двух словарей.

**Синтаксис**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**См. также**

- [Словари](../../sql-reference/dictionaries/index.md)
