---
'slug': '/use-cases/observability'
'title': '가시성'
'pagination_prev': null
'pagination_next': null
'description': '가시성 사용 사례 가이드를 위한 랜딩 페이지'
'keywords':
- 'observability'
- 'logs'
- 'traces'
- 'metrics'
- 'OpenTelemetry'
- 'Grafana'
- 'OTel'
'doc_type': 'guide'
---

ClickHouse는 관찰 가능성을 위해 타의 추종을 불허하는 속도, 규모 및 비용 효율성을 제공합니다. 이 가이드는 니즈에 따라 두 가지 경로를 제공합니다:

## ClickStack - ClickHouse 관찰 가능성 스택 {#clickstack}

ClickHouse 관찰 가능성 스택은 대부분의 사용자에게 **권장되는 접근 방식**입니다.

**ClickStack**은 ClickHouse와 OpenTelemetry (OTel)를 기반으로 구축된 프로덕션 등급의 관찰 가능성 플랫폼으로, 로그, 추적, 메트릭 및 세션을 단일 고성능 스케일 가능한 솔루션으로 통합하여 단일 노드 배포에서 **다중 페타바이트** 규모까지 작동합니다.

| 섹션 | 설명 |
|---------|-------------|
| [개요](/use-cases/observability/clickstack/overview) | ClickStack 및 주요 기능 소개 |
| [시작하기](/use-cases/observability/clickstack/getting-started) | 빠른 시작 가이드 및 기본 설정 지침 |
| [예제 데이터세트](/use-cases/observability/clickstack/sample-datasets) | 샘플 데이터세트 및 사용 사례 |
| [아키텍처](/use-cases/observability/clickstack/architecture) | 시스템 아키텍처 및 구성 요소 개요 |
| [배포](/use-cases/observability/clickstack/deployment) | 배포 가이드 및 옵션 |
| [구성](/use-cases/observability/clickstack/config) | 상세 구성 옵션 및 설정 |
| [데이터 수집](/use-cases/observability/clickstack/ingesting-data) | ClickStack에 데이터를 수집하기 위한 가이드라인 |
| [검색](/use-cases/observability/clickstack/search) | 관찰 가능성 데이터를 검색하고 쿼리하는 방법 |
| [프로덕션](/use-cases/observability/clickstack/production) | 프로덕션 배포를 위한 모범 사례 |

## 맞춤형 스택 구축 {#build-your-own-stack}

**맞춤형 요구 사항**이 있는 사용자—예를 들어, 매우 특수한 수집 파이프라인, 스키마 설계 또는 극도의 스케일링 요구 사항—를 위한 안내를 제공하여 ClickHouse를 핵심 데이터베이스로 사용하여 맞춤형 관찰 가능성 스택을 구축할 수 있도록 합니다.

| 페이지                                                        | 설명                                                                                                                                                                   |
|-------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [소개](/use-cases/observability/introduction)            | 이 가이드는 ClickHouse를 사용하여 로그 및 추적에 초점을 맞춘 자체 관찰 가능성 솔루션을 구축하려는 사용자를 위해 설계되었습니다.                                             |
| [스키마 설계](/use-cases/observability/schema-design)          | 사용자에게 로그 및 추적을 위한 자체 스키마를 생성하는 것이 권장되는 이유와 이를 수행하기 위한 몇 가지 모범 사례를 알아보세요.                                                  |
| [데이터 관리](/observability/managing-data)          | 관찰 가능성을 위한 ClickHouse의 배포는 불가피하게 대량의 데이터 세트를 포함하게 되며, 이러한 데이터 세트를 관리해야 합니다. ClickHouse는 데이터 관리를 지원하는 기능을 제공합니다.           |
| [OpenTelemetry 통합](/observability/integrating-opentelemetry) | ClickHouse와 함께 OpenTelemetry를 사용하여 로그 및 추적을 수집하고 내보내기.                                                           |
| [시각화 도구 사용하기](/observability/grafana)    | ClickHouse에 대한 관찰 가능성 시각화 도구인 HyperDX와 Grafana를 사용하는 방법을 알아보세요.                                       |
| [데모 애플리케이션](/observability/demo-application)    | 로그 및 추적을 위해 ClickHouse와 함께 작동하도록 포크된 OpenTelemetry 데모 애플리케이션을 탐색합니다.                                           |
