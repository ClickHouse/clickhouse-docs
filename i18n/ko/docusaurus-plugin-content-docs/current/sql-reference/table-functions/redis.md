---
description: '이 테이블 함수는 ClickHouse를 Redis와 통합할 수 있게 합니다.'
sidebar_label: 'redis'
sidebar_position: 170
slug: /sql-reference/table-functions/redis
title: 'redis'
doc_type: 'reference'
---

# redis 테이블 함수 \{#redis-table-function\}

이 테이블 함수는 ClickHouse를 [Redis](https://redis.io/)와 통합할 수 있게 합니다.

## 구문 \{#syntax\}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```


## Arguments \{#arguments\}

| Argument    | Description                                                                                                |
|-------------|------------------------------------------------------------------------------------------------------------|
| `host:port` | Redis 서버 주소입니다. 포트를 생략하면 기본 Redis 포트인 6379가 사용됩니다.                          |
| `key`       | 컬럼 목록에 포함된 임의의 컬럼 이름입니다.                                                                        |
| `structure` | 이 함수가 반환하는 ClickHouse 테이블의 스키마입니다.                                             |
| `db_index`  | Redis DB 인덱스 범위는 0부터 15까지이며, 기본값은 0입니다.                                                             |
| `password`  | 비밀번호입니다. 기본값은 빈 문자열입니다.                                                                    |
| `pool_size` | Redis 최대 연결 풀 크기입니다. 기본값은 16입니다.                                                               |
| `primary`   | 반드시 지정해야 하며, 기본 키에서 하나의 컬럼만 지원합니다. 기본 키는 Redis 키로 바이너리 형식으로 직렬화됩니다. |

- 기본 키 이외의 컬럼은 모두 해당 순서대로 Redis 값으로 바이너리 형식으로 직렬화됩니다.
- key 컬럼에 대한 `=` 또는 `IN` 필터 조건이 있는 쿼리는 Redis에 대한 멀티 키 조회로 최적화됩니다. 필터링 key 없이 쿼리를 실행하면 전체 테이블 스캔이 발생하며, 이는 부하가 큰 작업입니다.

현재 `redis` table function에서는 [Named collections](/operations/named-collections.md)를 지원하지 않습니다.

## 반환 값 \{#returned_value\}

Redis 키를 key로 사용하고, 나머지 컬럼을 하나의 Redis value로 묶은 테이블 객체입니다.

## 사용 예제 \{#usage-example\}

Redis에서 읽기:

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Redis에 삽입:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```


## 관련 항목 \{#related\}

- [`Redis` 테이블 엔진](/engines/table-engines/integrations/redis.md)
- [Redis를 딕셔너리 소스로 사용하기](/sql-reference/statements/create/dictionary/sources/redis)