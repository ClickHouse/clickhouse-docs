---
description: 'Документация по команде ALTER TABLE ... DELETE'
sidebar_label: 'DELETE'
sidebar_position: 39
slug: /sql-reference/statements/alter/delete
title: 'ALTER TABLE ... DELETE Statement'
---


# ALTER TABLE ... DELETE Statement

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

Удаляет данные, соответствующие указанному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

:::note
Префикс `ALTER TABLE` делает этот синтаксис отличным от большинства других систем, поддерживающих SQL. Это предназначено для того, чтобы обозначить, что, в отличие от аналогичных запросов в OLTP базах данных, это тяжелая операция, не предназначенная для частого использования. `ALTER TABLE` считается тяжелой операцией, которая требует, чтобы базовые данные были объединены перед их удалением. Для таблиц MergeTree рассмотрите возможность использования запроса [`DELETE FROM` запрос](/sql-reference/statements/delete.md), который выполняет легковесное удаление и может быть значительно быстрее.
:::

`filter_expr` должно быть типа `UInt8`. Запрос удаляет строки в таблице, для которых это выражение имеет ненулевое значение.

Один запрос может содержать несколько команд, разделенных запятыми.

Синхронность обработки запроса определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync). По умолчанию она асинхронная.

**Смотрите также**

- [Мутации](/sql-reference/statements/alter/index.md#mutations)
- [Синхронность запросов ALTER](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- Настройка [mutations_sync](/operations/settings/settings.md/#mutations_sync)

## Related content {#related-content}

- Блог: [Обработка обновлений и удаления в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
