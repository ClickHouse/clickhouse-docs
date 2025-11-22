---
description: 'Документация по оператору TRUNCATE'
sidebar_label: 'TRUNCATE'
sidebar_position: 52
slug: /sql-reference/statements/truncate
title: 'Оператор TRUNCATE'
doc_type: 'reference'
---



# Оператор TRUNCATE

Оператор `TRUNCATE` в ClickHouse используется для быстрого удаления всех данных из таблицы или базы данных при сохранении их структуры.



## TRUNCATE TABLE {#truncate-table}

```sql
TRUNCATE TABLE [IF EXISTS] [db.]name [ON CLUSTER cluster] [SYNC]
```

<br />| Parameter | Description |
|---------------------|---------------------------------------------------------------------------------------------------|
| `IF EXISTS` | Предотвращает ошибку, если таблица не существует. Если параметр не указан, запрос возвращает ошибку. | | `db.name` | Необязательное имя базы данных. | | `ON CLUSTER cluster`| Выполняет команду на указанном кластере. | | `SYNC` | Делает усечение синхронным для всех реплик при использовании реплицируемых таблиц. Если параметр не указан, усечение по умолчанию происходит асинхронно. |

Для настройки ожидания выполнения действий на репликах можно использовать параметр [alter_sync](/operations/settings/settings#alter_sync).

С помощью параметра [replication_wait_for_inactive_replica_timeout](/operations/settings/settings#replication_wait_for_inactive_replica_timeout) можно указать, как долго (в секундах) ожидать выполнения запросов `TRUNCATE` неактивными репликами.

:::note  
Если `alter_sync` установлен в `2` и некоторые реплики неактивны дольше времени, указанного в параметре `replication_wait_for_inactive_replica_timeout`, то генерируется исключение `UNFINISHED`.
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
| Параметр                   | Описание                                          |
|----------------------------|---------------------------------------------------|
| `ALL`                      | Удаляет данные из всех таблиц базы данных.       |
| `IF EXISTS`                | Предотвращает ошибку, если база данных не существует. |
| `db`                       | Имя базы данных.                                  |
| `LIKE \| ILIKE \| NOT LIKE '<pattern>'` | Фильтрует таблицы по шаблону.           |
| `ON CLUSTER cluster`       | Выполняет команду в кластере.                     |

Удаляет все данные из всех таблиц базы данных.


## TRUNCATE DATABASE {#truncate-database}

```sql
TRUNCATE DATABASE [IF EXISTS] db [ON CLUSTER cluster]
```

<br />| Параметр | Описание |
|----------------------|---------------------------------------------------| |
`IF EXISTS` | Предотвращает ошибку, если база данных не существует. | | `db` | Имя
базы данных. | | `ON CLUSTER cluster` | Выполняет команду на указанном
кластере. |

Удаляет все таблицы из базы данных, но сохраняет саму базу данных. Если условие `IF EXISTS` не указано, запрос возвращает ошибку при отсутствии базы данных.

:::note
`TRUNCATE DATABASE` не поддерживается для баз данных типа `Replicated`. Вместо этого используйте команды `DROP` и `CREATE` для базы данных.
:::
