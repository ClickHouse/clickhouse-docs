---
description: 'GRANT SQL 문에 대한 문서'
sidebar_label: 'GRANT'
sidebar_position: 38
slug: /sql-reference/statements/grant
title: 'GRANT SQL 문'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# GRANT SQL 문 \{#grant-statement\}

- ClickHouse 사용자 계정 또는 역할에 [권한](#privileges)을 부여합니다.
- 사용자 계정 또는 다른 역할에 역할을 부여합니다.

권한을 취소하려면 [REVOKE](../../sql-reference/statements/revoke.md) 문을 사용합니다. 또한 [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) 문을 사용하여 부여된 권한을 나열할 수 있습니다.

## 권한 부여 구문 \{#granting-privilege-syntax\}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 권한 종류.
* `role` — ClickHouse 사용자 역할.
* `user` — ClickHouse 사용자 계정.

`WITH GRANT OPTION` 절은 `user` 또는 `role`에 `GRANT` 쿼리를 실행할 수 있는 권한을 부여합니다. 사용자는 자신이 가진 범위와 동일하거나 그보다 좁은 범위의 권한만 부여할 수 있습니다.
`WITH REPLACE OPTION` 절은 `user` 또는 `role`에 대해 이전 권한을 새 권한으로 교체합니다. 이 옵션을 지정하지 않으면 기존 권한에 새 권한이 추가됩니다.


## 역할 부여 구문 \{#assigning-role-syntax\}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

* `role` — ClickHouse 사용자 역할.
* `user` — ClickHouse 사용자 계정.

`WITH ADMIN OPTION` 절은 `user` 또는 `role`에 [ADMIN OPTION](#admin-option) 권한을 부여합니다.
`WITH REPLACE OPTION` 절은 `user` 또는 `role`에 대해 기존 역할을 새 역할로 교체합니다. 이 절을 사용하지 않으면 새 역할이 기존 역할에 추가됩니다.


## 현재 권한을 GRANT하는 구문 \{#grant-current-grants-syntax\}

```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

* `privilege` — 권한의 종류.
* `role` — ClickHouse 사용자 역할.
* `user` — ClickHouse 사용자 계정.

`CURRENT GRANTS` 문을 사용하면 지정된 사용자 또는 역할에 명시된 모든 권한을 부여할 수 있습니다.
권한이 하나도 지정되지 않은 경우, 해당 사용자 또는 역할은 `CURRENT_USER`에 대해 사용 가능한 모든 권한을 부여받습니다.


## 사용 방법 \{#usage\}

`GRANT`를 사용하려면 계정에 `GRANT OPTION` 권한이 있어야 합니다. 자신의 계정에 부여된 권한 범위 내에서만 권한을 부여할 수 있습니다.

예를 들어, 관리자가 다음 쿼리를 사용해 `john` 계정에 권한을 부여했다고 가정합니다:

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

이는 `john`에게 다음을 실행할 수 있는 권한이 있다는 의미입니다:

* `SELECT x,y FROM db.table`.
* `SELECT x FROM db.table`.
* `SELECT y FROM db.table`.

`john`은 `SELECT z FROM db.table`을 실행할 수 없습니다. `SELECT * FROM db.table`도 사용할 수 없습니다. 이 쿼리를 처리할 때 ClickHouse는 `x`와 `y`를 포함해 어떠한 데이터도 반환하지 않습니다. 예외는 테이블에 `x`와 `y` 컬럼만 포함된 경우입니다. 이 경우에는 ClickHouse가 모든 데이터를 반환합니다.

또한 `john`은 `GRANT OPTION` 권한을 가지고 있어 동일하거나 더 좁은 범위의 권한을 다른 사용자에게 부여할 수 있습니다.

`system` 데이터베이스에 대한 접근은 항상 허용됩니다(이 데이터베이스는 쿼리를 처리하는 데 사용되기 때문입니다).

:::note
여러 system 테이블은 신규 사용자가 기본적으로 접근할 수 있지만, 권한 부여 없이 기본 설정만으로는 모든 system 테이블에 접근할 수 있는 것은 아닙니다.
또한 `system.zookeeper`와 같은 특정 system 테이블에 대한 접근은 보안상의 이유로 Cloud 사용자에게 제한됩니다.
:::

하나의 쿼리에서 여러 권한을 여러 계정에 부여할 수 있습니다. `GRANT SELECT, INSERT ON *.* TO john, robin` 쿼리는 계정 `john`과 `robin`이 서버의 모든 데이터베이스에 있는 모든 테이블에 대해 `INSERT` 및 `SELECT` 쿼리를 실행할 수 있도록 허용합니다.


## 와일드카드 GRANT \{#wildcard-grants\}

권한을 지정할 때 테이블이나 데이터베이스 이름 대신 별표(`*`)를 사용할 수 있습니다. 예를 들어, `GRANT SELECT ON db.* TO john` 쿼리는 `db` 데이터베이스에 있는 모든 테이블에 대해 `john`이 `SELECT` 쿼리를 실행할 수 있도록 허용합니다.
또한 데이터베이스 이름을 생략할 수도 있습니다. 이 경우 현재 데이터베이스에 대해 권한이 부여됩니다.
예를 들어, `GRANT SELECT ON * TO john`은 현재 데이터베이스의 모든 테이블에 대한 권한을 부여하고, `GRANT SELECT ON mytable TO john`은 현재 데이터베이스의 `mytable` 테이블에 대한 권한을 부여합니다.

:::note
아래에서 설명하는 기능은 ClickHouse 24.10 버전부터 사용할 수 있습니다.
:::

테이블 또는 데이터베이스 이름의 끝에 별표를 붙일 수도 있습니다. 이 기능을 사용하면 테이블 경로의 접두사(앞부분)를 기준으로 권한을 부여할 수 있습니다.
예: `GRANT SELECT ON db.my_tables* TO john`. 이 쿼리는 `john`이 접두사 `my_tables*`를 가진 `db` 데이터베이스의 모든 테이블에 대해 `SELECT` 쿼리를 실행할 수 있도록 허용합니다.

추가 예:

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

부여된 경로 내에서 새로 생성된 모든 테이블은 상위 경로의 모든 권한을 자동으로 상속합니다.
예를 들어 `GRANT SELECT ON db.* TO john` 쿼리를 실행한 뒤 새 테이블 `db.new_table`을 생성하면, 사용자 `john`은 `SELECT * FROM db.new_table` 쿼리를 실행할 수 있습니다.

별표는 접두사에만 **사용할 수 있습니다**:

```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- correct

GRANT SELECT ON *.my_table TO john -- wrong
GRANT SELECT ON foo*bar TO john -- wrong
GRANT SELECT ON *suffix TO john -- wrong
GRANT SELECT(foo) ON db.table* TO john -- wrong
```


## 권한 \{#privileges\}

권한은 사용자가 특정 종류의 쿼리를 실행할 수 있도록 부여되는 허용입니다.

권한은 계층적 구조를 가지며, 허용되는 쿼리의 집합은 권한의 범위에 따라 달라집니다.

ClickHouse에서 권한의 계층 구조는 다음과 같습니다.

* [`ALL`](#all)
  * [`액세스 관리`](#access-management)
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
  * `MOVE PARTITION BETWEEN SHARDS`
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
  * [`SOURCES`](#sources)
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

이 계층이 처리되는 방식의 예:

- `ALTER` 권한에는 다른 모든 `ALTER*` 권한이 포함됩니다.
- `ALTER CONSTRAINT`에는 `ALTER ADD CONSTRAINT` 및 `ALTER DROP CONSTRAINT` 권한이 포함됩니다.

권한은 서로 다른 수준에서 적용됩니다. 각 수준을 이해하면 해당 수준에서 사용할 수 있는 권한 문법을 알 수 있습니다.

수준(낮은 것부터 높은 것까지):

- `COLUMN` — 권한을 컬럼, 테이블, 데이터베이스 또는 전역에 부여할 수 있습니다.
- `TABLE` — 권한을 테이블, 데이터베이스 또는 전역에 부여할 수 있습니다.
- `VIEW` — 권한을 뷰, 데이터베이스 또는 전역에 부여할 수 있습니다.
- `DICTIONARY` — 권한을 딕셔너리, 데이터베이스 또는 전역에 부여할 수 있습니다.
- `DATABASE` — 권한을 데이터베이스 또는 전역에 부여할 수 있습니다.
- `GLOBAL` — 권한을 전역에만 부여할 수 있습니다.
- `GROUP` — 서로 다른 수준의 권한을 그룹화합니다. `GROUP` 수준의 권한이 부여되면, 사용된 문법에 해당하는 그룹 내 권한만 부여됩니다.

허용되는 문법의 예:

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

허용되지 않는 문법의 예:

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

특수 권한인 [ALL](#all)은 사용자 계정 또는 역할에 모든 권한을 부여합니다.

기본적으로 사용자 계정 또는 역할에는 아무 권한도 없습니다.

사용자 또는 역할에 권한이 하나도 없으면 [NONE](#none) 권한으로 표시됩니다.

일부 쿼리는 구현 방식상 여러 개의 권한이 필요합니다. 예를 들어 [RENAME](../../sql-reference/statements/optimize.md) 쿼리를 실행하려면 `SELECT`, `CREATE TABLE`, `INSERT`, `DROP TABLE` 권한이 필요합니다.

### SELECT \{#select\}

[SELECT](../../sql-reference/statements/select/index.md) 쿼리를 실행할 수 있습니다.

권한 수준: `COLUMN`.

**설명**

이 권한이 부여된 사용자는 지정된 데이터베이스와 테이블에서 지정된 컬럼 목록에 대해 `SELECT` 쿼리를 실행할 수 있습니다. 사용자가 지정된 컬럼 이외의 컬럼을 포함하면 쿼리는 어떠한 데이터도 반환하지 않습니다.

다음 권한을 예로 들어 보겠습니다.

```sql
GRANT SELECT(x,y) ON db.table TO john
```

이 권한이 부여되면 `john`은 `db.table`의 `x` 및/또는 `y` 컬럼의 데이터를 포함하는 임의의 `SELECT` 쿼리를 실행할 수 있습니다. 예를 들어 `SELECT x FROM db.table`과 같습니다. `john`은 `SELECT z FROM db.table`은 실행할 수 없습니다. `SELECT * FROM db.table`도 사용할 수 없습니다. 이 쿼리를 처리할 때 ClickHouse는 `x`와 `y`를 포함하여 어떤 데이터도 반환하지 않습니다. 유일한 예외는 테이블에 `x`와 `y` 컬럼만 포함된 경우이며, 이때는 ClickHouse가 모든 데이터를 반환합니다.


### INSERT \{#insert\}

[INSERT](../../sql-reference/statements/insert-into.md) 쿼리 실행을 허용합니다.

권한 수준: `COLUMN`.

**설명**

이 권한이 부여된 사용자는 지정된 데이터베이스와 테이블에서 지정된 컬럼 목록에 대해 `INSERT` 쿼리를 실행할 수 있습니다. 사용자가 지정된 것 외의 컬럼을 포함하는 경우, 해당 쿼리는 어떤 데이터도 삽입하지 않습니다.

**예시**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

해당 권한이 부여되면 `john`은 `db.table`의 `x` 컬럼과 `y` 컬럼 중 하나 또는 둘 다에 데이터를 삽입할 수 있습니다.


### ALTER \{#alter\}

다음과 같은 권한 계층 구조에 따라 [ALTER](../../sql-reference/statements/alter/index.md) 쿼리를 실행할 수 있습니다.

- `ALTER`. 레벨: `COLUMN`.
  - `ALTER TABLE`. 레벨: `GROUP`
  - `ALTER UPDATE`. 레벨: `COLUMN`. 별칭: `UPDATE`
  - `ALTER DELETE`. 레벨: `COLUMN`. 별칭: `DELETE`
  - `ALTER COLUMN`. 레벨: `GROUP`
  - `ALTER ADD COLUMN`. 레벨: `COLUMN`. 별칭: `ADD COLUMN`
  - `ALTER DROP COLUMN`. 레벨: `COLUMN`. 별칭: `DROP COLUMN`
  - `ALTER MODIFY COLUMN`. 레벨: `COLUMN`. 별칭: `MODIFY COLUMN`
  - `ALTER COMMENT COLUMN`. 레벨: `COLUMN`. 별칭: `COMMENT COLUMN`
  - `ALTER CLEAR COLUMN`. 레벨: `COLUMN`. 별칭: `CLEAR COLUMN`
  - `ALTER RENAME COLUMN`. 레벨: `COLUMN`. 별칭: `RENAME COLUMN`
  - `ALTER INDEX`. 레벨: `GROUP`. 별칭: `INDEX`
  - `ALTER ORDER BY`. 레벨: `TABLE`. 별칭: `ALTER MODIFY ORDER BY`, `MODIFY ORDER BY`
  - `ALTER SAMPLE BY`. 레벨: `TABLE`. 별칭: `ALTER MODIFY SAMPLE BY`, `MODIFY SAMPLE BY`
  - `ALTER ADD INDEX`. 레벨: `TABLE`. 별칭: `ADD INDEX`
  - `ALTER DROP INDEX`. 레벨: `TABLE`. 별칭: `DROP INDEX`
  - `ALTER MATERIALIZE INDEX`. 레벨: `TABLE`. 별칭: `MATERIALIZE INDEX`
  - `ALTER CLEAR INDEX`. 레벨: `TABLE`. 별칭: `CLEAR INDEX`
  - `ALTER CONSTRAINT`. 레벨: `GROUP`. 별칭: `CONSTRAINT`
  - `ALTER ADD CONSTRAINT`. 레벨: `TABLE`. 별칭: `ADD CONSTRAINT`
  - `ALTER DROP CONSTRAINT`. 레벨: `TABLE`. 별칭: `DROP CONSTRAINT`
  - `ALTER TTL`. 레벨: `TABLE`. 별칭: `ALTER MODIFY TTL`, `MODIFY TTL`
  - `ALTER MATERIALIZE TTL`. 레벨: `TABLE`. 별칭: `MATERIALIZE TTL`
  - `ALTER SETTINGS`. 레벨: `TABLE`. 별칭: `ALTER SETTING`, `ALTER MODIFY SETTING`, `MODIFY SETTING`
  - `ALTER MOVE PARTITION`. 레벨: `TABLE`. 별칭: `ALTER MOVE PART`, `MOVE PARTITION`, `MOVE PART`
  - `ALTER FETCH PARTITION`. 레벨: `TABLE`. 별칭: `ALTER FETCH PART`, `FETCH PARTITION`, `FETCH PART`
  - `ALTER FREEZE PARTITION`. 레벨: `TABLE`. 별칭: `FREEZE PARTITION`
  - `ALTER VIEW`. 레벨: `GROUP`
  - `ALTER VIEW REFRESH`. 레벨: `VIEW`. 별칭: `REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`. 레벨: `VIEW`. 별칭: `ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`. 레벨: `VIEW`. 별칭: `ALTER TABLE MODIFY SQL SECURITY`

이 계층 구조가 적용되는 방식의 예는 다음과 같습니다.

- `ALTER` 권한에는 다른 모든 `ALTER*` 권한이 포함됩니다.
- `ALTER CONSTRAINT` 권한에는 `ALTER ADD CONSTRAINT` 및 `ALTER DROP CONSTRAINT` 권한이 포함됩니다.

**참고**

- `MODIFY SETTING` 권한은 테이블 엔진 설정을 수정할 수 있게 합니다. 이 권한은 기타 설정이나 서버 구성 파라미터에는 영향을 주지 않습니다.
- `ATTACH` 연산에는 [CREATE](#create) 권한이 필요합니다.
- `DETACH` 연산에는 [DROP](#drop) 권한이 필요합니다.
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) 쿼리로 mutation을 중지하려면, 해당 mutation을 시작할 수 있는 권한이 있어야 합니다. 예를 들어 `ALTER UPDATE` 쿼리를 중지하려면 `ALTER UPDATE`, `ALTER TABLE` 또는 `ALTER` 권한이 필요합니다.

### BACKUP \{#backup\}

쿼리 내에서 [`BACKUP`]을 실행할 수 있습니다. 백업에 대한 자세한 내용은 ["Backup and Restore"](/operations/backup/overview)를 참조하십시오.

### CREATE \{#create\}

다음과 같은 권한 계층에 따라 [CREATE](../../sql-reference/statements/create/index.md) 및 [ATTACH](../../sql-reference/statements/attach.md) DDL 쿼리를 실행할 수 있습니다:

- `CREATE`. 레벨: `GROUP`
  - `CREATE DATABASE`. 레벨: `DATABASE`
  - `CREATE TABLE`. 레벨: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`. 레벨: `GLOBAL`
      - `CREATE TEMPORARY TABLE`. 레벨: `GLOBAL`
  - `CREATE VIEW`. 레벨: `VIEW`
  - `CREATE DICTIONARY`. 레벨: `DICTIONARY`

**참고**

- 생성한 테이블을 삭제하려면 [DROP](#drop) 권한이 필요합니다.

### CLUSTER \{#cluster\}

`ON CLUSTER` 쿼리 실행을 허용합니다.

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <username>
```

기본적으로 `ON CLUSTER`를 사용하는 쿼리를 실행하려면 사용자에게 `CLUSTER` 권한이 부여되어 있어야 합니다.
먼저 `CLUSTER` 권한을 부여하지 않은 상태에서 쿼리에서 `ON CLUSTER`를 사용하려고 하면 다음과 같은 오류가 발생합니다:

```text
Not enough privileges. To execute this query, it's necessary to have the grant CLUSTER ON *.*. 
```

기본 동작은 `config.xml`의 `access_control_improvements` 섹션(아래 참조)에 있는 `on_cluster_queries_require_cluster_grant` 설정을 `false`로 설정하여 변경할 수 있습니다.

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```


### DROP \{#drop\}

다음과 같은 권한 계층에 따라 [DROP](../../sql-reference/statements/drop.md) 및 [DETACH](../../sql-reference/statements/detach.md) 쿼리를 실행할 수 있습니다:

- `DROP`. 레벨: `GROUP`
  - `DROP DATABASE`. 레벨: `DATABASE`
  - `DROP TABLE`. 레벨: `TABLE`
  - `DROP VIEW`. 레벨: `VIEW`
  - `DROP DICTIONARY`. 레벨: `DICTIONARY`

### TRUNCATE \{#truncate\}

[TRUNCATE](../../sql-reference/statements/truncate.md) 쿼리 실행을 허용합니다.

권한 수준: `TABLE`.

### OPTIMIZE \{#optimize\}

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) 쿼리 실행을 허용합니다.

권한 수준: `TABLE`.

### SHOW \{#show\}

`SHOW`, `DESCRIBE`, `USE`, `EXISTS` 쿼리를 다음과 같은 권한 계층 구조에 따라 실행할 수 있습니다:

- `SHOW`. 레벨: `GROUP`
  - `SHOW DATABASES`. 레벨: `DATABASE`. `SHOW DATABASES`, `SHOW CREATE DATABASE`, `USE <database>` 쿼리를 실행할 수 있습니다.
  - `SHOW TABLES`. 레벨: `TABLE`. `SHOW TABLES`, `EXISTS <table>`, `CHECK <table>` 쿼리를 실행할 수 있습니다.
  - `SHOW COLUMNS`. 레벨: `COLUMN`. `SHOW CREATE TABLE`, `DESCRIBE` 쿼리를 실행할 수 있습니다.
  - `SHOW DICTIONARIES`. 레벨: `DICTIONARY`. `SHOW DICTIONARIES`, `SHOW CREATE DICTIONARY`, `EXISTS <dictionary>` 쿼리를 실행할 수 있습니다.

**Notes**

사용자가 특정 테이블, 딕셔너리 또는 데이터베이스와 관련된 다른 어떤 권한이라도 하나라도 가지고 있으면 `SHOW` 권한을 가진 것으로 간주됩니다.

### KILL QUERY \{#kill-query\}

다음 권한 계층 구조에 따라 [KILL](../../sql-reference/statements/kill.md#kill-query) 쿼리를 실행할 수 있습니다.

권한 수준: `GLOBAL`.

**참고**

`KILL QUERY` 권한이 있으면 한 사용자가 다른 사용자의 쿼리를 종료할 수 있습니다.

### ACCESS MANAGEMENT \{#access-management\}

사용자가 사용자, 역할 및 ROW POLICY를 관리하는 쿼리를 실행할 수 있습니다.

- `ACCESS MANAGEMENT`. Level: `GROUP`
  - `CREATE USER`. Level: `GLOBAL`
  - `ALTER USER`. Level: `GLOBAL`
  - `DROP USER`. Level: `GLOBAL`
  - `CREATE ROLE`. Level: `GLOBAL`
  - `ALTER ROLE`. Level: `GLOBAL`
  - `DROP ROLE`. Level: `GLOBAL`
  - `ROLE ADMIN`. Level: `GLOBAL`
  - `CREATE ROW POLICY`. Level: `GLOBAL`. Aliases: `CREATE POLICY`
  - `ALTER ROW POLICY`. Level: `GLOBAL`. Aliases: `ALTER POLICY`
  - `DROP ROW POLICY`. Level: `GLOBAL`. Aliases: `DROP POLICY`
  - `CREATE QUOTA`. Level: `GLOBAL`
  - `ALTER QUOTA`. Level: `GLOBAL`
  - `DROP QUOTA`. Level: `GLOBAL`
  - `CREATE SETTINGS PROFILE`. Level: `GLOBAL`. Aliases: `CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`. Level: `GLOBAL`. Aliases: `ALTER PROFILE`
  - `DROP SETTINGS PROFILE`. Level: `GLOBAL`. Aliases: `DROP PROFILE`
  - `SHOW ACCESS`. Level: `GROUP`
    - `SHOW_USERS`. Level: `GLOBAL`. Aliases: `SHOW CREATE USER`
    - `SHOW_ROLES`. Level: `GLOBAL`. Aliases: `SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`. Level: `GLOBAL`. Aliases: `SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
    - `SHOW_QUOTAS`. Level: `GLOBAL`. Aliases: `SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`. Level: `GLOBAL`. Aliases: `SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`. Level: `GLOBAL`. Aliases: `CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

`ROLE ADMIN` 권한이 있으면 관리자 옵션이 있는 사용자에게 할당되지 않은 역할을 포함하여 모든 역할을 부여하거나 회수할 수 있습니다.

### SYSTEM \{#system\}

다음과 같은 권한 계층에 따라 사용자가 [SYSTEM](../../sql-reference/statements/system.md) 쿼리를 실행할 수 있도록 합니다.

- `SYSTEM`. Level: `GROUP`
  - `SYSTEM SHUTDOWN`. Level: `GLOBAL`. Aliases: `SYSTEM KILL`, `SHUTDOWN`
  - `SYSTEM DROP CACHE`. Aliases: `DROP CACHE`
    - `SYSTEM DROP DNS CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM CLEAR DNS CACHE`, `SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
    - `SYSTEM DROP MARK CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM CLEAR MARK CACHE`, `SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
    - `SYSTEM DROP UNCOMPRESSED CACHE`. Level: `GLOBAL`. Aliases: `SYSTEM CLEAR UNCOMPRESSED CACHE`, `SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
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

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 권한은 `SYSTEM RELOAD DICTIONARY ON *.*` 권한에 의해 암시적으로 부여됩니다.

### INTROSPECTION \{#introspection\}

[인트로스펙션(introspection)](../../operations/optimizing-performance/sampling-query-profiler.md) 함수를 사용할 수 있습니다.

- `INTROSPECTION`. Level: `GROUP`. Aliases: `INTROSPECTION FUNCTIONS`
  - `addressToLine`. Level: `GLOBAL`
  - `addressToLineWithInlines`. Level: `GLOBAL`
  - `addressToSymbol`. Level: `GLOBAL`
  - `demangle`. Level: `GLOBAL`

### SOURCES \{#sources\}

외부 데이터 소스를 사용할 수 있습니다. [테이블 엔진](../../engines/table-engines/index.md) 및 [테이블 함수](/sql-reference/table-functions)에 적용됩니다.

- `READ`. 레벨: `GLOBAL_WITH_PARAMETER`  
- `WRITE`. 레벨: `GLOBAL_WITH_PARAMETER`

가능한 매개변수:

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
소스에 대한 READ/WRITE 권한 분리는 버전 25.7부터 사용할 수 있으며, 다음 서버 설정이 활성화된 경우에만 가능합니다.
`access_control_improvements.enable_read_write_grants`

그렇지 않은 경우 `GRANT AZURE ON *.* TO user` 구문을 사용해야 하며, 이는 새로운 구문인 `GRANT READ, WRITE ON AZURE TO user`와 동일합니다. 
:::

예:

- [MySQL 테이블 엔진](../../engines/table-engines/integrations/mysql.md)으로 테이블을 생성하려면 `CREATE TABLE (ON db.table_name)` 및 `MYSQL` 권한이 필요합니다.
- [mysql 테이블 함수](../../sql-reference/table-functions/mysql.md)를 사용하려면 `CREATE TEMPORARY TABLE` 및 `MYSQL` 권한이 필요합니다.

### 소스 필터 권한 부여 \{#source-filter-grants\}

:::note
이 기능은 25.8 버전부터 사용할 수 있으며, 서버 설정
`access_control_improvements.enable_read_write_grants`
이 활성화된 경우에만 사용할 수 있습니다.
:::

정규 표현식 필터를 사용하여 특정 소스 URI에 대한 접근 권한을 부여할 수 있습니다. 이를 통해 사용자가 접근할 수 있는 외부 데이터 소스를 세밀하게 제어할 수 있습니다.

**구문:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

이 GRANT 권한은 지정된 정규식 패턴과 일치하는 S3 URI에서만 읽기가 가능하도록 허용합니다.

**예시:**

특정 S3 버킷 경로에 대한 액세스 권한을 부여합니다:

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
Source filter는 **regexp**를 매개변수로 사용하므로, 아래와 같은 GRANT 문

`GRANT READ ON URL('http://www.google.com') TO john;`

은(는) 다음과 같은 쿼리를 허용합니다.

```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

정규 표현식에서 `.`는 `Any Single Character`로 해석되기 때문입니다.
이로 인해 잠재적인 취약점이 발생할 수 있습니다. 올바른 GRANT는 다음과 같습니다.

```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```

:::

**GRANT OPTION이 있는 권한 재부여:**

원래 GRANT에 `WITH GRANT OPTION`이 포함된 경우, `GRANT CURRENT GRANTS`를 사용하여 권한을 재부여할 수 있습니다:

```sql
-- Original grant with GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John can now regrant this access to others
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**중요한 제한 사항:**

* **부분 철회는 허용되지 않습니다:** 부여된 필터 패턴의 일부만 철회할 수 없습니다. 전체 GRANT를 철회한 뒤, 필요하다면 새로운 패턴으로 다시 GRANT해야 합니다.
* **와일드카드 GRANT는 허용되지 않습니다:** `GRANT READ ON *('regexp')`와 같은 와일드카드만 사용하는 패턴은 사용할 수 없습니다. 구체적인 source를 명시해야 합니다.


### dictGet \{#dictget\}

- `dictGet`. 별칭: `dictHas`, `dictGetHierarchy`, `dictIsIn`

`dictGet` 권한은 사용자가 [dictGet](/sql-reference/functions/ext-dict-functions#dictGet), [dictHas](../../sql-reference/functions/ext-dict-functions.md#dictHas), [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictGetHierarchy), [dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictIsIn) 함수를 실행할 수 있도록 합니다.

권한 수준: `DICTIONARY`.

**예시**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect \{#displaysecretsinshowandselect\}

`SHOW` 및 `SELECT` 쿼리에서 비밀 값(secrets)을 볼 수 있습니다. 이를 위해서는
[`display_secrets_in_show_and_select` 서버 설정](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
과
[`format_display_secrets_in_show_and_select` 포맷 설정](../../operations/settings/formats#format_display_secrets_in_show_and_select)
이 모두 활성화되어 있어야 합니다.

### NAMED COLLECTION ADMIN \{#named-collection-admin\}

지정된 named collection에 대해 특정 작업을 수행할 수 있도록 허용합니다. 23.7 버전 이전에는 NAMED COLLECTION CONTROL이라 불렸으며, 23.7부터 NAMED COLLECTION ADMIN이 추가되고 NAMED COLLECTION CONTROL은 별칭으로 유지됩니다.

- `NAMED COLLECTION ADMIN`. Level: `NAMED_COLLECTION`. Aliases: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`. Level: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`. Level: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`. Level: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`. Level: `NAMED_COLLECTION`. Aliases: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`. Level: `NAMED_COLLECTION`. Aliases: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`. Level: `NAMED_COLLECTION`. Aliases: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

다른 모든 권한(`CREATE`, `DROP`, `ALTER`, `SHOW`)과는 달리, `NAMED COLLECTION` 권한은 23.7 버전에 추가되었고, 나머지는 그보다 이전 버전인 22.12에 추가되었습니다.

**예시**

named collection의 이름이 abc라고 할 때, 사용자 john에게 `CREATE NAMED COLLECTION` 권한을 부여합니다.

- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE \{#table-engine\}

테이블을 생성할 때 지정된 테이블 엔진을 사용할 수 있도록 합니다. [테이블 엔진](../../engines/table-engines/index.md)에 적용됩니다.

**예시**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

:::note
기본적으로, 하위 호환성을 위해 특정 테이블 엔진으로 테이블을 생성할 때는 GRANT 권한을 무시합니다.
그러나 config.xml에서 [`table_engines_require_grant`를 true로 설정](https://github.com/ClickHouse/ClickHouse/blob/df970ed64eaf472de1e7af44c21ec95956607ebb/programs/server/config.xml#L853-L855)하여 이 동작을 변경할 수 있습니다.
:::

### ALL \{#all\}

<CloudNotSupportedBadge/>

대상 엔터티에 대한 모든 권한을 사용자 계정 또는 역할에 부여합니다.

:::note
`ALL` 권한은 `default` 사용자의 권한이 제한된 ClickHouse Cloud에서는 지원되지 않습니다. 사용자는 `default_role`을 부여하여 사용자에게 가능한 최대 권한을 부여할 수 있습니다. 자세한 내용은 [여기](/cloud/security/manage-cloud-users)를 참고하십시오.
또한 사용자는 유사한 효과를 얻기 위해 `default` 사용자로서 `GRANT CURRENT GRANTS`를 사용할 수 있습니다.
:::

### 없음 \{#none\}

어떤 권한도 부여하지 않습니다.

### ADMIN OPTION \{#admin-option\}

`ADMIN OPTION` 권한을 사용하면 자신의 역할을 다른 사용자에게 부여할 수 있습니다.