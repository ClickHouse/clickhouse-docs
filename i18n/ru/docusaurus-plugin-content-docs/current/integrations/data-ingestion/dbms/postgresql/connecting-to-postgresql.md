---
slug: /integrations/postgresql/connecting-to-postgresql
title: 'Подключение к PostgreSQL'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: 'Страница, описывающая различные способы подключения PostgreSQL к ClickHouse'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Подключение ClickHouse к PostgreSQL

Эта страница охватывает следующие варианты интеграции PostgreSQL с ClickHouse:

- использование [ClickPipes](/integrations/clickpipes/postgres), управляемого интеграционного сервиса для ClickHouse Cloud - сейчас в Частном Предварительном Просмотре. Пожалуйста, [зарегистрируйтесь здесь](https://clickpipes.peerdb.io/)
- использование `PeerDB by ClickHouse`, инструмента CDC, специально разработанного для репликации баз данных PostgreSQL как на самоуправляемом ClickHouse, так и на ClickHouse Cloud
  - PeerDB теперь доступен нативно в ClickHouse Cloud - молниеносный Postgres к ClickHouse CDC с нашим [новым ClickPipe коннектором](/integrations/clickpipes/postgres) - сейчас в Частном Предварительном Просмотре. Пожалуйста, [зарегистрируйтесь здесь](https://clickpipes.peerdb.io/)
- использование `PostgreSQL` движка таблиц для чтения из таблицы PostgreSQL
- использование экспериментального `MaterializedPostgreSQL` движка базы данных для синхронизации базы данных в PostgreSQL с базой данных в ClickHouse

## Использование ClickPipes (на базе PeerDB) {#using-clickpipes-powered-by-peerdb}

PeerDB теперь доступен нативно в ClickHouse Cloud - молниеносный Postgres к ClickHouse CDC с нашим [новым ClickPipe коннектором](/integrations/clickpipes/postgres) - сейчас в Частном Предварительном Просмотре. Пожалуйста, [зарегистрируйтесь здесь](https://clickpipes.peerdb.io/)

## Использование PostgreSQL Движка Таблиц {#using-the-postgresql-table-engine}

Движок таблиц `PostgreSQL` позволяет выполнять операции **SELECT** и **INSERT** на данных, хранящихся на удалённом сервере PostgreSQL из ClickHouse. Эта статья иллюстрирует основные методы интеграции, используя одну таблицу.

### 1. Настройка PostgreSQL {#1-setting-up-postgresql}
1. В `postgresql.conf` добавьте следующую запись, чтобы включить прослушивание сетевых интерфейсов PostgreSQL:
  ```text
  listen_addresses = '*'
  ```

2. Создайте пользователя для подключения из ClickHouse. В данном примере для демонстрационных целей этому пользователю предоставляются полные права суперпользователя.
  ```sql
  CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
  ```

3. Создайте новую базу данных в PostgreSQL:
  ```sql
  CREATE DATABASE db_in_psg;
  ```

4. Создайте новую таблицу:
  ```sql
  CREATE TABLE table1 (
      id         integer primary key,
      column1    varchar(10)
  );
  ```

5. Давайте добавим несколько строк для тестирования:
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def');
  ```

6. Чтобы настроить PostgreSQL для разрешения подключений к новой базе данных с новым пользователем для репликации, добавьте следующую запись в файл `pg_hba.conf`. Обновите строку адреса, указав либо подсеть, либо IP-адрес вашего сервера PostgreSQL:
  ```text
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
  ```

7. Перезагрузите конфигурацию `pg_hba.conf` (откорректируйте эту команду в зависимости от вашей версии):
  ```text
  /usr/pgsql-12/bin/pg_ctl reload
  ```

8. Убедитесь, что новый `clickhouse_user` может войти:
  ```text
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
  ```

:::note
Если вы используете эту функцию в ClickHouse Cloud, вам может потребоваться разрешить IP-адресам ClickHouse Cloud доступ к вашему экземпляру PostgreSQL. Проверьте ClickHouse [API конечных точек Cloud](/cloud/get-started/query-endpoints) для получения сведений о выходном трафике.
:::

### 2. Определите таблицу в ClickHouse {#2-define-a-table-in-clickhouse}
1. Войдите в `clickhouse-client`:
  ```bash
  clickhouse-client --user default --password ClickHouse123!
  ```

2. Давайте создадим новую базу данных:
  ```sql
  CREATE DATABASE db_in_ch;
  ```

3. Создайте таблицу, которая использует `PostgreSQL`:
  ```sql
  CREATE TABLE db_in_ch.table1
  (
      id UInt64,
      column1 String
  )
  ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
  ```

  Минимальные необходимые параметры:

  |parameter|Description                 |example              |
  |---------|----------------------------|---------------------|
  |host:port|hostname or IP and port     |postgres-host.domain.com:5432|
  |database |PostgreSQL database name         |db_in_psg                  |
  |user     |username to connect to postgres|clickhouse_user     |
  |password |password to connect to postgres|ClickHouse_123       |

  :::note
  Посмотрите страницу документации [PostgreSQL движка таблиц](/engines/table-engines/integrations/postgresql) для полного списка параметров.
  :::


### 3. Протестируйте интеграцию {#3-test-the-integration}

1. В ClickHouse просмотрите начальные строки:
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  Таблица ClickHouse должна автоматически заполняться двумя строками, которые уже существовали в таблице PostgreSQL:
  ```response
  Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  └────┴─────────┘
  ```

2. Вернитесь в PostgreSQL и добавьте пару строк в таблицу:
  ```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (3, 'ghi'),
    (4, 'jkl');
  ```

4. Эти две новые строки должны появиться в вашей таблице ClickHouse:
  ```sql
  SELECT * FROM db_in_ch.table1
  ```

  Ответ должен быть:
  ```response
  Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘
  ```

5. Давайте посмотрим, что произойдет, когда вы добавите строки в таблицу ClickHouse:
  ```sql
  INSERT INTO db_in_ch.table1
    (id, column1)
  VALUES
    (5, 'mno'),
    (6, 'pqr');
  ```

6. Строки, добавленные в ClickHouse, должны появиться в таблице PostgreSQL:
  ```sql
  db_in_psg=# SELECT * FROM table1;
  id | column1
  ----+---------
    1 | abc
    2 | def
    3 | ghi
    4 | jkl
    5 | mno
    6 | pqr
  (6 rows)
  ```

Этот пример продемонстрировал базовую интеграцию между PostgreSQL и ClickHouse с использованием `PostgreSQL` движка таблиц. Ознакомьтесь с [документацией по PostgreSQL движку таблиц](/engines/table-engines/integrations/postgresql) для получения дополнительных функций, таких как указание схем, возврат только подмножества столбцов и подключение к нескольким репликам. Также ознакомьтесь с блога [ClickHouse и PostgreSQL - совместимость в мире данных - часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres).

## Использование MaterializedPostgreSQL движка базы данных {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

Движок базы данных PostgreSQL использует функции репликации PostgreSQL для создания реплики базы данных со всеми или подмножеством схем и таблиц. Эта статья иллюстрирует основные методы интеграции, используя одну базу данных, одну схему и одну таблицу.

***В следующих процедурах используются CLI PostgreSQL (psql) и CLI ClickHouse (clickhouse-client). Сервер PostgreSQL установлен на Linux. Следующие настройки минимальные, если база данных PostgreSQL является новой тестовой установкой.***

### 1. В PostgreSQL {#1-in-postgresql}
1.  В `postgresql.conf` установите минимальные уровни прослушивания, уровень репликации wal и слоты репликации:

добавьте следующие записи:
```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouse требует минимум `логического` уровня wal и минимум `2` слота репликации._

2. Используя учетную запись администратора, создайте пользователя для подключения из ClickHouse:
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```
_*для демонстрационных целей предоставлены полные права суперпользователя._

3. Создайте новую базу данных:
```sql
CREATE DATABASE db1;
```

4. Подключитесь к новой базе данных в `psql`:
```text
\connect db1
```

5. Создайте новую таблицу:
```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

6. Добавьте начальные строки:
```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. Настройте PostgreSQL для разрешения подключений к новой базе данных с новым пользователем для репликации. Ниже представлена минимальная запись для добавления в файл `pg_hba.conf`:

```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*для демонстрационных целей используется метод аутентификации с открытым текстом. обновите строку адреса, указав либо подсеть, либо адрес сервера согласно документации PostgreSQL._

8. Перезагрузите конфигурацию `pg_hba.conf` чем-то вроде этого (откорректируйте для вашей версии):
```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. Проверьте вход с новым `clickhouse_user`:
```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. В ClickHouse {#2-in-clickhouse}
1. Войдите в CLI ClickHouse
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. Включите экспериментальную функцию PostgreSQL для движка базы данных:
```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. Создайте новую базу данных для репликации и определите начальную таблицу:
```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```
минимальные параметры:

|parameter|Description                 |example              |
|---------|----------------------------|---------------------|
|host:port|hostname or IP and port     |postgres-host.domain.com:5432|
|database |PostgreSQL database name         |db1                  |
|user     |username to connect to postgres|clickhouse_user     |
|password |password to connect to postgres|ClickHouse_123       |
|settings |additional settings for the engine| materialized_postgresql_tables_list = 'table1'|

:::info
Для полного руководства по движку базы данных PostgreSQL, обратитесь к https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings
:::

4. Убедитесь, что в начальной таблице есть данные:

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: df2381ac-4e30-4535-b22e-8be3894aaafc

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 3. Протестируйте основную репликацию {#3-test-basic-replication}
1. В PostgreSQL добавьте новые строки:
```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. В ClickHouse убедитесь, что новые строки видны:
```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: b0729816-3917-44d3-8d1a-fed912fb59ce

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  4 │ jkl     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 4. Резюме {#4-summary}
Данный руководства по интеграции сосредоточено на простом примере репликации базы данных с таблицей, однако существуют более сложные варианты, которые включают репликацию всей базы данных или добавление новых таблиц и схем в существующие репликации. Хотя DDL команды не поддерживаются для этой репликации, движок может быть настроен для обнаружения изменений и перезагрузки таблиц, когда происходят структурные изменения.

:::info
Для получения дополнительных функций доступных для более сложных опций, пожалуйста, смотрите [документацию ссылающуюся](/engines/database-engines/materialized-postgresql).
:::


## Связанный контент {#related-content}
- Блог: [ClickHouse и PostgreSQL - совместимость в мире данных - часть 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres)
- Блог: [ClickHouse и PostgreSQL - совместимость в мире данных - часть 2](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres-part-2)
