---
slug: /use-cases/observability/oss-monitoring
title: '자가 관리형 모니터링'
sidebar_label: '자가 관리형 모니터링'
description: '자가 관리형 모니터링 가이드'
doc_type: 'guide'
keywords: ['관측성', '모니터링', '자가 관리형', '메트릭', '시스템 상태']
---

import ObservabilityIntegrations from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_observability_integration_options.md';
import DirectIntegrations from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_direct_observability_integration_options.md';
import CommunityMonitoring from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';


# 자가 관리형 모니터링 \{#cloud-monitoring\}

이 가이드는 ClickHouse 오픈 소스 버전을 평가하는 엔터프라이즈 팀을 대상으로, 프로덕션 배포 환경에서 필요한 모니터링 및 관측성(observability) 기능에 대한 포괄적인 정보를 제공합니다. 엔터프라이즈 고객은 기본 제공 모니터링 기능, Datadog 및 AWS CloudWatch와 같은 도구를 포함한 기존 관측성(observability) 스택과의 통합 방법, 그리고 ClickHouse의 모니터링이 자가 관리형 배포와 어떻게 비교되는지에 대해 자주 문의합니다.

### Prometheus 기반 통합 아키텍처 \{#prometheus\}

ClickHouse는 배포 방식에 따라 서로 다른 엔드포인트를 통해 Prometheus 호환 메트릭을 노출하며, 각 방식은 고유한 운영 특성을 가집니다:

**자가 관리형/OSS ClickHouse**

표준 /metrics 엔드포인트를 통해 ClickHouse 서버에 직접 접근할 수 있는 Prometheus 엔드포인트를 제공합니다. 이 방식은 다음과 같은 이점을 제공합니다:

- 완전한 메트릭 노출: 내장 필터링 없이 사용 가능한 ClickHouse 메트릭 전체 범위 제공
- 실시간 메트릭: 스크레이핑 시 시스템 테이블에서 직접 생성

**직접 시스템 접근** 

운영 시스템 테이블에 대한 쿼리를 수행하므로 모니터링 부하가 증가하고, 비용 절감을 위한 유휴 상태 전환을 방해합니다

<ObservabilityIntegrations/>

### ClickStack 배포 옵션 \{#clickstack-deployment\}

- [Helm](/use-cases/observability/clickstack/deployment/helm): Kubernetes 기반 디버깅 환경에서 사용하는 것을 권장합니다. `values.yaml`을 통해 환경별 구성, 리소스 제한, 스케일링을 설정할 수 있습니다.
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose): 각 구성 요소(ClickHouse, HyperDX, OTel collector, MongoDB)를 개별적으로 배포합니다.
- [HyperDX Only](/use-cases/observability/clickstack/deployment/hyperdx-only): 단독 HyperDX 컨테이너입니다.

전체 배포 옵션과 아키텍처에 대한 자세한 내용은 [ClickStack 문서](/use-cases/observability/clickstack/overview)와 [데이터 수집 가이드](/use-cases/observability/clickstack/ingesting-data/overview)를 참조하십시오.

<DirectIntegrations/>

<CommunityMonitoring/>