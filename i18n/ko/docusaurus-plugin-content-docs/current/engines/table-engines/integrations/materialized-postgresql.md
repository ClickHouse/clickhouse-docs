---
description: 'PostgreSQL 테이블의 초기 데이터 덤프를 사용해 ClickHouse 테이블을 생성하고 복제(replication) 프로세스를 시작합니다.'
sidebar_label: 'MaterializedPostgreSQL'
sidebar_position: 130
slug: /engines/table-engines/integrations/materialized-postgresql
title: 'MaterializedPostgreSQL 테이블 엔진'
doc_type: 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL 테이블 엔진 \{#materializedpostgresql-table-engine\}

<ExperimentalBadge />

<CloudNotSupportedBadge />

:::note
ClickHouse Cloud 사용자는 PostgreSQL 데이터를 ClickHouse로 복제하기 위해 [ClickPipes](/integrations/clickpipes) 사용을 권장합니다. 이는 PostgreSQL에 대해 고성능 Change Data Capture(CDC)를 네이티브로 지원합니다.
:::

PostgreSQL 테이블의 초기 데이터 덤프를 기반으로 ClickHouse 테이블을 생성하고, 복제 프로세스를 시작합니다. 즉, 원격 PostgreSQL 데이터베이스의 테이블에서 발생하는 새로운 변경 사항을 적용하기 위해 백그라운드 작업을 실행합니다.

:::note
이 테이블 엔진은 실험적 기능입니다. 이를 사용하려면 설정 파일에서 또는 `SET` 명령을 사용하여 `allow_experimental_materialized_postgresql_table`을 1로 설정하십시오:
:::

```sql
SET allow_experimental_materialized_postgresql_table=1
```

:::

둘 이상의 테이블이 필요한 경우에는 테이블 엔진 대신 [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) 데이터베이스 엔진을 사용하고, 복제할 테이블을 지정하는 `materialized_postgresql_tables_list` SETTING을 사용하는 것이 강력히 권장됩니다(여기에 데이터베이스 `schema`도 추가할 수 있습니다). 이렇게 하면 CPU 사용량, 연결 수, 그리고 원격 PostgreSQL 데이터베이스 내부의 복제 슬롯(replication slot) 수 측면에서 훨씬 더 효율적입니다.


## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**엔진 매개변수**

* `host:port` — PostgreSQL 서버 주소.
* `database` — 원격 데이터베이스 이름.
* `table` — 원격 테이블 이름.
* `user` — PostgreSQL 사용자.
* `password` — 사용자의 비밀번호.


## 요구 사항 \{#requirements\}

1. PostgreSQL 설정 파일에서 [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 설정은 `logical`로 지정되어 있어야 하며, `max_replication_slots` 파라미터 값은 최소 `2` 이상이어야 합니다.

2. `MaterializedPostgreSQL` 엔진을 사용하는 테이블에는 기본 키가 있어야 하며, 이는 PostgreSQL 테이블의 replica identity 인덱스(기본값: 기본 키)와 동일해야 합니다([replica identity 인덱스에 대한 자세한 내용](../../../engines/database-engines/materialized-postgresql.md#requirements)을 참조하십시오).

3. [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems)) 데이터베이스만 사용할 수 있습니다.

4. `MaterializedPostgreSQL` 테이블 엔진은 구현에 [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 함수가 필요하므로 PostgreSQL 11 버전 이상에서만 동작합니다.



## 가상 컬럼 \{#virtual-columns\}

* `_version` — 트랜잭션 카운터입니다. 형식: [UInt64](../../../sql-reference/data-types/int-uint.md).

* `_sign` — 삭제 표시입니다. 형식: [Int8](../../../sql-reference/data-types/int-uint.md). 가능한 값:
  * `1` — 행이 삭제되지 않음,
  * `-1` — 행이 삭제됨.

이 컬럼들은 테이블을 생성할 때 추가할 필요가 없습니다. `SELECT` 쿼리에서 항상 조회할 수 있습니다.
`_version` 컬럼은 `WAL`의 `LSN` 위치와 동일하므로, 복제 상태가 얼마나 최신인지 확인하는 데 사용할 수 있습니다.

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 값 복제는 지원되지 않습니다. 해당 데이터 타입의 기본값이 사용됩니다.
:::
