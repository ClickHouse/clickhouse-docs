---
'description': 'PostgreSQL 테이블의 초기 데이터 덤프와 함께 ClickHouse 테이블을 생성하고 복제 프로세스를 시작합니다.'
'sidebar_label': 'MaterializedPostgreSQL'
'sidebar_position': 130
'slug': '/engines/table-engines/integrations/materialized-postgresql'
'title': '물리화된 PostgreSQL 테이블 엔진'
'doc_type': 'guide'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# MaterializedPostgreSQL 테이블 엔진

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::note
ClickHouse Cloud 사용자에게는 PostgreSQL에서 ClickHouse로 복제를 위해 [ClickPipes](/integrations/clickpipes)를 사용하는 것이 권장됩니다. 이는 PostgreSQL에 대한 고성능 변경 데이터 캡처(CDC)를 기본적으로 지원합니다.
:::

ClickHouse 테이블을 PostgreSQL 테이블의 초기 데이터 덤프와 함께 생성하고 복제 프로세스를 시작합니다. 즉, 원격 PostgreSQL 데이터베이스의 PostgreSQL 테이블에서 발생하는 새로운 변경 사항을 적용하기 위해 백그라운드 작업을 실행합니다.

:::note
이 테이블 엔진은 실험적입니다. 사용하려면 구성 파일에 `allow_experimental_materialized_postgresql_table`을 1로 설정하거나 `SET` 명령을 사용하세요:

```sql
SET allow_experimental_materialized_postgresql_table=1
```
:::

여러 테이블이 필요한 경우, 테이블 엔진 대신 [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md) 데이터베이스 엔진을 사용하는 것이 강력히 권장되며, 복제할 테이블을 지정하는 `materialized_postgresql_tables_list` 설정을 사용할 수 있습니다(데이터베이스 `schema` 추가도 가능). 이는 CPU 효율성, 연결 수 감소 및 원격 PostgreSQL 데이터베이스 내 복제 슬롯 수를 줄이는 데 훨씬 더 좋습니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_table', 'postgres_user', 'postgres_password')
PRIMARY KEY key;
```

**엔진 매개변수**

- `host:port` — PostgreSQL 서버 주소.
- `database` — 원격 데이터베이스 이름.
- `table` — 원격 테이블 이름.
- `user` — PostgreSQL 사용자.
- `password` — 사용자 비밀번호.

## 요구 사항 {#requirements}

1. [wal_level](https://www.postgresql.org/docs/current/runtime-config-wal.html) 설정의 값은 `logical`이어야 하며, PostgreSQL 구성 파일에서 `max_replication_slots` 매개변수의 값은 최소 `2`이어야 합니다.

2. `MaterializedPostgreSQL` 엔진이 있는 테이블은 기본 키(기본적으로 PostgreSQL 테이블의 복제 정체성 인덱스와 동일)를 가져야 합니다(자세한 내용은 [복제 정체성 인덱스](../../../engines/database-engines/materialized-postgresql.md#requirements)를 참조).

3. 데이터베이스 [Atomic](https://en.wikipedia.org/wiki/Atomicity_(database_systems))만 허용됩니다.

4. `MaterializedPostgreSQL` 테이블 엔진은 PostgreSQL 버전 >= 11에서만 작동합니다. 구현 방식이 [pg_replication_slot_advance](https://pgpedia.info/p/pg_replication_slot_advance.html) PostgreSQL 함수를 필요로 하기 때문입니다.

## 가상 컬럼 {#virtual-columns}

- `_version` — 트랜잭션 카운터. 유형: [UInt64](../../../sql-reference/data-types/int-uint.md).

- `_sign` — 삭제 마크. 유형: [Int8](../../../sql-reference/data-types/int-uint.md). 가능한 값:
  - `1` — 행이 삭제되지 않음,
  - `-1` — 행이 삭제됨.

이 컬럼들은 테이블 생성 시 추가할 필요가 없습니다. 항상 `SELECT` 쿼리에서 접근할 수 있습니다.
`_version` 컬럼은 `WAL`의 `LSN` 위치와 같으므로, 복제가 얼마나 최신인지 확인하는 데 사용할 수 있습니다.

```sql
CREATE TABLE postgresql_db.postgresql_replica (key UInt64, value UInt64)
ENGINE = MaterializedPostgreSQL('postgres1:5432', 'postgres_database', 'postgresql_replica', 'postgres_user', 'postgres_password')
PRIMARY KEY key;

SELECT key, value, _version FROM postgresql_db.postgresql_replica;
```

:::note
[**TOAST**](https://www.postgresql.org/docs/9.5/storage-toast.html) 값의 복제는 지원되지 않습니다. 데이터 유형에 대한 기본값이 사용됩니다.
:::
