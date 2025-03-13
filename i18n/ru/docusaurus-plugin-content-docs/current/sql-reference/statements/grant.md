---
slug: /sql-reference/statements/grant
sidebar_position: 38
sidebar_label: 'GRANT'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# Оператор GRANT

- Предоставляет [привилегии](#privileges) учетным записям пользователей или ролям ClickHouse.
- Назначает роли учетным записям пользователей или другим ролям.

Для отзыва привилегий используйте оператор [REVOKE](../../sql-reference/statements/revoke.md). Также вы можете перечислить предоставленные привилегии с помощью оператора [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants).
## Синтаксис предоставления привилегий {#granting-privilege-syntax}

``` sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — Тип привилегии.
- `role` — Роль пользователя ClickHouse.
- `user` — Учетная запись пользователя ClickHouse.

Клауза `WITH GRANT OPTION` предоставляет `user` или `role` разрешение выполнять запрос `GRANT`. Пользователи могут предоставлять привилегии того же объема, что и у них, и меньше.
Клауза `WITH REPLACE OPTION` заменяет старые привилегии новыми привилегиями для `user` или `role`, если она не указана, то добавляет привилегии.
## Синтаксис назначения роли {#assigning-role-syntax}

``` sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — Роль пользователя ClickHouse.
- `user` — Учетная запись пользователя ClickHouse.

Клауза `WITH ADMIN OPTION` предоставляет привилегию [ADMIN OPTION](#admin-option) для `user` или `role`.
Клауза `WITH REPLACE OPTION` заменяет старые роли новыми ролями для `user` или `role`, если она не указана, то добавляет роли.
## Синтаксис Grant Current Grants {#grant-current-grants-syntax}
``` sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

-   `privilege` — Тип привилегии.
-   `role` — Роль пользователя ClickHouse.
-   `user` — Учетная запись пользователя ClickHouse.

Использование оператора `CURRENT GRANTS` позволяет предоставить все указанные привилегии заданному пользователю или роли.
Если ни одна из привилегий не была указана, заданный пользователь или роль получат все доступные привилегии для `CURRENT_USER`.
## Использование {#usage}

Для использования `GRANT` ваша учетная запись должна иметь привилегию `GRANT OPTION`. Привилегии можно предоставлять только в рамках ваших учетных прав.

Например, администратор предоставил привилегии учетной записи `john` с помощью запроса:

``` sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

Это означает, что `john` имеет право выполнять:

- `SELECT x,y FROM db.table`.
- `SELECT x FROM db.table`.
- `SELECT y FROM db.table`.

`john` не может выполнить `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также недоступен. Обрабатывая этот запрос, ClickHouse не возвращает никаких данных, даже `x` и `y`. Единственное исключение — если таблица содержит только колонки `x` и `y`. В этом случае ClickHouse возвращает все данные.

Также у `john` есть привилегия `GRANT OPTION`, поэтому он может предоставлять другим пользователям привилегии того же или меньшего объема.

Доступ к базе данных `system` всегда разрешён (так как эта база данных используется для обработки запросов).

Вы можете предоставить несколько привилегий нескольким учетным записям за один запрос. Запрос `GRANT SELECT, INSERT ON *.* TO john, robin` позволяет учетным записям `john` и `robin` выполнять запросы `INSERT` и `SELECT` ко всем таблицам во всех базах данных на сервере.
## Групповые привилегии {#wildcard-grants}

При указании привилегий вы можете использовать звездочку (`*`) вместо имени таблицы или базы данных. Например, запрос `GRANT SELECT ON db.* TO john` позволяет `john` выполнять запрос `SELECT` ко всем таблицам в базе данных `db`.
Также вы можете опустить имя базы данных. В этом случае привилегии предоставляются для текущей базы данных.
Например, `GRANT SELECT ON * TO john` предоставляет привилегию на все таблицы в текущей базе данных, `GRANT SELECT ON mytable TO john` предоставляет привилегию для таблицы `mytable` в текущей базе данных.

:::note
Функция, описанная ниже, доступна начиная с версии ClickHouse 24.10.
:::

Вы также можете добавлять звездочки в конце имени таблицы или базы данных. Эта функция позволяет предоставлять привилегии на абстрактный префикс пути таблицы.
Пример: `GRANT SELECT ON db.my_tables* TO john`. Этот запрос позволяет `john` выполнять запрос `SELECT` ко всем таблицам базы данных `db`, префикс которых `my_tables*`.

Больше примеров:

`GRANT SELECT ON db.my_tables* TO john`
```sql
SELECT * FROM db.my_tables -- привилегия предоставлена
SELECT * FROM db.my_tables_0 -- привилегия предоставлена
SELECT * FROM db.my_tables_1 -- привилегия предоставлена

SELECT * FROM db.other_table -- привилегия не предоставлена
SELECT * FROM db2.my_tables -- привилегия не предоставлена
```

`GRANT SELECT ON db*.* TO john`
```sql
SELECT * FROM db.my_tables -- привилегия предоставлена
SELECT * FROM db.my_tables_0 -- привилегия предоставлена
SELECT * FROM db.my_tables_1 -- привилегия предоставлена
SELECT * FROM db.other_table -- привилегия предоставлена
SELECT * FROM db2.my_tables -- привилегия предоставлена
```

Все вновь созданные таблицы в предоставленных путях автоматически унаследуют все привилегии от своих родительских таблиц.
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

Привилегия — это разрешение, предоставляемое пользователю для выполнения определенных видов запросов.

Привилегии имеют иерархическую структуру, а набор допустимых запросов зависит от объема привилегии.

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
            - `SYSTEM RELOAD ASYNCHRONOUS METРIКS`
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

- Привилегия `ALTER` включает все остальные привилегии `ALTER*`.
- `ALTER CONSTRAINT` включает привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

Привилегии применяются на разных уровнях. Знание уровня подразумевает синтаксис, доступный для привилегии.

Уровни (от низшего к высшему):

- `COLUMN` — Привилегия может быть предоставлена для колонки, таблицы, базы данных или глобально.
- `TABLE` — Привилегия может быть предоставлена для таблицы, базы данных или глобально.
- `VIEW` — Привилегия может быть предоставлена для представления, базы данных или глобально.
- `DICTIONARY` — Привилегия может быть предоставлена для словаря, базы данных или глобально.
- `DATABASE` — Привилегия может быть предоставлена для базы данных или глобально.
- `GLOBAL` — Привилегия может быть предоставлена только глобально.
- `GROUP` — Группирует привилегии различных уровней. Когда привилегия уровня `GROUP` предоставляется, только привилегии из группы, которые соответствуют использованному синтаксису, предоставляются.

Примеры допустимого синтаксиса:

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

Примеры недопустимого синтаксиса:

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

Специальная привилегия [ALL](#all) предоставляет все привилегии учетной записи пользователя или роли.

По умолчанию учетная запись пользователя или роль не имеют привилегий.

Если у пользователя или роли нет привилегий, это отображается как привилегия [NONE](#none).

Некоторые запросы из-за их реализации требуют набора привилегий. Например, для выполнения запроса [RENAME](../../sql-reference/statements/optimize.md) вам нужны следующие привилегии: `SELECT`, `CREATE TABLE`, `INSERT` и `DROP TABLE`.
### SELECT {#select}

Позволяет выполнять запросы [SELECT](../../sql-reference/statements/select/index.md).

Уровень привилегий: `COLUMN`.

**Описание**

Пользователь, которому предоставлена эта привилегия, может выполнять запросы `SELECT` по указанному списку колонок в указанной таблице и базе данных. Если пользователь включает другие колонки, то указанный запрос не возвращает никаких данных.

Рассмотрим следующую привилегию:

``` sql
GRANT SELECT(x,y) ON db.table TO john
```

Эта привилегия позволяет `john` выполнять любой запрос `SELECT`, который касается данных из колонок `x` и/или `y` в `db.table`, например, `SELECT x FROM db.table`. `john` не может выполнить `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также недоступен. Обрабатывая этот запрос, ClickHouse не возвращает никаких данных, даже `x` и `y`. Единственное исключение — если таблица содержит только колонки `x` и `y`, в этом случае ClickHouse возвращает все данные.
### INSERT {#insert}

Позволяет выполнять запросы [INSERT](../../sql-reference/statements/insert-into.md).

Уровень привилегий: `COLUMN`.

**Описание**

Пользователь, которому предоставлена эта привилегия, может выполнять запросы `INSERT` для указанного списка колонок в указанной таблице и базе данных. Если пользователь включает другие колонки, то указанный запрос не вставляет никаких данных.

**Пример**

``` sql
GRANT INSERT(x,y) ON db.table TO john
```

Предоставленная привилегия позволяет `john` вставлять данные в колонки `x` и/или `y` в `db.table`.
### ALTER {#alter}

Позволяет выполнять запросы [ALTER](../../sql-reference/statements/alter/index.md) в соответствии с следующей иерархией привилегий:

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

**Примечания**

- Привилегия `MODIFY SETTING` позволяет изменять настройки движка таблицы. Она не влияет на настройки или параметры конфигурации сервера.
- Операция `ATTACH` требует привилегию [CREATE](#create).
- Операция `DETACH` требует привилегию [DROP](#drop).
- Для завершения мутации с помощью запроса [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) вам нужно иметь привилегию на запуск этой мутации. Например, если вы хотите остановить запрос `ALTER UPDATE`, вам нужна привилегия `ALTER UPDATE`, `ALTER TABLE` или `ALTER`.
### BACKUP {#backup}

Позволяет выполнение запросов [`BACKUP`]. Дополнительную информацию о резервных копиях смотрите в разделе ["Резервное копирование и восстановление"](../../operations/backup.md).
### CREATE {#create}

Позволяет выполнять запросы [CREATE](../../sql-reference/statements/create/index.md) и [ATTACH](../../sql-reference/statements/attach.md) DDL в соответствии со следующей иерархией привилегий:

- `CREATE`. Уровень: `GROUP`
    - `CREATE DATABASE`. Уровень: `DATABASE`
    - `CREATE TABLE`. Уровень: `TABLE`
        - `CREATE ARBITRARY TEMPORARY TABLE`. Уровень: `GLOBAL`
            - `CREATE TEMPORARY TABLE`. Уровень: `GLOBAL`
    - `CREATE VIEW`. Уровень: `VIEW`
    - `CREATE DICTIONARY`. Уровень: `DICTIONARY`

**Примечания**

- Чтобы удалить созданную таблицу, пользователю нужны привилегии [DROP](#drop).
### CLUSTER {#cluster}

Позволяет выполнять запросы `ON CLUSTER`.

```sql title="Синтаксис"
GRANT CLUSTER ON *.* TO <username>
```

По умолчанию запросы с `ON CLUSTER` требуют от пользователя наличия привилегии `CLUSTER`.
Вы получите следующую ошибку, если попытаться использовать `ON CLUSTER` в запросе без предварительной выдачи привилегии `CLUSTER`:

```text
Недостаточно привилегий. Для выполнения этого запроса необходимо иметь привилегию CLUSTER ON *.*. 
```

Оповедение по умолчанию может быть изменено установкой значения параметра `on_cluster_queries_require_cluster_grant` 
в разделе `access_control_improvements` в `config.xml` (см. ниже) в `false`.

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

Уровень привилегий: `TABLE`.
### OPTIMIZE {#optimize}

Позволяет выполнять запросы [OPTIMIZE TABLE](../../sql-reference/statements/optimize.md).

Уровень привилегий: `TABLE`.
### SHOW {#show}

Позволяет выполнять запросы `SHOW`, `DESCRIBE`, `USE` и `EXISTS` в соответствии с следующей иерархией привилегий:

- `SHOW`. Уровень: `GROUP`
    - `SHOW DATABASES`. Уровень: `DATABASE`. Позволяет выполнять запросы `SHOW DATABASES`, `SHOW CREATE DATABASE`, `USE <database>`.
    - `SHOW TABLES`. Уровень: `TABLE`. Позволяет выполнять запросы `SHOW TABLES`, `EXISTS <table>`, `CHECK <table>`.
    - `SHOW COLUMNS`. Уровень: `COLUMN`. Позволяет выполнять запросы `SHOW CREATE TABLE`, `DESCRIBE`.
    - `SHOW DICTIONARIES`. Уровень: `DICTIONARY`. Позволяет выполнять запросы `SHOW DICTIONARIES`, `SHOW CREATE DICTIONARY`, `EXISTS <dictionary>`.

**Примечания**

У пользователя есть привилегия `SHOW`, если он имеет любую другую привилегию, касающуюся указанной таблицы, словаря или базы данных.
### KILL QUERY {#kill-query}

Позволяет выполнять запросы [KILL](../../sql-reference/statements/kill.md#kill-query) в соответствии с следующей иерархией привилегий:

Уровень привилегий: `GLOBAL`.

**Примечания**

Привилегия `KILL QUERY` позволяет одному пользователю завершать запросы других пользователей.
### УПРАВЛЕНИЕ ДОСТУПОМ {#access-management}

Позволяет пользователю выполнять запросы, которые управляют пользователями, ролями и политиками строк.

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

Привилегия `ROLE ADMIN` позволяет пользователю назначать и отзывать любые роли, включая те, которые не назначены пользователю с опцией администратора.
### СИСТЕМА {#system}

Позволяет пользователю выполнять запросы [SYSTEM](../../sql-reference/statements/system.md) в соответствии со следующей иерархией привилегий.

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

Позволяет использовать внешние источники данных. Применяется к [движкам таблиц](../../engines/table-engines/index.md) и [функциям таблиц](/sql-reference/table-functions).

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

Привилегия `SOURCES` позволяет использовать все источники. Также вы можете предоставить привилегию для каждого источника отдельно. Для использования источников вам нужны дополнительные привилегии.

Примеры:

- Чтобы создать таблицу с помощью [MySQL table engine](../../engines/table-engines/integrations/mysql.md), вам нужны привилегии `CREATE TABLE (ON db.table_name)` и `MYSQL`.
- Чтобы использовать [mysql table function](../../sql-reference/table-functions/mysql.md), вам нужны привилегии `CREATE TEMPORARY TABLE` и `MYSQL`.
### dictGet {#dictget}

- `dictGet`. Псевдонимы: `dictHas`, `dictGetHierarchy`, `dictIsIn`

Позволяет пользователю выполнять [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull), [dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas), [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy), [dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) функции.

Уровень привилегий: `DICTIONARY`.

**Примеры**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`
### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

Позволяет пользователю просматривать секреты в запросах `SHOW` и `SELECT`, если оба
[`display_secrets_in_show_and_select` параметр сервера](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
и
[`format_display_secrets_in_show_and_select` параметр формата](../../operations/settings/formats#format_display_secrets_in_show_and_select)
включены.
### УПРАВЛЕНИЕ ИМЕННОЙ КОЛЛЕКЦИЕЙ {#named-collection-admin}

Позволяет выполнять определенные операции с заданной именованной коллекцией. До версии 23.7 это называлось УПРАВЛЕНИЕ ИМЕННОЙ КОЛЛЕКЦИЕЙ, а после 23.7 было добавлено УПРАВЛЕНИЕ ИМЕННОЙ КОЛЛЕКЦИЕЙ, и УПРАВЛЕНИЕ ИМЕННОЙ КОЛЛЕКЦИЕЙ сохранено как синоним.

- `УПРАВЛЕНИЕ ИМЕННОЙ КОЛЛЕКЦИЕЙ`. Уровень: `NAMED_COLLECTION`. Синонимы: `УПРАВЛЕНИЕ ИМЕННОЙ КОЛЛЕКЦИЕЙ`
    - `СОЗДАТЬ ИМЕННУЮ КОЛЛЕКЦИЮ`. Уровень: `NAMED_COLLECTION`
    - `УДАЛИТЬ ИМЕННУЮ КОЛЛЕКЦИЮ`. Уровень: `NAMED_COLLECTION`
    - `ИЗМЕНИТЬ ИМЕННУЮ КОЛЛЕКЦИЮ`. Уровень: `NAMED_COLLECTION`
    - `ПОКАЗАТЬ ИМЕННЫЕ КОЛЛЕКЦИИ`. Уровень: `NAMED_COLLECTION`. Синонимы: `ПОКАЗАТЬ ИМЕННЫЕ КОЛЛЕКЦИИ`
    - `ПОКАЗАТЬ СЕКРЕТЫ ИМЕННЫХ КОЛЛЕКЦИЙ`. Уровень: `NAMED_COLLECTION`. Синонимы: `ПОКАЗАТЬ СЕКРЕТЫ ИМЕННЫХ КОЛЛЕКЦИЙ`
    - `ИМЕННАЯ КОЛЛЕКЦИЯ`. Уровень: `NAMED_COLLECTION`. Синонимы: `ИСПОЛЬЗОВАНИЕ ИМЕННОЙ КОЛЛЕКЦИИ, ИСПОЛЬЗОВАТЬ ИМЕННУЮ КОЛЛЕКЦИЮ`

В отличие от всех других привилегий (СОЗДАТЬ, УДАЛИТЬ, ИЗМЕНИТЬ, ПОКАЗАТЬ) привилегия УПРАВЛЕНИЕ ИМЕННОЙ КОЛЛЕКЦИЕЙ была добавлена только в 23.7, тогда как все остальные были добавлены ранее - в 22.12.

**Примеры**

Предположим, что именованная коллекция называется abc, мы предоставим привилегию СОЗДАТЬ ИМЕННУЮ КОЛЛЕКЦИЮ пользователю john.
- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### ДВИГАТЕЛЬ ТАБЛИЦЫ {#table-engine}

Позволяет использовать указанный движок таблицы при создании таблицы. Применяется к [движкам таблиц](../../engines/table-engines/index.md).

**Примеры**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ВСЕ {#all}

<CloudNotSupportedBadge/>

Предоставляет все привилегии на регулируемый объект пользователю или роли.

:::note
Привилегия `ВСЕ` не поддерживается в ClickHouse Cloud, где у пользователя `default` ограниченные права. Пользователи могут предоставить максимальные права другому пользователю, предоставив роль `default_role`. Смотрите [здесь](/cloud/security/cloud-access-management/overview#initial-settings) для получения дополнительной информации.
Пользователи также могут использовать `GRANT CURRENT GRANTS` как пользователь по умолчанию, чтобы добиться аналогичных эффектов, как и `ВСЕ`.
:::

### НИКТО {#none}

Не предоставляет никаких привилегий.

### ПРАВО АДМИНИСТРАТОРА {#admin-option}

Привилегия `ПРАВО АДМИНИСТРАТОРА` позволяет пользователю передавать свою роль другому пользователю.
