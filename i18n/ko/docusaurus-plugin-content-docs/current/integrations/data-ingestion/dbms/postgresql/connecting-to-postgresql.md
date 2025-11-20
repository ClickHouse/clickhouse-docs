---
'slug': '/integrations/postgresql/connecting-to-postgresql'
'title': 'PostgreSQL에 연결하기'
'keywords':
- 'clickhouse'
- 'postgres'
- 'postgresql'
- 'connect'
- 'integrate'
- 'table'
- 'engine'
'description': 'ClickHouse에 PostgreSQL을 연결하는 다양한 방법을 설명하는 페이지'
'show_related_blogs': true
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse와 PostgreSQL 연결하기

이 페이지에서는 PostgreSQL을 ClickHouse와 통합하는 다음 옵션을 다룹니다:

- PostgreSQL 테이블에서 읽기 위한 `PostgreSQL` 테이블 엔진 사용
- PostgreSQL의 데이터베이스를 ClickHouse의 데이터베이스와 동기화하기 위한 실험적인 `MaterializedPostgreSQL` 데이터베이스 엔진 사용

:::tip
[ClickPipes](/integrations/clickpipes/postgres) 를 사용하는 것을 권장합니다. 이는 PeerDB가 지원하는 ClickHouse Cloud를 위한 관리형 통합 서비스입니다. 
또는 [PeerDB](https://github.com/PeerDB-io/peerdb)를 사용할 수 있으며, 이는 PostgreSQL 데이터베이스 복제를 위한 자체 관리 ClickHouse 및 ClickHouse Cloud를 위해 특별히 설계된 오픈소스 CDC 도구입니다.
:::

## PostgreSQL 테이블 엔진 사용하기 {#using-the-postgresql-table-engine}

`PostgreSQL` 테이블 엔진은 ClickHouse에서 원격 PostgreSQL 서버에 저장된 데이터에 대해 **SELECT** 및 **INSERT** 작업을 허용합니다. 이 문서는 하나의 테이블을 사용하여 통합의 기본 방법을 설명합니다.

### 1. PostgreSQL 설정하기 {#1-setting-up-postgresql}
1.  `postgresql.conf`에서 PostgreSQL이 네트워크 인터페이스에서 수신하도록 다음 항목을 추가합니다:
```text
listen_addresses = '*'
```

2. ClickHouse에서 연결할 사용자를 생성합니다. 설명을 위한 이 예제에서는 전체 슈퍼유저 권한을 부여합니다.
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

3. PostgreSQL에서 새 데이터베이스를 생성합니다:
```sql
CREATE DATABASE db_in_psg;
```

4. 새 테이블을 생성합니다:
```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

5. 테스트를 위해 몇 개의 행을 추가합니다:
```sql
INSERT INTO table1
  (id, column1)
VALUES
  (1, 'abc'),
  (2, 'def');
```

6. 복제를 위한 새로운 사용자로 새 데이터베이스에 대한 연결을 허용하도록 PostgreSQL을 구성합니다. `pg_hba.conf` 파일에 다음 항목을 추가합니다. PostgreSQL 서버의 서브넷 또는 IP 주소로 주소 행을 업데이트합니다:
```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db_in_psg             clickhouse_user 192.168.1.0/24          password
```

7. `pg_hba.conf` 구성을 다시 로드합니다 (버전에 따라 이 명령을 조정하세요):
```text
/usr/pgsql-12/bin/pg_ctl reload
```

8. 새 `clickhouse_user`가 로그인할 수 있는지 확인합니다:
```text
psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
```

:::note
ClickHouse Cloud에서 이 기능을 사용하고 있는 경우, ClickHouse Cloud IP 주소가 PostgreSQL 인스턴스에 접근할 수 있도록 허용해야 할 수 있습니다.
ClickHouse [Cloud Endpoints API](/cloud/get-started/query-endpoints)에서 이탈 트래픽 세부정보를 확인하세요.
:::

### 2. ClickHouse에서 테이블 정의하기 {#2-define-a-table-in-clickhouse}
1. `clickhouse-client`에 로그인합니다:
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 새 데이터베이스를 생성합니다:
```sql
CREATE DATABASE db_in_ch;
```

3. `PostgreSQL`을 사용하는 테이블을 생성합니다:
```sql
CREATE TABLE db_in_ch.table1
(
    id UInt64,
    column1 String
)
ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
```

  필요한 최소 매개변수는 다음과 같습니다:

  |parameter|설명                 |예제              |
  |---------|----------------------------|---------------------|
  |host:port|호스트명 또는 IP와 포트     |postgres-host.domain.com:5432|
  |database |PostgreSQL 데이터베이스 이름         |db_in_psg                  |
  |user     |Postgres에 연결할 사용자 이름|clickhouse_user     |
  |password |Postgres에 연결할 비밀번호|ClickHouse_123       |

  :::note
  매개변수의 전체 목록은 [PostgreSQL 테이블 엔진](/engines/table-engines/integrations/postgresql) 문서 페이지를 참조하세요.
  :::

### 3. 통합 테스트하기 {#3-test-the-integration}

1. ClickHouse에서 초기 행을 조회합니다:
```sql
SELECT * FROM db_in_ch.table1
```

  ClickHouse 테이블에는 PostgreSQL 테이블에 이미 존재하는 두 개의 행이 자동으로 채워져야 합니다:
```response
Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
└────┴─────────┘
```

2. PostgreSQL로 돌아가서 테이블에 몇 개의 행을 추가합니다:
```sql
INSERT INTO table1
  (id, column1)
VALUES
  (3, 'ghi'),
  (4, 'jkl');
```

4. 이 두 개의 새로운 행은 ClickHouse 테이블에 나타나야 합니다:
```sql
SELECT * FROM db_in_ch.table1
```

  응답은 다음과 같아야 합니다:
```response
Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

┌─id─┬─column1─┐
│  1 │ abc     │
│  2 │ def     │
│  3 │ ghi     │
│  4 │ jkl     │
└────┴─────────┘
```

5. ClickHouse 테이블에 행을 추가할 때 어떤 일이 발생하는지 봅시다:
```sql
INSERT INTO db_in_ch.table1
  (id, column1)
VALUES
  (5, 'mno'),
  (6, 'pqr');
```

6. ClickHouse에서 추가한 행은 PostgreSQL 테이블에 나타나야 합니다:
```sql
db_in_psg=# SELECT * FROM table1;
id | column1
----+---------
  1 | abc
  2 | def
  3 | ghi
  4 | jkl
  5 | mno
  6 | pqr
(6 rows)
```

이 예제는 `PostgreSQL` 테이블 엔진을 사용하여 PostgreSQL과 ClickHouse 간의 기본 통합을 보여주었습니다. 스키마 지정, 열의 하위 집합 반환 및 여러 복제본에 연결하는 등의 기능에 대한 정보를 보려면 [PostgreSQL 테이블 엔진 문서 페이지](/engines/table-engines/integrations/postgresql)를 확인하세요. 또한, [ClickHouse와 PostgreSQL - 데이터의 천국에서 만들어진 조합 - 1부](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres) 블로그도 확인하세요.

## MaterializedPostgreSQL 데이터베이스 엔진 사용하기 {#using-the-materializedpostgresql-database-engine}

<CloudNotSupportedBadge />
<ExperimentalBadge />

PostgreSQL 데이터베이스 엔진은 PostgreSQL 복제 기능을 사용하여 데이터베이스의 복제본을 생성합니다. 이 복제본은 모든 스키마 및 테이블 또는 그 하위 집합을 포함할 수 있습니다. 이 문서는 하나의 데이터베이스, 하나의 스키마 및 하나의 테이블을 사용하여 통합의 기본 방법을 설명합니다.

***다음 절차에서는 PostgreSQL CLI (psql)와 ClickHouse CLI (clickhouse-client)를 사용합니다. PostgreSQL 서버는 리눅스에 설치되어 있습니다. PostgreSQL 데이터베이스가 새로 테스트 설치된 경우 다음은 최소 설정입니다.***

### 1. PostgreSQL에서 {#1-in-postgresql}
1.  `postgresql.conf`에서 최소 수신 수준, 복제 wal 수준 및 복제 슬롯을 설정합니다:

다음 항목을 추가합니다:
```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```
_*ClickHouse는 최소 `logical` wal 수준과 최소 `2` 복제 슬롯이 필요합니다._

2. 관리 계정을 사용하여 ClickHouse에서 연결할 사용자를 생성합니다:
```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```
_*설명을 위한 이 예제는 전체 슈퍼유저 권한을 부여합니다._

3. 새 데이터베이스를 생성합니다:
```sql
CREATE DATABASE db1;
```

4. `psql`에서 새 데이터베이스에 연결합니다:
```text
\connect db1
```

5. 새 테이블을 생성합니다:
```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

6. 초기 행을 추가합니다:
```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. 복제를 위해 새로운 사용자로 새 데이터베이스에 대한 연결을 허용하도록 PostgreSQL을 구성합니다. 아래는 `pg_hba.conf` 파일에 추가할 최소 항목입니다:

```text

# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```
_*설명을 위한 이 예제에서는 평문 비밀번호 인증 방법을 사용하고 있습니다. PostgreSQL 문서에 따라 서브넷 또는 서버의 주소로 주소 행을 업데이트하세요._

8. 다음과 같은 방법으로 `pg_hba.conf` 구성을 다시 로드합니다 (버전에 따라 조정하세요):
```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 새 `clickhouse_user`로 로그인 테스트를 합니다:
```text
psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```

### 2. ClickHouse에서 {#2-in-clickhouse}
1. ClickHouse CLI에 로그인합니다
```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 데이터베이스 엔진을 위한 PostgreSQL 실험적 기능을 활성화합니다:
```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. 복제할 새 데이터베이스를 생성하고 초기 테이블을 정의합니다:
최소 옵션:

|parameter|설명                 |예제              |
|---------|----------------------------|---------------------|
|host:port|호스트명 또는 IP와 포트     |postgres-host.domain.com:5432|
|database |PostgreSQL 데이터베이스 이름         |db1                  |
|user     |Postgres에 연결할 사용자 이름|clickhouse_user     |
|password |Postgres에 연결할 비밀번호|ClickHouse_123       |
|settings |엔진에 대한 추가 설정| materialized_postgresql_tables_list = 'table1'|

:::info
PostgreSQL 데이터베이스 엔진에 대한 완전한 가이드는 https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings를 참조하세요.
:::

4. 초기 테이블에 데이터가 있는지 확인합니다:

```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: df2381ac-4e30-4535-b22e-8be3894aaafc

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 3. 기본 복제 테스트 {#3-test-basic-replication}
1. PostgreSQL에서 새로운 행을 추가합니다:
```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. ClickHouse에서 새로운 행이 보이는지 확인합니다:
```sql
ch_env_2 :) select * from db1_postgres.table1;

SELECT *
FROM db1_postgres.table1

Query id: b0729816-3917-44d3-8d1a-fed912fb59ce

┌─id─┬─column1─┐
│  1 │ abc     │
└────┴─────────┘
┌─id─┬─column1─┐
│  4 │ jkl     │
└────┴─────────┘
┌─id─┬─column1─┐
│  3 │ ghi     │
└────┴─────────┘
┌─id─┬─column1─┐
│  2 │ def     │
└────┴─────────┘
```

### 4. 요약 {#4-summary}
이 통합 가이드는 테이블과 함께 데이터베이스를 복제하는 방법에 대한 간단한 예제에 중점을 두었으나, 전체 데이터베이스를 복제하거나 기존 복제에 새 테이블 및 스키마를 추가하는 등의 더 고급 옵션이 존재합니다. DDL 명령은 이 복제에 대해 지원되지 않지만, 엔진은 변경 사항을 감지하고 구조적 변경이 있을 경우 테이블을 다시 로드하도록 설정할 수 있습니다.

:::info
고급 옵션에 대한 추가 기능은 [참조 문서](/engines/database-engines/materialized-postgresql)를 참조하세요.
:::
