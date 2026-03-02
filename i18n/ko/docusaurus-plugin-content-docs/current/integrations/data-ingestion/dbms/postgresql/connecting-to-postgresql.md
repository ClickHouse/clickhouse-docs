---
slug: /integrations/postgresql/connecting-to-postgresql
title: 'PostgreSQL에 연결하기'
keywords: ['clickhouse', 'postgres', 'postgresql', 'connect', 'integrate', 'table', 'engine']
description: 'PostgreSQL을 ClickHouse와 연결하는 다양한 방법을 설명하는 페이지'
show_related_blogs: true
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ClickHouse를 PostgreSQL에 연결하기 \{#connecting-clickhouse-to-postgresql\}

이 페이지에서는 PostgreSQL을 ClickHouse와 통합하는 다음 옵션을 설명합니다:

- PostgreSQL 테이블에서 읽기 위한 `PostgreSQL` 테이블 엔진 사용
- PostgreSQL의 데이터베이스를 ClickHouse의 데이터베이스와 동기화하기 위한 실험적 `MaterializedPostgreSQL` 데이터베이스 엔진 사용

:::tip
[Managed Postgres](/docs/cloud/managed-postgres) 서비스를 살펴보십시오. NVMe 스토리지와 컴퓨트가 물리적으로 함께 배치되어 있어, EBS와 같은 네트워크 연결 스토리지를 사용하는 대안에 비해 디스크 입출력이 병목인 워크로드에서 최대 10배 빠른 성능을 제공하며, ClickPipes의 Postgres CDC 커넥터를 사용하여 Postgres 데이터를 ClickHouse로 복제할 수 있습니다.
:::

## PostgreSQL 테이블 엔진 사용 \{#using-the-postgresql-table-engine\}

`PostgreSQL` 테이블 엔진을 사용하면 ClickHouse에서 원격 PostgreSQL 서버에 저장된 데이터에 대해 **SELECT** 및 **INSERT** 작업을 수행할 수 있습니다.
이 문서에서는 하나의 테이블을 예시로 사용하여 기본적인 통합 방법을 설명합니다.

### 1. PostgreSQL 설정 \{#1-setting-up-postgresql\}

1. `postgresql.conf` 파일에 PostgreSQL이 네트워크 인터페이스에서 연결을 수락할 수 있도록 다음 항목을 추가합니다.

```text
  listen_addresses = '*'
```

2. ClickHouse에서 연결할 때 사용할 USER를 생성합니다. 데모 목적상 이 예시에서는 전체 슈퍼유저 권한을 부여합니다.

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

5. 테스트용으로 몇 개의 행을 추가합니다:

```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (1, 'abc'),
    (2, 'def');
```

6. PostgreSQL에서 새 데이터베이스에 대한 복제를 위해 새 USER가 연결할 수 있도록 설정하려면 `pg_hba.conf` 파일에 다음 항목을 추가합니다. 주소 라인은 PostgreSQL 서버의 서브넷 또는 IP 주소로 수정합니다:

```text
  # TYPE  DATABASE        USER            ADDRESS                 METHOD
  host    db_in_psg             clickhouse_user 192.168.1.0/24          password
```

7. `pg_hba.conf` 설정을 다시 로드합니다(사용 중인 버전에 따라 명령을 조정하십시오):

```text
  /usr/pgsql-12/bin/pg_ctl reload
```

8. 새로운 `clickhouse_user`가 로그인할 수 있는지 확인합니다:

```text
  psql -U clickhouse_user -W -d db_in_psg -h <your_postgresql_host>
```

:::note
ClickHouse Cloud에서 이 기능을 사용하는 경우, ClickHouse Cloud IP 주소가 PostgreSQL 인스턴스에 접근할 수 있도록 허용해야 할 수도 있습니다.
송신(egress) 트래픽에 대한 자세한 내용은 ClickHouse [Cloud Endpoints API](/cloud/get-started/query-endpoints) 문서를 참조하십시오.
:::


### 2. ClickHouse에서 테이블 정의하기 \{#2-define-a-table-in-clickhouse\}

1. `clickhouse-client`에 로그인합니다:

```bash
  clickhouse-client --user default --password ClickHouse123!
```

2. 새 데이터베이스를 생성합니다.

```sql
  CREATE DATABASE db_in_ch;
```

3. `PostgreSQL` 테이블 엔진을 사용하는 테이블을 생성합니다:

```sql
  CREATE TABLE db_in_ch.table1
  (
      id UInt64,
      column1 String
  )
  ENGINE = PostgreSQL('postgres-host.domain.com:5432', 'db_in_psg', 'table1', 'clickhouse_user', 'ClickHouse_123');
```

필요한 최소 매개변수는 다음과 같습니다:

| parameter | Description            | example                       |
| --------- | ---------------------- | ----------------------------- |
| host:port | 호스트 이름 또는 IP와 포트       | postgres-host.domain.com:5432 |
| database  | PostgreSQL 데이터베이스 이름   | db&#95;in&#95;psg             |
| user      | PostgreSQL에 연결할 사용자 이름 | clickhouse&#95;user           |
| password  | PostgreSQL에 연결할 비밀번호   | ClickHouse&#95;123            |

:::note
전체 매개변수 목록은 [PostgreSQL table engine](/engines/table-engines/integrations/postgresql) 문서 페이지를 참조하십시오.
:::


### 3 통합을 테스트합니다 \{#3-test-the-integration\}

1. ClickHouse에서 초기 행을 확인합니다:

```sql
  SELECT * FROM db_in_ch.table1
```

ClickHouse 테이블에는 PostgreSQL의 해당 테이블에 이미 존재하던 두 개의 행이 자동으로 채워집니다.

```response
  Query id: 34193d31-fe21-44ac-a182-36aaefbd78bf

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  └────┴─────────┘
```

2. PostgreSQL로 돌아가 테이블에 몇 개의 행을 추가합니다.

```sql
  INSERT INTO table1
    (id, column1)
  VALUES
    (3, 'ghi'),
    (4, 'jkl');
```

4. 이 두 개의 새 행이 ClickHouse 테이블에 나타나야 합니다:

```sql
  SELECT * FROM db_in_ch.table1
```

응답은 다음과 같습니다:

```response
  Query id: 86fa2c62-d320-4e47-b564-47ebf3d5d27b

  ┌─id─┬─column1─┐
  │  1 │ abc     │
  │  2 │ def     │
  │  3 │ ghi     │
  │  4 │ jkl     │
  └────┴─────────┘
```

5. ClickHouse 테이블에 행을 추가하면 어떻게 되는지 확인해 보겠습니다.

```sql
  INSERT INTO db_in_ch.table1
    (id, column1)
  VALUES
    (5, 'mno'),
    (6, 'pqr');
```

6. ClickHouse에 추가된 행이 PostgreSQL의 테이블에도 나타나야 합니다:

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

이 예제에서는 `PostrgeSQL` 테이블 엔진을 사용하여 PostgreSQL과 ClickHouse 간의 기본 통합을 보여주었습니다.
스키마를 지정하거나, 컬럼의 일부만 반환하거나, 여러 레플리카에 연결하는 등의 추가 기능은 [PostgreSQL 테이블 엔진 문서 페이지](/engines/table-engines/integrations/postgresql)를 참조하십시오. 또한 [ClickHouse and PostgreSQL - a match made in data heaven - part 1](https://clickhouse.com/blog/migrating-data-between-clickhouse-postgres) 블로그 글도 함께 참조하십시오.


## MaterializedPostgreSQL 데이터베이스 엔진 사용 \{#using-the-materializedpostgresql-database-engine\}

<CloudNotSupportedBadge />

<ExperimentalBadge />

PostgreSQL 데이터베이스 엔진은 PostgreSQL의 복제 기능을 사용하여 전체 또는 일부 스키마와 테이블을 포함하는 데이터베이스의 레플리카를 생성합니다.
이 문서에서는 하나의 데이터베이스, 하나의 스키마, 하나의 테이블을 사용하는 기본 통합 방법을 설명합니다.

***다음 절차에서는 PostgreSQL CLI(psql)와 ClickHouse CLI(clickhouse-client)를 사용합니다. PostgreSQL 서버는 Linux에 설치되어 있습니다. 아래 내용은 PostgreSQL 데이터베이스를 새로 테스트 용도로 설치한 경우의 최소 설정만을 다룹니다***

### 1. PostgreSQL에서 \{#1-in-postgresql\}

1. `postgresql.conf`에서 최소 listen 수준, 복제 WAL 레벨 및 복제 슬롯을 설정합니다.

다음 항목을 추가하십시오:

```text
listen_addresses = '*'
max_replication_slots = 10
wal_level = logical
```

**ClickHouse에는 최소 `logical` WAL 레벨과 최소 `2`개의 복제 슬롯(replication slot)이 필요합니다*

2. 관리자 계정을 사용하여 ClickHouse에 연결할 사용자를 생성합니다.

```sql
CREATE ROLE clickhouse_user SUPERUSER LOGIN PASSWORD 'ClickHouse_123';
```

**데모를 위해 전체 superuser 권한이 부여되었습니다.*

3. 새 데이터베이스를 생성하십시오:

```sql
CREATE DATABASE db1;
```

4. `psql`에서 새 데이터베이스에 연결합니다:

```text
\connect db1
```

5. 새 테이블을 만듭니다:

```sql
CREATE TABLE table1 (
    id         integer primary key,
    column1    varchar(10)
);
```

6. 초기 행을 추가하십시오:

```sql
INSERT INTO table1
(id, column1)
VALUES
(1, 'abc'),
(2, 'def');
```

7. 복제를 위해 새 USER가 새 데이터베이스에 연결할 수 있도록 PostgreSQL을 구성합니다. 아래는 `pg_hba.conf` 파일에 추가해야 하는 최소 항목입니다:

```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    db1             clickhouse_user 192.168.1.0/24          password
```

**시연 목적을 위해 여기서는 평문 암호 인증 방식을 사용합니다. 주소 부분은 PostgreSQL 문서를 참고하여 서브넷 또는 서버 주소로 수정하십시오*

8. 다음과 같이 `pg_hba.conf` 구성을 다시 로드합니다(사용 중인 버전에 맞게 조정하십시오):

```text
/usr/pgsql-12/bin/pg_ctl reload
```

9. 새 `clickhouse_user` 계정으로 로그인을 테스트합니다:

```text
 psql -U clickhouse_user -W -d db1 -h <your_postgresql_host>
```


### 2. ClickHouse에서 \{#2-in-clickhouse\}

1. ClickHouse CLI에 접속합니다

```bash
clickhouse-client --user default --password ClickHouse123!
```

2. 데이터베이스 엔진에서 PostgreSQL 실험 기능을 활성화합니다:

```sql
SET allow_experimental_database_materialized_postgresql=1
```

3. 복제에 사용할 새 데이터베이스를 생성하고 초기 테이블을 정의합니다.

```sql
CREATE DATABASE db1_postgres
ENGINE = MaterializedPostgreSQL('postgres-host.domain.com:5432', 'db1', 'clickhouse_user', 'ClickHouse_123')
SETTINGS materialized_postgresql_tables_list = 'table1';
```

최소 옵션:

| parameter | Description            | example                                                            |
| --------- | ---------------------- | ------------------------------------------------------------------ |
| host:port | 호스트 이름 또는 IP와 포트       | postgres-host.domain.com:5432                                      |
| database  | PostgreSQL 데이터베이스 이름   | db1                                                                |
| user      | PostgreSQL에 연결할 사용자 이름 | clickhouse&#95;user                                                |
| password  | PostgreSQL에 연결할 비밀번호   | ClickHouse&#95;123                                                 |
| settings  | 엔진에 대한 추가 설정           | materialized&#95;postgresql&#95;tables&#95;list = &#39;table1&#39; |

:::info
PostgreSQL 데이터베이스 엔진에 대한 전체 가이드는 https://clickhouse.com/docs/engines/database-engines/materialized-postgresql/#settings 를 참조하십시오.
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


### 3. 기본 복제 테스트 \{#3-test-basic-replication\}

1. PostgreSQL에서 새 행을 추가합니다:

```sql
INSERT INTO table1
(id, column1)
VALUES
(3, 'ghi'),
(4, 'jkl');
```

2. ClickHouse에서 새로 추가된 행이 표시되는지 확인합니다:

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


### 4. Summary \{#4-summary\}

이 통합 가이드는 테이블이 포함된 데이터베이스를 복제하는 간단한 예제를 다루었지만, 데이터베이스 전체를 복제하거나 기존 복제에 새 테이블과 스키마를 추가하는 등 보다 고급 옵션도 있습니다. 이 복제에서는 DDL 명령이 지원되지 않지만, 구조 변경이 발생했을 때 엔진이 변경 사항을 감지하고 테이블을 다시 로드하도록 설정할 수 있습니다.

:::info
고급 옵션에서 사용할 수 있는 더 많은 기능은 [참고 문서](/engines/database-engines/materialized-postgresql)를 참조하십시오.
:::