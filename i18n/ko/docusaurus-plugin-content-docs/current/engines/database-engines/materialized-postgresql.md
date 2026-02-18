---
description: 'PostgreSQL 데이터베이스의 테이블을 기반으로 ClickHouse 데이터베이스를 생성합니다.'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 60
slug: /engines/database-engines/materialized-postgresql
title: 'MaterializedPostgreSQL'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL \{#materializedpostgresql\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
ClickHouse Cloud 사용자는 PostgreSQL에서 ClickHouse로의 복제를 위해 [ClickPipes](/integrations/clickpipes)를 사용할 것을 권장합니다. 이 방법은 PostgreSQL에 대해 고성능 CDC(Change Data Capture)를 네이티브로 지원합니다.
:::

PostgreSQL 데이터베이스의 테이블로 구성된 ClickHouse 데이터베이스를 생성합니다. 먼저 `MaterializedPostgreSQL` 엔진을 사용하는 데이터베이스가 PostgreSQL 데이터베이스의 스냅샷을 생성하고 필요한 테이블을 로드합니다. 필요한 테이블에는 지정된 데이터베이스의 스키마들 중 임의의 부분 집합에서 선택한 임의의 테이블 부분 집합이 포함될 수 있습니다. 스냅샷과 함께 데이터베이스 엔진은 LSN을 획득하고, 테이블의 초기 덤프가 완료되면 WAL에서 업데이트를 가져오기 시작합니다. 데이터베이스가 생성된 이후에 PostgreSQL 데이터베이스에 새로 추가된 테이블은 자동으로 복제에 포함되지 않습니다. 이러한 테이블은 `ATTACH TABLE db.table` 쿼리를 사용하여 수동으로 추가해야 합니다.

복제는 PostgreSQL Logical Replication 프로토콜로 구현되며, 이 프로토콜은 DDL 복제는 허용하지 않지만 복제를 중단시키는 변경(컬럼 타입 변경, 컬럼 추가/제거)이 발생했는지는 알 수 있도록 해 줍니다. 이러한 변경이 감지되면 해당 테이블은 업데이트 수신을 중지합니다. 이 경우 `ATTACH` / `DETACH PERMANENTLY` 쿼리를 사용하여 테이블을 완전히 다시 로드해야 합니다. DDL이 복제를 중단시키지 않는 경우(예: 컬럼 이름 변경)에는 테이블이 계속해서 업데이트를 수신합니다(삽입은 위치 기준으로 수행됩니다).

:::note
이 데이터베이스 엔진은 실험적 기능입니다. 사용하려면 설정 파일에서 또는 `SET` 명령을 사용하여 `allow_experimental_database_materialized_postgresql` 값을 1로 설정해야 합니다:

```sql
SET allow_experimental_database_materialized_postgresql=1
```

:::


## 데이터베이스 생성 \{#creating-a-database\}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**엔진 매개변수**

* `host:port` — PostgreSQL 서버 주소와 포트.
* `database` — PostgreSQL 데이터베이스 이름.
* `user` — PostgreSQL 사용자 이름.
* `password` — 사용자 비밀번호.


## 사용 예 \{#example-of-use\}

```sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```


## 복제에 새 테이블을 동적으로 추가하기 \{#dynamically-adding-table-to-replication\}

`MaterializedPostgreSQL` 데이터베이스를 CREATE한 이후에는 해당 PostgreSQL 데이터베이스에서 새로 생성된 테이블을 자동으로 감지하지 않습니다. 이러한 테이블은 수동으로 추가할 수 있습니다.

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
22.1 버전 이전에는 테이블을 복제에 추가하면 제거되지 않은 임시 복제 슬롯(이름: `{db_name}_ch_replication_slot_tmp`)이 남았습니다. 22.1 이전 버전의 ClickHouse에서 테이블을 ATTACH 하는 경우 이 슬롯을 수동으로 삭제해야 합니다 (`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`). 그렇지 않으면 디스크 사용량이 증가합니다. 이 문제는 22.1 버전에서 수정되었습니다.
:::


## 복제 대상에서 테이블을 동적으로 제거하기 \{#dynamically-removing-table-from-replication\}

특정 테이블을 복제 대상에서 동적으로 제외할 수 있습니다.

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```


## PostgreSQL 스키마 \{#schema\}

PostgreSQL [스키마](https://www.postgresql.org/docs/9.1/ddl-schemas.html)는 3가지 방식으로 구성할 수 있습니다(버전 21.12부터).

1. 하나의 `MaterializedPostgreSQL` 데이터베이스 엔진에 하나의 스키마를 사용하는 방식입니다. `materialized_postgresql_schema` 설정을 사용해야 합니다.
   테이블은 테이블 이름만으로 접근합니다:

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 하나의 `MaterializedPostgreSQL` 데이터베이스 엔진에서, 지정된 테이블 집합을 갖는 스키마를 임의의 개수만큼 사용할 수 있습니다. `materialized_postgresql_tables_list` 설정을 사용해야 합니다. 각 테이블은 해당 스키마와 함께 저장됩니다.
   테이블은 스키마 이름과 테이블 이름을 함께 사용하여 참조합니다:

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

그러나 이 경우 `materialized_postgresql_tables_list`에 있는 모든 테이블은 스키마 이름까지 포함하여 지정해야 합니다.
`materialized_postgresql_tables_list_with_schema = 1` 설정이 필요합니다.

경고: 이 경우 테이블 이름에 점(dot)을 사용할 수 없습니다.

3. 하나의 `MaterializedPostgreSQL` 데이터베이스 엔진에 대해 여러 개의 스키마를 사용하면서 각 스키마에 대해 모든 테이블 전체 집합을 사용할 수 있습니다. 이 경우 설정 `materialized_postgresql_schema_list`를 사용해야 합니다.

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

경고: 이 경우 테이블 이름에 마침표(.)를 사용할 수 없습니다.


## 요구 사항 \{#requirements\}

1. PostgreSQL 설정 파일에서 [wal&#95;level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 설정은 값이 `logical`로 설정되어야 하며, `max_replication_slots` 매개변수는 최소 `2` 이상으로 설정되어야 합니다.

2. 각 복제된 테이블은 다음 [replica identity](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY) 중 하나를 가져야 합니다:

* 기본 키(기본값)

* 인덱스

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

기본 키는 항상 먼저 확인됩니다. 기본 키가 없으면 레플리카 식별 인덱스로 정의된 인덱스가 확인됩니다.
인덱스를 레플리카 식별자로 사용하는 경우, 테이블에는 이러한 인덱스가 하나만 존재해야 합니다.
다음 명령으로 특정 테이블에 어떤 타입이 사용되는지 확인할 수 있습니다.

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
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 값의 복제는 지원되지 않습니다. 데이터 타입의 기본값이 대신 사용됩니다.
:::


## Settings \{#settings\}

### `materialized_postgresql_tables_list` \{#materialized-postgresql-tables-list\}

[MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md) 데이터베이스 엔진을 통해 복제할 PostgreSQL 데이터베이스 테이블을 쉼표로 구분한 목록을 설정합니다.

각 테이블은 대괄호 안에 복제할 컬럼의 부분 집합을 지정할 수 있습니다. 컬럼의 부분 집합을 생략하면, 해당 테이블의 모든 컬럼이 복제됩니다.

```sql
materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
```

기본값: 빈 목록 — 전체 PostgreSQL 데이터베이스가 복제됨을 의미합니다.

### `materialized_postgresql_schema` \{#materialized-postgresql-schema\}

기본값: 빈 문자열. (기본 스키마가 사용됩니다)

### `materialized_postgresql_schema_list` \{#materialized-postgresql-schema-list\}

기본값: 빈 목록. (기본 스키마가 사용됩니다)

### `materialized_postgresql_max_block_size` \{#materialized-postgresql-max-block-size\}

PostgreSQL 데이터베이스 테이블에 데이터를 기록하기 전에 메모리에 모아 두는 행(row) 수를 설정합니다.

가능한 값:

* 양의 정수.

기본값: `65536`.

### `materialized_postgresql_replication_slot` \{#materialized-postgresql-replication-slot\}

사용자가 생성한 복제(replication) 슬롯입니다. `materialized_postgresql_snapshot`과 함께 사용해야 합니다.

### `materialized_postgresql_snapshot` \{#materialized-postgresql-snapshot\}

[PostgreSQL 테이블의 초기 덤프](../../engines/database-engines/materialized-postgresql.md)를 수행할 스냅샷을 식별하는 텍스트 문자열입니다. `materialized_postgresql_replication_slot`과 함께 사용해야 합니다.

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

SELECT * FROM database1.table1;
```

필요하다면 DDL 쿼리를 사용하여 설정을 변경할 수 있습니다. 그러나 `materialized_postgresql_tables_list` 설정은 변경할 수 없습니다. 이 설정에 포함된 테이블 목록을 업데이트하려면 `ATTACH TABLE` 쿼리를 사용하십시오.

```sql
ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
```

### `materialized_postgresql_use_unique_replication_consumer_identifier` \{#materialized_postgresql_use_unique_replication_consumer_identifier\}

복제를 위해 고유한 복제 컨슈머 식별자를 사용합니다. 기본값은 `0`입니다.
`1`로 설정하면 여러 `MaterializedPostgreSQL` 테이블을 동일한 `PostgreSQL` 테이블을 가리키도록 설정할 수 있습니다.


## 참고 \{#notes\}

### 논리 복제 슬롯 장애 조치(failover) \{#logical-replication-slot-failover\}

기본(primary) 서버에 존재하는 논리 복제 슬롯(Logical Replication Slot)은 대기(standby) 레플리카에서는 사용할 수 없습니다.
따라서 장애 조치가 발생하면, 새로운 기본 서버(이전의 물리적 대기 서버)는 이전 기본 서버에 존재하던 슬롯을 인지하지 못합니다. 이로 인해 PostgreSQL 복제가 중단된 상태가 됩니다.
이에 대한 한 가지 해결책은 복제 슬롯을 직접 관리하고, 영구 복제 슬롯을 정의하는 것입니다(자세한 정보는 [여기](https://patroni.readthedocs.io/en/latest/SETTINGS.html)에서 확인할 수 있습니다). 슬롯 이름은 `materialized_postgresql_replication_slot` 설정을 통해 전달해야 하며, 트랜잭션은 `EXPORT SNAPSHOT` 옵션으로 내보내야 합니다. 스냅샷 식별자는 `materialized_postgresql_snapshot` 설정을 통해 전달해야 합니다.

이는 실제로 필요한 경우에만 사용해야 합니다. 이에 대한 명확한 필요나 동작 방식에 대한 충분한 이해가 없다면, 테이블 엔진이 자체 복제 슬롯을 생성하고 관리하도록 두는 편이 더 좋습니다.

**예시 ([@bchrobot](https://github.com/bchrobot) 제공)**

1. PostgreSQL에서 복제 슬롯을 구성합니다.

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

2. 복제 슬롯이 준비될 때까지 기다린 후, 트랜잭션을 시작하고 트랜잭션 스냅샷 식별자를 내보냅니다:

    ```sql
    BEGIN;
    SELECT pg_export_snapshot();
    ```

3. ClickHouse에서 데이터베이스를 생성합니다:

    ```sql
    CREATE DATABASE demodb
    ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
    SETTINGS
      materialized_postgresql_replication_slot = 'clickhouse_sync',
      materialized_postgresql_snapshot = '0000000A-0000023F-3',
      materialized_postgresql_tables_list = 'table1,table2,table3';
    ```

4. ClickHouse DB로의 복제가 확인되면 PostgreSQL 트랜잭션을 종료합니다. 장애 조치 이후에도 복제가 계속되는지 확인합니다:

    ```bash
    kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
    ```

### 필요한 권한 \{#required-permissions\}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) -- CREATE PUBLICATION을 실행할 수 있는 권한.

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) -- 복제 권한.

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) -- 복제 권한 또는 슈퍼유저 권한.

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) -- publication 소유자(MaterializedPostgreSQL 엔진 구성의 `username`) 권한.

`2`와 `3` 명령을 실행하지 않고 해당 권한을 요구하지 않도록 하는 것도 가능합니다. 대신 `materialized_postgresql_replication_slot` 및 `materialized_postgresql_snapshot` 설정을 사용할 수 있습니다. 단, 매우 주의해서 사용해야 합니다.

테이블 접근 권한:

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
