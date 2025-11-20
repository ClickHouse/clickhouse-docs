---
'description': 'PostgreSQL 데이터베이스의 테이블로 ClickHouse DATABASE를 생성합니다.'
'sidebar_label': '물리화된PostgreSQL'
'sidebar_position': 60
'slug': '/engines/database-engines/materialized-postgresql'
'title': '물리화된PostgreSQL'
'doc_type': 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud 사용자는 PostgreSQL 복제를 ClickHouse로 위해 [ClickPipes](/integrations/clickpipes) 사용을 권장합니다. 이는 PostgreSQL에 대한 고성능 변경 데이터 캡처(CDC)를 기본적으로 지원합니다.
:::

PostgreSQL 데이터베이스에서 테이블로 ClickHouse 데이터베이스를 생성합니다. 우선, `MaterializedPostgreSQL` 엔진을 사용하여 데이터베이스가 PostgreSQL 데이터베이스의 스냅샷을 생성하고 필요한 테이블을 로드합니다. 필요한 테이블은 지정된 데이터베이스의 모든 스키마에서 테이블의 부분 집합을 포함할 수 있습니다. 스냅샷과 함께 데이터베이스 엔진은 LSN을 확보하고, 테이블의 초기 덤프가 수행되면 WAL에서 업데이트를.pull하기 시작합니다. 데이터베이스가 생성된 후, PostgreSQL 데이터베이스에 새로 추가된 테이블은 자동으로 복제에 추가되지 않습니다. `ATTACH TABLE db.table` 쿼리를 사용하여 수동으로 추가해야 합니다.

복제는 PostgreSQL 논리 복제 프로토콜로 구현되며, DDL을 복제하는 것은 허용되지 않지만 복제를 방해하는 변경 사항(컬럼 유형 변경, 컬럼 추가/제거)이 발생했는지 알 수 있습니다. 이러한 변경 사항은 감지되며 해당 테이블은 업데이트를 받지 않게 됩니다. 이 경우 `ATTACH`/ `DETACH PERMANENTLY` 쿼리를 사용하여 테이블을 완전히 다시 로드해야 합니다. DDL이 복제를 방해하지 않는 경우(예: 컬럼 이름 변경) 테이블은 여전히 업데이트를 받게 됩니다(삽입은 위치에 따라 처리됨).

:::note
이 데이터베이스 엔진은 실험적입니다. 사용하려면 구성 파일에서 `allow_experimental_database_materialized_postgresql`를 1로 설정하거나 `SET` 명령을 사용하여 설정하십시오:
```sql
SET allow_experimental_database_materialized_postgresql=1
```
:::

## 데이터베이스 생성 {#creating-a-database}

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster]
ENGINE = MaterializedPostgreSQL('host:port', 'database', 'user', 'password') [SETTINGS ...]
```

**엔진 파라미터**

- `host:port` — PostgreSQL 서버 엔드포인트.
- `database` — PostgreSQL 데이터베이스 이름.
- `user` — PostgreSQL 사용자.
- `password` — 사용자 비밀번호.

## 사용 예시 {#example-of-use}

```sql
CREATE DATABASE postgres_db
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password');

SHOW TABLES FROM postgres_db;

┌─name───┐
│ table1 │
└────────┘

SELECT * FROM postgresql_db.postgres_table;
```

## 복제에 새 테이블을 동적으로 추가하기 {#dynamically-adding-table-to-replication}

`MaterializedPostgreSQL` 데이터베이스가 생성된 후, 해당 PostgreSQL 데이터베이스에서 새 테이블을 자동으로 감지하지 않습니다. 그러한 테이블은 수동으로 추가할 수 있습니다:

```sql
ATTACH TABLE postgres_database.new_table;
```

:::warning
버전 22.1 이전에 복제에 테이블을 추가하면 제거되지 않은 임시 복제 슬롯(대명칭 `{db_name}_ch_replication_slot_tmp`)이 남습니다. ClickHouse 버전 22.1 이전에서 테이블을 추가할 경우, 이를 수동으로 삭제해야 합니다 (`SELECT pg_drop_replication_slot('{db_name}_ch_replication_slot_tmp')`). 그렇지 않으면 디스크 사용량이 증가하게 됩니다. 이 문제는 22.1에서 수정되었습니다.
:::

## 복제에서 테이블 동적으로 제거하기 {#dynamically-removing-table-from-replication}

특정 테이블을 복제에서 제거할 수 있습니다:

```sql
DETACH TABLE postgres_database.table_to_remove PERMANENTLY;
```

## PostgreSQL 스키마 {#schema}

PostgreSQL [스키마](https://www.postgresql.org/docs/9.1/ddl-schemas.html)는 버전 21.12부터 3가지 방식으로 구성할 수 있습니다.

1. 하나의 `MaterializedPostgreSQL` 데이터베이스 엔진을 위한 하나의 스키마. `materialized_postgresql_schema` 설정을 사용해야 합니다.
테이블 이름만 통해 접근됩니다:

```sql
CREATE DATABASE postgres_database
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema = 'postgres_schema';

SELECT * FROM postgres_database.table1;
```

2. 하나의 `MaterializedPostgreSQL` 데이터베이스 엔진을 위한 지정된 테이블 집합의 여러 스키마. `materialized_postgresql_tables_list` 설정을 사용해야 합니다. 각 테이블은 해당 스키마와 함께 작성됩니다.
테이블 이름과 스키마 이름을 동시에 사용하여 접근합니다:

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'schema1.table1,schema2.table2,schema1.table3',
         materialized_postgresql_tables_list_with_schema = 1;

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema2.table2`;
```

이 경우 `materialized_postgresql_tables_list`에 있는 모든 테이블은 해당 스키마 이름과 함께 작성되어야 합니다.
`materialized_postgresql_tables_list_with_schema`를 1로 설정해야 합니다.

경고: 이 경우 테이블 이름에 점(.)을 사용할 수 없습니다.

3. 하나의 `MaterializedPostgreSQL` 데이터베이스 엔진을 위한 테이블의 전체 집합을 가진 여러 스키마. `materialized_postgresql_schema_list` 설정을 사용해야 합니다.

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_schema_list = 'schema1,schema2,schema3';

SELECT * FROM database1.`schema1.table1`;
SELECT * FROM database1.`schema1.table2`;
SELECT * FROM database1.`schema2.table2`;
```

경고: 이 경우 테이블 이름에 점(.)을 사용할 수 없습니다.

## 요구 사항 {#requirements}

1. PostgreSQL 구성 파일의 [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 설정은 `logical` 값이어야 하며, `max_replication_slots` 파라미터는 최소한 `2` 이상의 값을 가져야 합니다.

2. 각 복제 테이블은 다음 [레플리카 정체성](https://www.postgresql.org/docs/10/sql-altertable.html#SQL-CREATETABLE-REPLICA-IDENTITY) 중 하나를 가져야 합니다:

- 기본 키 (기본값)

- 인덱스

```bash
postgres# CREATE TABLE postgres_table (a Integer NOT NULL, b Integer, c Integer NOT NULL, d Integer, e Integer NOT NULL);
postgres# CREATE unique INDEX postgres_table_index on postgres_table(a, c, e);
postgres# ALTER TABLE postgres_table REPLICA IDENTITY USING INDEX postgres_table_index;
```

기본 키가 항상 먼저 확인됩니다. 만약 기본 키가 없으면, 레플리카 정체성 인덱스로 정의된 인덱스가 확인됩니다. 인덱스가 레플리카 정체성으로 사용될 경우, 테이블에는 그러한 인덱스가 하나만 있어야 합니다. 특정 테이블에 대해 어떤 유형이 사용되었는지 다음 명령으로 확인할 수 있습니다:

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
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 값을 복제하는 것은 지원되지 않습니다. 데이터 유형에 대한 기본 값이 사용됩니다.
:::

## 설정 {#settings}

### `materialized_postgresql_tables_list` {#materialized-postgresql-tables-list}

    복제될 PostgreSQL 데이터베이스 테이블의 쉼표로 구분된 목록을 설정합니다. 이는 [MaterializedPostgreSQL](../../engines/database-engines/materialized-postgresql.md) 데이터베이스 엔진을 통해 복제됩니다.

    각 테이블은 괄호 안의 복제된 컬럼의 부분 집합을 가질 수 있습니다. 컬럼의 부분 집합이 생략되면 테이블의 모든 컬럼이 복제됩니다.

```sql
materialized_postgresql_tables_list = 'table1(co1, col2),table2,table3(co3, col5, col7)
```

    기본값: 빈 목록 — 전체 PostgreSQL 데이터베이스가 복제됨을 의미합니다.

### `materialized_postgresql_schema` {#materialized-postgresql-schema}

    기본값: 빈 문자열. (기본 스키마가 사용됨)

### `materialized_postgresql_schema_list` {#materialized-postgresql-schema-list}

    기본값: 빈 목록. (기본 스키마가 사용됨)

### `materialized_postgresql_max_block_size` {#materialized-postgresql-max-block-size}

    PostgreSQL 데이터베이스 테이블에 데이터를 플러시하기 전에 메모리에 수집되는 행의 수를 설정합니다.

    가능한 값:

    - 양의 정수.

    기본값: `65536`.

### `materialized_postgresql_replication_slot` {#materialized-postgresql-replication-slot}

    사용자가 생성한 복제 슬롯. `materialized_postgresql_snapshot`와 함께 사용해야 합니다.

### `materialized_postgresql_snapshot` {#materialized_postgresql-snapshot}

    초기 덤프가 수행될 스냅샷을 식별하는 텍스트 문자열입니다 [PostgreSQL 테이블](../../engines/database-engines/materialized-postgresql.md). `materialized_postgresql_replication_slot`와 함께 사용해야 합니다.

```sql
CREATE DATABASE database1
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgres_user', 'postgres_password')
SETTINGS materialized_postgresql_tables_list = 'table1,table2,table3';

SELECT * FROM database1.table1;
```

    필요시 DDL 쿼리를 사용하여 설정을 변경할 수 있습니다. 그러나 `materialized_postgresql_tables_list` 설정은 변경할 수 없습니다. 이 설정에서 테이블 목록을 업데이트하려면 `ATTACH TABLE` 쿼리를 사용하십시오.

```sql
ALTER DATABASE postgres_database MODIFY SETTING materialized_postgresql_max_block_size = <new_size>;
```

### `materialized_postgresql_use_unique_replication_consumer_identifier` {#materialized_postgresql_use_unique_replication_consumer_identifier}

복제를 위한 고유한 복제 소비자 식별자를 사용합니다. 기본값: `0`.
`1`로 설정하면 동일한 `PostgreSQL` 테이블을 가리키는 여러 `MaterializedPostgreSQL` 테이블을 설정할 수 있습니다.

## 노트 {#notes}

### 논리 복제 슬롯의 장애 조치 {#logical-replication-slot-failover}

기본에 존재하는 논리 복제 슬롯은 대기 복제본에서 사용할 수 없습니다. 따라서 장애 조치가 발생하면 새 기본(primary) 서버(구 물리적 대기 서버)는 구 기본 서버에 존재했던 슬롯에 대해 인식하지 못하게 됩니다. 이로 인해 PostgreSQL에서 복제가 중단됩니다. 이를 해결하려면 복제 슬롯을 직접 관리하고 영구 복제 슬롯을 정의해야 합니다(일부 정보는 [여기](https://patroni.readthedocs.io/en/latest/SETTINGS.html)에서 확인할 수 있습니다). 슬롯 이름을 `materialized_postgresql_replication_slot` 설정으로 전달해야 하며, `EXPORT SNAPSHOT` 옵션과 함께 내보내야 합니다. 스냅샷 식별자는 `materialized_postgresql_snapshot` 설정을 통해 전달되어야 합니다.

실제로 필요할 때만 사용해야 합니다. 필요가 없거나 그 이유를 완전히 이해하지 못한다면, 테이블 엔진이 자체 복제 슬롯을 생성하고 관리하게 하는 것이 좋습니다.

**예시 ([@bchrobot](https://github.com/bchrobot)에서 제공)**

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

4. PostgreSQL 트랜잭션을 종료하고 ClickHouse DB로의 복제가 확인되면, 장애 조치 후에도 복제가 계속되는지 확인합니다:

```bash
kubectl exec acid-demo-cluster-0 -c postgres -- su postgres -c 'patronictl failover --candidate acid-demo-cluster-1 --force'
```

### 필요한 권한 {#required-permissions}

1. [CREATE PUBLICATION](https://postgrespro.ru/docs/postgresql/14/sql-createpublication) -- 쿼리 생성 권한.

2. [CREATE_REPLICATION_SLOT](https://postgrespro.ru/docs/postgrespro/10/protocol-replication#PROTOCOL-REPLICATION-CREATE-SLOT) -- 복제 권한.

3. [pg_drop_replication_slot](https://postgrespro.ru/docs/postgrespro/9.5/functions-admin#functions-replication) -- 복제 권한 또는 슈퍼유저.

4. [DROP PUBLICATION](https://postgrespro.ru/docs/postgresql/10/sql-droppublication) -- 퍼블리케이션의 소유자 (`MaterializedPostgreSQL` 엔진 자체의 `username`).

`2` 및 `3` 명령을 실행하는 것과 이러한 권한을 피할 수 있습니다. `materialized_postgresql_replication_slot` 및 `materialized_postgresql_snapshot` 설정을 사용하십시오. 그러나 매우 주의해야 합니다.

테이블 접근 권한:

1. pg_publication

2. pg_replication_slots

3. pg_publication_tables
