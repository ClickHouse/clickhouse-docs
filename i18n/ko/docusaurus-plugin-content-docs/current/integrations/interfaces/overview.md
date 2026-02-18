---
description: 'ClickHouse에 연결하기 위한 네트워크 인터페이스, 드라이버 및 도구에 대한 개요'
keywords: ['clickhouse', 'network', 'interfaces', 'http', 'tcp', 'grpc', 'command-line',
  'client', 'jdbc', 'odbc', 'driver']
sidebar_label: '개요'
slug: /interfaces/overview
title: '드라이버 및 인터페이스'
doc_type: 'reference'
---

# 드라이버와 인터페이스 \{#drivers-and-interfaces\}

ClickHouse는 두 가지 네트워크 인터페이스를 제공합니다(추가 보안을 위해 선택적으로 TLS로 암호화할 수 있습니다):

* [HTTP](http.md): 문서화가 잘 되어 있고 직접 사용하기 쉽습니다.
* [네이티브 TCP](../interfaces/tcp.md): 오버헤드가 더 적습니다.

대부분의 경우 이러한 인터페이스와 직접 상호 작용하기보다는 적절한 도구나 라이브러리를 사용하는 것이 좋습니다. ClickHouse에서 공식적으로 지원하는 항목은 다음과 같습니다:

* [Command-line client](/interfaces/cli)
* [JDBC driver](/interfaces/jdbc)
* [ODBC driver](/interfaces/odbc)
* [C++ client library](/interfaces/cpp)

ClickHouse는 또한 두 가지 RPC 프로토콜을 지원합니다:

* ClickHouse를 위해 특별히 설계된 [gRPC protocol](grpc.md)
* [Apache Arrow Flight](arrowflight.md)

ClickHouse 서버는 숙련된 사용자를 위한 내장 시각화 인터페이스를 제공합니다:

* Play UI: 브라우저에서 `/play`를 엽니다.
* Advanced Dashboard: 브라우저에서 `/dashboard`를 엽니다.
* ClickHouse 엔지니어를 위한 바이너리 심볼 뷰어: 브라우저에서 `/binary`를 엽니다.

또한 ClickHouse와 함께 사용할 수 있는 다양한 서드파티 라이브러리도 있습니다:

* [Client libraries](../../interfaces/third-party/client-libraries.md)
* [Integrations](../../interfaces/third-party/integrations.md)
* [Visual interfaces](../../interfaces/third-party/gui.md)