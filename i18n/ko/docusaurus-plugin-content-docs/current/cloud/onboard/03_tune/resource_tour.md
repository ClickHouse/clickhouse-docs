---
'slug': '/cloud/get-started/cloud/resource-tour'
'title': '리소스 투어'
'description': '쿼리 최적화, 스케일링 전략, 모니터링 및 모범 사례에 대한 ClickHouse Cloud 문서 리소스 개요'
'keywords':
- 'clickhouse cloud'
'hide_title': true
'doc_type': 'guide'
---

import TableOfContentsBestPractices from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/i18n/ko/docusaurus-plugin-content-docs/current/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/i18n/ko/docusaurus-plugin-content-docs/current/cloud/_snippets/_security_table_of_contents.md';


# 리소스 투어

이 문서는 ClickHouse Cloud 배포에서 최대의 이점을 얻기 위해 사용할 수 있는 리소스 개요를 제공합니다. 다음 주제별로 구성된 리소스를 탐색해보세요:

- [쿼리 최적화 기술 및 성능 조정](#query-optimization)
- [모니터링](#monitoring)
- [보안 모범 사례 및 컴플라이언스 기능](#security)
- [비용 최적화 및 청구](#cost-optimization)

더 구체적인 주제로 들어가기 전에, ClickHouse를 사용할 때 따라야 할 일반적인 모범 사례를 다룬 일반 ClickHouse 모범 사례 가이드를 시작하는 것을 추천합니다.

<TableOfContentsBestPractices />

## 쿼리 최적화 기술 및 성능 조정 {#query-optimization}

<TableOfContentsOptimizationAndPerformance/>

## 모니터링 {#monitoring}

| 페이지                                                                       | 설명                                                                   |
|----------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| [고급 대시보드](/cloud/manage/monitor/advanced-dashboard)             | 내장된 고급 대시보드를 사용하여 서비스 상태 및 성능을 모니터링합니다. |
| [Prometheus 통합](/integrations/prometheus)                         | Prometheus를 사용하여 Cloud 서비스를 모니터링합니다.                                      |
| [Cloud 모니터링 기능](/use-cases/observability/cloud-monitoring) | 내장된 모니터링 기능 및 통합 옵션에 대한 개요를 제공합니다.   |

## 보안 {#security}

<TableOfContentsSecurity/>

## 비용 최적화 및 청구 {#cost-optimization}

| 페이지                                                | 설명                                                                                               |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| [데이터 전송](/cloud/manage/network-data-transfer)| ClickHouse Cloud가 수신 및 송신된 데이터의 측정 방법을 이해합니다.                                |
| [알림](/cloud/notifications)               | ClickHouse Cloud 서비스에 대한 알림을 설정합니다. 예를 들어, 크레딧 사용량이 특정 임계값을 초과할 때 알림을 설정합니다. |
