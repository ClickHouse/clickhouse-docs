---
description: 'Документация для оператора GRANT'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'Оператор GRANT'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Оператор GRANT

- Предоставляет [привилегии](#privileges) учетным записям пользователей ClickHouse или ролям.
- Назначает роли учетным записям пользователей или другим ролям.

Чтобы отозвать привилегии, используйте оператор [REVOKE](../../sql-reference/statements/revoke.md). Вы также можете перечислить предоставленные привилегии с помощью оператора [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants).
## Синтаксис предоставления привилегий {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — Тип привилегии.
- `role` — Роль пользователя ClickHouse.
- `user` — Учетная запись пользователя ClickHouse.

Клауза `WITH GRANT OPTION` предоставляет `user` или `role` разрешение на выполнение запроса `GRANT`. Пользователи могут предоставлять привилегии того же объема, что и у них, или меньше.
Клауза `WITH REPLACE OPTION` заменяет старые привилегии на новые для `user` или `role`. Если не указано, она добавляет привилегии.
## Синтаксис назначения роли {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — Роль пользователя ClickHouse.
- `user` — Учетная запись пользователя ClickHouse.

Клауза `WITH ADMIN OPTION` предоставляет привилегию [ADMIN OPTION](#admin-option) для `user` или `role`.
Клауза `WITH REPLACE OPTION` заменяет старые роли на новую роль для `user` или `role`. Если не указано, она добавляет роли.
## Синтаксис текущих привилегий {#grant-current-grants-syntax}
```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

-   `privilege` — Тип привилегии.
-   `role` — Роль пользователя ClickHouse.
-   `user` — Учетная запись пользователя ClickHouse.

Использование оператора `CURRENT GRANTS` позволяет предоставить все указанные привилегии указанному пользователю или роли.
Если ни одна из привилегий не указана, то указанный пользователь или роль получит все доступные привилегии для `CURRENT_USER`.
## Использование {#usage}

Чтобы использовать `GRANT`, ваша учетная запись должна иметь привилегию `GRANT OPTION`. Вы можете предоставлять привилегии только в рамках своих учетных привилегий.

Например, администратор предоставил привилегии учетной записи `john` следующим запросом:

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

Это означает, что `john` имеет разрешение на выполнение:

- `SELECT x,y FROM db.table`.
- `SELECT x FROM db.table`.
- `SELECT y FROM db.table`.

`john` не может выполнить `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также недоступен. Обрабатывая этот запрос, ClickHouse не возвращает никаких данных, даже `x` и `y`. Единственное исключение, если таблица содержит только столбцы `x` и `y`. В этом случае ClickHouse возвращает все данные.

Также `john` имеет привилегию `GRANT OPTION`, так что он может предоставлять другим пользователям привилегии того же или меньшего объема.

Доступ к базе данных `system` всегда разрешен (так как эта база данных используется для обработки запросов).

Вы можете предоставить несколько привилегий нескольким учетным записям в одном запросе. Запрос `GRANT SELECT, INSERT ON *.* TO john, robin` позволяет учетным записям `john` и `robin` выполнять запросы `INSERT` и `SELECT` ко всем таблицам во всех базах данных на сервере.
## Шаблонные привилегии {#wildcard-grants}

Указывая привилегии, вы можете использовать звездочку (`*`) вместо имени таблицы или базы данных. Например, запрос `GRANT SELECT ON db.* TO john` позволяет `john` выполнять запрос `SELECT` ко всем таблицам в базе данных `db`.
Вы также можете опустить имя базы данных. В этом случае привилегии предоставляются для текущей базы данных.
Например, `GRANT SELECT ON * TO john` предоставляет привилегию на все таблицы в текущей базе данных, `GRANT SELECT ON mytable TO john` предоставляет привилегию на таблицу `mytable` в текущей базе данных.

:::note
Функция, описанная ниже, доступна начиная с версии ClickHouse 24.10.
:::

Вы также можете ставить звездочки в конце имени таблицы или базы данных. Эта функция позволяет предоставлять привилегии на абстрактный префикс пути таблицы.
Пример: `GRANT SELECT ON db.my_tables* TO john`. Этот запрос позволяет `john` выполнять запрос `SELECT` ко всем таблицам базы данных `db` с префиксом `my_tables*`.

Больше примеров:

`GRANT SELECT ON db.my_tables* TO john`
```sql
SELECT * FROM db.my_tables -- предоставлено
SELECT * FROM db.my_tables_0 -- предоставлено
SELECT * FROM db.my_tables_1 -- предоставлено

SELECT * FROM db.other_table -- не предоставлено
SELECT * FROM db2.my_tables -- не предоставлено
```

`GRANT SELECT ON db*.* TO john`
```sql
SELECT * FROM db.my_tables -- предоставлено
SELECT * FROM db.my_tables_0 -- предоставлено
SELECT * FROM db.my_tables_1 -- предоставлено
SELECT * FROM db.other_table -- предоставлено
SELECT * FROM db2.my_tables -- предоставлено
```

Все вновь созданные таблицы в пределах предоставленных путей автоматически унаследуют все привилегии от своих родительских таблиц.
Например, если вы выполните запрос `GRANT SELECT ON db.* TO john`, а затем создадите новую таблицу `db.new_table`, пользователь `john` сможет выполнить запрос `SELECT * FROM db.new_table`.

Вы можете указывать звездочку **только** для префиксов:
```sql
GRANT SELECT ON db.* TO john -- правильно
GRANT SELECT ON db*.* TO john -- правильно

GRANT SELECT ON *.my_table TO john -- неправильно
GRANT SELECT ON foo*bar TO john -- неправильно
GRANT SELECT ON *suffix TO john -- неправильно
GRANT SELECT(foo) ON db.table* TO john -- неправильно
```
## Привилегии {#privileges}

Привилегия — это разрешение, предоставленное пользователю для выполнения определенных типов запросов.

Привилегии имеют иерархическую структуру, и набор разрешенных запросов зависит от объема привилегии.

Иерархия привилегий в ClickHouse показана ниже:

- [`ALL`](#all)
    - [`ACCESS MANAGEMENT`](#access-management)
          - `ALLOW SQL SECURITY NONE`
          - `ALTER QUOTA`
          - `ALTER ROLE`
          - `ALTER ROW POLICY` 
          - `ALTER SETTINGS PROFILE`
          - `ALTER USER`
          - `CREATE QUOTA`
          - `CREATE ROLE`
          - `CREATE ROW POLICY`
          - `CREATE SETTINGS PROFILE`
          - `CREATE USER`
          - `DROP QUOTA`
          - `DROP ROLE`
          - `DROP ROW POLICY`
          - `DROP SETTINGS PROFILE`
          - `DROP USER`
          - `ROLE ADMIN`
          - `SHOW ACCESS`
              - `SHOW QUOTAS`
              - `SHOW ROLES`
              - `SHOW ROW POLICIES`
              - `SHOW SETTINGS PROFILES`
              - `SHOW USERS`
    - [`ALTER`](#alter)
          - `ALTER DATABASE`
              - `ALTER DATABASE SETTINGS`
          - `ALTER TABLE`
                - `ALTER COLUMN`
                    - `ALTER ADD COLUMN`
                    - `ALTER CLEAR COLUMN`
                    - `ALTER COMMENT COLUMN`
                    - `ALTER DROP COLUMN`
                    - `ALTER MATERIALIZE COLUMN`
                    - `ALTER MODIFY COLUMN`
                    - `ALTER RENAME COLUMN` 
                - `ALTER CONSTRAINT`
                    - `ALTER ADD CONSTRAINT`
                    - `ALTER DROP CONSTRAINT` 
                - `ALTER DELETE`
                - `ALTER FETCH PARTITION`
                - `ALTER FREEZE PARTITION`
                - `ALTER INDEX`
                    - `ALTER ADD INDEX`
                    - `ALTER CLEAR INDEX`
                    - `ALTER DROP INDEX`
                    - `ALTER MATERIALIZE INDEX`
                    - `ALTER ORDER BY`
                    - `ALTER SAMPLE BY` 
                - `ALTER MATERIALIZE TTL`
                - `ALTER MODIFY COMMENT`
                - `ALTER MOVE PARTITION`
                - `ALTER PROJECTION`
                - `ALTER SETTINGS`
                - `ALTER STATISTICS`
                    - `ALTER ADD STATISTICS`
                    - `ALTER DROP STATISTICS`
                    - `ALTER MATERIALIZE STATISTICS`
                    - `ALTER MODIFY STATISTICS` 
                - `ALTER TTL`
                - `ALTER UPDATE` 
          - `ALTER VIEW`
              - `ALTER VIEW MODIFY QUERY`
              - `ALTER VIEW REFRESH`
              - `ALTER VIEW MODIFY SQL SECURITY`
    - [`BACKUP`](#backup)
    - [`CLUSTER`](#cluster)
    - [`CREATE`](#create)
        - `CREATE ARBITRARY TEMPORARY TABLE`
            - `CREATE TEMPORARY TABLE`
        - `CREATE DATABASE`
        - `CREATE DICTIONARY`
        - `CREATE FUNCTION`
        - `CREATE RESOURCE`
        - `CREATE TABLE`
        - `CREATE VIEW`
        - `CREATE WORKLOAD`
    - [`dictGet`](#dictget)
    - [`displaySecretsInShowAndSelect`](#displaysecretsinshowandselect)
    - [`DROP`](#drop)
        - `DROP DATABASE`
        - `DROP DICTIONARY`
        - `DROP FUNCTION`
        - `DROP RESOURCE`
        - `DROP TABLE`
        - `DROP VIEW` 
        - `DROP WORKLOAD`
    - [`INSERT`](#insert)
    - [`INTROSPECTION`](#introspection)
        - `addressToLine`
        - `addressToLineWithInlines`
        - `addressToSymbol`
        - `demangle`
    - `KILL QUERY`
    - `KILL TRANSACTION`
    - `MOVE PARTITION BETWEEN SHARDS`
    - [`NAMED COLLECTION ADMIN`](#named-collection-admin)
        - `ALTER NAMED COLLECTION`
        - `CREATE NAMED COLLECTION`
        - `DROP NAMED COLLECTION`
        - `NAMED COLLECTION`
        - `SHOW NAMED COLLECTIONS`
        - `SHOW NAMED COLLECTIONS SECRETS`
    - [`OPTIMIZE`](#optimize)
    - [`SELECT`](#select)
    - [`SET DEFINER`](/sql-reference/statements/create/view#sql_security)
    - [`SHOW`](#show)
        - `SHOW COLUMNS` 
        - `SHOW DATABASES`
        - `SHOW DICTIONARIES`
        - `SHOW TABLES`
    - `SHOW FILESYSTEM CACHES`
    - [`SOURCES`](#sources)
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
    - [`SYSTEM`](#system)
        - `SYSTEM CLEANUP`
        - `SYSTEM DROP CACHE`
            - `SYSTEM DROP COMPILED EXPRESSION CACHE`
            - `SYSTEM DROP CONNECTIONS CACHE`
            - `SYSTEM DROP DISTRIBUTED CACHE`
            - `SYSTEM DROP DNS CACHE`
            - `SYSTEM DROP FILESYSTEM CACHE`
            - `SYSTEM DROP FORMAT SCHEMA CACHE`
            - `SYSTEM DROP MARK CACHE`
            - `SYSTEM DROP MMAP CACHE`
            - `SYSTEM DROP PAGE CACHE`
            - `SYSTEM DROP PRIMARY INDEX CACHE`
            - `SYSTEM DROP QUERY CACHE`
            - `SYSTEM DROP S3 CLIENT CACHE`
            - `SYSTEM DROP SCHEMA CACHE`
            - `SYSTEM DROP UNCOMPRESSED CACHE`
        - `SYSTEM DROP PRIMARY INDEX CACHE`
        - `SYSTEM DROP REPLICA`
        - `SYSTEM FAILPOINT`
        - `SYSTEM FETCHES`
        - `SYSTEM FLUSH`
            - `SYSTEM FLUSH ASYNC INSERT QUEUE`
            - `SYSTEM FLUSH LOGS`
        - `SYSTEM JEMALLOC`
        - `SYSTEM KILL QUERY`
        - `SYSTEM KILL TRANSACTION`
        - `SYSTEM LISTEN`
        - `SYSTEM LOAD PRIMARY KEY`
        - `SYSTEM MERGES`
        - `SYSTEM MOVES`
        - `SYSTEM PULLING REPLICATION LOG`
        - `SYSTEM REDUCE BLOCKING PARTS`
        - `SYSTEM REPLICATION QUEUES`
        - `SYSTEM REPLICA READINESS`
        - `SYSTEM RESTART DISK`
        - `SYSTEM RESTART REPLICA`
        - `SYSTEM RESTORE REPLICA`
        - `SYSTEM RELOAD`
            - `SYSTEM RELOAD ASYNCHRONOUS METRICS`
            - `SYSTEM RELOAD CONFIG`
                - `SYSTEM RELOAD DICTIONARY`
                - `SYSTEM RELOAD EMBEDDED DICTIONARIES`
                - `SYSTEM RELOAD FUNCTION`
                - `SYSTEM RELOAD MODEL`
                - `SYSTEM RELOAD USERS`
        - `SYSTEM SENDS`
            - `SYSTEM DISTRIBUTED SENDS`
            - `SYSTEM REPLICATED SENDS`
        - `SYSTEM SHUTDOWN`
        - `SYSTEM SYNC DATABASE REPLICA`
        - `SYSTEM SYNC FILE CACHE`
        - `SYSTEM SYNC FILESYSTEM CACHE`
        - `SYSTEM SYNC REPLICA`
        - `SYSTEM SYNC TRANSACTION LOG`
        - `SYSTEM THREAD FUZZER`
        - `SYSTEM TTL MERGES`
        - `SYSTEM UNFREEZE`
        - `SYSTEM UNLOAD PRIMARY KEY`
        - `SYSTEM VIEWS`
        - `SYSTEM VIRTUAL PARTS UPDATE`
        - `SYSTEM WAIT LOADING PARTS`
    - [`TABLE ENGINE`](#table-engine)
    - [`TRUNCATE`](#truncate)
    - `UNDROP TABLE` 
- [`NONE`](#none)

Примеры того, как эта иерархия обрабатывается:

- Привилегия `ALTER` включает все другие привилегии `ALTER*`.
- `ALTER CONSTRAINT` включает привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

Привилегии применяются на разных уровнях. Знание уровня предполагает синтаксис, доступный для привилегии.

Уровни (от низшего к высшему):

- `COLUMN` — Привилегию можно предоставить для столбца, таблицы, базы данных или глобально.
- `TABLE` — Привилегию можно предоставить для таблицы, базы данных или глобально.
- `VIEW` — Привилегию можно предоставить для представления, базы данных или глобально.
- `DICTIONARY` — Привилегию можно предоставить для словаря, базы данных или глобально.
- `DATABASE` — Привилегию можно предоставить для базы данных или глобально.
- `GLOBAL` — Привилегию можно предоставить только глобально.
- `GROUP` — Группирует привилегии разных уровней. Когда привилегия уровня `GROUP` предоставляется, предоставляются только те привилегии из группы, которые соответствуют использованному синтаксису.

Примеры разрешенного синтаксиса:

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

Примеры недопустимого синтаксиса:

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

Специальная привилегия [ALL](#all) предоставляет все привилегии учетной записи пользователя или роли.

По умолчанию у учетной записи пользователя или роли нет привилегий.

Если у пользователя или роли нет привилегий, это отображается как привилегия [NONE](#none).

Некоторые запросы по своей реализации требуют набора привилегий. Например, для выполнения запроса [RENAME](../../sql-reference/statements/optimize.md) вам нужны следующие привилегии: `SELECT`, `CREATE TABLE`, `INSERT` и `DROP TABLE`.
### SELECT {#select}

Позволяет выполнять запросы [SELECT](../../sql-reference/statements/select/index.md).

Уровень привилегии: `COLUMN`.

**Описание**

Пользователь, получивший эту привилегию, может выполнять запросы `SELECT` по указанному списку столбцов в указанной таблице и базе данных. Если пользователь включает другие столбцы, то указанный запрос не возвращает никаких данных.

Рассмотрим следующую привилегию:

```sql
GRANT SELECT(x,y) ON db.table TO john
```

Эта привилегия позволяет `john` выполнять любые запросы `SELECT`, которые содержат данные из столбцов `x` и/или `y` в `db.table`, например, `SELECT x FROM db.table`. `john` не может выполнить `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также недоступен. Обрабатывая этот запрос, ClickHouse не возвращает никаких данных, даже `x` и `y`. Единственное исключение — если таблица содержит только столбцы `x` и `y`, в таком случае ClickHouse возвращает все данные.
### INSERT {#insert}

Позволяет выполнять запросы [INSERT](../../sql-reference/statements/insert-into.md).

Уровень привилегии: `COLUMN`.

**Описание**

Пользователь, получивший эту привилегию, может выполнять запросы `INSERT` по указанному списку столбцов в указанной таблице и базе данных. Если пользователь включает другие столбцы, указанный запрос не вставляет никаких данных.

**Пример**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

Предоставленная привилегия позволяет `john` вставлять данные в столбцы `x` и/или `y` в `db.table`.
### ALTER {#alter}

Позволяет выполнять запросы [ALTER](../../sql-reference/statements/alter/index.md) в соответствии со следующей иерархией привилегий:

- `ALTER`. Уровень: `COLUMN`.
    - `ALTER TABLE`. Уровень: `GROUP`
        - `ALTER UPDATE`. Уровень: `COLUMN`. Псевдонимы: `UPDATE`
        - `ALTER DELETE`. Уровень: `COLUMN`. Псевдонимы: `DELETE`
        - `ALTER COLUMN`. Уровень: `GROUP`
            - `ALTER ADD COLUMN`. Уровень: `COLUMN`. Псевдонимы: `ADD COLUMN`
            - `ALTER DROP COLUMN`. Уровень: `COLUMN`. Псевдонимы: `DROP COLUMN`
            - `ALTER MODIFY COLUMN`. Уровень: `COLUMN`. Псевдонимы: `MODIFY COLUMN`
            - `ALTER COMMENT COLUMN`. Уровень: `COLUMN`. Псевдонимы: `COMMENT COLUMN`
            - `ALTER CLEAR COLUMN`. Уровень: `COLUMN`. Псевдонимы: `CLEAR COLUMN`
            - `ALTER RENAME COLUMN`. Уровень: `COLUMN`. Псевдонимы: `RENAME COLUMN`
        - `ALTER INDEX`. Уровень: `GROUP`. Псевдонимы: `INDEX`
            - `ALTER ORDER BY`. Уровень: `TABLE`. Псевдонимы: `ALTER MODIFY ORDER BY`, `MODIFY ORDER BY`
            - `ALTER SAMPLE BY`. Уровень: `TABLE`. Псевдонимы: `ALTER MODIFY SAMPLE BY`, `MODIFY SAMPLE BY`
            - `ALTER ADD INDEX`. Уровень: `TABLE`. Псевдонимы: `ADD INDEX`
            - `ALTER DROP INDEX`. Уровень: `TABLE`. Псевдонимы: `DROP INDEX`
            - `ALTER MATERIALIZE INDEX`. Уровень: `TABLE`. Псевдонимы: `MATERIALIZE INDEX`
            - `ALTER CLEAR INDEX`. Уровень: `TABLE`. Псевдонимы: `CLEAR INDEX`
        - `ALTER CONSTRAINT`. Уровень: `GROUP`. Псевдонимы: `CONSTRAINT`
            - `ALTER ADD CONSTRAINT`. Уровень: `TABLE`. Псевдонимы: `ADD CONSTRAINT`
            - `ALTER DROP CONSTRAINT`. Уровень: `TABLE`. Псевдонимы: `DROP CONSTRAINT`
        - `ALTER TTL`. Уровень: `TABLE`. Псевдонимы: `ALTER MODIFY TTL`, `MODIFY TTL`
            - `ALTER MATERIALIZE TTL`. Уровень: `TABLE`. Псевдонимы: `MATERIALIZE TTL`
        - `ALTER SETTINGS`. Уровень: `TABLE`. Псевдонимы: `ALTER SETTING`, `ALTER MODIFY SETTING`, `MODIFY SETTING`
        - `ALTER MOVE PARTITION`. Уровень: `TABLE`. Псевдонимы: `ALTER MOVE PART`, `MOVE PARTITION`, `MOVE PART`
        - `ALTER FETCH PARTITION`. Уровень: `TABLE`. Псевдонимы: `ALTER FETCH PART`, `FETCH PARTITION`, `FETCH PART`
        - `ALTER FREEZE PARTITION`. Уровень: `TABLE`. Псевдонимы: `FREEZE PARTITION`
    - `ALTER VIEW` Уровень: `GROUP`
        - `ALTER VIEW REFRESH`. Уровень: `VIEW`. Псевдонимы: `ALTER LIVE VIEW REFRESH`, `REFRESH VIEW`
        - `ALTER VIEW MODIFY QUERY`. Уровень: `VIEW`. Псевдонимы: `ALTER TABLE MODIFY QUERY`
        - `ALTER VIEW MODIFY SQL SECURITY`. Уровень: `VIEW`. Псевдонимы: `ALTER TABLE MODIFY SQL SECURITY`

Примеры того, как эта иерархия обрабатывается:

- Привилегия `ALTER` включает все другие привилегии `ALTER*`.
- `ALTER CONSTRAINT` включает привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

**Заметки**

- Привилегия `MODIFY SETTING` позволяет изменять настройки движка таблицы. Это не затрагивает настройки или параметры конфигурации сервера.
- Операция `ATTACH` требует привилегии [CREATE](#create).
- Операция `DETACH` требует привилегии [DROP](#drop).
- Чтобы остановить мутацию с помощью запроса [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation), вам необходимо иметь привилегию на запуск этой мутации. Например, если вы хотите остановить запрос `ALTER UPDATE`, вам нужны привилегии `ALTER UPDATE`, `ALTER TABLE` или `ALTER`.
### BACKUP {#backup}

Позволяет выполнять [`BACKUP`] в запросах. Для получения дополнительной информации о резервных копиях смотрите раздел "Резервное копирование и восстановление" (Backup and Restore).
### CREATE {#create}

Позволяет выполнять DDL-запросы [CREATE](../../sql-reference/statements/create/index.md) и [ATTACH](../../sql-reference/statements/attach.md) в соответствии со следующей иерархией привилегий:

- `CREATE`. Уровень: `GROUP`
    - `CREATE DATABASE`. Уровень: `DATABASE`
    - `CREATE TABLE`. Уровень: `TABLE`
        - `CREATE ARBITRARY TEMPORARY TABLE`. Уровень: `GLOBAL`
            - `CREATE TEMPORARY TABLE`. Уровень: `GLOBAL`
    - `CREATE VIEW`. Уровень: `VIEW`
    - `CREATE DICTIONARY`. Уровень: `DICTIONARY`

**Заметки**

- Чтобы удалить созданную таблицу, пользователю нужны привилегии [DROP](#drop).
### CLUSTER {#cluster}

Позволяет выполнять запросы с `ON CLUSTER`.

```sql title="Синтаксис"
GRANT CLUSTER ON *.* TO <username>
```

По умолчанию запросы с `ON CLUSTER` требуют, чтобы пользователь имел привилегию `CLUSTER`.
Вы получите следующую ошибку, если попытаетесь использовать `ON CLUSTER` в запросе без предварительного предоставления привилегии `CLUSTER`:

```text
Недостаточно привилегий. Для выполнения этого запроса необходимо иметь привилегию CLUSTER ON *.*. 
```

Стандартное поведение можно изменить, установив настройку `on_cluster_queries_require_cluster_grant`,
расположенную в секции `access_control_improvements` файла `config.xml` (см. ниже), на `false`.

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```
### DROP {#drop}

Позволяет выполнять запросы [DROP](../../sql-reference/statements/drop.md) и [DETACH](../../sql-reference/statements/detach.md) в соответствии со следующей иерархией привилегий:

- `DROP`. Уровень: `GROUP`
    - `DROP DATABASE`. Уровень: `DATABASE`
    - `DROP TABLE`. Уровень: `TABLE`
    - `DROP VIEW`. Уровень: `VIEW`
    - `DROP DICTIONARY`. Уровень: `DICTIONARY`
### TRUNCATE {#truncate}

Позволяет выполнять запросы [TRUNCATE](../../sql-reference/statements/truncate.md).

Уровень привилегии: `TABLE`.
### OPTIMIZE {#optimize}

Позволяет выполнять запросы [OPTIMIZE TABLE](../../sql-reference/statements/optimize.md).

Уровень привилегии: `TABLE`.
### SHOW {#show}

Позволяет выполнять запросы `SHOW`, `DESCRIBE`, `USE` и `EXISTS` в соответствии со следующей иерархией привилегий:

- `SHOW`. Уровень: `GROUP`
    - `SHOW DATABASES`. Уровень: `DATABASE`. Позволяет выполнять запросы `SHOW DATABASES`, `SHOW CREATE DATABASE`, `USE <database>`.
    - `SHOW TABLES`. Уровень: `TABLE`. Позволяет выполнять запросы `SHOW TABLES`, `EXISTS <table>`, `CHECK <table>`.
    - `SHOW COLUMNS`. Уровень: `COLUMN`. Позволяет выполнять запросы `SHOW CREATE TABLE`, `DESCRIBE`.
    - `SHOW DICTIONARIES`. Уровень: `DICTIONARY`. Позволяет выполнять запросы `SHOW DICTIONARIES`, `SHOW CREATE DICTIONARY`, `EXISTS <dictionary>`.

**Заметки**

Пользователь имеет привилегию `SHOW`, если он имеет любую другую привилегию, касающуюся указанных таблицы, словаря или базы данных.
### KILL QUERY {#kill-query}

Позволяет выполнять запросы [KILL](../../sql-reference/statements/kill.md#kill-query) в соответствии со следующей иерархией привилегий:

Уровень привилегии: `GLOBAL`.

**Заметки**

Привилегия `KILL QUERY` позволяет одному пользователю убивать запросы других пользователей.
### УПРАВЛЕНИЕ ДОСТУПОМ {#access-management}

Позволяет пользователю выполнять запросы, управляющие пользователями, ролями и политиками строк.

- `ACCESS MANAGEMENT`. Уровень: `GROUP`
    - `CREATE USER`. Уровень: `GLOBAL`
    - `ALTER USER`. Уровень: `GLOBAL`
    - `DROP USER`. Уровень: `GLOBAL`
    - `CREATE ROLE`. Уровень: `GLOBAL`
    - `ALTER ROLE`. Уровень: `GLOBAL`
    - `DROP ROLE`. Уровень: `GLOBAL`
    - `ROLE ADMIN`. Уровень: `GLOBAL`
    - `CREATE ROW POLICY`. Уровень: `GLOBAL`. Псевдонимы: `CREATE POLICY`
    - `ALTER ROW POLICY`. Уровень: `GLOBAL`. Псевдонимы: `ALTER POLICY`
    - `DROP ROW POLICY`. Уровень: `GLOBAL`. Псевдонимы: `DROP POLICY`
    - `CREATE QUOTA`. Уровень: `GLOBAL`
    - `ALTER QUOTA`. Уровень: `GLOBAL`
    - `DROP QUOTA`. Уровень: `GLOBAL`
    - `CREATE SETTINGS PROFILE`. Уровень: `GLOBAL`. Псевдонимы: `CREATE PROFILE`
    - `ALTER SETTINGS PROFILE`. Уровень: `GLOBAL`. Псевдонимы: `ALTER PROFILE`
    - `DROP SETTINGS PROFILE`. Уровень: `GLOBAL`. Псевдонимы: `DROP PROFILE`
    - `SHOW ACCESS`. Уровень: `GROUP`
        - `SHOW_USERS`. Уровень: `GLOBAL`. Псевдонимы: `SHOW CREATE USER`
        - `SHOW_ROLES`. Уровень: `GLOBAL`. Псевдонимы: `SHOW CREATE ROLE`
        - `SHOW_ROW_POLICIES`. Уровень: `GLOBAL`. Псевдонимы: `SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
        - `SHOW_QUOTAS`. Уровень: `GLOBAL`. Псевдонимы: `SHOW CREATE QUOTA`
        - `SHOW_SETTINGS_PROFILES`. Уровень: `GLOBAL`. Псевдонимы: `SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
    - `ALLOW SQL SECURITY NONE`. Уровень: `GLOBAL`. Псевдонимы: `CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

Привилегия `ROLE ADMIN` позволяет пользователю назначать и отзывать любые роли, включая те, которые не назначены пользователю с правом администратора. 
### СИСТЕМА {#system}

Позволяет пользователю выполнять запросы [SYSTEM](../../sql-reference/statements/system.md) согласно следующей иерархии привилегий.

- `SYSTEM`. Уровень: `GROUP`
    - `SYSTEM SHUTDOWN`. Уровень: `GLOBAL`. Псевдонимы: `SYSTEM KILL`, `SHUTDOWN`
    - `SYSTEM DROP CACHE`. Псевдонимы: `DROP CACHE`
        - `SYSTEM DROP DNS CACHE`. Уровень: `GLOBAL`. Псевдонимы: `SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
        - `SYSTEM DROP MARK CACHE`. Уровень: `GLOBAL`. Псевдонимы: `SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
        - `SYSTEM DROP UNCOMPRESSED CACHE`. Уровень: `GLOBAL`. Псевдонимы: `SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
    - `SYSTEM RELOAD`. Уровень: `GROUP`
        - `SYSTEM RELOAD CONFIG`. Уровень: `GLOBAL`. Псевдонимы: `RELOAD CONFIG`
        - `SYSTEM RELOAD DICTIONARY`. Уровень: `GLOBAL`. Псевдонимы: `SYSTEM RELOAD DICTIONARIES`, `RELOAD DICTIONARY`, `RELOAD DICTIONARIES`
            - `SYSTEM RELOAD EMBEDDED DICTIONARIES`. Уровень: `GLOBAL`. Псевдонимы: `RELOAD EMBEDDED DICTIONARIES`
    - `SYSTEM MERGES`. Уровень: `TABLE`. Псевдонимы: `SYSTEM STOP MERGES`, `SYSTEM START MERGES`, `STOP MERGES`, `START MERGES`
    - `SYSTEM TTL MERGES`. Уровень: `TABLE`. Псевдонимы: `SYSTEM STOP TTL MERGES`, `SYSTEM START TTL MERGES`, `STOP TTL MERGES`, `START TTL MERGES`
    - `SYSTEM FETCHES`. Уровень: `TABLE`. Псевдонимы: `SYSTEM STOP FETCHES`, `SYSTEM START FETCHES`, `STOP FETCHES`, `START FETCHES`
    - `SYSTEM MOVES`. Уровень: `TABLE`. Псевдонимы: `SYSTEM STOP MOVES`, `SYSTEM START MOVES`, `STOP MOVES`, `START MOVES`
    - `SYSTEM SENDS`. Уровень: `GROUP`. Псевдонимы: `SYSTEM STOP SENDS`, `SYSTEM START SENDS`, `STOP SENDS`, `START SENDS`
        - `SYSTEM DISTRIBUTED SENDS`. Уровень: `TABLE`. Псевдонимы: `SYSTEM STOP DISTRIBUTED SENDS`, `SYSTEM START DISTRIBUTED SENDS`, `STOP DISTRIBUTED SENDS`, `START DISTRIBUTED SENDS`
        - `SYSTEM REPLICATED SENDS`. Уровень: `TABLE`. Псевдонимы: `SYSTEM STOP REPLICATED SENDS`, `SYSTEM START REPLICATED SENDS`, `STOP REPLICATED SENDS`, `START REPLICATED SENDS`
    - `SYSTEM REPLICATION QUEUES`. Уровень: `TABLE`. Псевдонимы: `SYSTEM STOP REPLICATION QUEUES`, `SYSTEM START REPLICATION QUEUES`, `STOP REPLICATION QUEUES`, `START REPLICATION QUEUES`
    - `SYSTEM SYNC REPLICA`. Уровень: `TABLE`. Псевдонимы: `SYNC REPLICA`
    - `SYSTEM RESTART REPLICA`. Уровень: `TABLE`. Псевдонимы: `RESTART REPLICA`
    - `SYSTEM FLUSH`. Уровень: `GROUP`
        - `SYSTEM FLUSH DISTRIBUTED`. Уровень: `TABLE`. Псевдонимы: `FLUSH DISTRIBUTED`
        - `SYSTEM FLUSH LOGS`. Уровень: `GLOBAL`. Псевдонимы: `FLUSH LOGS`

Привилегия `SYSTEM RELOAD EMBEDDED DICTIONARIES` неявно предоставляется привилегией `SYSTEM RELOAD DICTIONARY ON *.*`.
### INTROSPECTION {#introspection}

Позволяет использовать функции [интроспекции](../../operations/optimizing-performance/sampling-query-profiler.md).

- `INTROSPECTION`. Уровень: `GROUP`. Псевдонимы: `INTROSPECTION FUNCTIONS`
    - `addressToLine`. Уровень: `GLOBAL`
    - `addressToLineWithInlines`. Уровень: `GLOBAL`
    - `addressToSymbol`. Уровень: `GLOBAL`
    - `demangle`. Уровень: `GLOBAL`
### SOURCES {#sources}

Позволяет использовать внешние источники данных. Применяется к [движкам таблиц](../../engines/table-engines/index.md) и [табличным функциям](/sql-reference/table-functions).

- `SOURCES`. Уровень: `GROUP`
    - `AZURE`. Уровень: `GLOBAL`
    - `FILE`. Уровень: `GLOBAL`
    - `HDFS`. Уровень: `GLOBAL`
    - `HIVE`. Уровень: `GLOBAL`
    - `JDBC`. Уровень: `GLOBAL`
    - `KAFKA`. Уровень: `GLOBAL`
    - `MONGO`. Уровень: `GLOBAL`
    - `MYSQL`. Уровень: `GLOBAL`
    - `NATS`. Уровень: `GLOBAL`
    - `ODBC`. Уровень: `GLOBAL`
    - `POSTGRES`. Уровень: `GLOBAL`
    - `RABBITMQ`. Уровень: `GLOBAL`
    - `REDIS`. Уровень: `GLOBAL`
    - `REMOTE`. Уровень: `GLOBAL`
    - `S3`. Уровень: `GLOBAL`
    - `SQLITE`. Уровень: `GLOBAL`
    - `URL`. Уровень: `GLOBAL`

Привилегия `SOURCES` позволяет использовать все источники. Вы также можете предоставлять привилегию для каждого источника индивидуально. Для использования источников вам нужны дополнительные привилегии.

Примеры:

- Чтобы создать таблицу с [движком таблицы MySQL](../../engines/table-engines/integrations/mysql.md), вам нужны привилегии `CREATE TABLE (ON db.table_name)` и `MYSQL`.
- Чтобы использовать [функцию mysql](../../sql-reference/table-functions/mysql.md), вам нужны привилегии `CREATE TEMPORARY TABLE` и `MYSQL`.
### dictGet {#dictget}

- `dictGet`. Псевдонимы: `dictHas`, `dictGetHierarchy`, `dictIsIn`

Позволяет пользователю выполнять функции [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull), [dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas), [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy), [dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin).

Уровень привилегии: `DICTIONARY`.

**Примеры**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`
### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

Позволяет пользователю видеть секреты в запросах `SHOW` и `SELECT`, если обе
настройки [`display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
и
[`format_display_secrets_in_show_and_select`](../../operations/settings/formats#format_display_secrets_in_show_and_select)
включены.
### УПРАВЛЕНИЕ НАЗВАННЫМИ КОЛЛЕКЦИЯМИ {#named-collection-admin}

Разрешает определенную операцию на указанной названии коллекции. До версии 23.7 это называлось УПРАВЛЕНИЕ НАЗВАННЫМИ КОЛЛЕКЦИЯМИ, а после 23.7 было добавлено УПРАВЛЕНИЕ НАЗВАННЫМИ КОЛЛЕКЦИЯМИ, а УПРАВЛЕНИЕ НАЗВАННЫМИ КОЛЛЕКЦИЯМИ сохранено как псевдоним.

- `УПРАВЛЕНИЕ НАЗВАННЫМИ КОЛЛЕКЦИЯМИ`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `УПРАВЛЕНИЕ НАЗВАННЫМИ КОЛЛЕКЦИЯМИ`
    - `СОЗДАТЬ НАЗВАННУЮ КОЛЛЕКЦИЮ`. Уровень: `NAMED_COLLECTION`
    - `УДАЛИТЬ НАЗВАННУЮ КОЛЛЕКЦИЮ`. Уровень: `NAMED_COLLECTION`
    - `ИЗМЕНИТЬ НАЗВАННУЮ КОЛЛЕКЦИЮ`. Уровень: `NAMED_COLLECTION`
    - `ПОКАЗАТЬ НАЗВАННЫЕ КОЛЛЕКЦИИ`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `ПОКАЗАТЬ НАЗВАННЫЕ КОЛЛЕКЦИИ`
    - `ПОКАЗАТЬ СЕКРЕТЫ НАЗВАННЫХ КОЛЛЕКЦИЙ`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `ПОКАЗАТЬ СЕКРЕТЫ НАЗВАННЫХ КОЛЛЕКЦИЙ`
    - `НАЗВАННАЯ КОЛЛЕКЦИЯ`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `ИСПОЛЬЗОВАНИЕ НАЗВАННОЙ КОЛЛЕКЦИИ`, `ИСПОЛЬЗОВАТЬ НАЗВАННУЮ КОЛЛЕКЦИЮ`

В отличие от всех других привилегий (СОЗДАНИЕ, УДАЛЕНИЕ, ИЗМЕНЕНИЕ, ПОКАЗ), привилегия УПРАВЛЕНИЕ НАЗВАННЫМИ КОЛЛЕКЦИЯМИ была добавлена только в 23.7, в то время как все остальные были добавлены ранее - в 22.12.

**Примеры**

Предположим, что названная коллекция называется abc, мы предоставляем привилегию СОЗДАНИЕ НАЗВАННОЙ КОЛЛЕКЦИИ пользователю john.
- `GRANT CREATE NAMED COLLECTION ON abc TO john`
### ДВИЖОК ТАБЛИЦЫ {#table-engine}

Разрешает использовать указанный движок таблицы при создании таблицы. Применяется к [движкам таблиц](../../engines/table-engines/index.md).

**Примеры**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`
### ВСЕ {#all}

<CloudNotSupportedBadge/>

Предоставляет все привилегии на регулируемую сущность учетной записи пользователя или роли.

:::note
Привилегия `ВСЕ` не поддерживается в ClickHouse Cloud, где у пользователя `default` ограниченные права. Пользователи могут предоставить максимальные права пользователю, предоставив роль `default_role`. См. [здесь](/cloud/security/cloud-access-management/overview#initial-settings) для получения дополнительных сведений.
Пользователи также могут использовать `GRANT CURRENT GRANTS` в качестве пользователя по умолчанию, чтобы достичь аналогичных эффектов, как `ВСЕ`.
:::
### НИЧЕГО {#none}

Не предоставляет никаких привилегий.
### ПРАВО АДМИНИСТРАТОРА {#admin-option}

Привилегия `ПРАВО АДМИНИСТРАТОРА` позволяет пользователю предоставить свою роль другому пользователю.
