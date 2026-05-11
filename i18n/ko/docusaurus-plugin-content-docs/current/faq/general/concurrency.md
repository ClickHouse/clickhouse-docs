---
title: 'ClickHouse는 빈번한 동시 쿼리를 지원합니까?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/concurrency
description: 'ClickHouse는 높은 QPS와 높은 동시성을 지원합니다'
doc_type: 'reference'
keywords: ['동시성', 'QPS']
---

# ClickHouse는 빈번한 동시 쿼리를 지원합니까? \{#does-clickhouse-support-frequent-concurrent-queries\}

ClickHouse는 외부 사용자에게 직접 서비스를 제공할 수 있는 실시간 분석 애플리케이션을 위해 설계되었습니다. 페타바이트 규모의 데이터베이스에서 과거 데이터와 실시간 삽입 데이터를 결합하여 지연 시간이 낮은(10밀리초 미만의) 높은 동시성(초당 10,000개 이상의 쿼리)의 분석 쿼리를 처리할 수 있습니다.

이는 효율적인 인덱스 구조, 유연한 캐싱, 프로젝션과 materialized view와 같은 다양한 구성 옵션 덕분에 가능합니다.

내장된 역할 기반 접근 제어, 리소스 사용 QUOTA, 구성 가능한 쿼리 복잡도 가드레일, 워크로드 스케줄러 등이 제공되므로 ClickHouse는 분석 데이터 상단의 서빙 계층으로 사용하기에 이상적입니다.