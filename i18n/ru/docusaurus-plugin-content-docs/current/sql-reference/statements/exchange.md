---
description: 'Документация по команде EXCHANGE'
sidebar_label: 'EXCHANGE'
sidebar_position: 49
slug: /sql-reference/statements/exchange
title: 'Команда EXCHANGE'
---


# Команда EXCHANGE

Атомарно меняет местами названия двух таблиц или словарей.  
Эта задача также может быть выполнена с помощью запроса [RENAME](./rename.md), используя временное имя, но в этом случае операция не является атомарной.

:::note    
Команда `EXCHANGE` поддерживается только движком баз данных [Atomic](../../engines/database-engines/atomic.md).
:::

**Синтаксис**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES {#exchange-tables}

Меняет местами названия двух таблиц.

**Синтаксис**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

## EXCHANGE DICTIONARIES {#exchange-dictionaries}

Меняет местами названия двух словарей.

**Синтаксис**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**См. также**

- [Словари](../../sql-reference/dictionaries/index.md)
