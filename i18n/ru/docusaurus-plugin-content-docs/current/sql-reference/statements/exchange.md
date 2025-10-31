---
slug: '/sql-reference/statements/exchange'
sidebar_label: EXCHANGE
sidebar_position: 49
description: 'Документация для EXCHANGE Statement'
title: 'Оператор EXCHANGE'
doc_type: reference
---
# Заявление EXCHANGE

Обменивает имена двух таблиц или словарей атомарно. 
Эта задача также может быть выполнена с помощью запроса [`RENAME`](./rename.md), используя временное имя, но в этом случае операция не является атомарной.

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

## EXCHANGE DICTIONARIES {#exchange-dictionaries}

Обменивает имена двух словарей.

**Синтаксис**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**См. Также**

- [Словари](../../sql-reference/dictionaries/index.md)