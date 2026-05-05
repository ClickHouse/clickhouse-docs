---
description: 'CREATE DATABASE 문서'
sidebar_label: '데이터베이스'
sidebar_position: 35
slug: /sql-reference/statements/create/database
title: 'CREATE DATABASE'
doc_type: 'reference'
---

# CREATE DATABASE \{#create-database\}

새로운 데이터베이스를 생성합니다.

```sql
CREATE DATABASE [IF NOT EXISTS] db_name [ON CLUSTER cluster] [ENGINE = engine(...)] [SETTINGS ...] [COMMENT 'Comment']
```


## 절 \{#clauses\}

### IF NOT EXISTS \{#if-not-exists\}

`db_name` 데이터베이스가 이미 존재하면 ClickHouse는 새 데이터베이스를 생성하지 않고 다음과 같이 동작합니다.

- 이 절이 지정된 경우 예외를 발생시키지 않습니다.
- 이 절이 지정되지 않은 경우 예외를 발생시킵니다.

### ON CLUSTER \{#on-cluster\}

ClickHouse는 지정된 클러스터의 모든 서버에 `db_name` 데이터베이스를 생성합니다. 더 자세한 내용은 [분산 DDL](../../../sql-reference/distributed-ddl.md) 문서를 참고하십시오.

### ENGINE \{#engine\}

기본적으로 ClickHouse에서는 자체 [Atomic](../../../engines/database-engines/atomic.md) 데이터베이스 엔진을 사용합니다. 이외에도 [MySQL](../../../engines/database-engines/mysql.md), [PostgresSQL](../../../engines/database-engines/postgresql.md), [MaterializedPostgreSQL](../../../engines/database-engines/materialized-postgresql.md), [Replicated](../../../engines/database-engines/replicated.md), [SQLite](../../../engines/database-engines/sqlite.md) 등의 엔진을 사용할 수 있습니다.

### COMMENT \{#comment\}

데이터베이스를 생성할 때 설명(comment)을 추가할 수 있습니다.

설명은 모든 데이터베이스 엔진에서 지원됩니다.

**구문**

```sql
CREATE DATABASE db_name ENGINE = engine(...) COMMENT 'Comment'
```

**예제**

쿼리:

```sql
CREATE DATABASE db_comment ENGINE = Memory COMMENT 'The temporary database';
SELECT name, comment FROM system.databases WHERE name = 'db_comment';
```

결과:

```text
┌─name───────┬─comment────────────────┐
│ db_comment │ The temporary database │
└────────────┴────────────────────────┘
```


### SETTINGS \{#settings\}

#### lazy_load_tables \{#lazy-load-tables\}

이 설정을 활성화하면 데이터베이스 시작 시 테이블이 완전히 로드되지 않습니다. 대신 각 테이블에 대해 경량 프록시가 생성되고, 실제 테이블 엔진은 처음 접근할 때 구체화됩니다. 이는 많은 테이블이 존재하지만 그중 일부만 실제로 조회되는 데이터베이스에서 시작 시간과 메모리 사용량을 줄이는 데 도움이 됩니다.

```sql
CREATE DATABASE db_name ENGINE = Atomic SETTINGS lazy_load_tables = 1;
```

디스크에 테이블 메타데이터를 저장하는 데이터베이스 엔진(예: `Atomic`, `Ordinary`)에 적용됩니다. 뷰, materialized view, 딕셔너리, 그리고 테이블 함수 기반 테이블은 이 설정과 관계없이 항상 즉시 로드됩니다.

**사용 시점:** 이 설정은 테이블 수가 매우 많아(수백 또는 수천 개) 그중 일부만 자주 쿼리되는 데이터베이스에 유용합니다. 테이블 엔진 객체 생성, 데이터 파트 스캔, 백그라운드 스레드 초기화를 최초 접근 시점까지 지연하여 서버 시작 시간과 메모리 사용량을 줄입니다.

**`system.tables`에 대한 영향:**

* 테이블에 접근하기 전에는 `system.tables`에서 해당 테이블의 엔진이 `TableProxy`로 표시됩니다. 최초 접근 후에는 실제 엔진 이름(예: `MergeTree`)이 표시됩니다.
* 실제 스토리지가 아직 생성되지 않았기 때문에, 로드되지 않은 테이블에 대해서는 `total_rows` 및 `total_bytes`와 같은 컬럼이 `NULL`을 반환합니다.

**DDL 연산과의 상호작용:**

* `SELECT`, `INSERT`, `ALTER`, `DROP`는 최초 사용 시 실제 테이블 엔진 로딩을 자동으로 트리거합니다.
* `RENAME TABLE`은 로딩을 트리거하지 않고 동작합니다.
* 일단 테이블이 로드되면, 서버 프로세스가 종료될 때까지 계속 로드된 상태로 유지됩니다.

**제한 사항:**

* `system.tables` 메타데이터(예: `total_rows`, `engine`)에 의존하는 모니터링 도구는 로드되지 않은 테이블에 대해 불완전한 정보를 볼 수 있습니다.
* 로드되지 않은 테이블에 대한 최초 쿼리에는 일회성 로딩 비용(저장된 `CREATE TABLE` 문 파싱 및 엔진 초기화)이 발생합니다.

기본값: `0` (비활성화).
