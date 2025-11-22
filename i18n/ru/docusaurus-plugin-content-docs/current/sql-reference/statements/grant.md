---
description: 'Документация по оператору GRANT'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'Оператор GRANT'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Оператор GRANT

- Предоставляет [привилегии](#privileges) учетным записям пользователей или ролям ClickHouse.
- Назначает роли учетным записям пользователей или другим ролям.

Чтобы отозвать привилегии, используйте оператор [REVOKE](../../sql-reference/statements/revoke.md). Также можно вывести список выданных привилегий с помощью оператора [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants).



## Синтаксис предоставления привилегий {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — тип привилегии.
- `role` — роль пользователя ClickHouse.
- `user` — учетная запись пользователя ClickHouse.

Конструкция `WITH GRANT OPTION` предоставляет пользователю `user` или роли `role` разрешение на выполнение запроса `GRANT`. Пользователи могут предоставлять привилегии той же или меньшей области действия, которой они обладают.
Конструкция `WITH REPLACE OPTION` заменяет старые привилегии новыми для пользователя `user` или роли `role`. Если она не указана, привилегии добавляются к существующим.


## Синтаксис назначения ролей {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — роль пользователя ClickHouse.
- `user` — учетная запись пользователя ClickHouse.

Секция `WITH ADMIN OPTION` предоставляет привилегию [ADMIN OPTION](#admin-option) пользователю `user` или роли `role`.
Секция `WITH REPLACE OPTION` заменяет старые роли новой ролью для пользователя `user` или роли `role`. Если секция не указана, роли добавляются к существующим.


## Синтаксис GRANT CURRENT GRANTS {#grant-current-grants-syntax}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — тип привилегии.
- `role` — роль пользователя ClickHouse.
- `user` — учетная запись пользователя ClickHouse.

Оператор `CURRENT GRANTS` позволяет предоставить все указанные привилегии заданному пользователю или роли.
Если привилегии не указаны, заданный пользователь или роль получит все доступные привилегии пользователя `CURRENT_USER`.


## Использование {#usage}

Для использования `GRANT` ваша учетная запись должна иметь привилегию `GRANT OPTION`. Вы можете предоставлять привилегии только в пределах привилегий вашей учетной записи.

Например, администратор предоставил привилегии учетной записи `john` с помощью запроса:

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

Это означает, что `john` имеет разрешение на выполнение:

- `SELECT x,y FROM db.table`.
- `SELECT x FROM db.table`.
- `SELECT y FROM db.table`.

`john` не может выполнить `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также недоступен. При обработке этого запроса ClickHouse не возвращает никаких данных, даже `x` и `y`. Единственное исключение — если таблица содержит только столбцы `x` и `y`. В этом случае ClickHouse возвращает все данные.

Также `john` имеет привилегию `GRANT OPTION`, поэтому он может предоставлять другим пользователям привилегии той же или меньшей области действия.

Доступ к базе данных `system` всегда разрешен (поскольку эта база данных используется для обработки запросов).

:::note
Хотя существует множество системных таблиц, к которым новые пользователи могут получить доступ по умолчанию, они могут не иметь доступа ко всем системным таблицам по умолчанию без предоставления привилегий.
Кроме того, доступ к некоторым системным таблицам, таким как `system.zookeeper`, ограничен для пользователей ClickHouse Cloud по соображениям безопасности.
:::

Вы можете предоставить несколько привилегий нескольким учетным записям в одном запросе. Запрос `GRANT SELECT, INSERT ON *.* TO john, robin` позволяет учетным записям `john` и `robin` выполнять запросы `INSERT` и `SELECT` для всех таблиц во всех базах данных на сервере.


## Подстановочные права доступа {#wildcard-grants}

При указании привилегий вы можете использовать звездочку (`*`) вместо имени таблицы или базы данных. Например, запрос `GRANT SELECT ON db.* TO john` позволяет пользователю `john` выполнять запрос `SELECT` ко всем таблицам в базе данных `db`.
Также вы можете опустить имя базы данных. В этом случае привилегии предоставляются для текущей базы данных.
Например, `GRANT SELECT ON * TO john` предоставляет привилегию на все таблицы в текущей базе данных, `GRANT SELECT ON mytable TO john` предоставляет привилегию на таблицу `mytable` в текущей базе данных.

:::note
Функциональность, описанная ниже, доступна начиная с версии ClickHouse 24.10.
:::

Вы также можете размещать звездочки в конце имени таблицы или базы данных. Эта возможность позволяет предоставлять привилегии на абстрактный префикс пути таблицы.
Пример: `GRANT SELECT ON db.my_tables* TO john`. Этот запрос позволяет пользователю `john` выполнять запрос `SELECT` ко всем таблицам базы данных `db` с префиксом `my_tables*`.

Дополнительные примеры:

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

Все вновь созданные таблицы в пределах предоставленных путей автоматически наследуют все права доступа от своих родительских элементов.
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

Привилегия — это разрешение, предоставляемое пользователю на выполнение определённых типов запросов.

Привилегии имеют иерархическую структуру, и набор разрешённых запросов зависит от области действия привилегии.

Иерархия привилегий в ClickHouse представлена ниже:


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
  * [`INTROSPECTION`](#introspection)
    * `addressToLine`
    * `addressToLineWithInlines`
    * `addressToSymbol`
    * `demangle`
  * `KILL QUERY`
  * `KILL TRANSACTION`
  * `ПЕРЕМЕЩЕНИЕ РАЗДЕЛА МЕЖДУ ШАРДАМИ`
  * [`АДМИНИСТРАТОР ИМЕНОВАННЫХ КОЛЛЕКЦИЙ`](#named-collection-admin)
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

Примеры работы с этой иерархией:

- Привилегия `ALTER` включает все остальные привилегии `ALTER*`.
- `ALTER CONSTRAINT` включает привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

Привилегии применяются на разных уровнях. Уровень определяет доступный синтаксис для привилегии.

Уровни (от низшего к высшему):

- `COLUMN` — привилегия может быть предоставлена для столбца, таблицы, базы данных или глобально.
- `TABLE` — привилегия может быть предоставлена для таблицы, базы данных или глобально.
- `VIEW` — привилегия может быть предоставлена для представления, базы данных или глобально.
- `DICTIONARY` — привилегия может быть предоставлена для словаря, базы данных или глобально.
- `DATABASE` — привилегия может быть предоставлена для базы данных или глобально.
- `GLOBAL` — привилегия может быть предоставлена только глобально.
- `GROUP` — группирует привилегии разных уровней. При предоставлении привилегии уровня `GROUP` предоставляются только те привилегии из группы, которые соответствуют используемому синтаксису.

Примеры допустимого синтаксиса:

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

Примеры недопустимого синтаксиса:

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

Специальная привилегия [ALL](#all) предоставляет все привилегии учетной записи пользователя или роли.

По умолчанию учетная запись пользователя или роль не имеет привилегий.

Если у пользователя или роли нет привилегий, это отображается как привилегия [NONE](#none).

Некоторые запросы по своей реализации требуют набор привилегий. Например, для выполнения запроса [RENAME](../../sql-reference/statements/optimize.md) необходимы следующие привилегии: `SELECT`, `CREATE TABLE`, `INSERT` и `DROP TABLE`.

### SELECT {#select}

Позволяет выполнять запросы [SELECT](../../sql-reference/statements/select/index.md).

Уровень привилегии: `COLUMN`.

**Описание**

Пользователь с этой привилегией может выполнять запросы `SELECT` для указанного списка столбцов в указанной таблице и базе данных. Если пользователь включает в запрос другие столбцы, кроме указанных, запрос не возвращает данных.

Рассмотрим следующую привилегию:

```sql
GRANT SELECT(x,y) ON db.table TO john
```

Эта привилегия позволяет `john` выполнять любой запрос `SELECT`, который обращается к данным из столбцов `x` и/или `y` в `db.table`, например `SELECT x FROM db.table`. `john` не может выполнить `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также недоступен. При обработке этого запроса ClickHouse не возвращает никаких данных, даже из столбцов `x` и `y`. Единственное исключение — если таблица содержит только столбцы `x` и `y`, в этом случае ClickHouse возвращает все данные.

### INSERT {#insert}

Позволяет выполнять запросы [INSERT](../../sql-reference/statements/insert-into.md).

Уровень привилегии: `COLUMN`.

**Описание**

Пользователь с этой привилегией может выполнять запросы `INSERT` для указанного списка столбцов в указанной таблице и базе данных. Если пользователь включает в запрос другие столбцы, кроме указанных, запрос не вставляет никаких данных.

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
  - `ALTER VIEW`. Уровень: `GROUP`
  - `ALTER VIEW REFRESH`. Уровень: `VIEW`. Псевдонимы: `REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`. Уровень: `VIEW`. Псевдонимы: `ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`. Уровень: `VIEW`. Псевдонимы: `ALTER TABLE MODIFY SQL SECURITY`

Примеры работы с этой иерархией:

- Привилегия `ALTER` включает в себя все остальные привилегии `ALTER*`.
- `ALTER CONSTRAINT` включает в себя привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

**Примечания**

- Привилегия `MODIFY SETTING` позволяет изменять настройки движка таблицы. Она не влияет на настройки или параметры конфигурации сервера.
- Для операции `ATTACH` требуется привилегия [CREATE](#create).
- Для операции `DETACH` требуется привилегия [DROP](#drop).
- Чтобы остановить мутацию с помощью запроса [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation), необходимо иметь привилегию на запуск этой мутации. Например, чтобы остановить запрос `ALTER UPDATE`, требуется привилегия `ALTER UPDATE`, `ALTER TABLE` или `ALTER`.

### BACKUP {#backup}

Разрешает выполнение [`BACKUP`] в запросах. Дополнительную информацию о резервном копировании см. в разделе [«Резервное копирование и восстановление»](../../operations/backup.md).

### CREATE {#create}

Разрешает выполнение DDL-запросов [CREATE](../../sql-reference/statements/create/index.md) и [ATTACH](../../sql-reference/statements/attach.md) в соответствии со следующей иерархией привилегий:

- `CREATE`. Уровень: `GROUP`
  - `CREATE DATABASE`. Уровень: `DATABASE`
  - `CREATE TABLE`. Уровень: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`. Уровень: `GLOBAL`
      - `CREATE TEMPORARY TABLE`. Уровень: `GLOBAL`
  - `CREATE VIEW`. Уровень: `VIEW`
  - `CREATE DICTIONARY`. Уровень: `DICTIONARY`

**Примечания**

- Для удаления созданной таблицы пользователю требуется привилегия [DROP](#drop).

### CLUSTER {#cluster}

Разрешает выполнение запросов `ON CLUSTER`.


```sql title="Синтаксис"
GRANT CLUSTER ON *.* TO <username>
```

По умолчанию для выполнения запросов с `ON CLUSTER` пользователю требуется привилегия `CLUSTER`.
При попытке использовать `ON CLUSTER` в запросе без предварительного предоставления привилегии `CLUSTER` вы получите следующую ошибку:

```text
Недостаточно привилегий. Для выполнения этого запроса необходимо иметь привилегию CLUSTER ON *.*.
```

Поведение по умолчанию можно изменить, установив параметр `on_cluster_queries_require_cluster_grant`
в секции `access_control_improvements` файла `config.xml` (см. ниже) в значение `false`.

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

**Примечания**

Пользователь имеет привилегию `SHOW`, если у него есть любая другая привилегия, относящаяся к указанной таблице, словарю или базе данных.

### KILL QUERY {#kill-query}

Позволяет выполнять запросы [KILL](../../sql-reference/statements/kill.md#kill-query) в соответствии со следующей иерархией привилегий:

Уровень привилегии: `GLOBAL`.

**Примечания**

Привилегия `KILL QUERY` позволяет одному пользователю завершать запросы других пользователей.

### ACCESS MANAGEMENT {#access-management}

Позволяет пользователю выполнять запросы для управления пользователями, ролями и политиками строк.


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

Привилегия `ROLE ADMIN` позволяет пользователю назначать и отзывать любые роли, включая те, которые не были назначены пользователю с правами администратора.

### SYSTEM {#system}

Позволяет пользователю выполнять запросы [SYSTEM](../../sql-reference/statements/system.md) согласно следующей иерархии привилегий.


- `SYSTEM`. Level: `GROUP`
  - `SYSTEM SHUTDOWN`. Level: `GLOBAL`. Aliases: `SYSTEM KILL`, `SHUTDOWN`
  - `SYSTEM DROP CACHE`. Aliases: `DROP CACHE`
    - `SYSTEM DROP DNS CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
    - `SYSTEM DROP MARK CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
    - `SYSTEM DROP UNCOMPRESSED CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
  - `SYSTEM RELOAD`. Level: `GROUP`
    - `SYSTEM RELOAD CONFIG`. Level: `GLOBAL`. Aliases: `RELOAD CONFIG`
    - `SYSTEM RELOAD DICTIONARY`. Level: `GLOBAL`. Aliases: `SYSTEM RELOAD DICTIONARIES`, `RELOAD DICTIONARY`, `RELOAD DICTIONARIES`
      - `SYSTEM RELOAD EMBEDDED DICTIONARIES`. Level: `GLOBAL`. Aliases: `RELOAD EMBEDDED DICTIONARIES`
  - `SYSTEM MERGES`. Level: `TABLE`. Aliases: `SYSTEM STOP MERGES`, `SYSTEM START MERGES`, `STOP MERGES`, `START MERGES`
  - `SYSTEM TTL MERGES`. Level: `TABLE`. Aliases: `SYSTEM STOP TTL MERGES`, `SYSTEM START TTL MERGES`, `STOP TTL MERGES`, `START TTL MERGES`
  - `SYSTEM FETCHES`. Level: `TABLE`. Aliases: `SYSTEM STOP FETCHES`, `SYSTEM START FETCHES`, `STOP FETCHES`, `START FETCHES`
  - `SYSTEM MOVES`. Level: `TABLE`. Aliases: `SYSTEM STOP MOVES`, `SYSTEM START MOVES`, `STOP MOVES`, `START MOVES`
  - `SYSTEM SENDS`. Level: `GROUP`. Aliases: `SYSTEM STOP SENDS`, `SYSTEM START SENDS`, `STOP SENDS`, `START SENDS`
    - `SYSTEM DISTRIBUTED SENDS`. Level: `TABLE`. Aliases: `SYSTEM STOP DISTRIBUTED SENDS`, `SYSTEM START DISTRIBUTED SENDS`, `STOP DISTRIBUTED SENDS`, `START DISTRIBUTED SENDS`
    - `SYSTEM REPLICATED SENDS`. Level: `TABLE`. Aliases: `SYSTEM STOP REPLICATED SENDS`, `SYSTEM START REPLICATED SENDS`, `STOP REPLICATED SENDS`, `START REPLICATED SENDS`
  - `SYSTEM REPLICATION QUEUES`. Level: `TABLE`. Aliases: `SYSTEM STOP REPLICATION QUEUES`, `SYSTEM START REPLICATION QUEUES`, `STOP REPLICATION QUEUES`, `START REPLICATION QUEUES`
  - `SYSTEM SYNC REPLICA`. Level: `TABLE`. Aliases: `SYNC REPLICA`
  - `SYSTEM RESTART REPLICA`. Level: `TABLE`. Aliases: `RESTART REPLICA`
  - `SYSTEM FLUSH`. Level: `GROUP`
    - `SYSTEM FLUSH DISTRIBUTED`. Level: `TABLE`. Aliases: `FLUSH DISTRIBUTED`
    - `SYSTEM FLUSH LOGS`. Level: `GLOBAL`. Aliases: `FLUSH LOGS`

Привилегия `SYSTEM RELOAD EMBEDDED DICTIONARIES` неявно предоставляется привилегией `SYSTEM RELOAD DICTIONARY ON *.*`.

### INTROSPECTION {#introspection}

Разрешает использование функций [интроспекции](../../operations/optimizing-performance/sampling-query-profiler.md).

- `INTROSPECTION`. Level: `GROUP`. Aliases: `INTROSPECTION FUNCTIONS`
  - `addressToLine`. Level: `GLOBAL`
  - `addressToLineWithInlines`. Level: `GLOBAL`
  - `addressToSymbol`. Level: `GLOBAL`
  - `demangle`. Level: `GLOBAL`

### SOURCES {#sources}

Разрешает использование внешних источников данных. Применяется к [движкам таблиц](../../engines/table-engines/index.md) и [табличным функциям](/sql-reference/table-functions).

- `READ`. Level: `GLOBAL_WITH_PARAMETER`
- `WRITE`. Level: `GLOBAL_WITH_PARAMETER`

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
Разделение привилегий READ/WRITE для источников доступно начиная с версии 25.7 и только при включенной серверной настройке
`access_control_improvements.enable_read_write_grants`

В противном случае следует использовать синтаксис `GRANT AZURE ON *.* TO user`, который эквивалентен новому `GRANT READ, WRITE ON AZURE TO user`
:::

Примеры:

- Для создания таблицы с [движком таблиц MySQL](../../engines/table-engines/integrations/mysql.md) требуются привилегии `CREATE TABLE (ON db.table_name)` и `MYSQL`.
- Для использования [табличной функции mysql](../../sql-reference/table-functions/mysql.md) требуются привилегии `CREATE TEMPORARY TABLE` и `MYSQL`.

### Привилегии с фильтрацией источников {#source-filter-grants}

:::note
Эта функция доступна начиная с версии 25.8 и только при включенной серверной настройке
`access_control_improvements.enable_read_write_grants`
:::

Можно предоставить доступ к конкретным URI источников, используя фильтры на основе регулярных выражений. Это позволяет осуществлять детальный контроль над тем, к каким внешним источникам данных пользователи могут получить доступ.

**Синтаксис:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

Эта привилегия позволит пользователю читать только из URI S3, соответствующих указанному шаблону регулярного выражения.

**Примеры:**

Предоставление доступа к конкретным путям в корзине S3:

```sql
-- Разрешить пользователю читать только из путей s3://foo/
GRANT READ ON S3('s3://foo/.*') TO john

-- Разрешить пользователю читать файлы по определенным шаблонам
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- Одному пользователю можно предоставить несколько фильтров
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
Фильтр источника принимает **regexp** в качестве параметра, поэтому привилегия
`GRANT READ ON URL('http://www.google.com') TO john;`

разрешит запросы

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

потому что `.` интерпретируется как `любой одиночный символ` в регулярных выражениях.
Это может привести к потенциальной уязвимости. Правильная привилегия должна быть

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**Повторное предоставление с GRANT OPTION:**

Если исходная привилегия имеет `WITH GRANT OPTION`, её можно повторно предоставить с помощью `GRANT CURRENT GRANTS`:

```sql
-- Исходная привилегия с GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- Теперь John может повторно предоставить этот доступ другим
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**Важные ограничения:**

- **Частичный отзыв не допускается:** Нельзя отозвать подмножество предоставленного шаблона фильтра. При необходимости нужно отозвать всю привилегию целиком и предоставить её заново с новыми шаблонами.
- **Привилегии с подстановочными знаками не допускаются:** Нельзя использовать `GRANT READ ON *('regexp')` или аналогичные шаблоны только с подстановочными знаками. Необходимо указать конкретный источник.

### dictGet {#dictget}

- `dictGet`. Псевдонимы: `dictHas`, `dictGetHierarchy`, `dictIsIn`

Позволяет пользователю выполнять функции [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull), [dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas), [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy), [dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin).

Уровень привилегии: `DICTIONARY`.

**Примеры**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

Позволяет пользователю просматривать секреты в запросах `SHOW` и `SELECT`, если включены как
[серверная настройка `display_secrets_in_show_and_select`](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select),
так и
[настройка формата `format_display_secrets_in_show_and_select`](../../operations/settings/formats#format_display_secrets_in_show_and_select).

### NAMED COLLECTION ADMIN {#named-collection-admin}

Позволяет выполнять определенную операцию над указанной именованной коллекцией. До версии 23.7 эта привилегия называлась NAMED COLLECTION CONTROL, а после версии 23.7 была добавлена NAMED COLLECTION ADMIN, при этом NAMED COLLECTION CONTROL сохранена в качестве псевдонима.


- `NAMED COLLECTION ADMIN`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

В отличие от всех остальных привилегий (CREATE, DROP, ALTER, SHOW), привилегия NAMED COLLECTION была добавлена только в версии 23.7, в то время как остальные были добавлены ранее — в версии 22.12.

**Примеры**

Предположим, что именованная коллекция называется abc. Предоставим привилегию CREATE NAMED COLLECTION пользователю john.

- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

Позволяет использовать указанный движок таблицы при её создании. Применяется к [движкам таблиц](../../engines/table-engines/index.md).

**Примеры**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge />

Предоставляет все привилегии на регулируемую сущность учётной записи пользователя или роли.

:::note
Привилегия `ALL` не поддерживается в ClickHouse Cloud, где пользователь `default` имеет ограниченные права. Пользователи могут предоставить максимальные права другому пользователю, назначив роль `default_role`. Подробнее см. [здесь](/cloud/security/manage-cloud-users).
Пользователи также могут использовать `GRANT CURRENT GRANTS` от имени пользователя default для достижения эффекта, аналогичного `ALL`.
:::

### NONE {#none}

Не предоставляет никаких привилегий.

### ADMIN OPTION {#admin-option}

Привилегия `ADMIN OPTION` позволяет пользователю предоставлять свою роль другому пользователю.
