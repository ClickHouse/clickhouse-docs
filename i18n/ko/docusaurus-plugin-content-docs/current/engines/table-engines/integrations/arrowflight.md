---
description: '이 엔진은 Apache Arrow Flight를 통해 원격 데이터셋을 쿼리할 수 있도록 지원합니다.'
sidebar_label: 'ArrowFlight'
sidebar_position: 186
slug: /engines/table-engines/integrations/arrowflight
title: 'ArrowFlight 테이블 엔진'
doc_type: 'reference'
---



# ArrowFlight 테이블 엔진 \{#arrowflight-table-engine\}

ArrowFlight 테이블 엔진을 사용하면 ClickHouse에서 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 프로토콜을 통해 원격 데이터 세트에 쿼리할 수 있습니다.
이 통합을 통해 ClickHouse는 Flight를 지원하는 외부 서버에서 열 지향 Arrow 형식으로 데이터를 높은 성능으로 가져올 수 있습니다.



## 테이블 생성 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name (name1 [type1], name2 [type2], ...)
    ENGINE = ArrowFlight('host:port', 'dataset_name' [, 'username', 'password']);
```

**엔진 매개변수**

* `host:port` — 원격 Arrow Flight 서버의 주소입니다.
* `dataset_name` — Flight 서버에서 데이터세트를 식별하는 이름입니다.
* `username` - 기본 HTTP 스타일 인증에 사용하는 사용자 이름입니다.
* `password` - 기본 HTTP 스타일 인증에 사용하는 비밀번호입니다.
  `username`과 `password`를 지정하지 않으면 인증을 사용하지 않는다는 의미입니다.
  (이는 Arrow Flight 서버가 이를 허용하는 경우에만 동작합니다.)


## 사용 예시 \{#usage-example\}

다음 예시는 원격 Arrow Flight 서버에서 데이터를 읽는 테이블을 생성하는 방법을 보여줍니다:

```sql
CREATE TABLE remote_flight_data
(
    id UInt32,
    name String,
    value Float64
) ENGINE = ArrowFlight('127.0.0.1:9005', 'sample_dataset');
```

원격 데이터를 로컬 테이블처럼 쿼리하십시오:

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


## 참고 사항 \{#notes\}

* ClickHouse에 정의된 스키마는 Flight 서버가 반환하는 스키마와 일치해야 합니다.
* 이 엔진은 연합 쿼리, 데이터 가상화, 스토리지와 컴퓨트 분리에 적합합니다.



## 같이 보기 \{#see-also\}

* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse의 Arrow 포맷 통합](/interfaces/formats/Arrow)
