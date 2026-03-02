---
slug: /faq/operations/multi-region-replication
title: 'ClickHouse는 멀티 리전 레플리케이션을 지원합니까?'
toc_hidden: true
toc_priority: 30
description: '이 페이지에서는 ClickHouse가 멀티 리전 레플리케이션을 지원하는지에 대해 답변합니다'
doc_type: 'reference'
keywords: ['멀티 리전', '복제', '지리적 분산', '분산 시스템', '데이터 동기화']
---



# ClickHouse는 멀티 리전 레플리케이션을 지원합니까? \{#does-clickhouse-support-multi-region-replication\}

간단히 말하면 「예」입니다. 다만 모든 리전/데이터 센터 간 지연 시간이 두 자릿수 범위 안에 유지되도록 하는 것을 권장합니다. 그렇지 않으면 분산 합의 프로토콜을 거치면서 쓰기 성능이 저하됩니다. 예를 들어, 미국 동·서해안 간 복제는 대체로 문제가 없겠지만, 미국과 유럽 간 복제는 원활하지 않을 수 있습니다.

구성은 단일 리전 복제와 동일하며, 레플리카로 서로 다른 위치에 있는 호스트를 사용하면 됩니다.

자세한 내용은 [데이터 복제에 관한 전체 문서](../../engines/table-engines/mergetree-family/replication.md)를 참조하십시오.
