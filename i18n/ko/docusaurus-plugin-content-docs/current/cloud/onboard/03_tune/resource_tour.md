---
slug: /cloud/get-started/cloud/resource-tour
title: '리소스 둘러보기'
description: '쿼리 최적화, 확장 전략, 모니터링 및 모범 사례를 위한 ClickHouse Cloud 문서 리소스에 대한 개요'
keywords: ['clickhouse cloud']
hide_title: true
doc_type: 'guide'
---

import TableOfContentsBestPractices from '@site/i18n/ko/docusaurus-plugin-content-docs/current/best-practices/_snippets/_table_of_contents.md';
import TableOfContentsOptimizationAndPerformance from '@site/i18n/ko/docusaurus-plugin-content-docs/current/guides/best-practices/_snippets/_performance_optimizations_table_of_contents.md';
import TableOfContentsSecurity from '@site/i18n/ko/docusaurus-plugin-content-docs/current/cloud/_snippets/_security_table_of_contents.md';


# 리소스 둘러보기 \{#resource-tour\}

이 문서는 ClickHouse Cloud 배포 환경을 최대한 활용하는 방법을 학습하는 데 도움이 되는, 문서 내 다양한 리소스의 개요를 제공합니다.
다음 주제별로 정리된 리소스를 살펴보십시오:

- [쿼리 최적화 기법 및 성능 튜닝](#query-optimization)
- [모니터링](#monitoring)
- [보안 모범 사례 및 컴플라이언스 기능](#security)
- [비용 최적화 및 요금](#cost-optimization)

더 구체적인 주제로 들어가기 전에, ClickHouse 사용 시 권장되는 공통 모범 사례를 다루는 ClickHouse 모범 사례 가이드부터 살펴보는 것을 권장합니다:

<TableOfContentsBestPractices />



## 쿼리 최적화 및 성능 튜닝 기법 \{#query-optimization\}

<TableOfContentsOptimizationAndPerformance/>



## 모니터링 \{#monitoring\}

| 페이지                                                                     | 설명                                                                          |
|----------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| [고급 대시보드](/cloud/manage/monitor/advanced-dashboard)                  | 기본 제공 고급 대시보드를 사용해 서비스 상태와 성능을 모니터링합니다         |
| [Prometheus 통합](/integrations/prometheus)                                | Prometheus를 사용하여 Cloud 서비스를 모니터링합니다                           |
| [Cloud 모니터링 기능](/use-cases/observability/cloud-monitoring)          | 기본 제공 모니터링 기능과 통합 옵션에 대한 개요를 제공합니다                 |



## 보안 \{#security\}

<TableOfContentsSecurity/>



## 비용 최적화 및 청구 \{#cost-optimization\}

| 페이지                                             | 설명                                                                                                        |
|-----------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| [데이터 전송](/cloud/manage/network-data-transfer) | ClickHouse Cloud가 인바운드 및 아웃바운드 데이터 전송량을 어떻게 측정하는지 확인합니다                              |
| [알림](/cloud/notifications)                        | ClickHouse Cloud 서비스에 대한 알림을 설정합니다. 예를 들어, 크레딧 사용량이 임계값을 초과하면 알림을 받도록 구성합니다 |
