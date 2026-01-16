---
description: 'Документация по оператору ALTER TABLE ... DELETE'
sidebar_label: 'DELETE'
sidebar_position: 39
slug: /sql-reference/statements/alter/delete
title: 'Оператор ALTER TABLE ... DELETE'
doc_type: 'reference'
---

# Инструкция ALTER TABLE ... DELETE \\{#alter-table-delete-statement\\}

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

Удаляет данные, соответствующие указанному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

:::note
Префикс `ALTER TABLE` делает этот синтаксис отличным от большинства других систем, поддерживающих SQL. Он используется для обозначения того, что, в отличие от аналогичных запросов в OLTP-базах данных, это ресурсоёмкая операция, не предназначенная для частого использования. `ALTER TABLE` считается тяжёлой операцией, которая требует слияния лежащих в основе данных перед их удалением. Для таблиц MergeTree рассмотрите использование запроса [`DELETE FROM`](/sql-reference/statements/delete.md), который выполняет «лёгкое» удаление и может быть значительно быстрее.
:::

`filter_expr` должен иметь тип `UInt8`. Запрос удаляет строки в таблице, для которых это выражение принимает ненулевое значение.

Один запрос может содержать несколько команд, разделённых запятыми.

Синхронность обработки запроса определяется настройкой [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync). По умолчанию обработка асинхронная.

**См. также**

* [Мутации](/sql-reference/statements/alter/index.md#mutations)
* [Синхронность запросов ALTER](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
* Настройка [mutations&#95;sync](/operations/settings/settings.md/#mutations_sync)

## Связанные материалы \\{#related-content\\}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
