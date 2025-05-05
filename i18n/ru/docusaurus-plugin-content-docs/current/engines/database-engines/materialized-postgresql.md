---
description: 'Создает базу данных ClickHouse с таблицами из базы данных PostgreSQL.'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 60
slug: /engines/database-engines/materialized-postgresql
title: 'MaterializedPostgreSQL'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
Пользователям ClickHouse Cloud рекомендуется использовать [ClickPipes](/integrations/clickpipes) для репликации PostgreSQL в ClickHouse. Это обеспечивает высокопроизводительный захват изменений данных (CDC) для PostgreSQL.
:::

Создает базу данных ClickHouse с таблицами из базы данных PostgreSQL. Во-первых, база данных с движком `MaterializedPostgreSQL` создает снимок базы данных PostgreSQL и загружает необходимые таблицы. Необходимые таблицы могут включать любую подмножество таблиц из любой подмножества схем из указанной базы данных. Вместе со снимком движок базы данных получает LSN и после выполнения начальной выгрузки таблиц начинает получать обновления из WAL. После создания базы данных новые таблицы, добавленные в базу данных PostgreSQL, не автоматически добавляются в репликацию. Их необходимо добавлять вручную с помощью запроса `ATTACH TABLE db.table`.

Репликация осуществляется с помощью протокола логической репликации PostgreSQL, который не позволяет реплицировать DDL, но позволяет узнать, произошло ли изменение, нарушающее репликацию (изменения типов столбцов, добавление/удаление столбцов). Такие изменения обнаруживаются, и соответствующие таблицы прекращают получать обновления. В этом случае вы должны использовать запросы `ATTACH`/ `DETACH PERMANENTLY`, чтобы полностью перезагрузить таблицу. Если DDL не нарушает репликацию (например, переименование столбца), таблица все равно будет получать обновления (вставка выполняется по позиции).

:::note
Этот движок базы данных является экспериментальным. Чтобы использовать его, установите `allow_experimental_database_materialized_postgresql` в 1 в ваших файлах конфигурации или с помощью команды `SET`:
```sql
SET allow_experimental_database_materialized_postgresql=1
```
:::

## Создание базы данных {#creating-a-database}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**Параметры движка**

- `host:port` — конечная точка сервера PostgreSQL.
- `database` — имя базы данных PostgreSQL.
- `user` — пользователь PostgreSQL.
- `password` — пароль пользователя.

## Пример использования {#example-of-use}

```sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```

## Динамическое добавление новых таблиц в репликацию {#dynamically-adding-table-to-replication}

После создания базы данных `MaterializedPostgreSQL` она не автоматически обнаруживает новые таблицы в соответствующей базе данных PostgreSQL. Такие таблицы можно добавлять вручную:

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
До версии 22.1 добавление таблицы в репликацию оставляло не удаленный временный слот репликации (названный `{db_name}_ch_replication_slot_tmp`). Если вы присоединяете таблицы в версии ClickHouse до 22.1, убедитесь, что удалили его вручную (`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`). В противном случае использование диска будет расти. Эта проблема исправлена в 22.1.
:::

## Динамическое удаление таблиц из репликации {#dynamically-removing-table-from-replication}

Можно удалить определенные таблицы из репликации:

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## Схема PostgreSQL {#schema}

Схему PostgreSQL [schema](https://www.postgresql.org/docs/9.1/ddl-schemas.html) можно настроить тремя способами (начиная с версии 21.12).

1. Одна схема для одного движка базы данных `MaterializedPostgreSQL`. Требуется использование настройки `materialized_postgresql_schema`.
Таблицы доступны только по имени таблицы:

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. Любое количество схем с указанным набором таблиц для одного движка базы данных `MaterializedPostgreSQL`. Требуется использование настройки `materialized_postgresql_tables_list`. Каждая таблица записывается вместе с ее схемой.
Таблицы доступны одновременно по имени схемы и имени таблицы:

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

Но в этом случае все таблицы в `materialized_postgresql_tables_list` должны быть записаны с её именем схемы.
Требуется `materialized_postgresql_tables_list_with_schema = 1`.

Предупреждение: для этого случая точки в имени таблицы не допускаются.

3. Любое количество схем с полным набором таблиц для одного движка базы данных `MaterializedPostgreSQL`. Требуется использование настройки `materialized_postgresql_schema_list`.

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

Предупреждение: для этого случая точки в имени таблицы не допускаются.

## Требования {#requirements}

1. Параметр [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) должен иметь значение `logical`, а параметр `max_replication_slots` должен иметь значение не менее `2` в конфигурационном файле PostgreSQL.

2. Каждая реплицируемая таблица должна иметь одно из следующих [replica identity](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY):

- первичный ключ (по умолчанию)

- индекс

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

Первичный ключ всегда проверяется первым. Если он отсутствует, то проверяется индекс, определяемый как индекс идентичности реплики.
Если индекс используется как идентичность реплики, то в таблице должен быть только один такой индекс.
Вы можете проверить, какой тип используется для конкретной таблицы с помощью следующей команды:

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
Репликация значений [**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) не поддерживается. Будет использовано значение по умолчанию для типа данных.
:::

## Настройки {#settings}

### `materialized_postgresql_tables_list` {#materialized-postgresql-tables-list}

    Устанавливает список таблиц базы данных PostgreSQL, разделенных запятыми, которые будут реплицироваться через движок базы данных [MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md).

    Каждая таблица может иметь подмножество реплицируемых столбцов в скобках. Если подмножество столбцов опущено, то все столбцы таблицы будут реплицироваться.

    ```sql
    materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
    ```

    Значение по умолчанию: пустой список — означает, что вся база данных PostgreSQL будет реплицироваться.

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    Значение по умолчанию: пустая строка. (Используется схема по умолчанию)

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    Значение по умолчанию: пустой список. (Используется схема по умолчанию)

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    Устанавливает количество строк, собранных в памяти перед сбросом данных в таблицу базы данных PostgreSQL.

    Возможные значения:

    - Положительное целое число.

    Значение по умолчанию: `65536`.

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    Созданный пользователем слот репликации. Должен использоваться вместе с `materialized_postgresql_snapshot`.

### `materialized_postgresql_snapshot` {#materialized-postgresql-snapshot}

    Строка текста, определяющая снимок, из которого будет выполнена [начальная выгрузка таблиц PostgreSQL](../../engines/database-engines/materialized-postgresql.md). Должен использоваться вместе с `materialized_postgresql_replication_slot`.

    ```sql
    CREATE DATABASE database1
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

    SELECT * FROM database1.table1;
    ```

    Настройки могут быть изменены, если необходимо, с помощью DDL-запроса. Но невозможно изменить настройку `materialized_postgresql_tables_list`. Чтобы обновить список таблиц в этой настройке, используйте запрос `ATTACH TABLE`.

    ```sql
    ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
    ```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

Используйте уникальный идентификатор потребителя репликации для репликации. Значение по умолчанию: `0`.
Если установлено значение `1`, позволяет настроить несколько таблиц `MaterializedPostgreSQL`, указывающих на одну и ту же таблицу `PostgreSQL`.

## Заметки {#notes}

### Отказоустойчивость логического слота репликации {#logical-replication-slot-failover}

Логические слоты репликации, которые существуют на основном сервере, недоступны на резервных репликах.
Таким образом, если происходит сбой, новая основная система (старый физический резерв) не будет осведомлена о любых слотах, которые существовали у старого основного. Это приведет к нарушению репликации из PostgreSQL.
Решением этой проблемы является управление слотами репликации самостоятельно и определение постоянного слота репликации (некоторые сведения можно найти [здесь](https://patroni.readthedocs.io/en/latest/SETTINGS.html)). Вам нужно будет передать имя слота через настройку `materialized_postgresql_replication_slot`, и он должен быть экспортирован с опцией `EXPORT SNAPSHOT`. Идентификатор снимка необходимо передать через настройку `materialized_postgresql_snapshot`.

Обратите внимание, что это следует использовать только в случае реальной необходимости. Если нет настоящей необходимости в этом или полного понимания почему, то лучше позволить движку таблицы создавать и управлять своим собственным слотом репликации.

**Пример (от [@bchrobot](https://github.com/bchrobot))**

1. Настройка слота репликации в PostgreSQL.

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

2. Ждите, пока слот репликации будет готов, затем начните транзакцию и экспортируйте идентификатор снимка транзакции:

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

4. Завершите транзакцию PostgreSQL после подтверждения репликации в базе данных ClickHouse. Проверьте, что репликация продолжается после сбоя:

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### Необходимые разрешения {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) -- привилегия на создание запроса.

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) -- привилегия на репликацию.

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) -- привилегия на репликацию или суперпользователь.

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) -- владелец публикации (`username` в самом движке MaterializedPostgreSQL).

Можно избежать выполнения команд `2` и `3` и обладания этими разрешениями. Используйте настройки `materialized_postgresql_replication_slot` и `materialized_postgresql_snapshot`. Но с большой осторожностью.

Доступ к таблицам:

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
