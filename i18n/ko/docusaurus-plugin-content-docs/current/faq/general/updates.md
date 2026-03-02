---
title: 'ClickHouse는 실시간 업데이트를 지원하나요?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse는 경량 실시간 업데이트를 지원합니다'
doc_type: 'reference'
keywords: ['업데이트', '실시간']
---

# ClickHouse는 실시간 업데이트를 지원하나요? \{#does-clickhouse-support-real-time-updates\}

ClickHouse는 UPDATE 문을 지원하며, INSERT만큼 빠른 속도로 실시간 업데이트를 수행할 수 있습니다.

이는 [patch parts 데이터 구조](https://clickhouse.com/blog/updates-in-clickhouse-2-sql-style-updates#stage-3-patch-parts--updates-the-clickhouse-way) 덕분에 가능합니다. 이 구조는 SELECT 성능에 큰 영향을 주지 않으면서 변경 사항을 빠르게 적용할 수 있도록 합니다.

또한 MVCC(multi-version concurrency control)와 스냅샷 격리(snapshot isolation)를 통해 업데이트는 ACID 특성을 보장합니다.

:::info
경량 업데이트는 ClickHouse 25.7 버전에서 처음 도입되었습니다.
:::