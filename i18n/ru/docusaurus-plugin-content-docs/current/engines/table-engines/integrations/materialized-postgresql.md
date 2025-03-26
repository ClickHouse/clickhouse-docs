---
description: 'Создает таблицу ClickHouse с начальной выгрузкой данных из таблицы PostgreSQL и запускает процесс репликации.'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 130
slug: /engines/table-engines/integrations/materialized-postgresql
title: 'MaterializedPostgreSQL'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для репликации PostgreSQL в ClickHouse. Это нативно поддерживает высокопроизводительное захватывание изменений данных (CDC) для PostgreSQL.
:::

Создает таблицу ClickHouse с начальной выгрузкой данных из таблицы PostgreSQL и запускает процесс репликации, т.е. выполняет фоновую задачу для применения новых изменений по мере их появления в таблице PostgreSQL в удаленной базе данных PostgreSQL.

:::note
Этот движок таблиц экспериментальный. Чтобы использовать его, установите `allow_experimental_materialized_postgresql_table` в 1 в ваших файлах конфигурации или с помощью команды `SET`:
```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::


Если требуется более одной таблицы, настоятельно рекомендуется использовать движок базы данных [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) вместо движка таблиц и использовать настройку `materialized_postgresql_tables_list`, которая указывает, какие таблицы будут реплицированы (также будет возможно добавить `schema` базы данных). Это будет значительно лучше с точки зрения CPU, меньше соединений и меньше слотов репликации в удаленной базе данных PostgreSQL.

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

1. Настройка [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) должна иметь значение `logical`, а параметр `max_replication_slots` должен иметь значение не менее `2` в файле конфигурации PostgreSQL.

2. Таблица с движком `MaterializedPostgreSQL` должна иметь первичный ключ — тот же, что индекс реплики идентичности (по умолчанию: первичный ключ) таблицы PostgreSQL (см. [подробности о индексе реплики идентичности](../../../engines/database-engines/materialized-postgresql.md#requirements)).

3. Допускается только база данных [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)).

4. Движок таблицы `MaterializedPostgreSQL` работает только для версий PostgreSQL >= 11, поскольку реализация требует функции PostgreSQL [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html).

## Виртуальные столбцы {#virtual-columns}

- `_version` — счетчик транзакций. Тип: [UInt64](../../../sql-reference/data-types/int-uint.md).

- `_sign` — маркер удаления. Тип: [Int8](../../../sql-reference/data-types/int-uint.md). Возможные значения:
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
Репликация значений [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) не поддерживается. Будет использоваться значение по умолчанию для типа данных.
:::
