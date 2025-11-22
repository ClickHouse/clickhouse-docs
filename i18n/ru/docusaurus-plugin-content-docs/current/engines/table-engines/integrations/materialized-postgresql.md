---
description: 'Создаёт таблицу ClickHouse с начальным дампом данных таблицы PostgreSQL и запускает процесс репликации.'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 130
slug: /engines/table-engines/integrations/materialized-postgresql
title: 'Движок таблицы MaterializedPostgreSQL'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Движок таблицы MaterializedPostgreSQL

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для репликации PostgreSQL в ClickHouse. Этот инструмент нативно поддерживает высокопроизводительный Change Data Capture (CDC) для PostgreSQL.
:::

Создаёт таблицу ClickHouse с первоначальным дампом данных из таблицы PostgreSQL и запускает процесс репликации, то есть выполняет фоновое задание для применения новых изменений по мере их появления в этой таблице в удалённой базе данных PostgreSQL.

:::note
Этот движок таблицы является экспериментальным. Чтобы использовать его, установите параметр `allow_experimental_materialized_postgresql_table` в значение 1 в конфигурационных файлах или с помощью команды `SET`:

```sql
SET allow_experimental_materialized_postgresql_table=1
```

:::

Если требуется более одной таблицы, настоятельно рекомендуется использовать движок базы данных [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) вместо движка таблицы и задать настройку `materialized_postgresql_tables_list`, определяющую таблицы для репликации (также будет возможность добавить `schema` базы данных). Это будет значительно эффективнее с точки зрения использования CPU, количества подключений и числа слотов репликации во внешней базе данных PostgreSQL.


## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**Параметры движка**

- `host:port` — адрес сервера PostgreSQL.
- `database` — имя удалённой базы данных.
- `table` — имя удалённой таблицы.
- `user` — пользователь PostgreSQL.
- `password` — пароль пользователя.


## Требования {#requirements}

1. Параметр [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) должен иметь значение `logical`, а параметр `max_replication_slots` — значение не менее `2` в конфигурационном файле PostgreSQL.

2. Таблица с движком `MaterializedPostgreSQL` должна иметь первичный ключ, совпадающий с индексом идентификации реплики (по умолчанию — первичный ключ) таблицы PostgreSQL (см. [подробности об индексе идентификации реплики](../../../engines/database-engines/materialized-postgresql.md#requirements)).

3. Допускается использование только движка базы данных [Atomic](<https://en.wikipedia.org/wiki/Atomicity_(database_systems)>).

4. Движок таблиц `MaterializedPostgreSQL` работает только с PostgreSQL версии 11 и выше, поскольку для его работы требуется функция PostgreSQL [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html).


## Виртуальные столбцы {#virtual-columns}

- `_version` — Счётчик транзакций. Тип: [UInt64](../../../sql-reference/data-types/int-uint.md).

- `_sign` — Метка удаления. Тип: [Int8](../../../sql-reference/data-types/int-uint.md). Возможные значения:
  - `1` — Строка не удалена,
  - `-1` — Строка удалена.

Эти столбцы не нужно добавлять при создании таблицы. Они всегда доступны в запросе `SELECT`.
Столбец `_version` соответствует позиции `LSN` в `WAL`, поэтому его можно использовать для проверки актуальности репликации.

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
Репликация значений [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) не поддерживается. Будет использовано значение по умолчанию для типа данных.
:::
