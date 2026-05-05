---
description: '원격 MongoDB 서버에 저장된 데이터에 대해 `SELECT` 쿼리를 실행할 수 있게 합니다.'
sidebar_label: 'mongodb'
sidebar_position: 135
slug: /sql-reference/table-functions/mongodb
title: 'mongodb'
doc_type: 'reference'
---

# mongodb Table Function \{#mongodb-table-function\}

원격 MongoDB 서버에 저장된 데이터에 대해 `SELECT` 쿼리를 실행할 수 있도록 합니다.

## 구문 \{#syntax\}

```sql
mongodb(host:port, database, collection, user, password, structure[, options[, oid_columns]]);
mongodb(uri, collection, structure[, oid_columns]);
mongodb(named_collection_name[, <arg>=<value>...]);
```


## Arguments \{#arguments\}

| Argument      | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| `host:port`   | MongoDB 서버 주소입니다.                                           |
| `database`    | 원격 데이터베이스 이름입니다.                                            |
| `collection`  | 원격 컬렉션 이름입니다.                                               |
| `user`        | MongoDB 사용자입니다.                                             |
| `password`    | 사용자 비밀번호입니다.                                                |
| `structure`   | 이 FUNCTION이 반환하는 ClickHouse 테이블의 스키마입니다.                    |
| `options`     | MongoDB 연결 문자열 옵션입니다(선택적 매개변수).                             |
| `oid_columns` | WHERE 절에서 `oid`로 처리해야 하는 컬럼들의 쉼표로 구분된 목록입니다. 기본값은 `_id`입니다. |

:::tip
MongoDB Atlas Cloud 서비스를 사용하는 경우 다음 옵션을 추가하십시오:

```ini
'connectTimeoutMS=10000&ssl=true&authSource=admin'
```

:::

URI를 통해서도 연결할 수 있습니다:

```sql
mongodb(uri, collection, structure[, oid_columns])
```

| Argument      | Description                                                |
| ------------- | ---------------------------------------------------------- |
| `uri`         | 연결 문자열입니다.                                                 |
| `collection`  | 원격 컬렉션 이름입니다.                                              |
| `structure`   | 이 FUNCTION이 반환하는 ClickHouse 테이블의 스키마입니다.                   |
| `oid_columns` | WHERE 절에서 `oid`로 처리해야 하는 컬럼의 쉼표로 구분된 목록입니다. 기본값은 `_id`입니다. |
| :::           |                                                            |

인수는 이름이 지정된 컬렉션(named collection)을 사용해 전달할 수 있습니다:

```sql
mongodb(_named_collection_[, host][, port][, database][, collection][, user][, password][, structure][, options][, oid_columns])
-- or
mongodb(_named_collection_[, uri][, structure][, oid_columns])
```


## 반환 값 \{#returned_value\}

원본 MongoDB 테이블과 동일한 컬럼을 갖는 테이블 객체입니다.

## 예시 \{#examples\}

MongoDB 데이터베이스 `test`에 정의된 `my_collection`이라는 컬렉션이 있고, 여기에 몇 개의 문서를 삽입했다고 가정합니다:

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

`mongodb` table function을 사용하여 컬렉션을 쿼리해 보겠습니다:

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

또는:

```sql
CREATE NAMED COLLECTION mongo_creds AS
       uri='mongodb://test_user:password@127.0.0.1:27017/test?connectionTimeoutMS=10000',
       collection='default_collection';

SELECT * FROM mongodb(
        mongo_creds,
        collection = 'my_collection',
        structure = 'log_type String, host String, command String'
)
```


## 관련 항목 \{#related\}

- [`MongoDB` 테이블 엔진](engines/table-engines/integrations/mongodb.md)
- [MongoDB를 딕셔너리(Dictionary) 소스로 사용하기](../statements/create/dictionary/sources/mongodb.md)