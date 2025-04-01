---
description: 'Документация для команды ALTER TABLE ... DELETE'
sidebar_label: 'DELETE'
sidebar_position: 39
slug: /sql-reference/statements/alter/delete
title: 'Команда ALTER TABLE ... DELETE'
---


# Команда ALTER TABLE ... DELETE

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] DELETE WHERE filter_expr
```

Удаляет данные, соответствующие указанному фильтрующему выражению. Реализована как [мутация](/sql-reference/statements/alter/index.md#mutations).

:::note
Префикс `ALTER TABLE` делает этот синтаксис отличным от большинства других систем, поддерживающих SQL. Он предназначен для обозначения того, что, в отличие от подобных запросов в OLTP базах данных, это тяжелая операция, не предназначенная для частого использования. `ALTER TABLE` считается ресурсозатратной операцией, которая требует, чтобы подлежащие данные были объединены перед их удалением. Для таблиц MergeTree рекомендуется использовать [`DELETE FROM` запрос](/sql-reference/statements/delete.md), который выполняет легковесное удаление и может быть значительно быстрее.
:::

`filter_expr` должен быть типа `UInt8`. Запрос удаляет строки в таблице, для которых это выражение принимает ненулевое значение.

Один запрос может содержать несколько команд, разделённых запятыми.

Синхронность обработки запроса определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync). По умолчанию она асинхронна.

**Смотрите также**

- [Мутации](/sql-reference/statements/alter/index.md#mutations)
- [Синхронность запросов ALTER](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- Настройка [mutations_sync](/operations/settings/settings.md/#mutations_sync)

## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
