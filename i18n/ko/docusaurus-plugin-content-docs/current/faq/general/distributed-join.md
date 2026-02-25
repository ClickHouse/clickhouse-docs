---
title: 'ClickHouse는 분산 JOIN을 지원합니까?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse는 분산 JOIN을 지원합니다'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# ClickHouse는 분산 JOIN을 지원하나요? \{#does-clickhouse-support-distributed-join\}

ClickHouse는 클러스터에서 분산 JOIN을 지원합니다.

데이터가 클러스터 내에서 함께 배치(co-located)되어 있는 경우(예: JOIN을 사용자 식별자를 기준으로 수행하며, 이 식별자가 세그먼트 키이기도 한 경우), ClickHouse는 네트워크 상의 데이터 이동 없이 JOIN을 수행할 수 있는 방법을 제공합니다.

데이터가 함께 배치되어 있지 않은 경우, ClickHouse는 조인되는 데이터의 일부를 클러스터의 노드들에 브로드캐스트하는 broadcast JOIN을 지원합니다.

2025년 기준으로 ClickHouse는 shuffle-join 알고리즘을 수행하지 않습니다. 이는 조인 키에 따라 조인 대상 양쪽 데이터를 클러스터 전체에 걸쳐 네트워크를 통해 재분배하는 기능을 제공하지 않는다는 의미입니다.