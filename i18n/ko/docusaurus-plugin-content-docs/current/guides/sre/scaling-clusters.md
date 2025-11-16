---
'slug': '/guides/sre/scaling-clusters'
'sidebar_label': '샤드 재균형'
'sidebar_position': 20
'description': 'ClickHouse는 자동 샤드 재균형을 지원하지 않으므로, 샤드를 재균형하는 방법에 대한 몇 가지 모범 사례를 제공합니다.'
'title': '데이터 재균형'
'doc_type': 'guide'
'keywords':
- 'scaling'
- 'clusters'
- 'horizontal scaling'
- 'capacity planning'
- 'performance'
---


# 데이터 재균형화

ClickHouse는 자동 샤드 재균형화를 지원하지 않습니다. 그러나 샤드를 재균형화하는 방법이 선호도에 따라 있습니다:

1. [분산 테이블](/engines/table-engines/special/distributed.md)에 대한 샤드를 조정하여 새로운 샤드로의 쓰기를 편향되게 허용합니다. 이는 클러스터에 로드 불균형과 핫스팟을 초래할 수 있지만, 쓰기 처리량이 극단적으로 높지 않은 대부분의 시나리오에서 실행 가능할 수 있습니다. 사용자가 쓰기 대상을 변경할 필요가 없으며, 즉, 여전히 분산 테이블로 남겨둘 수 있습니다. 이는 기존 데이터를 재균형화하는 데는 도움이 되지 않습니다.

2. (1)의 대안으로 기존 클러스터를 수정하고 클러스터가 균형을 이룰 때까지 새 샤드에만 쓰기(수동으로 쓰기 가중치 조정)를 합니다. 이는 (1)과 동일한 제한 사항이 있습니다.

3. 기존 데이터를 재균형화해야 하고 데이터를 파티셔닝한 경우, 파티션을 분리한 다음 새 샤드에 재부착하기 전에 다른 노드로 수동으로 이동하는 것을 고려합니다. 이는 이후의 기술보다 수동적이지만 더 빠르고 리소스 소모가 적을 수 있습니다. 이는 수동 작업이므로 데이터의 재균형화를 고려해야 합니다.

4. [INSERT FROM SELECT](/sql-reference/statements/insert-into.md/#inserting-the-results-of-select)를 통해 소스 클러스터에서 새 클러스터로 데이터를 내보냅니다. 이는 매우 대형 데이터셋에서 성능이 떨어질 수 있으며, 소스 클러스터에서 상당한 IO가 발생하고 많은 네트워크 자원을 사용할 수 있습니다. 이는 최후의 수단을 나타냅니다.
