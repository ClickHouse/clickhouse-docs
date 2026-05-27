---
sidebar_label: '소개'
description: 'SQL을 다시 작성할 필요 없이 PostgreSQL에서 바로 ClickHouse 분석 쿼리를 실행합니다'
slug: '/cloud/managed-postgres/extensions/pg_clickhouse'
title: 'pg_clickhouse 참고 문서'
doc_type: 'landing-page'
keywords: ['PostgreSQL', 'Postgres', 'FDW', '외부 데이터 래퍼', 'pg_clickhouse', '확장 기능']
---

## 소개 \{#introduction\}

오픈소스 PostgreSQL 확장 기능인 [pg&#95;clickhouse]를 사용하면 SQL을 전혀 다시 작성하지
않고도 PostgreSQL에서 바로 ClickHouse로 분석 쿼리를 실행할 수 있습니다. PostgreSQL 13
이상과 ClickHouse v23 이상을 지원합니다.

[ClickPipes](/integrations/clickpipes)가 데이터를 ClickHouse에 동기화하기
시작하면 pg&#95;clickhouse를 사용해 [외부 테이블 가져오기]를 통해 PostgreSQL 스키마로
빠르고 쉽게 가져오십시오. 그런 다음 해당 테이블에 대해 기존 PostgreSQL 쿼리를
실행하면 기존 코드베이스를 유지하면서도 실행은 ClickHouse로 푸시다운할 수
있습니다.

## 시작하기 \{#getting-started\}

pg&#95;clickhouse를 가장 간단하게 사용해 보는 방법은 [Docker 이미지]를 이용하는 것이며, 여기에는
pg&#95;clickhouse와 [re2] 확장 기능이 포함된 표준 PostgreSQL Docker 이미지가 들어 있습니다:

```sh
docker run --name pg_clickhouse -e POSTGRES_PASSWORD=my_pass \
       -d ghcr.io/clickhouse/pg_clickhouse:18
docker exec -it pg_clickhouse psql -U postgres -c 'CREATE EXTENSION pg_clickhouse'
```

ClickHouse 테이블(table) 가져오기와 쿼리 푸시다운을 시작하려면 [튜토리얼]을
참조하십시오.

## 테스트 케이스: TPC-H \{#test-case-tpc-h\}

이 표는 일반 PostgreSQL
테이블과 ClickHouse에 연결된 pg&#95;clickhouse의 [TPC-H] 쿼리 성능을 비교한 것으로, 둘 다 스케일
팩터 1로 로드되었습니다. ✔︎는 완전한 푸시다운을 의미하며, 대시는 1분 후 쿼리가
취소되었음을 의미합니다. 모든 테스트는 36 GB
메모리를 탑재한 MacBook Pro M4 Max에서 실행되었습니다.

|         쿼리 | PostgreSQL | pg&#95;clickhouse | 푸시다운 |
| ---------: | ---------: | ----------------: | :--: |
|  [Query 1] |    4693 ms |            268 ms |  ✔︎  |
|  [Query 2] |     458 ms |           3446 ms |      |
|  [Query 3] |     742 ms |            111 ms |  ✔︎  |
|  [Query 4] |     270 ms |            130 ms |  ✔︎  |
|  [Query 5] |     337 ms |           1460 ms |  ✔︎  |
|  [Query 6] |     764 ms |             53 ms |  ✔︎  |
|  [Query 7] |     619 ms |             96 ms |  ✔︎  |
|  [Query 8] |     342 ms |            156 ms |  ✔︎  |
|  [Query 9] |    3094 ms |            298 ms |  ✔︎  |
| [Query 10] |     581 ms |            197 ms |  ✔︎  |
| [Query 11] |     212 ms |             24 ms |      |
| [Query 12] |    1116 ms |             84 ms |  ✔︎  |
| [Query 13] |     958 ms |           1368 ms |      |
| [Query 14] |     181 ms |             73 ms |  ✔︎  |
| [Query 15] |    1118 ms |            557 ms |      |
| [Query 16] |     497 ms |           1714 ms |      |
| [Query 17] |    1846 ms |          32709 ms |      |
| [Query 18] |    5823 ms |          10649 ms |      |
| [Query 19] |      53 ms |            206 ms |  ✔︎  |
| [Query 20] |     421 ms |                 - |      |
| [Query 21] |    1349 ms |           4434 ms |      |
| [Query 22] |     258 ms |           1415 ms |      |

### 소스 코드로 빌드하기 \{#compile-from-source\}

#### 일반 Unix \{#general-unix\}

PostgreSQL 및 curl 개발 패키지에는 `pg_config`와
`curl-config`가 경로에 포함되어 있으므로, `make`(또는
`gmake`)를 실행한 다음 `make install`을 실행하고 데이터베이스에서
`CREATE EXTENSION pg_clickhouse`를 실행하면 됩니다.

#### Debian / Ubuntu / APT \{#debian--ubuntu--apt\}

PostgreSQL Apt 리포지토리에서 가져오는 방법에 대한 자세한 내용은 [PostgreSQL Apt]를 참고하십시오.

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

PostgreSQL Yum 리포지토리에서 가져오는 방법에 대한 자세한 내용은 [PostgreSQL Yum]을 참조하십시오.

#### PGXN에서 설치 \{#install-from-pgxn\}

위 종속성 요구 사항이 충족되면 [PGXN 클라이언트]([Homebrew], [Apt], 그리고 `pgxnclient`라는 이름의 Yum 패키지로 제공됨)를 사용하여 `pg_clickhouse`를 다운로드하고, 컴파일한 뒤 설치하십시오:

```sh
pgxn install pg_clickhouse
```

#### 컴파일 및 설치 \{#compile-and-install\}

ClickHouse 라이브러리와 `pg_clickhouse`를 빌드하여 설치하려면 다음을 실행하십시오.

```sh
make
sudo make install
```

{/* XXX DSO는 현재 비활성화되어 있습니다.
  기본적으로 `make`는 `clickhouse-cpp` 라이브러리를 동적으로 링크합니다(macOS는 예외이며,
  macOS에서는 동적 `clickhouse-cpp` 라이브러리가 아직 지원되지 않습니다). ClickHouse 라이브러리를
  `pg_clickhouse`에 정적으로 컴파일하려면 `CH_BUILD=static`을
  지정하십시오:

  ```sh
  make CH_BUILD=static
  sudo make install CH_BUILD=static
  ```
  */ }

호스트에 PostgreSQL이 여러 버전 설치되어 있다면, 적절한 버전의 `pg_config`를
지정해야 할 수 있습니다:

```sh
export PG_CONFIG=/usr/lib/postgresql/18/bin/pg_config
make
sudo make install
```

호스트의 PATH에 `curl-config`가 없으면 경로를
명시적으로 지정할 수 있습니다:

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

다음과 같은 오류가 발생하는 경우:

```text
make: pg_config: Command not found
```

`pg_config`가 설치되어 있고 PATH에 포함되어 있는지 확인하십시오. RPM과 같은
패키지 관리 시스템을 사용하여 PostgreSQL을 설치한 경우
`-devel` 패키지도 함께 설치되어 있어야 합니다. 필요한 경우 빌드 프로세스에
해당 항목의 위치를 알려주십시오:

```sh
export PG_CONFIG=/path/to/pg_config
make
sudo make install
```

PostgreSQL 18 이상에서 확장 기능을 사용자 지정 경로에 설치하려면
`install`에만 `prefix` 인수를 지정하십시오(`make`의 다른 대상에는 지정하지 마십시오):

```sh
sudo make install prefix=/usr/local/extras
```

그런 다음 다음 [`postgresql.conf`
매개변수]에 접두어가 포함되어 있는지 확인하십시오:

```ini
extension_control_path = '/usr/local/extras/postgresql/share:$system'
dynamic_library_path   = '/usr/local/extras/postgresql/lib:$libdir'
```

#### 테스트 \{#testing\}

확장 기능을 설치한 후 테스트 스위트를 실행하려면 다음 명령을 실행하십시오.

```sh
make installcheck
```

예를 들어 다음과 같은 오류가 발생하면:

```text
ERROR:  must be owner of database regression
```

기본
&quot;postgres&quot; 슈퍼유저와 같은 슈퍼유저를 사용하여 테스트 스위트를 실행해야 합니다:

```sh
make installcheck PGUSER=postgres
```

### 로드 \{#loading\}

`pg_clickhouse`를 설치한 후에는 슈퍼유저로 접속한 다음, 아래 명령을 실행하여 데이터베이스에 추가할 수 있습니다:

```sql
CREATE EXTENSION pg_clickhouse;
```

특정 스키마에 `pg_clickhouse`와 관련 지원 객체를 모두 설치하려면
다음과 같이 `SCHEMA` 절을 사용해 스키마를 지정하십시오:

```sql
CREATE SCHEMA env;
CREATE EXTENSION pg_clickhouse SCHEMA env;
```

## 종속 항목 \{#dependencies\}

`pg_clickhouse` 확장 기능을 사용하려면 [PostgreSQL] 13 이상, [libcurl],
[libuuid]가 필요합니다. 확장 기능을 빌드하려면 C 및 C++ 컴파일러, [libSSL], [GNU
make], [CMake]가 필요합니다.

## 로드맵 \{#road-map\}

최우선 과제는 DML 기능을 추가하기 전에 분석 워크로드에 대한 푸시다운 적용 범위를
마무리하는 것입니다. 로드맵은 다음과 같습니다.

* 아직 푸시다운되지 않은 나머지 10개의 TPC-H 쿼리가 최적으로 계획되도록 개선
* ClickBench 쿼리에 대한 푸시다운을 테스트하고 수정
* 모든 PostgreSQL 집계 함수의 투명한 푸시다운 지원
* 모든 PostgreSQL 함수의 투명한 푸시다운 지원
* CREATE SERVER
  및 GUC를 통해 서버 수준 및 세션 수준 ClickHouse 설정 허용
* 모든 ClickHouse 데이터 타입 지원
* 경량한 DELETE 및 UPDATE 지원
* COPY를 통한 일괄 삽입 지원
* 임의의 ClickHouse 쿼리를 실행하고 그
  결과를 테이블로 반환하는 함수 추가
* 모두 원격
  데이터베이스를 쿼리하는 경우 UNION 쿼리에 대한 푸시다운 지원 추가

## 저자 \{#authors\}

* [David E. Wheeler](https://justatheory.com/)
* [Ildus Kurbangaliev](https://github.com/ildus)
* [Ibrar Ahmed](https://github.com/ibrarahmad)

## 저작권 \{#copyright\}

* 저작권 (c) 2025-2026, ClickHouse
* 일부 저작권 (c) 2023-2025, Ildus Kurbangaliev
* 일부 저작권 (c) 2019-2023, Adjust GmbH
* 일부 저작권 (c) 2012-2019, PostgreSQL Global Development Group

[pg_clickhouse]: https://github.com/clickHouse/pg_clickhouse "GitHub의 pg_clickhouse"

[import foreign tables]: /cloud/managed-postgres/extensions/pg_clickhouse/reference#import-foreign-schema

[Docker image]: https://github.com/ClickHouse/pg_clickhouse/pkgs/container/pg_clickhouse "최신 Docker 릴리스"

[tutorial]: /cloud/managed-postgres/extensions/pg_clickhouse/tutorial "pg_clickhouse 튜토리얼"

[PostgreSQL Apt]: https://wiki.postgresql.org/wiki/Apt

[PostgreSQL Yum]: https://yum.postgresql.org

[PGXN client]: https://pgxn.github.io/pgxnclient/ "PGXN 클라이언트 문서"

[Homebrew]: https://formulae.brew.sh/formula/pgxnclient#default "Homebrew의 PGXN 클라이언트"

[Apt]: https://tracker.debian.org/pkg/pgxnclient "Debian Apt의 PGXN 클라이언트"

[`postgresql.conf` parameters]: https://www.postgresql.org/docs/devel/runtime-config-client.html#RUNTIME-CONFIG-CLIENT-OTHER

[PostgreSQL]: https://www.postgresql.org "PostgreSQL: 세계에서 가장 진보한 오픈 소스 관계형 데이터베이스"

[libcurl]: https://curl.se/libcurl/ "libcurl — 네트워크 전송 라이브러리"

[libuuid]: https://linux.die.net/man/3/libuuid "libuuid - DCE 호환 범용 고유 식별자 라이브러리"

[GNU make]: https://www.gnu.org/software/make "GNU Make"

[CMake]: https://cmake.org/ "CMake: 강력한 소프트웨어 빌드 시스템"

[LibSSL]: https://openssl-library.org "OpenSSL 라이브러리"

[TPC-H]: https://www.tpc.org/tpch/

[re2]: https://github.com/ClickHouse/pg_re2 "pg_re2: RE2를 사용하는 ClickHouse 호환 정규식 함수"

[쿼리 1] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/1.sql
[쿼리 2] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/2.sql
[쿼리 3] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/3.sql
[쿼리 4] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/4.sql
[쿼리 5] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/5.sql
[쿼리 6] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/6.sql
[쿼리 7] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/7.sql
[쿼리 8] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/8.sql
[쿼리 9] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/9.sql
[쿼리 10] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/10.sql
[쿼리 11] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/11.sql
[쿼리 12] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/12.sql
[쿼리 13] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/13.sql
[쿼리 14] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/14.sql
[쿼리 15] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/15.sql
[쿼리 16] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/16.sql
[쿼리 17] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/17.sql
[쿼리 18] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/18.sql
[쿼리 19] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/19.sql
[쿼리 20] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/20.sql
[쿼리 21] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/21.sql
[쿼리 22] https://github.com/ClickHouse/pg&#95;clickhouse/blob/main/dev/tpch/queries/22.sql