---
title: 'ClickHouse에 비용 기반 옵티마이저가 있습니까?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/cost-based
description: 'ClickHouse에는 몇 가지 비용 기반 최적화 메커니즘이 있습니다'
doc_type: 'reference'
keywords: ['CBE', 'optimizer']
---

# ClickHouse에는 비용 기반 옵티마이저가 있습니까? \{#does-clickhouse-have-a-cost-based-optimizer\}

ClickHouse에는 예를 들어 디스크에서 압축된 데이터 범위를 읽는 비용에 따라 컬럼을 읽는 순서를 결정하는 것과 같은, 일부 개별적인 비용 기반 최적화 메커니즘이 있습니다.

또한 ClickHouse는 컬럼 통계를 기반으로 JOIN 재정렬도 수행하지만, 이는 (2025년 현재) Postgres, Oracle, MS SQL Server의 CBE만큼 고도화되어 있지는 않습니다.