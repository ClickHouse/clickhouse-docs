---
'description': 'ClickHouse에 연결하기 위한 네트워크 인터페이스, 드라이버 및 도구에 대한 개요'
'keywords':
- 'clickhouse'
- 'network'
- 'interfaces'
- 'http'
- 'tcp'
- 'grpc'
- 'command-line'
- 'client'
- 'jdbc'
- 'odbc'
- 'driver'
'sidebar_label': '개요'
'slug': '/interfaces/overview'
'title': '드라이버 및 인터페이스'
'doc_type': 'reference'
---


# 드라이버 및 인터페이스

ClickHouse는 두 가지 네트워크 인터페이스를 제공합니다 (추가 보안을 위해 선택적으로 TLS로 감쌀 수 있습니다):

- [HTTP](http.md), 문서화되어 있으며 직접 사용하기 쉽습니다.
- [Native TCP](../interfaces/tcp.md), 오버헤드가 적습니다.

대부분의 경우, 이러한 인터페이스와 직접 상호작용하기보다는 적절한 도구 또는 라이브러리를 사용하는 것이 권장됩니다. ClickHouse에서 공식적으로 지원하는 도구는 다음과 같습니다:

- [명령줄 클라이언트](../interfaces/cli.md)
- [JDBC 드라이버](../interfaces/jdbc.md)
- [ODBC 드라이버](../interfaces/odbc.md)
- [C++ 클라이언트 라이브러리](../interfaces/cpp.md)

ClickHouse는 또한 두 가지 RPC 프로토콜을 지원합니다:
- [gRPC 프로토콜](grpc.md), ClickHouse를 위해 특별히 설계되었습니다.
- [Apache Arrow Flight](arrowflight.md).

ClickHouse 서버는 파워 유저를 위한 내장 시각적 인터페이스를 제공합니다:

- 플레이 UI: 브라우저에서 `/play` 열기;
- 고급 대시보드: 브라우저에서 `/dashboard` 열기;
- ClickHouse 엔지니어를 위한 바이너리 심볼 뷰어: 브라우저에서 `/binary` 열기;

ClickHouse와 작업하기 위한 다양한 서드파티 라이브러리도 있습니다:

- [클라이언트 라이브러리](../interfaces/third-party/client-libraries.md)
- [통합](../interfaces/third-party/integrations.md)
- [시각적 인터페이스](../interfaces/third-party/gui.md)
