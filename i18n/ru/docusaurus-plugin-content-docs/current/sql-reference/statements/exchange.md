---
slug: /sql-reference/statements/exchange
sidebar_position: 49
sidebar_label: EXCHANGE
---


# Оператор EXCHANGE

Обменяет имена двух таблиц или словарей атомарно. 
Эта задача также может быть выполнена с помощью запроса [RENAME](./rename.md) с использованием временного имени, но в этом случае операция не является атомарной.

:::note    
Запрос `EXCHANGE` поддерживается только движком базы данных [Atomic](../../engines/database-engines/atomic.md).
:::

**Синтаксис**

```sql
EXCHANGE TABLES|DICTIONARIES [db0.]name_A AND [db1.]name_B [ON CLUSTER cluster]
```

## EXCHANGE TABLES {#exchange-tables}

Обменяет имена двух таблиц.

**Синтаксис**

```sql
EXCHANGE TABLES [db0.]table_A AND [db1.]table_B [ON CLUSTER cluster]
```

## EXCHANGE DICTIONARIES {#exchange-dictionaries}

Обменяет имена двух словарей.

**Синтаксис**

```sql
EXCHANGE DICTIONARIES [db0.]dict_A AND [db1.]dict_B [ON CLUSTER cluster]
```

**См. также**

- [Словари](../../sql-reference/dictionaries/index.md)
