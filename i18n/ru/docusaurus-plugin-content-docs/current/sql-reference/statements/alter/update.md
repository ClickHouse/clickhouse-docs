---
description: 'Документация об операторах ALTER TABLE ... UPDATE'
sidebar_label: 'UPDATE'
sidebar_position: 40
slug: /sql-reference/statements/alter/update
title: 'Операторы ALTER TABLE ... UPDATE'
doc_type: 'reference'
---



# Операторы ALTER TABLE ... UPDATE

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

Выполняет операции над данными, которые соответствуют указанному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

:::note\
Префикс `ALTER TABLE` делает этот синтаксис отличным от большинства других систем, поддерживающих SQL. Он призван подчеркнуть, что, в отличие от похожих запросов в OLTP-базах данных, это ресурсоёмкая операция, не предназначенная для частого использования.
:::

`filter_expr` должно иметь тип `UInt8`. Этот запрос обновляет значения указанных столбцов значениями соответствующих выражений в строках, для которых `filter_expr` принимает ненулевое значение. Значения приводятся к типу столбца с помощью оператора `CAST`. Обновление столбцов, которые используются при вычислении первичного ключа или ключа партиционирования, не поддерживается.

Один запрос может содержать несколько команд, разделённых запятыми.

Синхронность обработки запроса определяется настройкой [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync). По умолчанию обработка выполняется асинхронно.

**См. также**

* [Мутации](/sql-reference/statements/alter/index.md#mutations)
* [Синхронность запросов ALTER](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* Настройка [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync)


## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
