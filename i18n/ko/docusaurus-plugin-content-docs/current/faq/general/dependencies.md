---
title: 'ClickHouse 실행에 필요한 서드파티(3rd-party) 의존성은 무엇입니까?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/dependencies
description: 'ClickHouse는 자체 포함형이며 런타임 의존성이 없습니다.'
doc_type: 'reference'
keywords: ['의존성', '3rd-party']
---

# ClickHouse를 실행하기 위한 3rd-party 의존성은 무엇인가요? \{#what-are-the-3rd-party-dependencies-for-running-clickhouse\}

ClickHouse에는 런타임 의존성이 없습니다. 완전히 독립적인 단일 바이너리 애플리케이션으로 배포됩니다. 이 애플리케이션은 클러스터의 모든 기능을 제공하며, 쿼리를 처리하고, 클러스터의 워커 노드로 동작하고, RAFT 합의 알고리즘을 제공하는 조정 시스템으로 동작하며, 클라이언트 또는 로컬 쿼리 엔진 역할을 수행합니다.

이러한 독특한 아키텍처적 선택으로 인해, 전용 프론트엔드, 백엔드 또는 집계 노드를 두는 경우가 많은 다른 시스템과 ClickHouse가 구분되며, 배포, 클러스터 관리 및 모니터링이 더 쉬워집니다.

:::info
오래전에 ClickHouse는 분산 클러스터의 조정을 위해 ZooKeeper가 필요했습니다. 이제는 더 이상 필요하지 않으며, ZooKeeper 사용을 계속 지원하긴 하지만 더 이상 권장되지는 않습니다.
:::