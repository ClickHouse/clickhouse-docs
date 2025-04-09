---
description: 'Документация для оператора EXCHANGE'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'Оператор EXCHANGE'
---


# Оператор EXCHANGE

Меняет названия двух таблиц или словарей атомарно. Эта задача также может быть выполнена с помощью запроса [RENAME](./rename.md), использующего временное имя, но в этом случае операция не атомарна.

:::note    
Запрос `EXCHANGE` поддерживается только движком базы данных [Atomic](../../engines/database-engines/atomic.md).
:::

**Синтаксис**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES {#exchange-tables}

Меняет названия двух таблиц.

**Синтаксис**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

## EXCHANGE DICTIONARIES {#exchange-dictionaries}

Меняет названия двух словарей.

**Синтаксис**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**Смотрите также**

- [Словари](../../sql-reference/dictionaries/index.md)
