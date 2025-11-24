---
'description': '원격 MongoDB 서버에 저장된 데이터에 대해 `SELECT` 쿼리를 수행할 수 있습니다.'
'sidebar_label': 'mongodb'
'sidebar_position': 135
'slug': '/sql-reference/table-functions/mongodb'
'title': 'mongodb'
'doc_type': 'reference'
---


# mongodb 테이블 함수

원격 MongoDB 서버에 저장된 데이터에 대해 `SELECT` 쿼리를 수행할 수 있게 해줍니다.

## 구문 {#syntax}

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]])
```

## 인수 {#arguments}

| 인수          | 설명                                                                                                   |
|---------------|--------------------------------------------------------------------------------------------------------|
| `host:port`   | MongoDB 서버 주소.                                                                                     |
| `database`    | 원격 데이터베이스 이름.                                                                                |
| `collection`  | 원격 컬렉션 이름.                                                                                    |
| `user`        | MongoDB 사용자.                                                                                        |
| `password`    | 사용자 비밀번호.                                                                                       |
| `structure`   | 이 함수에서 반환되는 ClickHouse 테이블의 스키마.                                                       |
| `options`     | MongoDB 연결 문자열 옵션(선택적 매개변수).                                                           |
| `oid_columns` | WHERE 절에서 `oid`로 처리되어야 할 컬럼의 쉼표로 구분된 목록. 기본값은 `_id`입니다.               |

:::tip
MongoDB Atlas 클라우드 서비스를 사용하고 있다면 다음 옵션을 추가하십시오:

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```
:::

URI를 통해서도 연결할 수 있습니다:

```sql
mongodb(uri, collection, structure[, oid_columns])
```

| 인수          | 설명                                                                                                   |
|---------------|--------------------------------------------------------------------------------------------------------|
| `uri`         | 연결 문자열.                                                                                           |
| `collection`  | 원격 컬렉션 이름.                                                                                    |
| `structure`   | 이 함수에서 반환되는 ClickHouse 테이블의 스키마.                                                       |
| `oid_columns` | WHERE 절에서 `oid`로 처리되어야 할 컬럼의 쉼표로 구분된 목록. 기본값은 `_id`입니다.               |

## 반환 값 {#returned_value}

원래 MongoDB 테이블과 동일한 컬럼을 가진 테이블 객체입니다.

## 예제 {#examples}

`test`라는 MongoDB 데이터베이스에 정의된 `my_collection`이라는 컬렉션이 있다고 가정하고, 몇 개의 문서를 삽입합니다:

```sql
db.createUser({user:"test_user",pwd:"password",roles:[{role:"readWrite",db:"test"}]})

db.createCollection("my_collection")

db.my_collection.insertOne(
    { log_type: "event", host: "120.5.33.9", command: "check-cpu-usage -w 75 -c 90" }
)

db.my_collection.insertOne(
    { log_type: "event", host: "120.5.33.4", command: "system-check"}
)
```

`mongodb` 테이블 함수를 사용하여 컬렉션을 쿼리해 보겠습니다:

```sql
SELECT * FROM mongodb(
    '127.0.0.1:27017',
    'test',
    'my_collection',
    'test_user',
    'password',
    'log_type String, host String, command String',
    'connectTimeoutMS=10000'
)
```

또는:

```sql
SELECT * FROM mongodb(
    'mongodb://test_user:password@127.0.0.1:27017/test?connectionTimeoutMS=10000',
    'my_collection',
    'log_type String, host String, command String'
)
```

## 관련 {#related}

- [MongoDB 테이블 엔진](engines/table-engines/integrations/mongodb.md)
- [MongoDB를 딕셔너리 출처로 사용하기](sql-reference/dictionaries/index.md#mongodb)
