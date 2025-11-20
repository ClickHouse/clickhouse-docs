---
'description': 'MongoDB 엔진은 원격 컬렉션에서 데이터를 읽을 수 있는 읽기 전용 테이블 엔진입니다.'
'sidebar_label': 'MongoDB'
'sidebar_position': 135
'slug': '/engines/table-engines/integrations/mongodb'
'title': 'MongoDB 테이블 엔진'
'doc_type': 'reference'
---


# MongoDB 테이블 엔진

MongoDB 엔진은 원격 [MongoDB](https://www.mongodb.com/) 컬렉션에서 데이터를 읽을 수 있는 읽기 전용 테이블 엔진입니다.

MongoDB v3.6+ 서버만 지원됩니다.
[Seed list(`mongodb+srv`)](https://www.mongodb.com/docs/manual/reference/glossary/#std-term-seed-list)는 아직 지원되지 않습니다.

## 테이블 생성하기 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name
(
    name1 [type1],
    name2 [type2],
    ...
) ENGINE = MongoDB(host:port, database, collection, user, password[, options[, oid_columns]]);
```

**엔진 매개변수**

| 매개변수       | 설명                                                                                                                                                                                              |
|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host:port`    | MongoDB 서버 주소.                                                                                                                                                                               |
| `database`     | 원격 데이터베이스 이름.                                                                                                                                                                         |
| `collection`   | 원격 컬렉션 이름.                                                                                                                                                                               |
| `user`         | MongoDB 사용자.                                                                                                                                                                                 |
| `password`     | 사용자 비밀번호.                                                                                                                                                                                |
| `options`      | 선택 사항. MongoDB 연결 문자열 [옵션](https://www.mongodb.com/docs/manual/reference/connection-string-options/#connection-options)으로 URL 형식의 문자열입니다. 예: `'authSource=admin&ssl=true'` |
| `oid_columns`  | WHERE 절에서 `oid`로 처리해야 하는 컬럼의 쉼표로 구분된 리스트. 기본값은 `_id`입니다.                                                                                                      |

:::tip
MongoDB Atlas 클라우드 서비스를 사용하는 경우 연결 URL은 'Atlas SQL' 옵션에서 얻을 수 있습니다.
Seed list(`mongodb**+srv**`)는 아직 지원되지 않지만 향후 릴리스에 추가될 예정입니다.
:::

대신 URI를 전달할 수도 있습니다:

```sql
ENGINE = MongoDB(uri, collection[, oid_columns]);
```

**엔진 매개변수**

| 매개변수       | 설명                                                                                            |
|----------------|-------------------------------------------------------------------------------------------------|
| `uri`          | MongoDB 서버의 연결 URI.                                                                        |
| `collection`   | 원격 컬렉션 이름.                                                                               |
| `oid_columns`  | WHERE 절에서 `oid`로 처리해야 하는 컬럼의 쉼표로 구분된 리스트. 기본값은 `_id`입니다. |

## 유형 매핑 {#types-mappings}

| MongoDB                 | ClickHouse                                                            |
|-------------------------|-----------------------------------------------------------------------|
| bool, int32, int64      | *모든 숫자형 타입(Decimal 제외)*, Boolean, String                   |
| double                  | Float64, String                                                       |
| date                    | Date, Date32, DateTime, DateTime64, String                            |
| string                  | String, *올바르게 형식화된 경우 모든 숫자형 타입(Decimal 제외)*    |
| document                | String(형태: JSON)                                                   |
| array                   | Array, String(형태: JSON)                                            |
| oid                     | String                                                                |
| binary                  | 컬럼에 있을 경우 String, 배열 또는 문서에 있을 경우 base64 인코딩 문자열 |
| uuid (binary subtype 4) | UUID                                                                  |
| *기타*                  | String                                                                |

MongoDB 문서에서 키가 발견되지 않으면(예: 컬럼 이름이 일치하지 않음) 기본값이나 `NULL`(컬럼이 Nullable인 경우)이 삽입됩니다.

### OID {#oid}

WHERE 절에서 `String`을 `oid`로 처리하려면, 테이블 엔진의 마지막 인수에 컬럼 이름을 넣으면 됩니다. 
이는 기본적으로 MongoDB에서 `oid` 유형을 가지는 `_id` 컬럼으로 레코드를 쿼리하는 경우 필요할 수 있습니다. 
테이블의 `_id` 필드가 다른 유형(예: `uuid`)인 경우 빈 `oid_columns`를 지정해야 하며, 그렇지 않으면 이 매개변수의 기본값인 `_id`가 사용됩니다.

```javascript
db.sample_oid.insertMany([
    {"another_oid_column": ObjectId()},
]);

db.sample_oid.find();
[
    {
        "_id": {"$oid": "67bf6cc44ebc466d33d42fb2"},
        "another_oid_column": {"$oid": "67bf6cc40000000000ea41b1"}
    }
]
```

기본적으로 `_id`만 `oid` 컬럼으로 처리됩니다.

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid');

SELECT count() FROM sample_oid WHERE _id = '67bf6cc44ebc466d33d42fb2'; --will output 1.
SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; --will output 0
```

이 경우 ClickHouse는 `another_oid_column`이 `oid` 유형임을 알지 못하므로 출력은 `0`이 됩니다. 이를 수정해보겠습니다:

```sql
CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('mongodb://user:pass@host/db', 'sample_oid', '_id,another_oid_column');

-- or

CREATE TABLE sample_oid
(
    _id String,
    another_oid_column String
) ENGINE = MongoDB('host', 'db', 'sample_oid', 'user', 'pass', '', '_id,another_oid_column');

SELECT count() FROM sample_oid WHERE another_oid_column = '67bf6cc40000000000ea41b1'; -- will output 1 now
```

## 지원되는 절 {#supported-clauses}

단순 표현식이 포함된 쿼리만 지원됩니다(예: `WHERE field = <constant> ORDER BY field2 LIMIT <constant>`). 
이러한 표현식은 MongoDB 쿼리 언어로 변환되어 서버 측에서 실행됩니다. 
이 모든 제약을 비활성화하려면 [mongodb_throw_on_unsupported_query](../../../operations/settings/settings.md#mongodb_throw_on_unsupported_query)를 사용할 수 있습니다. 
이 경우 ClickHouse는 최선의 노력으로 쿼리를 변환하려고 시도하지만, 이는 전체 테이블 스캔 및 ClickHouse 측에서의 처리를 초래할 수 있습니다.

:::note
Mongo는 엄격한 타입 필터를 요구하므로 리터럴의 유형을 명시적으로 설정하는 것이 항상 좋습니다.\
예를 들어 `Date`로 필터링하려면:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'
```

이것은 Mongo가 문자열을 `Date`로 변환하지 않기 때문에 작동하지 않습니다. 따라서 수동으로 변환해야 합니다:

```sql
SELECT * FROM mongo_table WHERE date = '2024-01-01'::Date OR date = toDate('2024-01-01')
```

이것은 `Date`, `Date32`, `DateTime`, `Bool`, `UUID`에 적용됩니다.

:::

## 사용 예제 {#usage-example}

MongoDB에 [sample_mflix](https://www.mongodb.com/docs/atlas/sample-data/sample-mflix) 데이터셋이 로드되어 있다고 가정합니다.

MongoDB 컬렉션에서 데이터를 읽을 수 있도록 ClickHouse에서 테이블을 생성합니다:

```sql
CREATE TABLE sample_mflix_table
(
    _id String,
    title String,
    plot String,
    genres Array(String),
    directors Array(String),
    writers Array(String),
    released Date,
    imdb String,
    year String
) ENGINE = MongoDB('mongodb://<USERNAME>:<PASSWORD>@atlas-sql-6634be87cefd3876070caf96-98lxs.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin', 'movies');
```

쿼리:

```sql
SELECT count() FROM sample_mflix_table
```

```text
   ┌─count()─┐
1. │   21349 │
   └─────────┘
```

```sql
-- JSONExtractString cannot be pushed down to MongoDB
SET mongodb_throw_on_unsupported_query = 0;

-- Find all 'Back to the Future' sequels with rating > 7.5
SELECT title, plot, genres, directors, released FROM sample_mflix_table
WHERE title IN ('Back to the Future', 'Back to the Future Part II', 'Back to the Future Part III')
    AND toFloat32(JSONExtractString(imdb, 'rating')) > 7.5
ORDER BY year
FORMAT Vertical;
```

```text
Row 1:
──────
title:     Back to the Future
plot:      A young man is accidentally sent 30 years into the past in a time-traveling DeLorean invented by his friend, Dr. Emmett Brown, and must make sure his high-school-age parents unite in order to save his own existence.
genres:    ['Adventure','Comedy','Sci-Fi']
directors: ['Robert Zemeckis']
released:  1985-07-03

Row 2:
──────
title:     Back to the Future Part II
plot:      After visiting 2015, Marty McFly must repeat his visit to 1955 to prevent disastrous changes to 1985... without interfering with his first trip.
genres:    ['Action','Adventure','Comedy']
directors: ['Robert Zemeckis']
released:  1989-11-22
```

```sql
-- Find top 3 movies based on Cormac McCarthy's books
SELECT title, toFloat32(JSONExtractString(imdb, 'rating')) AS rating
FROM sample_mflix_table
WHERE arrayExists(x -> x LIKE 'Cormac McCarthy%', writers)
ORDER BY rating DESC
LIMIT 3;
```

```text
   ┌─title──────────────────┬─rating─┐
1. │ No Country for Old Men │    8.1 │
2. │ The Sunset Limited     │    7.4 │
3. │ The Road               │    7.3 │
   └────────────────────────┴────────┘
```

## 문제 해결 {#troubleshooting}
DEBUG 레벨 로그에서 생성된 MongoDB 쿼리를 볼 수 있습니다.

구현 세부정보는 [mongocxx](https://github.com/mongodb/mongo-cxx-driver) 및 [mongoc](https://github.com/mongodb/mongo-c-driver) 문서에서 찾을 수 있습니다.
