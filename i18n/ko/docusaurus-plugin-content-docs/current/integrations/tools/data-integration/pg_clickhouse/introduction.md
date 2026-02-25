---
sidebar_label: '소개'
description: 'SQL을 다시 작성할 필요 없이 PostgreSQL에서 바로 ClickHouse에 대한 분석 쿼리를 실행할 수 있습니다'
slug: '/integrations/pg_clickhouse'
title: 'pg_clickhouse 레퍼런스 문서'
doc_type: 'landing-page'
keywords: ['PostgreSQL', 'Postgres', 'FDW', 'foreign data wrapper', 'pg_clickhouse', 'extension']
---

# pg_clickhouse \{#pg_clickhouse\}

## 소개 \{#introduction\}

[pg_clickhouse]는 오픈 소스 PostgreSQL 확장 프로그램으로, SQL을 다시 작성할 필요 없이
PostgreSQL에서 바로 ClickHouse로 분석 쿼리를 실행할 수 있습니다. PostgreSQL 13 이상과
ClickHouse v23 이상을 지원합니다.

[ClickPipes](/integrations/clickpipes)가 ClickHouse로 데이터를 동기화하기 시작하면,
pg_clickhouse를 사용하여 [외부 테이블 가져오기]를 통해 PostgreSQL 스키마로
외부 테이블을 빠르고 쉽게 가져올 수 있습니다. 그런 다음 기존 PostgreSQL 쿼리를 그대로
해당 테이블에 실행해, 실행은 ClickHouse로 위임하면서도 기존 코드베이스는 그대로 유지합니다.

## 시작하기 \{#getting-started\}

pg&#95;clickhouse를 가장 간단하게 사용해 보는 방법은 [Docker image]를 사용하는 것입니다.
이 이미지에는 표준 PostgreSQL Docker image와 pg&#95;clickhouse 확장이 포함되어 있습니다.

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres -c 'CREATE EXTENSION pg_clickhouse'
```

ClickHouse 테이블 가져오기와 쿼리 푸시다운을 시작하려면 [튜토리얼]을 참조하십시오.


## 테스트 케이스: TPC-H \{#test-case-tpc-h\}

이 표는 스케일링 팩터 1로 적재된 일반 PostgreSQL 테이블과 ClickHouse에 연결된 pg&#95;clickhouse 간의 [TPC-H] 쿼리 성능을 비교합니다. ✔︎는 완전한 푸시다운을 나타내고, 대시(-)는 1분 후 쿼리가 취소되었음을 나타냅니다. 모든 테스트는 36GB 메모리를 장착한 MacBook Pro M4 Max에서 실행되었습니다.

|      쿼리 | PostgreSQL | pg&#95;clickhouse | 푸시다운 |
| ------: | ---------: | ----------------: | :--: |
|  [쿼리 1] |    4693 ms |            268 ms |  ✔︎  |
|  [쿼리 2] |     458 ms |           3446 ms |      |
|  [쿼리 3] |     742 ms |            111 ms |  ✔︎  |
|  [쿼리 4] |     270 ms |            130 ms |  ✔︎  |
|  [쿼리 5] |     337 ms |           1460 ms |  ✔︎  |
|  [쿼리 6] |     764 ms |             53 ms |  ✔︎  |
|  [쿼리 7] |     619 ms |             96 ms |  ✔︎  |
|  [쿼리 8] |     342 ms |            156 ms |  ✔︎  |
|  [쿼리 9] |    3094 ms |            298 ms |  ✔︎  |
| [쿼리 10] |     581 ms |            197 ms |  ✔︎  |
| [쿼리 11] |     212 ms |             24 ms |      |
| [쿼리 12] |    1116 ms |             84 ms |  ✔︎  |
| [쿼리 13] |     958 ms |           1368 ms |      |
| [쿼리 14] |     181 ms |             73 ms |  ✔︎  |
| [쿼리 15] |    1118 ms |            557 ms |      |
| [쿼리 16] |     497 ms |           1714 ms |      |
| [쿼리 17] |    1846 ms |          32709 ms |      |
| [쿼리 18] |    5823 ms |          10649 ms |      |
| [쿼리 19] |      53 ms |            206 ms |  ✔︎  |
| [쿼리 20] |     421 ms |                 - |      |
| [쿼리 21] |    1349 ms |           4434 ms |      |
| [쿼리 22] |     258 ms |           1415 ms |      |

### 소스 코드에서 컴파일하기 \{#compile-from-source\}

#### 일반 Unix \{#general-unix\}

PostgreSQL 및 curl 개발 패키지에는 PATH에 `pg_config`와
`curl-config`가 포함되어 있으므로 `make`(또는
`gmake`)를 실행한 다음 `make install`을 실행하고, 데이터베이스에서
`CREATE EXTENSION pg_clickhouse`를 실행하면 됩니다.

#### Debian / Ubuntu / APT \{#debian--ubuntu--apt\}

PostgreSQL Apt 리포지토리에서 패키지를 가져오는 방법에 대해서는 [PostgreSQL Apt]를 참조하십시오.

```sh
sudo apt install \
  postgresql-server-18 \
  libcurl4-openssl-dev \
  uuid-dev \
  libssl-dev \
  make \
  cmake \
  g++
```


#### RedHat / CentOS / Yum \{#redhat--centos--yum\}

```sh
sudo yum install \
  postgresql-server \
  libcurl-devel \
  libuuid-devel \
  openssl-libs \
  automake \
  cmake \
  gcc
```

PostgreSQL Yum 저장소에서 패키지를 가져오는 방법에 대한 자세한 내용은 [PostgreSQL Yum]을 참고하십시오.


#### PGXN에서 설치 \{#install-from-pgxn\}

위에서 언급한 의존성이 충족되면 [PGXN client]([Homebrew], [Apt], `pgxnclient`라는 이름의 Yum 패키지로 제공됨)을 사용하여 `pg_clickhouse`를 다운로드, 컴파일 및 설치합니다.

```sh
pgxn install pg_clickhouse
```


#### 컴파일 및 설치 \{#compile-and-install\}

ClickHouse 라이브러리와 `pg_clickhouse`를 빌드하고 설치하려면 다음 명령을 실행하십시오:

```sh
make
sudo make install
```

{/* XXX DSO는 현재 비활성화되어 있습니다.
  기본적으로 `make`는 `clickhouse-cpp` 라이브러리를 동적으로 링크합니다
  (macOS에서는 아직 동적 `clickhouse-cpp` 라이브러리가 지원되지 않습니다). ClickHouse
  라이브러리를 `pg_clickhouse`에 정적으로 컴파일하려면 `CH_BUILD=static`을
  지정하십시오:

  ```sh
  make CH_BUILD=static
  sudo make install CH_BUILD=static
  ```
  */ }

호스트에 PostgreSQL 인스턴스가 여러 개 설치되어 있는 경우, 적절한 버전의 `pg_config`를 지정해야 할 수 있습니다:

```sh
export PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config
make
sudo make install
```

호스트 시스템의 PATH에 `curl-config`가 없으면, 경로를 명시적으로 지정할 수 있습니다:

```sh
export CURL_CONFIG=/opt/homebrew/opt/curl/bin/curl-config
make
sudo make install
```

다음과 같은 오류가 발생하면:

```text
"Makefile", line 8: Need an operator
```

GNU make를 사용해야 하며, 시스템에는 `gmake`라는 이름으로 설치되어 있을 수 있습니다:

```sh
gmake
gmake install
gmake installcheck
```

다음과 같은 오류가 발생하면:

```text
make: pg_config: Command not found
```

`pg_config`가 설치되어 있고 PATH에 포함되어 있는지 확인하십시오. RPM과 같은
패키지 관리 시스템을 사용하여 PostgreSQL을 설치했다면,
`-devel` 패키지도 설치되어 있는지 확인하십시오. 필요하다면 빌드 과정에
해당 파일의 위치를 지정하십시오:

```sh
export PG_CONFIG=/path/to/pg_config
make
sudo make install
```

PostgreSQL 18 이상에서 사용자 지정 prefix 경로에 확장을 설치하려면,
`install`에 `prefix` 인수를 전달하십시오 (`make`의 다른 타깃은 사용하지 마십시오).

```sh
sudo make install prefix=/usr/local/extras
```

그런 다음 아래 [`postgresql.conf`
매개변수]에 해당 접두사가 포함되어 있는지 확인합니다:

```ini
extension_control_path = '/usr/local/extras/postgresql/share:$system'
dynamic_library_path   = '/usr/local/extras/postgresql/lib:$libdir'
```


#### 테스트 \{#testing\}

확장을 설치한 후 테스트 스위트를 실행하려면 다음을 실행하십시오.

```sh
make installcheck
```

다음과 같은 오류가 발생하면:

```text
ERROR:  must be owner of database regression
```

기본 슈퍼유저인 「postgres」와 같은 슈퍼유저로 테스트 스위트를 실행해야 합니다.

```sh
make installcheck PGUSER=postgres
```


### 로딩 \{#loading\}

`pg_clickhouse`가 설치된 후 슈퍼유저 권한으로 접속하여 다음 명령을 실행하면
데이터베이스에 추가할 수 있습니다:

```sql
CREATE EXTENSION pg_clickhouse;
```

`pg_clickhouse`와 이를 지원하는 모든 오브젝트를 특정 스키마에 설치하려면 `SCHEMA` 절을 사용하여 다음과 같이 스키마를 지정하십시오:`

```sql
CREATE SCHEMA env;
CREATE EXTENSION pg_clickhouse SCHEMA env;
```


## Dependencies \{#dependencies\}

`pg_clickhouse` 확장은 [PostgreSQL] 13 이상과 [libcurl], [libuuid]가 필요합니다. 확장을 빌드하려면 C 및 C++ 컴파일러와 [libSSL], [GNU make], [CMake]가 필요합니다.

## 로드맵 \{#road-map\}

가장 중요한 목표는 DML 기능을 추가하기 전에 분석 워크로드에 대한 푸시다운 적용 범위를 완료하는 것입니다. 로드맵은 다음과 같습니다:

*   푸시다운되지 않은 나머지 10개의 TPC-H 쿼리에 대해 최적의 실행 계획 구현
*   ClickBench 쿼리에 대한 푸시다운을 테스트하고 수정
*   모든 PostgreSQL 집계 함수의 투명한 푸시다운 지원
*   모든 PostgreSQL 함수의 투명한 푸시다운 지원
*   서버 수준 및 세션 수준에서 ClickHouse 설정을 CREATE SERVER 및 GUC를 통해 구성 가능하도록 지원
*   모든 ClickHouse 데이터 타입 지원
*   경량한 삭제(lightweight DELETE) 및 UPDATE 지원
*   COPY를 통한 배치 삽입 지원
*   임의의 ClickHouse 쿼리를 실행하고 그 결과를 테이블로 반환하는 함수 추가
*   모든 하위 쿼리가 원격 데이터베이스를 조회하는 경우 UNION 쿼리의 푸시다운 지원 추가

## 저자 \{#authors\}

*   [David E. Wheeler](https://justatheory.com/)
*   [Ildus Kurbangaliev](https://github.com/ildus)
*   [Ibrar Ahmed](https://github.com/ibrarahmad)

## 저작권 \{#copyright\}

*   Copyright (c) 2025-2026, ClickHouse
*   일부 Copyright (c) 2023-2025, Ildus Kurbangaliev
*   일부 Copyright (c) 2019-2023, Adjust GmbH
*   일부 Copyright (c) 2012-2019, PostgreSQL Global Development Group

[pg_clickhouse]: https://github.com/clickHouse/pg_clickhouse
    "GitHub의 pg_clickhouse"

[import foreign tables]: /integrations/pg_clickhouse/reference#import-foreign-schema

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse
    "최신 Docker 릴리스"

[tutorial]: /integrations/pg_clickhouse/tutorial "pg_clickhouse 튜토리얼"

[PostgreSQL Apt]: https://wiki.postgresql.org/wiki/Apt

[PostgreSQL Yum]: https://yum.postgresql.org

[PGXN client]: https://pgxn.github.io/pgxnclient/ "PGXN Client 문서화"

[Homebrew]: https://formulae.brew.sh/formula/pgxnclient#default
    "Homebrew의 PGXN client"

[Apt]: https://tracker.debian.org/pkg/pgxnclient
    "Debian Apt의 PGXN client"

[`postgresql.conf` parameters]: https://www.postgresql.org/docs/devel/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-OTHER

[PostgreSQL]: https://www.postgresql.org "PostgreSQL: 세계에서 가장 발전된 오픈 소스 관계형 데이터베이스"

[libcurl]: https://curl.se/libcurl/ "libcurl — 네트워크 전송 라이브러리"

[libuuid]: https://linux.die.net/man/3/libuuid "libuuid - DCE 호환 범용 고유 식별자(UUID) 라이브러리"

[GNU make]: https://www.gnu.org/software/make "GNU Make"

[CMake]: https://cmake.org/ "CMake: 강력한 소프트웨어 빌드 시스템"

[LibSSL]: https://openssl-library.org "OpenSSL 라이브러리"

[TPC-H]: https://www.tpc.org/tpch/

[쿼리 1] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/1.sql
  [쿼리 2] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/2.sql
  [쿼리 3] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/3.sql
  [쿼리 4] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/4.sql
  [쿼리 5] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/5.sql
  [쿼리 6] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/6.sql
  [쿼리 7] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/7.sql
  [쿼리 8] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/8.sql
  [쿼리 9] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/9.sql
  [쿼리 10] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/10.sql
  [쿼리 11] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/11.sql
  [쿼리 12] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/12.sql
  [쿼리 13] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/13.sql
  [쿼리 14] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/14.sql
  [쿼리 15] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/15.sql
  [쿼리 16] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/16.sql
  [쿼리 17] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/17.sql
  [쿼리 18] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/18.sql
  [쿼리 19] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/19.sql
  [쿼리 20] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/20.sql
  [쿼리 21] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/21.sql
  [쿼리 22] https://github.com/ClickHouse/pg_clickhouse/blob/main/dev/tpch/queries/22.sql