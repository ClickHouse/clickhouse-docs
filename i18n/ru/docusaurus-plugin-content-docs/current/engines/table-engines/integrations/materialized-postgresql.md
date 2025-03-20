---
slug: /engines/table-engines/integrations/materialized-postgresql
sidebar_position: 130
sidebar_label: MaterializedPostgreSQL
title: 'MaterializedPostgreSQL'
description: 'Создает таблицу ClickHouse с первоначальной выгрузкой данных из таблицы PostgreSQL и запускает процесс репликации.'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для репликации PostgreSQL в ClickHouse. Это изначально поддерживает высокопроизводительное захватывание данных о изменениях (CDC) для PostgreSQL.
:::

Создает таблицу ClickHouse с первоначальной выгрузкой данных из таблицы PostgreSQL и запускает процесс репликации, т.е. выполняет фоновую задачу для применения новых изменений по мере их появления в таблице PostgreSQL в удаленной базе данных PostgreSQL.

:::note
Этот движок таблицы является экспериментальным. Чтобы использовать его, установите `allow_experimental_materialized_postgresql_table` в 1 в ваших конфигурационных файлах или с помощью команды `SET`:
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

Если требуется более одной таблицы, настоятельно рекомендуется использовать движок базы данных [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) вместо движка таблицы и использовать настройку `materialized_postgresql_tables_list`, которая указывает таблицы для репликации (также будет возможно добавить `схему` базы данных). Это будет гораздо лучше с точки зрения ЦП, меньшего количества подключений и меньшего количества слотов репликации внутри удаленной базы данных PostgreSQL.

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

1. Параметр [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) должен иметь значение `logical`, а параметр `max_replication_slots` должен иметь значение не менее `2` в конфигурационном файле PostgreSQL.

2. Таблица с движком `MaterializedPostgreSQL` должна иметь первичный ключ — такой же, как индекс идентичности реплики (по умолчанию: первичный ключ) таблицы PostgreSQL (см. [детали о реплике идентичности](../../../engines/database-engines/materialized-postgresql.md#requirements)).

3. Разрешена только база данных [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)).

4. Движок таблицы `MaterializedPostgreSQL` работает только для версий PostgreSQL >= 11, поскольку реализация требует функции PostgreSQL [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html).

## Виртуальные колонки {#virtual-columns}

- `_version` — Счетчик транзакций. Тип: [UInt64](../../../sql-reference/data-types/int-uint.md).

- `_sign` — Метка удаления. Тип: [Int8](../../../sql-reference/data-types/int-uint.md). Возможные значения:
    - `1` — Строка не удалена,
    - `-1` — Строка удалена.

Эти колонки не нужно добавлять при создании таблицы. Они всегда доступны в запросе `SELECT`.
Колонка `_version` равна позиции `LSN` в `WAL`, поэтому ее можно использовать для проверки актуальности репликации.

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
Репликация значений [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) не поддерживается. Будет использовано значение по умолчанию для типа данных.
:::

