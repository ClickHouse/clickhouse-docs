---
'slug': '/use-cases/observability/clickstack/architecture'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack의 아키텍처 - ClickHouse 가시성 스택'
'title': '아키텍처'
'doc_type': 'reference'
'keywords':
- 'ClickStack architecture'
- 'observability architecture'
- 'HyperDX'
- 'OpenTelemetry collector'
- 'MongoDB'
- 'system design'
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

The ClickStack architecture is built around three core components: **ClickHouse**, **HyperDX**, and a **OpenTelemetry (OTel) collector**. A **MongoDB** instance provides storage for the application state. Together, they provide a high-performance, open-source observability stack optimized for logs, metrics, and traces.

## Architecture overview {#architecture-overview}

<Image img={architecture} alt="Architecture" size="lg"/>

## ClickHouse: the database engine {#clickhouse}

At the heart of ClickStack is ClickHouse, a column-oriented database designed for real-time analytics at scale. It powers the ingestion and querying of observability data, enabling:

- Sub-second search across terabytes of events
- Ingestion of billions of high-cardinality records per day
- High compression rates of at least 10x on observability data
- Native support for semi-structured JSON data, allowing dynamic schema evolution
- A powerful SQL engine with hundreds of built-in analytical functions

ClickHouse handles observability data as wide events, allowing for deep correlation across logs, metrics, and traces in a single unified structure.

## OpenTelemetry collector: data ingestion {#open-telemetry-collector}

ClickStack includes a pre-configured OpenTelemetry (OTel) collector to ingest telemetry in an open, standardized way. Users can send data using the OTLP protocol via:

- gRPC (port `4317`)
- HTTP (port `4318`)

The collector exports telemetry to ClickHouse in efficient batches. It supports optimized table schemas per data source, ensuring scalable performance across all signal types.

## HyperDX: the interface {#hyperdx}

HyperDX is the user interface for ClickStack. It offers:

- Natural language and Lucene-style search
- Live tailing for real-time debugging
- Unified views of logs, metrics, and traces
- Session replay for frontend observability
- Dashboard creation and alert configuration
- SQL query interface for advanced analysis

Designed specifically for ClickHouse, HyperDX combines powerful search with intuitive workflows, enabling users to spot anomalies, investigate issues, and gain insights fast.

## MongoDB: application state {#mongo}

ClickStack uses MongoDB to store application-level state, including:

- Dashboards
- Alerts
- User profiles
- Saved visualizations

This separation of state from event data ensures performance and scalability while simplifying backup and configuration.

This modular architecture enables ClickStack to deliver an out-of-the-box observability platform that is fast, flexible, and open-source.

---

Here’s the translated text:

The ClickStack architecture is built around three core components: **ClickHouse**, **HyperDX**, and a **OpenTelemetry (OTel) collector**. A **MongoDB** instance provides storage for the application state. Together, they provide a high-performance, open-source observability stack optimized for logs, metrics, and traces.

## Architecture overview {#architecture-overview}

<Image img={architecture} alt="Architecture" size="lg"/>

## ClickHouse: the database engine {#clickhouse}

At the heart of ClickStack is ClickHouse, a column-oriented database designed for real-time analytics at scale. It powers the ingestion and querying of observability data, enabling:

- 서브 초 검색으로 테라바이트의 이벤트
- 매일 수십억 개의 고카디널리티 레코드 수집
- 관찰 가능 데이터에 대한 최소 10배의 높은 압축 비율
- 동적 스키마 진화를 허용하는 반구조적 JSON 데이터에 대한 네이티브 지원
- 수백 개의 내장 분석 기능을 갖춘 강력한 SQL 엔진

ClickHouse는 관찰 가능 데이터를 넓은 이벤트로 처리하여 로그, 메트릭 및 추적에 걸쳐 깊이 있는 상관 관계를 단일 통합 구조에서 허용합니다.

## OpenTelemetry collector: data ingestion {#open-telemetry-collector}

ClickStack은 telemetry를 개방적이고 표준화된 방식으로 수집하기 위해 미리 구성된 OpenTelemetry (OTel) collector를 포함합니다. 사용자는 다음을 통해 OTLP 프로토콜을 사용하여 데이터를 보낼 수 있습니다:

- gRPC (포트 `4317`)
- HTTP (포트 `4318`)

수집기는 효율적인 배치로 ClickHouse에 telemetry를 내보냅니다. 데이터 소스별로 최적화된 테이블 스키마를 지원하여 모든 신호 유형에서 확장 가능한 성능을 보장합니다.

## HyperDX: the interface {#hyperdx}

HyperDX는 ClickStack의 사용자 인터페이스입니다. 이는 다음을 제공합니다:

- 자연어 및 Lucene 스타일 검색
- 실시간 디버깅을 위한 라이브 테일링
- 로그, 메트릭 및 추적에 대한 통합 뷰
- 프론트엔드 관찰 가능성을 위한 세션 재생
- 대시보드 생성 및 경고 구성
- 고급 분석을 위한 SQL 쿼리 인터페이스

특히 ClickHouse를 위해 설계된 HyperDX는 강력한 검색과 직관적인 워크플로우를 결합하여 사용자가 이상 징후를 찾고, 문제를 조사하며, 빠르게 통찰력을 얻을 수 있도록 합니다.

## MongoDB: application state {#mongo}

ClickStack은 MongoDB를 사용하여 애플리케이션 수준의 상태를 저장합니다. 포함 사항:

- 대시보드
- 경고
- 사용자 프로필
- 저장된 시각화

이 상태와 이벤트 데이터의 분리는 성능과 확장성을 보장하면서 백업 및 구성을 단순화합니다.

이 모듈식 아키텍처는 ClickStack이 빠르고 유연하며 오픈 소스인 즉시 사용 가능한 관찰 가능성 플랫폼을 제공할 수 있도록 합니다.
