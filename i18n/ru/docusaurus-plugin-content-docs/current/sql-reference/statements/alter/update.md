---
slug: '/sql-reference/statements/alter/update'
sidebar_label: UPDATE
sidebar_position: 40
description: 'Документация для ALTER TABLE ... UPDATE Statements'
title: 'Операторы ALTER TABLE ... UPDATE'
doc_type: reference
---
# ALTER TABLE ... UPDATE Заявления

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

Управляет данными, соответствующими заданному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

:::note    
Префикс `ALTER TABLE` делает этот синтаксис отличным от большинства других систем, поддерживающих SQL. Это предназначено для обозначения того, что, в отличие от аналогичных запросов в OLTP базах данных, это тяжелая операция, не предназначенная для частого использования.
:::

`filter_expr` должен быть типа `UInt8`. Этот запрос обновляет значения указанных колонок до значений соответствующих выражений в строках, для которых `filter_expr` принимает ненулевое значение. Значения преобразуются к типу колонки с помощью оператора `CAST`. Обновление колонок, которые используются в расчете первичного или ключа партиционирования, не поддерживается.

Один запрос может содержать несколько команд, разделенных запятыми.

Синхронность обработки запроса определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync). По умолчанию она асинхронная.

**Смотрите также**

- [Мутации](/sql-reference/statements/alter/index.md#mutations)
- [Синхронность запросов ALTER](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- Настройка [mutations_sync](/operations/settings/settings.md/#mutations_sync)

## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)