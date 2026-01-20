---
description: 'Документация по команде GRANT'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'Команда GRANT'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Команда GRANT \{#grant-statement\}

- Предоставляет [привилегии](#privileges) учетным записям пользователей ClickHouse или ролям.
- Назначает роли учетным записям пользователей или другим ролям.

Чтобы отозвать привилегии, используйте команду [REVOKE](../../sql-reference/statements/revoke.md). Также вы можете вывести список предоставленных привилегий с помощью команды [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants).

## Синтаксис предоставления прав \{#granting-privilege-syntax\}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — тип привилегии.
* `role` — роль пользователя ClickHouse.
* `user` — учетная запись пользователя ClickHouse.

Предложение `WITH GRANT OPTION` предоставляет `user` или `role` право выполнять запрос `GRANT`. Пользователи могут предоставлять привилегии того же уровня и уже по охвату, чем те, которыми они обладают.
Предложение `WITH REPLACE OPTION` заменяет старые привилегии новыми для `user` или `role`; если оно не указано, привилегии добавляются.

## Синтаксис назначения роли \{#assigning-role-syntax\}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

* `role` — роль пользователя ClickHouse.
* `user` — учетная запись пользователя ClickHouse.

Предложение `WITH ADMIN OPTION` предоставляет привилегию [ADMIN OPTION](#admin-option) для `user` или `role`.
Предложение `WITH REPLACE OPTION` заменяет старые роли новыми для `user` или `role`; если оно не указано, новые роли добавляются к существующим.

## Синтаксис оператора GRANT CURRENT GRANTS \{#grant-current-grants-syntax\}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — тип привилегии.
* `role` — роль пользователя ClickHouse.
* `user` — учетная запись пользователя ClickHouse.

Использование оператора `CURRENT GRANTS` позволяет выдать все указанные привилегии заданному пользователю или роли.
Если ни одна привилегия не была указана, заданный пользователь или роль получит все доступные привилегии текущего пользователя (`CURRENT_USER`).

## Использование \{#usage\}

Чтобы использовать `GRANT`, ваша учетная запись должна иметь привилегию `GRANT OPTION`. Вы можете выдавать привилегии только в рамках привилегий вашей учетной записи.

Например, администратор выдал привилегии учетной записи `john` следующим запросом:

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

Это означает, что у `john` есть право выполнять:

* `SELECT x,y FROM db.table`.
* `SELECT x FROM db.table`.
* `SELECT y FROM db.table`.

`john` не может выполнить `SELECT z FROM db.table`. `SELECT * FROM db.table` также недоступен. При обработке этого запроса ClickHouse не возвращает никаких данных, даже `x` и `y`. Единственное исключение — когда таблица содержит только столбцы `x` и `y`. В этом случае ClickHouse возвращает все данные.

Также у `john` есть привилегия `GRANT OPTION`, поэтому он может предоставлять другим пользователям привилегии того же или меньшего объёма.

Доступ к базе данных `system` всегда разрешён (так как эта база используется для обработки запросов).

:::note
Хотя существует множество системных таблиц, к которым новые пользователи по умолчанию имеют доступ, они могут не иметь доступа ко всем системным таблицам без явной выдачи прав.
Кроме того, доступ к определённым системным таблицам, таким как `system.zookeeper`, ограничен для пользователей Cloud по соображениям безопасности.
:::

Вы можете выдать несколько привилегий нескольким учётным записям в одном запросе. Запрос `GRANT SELECT, INSERT ON *.* TO john, robin` позволяет учётным записям `john` и `robin` выполнять запросы `INSERT` и `SELECT` ко всем таблицам во всех базах данных на сервере.

## Права с использованием подстановочных символов \{#wildcard-grants\}

При указании привилегий вы можете использовать звёздочку (`*`) вместо имени таблицы или базы данных. Например, запрос `GRANT SELECT ON db.* TO john` позволяет пользователю `john` выполнять запрос `SELECT` для всех таблиц в базе данных `db`.
Также вы можете опустить имя базы данных. В этом случае привилегии предоставляются для текущей базы данных.
Например, `GRANT SELECT ON * TO john` предоставляет привилегию на все таблицы в текущей базе данных, а `GRANT SELECT ON mytable TO john` предоставляет привилегию на таблицу `mytable` в текущей базе данных.

:::note
Описанная ниже функциональность доступна начиная с версии ClickHouse 24.10.
:::

Вы также можете ставить звёздочки в конце имени таблицы или базы данных. Эта возможность позволяет предоставлять привилегии на абстрактный префикс пути таблицы.
Пример: `GRANT SELECT ON db.my_tables* TO john`. Этот запрос позволяет пользователю `john` выполнять запрос `SELECT` для всех таблиц базы данных `db`, имена которых начинаются с префикса `my_tables`.

Дополнительные примеры:

`GRANT SELECT ON db.my_tables* TO john`

```sql
SELECT * FROM db.my_tables -- granted
SELECT * FROM db.my_tables_0 -- granted
SELECT * FROM db.my_tables_1 -- granted

SELECT * FROM db.other_table -- not_granted
SELECT * FROM db2.my_tables -- not_granted
```

`GRANT SELECT ON db*.* TO john`

```sql
SELECT * FROM db.my_tables -- granted
SELECT * FROM db.my_tables_0 -- granted
SELECT * FROM db.my_tables_1 -- granted
SELECT * FROM db.other_table -- granted
SELECT * FROM db2.my_tables -- granted
```

Все вновь созданные таблицы в рамках путей, для которых выданы права, автоматически наследуют все привилегии от своих родительских объектов.
Например, если вы выполните запрос `GRANT SELECT ON db.* TO john`, а затем создадите новую таблицу `db.new_table`, пользователь `john` сможет выполнять запрос `SELECT * FROM db.new_table`.

Вы можете указывать звёздочку **только** для префиксов:

```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- correct

GRANT SELECT ON *.my_table TO john -- wrong
GRANT SELECT ON foo*bar TO john -- wrong
GRANT SELECT ON *suffix TO john -- wrong
GRANT SELECT(foo) ON db.table* TO john -- wrong
```

## Привилегии \{#privileges\}

Привилегия — это право, предоставляемое пользователю на выполнение определённых видов запросов.

Привилегии имеют иерархическую структуру, и набор разрешённых запросов зависит от области действия привилегии.

Иерархия привилегий в ClickHouse показана ниже:

* [`ALL`](#all)
  * [`Управление доступом`](#access-management)
    * `ALLOW SQL SECURITY NONE`
    * `ALTER QUOTA`
    * `ALTER ROLE`
    * `ALTER ROW POLICY`
    * `ALTER SETTINGS PROFILE`
    * `ALTER USER`
    * `CREATE QUOTA`
    * `CREATE ROLE`
    * `CREATE ROW POLICY`
    * `CREATE SETTINGS PROFILE`
    * `CREATE USER`
    * `DROP QUOTA`
    * `DROP ROLE`
    * `DROP ROW POLICY`
    * `DROP SETTINGS PROFILE`
    * `DROP USER`
    * `ROLE ADMIN`
    * `SHOW ACCESS`
      * `SHOW QUOTAS`
      * `SHOW ROLES`
      * `SHOW ROW POLICIES`
      * `SHOW SETTINGS PROFILES`
      * `SHOW USERS`
  * [`ALTER`](#alter)
    * `ALTER DATABASE`
      * `ALTER DATABASE SETTINGS`
    * `ALTER TABLE`
      * `ALTER COLUMN`
        * `ALTER ADD COLUMN`
        * `ALTER CLEAR COLUMN`
        * `ALTER COMMENT COLUMN`
        * `ALTER DROP COLUMN`
        * `ALTER MATERIALIZE COLUMN`
        * `ALTER MODIFY COLUMN`
        * `ALTER RENAME COLUMN`
      * `ALTER CONSTRAINT`
        * `ALTER ADD CONSTRAINT`
        * `ALTER DROP CONSTRAINT`
      * `ALTER DELETE`
      * `ALTER FETCH PARTITION`
      * `ALTER FREEZE PARTITION`
      * `ALTER INDEX`
        * `ALTER ADD INDEX`
        * `ALTER CLEAR INDEX`
        * `ALTER DROP INDEX`
        * `ALTER MATERIALIZE INDEX`
        * `ALTER ORDER BY`
        * `ALTER SAMPLE BY`
      * `ALTER MATERIALIZE TTL`
      * `ALTER MODIFY COMMENT`
      * `ALTER MOVE PARTITION`
      * `ALTER PROJECTION`
      * `ALTER SETTINGS`
      * `ALTER STATISTICS`
        * `ALTER ADD STATISTICS`
        * `ALTER DROP STATISTICS`
        * `ALTER MATERIALIZE STATISTICS`
        * `ALTER MODIFY STATISTICS`
      * `ALTER TTL`
      * `ALTER UPDATE`
    * `ALTER VIEW`
      * `ALTER VIEW MODIFY QUERY`
      * `ALTER VIEW REFRESH`
      * `ALTER VIEW MODIFY SQL SECURITY`
  * [`BACKUP`](#backup)
  * [`CLUSTER`](#cluster)
  * [`CREATE`](#create)
    * `CREATE ARBITRARY TEMPORARY TABLE`
      * `CREATE TEMPORARY TABLE`
    * `CREATE DATABASE`
    * `CREATE DICTIONARY`
    * `CREATE FUNCTION`
    * `CREATE RESOURCE`
    * `CREATE TABLE`
    * `CREATE VIEW`
    * `CREATE WORKLOAD`
  * [`dictGet`](#dictget)
  * [`displaySecretsInShowAndSelect`](#displaysecretsinshowandselect)
  * [`DROP`](#drop)
    * `DROP DATABASE`
    * `DROP DICTIONARY`
    * `DROP FUNCTION`
    * `DROP RESOURCE`
    * `DROP TABLE`
    * `DROP VIEW`
    * `DROP WORKLOAD`
  * [`INSERT`](#insert)
  * [`ИНТРОСПЕКЦИЯ`](#introspection)
    * `addressToLine`
    * `addressToLineWithInlines`
    * `addressToSymbol`
    * `demangle`
  * `KILL QUERY`
  * `KILL TRANSACTION`
  * `ПЕРЕМЕЩЕНИЕ РАЗДЕЛА МЕЖДУ ШАРДАМИ`
  * [`NAMED COLLECTION ADMIN`](#named-collection-admin)
    * `ALTER NAMED COLLECTION`
    * `CREATE NAMED COLLECTION`
    * `DROP NAMED COLLECTION`
    * `NAMED COLLECTION`
    * `SHOW NAMED COLLECTIONS`
    * `SHOW NAMED COLLECTIONS SECRETS`
  * [`OPTIMIZE`](#optimize)
  * [`SELECT`](#select)
  * [`SET DEFINER`](/sql-reference/statements/create/view#sql_security)
  * [`SHOW`](#show)
    * `SHOW COLUMNS`
    * `SHOW DATABASES`
    * `SHOW DICTIONARIES`
    * `SHOW TABLES`
  * `SHOW FILESYSTEM CACHES`
  * [`ИСТОЧНИКИ`](#sources)
    * `AZURE`
    * `FILE`
    * `HDFS`
    * `HIVE`
    * `JDBC`
    * `KAFKA`
    * `MONGO`
    * `MYSQL`
    * `NATS`
    * `ODBC`
    * `POSTGRES`
    * `RABBITMQ`
    * `REDIS`
    * `REMOTE`
    * `S3`
    * `SQLITE`
    * `URL`
  * [`SYSTEM`](#system)
    * `SYSTEM CLEANUP`
    * `SYSTEM DROP CACHE`
      * `SYSTEM DROP COMPILED EXPRESSION CACHE`
      * `SYSTEM DROP CONNECTIONS CACHE`
      * `SYSTEM DROP DISTRIBUTED CACHE`
      * `SYSTEM DROP DNS CACHE`
      * `SYSTEM DROP FILESYSTEM CACHE`
      * `SYSTEM DROP FORMAT SCHEMA CACHE`
      * `SYSTEM DROP MARK CACHE`
      * `SYSTEM DROP MMAP CACHE`
      * `SYSTEM DROP PAGE CACHE`
      * `SYSTEM DROP PRIMARY INDEX CACHE`
      * `SYSTEM DROP QUERY CACHE`
      * `SYSTEM DROP S3 CLIENT CACHE`
      * `SYSTEM DROP SCHEMA CACHE`
      * `SYSTEM DROP UNCOMPRESSED CACHE`
    * `SYSTEM DROP PRIMARY INDEX CACHE`
    * `SYSTEM DROP REPLICA`
    * `SYSTEM FAILPOINT`
    * `SYSTEM FETCHES`
    * `SYSTEM FLUSH`
      * `SYSTEM FLUSH ASYNC INSERT QUEUE`
      * `SYSTEM FLUSH LOGS`
    * `SYSTEM JEMALLOC`
    * `SYSTEM KILL QUERY`
    * `SYSTEM KILL TRANSACTION`
    * `SYSTEM LISTEN`
    * `SYSTEM LOAD PRIMARY KEY`
    * `SYSTEM MERGES`
    * `SYSTEM MOVES`
    * `SYSTEM PULLING REPLICATION LOG`
    * `SYSTEM REDUCE BLOCKING PARTS`
    * `SYSTEM REPLICATION QUEUES`
    * `SYSTEM REPLICA READINESS`
    * `SYSTEM RESTART DISK`
    * `SYSTEM RESTART REPLICA`
    * `SYSTEM RESTORE REPLICA`
    * `SYSTEM RELOAD`
      * `SYSTEM RELOAD ASYNCHRONOUS METRICS`
      * `SYSTEM RELOAD CONFIG`
        * `SYSTEM RELOAD DICTIONARY`
        * `SYSTEM RELOAD EMBEDDED DICTIONARIES`
        * `SYSTEM RELOAD FUNCTION`
        * `SYSTEM RELOAD MODEL`
        * `SYSTEM RELOAD USERS`
    * `SYSTEM SENDS`
      * `SYSTEM DISTRIBUTED SENDS`
      * `SYSTEM REPLICATED SENDS`
    * `SYSTEM SHUTDOWN`
    * `SYSTEM SYNC DATABASE REPLICA`
    * `SYSTEM SYNC FILE CACHE`
    * `SYSTEM SYNC FILESYSTEM CACHE`
    * `SYSTEM SYNC REPLICA`
    * `SYSTEM SYNC TRANSACTION LOG`
    * `SYSTEM THREAD FUZZER`
    * `SYSTEM TTL MERGES`
    * `SYSTEM UNFREEZE`
    * `SYSTEM UNLOAD PRIMARY KEY`
    * `SYSTEM VIEWS`
    * `SYSTEM VIRTUAL PARTS UPDATE`
    * `SYSTEM WAIT LOADING PARTS`
  * [`TABLE ENGINE`](#table-engine)
  * [`TRUNCATE`](#truncate)
  * `UNDROP TABLE`
* [`NONE`](#none)

Примеры того, как трактуется эта иерархия:

- Привилегия `ALTER` включает все остальные привилегии `ALTER*`.
- `ALTER CONSTRAINT` включает привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

Привилегии применяются на разных уровнях. Зная уровень, можно определить доступный для привилегии синтаксис.

Уровни (от нижнего к более высокому):

- `COLUMN` — привилегия может быть выдана для столбца, таблицы, базы данных или глобально.
- `TABLE` — привилегия может быть выдана для таблицы, базы данных или глобально.
- `VIEW` — привилегия может быть выдана для представления, базы данных или глобально.
- `DICTIONARY` — привилегия может быть выдана для словаря, базы данных или глобально.
- `DATABASE` — привилегия может быть выдана для базы данных или глобально.
- `GLOBAL` — привилегия может быть выдана только глобально.
- `GROUP` — группирует привилегии разных уровней. Когда выдается привилегия уровня `GROUP`, выдаются только те привилегии из группы, которые соответствуют использованному синтаксису.

Примеры допустимого синтаксиса:

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

Примеры недопустимого синтаксиса:

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

Специальная привилегия [ALL](#all) предоставляет все привилегии учетной записи пользователя или роли.

По умолчанию учетная запись пользователя или роль не имеет привилегий.

Если у пользователя или роли нет привилегий, это отображается как привилегия [NONE](#none).

Некоторые запросы по своей реализации требуют определенного набора привилегий. Например, для выполнения запроса [RENAME](../../sql-reference/statements/optimize.md) необходимы следующие привилегии: `SELECT`, `CREATE TABLE`, `INSERT` и `DROP TABLE`.

### SELECT \{#select\}

Позволяет выполнять запросы [SELECT](../../sql-reference/statements/select/index.md).

Уровень привилегии: `COLUMN`.

**Описание**

Пользователь, которому выдана эта привилегия, может выполнять запросы `SELECT` по указанному списку столбцов в заданных таблице и базе данных. Если пользователь включает другие столбцы, помимо указанных, запрос не возвращает данные.

Рассмотрим следующую привилегию:

```sql
GRANT SELECT(x,y) ON db.table TO john
```

Эта привилегия позволяет `john` выполнять любые запросы `SELECT`, которые обращаются к данным из столбцов `x` и/или `y` таблицы `db.table`, например `SELECT x FROM db.table`. `john` не может выполнять `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также недоступен. При выполнении этого запроса ClickHouse не возвращает никаких данных, даже `x` и `y`. Единственное исключение — если таблица содержит только столбцы `x` и `y`, в таком случае ClickHouse возвращает все данные.

### INSERT \{#insert\}

Позволяет выполнять запросы [INSERT](../../sql-reference/statements/insert-into.md).

Уровень привилегий: `COLUMN`.

**Описание**

Пользователь с этой привилегией может выполнять запросы `INSERT` по указанному списку столбцов в заданных таблице и базе данных. Если пользователь указывает другие столбцы, помимо разрешённых, запрос не вставляет никаких данных.

**Пример**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

Предоставленная привилегия позволяет пользователю `john` вставлять данные в столбцы `x` и/или `y` таблицы `db.table`.

### ALTER \{#alter\}

Позволяет выполнять запросы [ALTER](../../sql-reference/statements/alter/index.md) в соответствии со следующей иерархией привилегий:

- `ALTER`. Уровень: `COLUMN`.
  - `ALTER TABLE`. Уровень: `GROUP`
  - `ALTER UPDATE`. Уровень: `COLUMN`. Синонимы: `UPDATE`
  - `ALTER DELETE`. Уровень: `COLUMN`. Синонимы: `DELETE`
  - `ALTER COLUMN`. Уровень: `GROUP`
  - `ALTER ADD COLUMN`. Уровень: `COLUMN`. Синонимы: `ADD COLUMN`
  - `ALTER DROP COLUMN`. Уровень: `COLUMN`. Синонимы: `DROP COLUMN`
  - `ALTER MODIFY COLUMN`. Уровень: `COLUMN`. Синонимы: `MODIFY COLUMN`
  - `ALTER COMMENT COLUMN`. Уровень: `COLUMN`. Синонимы: `COMMENT COLUMN`
  - `ALTER CLEAR COLUMN`. Уровень: `COLUMN`. Синонимы: `CLEAR COLUMN`
  - `ALTER RENAME COLUMN`. Уровень: `COLUMN`. Синонимы: `RENAME COLUMN`
  - `ALTER INDEX`. Уровень: `GROUP`. Синонимы: `INDEX`
  - `ALTER ORDER BY`. Уровень: `TABLE`. Синонимы: `ALTER MODIFY ORDER BY`, `MODIFY ORDER BY`
  - `ALTER SAMPLE BY`. Уровень: `TABLE`. Синонимы: `ALTER MODIFY SAMPLE BY`, `MODIFY SAMPLE BY`
  - `ALTER ADD INDEX`. Уровень: `TABLE`. Синонимы: `ADD INDEX`
  - `ALTER DROP INDEX`. Уровень: `TABLE`. Синонимы: `DROP INDEX`
  - `ALTER MATERIALIZE INDEX`. Уровень: `TABLE`. Синонимы: `MATERIALIZE INDEX`
  - `ALTER CLEAR INDEX`. Уровень: `TABLE`. Синонимы: `CLEAR INDEX`
  - `ALTER CONSTRAINT`. Уровень: `GROUP`. Синонимы: `CONSTRAINT`
  - `ALTER ADD CONSTRAINT`. Уровень: `TABLE`. Синонимы: `ADD CONSTRAINT`
  - `ALTER DROP CONSTRAINT`. Уровень: `TABLE`. Синонимы: `DROP CONSTRAINT`
  - `ALTER TTL`. Уровень: `TABLE`. Синонимы: `ALTER MODIFY TTL`, `MODIFY TTL`
  - `ALTER MATERIALIZE TTL`. Уровень: `TABLE`. Синонимы: `MATERIALIZE TTL`
  - `ALTER SETTINGS`. Уровень: `TABLE`. Синонимы: `ALTER SETTING`, `ALTER MODIFY SETTING`, `MODIFY SETTING`
  - `ALTER MOVE PARTITION`. Уровень: `TABLE`. Синонимы: `ALTER MOVE PART`, `MOVE PARTITION`, `MOVE PART`
  - `ALTER FETCH PARTITION`. Уровень: `TABLE`. Синонимы: `ALTER FETCH PART`, `FETCH PARTITION`, `FETCH PART`
  - `ALTER FREEZE PARTITION`. Уровень: `TABLE`. Синонимы: `FREEZE PARTITION`
  - `ALTER VIEW`. Уровень: `GROUP`
  - `ALTER VIEW REFRESH`. Уровень: `VIEW`. Синонимы: `REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`. Уровень: `VIEW`. Синонимы: `ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`. Уровень: `VIEW`. Синонимы: `ALTER TABLE MODIFY SQL SECURITY`

Примеры трактовки этой иерархии:

- Привилегия `ALTER` включает в себя все остальные привилегии `ALTER*`.
- `ALTER CONSTRAINT` включает привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

**Примечания**

- Привилегия `MODIFY SETTING` позволяет изменять настройки движка таблицы. Она не влияет на настройки или параметры конфигурации сервера.
- Операция `ATTACH` требует привилегии [CREATE](#create).
- Операция `DETACH` требует привилегии [DROP](#drop).
- Чтобы остановить мутацию запросом [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation), необходимо иметь привилегию для запуска этой мутации. Например, если вы хотите остановить запрос `ALTER UPDATE`, вам необходима привилегия `ALTER UPDATE`, `ALTER TABLE` или `ALTER`.

### BACKUP \{#backup\}

Разрешает использование оператора [`BACKUP`] в запросах. Дополнительные сведения о резервном копировании см. в разделе ["Резервное копирование и восстановление"](/operations/backup/overview).

### CREATE \{#create\}

Позволяет выполнять DDL-запросы [CREATE](../../sql-reference/statements/create/index.md) и [ATTACH](../../sql-reference/statements/attach.md) в соответствии со следующей иерархией прав доступа:

- `CREATE`. Уровень: `GROUP`
  - `CREATE DATABASE`. Уровень: `DATABASE`
  - `CREATE TABLE`. Уровень: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`. Уровень: `GLOBAL`
      - `CREATE TEMPORARY TABLE`. Уровень: `GLOBAL`
  - `CREATE VIEW`. Уровень: `VIEW`
  - `CREATE DICTIONARY`. Уровень: `DICTIONARY`

**Примечания**

- Чтобы удалить созданную таблицу, пользователю требуется привилегия [DROP](#drop).

### CLUSTER \{#cluster\}

Позволяет выполнять запросы `ON CLUSTER`.

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <username>
```

По умолчанию запросы с `ON CLUSTER` требуют, чтобы у пользователя была привилегия `CLUSTER`.
Вы получите следующую ошибку, если попытаетесь использовать `ON CLUSTER` в запросе, не выдав предварительно привилегию `CLUSTER`:

```text
Not enough privileges. To execute this query, it's necessary to have the grant CLUSTER ON *.*. 
```

Поведение по умолчанию можно изменить, установив в значение `false` настройку `on_cluster_queries_require_cluster_grant` из раздела `access_control_improvements` файла `config.xml` (см. ниже).

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP \{#drop\}

Позволяет выполнять запросы [DROP](../../sql-reference/statements/drop.md) и [DETACH](../../sql-reference/statements/detach.md) в соответствии со следующей иерархией прав доступа:

- `DROP`. Уровень: `GROUP`
  - `DROP DATABASE`. Уровень: `DATABASE`
  - `DROP TABLE`. Уровень: `TABLE`
  - `DROP VIEW`. Уровень: `VIEW`
  - `DROP DICTIONARY`. Уровень: `DICTIONARY`

### TRUNCATE \{#truncate\}

Позволяет выполнять запросы [TRUNCATE](../../sql-reference/statements/truncate.md).

Уровень привилегий: `TABLE`.

### OPTIMIZE \{#optimize\}

Позволяет выполнять запросы [OPTIMIZE TABLE](../../sql-reference/statements/optimize.md).

Уровень привилегий: `TABLE`.

### SHOW \{#show\}

Позволяет выполнять запросы `SHOW`, `DESCRIBE`, `USE` и `EXISTS` в соответствии со следующей иерархией привилегий:

- `SHOW`. Уровень: `GROUP`
  - `SHOW DATABASES`. Уровень: `DATABASE`. Позволяет выполнять запросы `SHOW DATABASES`, `SHOW CREATE DATABASE`, `USE <database>`.
  - `SHOW TABLES`. Уровень: `TABLE`. Позволяет выполнять запросы `SHOW TABLES`, `EXISTS <table>`, `CHECK <table>`.
  - `SHOW COLUMNS`. Уровень: `COLUMN`. Позволяет выполнять запросы `SHOW CREATE TABLE`, `DESCRIBE`.
  - `SHOW DICTIONARIES`. Уровень: `DICTIONARY`. Позволяет выполнять запросы `SHOW DICTIONARIES`, `SHOW CREATE DICTIONARY`, `EXISTS <dictionary>`.

**Примечания**

Пользователь обладает привилегией `SHOW`, если у него есть какая-либо другая привилегия, относящаяся к указанной таблице, словарю или базе данных.

### KILL QUERY \{#kill-query\}

Позволяет выполнять запросы [KILL](../../sql-reference/statements/kill.md#kill-query) в соответствии со следующей иерархией привилегий:

Уровень привилегий: `GLOBAL`.

**Примечание**

Привилегия `KILL QUERY` позволяет одному пользователю завершать запросы других пользователей.

### УПРАВЛЕНИЕ ДОСТУПОМ \{#access-management\}

Позволяет пользователю выполнять запросы для управления пользователями, ролями и политиками строк.

- `ACCESS MANAGEMENT`. Уровень: `GROUP`
  - `CREATE USER`. Уровень: `GLOBAL`
  - `ALTER USER`. Уровень: `GLOBAL`
  - `DROP USER`. Уровень: `GLOBAL`
  - `CREATE ROLE`. Уровень: `GLOBAL`
  - `ALTER ROLE`. Уровень: `GLOBAL`
  - `DROP ROLE`. Уровень: `GLOBAL`
  - `ROLE ADMIN`. Уровень: `GLOBAL`
  - `CREATE ROW POLICY`. Уровень: `GLOBAL`. Алиасы: `CREATE POLICY`
  - `ALTER ROW POLICY`. Уровень: `GLOBAL`. Алиасы: `ALTER POLICY`
  - `DROP ROW POLICY`. Уровень: `GLOBAL`. Алиасы: `DROP POLICY`
  - `CREATE QUOTA`. Уровень: `GLOBAL`
  - `ALTER QUOTA`. Уровень: `GLOBAL`
  - `DROP QUOTA`. Уровень: `GLOBAL`
  - `CREATE SETTINGS PROFILE`. Уровень: `GLOBAL`. Алиасы: `CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`. Уровень: `GLOBAL`. Алиасы: `ALTER PROFILE`
  - `DROP SETTINGS PROFILE`. Уровень: `GLOBAL`. Алиасы: `DROP PROFILE`
  - `SHOW ACCESS`. Уровень: `GROUP`
    - `SHOW_USERS`. Уровень: `GLOBAL`. Алиасы: `SHOW CREATE USER`
    - `SHOW_ROLES`. Уровень: `GLOBAL`. Алиасы: `SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`. Уровень: `GLOBAL`. Алиасы: `SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
    - `SHOW_QUOTAS`. Уровень: `GLOBAL`. Алиасы: `SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`. Уровень: `GLOBAL`. Алиасы: `SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`. Уровень: `GLOBAL`. Алиасы: `CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

Привилегия `ROLE ADMIN` позволяет пользователю назначать и отзывать любые роли, включая те, которые не назначены этому пользователю с опцией ADMIN.

### SYSTEM \{#system\}

Позволяет пользователю выполнять запросы [SYSTEM](../../sql-reference/statements/system.md) в соответствии со следующей иерархией привилегий.

- `SYSTEM`. Уровень: `GROUP`
  - `SYSTEM SHUTDOWN`. Уровень: `GLOBAL`. Синонимы: `SYSTEM KILL`, `SHUTDOWN`
  - `SYSTEM DROP CACHE`. Синонимы: `DROP CACHE`
    - `SYSTEM DROP DNS CACHE`. Уровень: `GLOBAL`. Синонимы: `SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
    - `SYSTEM DROP MARK CACHE`. Уровень: `GLOBAL`. Синонимы: `SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
    - `SYSTEM DROP UNCOMPRESSED CACHE`. Уровень: `GLOBAL`. Синонимы: `SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
  - `SYSTEM RELOAD`. Уровень: `GROUP`
    - `SYSTEM RELOAD CONFIG`. Уровень: `GLOBAL`. Синонимы: `RELOAD CONFIG`
    - `SYSTEM RELOAD DICTIONARY`. Уровень: `GLOBAL`. Синонимы: `SYSTEM RELOAD DICTIONARIES`, `RELOAD DICTIONARY`, `RELOAD DICTIONARIES`
      - `SYSTEM RELOAD EMBEDDED DICTIONARIES`. Уровень: `GLOBAL`. Синонимы: `RELOAD EMBEDDED DICTIONARIES`
  - `SYSTEM MERGES`. Уровень: `TABLE`. Синонимы: `SYSTEM STOP MERGES`, `SYSTEM START MERGES`, `STOP MERGES`, `START MERGES`
  - `SYSTEM TTL MERGES`. Уровень: `TABLE`. Синонимы: `SYSTEM STOP TTL MERGES`, `SYSTEM START TTL MERGES`, `STOP TTL MERGES`, `START TTL MERGES`
  - `SYSTEM FETCHES`. Уровень: `TABLE`. Синонимы: `SYSTEM STOP FETCHES`, `SYSTEM START FETCHES`, `STOP FETCHES`, `START FETCHES`
  - `SYSTEM MOVES`. Уровень: `TABLE`. Синонимы: `SYSTEM STOP MOVES`, `SYSTEM START MOVES`, `STOP MOVES`, `START MOVES`
  - `SYSTEM SENDS`. Уровень: `GROUP`. Синонимы: `SYSTEM STOP SENDS`, `SYSTEM START SENDS`, `STOP SENDS`, `START SENDS`
    - `SYSTEM DISTRIBUTED SENDS`. Уровень: `TABLE`. Синонимы: `SYSTEM STOP DISTRIBUTED SENDS`, `SYSTEM START DISTRIBUTED SENDS`, `STOP DISTRIBUTED SENDS`, `START DISTRIBUTED SENDS`
    - `SYSTEM REPLICATED SENDS`. Уровень: `TABLE`. Синонимы: `SYSTEM STOP REPLICATED SENDS`, `SYSTEM START REPLICATED SENDS`, `STOP REPLICATED SENDS`, `START REPLICATED SENDS`
  - `SYSTEM REPLICATION QUEUES`. Уровень: `TABLE`. Синонимы: `SYSTEM STOP REPLICATION QUEUES`, `SYSTEM START REPLICATION QUEUES`, `STOP REPLICATION QUEUES`, `START REPLICATION QUEUES`
  - `SYSTEM SYNC REPLICA`. Уровень: `TABLE`. Синонимы: `SYNC REPLICA`
  - `SYSTEM RESTART REPLICA`. Уровень: `TABLE`. Синонимы: `RESTART REPLICA`
  - `SYSTEM FLUSH`. Уровень: `GROUP`
    - `SYSTEM FLUSH DISTRIBUTED`. Уровень: `TABLE`. Синонимы: `FLUSH DISTRIBUTED`
    - `SYSTEM FLUSH LOGS`. Уровень: `GLOBAL`. Синонимы: `FLUSH LOGS`

Привилегия `SYSTEM RELOAD EMBEDDED DICTIONARIES` неявно предоставляется при наличии привилегии `SYSTEM RELOAD DICTIONARY ON *.*`.

### INTROSPECTION \{#introspection\}

Позволяет использовать функции [интроспекции](../../operations/optimizing-performance/sampling-query-profiler.md).

- `INTROSPECTION`. Уровень: `GROUP`. Псевдонимы: `INTROSPECTION FUNCTIONS`
  - `addressToLine`. Уровень: `GLOBAL`
  - `addressToLineWithInlines`. Уровень: `GLOBAL`
  - `addressToSymbol`. Уровень: `GLOBAL`
  - `demangle`. Уровень: `GLOBAL`

### SOURCES \{#sources\}

Позволяет использовать внешние источники данных. Применимо к [табличным движкам](../../engines/table-engines/index.md) и [табличным функциям](/sql-reference/table-functions).

- `READ`. Уровень: `GLOBAL_WITH_PARAMETER`  
- `WRITE`. Уровень: `GLOBAL_WITH_PARAMETER`

Возможные параметры:

- `AZURE`
- `FILE`
- `HDFS`
- `HIVE`
- `JDBC`
- `KAFKA`
- `MONGO`
- `MYSQL`
- `NATS`
- `ODBC`
- `POSTGRES`
- `RABBITMQ`
- `REDIS`
- `REMOTE`
- `S3`
- `SQLITE`
- `URL`

:::note
Разделение прав READ/WRITE для источников доступно, начиная с версии 25.7, и только при включённой серверной настройке
`access_control_improvements.enable_read_write_grants`

В противном случае следует использовать синтаксис `GRANT AZURE ON *.* TO user`, который эквивалентен новому `GRANT READ, WRITE ON AZURE TO user`.
:::

Примеры:

- Чтобы создать таблицу с [табличным движком MySQL](../../engines/table-engines/integrations/mysql.md), необходимы права `CREATE TABLE (ON db.table_name)` и `MYSQL`.
- Чтобы использовать [табличную функцию mysql](../../sql-reference/table-functions/mysql.md), необходимы права `CREATE TEMPORARY TABLE` и `MYSQL`.

### Права доступа по фильтру источника \{#source-filter-grants\}

:::note
Эта возможность доступна, начиная с версии 25.8 и только при включённой серверной настройке
`access_control_improvements.enable_read_write_grants`
:::

Вы можете выдавать доступ к конкретным URI источников с помощью фильтров на основе регулярных выражений. Это позволяет точно контролировать, к каким внешним источникам данных пользователи могут получать доступ.

**Синтаксис:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

Эта привилегия даёт пользователю доступ только на чтение из S3 URI-адресов, которые соответствуют указанному шаблону регулярного выражения.

**Примеры:**

Предоставить доступ к конкретным путям в бакете S3:

```sql
-- Allow user to read only from s3://foo/ paths
GRANT READ ON S3('s3://foo/.*') TO john

-- Allow user to read from specific file patterns
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- Multiple filters can be granted to the same user
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
Фильтр источника принимает **regexp** в качестве параметра, поэтому оператор
`GRANT READ ON URL('http://www.google.com') TO john;`

позволит выполнять запросы

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

потому что `.` в регулярных выражениях интерпретируется как `любой одиночный символ`.
Это может привести к потенциальной уязвимости. Правильный GRANT должен быть таким:

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**Повторная выдача прав с GRANT OPTION:**

Если исходная команда GRANT содержит `WITH GRANT OPTION`, права можно повторно выдать с помощью `GRANT CURRENT GRANTS`:

```sql
-- Original grant with GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John can now regrant this access to others
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**Важные ограничения:**

* **Частичный отзыв прав не допускается:** вы не можете отозвать только часть ранее выданного шаблона фильтра. Необходимо отозвать весь `GRANT` и при необходимости выдать его заново с новыми шаблонами.
* **Выдача прав с использованием только `wildcard` не допускается:** вы не можете использовать `GRANT READ ON *('regexp')` или аналогичные шаблоны, состоящие только из `wildcard`. Должен быть указан конкретный источник.

### dictGet \{#dictget\}

- `dictGet`. Алиасы: `dictHas`, `dictGetHierarchy`, `dictIsIn`

Позволяет выполнять функции [dictGet](/sql-reference/functions/ext-dict-functions#dictGet), [dictHas](../../sql-reference/functions/ext-dict-functions.md#dictHas), [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictGetHierarchy), [dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictIsIn).

Уровень привилегий: `DICTIONARY`.

**Примеры**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect \{#displaysecretsinshowandselect\}

Позволяет пользователю просматривать секреты в запросах `SHOW` и `SELECT`, если включены и
настройка сервера [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select),
и настройка формата [`format_display_secrets_in_show_and_select`](../../operations/settings/formats#format_display_secrets_in_show_and_select).

### NAMED COLLECTION ADMIN \{#named-collection-admin\}

Позволяет выполнять определённую операцию над указанной именованной коллекцией. До версии 23.7 право называлось NAMED COLLECTION CONTROL, а начиная с 23.7 было добавлено NAMED COLLECTION ADMIN, при этом NAMED COLLECTION CONTROL сохранено как псевдоним.

- `NAMED COLLECTION ADMIN`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

В отличие от всех остальных прав (CREATE, DROP, ALTER, SHOW), право NAMED COLLECTION было добавлено только в версии 23.7, тогда как все остальные были добавлены ранее — в версии 22.12.

**Примеры**

Пусть именованная коллекция называется abc. Предоставим право CREATE NAMED COLLECTION пользователю john.

- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE \{#table-engine\}

Позволяет использовать указанный движок таблицы при создании таблицы. Применяется к [движкам таблиц](../../engines/table-engines/index.md).

**Примеры**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

:::note
По умолчанию из соображений обратной совместимости при создании таблицы с конкретным движком таблицы права игнорируются,
однако вы можете изменить это поведение, установив [`table_engines_require_grant` в true](https://github.com/ClickHouse/ClickHouse/blob/df970ed64eaf472de1e7af44c21ec95956607ebb/programs/server/config.xml#L853-L855)
в config.xml.
:::

### ALL \{#all\}

<CloudNotSupportedBadge/>

Предоставляет все привилегии на управляемый объект учетной записи пользователя или роли.

:::note
Привилегия `ALL` не поддерживается в ClickHouse Cloud, где пользователь `default` имеет ограниченные права. Пользователи могут предоставить максимально возможные права пользователю, назначив ему роль `default_role`. См. подробности [здесь](/cloud/security/manage-cloud-users).
Пользователи также могут использовать команду `GRANT CURRENT GRANTS` от имени пользователя `default`, чтобы добиться эффекта, аналогичного `ALL`.
:::

### NONE \{#none\}

Не предоставляет никаких прав.

### ADMIN OPTION \{#admin-option\}

Привилегия `ADMIN OPTION` позволяет пользователю предоставлять свою роль другому пользователю.