---
slug: '/sql-reference/statements/truncate'
sidebar_label: TRUNCATE
sidebar_position: 52
description: 'Документация для TRUNCATE Statements'
title: 'Операторы TRUNCATE'
doc_type: reference
---
# Удаление данных с помощью TRUNCATE

Команда `TRUNCATE` в ClickHouse используется для быстрого удаления всех данных из таблицы или базы данных при сохранении их структуры.

## TRUNCATE TABLE {#truncate-table}
```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```
<br/>
| Параметр             | Описание                                                                                      |
|----------------------|-----------------------------------------------------------------------------------------------|
| `IF EXISTS`          | Предотвращает ошибку, если таблица не существует. Если опущен, запрос возвращает ошибку.   |
| `db.name`            | Необязательное имя базы данных.                                                               |
| `ON CLUSTER cluster` | Выполняет команду на указанном кластере.                                                    |
| `SYNC`               | Делает удаление синхронным на репликах при использовании реплицированных таблиц. Если опущено, удаление происходит асинхронно по умолчанию. |

Вы можете использовать настройку [alter_sync](/operations/settings/settings#alter_sync), чтобы настроить ожидание выполнения действий на репликах.

Вы можете указать, как долго (в секундах) ждать неактивные реплики для выполнения запросов `TRUNCATE` с помощью настройки [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout).

:::note    
Если `alter_sync` установлено в `2` и некоторые реплики неактивны более времени, указанного настройкой `replication_wait_for_inactive_replica_timeout`, то возникает исключение `UNFINISHED`.
:::

Запрос `TRUNCATE TABLE` **не поддерживается** для следующих движков таблиц:

- [`View`](../../engines/table-engines/special/view.md)
- [`File`](../../engines/table-engines/special/file.md)
- [`URL`](../../engines/table-engines/special/url.md)
- [`Buffer`](../../engines/table-engines/special/buffer.md)
- [`Null`](../../engines/table-engines/special/null.md)

## TRUNCATE ALL TABLES {#truncate-all-tables}
```sql
TRUNCATE [ALL] TABLES FROM [IF EXISTS] db [LIKE | ILIKE | NOT LIKE '<pattern>'] [ON CLUSTER cluster]
```
<br/>
| Параметр                             | Описание                                          |
|--------------------------------------|---------------------------------------------------|
| `ALL`                                | Удаляет данные из всех таблиц в базе данных.     |
| `IF EXISTS`                          | Предотвращает ошибку, если база данных не существует. |
| `db`                                 | Имя базы данных.                                 |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | Фильтрует таблицы по шаблону.                   |
| `ON CLUSTER cluster`                 | Выполняет команду на кластере.                   |

Удаляет все данные из всех таблиц в базе данных.

## TRUNCATE DATABASE {#truncate-database}
```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```
<br/>
| Параметр                           | Описание                                          |
|------------------------------------|---------------------------------------------------|
| `IF EXISTS`                        | Предотвращает ошибку, если база данных не существует. |
| `db`                               | Имя базы данных.                                 |
| `ON CLUSTER cluster`               | Выполняет команду на указанном кластере.         |

Удаляет все таблицы из базы данных, но оставляет саму базу данных. Когда оператор `IF EXISTS` опущен, запрос возвращает ошибку, если база данных не существует.

:::note
`TRUNCATE DATABASE` не поддерживается для `Replicated` баз данных. Вместо этого просто используйте `DROP` и `CREATE` для базы данных.
:::