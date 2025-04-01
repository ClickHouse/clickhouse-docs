---
description: 'Документация для операторов ALTER TABLE ... UPDATE'
sidebar_label: 'UPDATE'
sidebar_position: 40
slug: /sql-reference/statements/alter/update
title: 'Операторы ALTER TABLE ... UPDATE'
---


# Операторы ALTER TABLE ... UPDATE

```sql
ALTER TABLE [db.]table [ON CLUSTER cluster] UPDATE column1 = expr1 [, ...] [IN PARTITION partition_id] WHERE filter_expr
```

Манипулирует данными, соответствующими заданному фильтрующему выражению. Реализовано как [мутация](/sql-reference/statements/alter/index.md#mutations).

:::note    
Префикс `ALTER TABLE` делает синтаксис уникальным по сравнению с большинством других систем, поддерживающих SQL. Он предназначен для того, чтобы подчеркнуть, что, в отличие от аналогичных запросов в OLTP базах данных, это тяжелая операция, не предназначенная для частого использования.
:::

`filter_expr` должен быть типа `UInt8`. Этот запрос обновляет значения указанных колонок на значения соответствующих выражений в строках, для которых `filter_expr` принимает ненулевое значение. Значения преобразуются в тип колонки с помощью оператора `CAST`. Обновление колонок, которые используются в вычислении первичного ключа или ключа партиционирования, не поддерживается.

В одном запросе может содержаться несколько команд, разделенных запятыми.

Синхронность обработки запроса определяется настройкой [mutations_sync](/operations/settings/settings.md/#mutations_sync). По умолчанию она асинхронная.

**Смотрите также**

- [Мутации](/sql-reference/statements/alter/index.md#mutations)
- [Синхронность запросов ALTER](/sql-reference/statements/alter/index.md#synchronicity-of-alter-queries)
- Настройка [mutations_sync](/operations/settings/settings.md/#mutations_sync)


## Связанный контент {#related-content}

- Блог: [Обработка обновлений и удалений в ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
