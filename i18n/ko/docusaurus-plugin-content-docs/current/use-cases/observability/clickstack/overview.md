---
'slug': '/use-cases/observability/clickstack/overview'
'title': 'ClickStack - ClickHouse 관찰 가능성 스택'
'sidebar_label': '개요'
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/getting-started'
'description': 'ClickStack - ClickHouse 관찰 가능성 스택에 대한 개요'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'observability'
- 'logs'
- 'monitoring'
- 'platform'
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-simple-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';

<Image img={landing_image} alt="Landing page" size="lg"/>

**ClickStack**은 ClickHouse 기반의 프로덕션급 가시성 플랫폼으로, 로그, 추적, 메트릭 및 세션을 단일 고성능 솔루션에 통합합니다. 복잡한 시스템을 모니터링하고 디버깅하기 위해 설계된 ClickStack은 개발자와 SRE가 도구를 전환하거나 타임스탬프 또는 상관 ID를 사용하여 데이터를 수동으로 연결하지 않고도 문제를 엔드투엔드로 추적할 수 있게 합니다.

ClickStack의 핵심은 간단하지만 강력한 아이디어입니다: 모든 가시성 데이터는 폭넓고 풍부한 이벤트로 수집되어야 합니다. 이러한 이벤트는 데이터 유형인 로그, 추적, 메트릭 및 세션별로 ClickHouse 테이블에 저장되지만, 데이터베이스 수준에서 완전히 쿼리 가능하고 교차 상관 가능하게 유지됩니다.

ClickStack은 ClickHouse의 컬럼 지향 아키텍처, 네이티브 JSON 지원 및 완전 병렬 실행 엔진을 활용하여 높은 카디널리티 작업을 효율적으로 처리하도록 구축되었습니다. 이를 통해 방대한 데이터 세트에서의 서브 초 쿼리, 넓은 시간 범위에 대한 빠른 집계 및 개별 추적에 대한 깊이 있는 검사가 가능합니다. JSON은 압축된 컬럼형 형식으로 저장되어 수동 개입이나 사전 정의 없이 스키마 진화를 가능하게 합니다.

## Features {#features}

이 스택에는 디버깅 및 근본 원인 분석을 위해 설계된 여러 주요 기능이 포함되어 있습니다:

- 로그, 메트릭, 세션 재생 및 추적을 한 곳에서 상관관계 및 검색
- 스키마에 무관하며 기존 ClickHouse 스키마 위에서 작동
- ClickHouse에 최적화된 번개처럼 빠른 검색 및 시각화
- 직관적인 전면 텍스트 검색 및 속성 검색 구문 (예: `level:err`), SQL 선택 사항.
- 이벤트 델타로 이상 추세 분석
- 몇 번의 클릭으로 알림 설정
- 복잡한 쿼리 언어 없이 고 카디널리티 이벤트 대시보드
- 네이티브 JSON 문자열 쿼리
- 항상 최신 이벤트를 가져오는 라이브 테일 로그 및 추적
- 바로 사용할 수 있는 OpenTelemetry (OTel) 지원
- HTTP 요청에서 DB 쿼리까지 건강 및 성능 모니터링 (APM)
- 이상 및 성능 회귀 식별을 위한 이벤트 델타
- 로그 패턴 인식

## Components {#components}

ClickStack은 세 가지 핵심 구성 요소로 구성됩니다:

1. **HyperDX UI** – 가시성 데이터를 탐색하고 시각화하기 위해 목적에 맞게 설계된 프론트엔드
2. **OpenTelemetry collector** – 로그, 추적 및 메트릭을 위한 의견이 있는 스키마로 미리 구성된 맞춤형 수집기
3. **ClickHouse** – 스택의 핵심에 있는 고성능 분석 데이터베이스

이 구성 요소들은 독립적으로 또는 함께 배포할 수 있습니다. HyperDX UI의 브라우저 호스트 버전도 제공되어 사용자가 추가 인프라 없이 기존 ClickHouse 배포에 연결할 수 있습니다.

시작하려면 [시작 가이드](/use-cases/observability/clickstack/getting-started)를 방문한 후 [샘플 데이터 세트](/use-cases/observability/clickstack/sample-datasets)를 로드하세요. [배포 옵션](/use-cases/observability/clickstack/deployment) 및 [운영 모범 사례](/use-cases/observability/clickstack/production)에 대한 문서도 탐색할 수 있습니다.

## Principles {#clickstack-principles}

ClickStack은 사용 편의성, 성능 및 유연성을 모든 가시성 스택 계층에서 우선시하는 핵심 원칙 세트로 설계되었습니다:

### Easy to set up in minutes {#clickstack-easy-to-setup}

ClickStack은 최소한의 구성으로 모든 ClickHouse 인스턴스 및 스키마와 함께 즉시 작동합니다. 새로 시작하든 기존 설정과 통합하든 몇 분 안에 가동할 수 있습니다.

### User-friendly and purpose-built {#user-friendly-purpose-built}

HyperDX UI는 SQL 및 Lucene 스타일 구문을 모두 지원하여 사용자가 작업 흐름에 맞는 쿼리 인터페이스를 선택할 수 있도록 합니다. 가시성을 위해 목적에 맞게 설계된 UI는 팀이 문제의 근본 원인을 신속하게 식별하고 복잡한 데이터 내비게이션을 원활하게 할 수 있도록 최적화되어 있습니다.

### End-to-end observability {#end-to-end-observability}

ClickStack은 프론트 엔드 사용자 세션에서 백엔드 인프라 메트릭, 애플리케이션 로그 및 분산 추적에 이르기까지 전체 스택 가시성을 제공합니다. 이 통합된 뷰는 전체 시스템에서 깊은 상관관계 및 분석을 가능하게 합니다.

### Built for ClickHouse {#built-for-clickhouse}

스택의 모든 계층은 ClickHouse의 기능을 최대한 활용하도록 설계되었습니다. 쿼리는 ClickHouse의 분석 함수 및 컬럼형 엔진을 활용하도록 최적화되어 방대한 데이터의 빠른 검색 및 집계를 보장합니다.

### OpenTelemetry-native {#open-telemetry-native}

ClickStack은 OpenTelemetry와 네이티브로 통합되어 있으며, 모든 데이터를 OpenTelemetry 수집기 엔드포인트를 통해 수집합니다. 고급 사용자에게는 네이티브 파일 형식, 커스텀 파이프라인 또는 Vector와 같은 서드파티 도구를 사용하여 ClickHouse로의 직접 수집도 지원합니다.

### Open source and fully customizable {#open-source-and-customizable}

ClickStack은 완전히 오픈 소스이며 어디서나 배포할 수 있습니다. 스키마는 유연하고 사용자가 수정할 수 있으며, UI는 변경 없이 사용자 정의 스키마에 맞게 구성 가능하도록 설계되었습니다. 모든 구성 요소—수집기, ClickHouse 및 UI—는 수집, 쿼리 또는 저장 요구 사항을 충족하기 위해 독립적으로 확장할 수 있습니다.

## Architectural overview {#architectural-overview}

<Image img={architecture} alt="Simple architecture" size="lg"/>

ClickStack은 세 가지 핵심 구성 요소로 구성됩니다:

1. **HyperDX UI**  
   가시성을 위해 구축된 사용자 친화적인 인터페이스. Lucene 스타일 및 SQL 쿼리를 모두 지원하며, 인터랙티브 대시보드, 알림, 추적 탐색 등을 제공하며—모두 ClickHouse를 백엔드로 최적화하였습니다.

2. **OpenTelemetry collector**  
   ClickHouse 수집을 위해 최적화된 의견이 있는 스키마로 구성된 맞춤형 수집기. OpenTelemetry 프로토콜을 통해 로그, 메트릭 및 추적을 수집하고 효율적인 배치 삽입을 통해 ClickHouse에 직접 기록합니다.

3. **ClickHouse**  
   폭넓은 이벤트에 대한 중앙 데이터 저장소 역할을 하는 고성능 분석 데이터베이스. ClickHouse는 빠른 검색, 필터링 및 대규모 집계를 지원하며, 그 컬럼형 엔진과 JSON에 대한 네이티브 지원을 활용합니다.

이 세 가지 구성 요소 외에도 ClickStack은 대시보드, 사용자 계정 및 구성 설정과 같은 애플리케이션 상태를 저장하기 위해 **MongoDB 인스턴스**를 사용합니다.

전체 아키텍처 다이어그램 및 배포 세부 정보는 [아키텍처 섹션](/use-cases/observability/clickstack/architecture)에서 확인할 수 있습니다.

ClickStack을 프로덕션에 배포하려는 사용자는 ["Production"](/use-cases/observability/clickstack/production) 가이드를 읽는 것을 권장합니다.
