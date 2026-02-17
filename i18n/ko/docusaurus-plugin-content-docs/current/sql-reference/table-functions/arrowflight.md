---
description: 'Apache Arrow Flight 서버에서 제공되는 데이터에 대해 쿼리를 수행할 수 있습니다.'
sidebar_label: 'arrowFlight'
sidebar_position: 186
slug: /sql-reference/table-functions/arrowflight
title: 'arrowFlight'
doc_type: 'reference'
---

# arrowFlight 테이블 함수 \{#arrowflight-table-function\}

[Apache Arrow Flight](/interfaces/arrowflight) 서버를 통해 노출된 데이터에 대해 쿼리를 실행할 수 있습니다.

**구문**

```sql
arrowFlight('host:port', 'dataset_name' [, 'username', 'password'])
```

**인수**

* `host:port` — Arrow Flight 서버의 주소입니다. [String](../../sql-reference/data-types/string.md).
* `dataset_name` — Arrow Flight 서버에서 사용 가능한 데이터세트 또는 디스크립터의 이름입니다. [String](../../sql-reference/data-types/string.md).
* `username` - 기본 HTTP 스타일 인증에 사용할 사용자 이름입니다.
* `password` - 기본 HTTP 스타일 인증에 사용할 비밀번호입니다.
  `username` 및 `password`가 지정되지 않은 경우 인증을 사용하지 않음을 의미합니다
  (이는 Arrow Flight 서버가 이를 허용하는 경우에만 작동합니다).

**반환 값**

* 원격 데이터세트를 나타내는 테이블 객체입니다. 스키마는 Arrow Flight 응답에서 추론됩니다.

**예시**

쿼리:

```sql
SELECT * FROM arrowFlight('127.0.0.1:9005', 'sample_dataset') ORDER BY id;
```

결과:

```text
┌─id─┬─name────┬─value─┐
│  1 │ foo     │ 42.1  │
│  2 │ bar     │ 13.3  │
│  3 │ baz     │ 77.0  │
└────┴─────────┴───────┘
```

**함께 보기**

* [Arrow Flight](../../engines/table-engines/integrations/arrowflight.md) 테이블 엔진
* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
