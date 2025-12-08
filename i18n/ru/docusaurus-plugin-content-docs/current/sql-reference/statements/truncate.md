---
description: 'Документация по командам TRUNCATE'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'Команды TRUNCATE'
doc_type: 'reference'
---

# Команды TRUNCATE {#truncate-statements}

Команда `TRUNCATE` в ClickHouse используется для быстрого удаления всех данных из таблицы или базы данных при сохранении их структуры.

## TRUNCATE TABLE {#truncate-table}

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />

| Параметр             | Описание                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `IF EXISTS`          | Предотвращает ошибку, если таблица не существует. Если параметр опущен, запрос возвращает ошибку.                                                               |
| `db.name`            | Необязательное имя базы данных.                                                                                                                                 |
| `ON CLUSTER cluster` | Выполняет команду на указанном кластере.                                                                                                                        |
| `SYNC`               | Делает операцию TRUNCATE синхронной между репликами при использовании реплицируемых таблиц. Если параметр опущен, по умолчанию операция выполняется асинхронно. |

Вы можете использовать настройку [alter&#95;sync](/operations/settings/settings#alter_sync) для ожидания выполнения действий на репликах.

Вы можете указать, как долго (в секундах) ждать выполнения запросов `TRUNCATE` неактивными репликами с помощью настройки [replication&#95;wait&#95;for&#95;inactive&#95;replica&#95;timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note
Если параметр `alter_sync` установлен в значение `2` и некоторые реплики неактивны дольше времени, указанного в настройке `replication_wait_for_inactive_replica_timeout`, будет выброшено исключение `UNFINISHED`.
:::

Запрос `TRUNCATE TABLE` **не поддерживается** для следующих движков таблиц:

* [`View`](../../engines/table-engines/special/view.md)
* [`File`](../../engines/table-engines/special/file.md)
* [`URL`](../../engines/table-engines/special/url.md)
* [`Buffer`](../../engines/table-engines/special/buffer.md)
* [`Null`](../../engines/table-engines/special/null.md)

## TRUNCATE ALL TABLES {#truncate-all-tables}

```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```

<br />

| Parameter                               | Description                                           |
| --------------------------------------- | ----------------------------------------------------- |
| `ALL`                                   | Удаляет данные из всех таблиц базы данных.            |
| `IF EXISTS`                             | Предотвращает ошибку, если база данных не существует. |
| `db`                                    | Имя базы данных.                                      |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | Фильтрует таблицы по шаблону.                         |
| `ON CLUSTER cluster`                    | Выполняет команду на всём кластере.                   |

Удаляет все данные из всех таблиц базы данных.

## TRUNCATE DATABASE {#truncate-database}

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />

| Параметр             | Описание                                                            |
| -------------------- | ------------------------------------------------------------------- |
| `IF EXISTS`          | Предотвращает возникновение ошибки, если база данных не существует. |
| `db`                 | Имя базы данных.                                                    |
| `ON CLUSTER cluster` | Выполняет команду во всём указанном кластере.                       |

Удаляет все таблицы из базы данных, но сохраняет саму базу данных. Если опустить условие `IF EXISTS`, запрос вернёт ошибку, если база данных не существует.

:::note
`TRUNCATE DATABASE` не поддерживается для баз данных `Replicated`. Вместо этого просто выполните `DROP` и `CREATE` для базы данных.
:::
