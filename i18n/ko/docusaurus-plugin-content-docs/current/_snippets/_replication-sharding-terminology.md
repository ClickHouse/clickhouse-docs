## Terminology {#terminology}
### Replica {#replica}
데이터의 복사본. ClickHouse는 항상 데이터의 복사본을 최소한 하나 가지고 있으며, 따라서 **복제본**의 최소 수는 하나입니다. 이는 중요한 세부사항으로, 데이터의 원본 복사본을 복제본으로 계산하는 것에 익숙하지 않을 수 있지만, ClickHouse의 코드와 문서에서 사용하는 용어입니다. 데이터의 두 번째 복제본을 추가하면 고장 허용성이 제공됩니다.

### Shard {#shard}
데이터의 하위 집합. ClickHouse는 항상 데이터에 대해 최소한 하나의 샤드를 가지고 있으므로, 데이터를 여러 서버에 나누지 않으면 데이터는 하나의 샤드에 저장됩니다. 여러 서버에 데이터를 샤딩하여 단일 서버의 용량을 초과할 경우 부하를 분산할 수 있습니다. 대상 서버는 **샤딩 키**에 의해 결정되며, 분산 테이블을 생성할 때 정의됩니다. 샤딩 키는 무작위일 수도 있고 [해시 함수](../../sql-reference/functions/hash-functions)의 결과로 사용될 수 있습니다. 샤딩과 관련된 배포 예제는 `rand()`를 샤딩 키로 사용하고, 다른 샤딩 키를 선택하는 시점과 방법에 대한 추가 정보를 제공합니다.

### Distributed coordination {#distributed-coordination}
ClickHouse Keeper는 데이터 복제 및 분산 DDL 쿼리 실행을 위한 조정 시스템을 제공합니다. ClickHouse Keeper는 Apache ZooKeeper와 호환됩니다.
