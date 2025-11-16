---
'description': '테이블 함수 `remote`는 분산 테이블을 생성하지 않고도 즉시 원격 서버에 접근할 수 있게 해줍니다. 테이블 함수
  `remoteSecure`는 보안 연결을 통해 `remote`와 동일합니다.'
'sidebar_label': '원격'
'sidebar_position': 175
'slug': '/sql-reference/table-functions/remote'
'title': '원격, remoteSecure'
'doc_type': 'reference'
---


# remote, remoteSecure 테이블 함수

테이블 함수 `remote`는 원격 서버에 즉시 접근할 수 있게 해줍니다. 즉, [Distributed](../../engines/table-engines/special/distributed.md) 테이블을 생성하지 않고도 가능합니다. 테이블 함수 `remoteSecure`는 `remote`와 동일하지만 보안 연결을 통해 작동합니다.

두 함수 모두 `SELECT` 및 `INSERT` 쿼리에서 사용할 수 있습니다.

## 구문 {#syntax}

```sql
remote(addresses_expr, [db, table, user [, password], sharding_key])
remote(addresses_expr, [db.table, user [, password], sharding_key])
remote(named_collection[, option=value [,..]])
remoteSecure(addresses_expr, [db, table, user [, password], sharding_key])
remoteSecure(addresses_expr, [db.table, user [, password], sharding_key])
remoteSecure(named_collection[, option=value [,..]])
```

## 매개변수 {#parameters}

| 인수             | 설명                                                                                                                                                                                                                                                                                                                                                            |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `addresses_expr` | 원격 서버 주소 또는 여러 원격 서버 주소를 생성하는 표현식입니다. 형식: `host` 또는 `host:port`.<br/><br/>    `host`는 서버 이름 또는 IPv4 또는 IPv6 주소로 지정할 수 있습니다. IPv6 주소는 대괄호로 지정해야 합니다.<br/><br/>    `port`는 원격 서버의 TCP 포트입니다. 포트가 생략되면, 테이블 함수 `remote`에 대해 서버 구성 파일의 [tcp_port](../../operations/server-configuration-parameters/settings.md#tcp_port) (기본값: 9000)와 테이블 함수 `remoteSecure`에 대해 [tcp_port_secure](../../operations/server-configuration-parameters/settings.md#tcp_port_secure) (기본값: 9440)가 사용됩니다.<br/><br/>    IPv6 주소의 경우, 포트가 필요합니다.<br/><br/>    `addresses_expr`만 지정된 경우, `db`와 `table`는 기본적으로 `system.one`을 사용합니다.<br/><br/>    유형: [String](../../sql-reference/data-types/string.md). |
| `db`           | 데이터베이스 이름. 유형: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                                                                  |
| `table`        | 테이블 이름. 유형: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                                                                        |
| `user`         | 사용자 이름. 지정하지 않으면 `default`가 사용됩니다. 유형: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                           |
| `password`     | 사용자 비밀번호. 지정하지 않으면 빈 비밀번호가 사용됩니다. 유형: [String](../../sql-reference/data-types/string.md).                                                                                                                                                                                                                                     |
| `sharding_key` | 노드 간 데이터 배포를 지원하는 샤딩 키입니다. 예: `insert into remote('127.0.0.1:9000,127.0.0.2', db, table, 'default', rand())`. 유형: [UInt32](../../sql-reference/data-types/int-uint.md).                                                                                                                                |

인수는 [named collections](operations/named-collections.md)를 사용하여 전달할 수도 있습니다.

## 반환 값 {#returned-value}

원격 서버에 위치한 테이블입니다.

## 사용법 {#usage}

테이블 함수 `remote`와 `remoteSecure`는 각 요청에 대해 연결을 재설정하므로, 대신 `Distributed` 테이블을 사용하는 것이 좋습니다. 또한 호스트 이름이 설정되면, 이름이 해결되고 여러 복제본을 사용할 때 오류가 계산되지 않습니다. 많은 쿼리를 처리할 때는 항상 사전에 `Distributed` 테이블을 생성하고 `remote` 테이블 함수를 사용하지 않도록 하세요.

`remote` 테이블 함수는 다음과 같은 경우에 유용할 수 있습니다:

- 한 시스템에서 다른 시스템으로의 일회성 데이터 마이그레이션
- 데이터 비교, 디버깅 및 테스트를 위한 특정 서버 접근, 즉 비공식 연결.
- 다양한 ClickHouse 클러스터 간의 연구 목적을 위한 쿼리.
- 수동으로 수행되는 드문 분산 요청.
- 매번 서버 집합이 재정의되는 분산 요청.

### 주소 {#addresses}

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

여러 주소는 쉼표로 구분될 수 있습니다. 이 경우 ClickHouse는 분산 처리를 사용하여 지정된 모든 주소(서로 다른 데이터가 있는 샤드)에 쿼리를 전송합니다. 예:

```text
example01-01-1,example01-02-1
```

## 예제 {#examples}

### 원격 서버에서 데이터 선택하기: {#selecting-data-from-a-remote-server}

```sql
SELECT * FROM remote('127.0.0.1', db.remote_engine_table) LIMIT 3;
```

또는 [named collections](operations/named-collections.md)를 사용할 수 있습니다:

```sql
CREATE NAMED COLLECTION creds AS
        host = '127.0.0.1',
        database = 'db';
SELECT * FROM remote(creds, table='remote_engine_table') LIMIT 3;
```

### 원격 서버의 테이블에 데이터 삽입하기: {#inserting-data-into-a-table-on-a-remote-server}

```sql
CREATE TABLE remote_table (name String, value UInt32) ENGINE=Memory;
INSERT INTO FUNCTION remote('127.0.0.1', currentDatabase(), 'remote_table') VALUES ('test', 42);
SELECT * FROM remote_table;
```

### 한 시스템에서 다른 시스템으로의 테이블 마이그레이션: {#migration-of-tables-from-one-system-to-another}

이 예제는 샘플 데이터 세트에서 하나의 테이블을 사용합니다. 데이터베이스는 `imdb`, 테이블은 `actors`입니다.

#### 원본 ClickHouse 시스템에서 {#on-the-source-clickhouse-system-the-system-that-currently-hosts-the-data}

- 원본 데이터베이스 및 테이블 이름(`imdb.actors`)을 확인합니다.

```sql
show databases
```

```sql
show tables in imdb
```

- 원본에서 CREATE TABLE 문을 가져옵니다:

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

#### 대상 ClickHouse 시스템에서 {#on-the-destination-clickhouse-system}

- 대상 데이터베이스를 생성합니다:

```sql
CREATE DATABASE imdb
```

- 원본의 CREATE TABLE 문을 사용하여 대상을 생성합니다:

```sql
CREATE TABLE imdb.actors (`id` UInt32,
                          `first_name` String,
                          `last_name` String,
                          `gender` FixedString(1))
                ENGINE = MergeTree
                ORDER BY (id, first_name, last_name, gender);
```

#### 원본 배포로 돌아가서 {#back-on-the-source-deployment}

원격 시스템에서 생성된 새로운 데이터베이스 및 테이블에 삽입합니다. 호스트, 포트, 사용자 이름, 비밀번호, 대상 데이터베이스 및 대상 테이블이 필요합니다.

```sql
INSERT INTO FUNCTION
remoteSecure('remote.clickhouse.cloud:9440', 'imdb.actors', 'USER', 'PASSWORD')
SELECT * from imdb.actors
```

## 글로빙 {#globs-in-addresses}

중괄호 `{ }` 내의 패턴은 샤드 집합을 생성하고 복제본을 지정하는 데 사용됩니다. 중괄호 쌍이 여러 개인 경우, 해당 집합의 직접 곱이 생성됩니다.

다음 패턴 유형이 지원됩니다.

- `{a,b,c}` - 대안 문자열 `a`, `b` 또는 `c` 중 하나를 나타냅니다. 패턴은 첫 번째 샤드 주소에서 `a`로, 두 번째 샤드 주소에서 `b`로, 그리고 계속해서 변경됩니다. 예를 들어, `example0{1,2}-1`은 `example01-1`과 `example02-1` 주소를 생성합니다.
- `{N..M}` - 숫자의 범위. 이 패턴은 `N`에서 (포함하여) `M`까지 증가하는 인덱스로 샤드 주소를 생성합니다. 예를 들어, `example0{1..2}-1`은 `example01-1`과 `example02-1`을 생성합니다.
- `{0n..0m}` - 선행 0이 있는 숫자의 범위. 이 패턴은 인덱스에서 선행 0을 보존합니다. 예를 들어, `example{01..03}-1`은 `example01-1`, `example02-1` 및 `example03-1`을 생성합니다.
- `{a|b}` - `|` 기호로 구분된 여러 변형. 이 패턴은 복제본을 지정합니다. 예를 들어, `example01-{1|2}`는 복제본 `example01-1` 및 `example01-2`를 생성합니다.

쿼리는 첫 번째 정상 복제본으로 전송됩니다. 그러나 `remote`의 경우 복제본은 현재 설정된 [load_balancing](../../operations/settings/settings.md#load_balancing) 설정의 순서로 반복됩니다. 생성된 주소의 수는 [table_function_remote_max_addresses](../../operations/settings/settings.md#table_function_remote_max_addresses) 설정에 의해 제한됩니다.
