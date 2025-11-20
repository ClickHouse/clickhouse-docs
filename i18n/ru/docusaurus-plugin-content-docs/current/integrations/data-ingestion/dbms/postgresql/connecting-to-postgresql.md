---
slug: /integrations/postgresql/connecting-to-postgresql
title: 'Подключение к PostgreSQL'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: 'Страница, описывающая различные способы подключения PostgreSQL к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Подключение ClickHouse к PostgreSQL

На этой странице рассмотрены следующие варианты интеграции PostgreSQL с ClickHouse:

- использование движка таблиц `PostgreSQL` для чтения из таблицы PostgreSQL
- использование экспериментального движка базы данных `MaterializedPostgreSQL` для синхронизации базы данных в PostgreSQL с базой данных в ClickHouse

:::tip
Мы рекомендуем использовать [ClickPipes](/integrations/clickpipes/postgres) — управляемый сервис интеграции для ClickHouse Cloud на базе PeerDB.
В качестве альтернативы [PeerDB](https://github.com/PeerDB-io/peerdb) доступен как инструмент CDC с открытым исходным кодом, специально разработанный для репликации баз данных PostgreSQL как в самоуправляемый ClickHouse, так и в ClickHouse Cloud.
:::



## Использование движка таблиц PostgreSQL {#using-the-postgresql-table-engine}

Движок таблиц `PostgreSQL` позволяет выполнять операции **SELECT** и **INSERT** с данными, хранящимися на удалённом сервере PostgreSQL, из ClickHouse.
В этой статье описаны базовые методы интеграции на примере одной таблицы.

### 1. Настройка PostgreSQL {#1-setting-up-postgresql}

1.  В файле `postgresql.conf` добавьте следующую запись, чтобы PostgreSQL прослушивал сетевые интерфейсы:

```text
listen_addresses = '*'
```

2. Создайте пользователя для подключения из ClickHouse. В демонстрационных целях в этом примере предоставляются полные права суперпользователя.

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

5. Добавим несколько строк для тестирования:

```sql
INSERT INTO table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def');
```

6. Чтобы настроить PostgreSQL для разрешения подключений к новой базе данных с новым пользователем для репликации, добавьте следующую запись в файл `pg_hba.conf`. Укажите в строке адреса подсеть или IP-адрес вашего сервера PostgreSQL:

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_in_psg             clickhouse_user 192.168.1.0/24          password
```

7. Перезагрузите конфигурацию `pg_hba.conf` (скорректируйте команду в зависимости от вашей версии):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

8. Убедитесь, что новый пользователь `clickhouse_user` может войти в систему:

```text
psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
```

:::note
Если вы используете эту функцию в ClickHouse Cloud, вам может потребоваться разрешить IP-адресам ClickHouse Cloud доступ к вашему экземпляру PostgreSQL.
Сведения об исходящем трафике см. в [API конечных точек Cloud](/cloud/get-started/query-endpoints) ClickHouse.
:::

### 2. Определение таблицы в ClickHouse {#2-define-a-table-in-clickhouse}

1. Войдите в `clickhouse-client`:

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. Создадим новую базу данных:

```sql
CREATE DATABASE db_in_ch;
```

3. Создайте таблицу, использующую движок `PostgreSQL`:

```sql
CREATE TABLE db_in_ch.table1
(
    id UInt64,
    column1 String
)
ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
```

Минимально необходимые параметры:

| параметр  | Описание                        | пример                        |
| --------- | ------------------------------- | ----------------------------- |
| host:port | имя хоста или IP-адрес и порт   | postgres-host.domain.com:5432 |
| database  | имя базы данных PostgreSQL      | db_in_psg                     |
| user      | имя пользователя для подключения к PostgreSQL | clickhouse_user               |
| password  | пароль для подключения к PostgreSQL | ClickHouse_123                |

:::note
Полный список параметров см. на странице документации [движка таблиц PostgreSQL](/engines/table-engines/integrations/postgresql).
:::

### 3. Тестирование интеграции {#3-test-the-integration}

1. В ClickHouse просмотрите начальные строки:

```sql
SELECT * FROM db_in_ch.table1
```

Таблица ClickHouse должна автоматически заполниться двумя строками, которые уже существовали в таблице PostgreSQL:

```response
Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```

2. Вернувшись в PostgreSQL, добавьте несколько строк в таблицу:

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


Ответ должен быть следующим:

```response
Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

5. Давайте посмотрим, что произойдёт, когда вы добавите строки в таблицу ClickHouse:

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

В этом примере была продемонстрирована базовая интеграция между PostgreSQL и ClickHouse с использованием движка таблиц `PostrgeSQL`.
Ознакомьтесь со [страницей документации по движку таблиц PostgreSQL](/engines/table-engines/integrations/postgresql), чтобы узнать о дополнительных возможностях, таких как указание схем, выборка только части столбцов и подключение к нескольким репликам. Также рекомендуем прочитать запись в блоге [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres).


## Использование движка базы данных MaterializedPostgreSQL {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

Движок базы данных PostgreSQL использует функции репликации PostgreSQL для создания реплики базы данных со всеми схемами и таблицами или их подмножеством.
В этой статье рассматриваются базовые методы интеграции с использованием одной базы данных, одной схемы и одной таблицы.

**_В приведенных ниже процедурах используются PostgreSQL CLI (psql) и ClickHouse CLI (clickhouse-client). Сервер PostgreSQL установлен на Linux. Ниже приведены минимальные настройки для новой тестовой установки базы данных PostgreSQL_**

### 1. В PostgreSQL {#1-in-postgresql}

1.  В файле `postgresql.conf` задайте минимальные уровни прослушивания, уровень WAL для репликации и слоты репликации:

добавьте следующие записи:

```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```

_\*Для ClickHouse требуется минимальный уровень WAL `logical` и минимум `2` слота репликации_

2. Используя учетную запись администратора, создайте пользователя для подключения из ClickHouse:

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

_\*В демонстрационных целях предоставлены полные права суперпользователя._

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

7. Настройте PostgreSQL для разрешения подключений к новой базе данных с новым пользователем для репликации. Ниже приведена минимальная запись, которую необходимо добавить в файл `pg_hba.conf`:


```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```

_\*в демонстрационных целях используется метод аутентификации с паролем в открытом виде. Обновите строку адреса, указав подсеть или адрес сервера согласно документации PostgreSQL_

8. Перезагрузите конфигурацию `pg_hba.conf` командой следующего вида (адаптируйте под вашу версию):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. Проверьте вход с новым пользователем `clickhouse_user`:

```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. В ClickHouse {#2-in-clickhouse}

1. Войдите в интерфейс командной строки ClickHouse

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

Минимальные параметры:

| параметр  | Описание                                      | пример                                         |
| --------- | --------------------------------------------- | ---------------------------------------------- |
| host:port | имя хоста или IP-адрес и порт                 | postgres-host.domain.com:5432                  |
| database  | имя базы данных PostgreSQL                    | db1                                            |
| user      | имя пользователя для подключения к PostgreSQL | clickhouse_user                                |
| password  | пароль для подключения к PostgreSQL           | ClickHouse_123                                 |
| settings  | дополнительные настройки движка               | materialized_postgresql_tables_list = 'table1' |

:::info
Полное руководство по движку базы данных PostgreSQL см. по адресу https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings
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

### 3. Проверка базовой репликации {#3-test-basic-replication}

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

### 4. Заключение {#4-summary}

Данное руководство по интеграции сосредоточено на простом примере репликации базы данных с таблицей, однако существуют более продвинутые варианты, включающие репликацию всей базы данных или добавление новых таблиц и схем к существующим репликациям. Хотя DDL-команды не поддерживаются для этой репликации, движок можно настроить на обнаружение изменений и перезагрузку таблиц при внесении структурных изменений.

:::info
Дополнительные возможности для продвинутых вариантов см. в [справочной документации](/engines/database-engines/materialized-postgresql).
:::
