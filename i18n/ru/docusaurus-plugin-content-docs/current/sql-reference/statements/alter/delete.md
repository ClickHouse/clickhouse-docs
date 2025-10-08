---
slug: '/sql-reference/statements/alter/delete'
sidebar_label: DELETE
sidebar_position: 39
description: 'Документация о ALTER TABLE ... DELETE \x1A\x12'
title: 'Команда ALTER TABLE ... DELETE'
doc_type: reference
---
# Удаление данных с помощью оператора ALTER TABLE ... DELETE

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

Удаляет данные, соответствующие заданному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

:::note
Префикс `ALTER TABLE` делает этот синтаксис отличным от большинства других систем, поддерживающих SQL. Это предназначено для того, чтобы подчеркнуть, что в отличие от подобных запросов в OLTP базах данных, это тяжелая операция, не предназначенная для частого использования. `ALTER TABLE` считается тяжелой операцией, которая требует объединения исходных данных перед их удалением. Для таблиц MergeTree рекомендуется использовать запрос [`DELETE FROM` /sql-reference/statements/delete.md), который выполняет легковесное удаление и может быть значительно быстрее.
:::

`filter_expr` должен быть типа `UInt8`. Запрос удаляет строки в таблице, для которых это выражение принимает ненулевое значение.

Один запрос может содержать несколько команд, разделенных запятыми.

Синхронность обработки запроса задается настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync). По умолчанию она асинхронна.

**Смотрите также**

- [Мутации](/sql-reference/statements/alter/index.md#mutations)
- [Синхронность запросов ALTER](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- Настройка [mutations_sync](/operations/settings/settings.md/#mutations_sync)

## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)