---
description: 'Документация по оператору GRANT'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'Оператор GRANT'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Оператор GRANT {#grant-statement}

- Предоставляет [привилегии](#privileges) учетным записям пользователей ClickHouse или ролям.
- Назначает роли учетным записям пользователей или другим ролям.

Чтобы отозвать привилегии, используйте оператор [REVOKE](../../sql-reference/statements/revoke.md). Вы также можете просмотреть список предоставленных привилегий с помощью оператора [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants).



## Синтаксис предоставления прав {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER имя_кластера] привилегия[(имя_колонки [,...])] [,...] ON {бд.таблица[*]|бд[*].*|*.*|таблица[*]|*} TO {пользователь | роль | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — тип привилегии.
* `role` — роль пользователя ClickHouse.
* `user` — учетная запись пользователя ClickHouse.

Предложение `WITH GRANT OPTION` предоставляет `user` или `role` право на выполнение запроса `GRANT`. Пользователи могут предоставлять привилегии той же или более узкой области действия, чем их собственные.
Предложение `WITH REPLACE OPTION` заменяет старые привилегии новыми для `user` или `role`; если оно не указано, новые привилегии просто добавляются к существующим.


## Синтаксис назначения ролей {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

* `role` — роль пользователя в ClickHouse.
* `user` — учетная запись пользователя ClickHouse.

Оператор `WITH ADMIN OPTION` предоставляет привилегию [ADMIN OPTION](#admin-option) для `user` или `role`.
Оператор `WITH REPLACE OPTION` заменяет существующие роли новой ролью для `user` или `role`; если он не указан, новые роли просто добавляются.


## Синтаксис команды GRANT CURRENT GRANTS {#grant-current-grants-syntax}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — Тип привилегии.
* `role` — Роль пользователя ClickHouse.
* `user` — Учетная запись пользователя ClickHouse.

Использование оператора `CURRENT GRANTS` позволяет выдать все указанные привилегии заданному пользователю или роли.
Если ни одна привилегия не указана, то заданный пользователь или роль получит все доступные привилегии для `CURRENT_USER`.


## Использование {#usage}

Чтобы использовать `GRANT`, ваша учётная запись должна иметь право `GRANT OPTION`. Вы можете предоставлять привилегии только в пределах собственных прав вашей учётной записи.

Например, администратор предоставил привилегии учётной записи `john` следующим запросом:

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

Это означает, что у `john` есть привилегия выполнять:

* `SELECT x,y FROM db.table`.
* `SELECT x FROM db.table`.
* `SELECT y FROM db.table`.

`john` не может выполнять `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также ему недоступен. При обработке этого запроса ClickHouse не возвращает никаких данных, даже `x` и `y`. Единственное исключение — если таблица содержит только столбцы `x` и `y`. В этом случае ClickHouse возвращает все данные.

Также у `john` есть привилегия `GRANT OPTION`, поэтому он может выдавать другим пользователям привилегии того же или меньшего объёма.

Доступ к базе данных `system` всегда разрешён (так как эта база данных используется для обработки запросов).

:::note
Хотя существует много системных таблиц, к которым новые пользователи по умолчанию имеют доступ, без явной выдачи привилегий они могут не иметь доступа ко всем системным таблицам.
Кроме того, доступ к некоторым системным таблицам, таким как `system.zookeeper`, ограничен для пользователей ClickHouse Cloud по соображениям безопасности.
:::

Вы можете выдать несколько привилегий нескольким учётным записям в одном запросе. Запрос `GRANT SELECT, INSERT ON *.* TO john, robin` позволяет учётным записям `john` и `robin` выполнять запросы `INSERT` и `SELECT` для всех таблиц во всех базах данных на сервере.


## Привилегии с подстановками {#wildcard-grants}

При указании привилегий вы можете использовать звёздочку (`*`) вместо имени таблицы или базы данных. Например, запрос `GRANT SELECT ON db.* TO john` позволяет пользователю `john` выполнять запрос `SELECT` для всех таблиц в базе данных `db`.
Также можно опустить имя базы данных. В этом случае привилегии выдаются для текущей базы данных.
Например, `GRANT SELECT ON * TO john` выдаёт привилегию на все таблицы в текущей базе данных, а `GRANT SELECT ON mytable TO john` — привилегию на таблицу `mytable` в текущей базе данных.

:::note
Функциональность, описанная ниже, доступна начиная с версии ClickHouse 24.10.
:::

Вы также можете использовать звёздочку в конце имени таблицы или базы данных. Эта возможность позволяет выдавать привилегии по абстрактному префиксу имени таблицы.
Пример: `GRANT SELECT ON db.my_tables* TO john`. Этот запрос позволяет пользователю `john` выполнять запрос `SELECT` для всех таблиц базы данных `db` с префиксом `my_tables*`.

Дополнительные примеры:

`GRANT SELECT ON db.my_tables* TO john`

```sql
SELECT * FROM db.my_tables -- разрешено
SELECT * FROM db.my_tables_0 -- разрешено
SELECT * FROM db.my_tables_1 -- разрешено

SELECT * FROM db.other_table -- запрещено
SELECT * FROM db2.my_tables -- запрещено
```

`GRANT SELECT ON db*.* TO john`

```sql
SELECT * FROM db.my_tables -- предоставлено
SELECT * FROM db.my_tables_0 -- предоставлено
SELECT * FROM db.my_tables_1 -- предоставлено
SELECT * FROM db.other_table -- предоставлено
SELECT * FROM db2.my_tables -- предоставлено
```

Все вновь создаваемые таблицы в рамках предоставленных путей автоматически наследуют все привилегии от своих родительских объектов.
Например, если вы выполните запрос `GRANT SELECT ON db.* TO john`, а затем создадите новую таблицу `db.new_table`, пользователь `john` сможет выполнить запрос `SELECT * FROM db.new_table`.

Вы можете указывать звёздочку **только** для префиксов:

```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- правильно

GRANT SELECT ON *.my_table TO john -- неправильно
GRANT SELECT ON foo*bar TO john -- неправильно
GRANT SELECT ON *suffix TO john -- неправильно
GRANT SELECT(foo) ON db.table* TO john -- неправильно
```


## Привилегии {#privileges}

Привилегия — это право, предоставляемое пользователю для выполнения определённых видов запросов.

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

Примеры обработки этой иерархии:

* Привилегия `ALTER` включает все остальные привилегии `ALTER*`.
* `ALTER CONSTRAINT` включает привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

Привилегии применяются на разных уровнях. Знание уровня определяет доступный для привилегии синтаксис.

Уровни (от нижнего к высшему):

* `COLUMN` — привилегия может быть выдана для столбца, таблицы, базы данных или глобально.
* `TABLE` — привилегия может быть выдана для таблицы, базы данных или глобально.
* `VIEW` — привилегия может быть выдана для представления, базы данных или глобально.
* `DICTIONARY` — привилегия может быть выдана для словаря, базы данных или глобально.
* `DATABASE` — привилегия может быть выдана для базы данных или глобально.
* `GLOBAL` — привилегия может быть выдана только глобально.
* `GROUP` — группирует привилегии разных уровней. Когда выдаётся привилегия уровня `GROUP`, выдаются только те привилегии из группы, которые соответствуют используемому синтаксису.

Примеры допустимого синтаксиса:

* `GRANT SELECT(x) ON db.table TO user`
* `GRANT SELECT ON db.* TO user`

Примеры недопустимого синтаксиса:

* `GRANT CREATE USER(x) ON db.table TO user`
* `GRANT CREATE USER ON db.* TO user`

Специальная привилегия [ALL](#all) предоставляет все привилегии учётной записи пользователя или роли.

По умолчанию учётная запись пользователя или роль не имеет привилегий.

Если пользователь или роль не имеет привилегий, это отображается как привилегия [NONE](#none).

Некоторые запросы по своей реализации требуют набора привилегий. Например, для выполнения запроса [RENAME](../../sql-reference/statements/optimize.md) требуются следующие привилегии: `SELECT`, `CREATE TABLE`, `INSERT` и `DROP TABLE`.

### SELECT {#select}

Разрешает выполнение запросов [SELECT](../../sql-reference/statements/select/index.md).

Уровень привилегии: `COLUMN`.

**Описание**

Пользователь, которому выдана эта привилегия, может выполнять запросы `SELECT` к заданному списку столбцов в указанной таблице и базе данных. Если пользователь включает другие столбцы, помимо указанных, запрос не возвращает данные.

Рассмотрим следующую привилегию:

```sql
GRANT SELECT(x,y) ON db.table TO john
```

Эта привилегия позволяет пользователю `john` выполнять любые запросы `SELECT`, которые затрагивают данные из столбцов `x` и/или `y` в `db.table`, например, `SELECT x FROM db.table`. `john` не может выполнять `SELECT z FROM db.table`. Запрос `SELECT * FROM db.table` также недоступен. При обработке такого запроса ClickHouse не возвращает никакие данные, даже `x` и `y`. Единственное исключение — если таблица содержит только столбцы `x` и `y`, в этом случае ClickHouse возвращает все данные.

### INSERT {#insert}

Позволяет выполнять запросы [INSERT](../../sql-reference/statements/insert-into.md).

Уровень привилегий: `COLUMN`.

**Описание**

Пользователь, которому выдана эта привилегия, может выполнять запросы `INSERT` над указанным списком столбцов в заданных таблице и базе данных. Если пользователь включает в запрос другие столбцы, помимо указанных, данные не вставляются.

**Пример**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

Предоставленная привилегия позволяет пользователю `john` вставлять данные в столбцы `x` и/или `y` в `db.table`.

### ALTER {#alter}

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

- Привилегия `ALTER` включает все остальные привилегии `ALTER*`.
- `ALTER CONSTRAINT` включает привилегии `ALTER ADD CONSTRAINT` и `ALTER DROP CONSTRAINT`.

**Примечания**

- Привилегия `MODIFY SETTING` позволяет изменять настройки движка таблицы. Она не влияет на настройки или параметры конфигурации сервера.
- Для операции `ATTACH` требуется привилегия [CREATE](#create).
- Для операции `DETACH` требуется привилегия [DROP](#drop).
- Чтобы остановить мутацию запросом [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation), необходимо иметь привилегию на запуск этой мутации. Например, если вы хотите остановить запрос `ALTER UPDATE`, вам нужна привилегия `ALTER UPDATE`, `ALTER TABLE` или `ALTER`.

### BACKUP {#backup}

Позволяет выполнять [`BACKUP`] в запросах. Дополнительную информацию о резервных копиях см. в разделе ["Резервное копирование и восстановление"](../../operations/backup.md).

### CREATE {#create}

Позволяет выполнять [CREATE](../../sql-reference/statements/create/index.md) и [ATTACH](../../sql-reference/statements/attach.md) DDL-запросы в соответствии со следующей иерархией привилегий:

- `CREATE`. Уровень: `GROUP`
  - `CREATE DATABASE`. Уровень: `DATABASE`
  - `CREATE TABLE`. Уровень: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`. Уровень: `GLOBAL`
      - `CREATE TEMPORARY TABLE`. Уровень: `GLOBAL`
  - `CREATE VIEW`. Уровень: `VIEW`
  - `CREATE DICTIONARY`. Уровень: `DICTIONARY`

**Примечания**

- Чтобы удалить созданную таблицу, пользователю нужна привилегия [DROP](#drop).

### CLUSTER {#cluster}

Позволяет выполнять запросы с `ON CLUSTER`.

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <имя_пользователя>
```

По умолчанию для запросов с `ON CLUSTER` требуется, чтобы у пользователя была привилегия `CLUSTER`.
Если вы попытаетесь использовать `ON CLUSTER` в запросе, не предоставив заранее привилегию `CLUSTER`, вы получите следующую ошибку:

```text
Недостаточно привилегий. Для выполнения этого запроса необходимо иметь право CLUSTER ON *.*. 
```

Поведение по умолчанию можно изменить, установив настройку `on_cluster_queries_require_cluster_grant`,
расположенную в разделе `access_control_improvements` файла `config.xml` (см. ниже), в значение `false`.

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP {#drop}

Позволяет выполнять запросы [DROP](../../sql-reference/statements/drop.md) и [DETACH](../../sql-reference/statements/detach.md) в соответствии со следующей иерархией привилегий:

* `DROP`. Уровень: `GROUP`
  * `DROP DATABASE`. Уровень: `DATABASE`
  * `DROP TABLE`. Уровень: `TABLE`
  * `DROP VIEW`. Уровень: `VIEW`
  * `DROP DICTIONARY`. Уровень: `DICTIONARY`

### TRUNCATE {#truncate}

Позволяет выполнять запросы [TRUNCATE](../../sql-reference/statements/truncate.md).

Уровень привилегии: `TABLE`.

### OPTIMIZE {#optimize}

Позволяет выполнять запросы [OPTIMIZE TABLE](../../sql-reference/statements/optimize.md).

Уровень привилегии: `TABLE`.

### SHOW {#show}

Позволяет выполнять запросы `SHOW`, `DESCRIBE`, `USE` и `EXISTS` в соответствии со следующей иерархией привилегий:

* `SHOW`. Уровень: `GROUP`
  * `SHOW DATABASES`. Уровень: `DATABASE`. Позволяет выполнять запросы `SHOW DATABASES`, `SHOW CREATE DATABASE`, `USE <database>`.
  * `SHOW TABLES`. Уровень: `TABLE`. Позволяет выполнять запросы `SHOW TABLES`, `EXISTS <table>`, `CHECK <table>`.
  * `SHOW COLUMNS`. Уровень: `COLUMN`. Позволяет выполнять запросы `SHOW CREATE TABLE`, `DESCRIBE`.
  * `SHOW DICTIONARIES`. Уровень: `DICTIONARY`. Позволяет выполнять запросы `SHOW DICTIONARIES`, `SHOW CREATE DICTIONARY`, `EXISTS <dictionary>`.

**Примечания**

Пользователь обладает привилегией `SHOW`, если у него есть какая-либо другая привилегия, относящаяся к указанной таблице, словарю или базе данных.

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

Привилегия `ROLE ADMIN` позволяет пользователю назначать и отзывать любые роли, включая те, которые не были назначены этому пользователю с опцией ADMIN.

### SYSTEM {#system}

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

Привилегия `SYSTEM RELOAD EMBEDDED DICTIONARIES` неявно предоставляется привилегией `SYSTEM RELOAD DICTIONARY ON *.*`.

### INTROSPECTION {#introspection}

Позволяет использовать функции [интроспекции](../../operations/optimizing-performance/sampling-query-profiler.md).

- `INTROSPECTION`. Уровень: `GROUP`. Синонимы: `INTROSPECTION FUNCTIONS`
  - `addressToLine`. Уровень: `GLOBAL`
  - `addressToLineWithInlines`. Уровень: `GLOBAL`
  - `addressToSymbol`. Уровень: `GLOBAL`
  - `demangle`. Уровень: `GLOBAL`

### SOURCES {#sources}

Позволяет использовать внешние источники данных. Применяется к [движкам таблиц](../../engines/table-engines/index.md) и [табличным функциям](/sql-reference/table-functions).

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
Разделение прав доступа READ/WRITE для источников доступно начиная с версии 25.7 и только при включённой настройке сервера
`access_control_improvements.enable_read_write_grants`

В противном случае следует использовать синтаксис `GRANT AZURE ON *.* TO user`, который эквивалентен новому `GRANT READ, WRITE ON AZURE TO user`.
:::

Примеры:

* Чтобы создать таблицу с [табличным движком MySQL](../../engines/table-engines/integrations/mysql.md), необходимы привилегии `CREATE TABLE (ON db.table_name)` и `MYSQL`.
* Чтобы использовать [табличную функцию mysql](../../sql-reference/table-functions/mysql.md), необходимы привилегии `CREATE TEMPORARY TABLE` и `MYSQL`.

### Права доступа с фильтрацией по источникам {#source-filter-grants}

:::note
Эта функциональность доступна начиная с версии 25.8 и только при включённой настройке сервера
`access_control_improvements.enable_read_write_grants`
:::

Вы можете предоставлять доступ к конкретным URI источников, используя фильтры на основе регулярных выражений. Это позволяет гибко и детализированно контролировать, к каким внешним источникам данных имеют доступ пользователи.

**Синтаксис:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

Это разрешение позволит пользователю читать только из S3‑URI, которые соответствуют указанному шаблону регулярного выражения.

**Примеры:**

Предоставить доступ к определённым путям в бакете S3:

```sql
-- Разрешить пользователю чтение только из путей s3://foo/
GRANT READ ON S3('s3://foo/.*') TO john

-- Разрешить пользователю чтение из файлов по определённым шаблонам
GRANT READ ON S3('s3://mybucket/data/2024/.*\.parquet') TO analyst

-- Одному пользователю можно предоставить несколько фильтров
GRANT READ ON S3('s3://foo/.*') TO john
GRANT READ ON S3('s3://bar/.*') TO john
```

:::warning
Фильтр источника принимает **regexp** в качестве параметра, поэтому грант
`GRANT READ ON URL('http://www.google.com') TO john;`

позволит выполнять запросы

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

поскольку `.` в регулярных выражениях (`regexp`) интерпретируется как «любой одиночный символ» (`Any Single Character`).
Это может привести к уязвимости. Корректная инструкция GRANT должна быть:

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**Повторная выдача прав с `GRANT OPTION`:**

Если исходный `GRANT` был выполнен с `WITH GRANT OPTION`, права можно выдать повторно с помощью `GRANT CURRENT GRANTS`:

```sql
-- Исходное предоставление прав с GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- Теперь John может передать эти права другим пользователям
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**Важные ограничения:**

* **Частичный отзыв прав не допускается:** Нельзя отозвать только подмножество выданного шаблона фильтра. Необходимо отозвать весь `GRANT` и при необходимости выдать его снова с новыми шаблонами.
* **`GRANT` с подстановочными символами не допускается:** Нельзя использовать `GRANT READ ON *('regexp')` или аналогичные шаблоны, состоящие только из подстановочных символов. Должен быть указан конкретный источник.

### dictGet {#dictget}

* `dictGet`. Псевдонимы: `dictHas`, `dictGetHierarchy`, `dictIsIn`

Позволяет пользователю выполнять функции [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull), [dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas), [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy), [dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin).

Уровень привилегий: `DICTIONARY`.

**Примеры**

* `GRANT dictGet ON mydb.mydictionary TO john`
* `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

Позволяет пользователю просматривать секреты в запросах `SHOW` и `SELECT`, если одновременно включены
[`display_secrets_in_show_and_select` настройка сервера](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
и
[`format_display_secrets_in_show_and_select` настройка формата](../../operations/settings/formats#format_display_secrets_in_show_and_select).

### NAMED COLLECTION ADMIN {#named-collection-admin}

Позволяет выполнять определённую операцию над указанной именованной коллекцией. До версии 23.7 привилегия называлась NAMED COLLECTION CONTROL, а после 23.7 была добавлена NAMED COLLECTION ADMIN, при этом NAMED COLLECTION CONTROL сохранена как псевдоним.


- `NAMED COLLECTION ADMIN`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`. Уровень: `NAMED_COLLECTION`. Псевдонимы: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

В отличие от всех остальных привилегий (CREATE, DROP, ALTER, SHOW) привилегия `NAMED COLLECTION` была добавлена только в версии 23.7, тогда как все остальные были добавлены ранее — в 22.12.

**Примеры**

Предположим, именованная коллекция называется abc. Выдаем привилегию `CREATE NAMED COLLECTION` пользователю john.
- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

Разрешает использование указанного движка таблицы при создании таблицы. Применяется к [движкам таблиц](../../engines/table-engines/index.md).

**Примеры**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge/>

Предоставляет все привилегии на объект пользователю или роли.

:::note
Привилегия `ALL` не поддерживается в ClickHouse Cloud, где пользователь `default` имеет ограниченные права. Пользователи могут выдать максимальные права пользователю, назначив ему роль `default_role`. См. подробности [здесь](/cloud/security/manage-cloud-users).
Пользователи также могут использовать `GRANT CURRENT GRANTS` от имени пользователя `default`, чтобы добиться эффекта, аналогичного `ALL`.
:::

### NONE {#none}

Не выдает никаких привилегий.

### ADMIN OPTION {#admin-option}

Привилегия `ADMIN OPTION` позволяет пользователю выдавать свою роль другому пользователю.
