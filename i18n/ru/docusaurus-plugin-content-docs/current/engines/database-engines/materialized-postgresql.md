---
description: 'Создаёт базу данных ClickHouse на основе таблиц из базы данных PostgreSQL.'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 60
slug: /engines/database-engines/materialized-postgresql
title: 'MaterializedPostgreSQL'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# MaterializedPostgreSQL \\{#materializedpostgresql\\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для репликации PostgreSQL в ClickHouse. Этот сервис нативно поддерживает высокопроизводительный CDC (фиксацию изменений данных) для PostgreSQL.
:::

Создаёт базу данных ClickHouse с таблицами из базы данных PostgreSQL. Сначала база данных с движком `MaterializedPostgreSQL` создаёт снимок базы данных PostgreSQL и загружает необходимые таблицы. Необходимые таблицы могут включать любое подмножество таблиц из любого подмножества схем указанной базы данных. Вместе со снимком движок базы данных получает LSN и, как только начальная выгрузка таблиц выполнена, начинает получать обновления из WAL. После создания базы данных вновь добавляемые таблицы в базе данных PostgreSQL не добавляются в репликацию автоматически. Их нужно добавлять вручную с помощью запроса `ATTACH TABLE db.table`.

Репликация реализована с использованием протокола логической репликации PostgreSQL (PostgreSQL Logical Replication Protocol), который не позволяет реплицировать DDL, но позволяет определить, произошли ли изменения, нарушающие репликацию (изменения типов столбцов, добавление/удаление столбцов). Такие изменения обнаруживаются, и соответствующие таблицы прекращают получать обновления. В этом случае следует использовать запросы `ATTACH` / `DETACH PERMANENTLY` для полной перезагрузки таблицы. Если DDL не нарушает репликацию (например, переименование столбца), таблица по-прежнему будет получать обновления (вставка выполняется по позиции).

:::note
Этот движок базы данных является экспериментальным. Чтобы его использовать, установите `allow_experimental_database_materialized_postgresql` в значение 1 в ваших конфигурационных файлах или с помощью команды `SET`:

```sql
SET allow_experimental_database_materialized_postgresql=1
```

:::

## Создание базы данных \\{#creating-a-database\\}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**Параметры движка**

* `host:port` — адрес сервера PostgreSQL.
* `database` — имя базы данных PostgreSQL.
* `user` — пользователь PostgreSQL.
* `password` — пароль пользователя.

## Пример использования \\{#example-of-use\\}

```sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```

## Динамическое добавление новых таблиц в репликацию \\{#dynamically-adding-table-to-replication\\}

После создания базы данных `MaterializedPostgreSQL` она не будет автоматически обнаруживать новые таблицы в соответствующей базе данных PostgreSQL. Такие таблицы можно добавить вручную:

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
До версии 22.1 добавление таблицы в репликацию оставляло неудалённый временный слот репликации (с именем `{db_name}_ch_replication_slot_tmp`). Если вы подключаете таблицы в ClickHouse версии ниже 22.1, обязательно удалите этот слот вручную (`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`). В противном случае будет расти использование дискового пространства. Эта проблема исправлена в версии 22.1.
:::

## Динамическое исключение таблиц из репликации \\{#dynamically-removing-table-from-replication\\}

Можно исключить отдельные таблицы из репликации:

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## Схема PostgreSQL \\{#schema\\}

Схемы PostgreSQL ([schema](https://www.postgresql.org/docs/9.1/ddl-schemas.html)) можно настраивать тремя способами (начиная с версии 21.12).

1. Одна схема для одного движка базы данных `MaterializedPostgreSQL`. Требуется использовать настройку `materialized_postgresql_schema`.
   Доступ к таблицам осуществляется только по имени таблицы:

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. Любое число схем с заданным набором таблиц для одного движка базы данных `MaterializedPostgreSQL`. Необходимо использовать настройку `materialized_postgresql_tables_list`. Каждая таблица записывается вместе со своей схемой.
   Доступ к таблицам осуществляется по имени схемы и имени таблицы одновременно:

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

Но в этом случае все таблицы в `materialized_postgresql_tables_list` должны быть указаны с именем схемы.
Требуется `materialized_postgresql_tables_list_with_schema = 1`.

Предупреждение: в этом случае точки в имени таблицы не допускаются.

3. Любое количество схем с полным набором таблиц для одного движка базы данных `MaterializedPostgreSQL`. Требуется использовать настройку `materialized_postgresql_schema_list`.

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

Предупреждение: в данном случае точки в имени таблицы не допускаются.

## Требования \\{#requirements\\}

1. Параметр [wal&#95;level](https://www.postgresql.org/docs/current/runtime-config-wal.html) должен иметь значение `logical`, а параметр `max_replication_slots` — значение не менее `2` в конфигурационном файле PostgreSQL.

2. Каждая реплицируемая таблица должна иметь один из следующих вариантов [replica identity](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY):

* первичный ключ (по умолчанию)
* индекс

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

Сначала всегда проверяется первичный ключ. Если он отсутствует, проверяется индекс, заданный как идентификатор реплики.
Если индекс используется как идентификатор реплики, в таблице должен быть только один такой индекс.
Вы можете проверить, какой тип идентификатора реплики используется для конкретной таблицы, с помощью следующей команды:

```bash
postgres# SELECT CASE relreplident
          WHEN 'd' THEN 'default'
          WHEN 'n' THEN 'nothing'
          WHEN 'f' THEN 'full'
          WHEN 'i' THEN 'index'
       END AS replica_identity
FROM pg_class
WHERE oid = 'postgres_table'::regclass;
```

:::note
Репликация значений [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) не поддерживается. Будет использоваться значение по умолчанию для данного типа данных.
:::

## Настройки \\{#settings\\}

### `materialized_postgresql_tables_list` \\{#materialized-postgresql-tables-list\\}

Задает список таблиц базы данных PostgreSQL, разделенный запятыми, которые будут реплицироваться с помощью движка базы данных [MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md).

Для каждой таблицы можно указать подмножество реплицируемых столбцов в круглых скобках. Если подмножество столбцов не указано, реплицируются все столбцы этой таблицы.

```sql
materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
```

Значение по умолчанию: пустой список — означает, что будет реплицирована вся база данных PostgreSQL.

### `materialized_postgresql_schema` \\{#materialized-postgresql-schema\\}

Значение по умолчанию: пустая строка (используется схема по умолчанию).

### `materialized_postgresql_schema_list` \\{#materialized-postgresql-schema-list\\}

Значение по умолчанию: пустой список (используется схема по умолчанию).

### `materialized_postgresql_max_block_size` \\{#materialized-postgresql-max-block-size\\}

Задаёт количество строк, собираемых в памяти перед сбросом данных в таблицу базы данных PostgreSQL.

Возможные значения:

* Положительное целое число.

Значение по умолчанию: `65536`.

### `materialized_postgresql_replication_slot` \\{#materialized-postgresql-replication-slot\\}

Слот репликации, созданный пользователем. Должен использоваться вместе с `materialized_postgresql_snapshot`.

### `materialized_postgresql_snapshot` \\{#materialized-postgresql-snapshot\\}

Текстовая строка, идентифицирующая снимок, из которого будет выполнен [начальный дамп таблиц PostgreSQL](../../engines/database-engines/materialized-postgresql.md). Должен использоваться вместе с `materialized_postgresql_replication_slot`.

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

SELECT * FROM database1.table1;
```

При необходимости настройки можно изменить с помощью DDL‑запроса. Однако настройку `materialized_postgresql_tables_list` изменить нельзя. Чтобы обновить список таблиц в этой настройке, используйте запрос `ATTACH TABLE`.

```sql
ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <новый_размер>;
```

### `materialized_postgresql_use_unique_replication_consumer_identifier` \\{#materialized_postgresql_use_unique_replication_consumer_identifier\\}

Использует уникальный идентификатор потребителя при репликации. Значение по умолчанию — `0`.
Если установлено в `1`, позволяет настроить несколько таблиц `MaterializedPostgreSQL`, указывающих на одну и ту же таблицу `PostgreSQL`.

## Заметки \\{#notes\\}

### Переключение (failover) логического слота репликации \\{#logical-replication-slot-failover\\}

Логические слоты репликации, которые существуют на первичном сервере, недоступны на резервных репликах.
Поэтому при переключении ролей новый первичный (бывший физический standby) не будет знать о слотах, которые существовали на старом первичном сервере. Это приведёт к нарушению репликации из PostgreSQL.
Решением является самостоятельное управление слотами репликации и создание постоянного слота репликации (некоторая информация доступна [здесь](https://patroni.readthedocs.io/en/latest/SETTINGS.html)). Необходимо передать имя слота через настройку `materialized_postgresql_replication_slot`, и слот должен быть экспортирован с опцией `EXPORT SNAPSHOT`. Идентификатор снимка необходимо передать через настройку `materialized_postgresql_snapshot`.

Обратите внимание, что это следует использовать только в том случае, если это действительно нужно. Если в этом нет реальной необходимости или нет полного понимания причин, лучше позволить движку таблицы создавать и управлять собственным слотом репликации.

**Пример (от [@bchrobot](https://github.com/bchrobot))**

1. Настройте слот репликации в PostgreSQL.

    ```yaml
    apiVersion: "acid.zalan.do/v1"
    kind: postgresql
    metadata:
      name: acid-demo-cluster
    spec:
      numberOfInstances: 2
      postgresql:
        parameters:
          wal_level: logical
      patroni:
        slots:
          clickhouse_sync:
            type: logical
            database: demodb
            plugin: pgoutput
    ```

2. Дождитесь готовности слота репликации, затем начните транзакцию и экспортируйте идентификатор снимка транзакции (snapshot):

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. В ClickHouse создайте базу данных:

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. Завершите транзакцию в PostgreSQL после того, как подтвердите репликацию в базу данных ClickHouse. Убедитесь, что репликация продолжается после переключения:

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### Необходимые привилегии \\{#required-permissions\\}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) — привилегия на выполнение оператора создания публикации.

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) — привилегия репликации.

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) — привилегия репликации или права суперпользователя.

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) — требуется быть владельцем публикации (`username` в самом движке MaterializedPostgreSQL).

Можно избежать выполнения команд `2` и `3` и необходимости в этих привилегиях. Используйте настройки `materialized_postgresql_replication_slot` и `materialized_postgresql_snapshot`, но с большой осторожностью.

Доступ к таблицам:

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
