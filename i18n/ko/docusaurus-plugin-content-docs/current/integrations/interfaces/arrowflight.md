---
description: 'ClickHouse에서 Apache Arrow Flight 인터페이스를 설명하는 문서로, Flight SQL 클라이언트가 ClickHouse에 연결할 수 있도록 합니다'
sidebar_label: 'Arrow Flight 인터페이스'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Arrow Flight 인터페이스'
doc_type: 'reference'
---



# Apache Arrow Flight 인터페이스 \{#apache-arrow-flight-interface\}

ClickHouse는 [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) 프로토콜을 지원합니다. Apache Arrow Flight는 gRPC 상에서 Arrow IPC 형식을 사용하여 효율적인 열 지향 데이터 전송을 위해 설계된 고성능 RPC 프레임워크입니다.

이 인터페이스를 사용하면 Flight SQL 클라이언트가 ClickHouse에 쿼리를 실행하고 결과를 Arrow 형식으로 수신할 수 있으므로, 분석 워크로드에서 높은 처리량과 낮은 지연 시간을 달성할 수 있습니다.



## 기능 \{#features\}

* Arrow Flight SQL 프로토콜을 통해 SQL 쿼리를 실행할 수 있습니다
* Apache Arrow 형식으로 쿼리 결과를 스트리밍할 수 있습니다
* Arrow Flight를 지원하는 BI 도구 및 맞춤형 데이터 애플리케이션과 통합할 수 있습니다
* gRPC를 통한 경량 고성능 통신을 제공합니다



## 제한 사항 \{#limitations\}

Arrow Flight 인터페이스는 현재 실험적 단계이며 활발히 개발 중입니다. 알려진 제한 사항은 다음과 같습니다.

* ClickHouse 고유의 복잡한 SQL 기능에 대한 지원이 제한적임
* 모든 Arrow Flight SQL 메타데이터 연산이 아직 구현되지 않음
* 레퍼런스 구현에는 기본 제공 인증이나 TLS 구성이 없음

호환성 문제를 겪거나 기여하고 싶은 경우 ClickHouse 저장소에 [이슈를 생성](https://github.com/ClickHouse/ClickHouse/issues)하십시오.



## Arrow Flight 서버 실행 \{#running-server\}

자가 관리형 ClickHouse 인스턴스에서 Arrow Flight 서버를 사용하려면 서버 설정에 다음 구성을 추가하십시오:

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

ClickHouse 서버를 재시작합니다. 성공적으로 시작되면 다음과 유사한 로그 메시지가 표시됩니다.

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```


## Arrow Flight SQL을 통해 ClickHouse에 연결하기 \{#connecting-to-clickhouse\}

Arrow Flight SQL을 지원하는 클라이언트라면 무엇이든 사용할 수 있습니다. 예를 들어 `pyarrow`를 사용하는 경우는 다음과 같습니다.

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```


## 호환성 \{#compatibility\}

Arrow Flight 인터페이스는 Arrow Flight SQL을 지원하는 도구와 이를 사용하여 개발한 커스텀 애플리케이션과 호환됩니다:

* Python (`pyarrow`)
* Java (`arrow-flight`)
* C++ 및 기타 gRPC 호환 언어

사용 중인 도구에 대해 네이티브 ClickHouse 커넥터(예: JDBC, ODBC)가 제공되는 경우, 성능 또는 형식 호환성 측면에서 Arrow Flight가 특별히 요구되지 않는 한 해당 커넥터 사용을 권장합니다.



## 쿼리 취소 \{#query-cancellation\}

장시간 실행되는 쿼리는 클라이언트에서 gRPC 연결을 종료하면 취소할 수 있습니다. 보다 고급화된 쿼리 취소 기능에 대한 지원도 예정되어 있습니다.

---

자세한 내용은 다음을 참조하십시오:

* [Apache Arrow Flight SQL 사양](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
