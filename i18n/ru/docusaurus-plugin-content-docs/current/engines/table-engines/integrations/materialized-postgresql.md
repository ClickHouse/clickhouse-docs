---
slug: '/engines/table-engines/integrations/materialized-postgresql'
sidebar_label: MaterializedPostgreSQL
sidebar_position: 130
description: 'Создает таблицу ClickHouse с начальной выгрузкой данных из таблицы'
title: MaterializedPostgreSQL
doc_type: guide
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для репликации PostgreSQL в ClickHouse. Это нативно поддерживает высокопроизводительное захватывание изменений данных (CDC) для PostgreSQL.
:::

Создает таблицу ClickHouse с первоначальной выгрузкой данных из таблицы PostgreSQL и запускает процесс репликации, т.е. выполняет фоновые задания для применения новых изменений по мере их появления в таблице PostgreSQL в удаленной базе данных PostgreSQL.

:::note
Этот движок таблиц является экспериментальным. Чтобы использовать его, установите `allow_experimental_materialized_postgresql_table` в 1 в ваших файлах конфигурации или с помощью команды `SET`:
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

Если требуется больше одной таблицы, настоятельно рекомендуется использовать движок базы данных [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) вместо движка таблиц и использовать настройку `materialized_postgresql_tables_list`, которая указывает, какие таблицы будут реплицироваться (также будет возможным добавить `schema` базы данных). Это будет намного лучше с точки зрения CPU, меньше соединений и меньше слотов репликации в удаленной базе данных PostgreSQL.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**Параметры движка**

- `host:port` — адрес сервера PostgreSQL.
- `database` — имя удаленной базы данных.
- `table` — имя удаленной таблицы.
- `user` — пользователь PostgreSQL.
- `password` — пароль пользователя.

## Требования {#requirements}

1. Параметр [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) должен иметь значение `logical`, а параметр `max_replication_slots` должен иметь значение как минимум `2` в файле конфигурации PostgreSQL.

2. Таблица с движком `MaterializedPostgreSQL` должна иметь первичный ключ — такой же, как индекс идентичности реплики (по умолчанию: первичный ключ) таблицы PostgreSQL (см. [подробности об индексе идентичности реплики](../../../engines/database-engines/materialized-postgresql.md#requirements)).

3. Разрешена только база данных [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)).

4. Движок таблиц `MaterializedPostgreSQL` работает только для версий PostgreSQL >= 11, поскольку реализация требует функции PostgreSQL [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html).

## Виртуальные колонки {#virtual-columns}

- `_version` — счетчик транзакций. Тип: [UInt64](../../../sql-reference/data-types/int-uint.md).

- `_sign` — маркер удаления. Тип: [Int8](../../../sql-reference/data-types/int-uint.md). Возможные значения:
  - `1` — Строка не удалена,
  - `-1` — Строка удалена.

Эти колонки не нужно добавлять при создании таблицы. Они всегда доступны в запросе `SELECT`.
Значение колонки `_version` соответствует позиции `LSN` в `WAL`, поэтому её можно использовать для проверки актуальности репликации.

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
Репликация значений [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) не поддерживается. Будет использовано значение по умолчанию для типа данных.
:::