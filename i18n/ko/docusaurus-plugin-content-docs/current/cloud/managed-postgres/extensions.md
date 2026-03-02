---
slug: /cloud/managed-postgres/extensions
sidebar_label: '확장 기능'
title: 'PostgreSQL 확장 기능'
description: 'ClickHouse Managed Postgres에서 사용 가능한 PostgreSQL 확장 기능'
keywords: ['postgres 확장 기능', 'postgis', 'pgvector', 'pg_cron', 'postgresql 확장 기능']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="extensions" />

Managed Postgres에는 데이터베이스 기능을 확장하기 위해 엄선된 확장 프로그램 세트가 포함되어 있습니다. 사용 가능한 확장 프로그램 목록은 아래와 같습니다.


## 확장 기능 설치 \{#installing-extensions\}

확장 기능을 설치하려면 데이터베이스에 연결한 후 다음 명령을 실행합니다.

```sql
CREATE EXTENSION extension_name;
```

현재 설치된 확장 기능을 보려면:

```sql
SELECT * FROM pg_extension;
```

모든 사용 가능한 확장 기능과 해당 버전을 보려면:

```sql
SELECT * FROM pg_available_extensions;
```


## 사용 가능한 확장 기능 \{#available-extensions\}

| 확장 기능                            | 버전     | 설명                                                      |
| -------------------------------- | ------ | ------------------------------------------------------- |
| `address_standardizer`           | 3.6.1  | 주소를 구성 요소별로 파싱하는 데 사용                                   |
| `address_standardizer-3`         | 3.6.1  | address&#95;standardizer의 별칭                            |
| `address_standardizer_data_us`   | 3.6.1  | Address Standardizer 미국 데이터 세트 예시                       |
| `address_standardizer_data_us-3` | 3.6.1  | address&#95;standardizer&#95;data&#95;us의 별칭            |
| `adminpack`                      | 2.1    | PostgreSQL 관리를 위한 FUNCTION *(PG16 전용)*                  |
| `amcheck`                        |        | 관계 무결성을 검증하는 함수                                         |
| `autoinc`                        | 1.0    | 자동 증가 필드를 위한 함수                                         |
| `bloom`                          | 1.0    | Bloom 접근 방식 — 시그니처 파일 기반 인덱스                            |
| `bool_plperl`                    | 1.0    | bool과 plperl 간의 변환                                      |
| `bool_plperlu`                   | 1.0    | bool과 plperlu 간의 변환                                     |
| `btree_gin`                      | 1.3    | GIN에서 일반적인 데이터 타입의 인덱싱을 지원                              |
| `btree_gist`                     | 1.8    | GiST에서 일반적인 데이터 타입의 인덱싱을 지원                             |
| `citext`                         | 1.8    | 대소문자를 구분하지 않는 문자열용 데이터 타입                               |
| `cube`                           | 1.5    | 다차원 큐브용 데이터 타입                                          |
| `dblink`                         | 1.2    | 데이터베이스 내부에서 다른 PostgreSQL 데이터베이스에 연결할 수 있도록 함           |
| `dict_int`                       | 1.0    | 정수용 텍스트 검색 딕셔너리 Template                                |
| `dict_xsyn`                      | 1.0    | 확장된 동의어 처리를 위한 텍스트 검색 딕셔너리 Template                     |
| `earthdistance`                  | 1.2    | 지구 표면에서 대권(great-circle) 거리를 계산하는 함수                    |
| `file_fdw`                       | 1.0    | 플랫 파일 접근을 위한 외부 데이터 래퍼(foreign data wrapper)            |
| `fuzzystrmatch`                  | 1.2    | 문자열 간 유사도와 거리를 판별합니다                                    |
| `h3`                             | 4.2.3  | PostgreSQL용 H3 바인딩                                      |
| `h3_postgis`                     | 4.2.3  | H3와 PostGIS 통합                                          |
| `hll`                            | 2.19   | HyperLogLog 데이터를 저장하기 위한 데이터 타입                         |
| `hstore`                         | 1.8    | 여러 키-값 쌍을 저장하기 위한 데이터 타입                                |
| `hstore_plperl`                  | 1.0    | hstore와 plperl 간 변환 함수                                  |
| `hstore_plperlu`                 | 1.0    | hstore와 plperlu 간 변환 함수                                 |
| `hypopg`                         | 1.4.2  | PostgreSQL용 가상 인덱스                                      |
| `intagg`                         | 1.1    | 정수 집계 및 열거 함수(사용 중단됨)                                   |
| `insert_username`                | 1.0    | 테이블을 누가 변경했는지 추적하는 함수                                   |
| `intarray`                       | 1.5    | 1차원 정수 배열을 위한 함수, 연산자 및 인덱스 지원                          |
| `ip4r`                           | 2.4    | IPv4 및 IPv6 범위 인덱스 데이터 타입                               |
| `isn`                            | 1.3    | 국제 상품 번호 표준용 데이터 타입                                     |
| `jsonb_plperl`                   | 1.0    | jsonb와 plperl 간 변환 함수                                   |
| `jsonb_plperlu`                  | 1.0    | jsonb와 plperlu 간 변환 함수                                  |
| `lo`                             | 1.2    | 대용량 객체(Large Object) 관리                                 |
| `ltree`                          | 1.3    | 계층적 트리 구조용 데이터 타입                                       |
| `moddatetime`                    | 1.0    | 마지막 수정 시간을 추적하는 함수                                      |
| `mysql_fdw`                      | 1.2    | MySQL 서버를 쿼리하기 위한 외부 데이터 래퍼                             |
| `old_snapshot`                   | 1.0    | old&#95;snapshot&#95;threshold용 유틸리티 *(PG16 전용)*        |
| `orafce`                         | 4.16   | Oracle RDBMS의 일부 함수와 패키지를 에뮬레이션하는 함수와 연산자               |
| `pageinspect`                    | 1.13   | 데이터베이스 페이지의 내용을 저수준에서 검사합니다                             |
| `pg_buffercache`                 |        | 공유 버퍼 캐시를 검사합니다                                         |
| `pg_clickhouse`                  | 0.1    | PostgreSQL에서 ClickHouse 데이터베이스로 쿼리를 보내기 위한 인터페이스를 제공합니다 |
| `pg_cron`                        | 1.6    | PostgreSQL용 작업 스케줄러입니다                                  |
| `pg_freespacemap`                | 1.3    | 여유 공간 맵(FSM)을 검사합니다                                     |
| `pg_hint_plan`                   |        | PostgreSQL 최적화기를 위한 힌트를 제공합니다                           |
| `pg_ivm`                         | 1.13   | PostgreSQL에서 증분 뷰 유지 관리를 수행합니다                          |
| `pg_logicalinspect`              | 1.0    | 논리 디코딩 구성 요소를 검사하는 함수 *(PG18+)*                         |
| `pg_partman`                     | 5.4.0  | 시간 또는 ID를 기준으로 파티셔닝된 테이블을 관리하기 위한 확장 기능입니다              |
| `pg_prewarm`                     | 1.2    | 릴레이션 데이터를 미리 적재(prewarm)합니다                             |
| `pg_repack`                      | 1.5.3  | 최소한의 잠금으로 PostgreSQL 데이터베이스의 테이블을 재구성합니다                |
| `pg_similarity`                  | 1.0    | 유사도 쿼리를 지원합니다                                           |
| `pg_stat_statements`             |        | 실행된 모든 SQL 문에 대한 계획 수립 및 실행 통계를 수집합니다                   |
| `pg_surgery`                     | 1.0    | 손상된 릴레이션을 복구하기 위한 확장 기능입니다                              |
| `pg_trgm`                        | 1.6    | 트라이그램(trigram)을 기반으로 텍스트 유사도를 측정하고 인덱스 검색을 수행합니다        |
| `pg_visibility`                  | 1.2    | 가시성 맵(VM)과 페이지 수준 가시성 정보를 검사합니다                         |
| `pg_walinspect`                  | 1.1    | PostgreSQL 선행 로그(Write-Ahead Log)의 내용을 검사하는 함수를 제공합니다   |
| `pgaudit`                        |        | 감사(auditing) 기능을 제공합니다                                  |
| `pgcrypto`                       | 1.4    | 암호화 함수입니다                                               |
| `pglogical`                      | 2.4.6  | PostgreSQL 논리 복제(Logical Replication) 기능입니다             |
| `pglogical_origin`               | 1.0.0  | Postgres 9.4에서 업그레이드할 때 호환성을 위해 제공되는 더미 확장입니다           |
| `pgrouting`                      | 4.0.0  | pgRouting 확장 기능입니다                                      |
| `pgrowlocks`                     | 1.2    | 행 수준 잠금 정보를 표시합니다                                       |
| `pgstattuple`                    | 1.5    | 튜플 수준 통계를 표시합니다                                         |
| `pgtap`                          | 1.3.4  | PostgreSQL용 단위 테스트                                      |
| `plperl`                         | 1.0    | PL/Perl 절차적 언어                                          |
| `plperlu`                        | 1.0    | PL/PerlU 신뢰할 수 없는 절차적 언어                                |
| `plpgsql`                        | 1.0    | PL/pgSQL 절차적 언어                                         |
| `plpgsql_check`                  | 2.8    | PL/pgSQL 함수에 대한 확장 검사                                   |
| `postgis`                        | 3.6.1  | PostGIS geometry 및 geography 공간 타입과 함수                  |
| `postgis-3`                      | 3.6.1  | postgis에 대한 별칭                                          |
| `postgis_raster`                 | 3.6.1  | PostGIS raster 타입과 함수                                   |
| `postgis_raster-3`               | 3.6.1  | postgis&#95;raster에 대한 별칭                               |
| `postgis_sfcgal`                 | 3.6.1  | PostGIS SFCGAL 함수                                       |
| `postgis_sfcgal-3`               | 3.6.1  | postgis&#95;sfcgal에 대한 별칭                               |
| `postgis_tiger_geocoder`         | 3.6.1  | PostGIS tiger 지오코더 및 역지오코더                              |
| `postgis_tiger_geocoder-3`       | 3.6.1  | postgis&#95;tiger&#95;geocoder에 대한 별칭                   |
| `postgis_topology`               | 3.6.1  | PostGIS topology 공간 타입과 함수                              |
| `postgis_topology-3`             | 3.6.1  | postgis&#95;topology에 대한 별칭                             |
| `postgres_fdw`                   | 1.2    | 원격 PostgreSQL 서버용 Foreign Data Wrapper                  |
| `prefix`                         | 1.2.0  | PostgreSQL용 Prefix Range 모듈                             |
| `refint`                         | 1.0    | 참조 무결성을 구현하기 위한 함수 (사용 중단됨)                             |
| `seg`                            | 1.4    | 선분 또는 부동 소수점 구간을 표현하는 데이터 타입                            |
| `semver`                         | 0.41.0 | 시맨틱 버전(Semantic Version)을 표현하는 데이터 타입                   |
| `sslinfo`                        | 1.2    | SSL 인증서 정보                                              |
| `tablefunc`                      | 1.0    | crosstab을 포함해 전체 테이블을 조작하는 함수                           |
| `tcn`                            | 1.0    | 트리거 기반 변경 알림                                            |
| `tsm_system_rows`                | 1.0    | 행 개수를 기준으로 제한하는 TABLESAMPLE 메서드                         |
| `tsm_system_time`                | 1.0    | 밀리초 단위 시간을 기준으로 제한하는 TABLESAMPLE 메서드                    |
| `unaccent`                       | 1.1    | 악센트를 제거하는 텍스트 검색 딕셔너리                                   |
| `unit`                           | 7      | SI 단위 확장 기능                                             |
| `uuid-ossp`                      | 1.1    | 범용 고유 식별자(UUID)를 생성                                     |
| `vector`                         | 0.8.1  | Vector 데이터 타입과 ivfflat, hnsw 접근 메서드                     |
| `xml2`                           | 1.2    | XPath 쿼리와 XSLT                                          |

## pg_clickhouse extension \{#pg-clickhouse\}

`pg_clickhouse` 확장은 모든 Managed Postgres 인스턴스에 미리 설치되어 있습니다. 이를 사용하면 PostgreSQL에서 ClickHouse 데이터베이스에 직접 쿼리를 실행할 수 있어, 트랜잭션과 분석 작업을 위한 통합 쿼리 계층을 구성할 수 있습니다.

설치 및 사용 방법은 [pg_clickhouse 문서](/integrations/pg_clickhouse)를 참조하십시오.