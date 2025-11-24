---
'description': 'ClickHouse에서 Apache Arrow Flight 인터페이스에 대한 Documentation으로, Flight
  SQL 클라이언트가 ClickHouse에 연결할 수 있도록 합니다.'
'sidebar_label': 'Arrow Flight Interface'
'sidebar_position': 26
'slug': '/interfaces/arrowflight'
'title': 'Arrow Flight Interface'
'doc_type': 'reference'
---


# Apache Arrow Flight Interface

ClickHouse는 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 프로토콜과의 통합을 지원합니다. 이는 Arrow IPC 형식을 이용한 고성능 RPC 프레임워크로, 효율적인 컬럼형 데이터 전송을 위해 설계되었습니다.

이 인터페이스는 Flight SQL 클라이언트가 ClickHouse에 쿼리하고 결과를 Arrow 형식으로 검색할 수 있게 해 주며, 분석 작업에 대해 높은 처리량과 낮은 지연 시간을 제공합니다.

## Features {#features}

* Arrow Flight SQL 프로토콜을 통해 SQL 쿼리 실행
* Apache Arrow 형식으로 쿼리 결과 스트리밍
* Arrow Flight를 지원하는 BI 도구 및 커스텀 데이터 애플리케이션과의 통합
* gRPC를 통한 경량 및 성능 효율적인 통신

## Limitations {#limitations}

Arrow Flight 인터페이스는 현재 실험적이고 활발히 개발 중입니다. 알려진 제한 사항은 다음과 같습니다:

* 복잡한 ClickHouse 전용 SQL 기능에 대한 제한된 지원
* 모든 Arrow Flight SQL 메타데이터 작업이 아직 구현되지 않음
* 참조 구현에 내장된 인증 또는 TLS 구성 없음

호환성 문제가 발생하거나 기여하고 싶으시면 ClickHouse 리포지토리에 [문제 생성](https://github.com/ClickHouse/ClickHouse/issues) 해 주시기 바랍니다.

## Running the Arrow Flight Server {#running-server}

자체 관리 ClickHouse 인스턴스에서 Arrow Flight 서버를 활성화하려면, 서버 구성에 다음 구성을 추가하십시오:

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

ClickHouse 서버를 재시작하십시오. 성공적으로 시작되면, 다음과 유사한 로그 메시지를 볼 수 있어야 합니다:

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```

## Connecting to ClickHouse via Arrow Flight SQL {#connecting-to-clickhouse}

Arrow Flight SQL을 지원하는 클라이언트를 사용할 수 있습니다. 예를 들어, `pyarrow`를 이용한 방법은 다음과 같습니다:

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```

## Compatibility {#compatibility}

Arrow Flight 인터페이스는 다음과 같은 도구와 호환됩니다:

* Python(`pyarrow`)
* Java(`arrow-flight`)
* C++ 및 기타 gRPC 호환 언어들

도구에 대한 네이티브 ClickHouse 커넥터(JDBC, ODBC 등)가 있는 경우, 성능 또는 형식 호환성을 위해 Arrow Flight가 특별히 필요하지 않은 한 해당 커넥터를 사용하는 것을 권장합니다.

## Query Cancellation {#query-cancellation}

오랜 쿼리는 클라이언트에서 gRPC 연결을 종료함으로써 취소할 수 있습니다. 더 고급 취소 기능에 대한 지원이 계획되고 있습니다.

---

자세한 내용은 다음을 참조하십시오:

* [Apache Arrow Flight SQL 사양](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
