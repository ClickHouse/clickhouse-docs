---
description: '테이블 함수 `remote`는 분산 테이블을 생성하지 않고도 원격 서버에 동적으로 접근할 수 있게 합니다. 테이블 함수 `remoteSecure`는 보안 연결을 사용하는 점을 제외하면 `remote`와 동일합니다.'
sidebar_label: 'remote'
sidebar_position: 175
slug: /sql-reference/table-functions/remote
title: 'remote, remoteSecure'
doc_type: 'reference'
---



# remote, remoteSecure Table Function \{#remote-remotesecure-table-function\}

`remote` 테이블 함수는 [Distributed](../../engines/table-engines/special/distributed.md) 테이블을 생성하지 않고도 원격 서버에 즉석에서 접근할 수 있도록 합니다. `remoteSecure` 테이블 함수는 보안 연결을 통해 동작한다는 점을 제외하면 `remote`와 동일합니다.

두 함수 모두 `SELECT` 및 `INSERT` 쿼리에서 사용할 수 있습니다.



## 구문 \{#syntax\}

```sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```


## 매개변수 \{#parameters\}

| Argument       | Description                                                                                                                                                                                                                                                                                                                                                        |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `addresses_expr` | 원격 서버 주소 또는 여러 개의 원격 서버 주소를 생성하는 표현식입니다. 형식: `host` 또는 `host:port`.<br/><br/>    `host`는 서버 이름 또는 IPv4, IPv6 주소로 지정할 수 있습니다. IPv6 주소는 대괄호로 둘러싸서 지정해야 합니다.<br/><br/>    `port`는 원격 서버의 TCP 포트입니다. 포트를 생략하면 테이블 함수 `remote`의 경우 서버 설정 파일에 지정된 [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) 값(기본값 9000)을 사용하고, 테이블 함수 `remoteSecure`의 경우 [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) 값(기본값 9440)을 사용합니다.<br/><br/>    IPv6 주소의 경우 포트를 반드시 지정해야 합니다.<br/><br/>    매개변수 `addresses_expr`만 지정된 경우 `db`와 `table`은 기본적으로 `system.one`을 사용합니다.<br/><br/>    데이터 타입: [String](../../sql-reference/data-types/string.md). |
| `db`           | 데이터베이스 이름입니다. 데이터 타입: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                                                          |
| `table`        | 테이블 이름입니다. 데이터 타입: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                                                                 |
| `user`         | 사용자 이름입니다. 지정하지 않으면 `default`가 사용됩니다. 데이터 타입: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                         |
| `password`     | 사용자 비밀번호입니다. 지정하지 않으면 비어 있는 비밀번호가 사용됩니다. 데이터 타입: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                             |
| `sharding_key` | 노드 간 데이터 분산을 지원하기 위한 샤딩 키입니다. 예: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`. 데이터 타입: [UInt32](../../sql-reference/data-types/int-uint.md).                                                                                                                                                           |

인수는 [named collections](operations/named-collections.md)을 사용하여 전달할 수도 있습니다.



## 반환 값 \{#returned-value\}

원격 서버에 있는 테이블입니다.



## 사용법 \{#usage\}

테이블 함수 `remote`와 `remoteSecure`는 요청마다 연결을 다시 설정하므로, 대신 `Distributed` 테이블을 사용하는 것이 좋습니다. 또한 호스트 이름이 설정된 경우 해당 이름이 해석되며, 여러 레플리카와 함께 작업할 때 발생하는 오류는 집계되지 않습니다. 많은 수의 쿼리를 처리할 때에는 항상 미리 `Distributed` 테이블을 생성하고, `remote` 테이블 함수는 사용하지 않아야 합니다.

`remote` 테이블 함수는 다음과 같은 경우에 유용할 수 있습니다:

* 한 시스템에서 다른 시스템으로의 일회성 데이터 마이그레이션
* 데이터 비교, 디버깅, 테스트를 위한 특정 서버에 대한 접근, 즉 애드혹(ad hoc) 연결
* 연구 목적의 다양한 ClickHouse 클러스터 간 쿼리
* 수동으로 수행되는 드문 분산 요청
* 서버 집합이 매번 다시 정의되는 분산 요청

### 주소 \{#addresses\}

```text
example01-01-1
example01-01-1:9440
example01-01-1:9000
localhost
127.0.0.1
[::]:9440
[::]:9000
[2a02:6b8:0:1111::11]:9000
```

여러 주소를 쉼표로 구분하여 지정할 수 있습니다. 이 경우 ClickHouse는 분산 처리를 사용하여 지정된 모든 주소로 쿼리를 전송합니다(서로 다른 데이터를 가진 세그먼트와 유사합니다). 예시:

```text
example01-01-1,example01-02-1
```


## 예시 \{#examples\}

### 원격 서버에서 데이터 조회하기: \{#selecting-data-from-a-remote-server\}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

또는 [named collections](operations/named-collections.md)을 사용하여:

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### 원격 서버의 테이블에 데이터 삽입: \{#inserting-data-into-a-table-on-a-remote-server\}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### 한 시스템에서 다른 시스템으로 테이블 마이그레이션: \{#migration-of-tables-from-one-system-to-another\}

이 예제에서는 샘플 데이터셋의 하나의 테이블을 사용합니다. 데이터베이스는 `imdb`이고, 테이블은 `actors`입니다.

#### 소스 ClickHouse 시스템에서 (현재 데이터를 호스팅 중인 시스템) \{#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data\}

* 소스 데이터베이스와 테이블 이름(`imdb.actors`)을 확인합니다.

  ```sql
  show databases
  ```

  ```sql
  show tables in imdb
  ```

* 소스에서 CREATE TABLE 문을 가져옵니다:

```sql
  SELECT create_table_query
  FROM system.tables
  WHERE database = 'imdb' AND table = 'actors'
```

응답

```sql
CREATE TABLE imdb.actors (`id` UInt32,
                          `first_name` String,
                          `last_name` String,
                          `gender` FixedString(1))
                ENGINE = MergeTree
                ORDER BY (id, first_name, last_name, gender);
```

#### 대상 ClickHouse 시스템에서 \{#on-the-destination-clickhouse-system\}

* 대상 데이터베이스를 생성합니다:

  ```sql
  CREATE DATABASE imdb
  ```

* 원본의 CREATE TABLE 문을 사용하여 대상 테이블을 생성합니다:

  ```sql
  CREATE TABLE imdb.actors (`id` UInt32,
                            `first_name` String,
                            `last_name` String,
                            `gender` FixedString(1))
                  ENGINE = MergeTree
                  ORDER BY (id, first_name, last_name, gender);
  ```

#### 원본 배포 환경으로 돌아와서 \{#back-on-the-source-deployment\}

원격 시스템에 생성된 새 데이터베이스와 테이블에 데이터를 INSERT합니다. 호스트, 포트, 사용자 이름, 비밀번호, 대상 데이터베이스 및 대상 테이블 정보가 필요합니다.

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```


## Globbing \{#globs-in-addresses\}

중괄호 `{ }` 안의 패턴은 세그먼트 집합을 생성하고 레플리카를 지정하는 데 사용됩니다. 여러 쌍의 중괄호가 있는 경우, 해당 집합들의 데카르트 곱이 생성됩니다.

다음과 같은 패턴 유형을 지원합니다.

- `{a,b,c}` - 문자열 `a`, `b`, `c` 중 어느 하나를 나타냅니다. 이 패턴은 첫 번째 세그먼트 주소에서는 `a`로, 두 번째 세그먼트 주소에서는 `b`로, 이런 식으로 대체됩니다. 예를 들어, `example0{1,2}-1`은 `example01-1`과 `example02-1` 주소를 생성합니다.
- `{N..M}` - 숫자 범위입니다. 이 패턴은 `N`부터 `M`(포함)까지 증가하는 인덱스를 가진 세그먼트 주소를 생성합니다. 예를 들어, `example0{1..2}-1`은 `example01-1`과 `example02-1`을 생성합니다.
- `{0n..0m}` - 앞에 0이 붙은 숫자 범위입니다. 이 패턴은 인덱스의 앞자리 0을 유지합니다. 예를 들어, `example{01..03}-1`은 `example01-1`, `example02-1`, `example03-1`을 생성합니다.
- `{a|b}` - `|`로 구분된 임의 개수의 변형을 나타냅니다. 이 패턴은 레플리카를 지정합니다. 예를 들어, `example01-{1|2}`는 `example01-1`과 `example01-2` 레플리카를 생성합니다.

쿼리는 첫 번째로 정상 상태인 레플리카로 전송됩니다. 그러나 `remote`의 경우 레플리카는 현재 [load_balancing](../../operations/settings/settings.md#load_balancing) 설정에 지정된 순서로 순회됩니다.
생성되는 주소의 개수는 [table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses) 설정으로 제한됩니다.
