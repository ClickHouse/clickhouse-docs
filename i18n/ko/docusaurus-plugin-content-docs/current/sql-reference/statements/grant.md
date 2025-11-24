---
'description': 'GRANT 문에 대한 문서'
'sidebar_label': 'GRANT'
'sidebar_position': 38
'slug': '/sql-reference/statements/grant'
'title': 'GRANT 문'
'doc_type': 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# GRANT 문

- ClickHouse 사용자 계정이나 역할에 [권한](#privileges)을 부여합니다.
- 사용자 계정이나 다른 역할에 역할을 할당합니다.

권한을 취소하려면 [REVOKE](../../sql-reference/statements/revoke.md) 문을 사용하십시오. 또한 [SHOW GRANTS](../../sql-reference/statements/show.md#show-grants) 문을 사용하여 부여된 권한을 나열할 수 있습니다.

## 권한 부여 문법 {#granting-privilege-syntax}

```sql
GRANT [ON CLUSTER cluster_name] privilege[(column_name [,...])] [,...] ON {db.table[*]|db[*].*|*.*|table[*]|*} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 권한의 유형.
- `role` — ClickHouse 사용자 역할.
- `user` — ClickHouse 사용자 계정.

`WITH GRANT OPTION` 절은 `user` 또는 `role`에게 `GRANT` 쿼리를 실행할 수 있는 권한을 부여합니다. 사용자는 자신이 가진 범위와 동일하거나 더 작은 범위의 권한을 부여할 수 있습니다.
`WITH REPLACE OPTION` 절은 `user` 또는 `role`의 이전 권한을 새로운 권한으로 교체하며, 지정하지 않으면 권한이 추가됩니다.

## 역할 할당 문법 {#assigning-role-syntax}

```sql
GRANT [ON CLUSTER cluster_name] role [,...] TO {user | another_role | CURRENT_USER} [,...] [WITH ADMIN OPTION] [WITH REPLACE OPTION]
```

- `role` — ClickHouse 사용자 역할.
- `user` — ClickHouse 사용자 계정.

`WITH ADMIN OPTION` 절은 `user` 또는 `role`에게 [ADMIN OPTION](#admin-option) 권한을 부여합니다.
`WITH REPLACE OPTION` 절은 `user` 또는 `role`에 대해 이전 역할을 새로운 역할로 교체하며, 지정하지 않으면 역할이 추가됩니다.

## 현재 부여된 권한 문법 {#grant-current-grants-syntax}
```sql
GRANT CURRENT GRANTS{(privilege[(column_name [,...])] [,...] ON {db.table|db.*|*.*|table|*}) | ON {db.table|db.*|*.*|table|*}} TO {user | role | CURRENT_USER} [,...] [WITH GRANT OPTION] [WITH REPLACE OPTION]
```

- `privilege` — 권한의 유형.
- `role` — ClickHouse 사용자 역할.
- `user` — ClickHouse 사용자 계정.

`CURRENT GRANTS` 문을 사용하면 지정된 사용자나 역할에 대해 모든 지정된 권한을 부여할 수 있습니다. 어떤 권한도 지정하지 않은 경우, 지정된 사용자나 역할은 `CURRENT_USER`에 대해 모든 사용 가능한 권한을 받습니다.

## 사용법 {#usage}

`GRANT`를 사용하려면 계정에 `GRANT OPTION` 권한이 있어야 합니다. 사용자는 자신의 계정 권한 범위 내에서만 권한을 부여할 수 있습니다.

예를 들어, 관리자는 다음 쿼리를 통해 `john` 계정에 권한을 부여했습니다:

```sql
GRANT SELECT(x,y) ON db.table TO john WITH GRANT OPTION
```

이는 `john`이 다음을 실행할 수 있는 권한을 가지게 됨을 의미합니다:

- `SELECT x,y FROM db.table`.
- `SELECT x FROM db.table`.
- `SELECT y FROM db.table`.

`john`은 `SELECT z FROM db.table`을 실행할 수 없습니다. `SELECT * FROM db.table`도 사용할 수 없습니다. 이 쿼리를 처리하는 동안 ClickHouse는 데이터도 반환하지 않습니다, 심지어 `x`와 `y`도 마찬가지입니다. 유일한 예외는 테이블이 오직 `x`와 `y` 컬럼만 포함하고 있을 경우입니다. 이 경우 ClickHouse는 모든 데이터를 반환합니다.

또한 `john`은 `GRANT OPTION` 권한이 있으므로 다른 사용자에게 동일한 범위의 권한을 부여할 수 있습니다.

`system` 데이터베이스에 대한 접근은 항상 허용됩니다 (이 데이터베이스는 쿼리를 처리하는 데 사용됩니다).

:::note
새로운 사용자가 기본적으로 접근할 수 있는 많은 시스템 테이블이 있지만, 권한이 없으면 모든 시스템 테이블에 접근할 수는 없습니다. 또한, `system.zookeeper`와 같은 특정 시스템 테이블에 대한 접근은 보안상의 이유로 Cloud 사용자에게 제한됩니다.
:::

하나의 쿼리에서 여러 계정에 여러 권한을 부여할 수 있습니다. 쿼리 `GRANT SELECT, INSERT ON *.* TO john, robin`은 `john`과 `robin` 계정이 서버의 모든 데이터베이스 내 모든 테이블에 대해 `INSERT` 및 `SELECT` 쿼리를 실행할 수 있게 합니다.

## 와일드카드 권한 {#wildcard-grants}

권한을 지정할 때 테이블이나 데이터베이스 이름 대신 별표(`*`)를 사용할 수 있습니다. 예를 들어, `GRANT SELECT ON db.* TO john` 쿼리는 `john`이 `db` 데이터베이스 내 모든 테이블에서 `SELECT` 쿼리를 실행할 수 있도록 합니다. 또한 데이터베이스 이름을 생략할 수 있습니다. 이 경우 현재 데이터베이스에 대해 권한이 부여됩니다. 예를 들어, `GRANT SELECT ON * TO john`은 현재 데이터베이스 내 모든 테이블에 대한 권한을 부여하고, `GRANT SELECT ON mytable TO john`은 현재 데이터베이스의 `mytable` 테이블에 대한 권한을 부여합니다.

:::note
아래에 설명된 기능은 24.10 ClickHouse 버전부터 사용할 수 있습니다.
:::

테이블이나 데이터베이스 이름의 끝에 별표를 추가할 수도 있습니다. 이 기능은 테이블 경로의 추상 접두사에 대해 권한을 부여할 수 있게 해줍니다. 예: `GRANT SELECT ON db.my_tables* TO john`. 이 쿼리는 `john`이 `my_tables*` 접두사를 가진 모든 `db` 데이터베이스 테이블에서 `SELECT` 쿼리를 실행할 수 있게 합니다.

더 많은 예시:

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

부여된 경로 내의 새로 생성된 모든 테이블은 부모에서 모든 권한을 자동으로 상속받습니다. 예를 들어, `GRANT SELECT ON db.* TO john` 쿼리를 실행한 후 새 테이블 `db.new_table`을 생성하면, 사용자 `john`은 `SELECT * FROM db.new_table` 쿼리를 실행할 수 있습니다.

접두사에 대해서만 별표를 지정할 수 있습니다:
```sql
GRANT SELECT ON db.* TO john -- correct
GRANT SELECT ON db*.* TO john -- correct

GRANT SELECT ON *.my_table TO john -- wrong
GRANT SELECT ON foo*bar TO john -- wrong
GRANT SELECT ON *suffix TO john -- wrong
GRANT SELECT(foo) ON db.table* TO john -- wrong
```

## 권한 {#privileges}

권한은 사용자가 특정 종류의 쿼리를 실행할 수 있도록 주어지는 허가입니다.

권한은 계층 구조를 가지고 있으며 허용된 쿼리 집합은 권한의 범위에 따라 다릅니다.

ClickHouse에서의 권한 계층 구조는 아래와 같습니다:

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

이 계층 구조가 어떻게 다루어지는지에 대한 예시:

- `ALTER` 권한은 모든 다른 `ALTER*` 권한을 포함합니다.
- `ALTER CONSTRAINT`는 `ALTER ADD CONSTRAINT` 및 `ALTER DROP CONSTRAINT` 권한을 포함합니다.

권한은 서로 다른 수준에서 적용됩니다. 특정 수준의 지식은 사용 가능한 구문을 제안합니다.

수준 (낮은 것에서 높은 것까지):

- `COLUMN` — 컬럼, 테이블, 데이터베이스 또는 전역적으로 권한을 부여할 수 있습니다.
- `TABLE` — 테이블, 데이터베이스 또는 전역적으로 권한을 부여할 수 있습니다.
- `VIEW` — 뷰, 데이터베이스 또는 전역적으로 권한을 부여할 수 있습니다.
- `DICTIONARY` — 딕셔너리, 데이터베이스 또는 전역적으로 권한을 부여할 수 있습니다.
- `DATABASE` — 데이터베이스 또는 전역적으로 권한을 부여할 수 있습니다.
- `GLOBAL` — 권한을 전역적으로만 부여할 수 있습니다.
- `GROUP` — 서로 다른 수준의 권한을 그룹화합니다. `GROUP` 수준의 권한이 부여되면 사용된 구문에 해당하는 권한만 그룹에서 부여됩니다.

허용된 구문의 예시:

- `GRANT SELECT(x) ON db.table TO user`
- `GRANT SELECT ON db.* TO user`

허용되지 않는 구문의 예시:

- `GRANT CREATE USER(x) ON db.table TO user`
- `GRANT CREATE USER ON db.* TO user`

특별 권한 [ALL](#all)은 사용자 계정이나 역할에 모든 권한을 부여합니다.

기본적으로 사용자 계정이나 역할은 권한이 없습니다.

사용자나 역할이 권한이 없는 경우, 이는 [NONE](#none) 권한으로 표시됩니다.

일부 쿼리는 구현에 따라 특정 권한 세트를 요구합니다. 예를 들어, [RENAME](../../sql-reference/statements/optimize.md) 쿼리를 실행하려면 다음과 같은 권한이 필요합니다: `SELECT`, `CREATE TABLE`, `INSERT` 및 `DROP TABLE`.

### SELECT {#select}

[SELECT](../../sql-reference/statements/select/index.md) 쿼리를 실행할 수 있습니다.

권한 수준: `COLUMN`.

**설명**

이 권한이 부여된 사용자는 지정된 테이블과 데이터베이스의 지정된 컬럼 목록에서 `SELECT` 쿼리를 실행할 수 있습니다. 사용자가 다른 컬럼을 포함하면 지정된 쿼리는 데이터를 반환하지 않습니다.

다음의 권한을 고려해보십시오:

```sql
GRANT SELECT(x,y) ON db.table TO john
```

이 권한은 `john`이 `db.table`에서 `x` 및/또는 `y` 컬럼의 데이터를 포함하는 임의의 `SELECT` 쿼리를 실행할 수 있게 해줍니다. 예를 들어, `SELECT x FROM db.table`. `john`은 `SELECT z FROM db.table`을 실행할 수 없습니다. `SELECT * FROM db.table`도 사용할 수 없습니다. 이 쿼리를 처리하는 동안 ClickHouse는 데이터도 반환하지 않습니다, 심지어 `x`와 `y`도 마찬가지입니다. 유일한 예외는 테이블이 오직 `x`와 `y` 컬럼만 포함하고 있을 경우입니다. 이 경우 ClickHouse는 모든 데이터를 반환합니다.

### INSERT {#insert}

[INSERT](../../sql-reference/statements/insert-into.md) 쿼리를 실행할 수 있습니다.

권한 수준: `COLUMN`.

**설명**

이 권한이 부여된 사용자는 지정된 테이블과 데이터베이스의 지정된 컬럼 목록에서 `INSERT` 쿼리를 실행할 수 있습니다. 사용자가 다른 컬럼을 포함하면 지정된 쿼리는 데이터를 삽입하지 않습니다.

**예제**

```sql
GRANT INSERT(x,y) ON db.table TO john
```

부여된 권한은 `john`이 `db.table`의 `x` 및/또는 `y` 컬럼에 데이터를 삽입할 수 있게 해줍니다.

### ALTER {#alter}

다음 권한 계층에 따라 [ALTER](../../sql-reference/statements/alter/index.md) 쿼리를 실행할 수 있습니다:

- `ALTER`. 수준: `COLUMN`.
  - `ALTER TABLE`. 수준: `GROUP`
  - `ALTER UPDATE`. 수준: `COLUMN`. 별칭: `UPDATE`
  - `ALTER DELETE`. 수준: `COLUMN`. 별칭: `DELETE`
  - `ALTER COLUMN`. 수준: `GROUP`
  - `ALTER ADD COLUMN`. 수준: `COLUMN`. 별칭: `ADD COLUMN`
  - `ALTER DROP COLUMN`. 수준: `COLUMN`. 별칭: `DROP COLUMN`
  - `ALTER MODIFY COLUMN`. 수준: `COLUMN`. 별칭: `MODIFY COLUMN`
  - `ALTER COMMENT COLUMN`. 수준: `COLUMN`. 별칭: `COMMENT COLUMN`
  - `ALTER CLEAR COLUMN`. 수준: `COLUMN`. 별칭: `CLEAR COLUMN`
  - `ALTER RENAME COLUMN`. 수준: `COLUMN`. 별칭: `RENAME COLUMN`
  - `ALTER INDEX`. 수준: `GROUP`. 별칭: `INDEX`
  - `ALTER ORDER BY`. 수준: `TABLE`. 별칭: `ALTER MODIFY ORDER BY`, `MODIFY ORDER BY`
  - `ALTER SAMPLE BY`. 수준: `TABLE`. 별칭: `ALTER MODIFY SAMPLE BY`, `MODIFY SAMPLE BY`
  - `ALTER ADD INDEX`. 수준: `TABLE`. 별칭: `ADD INDEX`
  - `ALTER DROP INDEX`. 수준: `TABLE`. 별칭: `DROP INDEX`
  - `ALTER MATERIALIZE INDEX`. 수준: `TABLE`. 별칭: `MATERIALIZE INDEX`
  - `ALTER CLEAR INDEX`. 수준: `TABLE`. 별칭: `CLEAR INDEX`
  - `ALTER CONSTRAINT`. 수준: `GROUP`. 별칭: `CONSTRAINT`
  - `ALTER ADD CONSTRAINT`. 수준: `TABLE`. 별칭: `ADD CONSTRAINT`
  - `ALTER DROP CONSTRAINT`. 수준: `TABLE`. 별칭: `DROP CONSTRAINT`
  - `ALTER TTL`. 수준: `TABLE`. 별칭: `ALTER MODIFY TTL`, `MODIFY TTL`
  - `ALTER MATERIALIZE TTL`. 수준: `TABLE`. 별칭: `MATERIALIZE TTL`
  - `ALTER SETTINGS`. 수준: `TABLE`. 별칭: `ALTER SETTING`, `ALTER MODIFY SETTING`, `MODIFY SETTING`
  - `ALTER MOVE PARTITION`. 수준: `TABLE`. 별칭: `ALTER MOVE PART`, `MOVE PARTITION`, `MOVE PART`
  - `ALTER FETCH PARTITION`. 수준: `TABLE`. 별칭: `ALTER FETCH PART`, `FETCH PARTITION`, `FETCH PART`
  - `ALTER FREEZE PARTITION`. 수준: `TABLE`. 별칭: `FREEZE PARTITION`
  - `ALTER VIEW`. 수준: `GROUP`
  - `ALTER VIEW REFRESH`. 수준: `VIEW`. 별칭: `REFRESH VIEW`
  - `ALTER VIEW MODIFY QUERY`. 수준: `VIEW`. 별칭: `ALTER TABLE MODIFY QUERY`
  - `ALTER VIEW MODIFY SQL SECURITY`. 수준: `VIEW`. 별칭: `ALTER TABLE MODIFY SQL SECURITY`

이 계층 구조가 어떻게 다루어지는지에 대한 예시는 다음과 같습니다:

- `ALTER` 권한은 모든 다른 `ALTER*` 권한을 포함합니다.
- `ALTER CONSTRAINT`는 `ALTER ADD CONSTRAINT` 및 `ALTER DROP CONSTRAINT` 권한을 포함합니다.

**노트**

- `MODIFY SETTING` 권한은 테이블 엔진 설정을 수정할 수 있습니다. 이는 설정이나 서버 구성 매개변수에는 영향을 주지 않습니다.
- `ATTACH` 작업은 [CREATE](#create) 권한이 필요합니다.
- `DETACH` 작업은 [DROP](#drop) 권한이 필요합니다.
- [KILL MUTATION](../../sql-reference/statements/kill.md#kill-mutation) 쿼리로 변형을 중지하려면 이 변형을 시작할 수 있는 권한이 필요합니다. 예를 들어, `ALTER UPDATE` 쿼리를 중지하려면 `ALTER UPDATE`, `ALTER TABLE` 또는 `ALTER` 권한이 필요합니다.

### BACKUP {#backup}

쿼리에서 [`BACKUP`]을 실행할 수 있습니다. 백업에 대한 더 많은 정보는 ["Backup and Restore"](../../operations/backup.md)를 참조하십시오.

### CREATE {#create}

다음 권한 계층에 따라 [CREATE](../../sql-reference/statements/create/index.md) 및 [ATTACH](../../sql-reference/statements/attach.md) DDL 쿼리를 실행할 수 있습니다:

- `CREATE`. 수준: `GROUP`
  - `CREATE DATABASE`. 수준: `DATABASE`
  - `CREATE TABLE`. 수준: `TABLE`
    - `CREATE ARBITRARY TEMPORARY TABLE`. 수준: `GLOBAL`
      - `CREATE TEMPORARY TABLE`. 수준: `GLOBAL`
  - `CREATE VIEW`. 수준: `VIEW`
  - `CREATE DICTIONARY`. 수준: `DICTIONARY`

**노트**

- 생성된 테이블을 삭제하려면 사용자가 [DROP](#drop) 권한이 필요합니다.

### CLUSTER {#cluster}

`ON CLUSTER` 쿼리를 실행할 수 있습니다.

```sql title="Syntax"
GRANT CLUSTER ON *.* TO <username>
```

기본적으로 `ON CLUSTER`가 있는 쿼리는 사용자가 `CLUSTER` 권한을 가져야 합니다. 다음과 같은 오류가 발생합니다:

```text
Not enough privileges. To execute this query, it's necessary to have the grant CLUSTER ON *.*. 
```

기본 동작은 `config.xml`의 `access_control_improvements` 섹션에 있는 `on_cluster_queries_require_cluster_grant` 설정을 `false`로 설정함으로써 변경할 수 있습니다.

```yaml title="config.xml"
<access_control_improvements>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
</access_control_improvements>
```

### DROP {#drop}

다음 권한 계층에 따라 [DROP](../../sql-reference/statements/drop.md) 및 [DETACH](../../sql-reference/statements/detach.md) 쿼리를 실행할 수 있습니다:

- `DROP`. 수준: `GROUP`
  - `DROP DATABASE`. 수준: `DATABASE`
  - `DROP TABLE`. 수준: `TABLE`
  - `DROP VIEW`. 수준: `VIEW`
  - `DROP DICTIONARY`. 수준: `DICTIONARY`

### TRUNCATE {#truncate}

[TRUNCATE](../../sql-reference/statements/truncate.md) 쿼리를 실행할 수 있습니다.

권한 수준: `TABLE`.

### OPTIMIZE {#optimize}

[OPTIMIZE TABLE](../../sql-reference/statements/optimize.md) 쿼리를 실행할 수 있습니다.

권한 수준: `TABLE`.

### SHOW {#show}

`SHOW`, `DESCRIBE`, `USE`, 및 `EXISTS` 쿼리를 다음 권한 계층에 따라 실행할 수 있습니다:

- `SHOW`. 수준: `GROUP`
  - `SHOW DATABASES`. 수준: `DATABASE`. `SHOW DATABASES`, `SHOW CREATE DATABASE`, `USE <database>` 쿼리를 실행할 수 있습니다.
  - `SHOW TABLES`. 수준: `TABLE`. `SHOW TABLES`, `EXISTS <table>`, `CHECK <table>` 쿼리를 실행할 수 있습니다.
  - `SHOW COLUMNS`. 수준: `COLUMN`. `SHOW CREATE TABLE`, `DESCRIBE` 쿼리를 실행할 수 있습니다.
  - `SHOW DICTIONARIES`. 수준: `DICTIONARY`. `SHOW DICTIONARIES`, `SHOW CREATE DICTIONARY`, `EXISTS <dictionary>` 쿼리를 실행할 수 있습니다.

**노트**

사용자가 지정된 테이블, 딕셔너리 또는 데이터베이스에 대한 다른 권한을 가진 경우 `SHOW` 권한을 가집니다.

### KILL QUERY {#kill-query}

[КILL](../../sql-reference/statements/kill.md#kill-query) 쿼리를 실행할 수 있습니다.

권한 수준: `GLOBAL`.

**노트**

`KILL QUERY` 권한은 사용자에게 다른 사용자의 쿼리를 중지할 수 있게 해줍니다.

### ACCESS MANAGEMENT {#access-management}

사용자가 사용자, 역할 및 행 정책을 관리하는 쿼리를 실행할 수 있게 합니다.

- `ACCESS MANAGEMENT`. 수준: `GROUP`
  - `CREATE USER`. 수준: `GLOBAL`
  - `ALTER USER`. 수준: `GLOBAL`
  - `DROP USER`. 수준: `GLOBAL`
  - `CREATE ROLE`. 수준: `GLOBAL`
  - `ALTER ROLE`. 수준: `GLOBAL`
  - `DROP ROLE`. 수준: `GLOBAL`
  - `ROLE ADMIN`. 수준: `GLOBAL`
  - `CREATE ROW POLICY`. 수준: `GLOBAL`. 별칭: `CREATE POLICY`
  - `ALTER ROW POLICY`. 수준: `GLOBAL`. 별칭: `ALTER POLICY`
  - `DROP ROW POLICY`. 수준: `GLOBAL`. 별칭: `DROP POLICY`
  - `CREATE QUOTA`. 수준: `GLOBAL`
  - `ALTER QUOTA`. 수준: `GLOBAL`
  - `DROP QUOTA`. 수준: `GLOBAL`
  - `CREATE SETTINGS PROFILE`. 수준: `GLOBAL`. 별칭: `CREATE PROFILE`
  - `ALTER SETTINGS PROFILE`. 수준: `GLOBAL`. 별칭: `ALTER PROFILE`
  - `DROP SETTINGS PROFILE`. 수준: `GLOBAL`. 별칭: `DROP PROFILE`
  - `SHOW ACCESS`. 수준: `GROUP`
    - `SHOW_USERS`. 수준: `GLOBAL`. 별칭: `SHOW CREATE USER`
    - `SHOW_ROLES`. 수준: `GLOBAL`. 별칭: `SHOW CREATE ROLE`
    - `SHOW_ROW_POLICIES`. 수준: `GLOBAL`. 별칭: `SHOW POLICIES`, `SHOW CREATE ROW POLICY`, `SHOW CREATE POLICY`
    - `SHOW_QUOTAS`. 수준: `GLOBAL`. 별칭: `SHOW CREATE QUOTA`
    - `SHOW_SETTINGS_PROFILES`. 수준: `GLOBAL`. 별칭: `SHOW PROFILES`, `SHOW CREATE SETTINGS PROFILE`, `SHOW CREATE PROFILE`
  - `ALLOW SQL SECURITY NONE`. 수준: `GLOBAL`. 별칭: `CREATE SQL SECURITY NONE`, `SQL SECURITY NONE`, `SECURITY NONE`

`ROLE ADMIN` 권한은 사용자가 권한 옵션 없이도 모든 역할을 할당하거나 취소할 수 있게 해줍니다.

### SYSTEM {#system}

사용자가 [SYSTEM](../../sql-reference/statements/system.md) 쿼리를 실행할 수 있게 합니다.

- `SYSTEM`. 수준: `GROUP`
  - `SYSTEM SHUTDOWN`. 수준: `GLOBAL`. 별칭: `SYSTEM KILL`, `SHUTDOWN`
  - `SYSTEM DROP CACHE`. 별칭: `DROP CACHE`
    - `SYSTEM DROP DNS CACHE`. 수준: `GLOBAL`. 별칭: `SYSTEM DROP DNS`, `DROP DNS CACHE`, `DROP DNS`
    - `SYSTEM DROP MARK CACHE`. 수준: `GLOBAL`. 별칭: `SYSTEM DROP MARK`, `DROP MARK CACHE`, `DROP MARKS`
    - `SYSTEM DROP UNCOMPRESSED CACHE`. 수준: `GLOBAL`. 별칭: `SYSTEM DROP UNCOMPRESSED`, `DROP UNCOMPRESSED CACHE`, `DROP UNCOMPRESSED`
  - `SYSTEM RELOAD`. 수준: `GROUP`
    - `SYSTEM RELOAD CONFIG`. 수준: `GLOBAL`. 별칭: `RELOAD CONFIG`
    - `SYSTEM RELOAD DICTIONARY`. 수준: `GLOBAL`. 별칭: `SYSTEM RELOAD DICTIONARIES`, `RELOAD DICTIONARY`, `RELOAD DICTIONARIES`
      - `SYSTEM RELOAD EMBEDDED DICTIONARIES`. 수준: `GLOBAL`. 별칭: `RELOAD EMBEDDED DICTIONARIES`
  - `SYSTEM MERGES`. 수준: `TABLE`. 별칭: `SYSTEM STOP MERGES`, `SYSTEM START MERGES`, `STOP MERGES`, `START MERGES`
  - `SYSTEM TTL MERGES`. 수준: `TABLE`. 별칭: `SYSTEM STOP TTL MERGES`, `SYSTEM START TTL MERGES`, `STOP TTL MERGES`, `START TTL MERGES`
  - `SYSTEM FETCHES`. 수준: `TABLE`. 별칭: `SYSTEM STOP FETCHES`, `SYSTEM START FETCHES`, `STOP FETCHES`, `START FETCHES`
  - `SYSTEM MOVES`. 수준: `TABLE`. 별칭: `SYSTEM STOP MOVES`, `SYSTEM START MOVES`, `STOP MOVES`, `START MOVES`
  - `SYSTEM SENDS`. 수준: `GROUP`. 별칭: `SYSTEM STOP SENDS`, `SYSTEM START SENDS`, `STOP SENDS`, `START SENDS`
    - `SYSTEM DISTRIBUTED SENDS`. 수준: `TABLE`. 별칭: `SYSTEM STOP DISTRIBUTED SENDS`, `SYSTEM START DISTRIBUTED SENDS`, `STOP DISTRIBUTED SENDS`, `START DISTRIBUTED SENDS`
    - `SYSTEM REPLICATED SENDS`. 수준: `TABLE`. 별칭: `SYSTEM STOP REPLICATED SENDS`, `SYSTEM START REPLICATED SENDS`, `STOP REPLICATED SENDS`, `START REPLICATED SENDS`
  - `SYSTEM REPLICATION QUEUES`. 수준: `TABLE`. 별칭: `SYSTEM STOP REPLICATION QUEUES`, `SYSTEM START REPLICATION QUEUES`, `STOP REPLICATION QUEUES`, `START REPLICATION QUEUES`
  - `SYSTEM SYNC REPLICA`. 수준: `TABLE`. 별칭: `SYNC REPLICA`
  - `SYSTEM RESTART REPLICA`. 수준: `TABLE`. 별칭: `RESTART REPLICA`
  - `SYSTEM FLUSH`. 수준: `GROUP`
    - `SYSTEM FLUSH DISTRIBUTED`. 수준: `TABLE`. 별칭: `FLUSH DISTRIBUTED`
    - `SYSTEM FLUSH LOGS`. 수준: `GLOBAL`. 별칭: `FLUSH LOGS`

`SYSTEM RELOAD EMBEDDED DICTIONARIES` 권한은 `SYSTEM RELOAD DICTIONARY ON *.*` 권한에 의해 암묵적으로 부여됩니다.

### INTROSPECTION {#introspection}

[introspection](../../operations/optimizing-performance/sampling-query-profiler.md) 함수를 사용할 수 있게 해줍니다.

- `INTROSPECTION`. 수준: `GROUP`. 별칭: `INTROSPECTION FUNCTIONS`
  - `addressToLine`. 수준: `GLOBAL`
  - `addressToLineWithInlines`. 수준: `GLOBAL`
  - `addressToSymbol`. 수준: `GLOBAL`
  - `demangle`. 수준: `GLOBAL`

### SOURCES {#sources}

외부 데이터 소스를 사용할 수 있게 해줍니다. [테이블 엔진](../../engines/table-engines/index.md) 및 [테이블 함수](/sql-reference/table-functions)에 적용됩니다.

- `READ`. 수준: `GLOBAL_WITH_PARAMETER`  
- `WRITE`. 수준: `GLOBAL_WITH_PARAMETER`

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
소스에 대한 READ/WRITE 권한 분리는 25.7 버전부터 사용할 수 있으며, 서버 설정 `access_control_improvements.enable_read_write_grants`가 필요합니다.

그렇지 않으면 `GRANT AZURE ON *.* TO user` 구문을 사용해야 합니다. 이는 새로운 `GRANT READ, WRITE ON AZURE TO user`와 동일합니다.
:::

예시:

- [MySQL 테이블 엔진](../../engines/table-engines/integrations/mysql.md)으로 테이블을 생성하려면 `CREATE TABLE (ON db.table_name)` 및 `MYSQL` 권한이 필요합니다.
- [mysql 테이블 함수](../../sql-reference/table-functions/mysql.md)를 사용하려면 `CREATE TEMPORARY TABLE` 및 `MYSQL` 권한이 필요합니다.

### 소스 필터 권한 {#source-filter-grants}

:::note
이 기능은 25.8 버전부터 사용할 수 있으며, 서버 설정 `access_control_improvements.enable_read_write_grants`가 필요합니다.
:::

정규 표현식 필터를 사용하여 특정 소스 URI에 대한 접근 권한을 부여할 수 있습니다. 이를 통해 사용자가 접근할 수 있는 외부 데이터 소스에 대한 세밀한 제어가 가능합니다.

**구문:**

```sql
GRANT READ ON S3('regexp_pattern') TO user
```

이 권한은 사용자가 지정된 정규 표현식 패턴이 일치하는 S3 URI에서만 읽을 수 있도록 허용합니다.

**예시:**

특정 S3 버킷 경로에 대한 접근 권한 부여:
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
소스 필터는 **regexp**를 매개변수로 사용하므로, 권한 `GRANT READ ON URL('http://www.google.com') TO john;`은

다음 쿼리를 허용합니다:
```sql
SELECT * FROM url('https://www.google.com');
SELECT * FROM url('https://www-google.com');
```

정규 표현식에서는 `.`이 `Any Single Character`로 처리되기 때문에, 잠재적인 취약성으로 이어질 수 있습니다. 올바른 권한은
```sql
GRANT READ ON URL('https://www\.google\.com') TO john;
```
이어야 합니다.
:::

**GRANT OPTION을 사용한 재부여:**

원래의 권한이 `WITH GRANT OPTION`이 있는 경우, `GRANT CURRENT GRANTS`를 사용하여 재부여할 수 있습니다:
```sql
-- Original grant with GRANT OPTION
GRANT READ ON S3('s3://foo/.*') TO john WITH GRANT OPTION

-- John can now regrant this access to others
GRANT CURRENT GRANTS(READ ON S3) TO alice
```

**중요한 제한 사항:**

- **부분적인 취소는 허용되지 않습니다:** 부여된 필터 패턴의 하위 집합을 취소할 수 없습니다. 필요할 경우 전체 권한을 취소하고 새 패턴으로 재부여해야 합니다.
- **와일드카드 권한은 허용되지 않습니다:** `GRANT READ ON *('regexp')` 또는 유사한 와일드카드 전용 패턴을 사용할 수 없습니다. 특정 소스를 제공해야 합니다.

### dictGet {#dictget}

- `dictGet`. 별칭: `dictHas`, `dictGetHierarchy`, `dictIsIn`

사용자가 [dictGet](/sql-reference/functions/ext-dict-functions#dictget-dictgetordefault-dictgetornull), [dictHas](../../sql-reference/functions/ext-dict-functions.md#dicthas), [dictGetHierarchy](../../sql-reference/functions/ext-dict-functions.md#dictgethierarchy), [dictIsIn](../../sql-reference/functions/ext-dict-functions.md#dictisin) 함수를 실행할 수 있습니다.

권한 수준: `DICTIONARY`.

**예시**

- `GRANT dictGet ON mydb.mydictionary TO john`
- `GRANT dictGet ON mydictionary TO john`

### displaySecretsInShowAndSelect {#displaysecretsinshowandselect}

사용자가 `SHOW` 및 `SELECT` 쿼리에서 비밀을 볼 수 있게 해줍니다. 단, 두 가지 조건이 모두 충족되어야 합니다.
[`display_secrets_in_show_and_select` 서버 설정](../../operations/server-configuration-parameters/settings#display_secrets_in_show_and_select)
및
[`format_display_secrets_in_show_and_select` 포맷 설정](../../operations/settings/formats#format_display_secrets_in_show_and_select)
이 켜져 있어야 합니다.

### NAMED COLLECTION ADMIN {#named-collection-admin}

지정된 이름 있는 컬렉션에 대한 작업을 허용합니다. 23.7 버전 이전에는 NAMED COLLECTION CONTROL이라고 불렸으며, 23.7 이후에 NAMED COLLECTION ADMIN이 추가되었고 NAMED COLLECTION CONTROL은 별칭으로 보존되었습니다.

- `NAMED COLLECTION ADMIN`. 수준: `NAMED_COLLECTION`. 별칭: `NAMED COLLECTION CONTROL`
  - `CREATE NAMED COLLECTION`. 수준: `NAMED_COLLECTION`
  - `DROP NAMED COLLECTION`. 수준: `NAMED_COLLECTION`
  - `ALTER NAMED COLLECTION`. 수준: `NAMED_COLLECTION`
  - `SHOW NAMED COLLECTIONS`. 수준: `NAMED_COLLECTION`. 별칭: `SHOW NAMED COLLECTIONS`
  - `SHOW NAMED COLLECTIONS SECRETS`. 수준: `NAMED_COLLECTION`. 별칭: `SHOW NAMED COLLECTIONS SECRETS`
  - `NAMED COLLECTION`. 수준: `NAMED_COLLECTION`. 별칭: `NAMED COLLECTION USAGE, USE NAMED COLLECTION`

다른 권한 (CREATE, DROP, ALTER, SHOW)과는 달리 NAMED COLLECTION 권한은 오직 23.7에서만 추가되었으며, 나머지는 이전에 추가되었습니다 - 22.12에서.

**예시**

가정하는 이름 있는 컬렉션이 abc라고 하면, 사용자 john에게 CREATE NAMED COLLECTION 권한을 부여합니다.
- `GRANT CREATE NAMED COLLECTION ON abc TO john`

### TABLE ENGINE {#table-engine}

테이블 생성 시 지정된 테이블 엔진을 사용할 수 있게 해줍니다. [테이블 엔진](../../engines/table-engines/index.md)에 적용됩니다.

**예시**

- `GRANT TABLE ENGINE ON * TO john`
- `GRANT TABLE ENGINE ON TinyLog TO john`

### ALL {#all}

<CloudNotSupportedBadge/>

규제된 엔터티에 대한 모든 권한을 사용자 계정이나 역할에 부여합니다.

:::note
`ALL` 권한은 ClickHouse Cloud에서 지원되지 않으며, 이 곳에서 `default` 사용자는 제한된 권한을 가집니다. 사용자는 [여기](/cloud/security/manage-cloud-users)에서 추가 세부 사항을 확인하여 `default_role`을 부여함으로써 최대 권한을 사용자에게 부여할 수 있습니다. 사용자는 또한 기본 사용자로 `GRANT CURRENT GRANTS`를 사용하여 `ALL`과 유사한 효과를 얻을 수 있습니다.
:::

### NONE {#none}

아무 권한도 부여하지 않습니다.

### ADMIN OPTION {#admin-option}

`ADMIN OPTION` 권한은 사용자가 자신의 역할을 다른 사용자에게 부여할 수 있게 해줍니다.
