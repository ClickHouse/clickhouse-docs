---
'slug': '/faq/operations/multi-region-replication'
'title': 'ClickHouse는 다중 지역 복제를 지원합니까?'
'toc_hidden': true
'toc_priority': 30
'description': '이 페이지는 ClickHouse가 다중 지역 복제를 지원하는지 여부에 대한 답변을 제공합니다.'
'doc_type': 'reference'
'keywords':
- 'multi-region'
- 'replication'
- 'geo-distributed'
- 'distributed systems'
- 'data synchronization'
---


# ClickHouse는 다중 지역 복제를 지원하나요? {#does-clickhouse-support-multi-region-replication}

간단히 말해 "네"입니다. 그러나 모든 지역/데이터센터 간의 지연 시간을 두 자리 범위로 유지할 것을 권장합니다. 그렇지 않으면 분산 합의 프로토콜을 거치면서 쓰기 성능이 저하될 수 있습니다. 예를 들어, 미국 해안 간의 복제는 잘 작동할 가능성이 높지만, 미국과 유럽 간의 복제는 그렇지 않을 것입니다.

구성 측면에서는 단일 지역 복제와 차이가 없으며, 단지 복제본을 위한 서로 다른 위치에 있는 호스트를 사용하면 됩니다.

자세한 정보는 [데이터 복제에 대한 전체 기사](../../engines/table-engines/mergetree-family/replication.md)를 참조하세요.
