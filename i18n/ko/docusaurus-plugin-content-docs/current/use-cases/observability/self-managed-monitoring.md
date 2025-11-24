---
'slug': '/use-cases/observability/oss-monitoring'
'title': '자체 관리 모니터링'
'sidebar_label': '자체 관리 모니터링'
'description': '자체 관리 모니터링 가이드'
'doc_type': 'guide'
'keywords':
- 'observability'
- 'monitoring'
- 'self-managed'
- 'metrics'
- 'system health'
---

import ObservabilityIntegrations from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';


# 자체 관리 모니터링 {#cloud-monitoring}

이 가이드는 ClickHouse 오픈 소스를 평가하는 기업 팀을 위해 프로덕션 배포를 위한 모니터링 및 관찰 가능성 기능에 대한 포괄적인 정보를 제공합니다. 기업 고객은 종종 즉시 사용 가능한 모니터링 기능, Datadog 및 AWS CloudWatch와 같은 기존 관찰 가능성 스택과의 통합, 그리고 ClickHouse의 모니터링이 자체 호스팅 배포와 어떻게 비교되는지에 대해 질문합니다.

### Prometheus 기반 통합 아키텍처 {#prometheus}
ClickHouse는 배포 모델에 따라 서로 다른 엔드포인트를 통해 Prometheus 호환 메트릭을 노출하며, 각 엔드포인트는 고유한 운영 특성을 가집니다:

**자체 관리/OSS ClickHouse**

ClickHouse 서버의 표준 /metrics 엔드포인트를 통해 액세스할 수 있는 직접 서버 Prometheus 엔드포인트입니다. 이 접근 방식은 다음을 제공합니다:
- 완전한 메트릭 노출: 기본 필터링 없이 사용 가능한 ClickHouse 메트릭의 전체 범위
- 실시간 메트릭: 스크랩될 때 시스템 테이블에서 직접 생성됨

**직접 시스템 액세스** 

프로덕션 시스템 테이블을 쿼리하여 모니터링 부하를 추가하며 비용 절감 대기 상태를 방지합니다.

<ObservabilityIntegrations/>

### ClickStack 배포 옵션 {#clickstack-deployment}

- [Helm](/use-cases/observability/clickstack/deployment/helm): Kubernetes 기반 디버깅 환경에 권장됩니다. 환경별 구성, 리소스 한도 및 `values.yaml`을 통한 스케일링을 가능하게 합니다.
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): 각 구성 요소(ClickHouse, HyperDX, OTel 수집기, MongoDB)를 개별적으로 배포합니다.
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only): 독립형 HyperDX 컨테이너입니다.

완전한 배포 옵션 및 아키텍처 세부정보는 [ClickStack 문서](/use-cases/observability/clickstack/overview) 및 [데이터 수집 가이드](/use-cases/observability/clickstack/ingesting-data/overview)를 참조하십시오.

<DirectIntegrations/>

<CommunityMonitoring/>
