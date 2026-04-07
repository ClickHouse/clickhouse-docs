---
title: '커뮤니티 및 파트너 통합'
slug: /cloud/monitoring/integrations
description: 'ClickHouse Cloud용 타사 모니터링 통합 및 청구 및 사용 API'
keywords: ['cloud', 'monitoring', 'datadog', 'grafana', 'community', 'billing', 'usage api']
sidebar_label: 'Integrations'
sidebar_position: 6
doc_type: 'guide'
---

import CommunityMonitoring from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_community_monitoring.md';

# 커뮤니티 및 파트너 통합 \{#community-and-partner-integrations\}

## Direct Datadog 통합 \{#direct-datadog\}

Datadog는 시스템 테이블을 직접 쿼리하는 에이전트용 ClickHouse Monitoring 플러그인을 제공합니다. 이 통합은 `clusterAllReplicas` 기능을 통해 클러스터 인지 기능을 갖춘 포괄적인 데이터베이스 모니터링을 제공합니다.

:::warning[ClickHouse Cloud에는 권장되지 않음]
시스템 테이블을 쿼리하는 직접 Datadog 에이전트 통합은 비용 최적화를 위한 유휴(idle) 동작 및 클라우드 프록시 계층의 운영상 제한과 호환되지 않으므로 ClickHouse Cloud 배포에는 권장되지 않습니다.
:::

대신 Datadog [Agent](https://docs.datadoghq.com/agent/?tab=Linux)와 [OpenMetrics 통합](https://docs.datadoghq.com/integrations/openmetrics/)을 사용하여 ClickHouse Cloud Prometheus 엔드포인트에서 메트릭을 수집하십시오. 이 접근 방식은 서비스의 유휴 동작을 고려하고, 모니터링 워크로드와 프로덕션 워크로드 간의 운영상 분리를 유지합니다. 구성 지침은 [Datadog의 Prometheus 및 OpenMetrics 통합 문서](https://docs.datadoghq.com/integrations/openmetrics/)를 참조하십시오.

Prometheus 엔드포인트 설정에 대한 자세한 내용은 [Prometheus 통합 페이지](/integrations/prometheus#integrating-with-datadog)를 참조하십시오.

<CommunityMonitoring/>

## 청구 및 사용 API \{#billing-usage-api\}

청구 및 사용 API를 사용하면 Cloud 조직의 청구 및 사용 기록에 프로그래밍 방식으로 액세스할 수 있습니다. 이는 사용자 지정 비용 모니터링 대시보드를 구축하거나 청구 데이터를 기존 재무 보고 워크플로에 통합하는 데 유용합니다.

전체 API 참조는 [Billing API documentation](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/Billing)를 참조하십시오.