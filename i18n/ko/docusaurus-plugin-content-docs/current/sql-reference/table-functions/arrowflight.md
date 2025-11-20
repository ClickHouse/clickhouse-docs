---
'description': 'Apache Arrow Flight 서버를 통해 노출된 데이터에 대해 쿼리를 수행할 수 있습니다.'
'sidebar_label': 'arrowFlight'
'sidebar_position': 186
'slug': '/sql-reference/table-functions/arrowflight'
'title': 'arrowFlight'
'doc_type': 'reference'
---


# arrowFlight 테이블 함수

[Apache Arrow Flight](../../interfaces/arrowflight.md) 서버를 통해 노출된 데이터에 대한 쿼리를 수행할 수 있습니다.

**구문**

```sql
arrowFlight('host:port', 'dataset_name' [, 'username', 'password'])
```

**인자**

* `host:port` — Arrow Flight 서버의 주소. [문자열](../../sql-reference/data-types/string.md).
* `dataset_name` — Arrow Flight 서버에서 사용 가능한 데이터셋 또는 설명자의 이름. [문자열](../../sql-reference/data-types/string.md).
* `username` - 기본 HTTP 스타일 인증에 사용할 사용자 이름.
* `password` - 기본 HTTP 스타일 인증에 사용할 비밀번호.
`username`과 `password`가 지정되지 않으면 인증이 사용되지 않음을 의미하며,
(그것은 Arrow Flight 서버가 이를 허용하는 경우에만 작동합니다).

**반환 값**

* 원격 데이터셋을 나타내는 테이블 객체. 스키마는 Arrow Flight 응답에서 유추됩니다.

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

**참고**

* [Arrow Flight](../../engines/table-engines/integrations/arrowflight.md) 테이블 엔진
* [Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
