---
'description': '이 테이블 함수는 ClickHouse를 Redis와 통합하는 것을 허용합니다.'
'sidebar_label': 'redis'
'sidebar_position': 170
'slug': '/sql-reference/table-functions/redis'
'title': 'redis'
'doc_type': 'reference'
---


# redis 테이블 함수

이 테이블 함수는 ClickHouse와 [Redis](https://redis.io/)를 통합할 수 있게 해줍니다.

## 구문 {#syntax}

```sql
redis(host:port, key, structure[, db_index[, password[, pool_size]]])
```

## 인수 {#arguments}

| 인수        | 설명                                                                                                    |
|-------------|--------------------------------------------------------------------------------------------------------|
| `host:port` | Redis 서버 주소이며, 포트는 무시할 수 있으며 기본 Redis 포트인 6379가 사용됩니다.                       |
| `key`       | 컬럼 목록에 있는 아무 컬럼 이름.                                                                        |
| `structure` | 이 함수에서 반환된 ClickHouse 테이블의 스키마.                                                          |
| `db_index`  | Redis 데이터베이스 인덱스 범위는 0에서 15까지이며, 기본값은 0입니다.                                      |
| `password`  | 사용자 비밀번호이며, 기본값은 빈 문자열입니다.                                                          |
| `pool_size` | Redis 최대 연결 풀 크기로, 기본값은 16입니다.                                                           |
| `primary`   | 반드시 지정해야 하며, 기본 키에서는 단일 컬럼만 지원합니다. 기본 키는 Redis 키로 바이너리로 직렬화됩니다. |

- 기본 키 이외의 컬럼은 해당 순서에 맞춰 Redis 값으로 바이너리 직렬화됩니다.
- 필터링에서 키가 같거나 포함된 쿼리는 Redis에서 다중 키 조회로 최적화됩니다. 필터링 키가 없는 쿼리는 전체 테이블 스캔이 발생하며 이는 무거운 작업입니다.

현재 `redis` 테이블 함수는 [명명된 컬렉션](/operations/named-collections.md)을 지원하지 않습니다.

## 반환 값 {#returned_value}

Redis 키로서의 키와 함께 Redis 값으로 포장된 다른 컬럼이 있는 테이블 객체입니다.

## 사용 예제 {#usage-example}

Redis에서 읽기:

```sql
SELECT * FROM redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32'
)
```

Redis에 삽입하기:

```sql
INSERT INTO TABLE FUNCTION redis(
    'redis1:6379',
    'key',
    'key String, v1 String, v2 UInt32') values ('1', '1', 1);
```

## 관련 {#related}

- [Redis 테이블 엔진](/engines/table-engines/integrations/redis.md)
- [딕셔너리 소스로서 redis 사용하기](/sql-reference/dictionaries/index.md#redis)
