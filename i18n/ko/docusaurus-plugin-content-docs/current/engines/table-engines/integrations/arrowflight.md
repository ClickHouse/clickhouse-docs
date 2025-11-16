---
'description': '이 엔진은 Apache Arrow Flight를 통해 원격 데이터 세트를 쿼리할 수 있게 해줍니다.'
'sidebar_label': 'ArrowFlight'
'sidebar_position': 186
'slug': '/engines/table-engines/integrations/arrowflight'
'title': 'ArrowFlight 테이블 엔진'
'doc_type': 'reference'
---


# ArrowFlight 테이블 엔진

ArrowFlight 테이블 엔진은 ClickHouse가 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 프로토콜을 통해 원격 데이터 세트를 쿼리할 수 있게 해줍니다. 이 통합을 통해 ClickHouse는 외부 Flight 지원 서버에서 높은 성능으로 컬럼형 Arrow 형식으로 데이터를 가져올 수 있습니다.

## 테이블 생성 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**엔진 매개변수**

* `host:port` — 원격 Arrow Flight 서버의 주소.
* `dataset_name` — Flight 서버의 데이터 세트 식별자.
* `username` - 기본 HTTP 스타일 인증에 사용할 사용자 이름.
* `password` - 기본 HTTP 스타일 인증에 사용할 비밀번호.  
`username`과 `password`가 지정되지 않으면 인증이 사용되지 않음을 의미합니다  
(이는 Arrow Flight 서버가 이를 허용하는 경우에만 작동합니다).

## 사용 예제 {#usage-example}

이 예제는 원격 Arrow Flight 서버에서 데이터를 읽는 테이블을 생성하는 방법을 보여줍니다:

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

로컬 테이블인 것처럼 원격 데이터를 쿼리합니다:

```sql
SELECT * FROM remote_flight_data ORDER BY id;
```

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```

## 주의 사항 {#notes}

* ClickHouse에서 정의된 스키마는 Flight 서버에서 반환된 스키마와 일치해야 합니다.
* 이 엔진은 연합 쿼리, 데이터 가상화 및 저장소와 컴퓨트를 분리하는 데 적합합니다.

## 추가 정보 {#see-also}

* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse에서 Arrow 형식 통합](/interfaces/formats/Arrow)
