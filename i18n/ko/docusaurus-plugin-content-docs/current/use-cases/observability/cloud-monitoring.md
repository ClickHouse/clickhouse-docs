---
'slug': '/use-cases/observability/cloud-monitoring'
'title': 'ClickHouse Cloud 모니터링'
'sidebar_label': 'ClickHouse Cloud 모니터링'
'description': 'ClickHouse Cloud 모니터링 가이드'
'doc_type': 'guide'
'keywords':
- 'observability'
- 'monitoring'
- 'cloud'
- 'metrics'
- 'system health'
---

import AdvancedDashboard from '@site/static/images/cloud/manage/monitoring/advanced_dashboard.png';
import NativeAdvancedDashboard from '@site/static/images/cloud/manage/monitoring/native_advanced_dashboard.png';
import Image from '@theme/IdealImage';
import ObservabilityIntegrations from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';


# ClickHouse Cloud 모니터링 {#cloud-monitoring}

이 가이드는 ClickHouse Cloud를 평가하는 엔터프라이즈 팀에 프로덕션 배포를 위한 모니터링 및 관측 가능성 기능에 대한 포괄적인 정보를 제공합니다. 엔터프라이즈 고객들은 자주 기본 제공 모니터링 기능, Datadog 및 AWS CloudWatch와 같은 기존 관측 가능성 스택과의 통합, 그리고 ClickHouse의 모니터링이 자체 호스팅 배포와 어떻게 비교되는지에 대해 질문합니다.

## 고급 관측 가능성 대시보드 {#advanced-observability}

ClickHouse Cloud는 모니터링 섹션을 통해 접근할 수 있는 내장 대시보드 인터페이스를 통해 포괄적인 모니터링을 제공합니다. 이러한 대시보드는 추가 설정 없이 실시간으로 시스템 및 성능 메트릭을 시각화하며, ClickHouse Cloud 내에서 실시간 프로덕션 모니터링을 위한 주요 도구 역할을 합니다.

- **고급 대시보드**: 모니터링 → 고급 대시보드를 통해 접근할 수 있는 주 대시보드 인터페이스는 쿼리 비율, 리소스 사용량, 시스템 상태 및 저장소 성능에 대한 실시간 가시성을 제공합니다. 이 대시보드는 별도의 인증을 요구하지 않으며 인스턴스가 유휴 상태로 있는 것을 방지하지 않으며, 프로덕션 시스템에 쿼리 부하를 추가하지 않습니다. 각 시각화는 사용자 정의 가능한 SQL 쿼리에 의해 구동되며, 기본 제공 차트는 ClickHouse 특정, 시스템 건강, Cloud 특정 메트릭으로 그룹화됩니다. 사용자는 SQL 콘솔에서 직접 사용자 정의 쿼리를 생성하여 모니터링을 확장할 수 있습니다.

:::note
이러한 메트릭에 접근하는 것은 기본 서비스에 쿼리를 발행하지 않으며 유휴 서비스를 깨우지 않습니다. 
:::

<Image img={AdvancedDashboard} size="lg" alt="고급 대시보드"/>

이러한 시각화를 확장하려는 사용자는 ClickHouse Cloud의 대시보드 기능을 사용하여 시스템 테이블에 직접 쿼리할 수 있습니다.

- **네이티브 고급 대시보드**: 모니터링 섹션 내의 "여전히 네이티브 고급 대시보드에 접근할 수 있습니다"를 통해 접근할 수 있는 대안 대시보드 인터페이스입니다. 이는 별도의 탭에서 인증과 함께 열리며 시스템 및 서비스 건강 모니터링을 위한 대안 UI를 제공합니다. 이 대시보드는 고급 분석을 허용하여 사용자가 기본 SQL 쿼리를 수정할 수 있습니다.

<Image img={NativeAdvancedDashboard} size="lg" alt="고급 대시보드"/>

두 대시보드는 외부 종속성 없이 서비스 건강 및 성능에 대한 즉각적인 가시성을 제공하여 ClickStack과 같은 외부 디버깅 중심 도구와 구별됩니다.

자세한 대시보드 기능 및 사용 가능한 메트릭에 대한 내용은 [고급 대시보드 문서](/cloud/manage/monitor/advanced-dashboard)를 참조하십시오.

## 쿼리 통찰력 및 리소스 모니터링 {#query-insights}

ClickHouse Cloud는 추가 모니터링 기능을 포함합니다:

- 쿼리 통찰력: 쿼리 성능 분석 및 문제 해결을 위한 내장 인터페이스
- 리소스 활용 대시보드: 메모리, CPU 할당 및 데이터 전송 패턴을 추적합니다. CPU 사용량 및 메모리 사용량 그래프는 특정 시간 동안의 최대 활용 메트릭을 보여줍니다. CPU 사용량 그래프는 시스템 수준의 CPU 활용 메트릭을 보여줍니다(ClickHouse CPU 활용 메트릭 아님).

자세한 기능은 [쿼리 통찰력](/cloud/get-started/query-insights) 및 [리소스 활용](/operations/monitoring#resource-utilization) 문서를 참조하십시오.

## Prometheus 호환 메트릭 엔드포인트 {#prometheus}

ClickHouse Cloud는 Prometheus 엔드포인트를 제공합니다. 이를 통해 사용자는 현재 워크플로를 유지하고 기존 팀 전문 지식을 활용하며 ClickHouse 메트릭을 Grafana, Datadog 및 기타 Prometheus 호환 도구를 포함한 엔터프라이즈 모니터링 플랫폼에 통합할 수 있습니다.

조직 수준의 엔드포인트는 모든 서비스의 메트릭을 집계하고, 서비스별 엔드포인트는 세분화된 모니터링을 제공합니다. 주요 기능은 다음과 같습니다:
- 필터링된 메트릭 옵션: 선택적 filtered_metrics=true 매개변수를 사용하면 1000개 이상의 사용 가능한 메트릭에서 125개의 '미션 크리티컬' 메트릭으로 페이로드를 줄여 비용 최적화 및 보다 쉽게 모니터링할 수 있게 합니다.
- 캐시된 메트릭 전달: 매 분마다 새로 고침되는 물리화된 뷰를 사용하여 프로덕션 시스템의 쿼리 부하를 최소화합니다.

:::note
이 접근 방식은 서비스 유휴 동작을 존중하여 서비스가 적극적으로 쿼리를 처리하지 않을 때 비용 최적화를 가능하게 합니다. 이 API 엔드포인트는 ClickHouse Cloud API 자격 증명에 의존합니다. 전체 엔드포인트 구성 세부 정보는 [Prometheus 문서](/integrations/prometheus)를 참조하십시오.
:::

<ObservabilityIntegrations/>

### ClickStack 배포 옵션 {#clickstack-deployment}

- **Clickhouse Cloud의 HyperDX** (비공식 미리 보기): HyperDX는 Clickhouse Cloud 서비스에서 시작할 수 있습니다.
- [Helm](/use-cases/observability/clickstack/deployment/helm): Kubernetes 기반 디버깅 환경에 추천됩니다. ClickHouse Cloud와의 통합을 지원하며, 환경별 구성, 리소스 한계 및 스케일링을 `values.yaml`를 통해 허용합니다.
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): 각 구성 요소(ClickHouse, HyperDX, OTel 수집기, MongoDB)를 개별적으로 배포합니다. 사용자는 ClickHouse Cloud와 통합할 때 사용하지 않는 구성 요소를 제거하도록 compose 파일을 수정할 수 있습니다. 특히 ClickHouse 및 Open Telemetry Collector를 포함합니다.
- [HyperDX 전용](/use-cases/observability/clickstack/deployment/hyperdx-only): 독립형 HyperDX 컨테이너입니다.

전체 배포 옵션 및 아키텍처 세부 정보는 [ClickStack 문서](/use-cases/observability/clickstack/overview) 및 [데이터 수집 가이드](/use-cases/observability/clickstack/ingesting-data/overview)를 참조하십시오.

:::note
사용자는 OpenTelemetry Collector를 통해 ClickHouse Cloud Prometheus 엔드포인트에서 메트릭을 수집하고 이를 시각화를 위한 별도의 ClickStack 배포로 전달할 수 있습니다.
:::

<DirectIntegrations/>

<CommunityMonitoring/>

## 시스템 영향 고려 사항 {#system-impact}

위의 모든 접근 방식은 Prometheus 엔드포인트에 의존하거나 ClickHouse Cloud에 의해 관리되거나 시스템 테이블을 직접 쿼리하는 혼합된 방법을 사용합니다.
후자의 옵션은 프로덕션 ClickHouse 서비스에 쿼리를 수행하는 데 의존합니다. 이는 관찰 중인 시스템에 쿼리 부하를 추가하고 ClickHouse Cloud 인스턴스가 유휴 상태로 남는 것을 방지하여 비용 최적화에 영향을 미칩니다. 또한 프로덕션 시스템이 실패할 경우, 모니터링에도 영향을 미칠 수 있으므로 두 가지가 결합되어 있습니다. 이 접근 방식은 깊은 내통 및 디버깅에는 잘 작동하지만 실시간 프로덕션 모니터링에는 덜 적합합니다. 직접 Grafana 통합과 다음 섹션에서 논의된 외부 도구 통합 접근 방식 간의 운영 오버헤드와 세부 시스템 분석 기능 간의 균형을 고려하십시오.
