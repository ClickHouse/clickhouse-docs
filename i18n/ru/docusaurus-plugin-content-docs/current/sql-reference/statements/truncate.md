---
description: 'Справочник по операторам TRUNCATE'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'Операторы TRUNCATE'
doc_type: 'reference'
---

# Оператор TRUNCATE {#truncate-statements}

Оператор `TRUNCATE` в ClickHouse используется для быстрого удаления всех данных из таблицы или базы данных при этом их структура сохраняется.

## TRUNCATE TABLE {#truncate-table}

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />

| Parameter            | Description                                                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IF EXISTS`          | Предотвращает ошибку, если таблица не существует. Если параметр опущен, запрос завершится с ошибкой.                                                              |
| `db.name`            | Необязательное имя базы данных.                                                                                                                                   |
| `ON CLUSTER cluster` | Выполняет команду на указанном кластере.                                                                                                                          |
| `SYNC`               | Делает операцию `TRUNCATE` синхронной между репликами при использовании реплицируемых таблиц. Если параметр опущен, операция выполняется асинхронно по умолчанию. |

Вы можете использовать настройку [alter&#95;sync](/operations/settings/settings#alter_sync), чтобы включить ожидание выполнения операций на репликах.

Вы можете указать, как долго (в секундах) ожидать выполнения запросов `TRUNCATE` неактивными репликами с помощью настройки [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note\
Если `alter_sync` имеет значение `2`, и некоторые реплики остаются неактивными дольше времени, заданного настройкой `replication_wait_for_inactive_replica_timeout`, генерируется исключение `UNFINISHED`.
:::

Запрос `TRUNCATE TABLE` **не поддерживается** для следующих движков таблиц:

* [`View`](../../engines/table-engines/special/view.md)
* [`File`](../../engines/table-engines/special/file.md)
* [`URL`](../../engines/table-engines/special/url.md)
* [`Buffer`](../../engines/table-engines/special/buffer.md)
* [`Null`](../../engines/table-engines/special/null.md)

## Очистка всех таблиц {#truncate-all-tables}

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br />

| Параметр                                | Описание                                              |
| --------------------------------------- | ----------------------------------------------------- |
| `ALL`                                   | Удаляет данные из всех таблиц базы данных.            |
| `IF EXISTS`                             | Предотвращает ошибку, если база данных не существует. |
| `db`                                    | Имя базы данных.                                      |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | Фильтрует таблицы по заданному шаблону.               |
| `ON CLUSTER cluster`                    | Выполняет команду во всём кластере.                   |

Удаляет все данные из всех таблиц базы данных.

## TRUNCATE DATABASE {#truncate-database}

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />

| Parameter            | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `IF EXISTS`          | Предотвращает ошибку, если база данных не существует. |
| `db`                 | Имя базы данных.                                      |
| `ON CLUSTER cluster` | Выполняет команду на указанном кластере.              |

Удаляет все таблицы из базы данных, но сохраняет саму базу данных. Если предложение `IF EXISTS` опущено, запрос возвращает ошибку, если база данных не существует.

:::note
`TRUNCATE DATABASE` не поддерживается для `Replicated` баз данных. Вместо этого просто удалите и заново создайте базу данных с помощью команд `DROP` и `CREATE`.
:::
