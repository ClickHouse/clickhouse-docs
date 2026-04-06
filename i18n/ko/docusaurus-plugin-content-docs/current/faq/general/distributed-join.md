---
title: 'ClickHouse는 분산 JOIN을 지원합니까?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse는 분산 JOIN을 지원합니다'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# ClickHouse는 분산 조인을 지원합니까? \{#does-clickhouse-support-distributed-joins\}

예, ClickHouse는 클러스터에서 분산 조인을 지원합니다.

데이터가 클러스터 내에 함께 배치되어 있는 경우(예: 사용자 식별자를 기준으로 조인을 수행하고, 이 식별자가 샤딩 키이기도 한 경우), ClickHouse는 네트워크에서 데이터를 이동하지 않고 조인을 수행할 수 있는 방법을 제공합니다.

데이터가 함께 배치되어 있지 않은 경우, ClickHouse는 브로드캐스트 조인을 지원하며, 이 경우 조인 대상 데이터의 일부 파트가 클러스터의 각 노드로 분산됩니다.

2025년 기준 ClickHouse는 셔플 조인을 수행하지 않습니다. 즉, 조인의 어느 한쪽도 조인 키에 따라 클러스터 네트워크 전체로 재분배되지 않습니다.

:::tip
ClickHouse의 조인에 대한 일반적인 정보는 [&quot;JOIN 절&quot;](/sql-reference/statements/select/join#supported-types-of-join) 페이지를 참조하십시오.
:::