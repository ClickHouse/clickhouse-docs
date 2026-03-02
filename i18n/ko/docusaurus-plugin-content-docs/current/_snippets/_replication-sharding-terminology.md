## 용어 정리 \{#terminology\}

### 레플리카 \{#replica\}

데이터의 사본을 의미합니다. ClickHouse에는 항상 최소 한 개의 데이터 사본이 존재하므로 **레플리카**의 최소 개수는 1개입니다. 이는 중요한 세부 사항입니다. 원본 데이터 사본을 레플리카로 계산하는 데 익숙하지 않을 수 있지만, ClickHouse 코드와 문서에서는 그렇게 칭합니다. 데이터의 두 번째 레플리카를 추가하면 장애 허용을 확보할 수 있습니다. 

### 세그먼트(Shard) \{#shard\}

데이터의 부분 집합을 의미합니다. ClickHouse에는 항상 최소 1개의 세그먼트가 있으므로, 데이터를 여러 서버에 분산하지 않으면 모든 데이터는 하나의 세그먼트에 저장됩니다. 데이터를 여러 서버에 샤딩하면 단일 서버의 용량을 초과하는 경우 부하를 분산할 수 있습니다. 대상 서버는 **샤딩 키(sharding key)** 에 의해 결정되며, 분산 테이블(distributed table)을 생성할 때 정의합니다. 샤딩 키는 임의 값이거나 [해시 함수(hash function)](/sql-reference/functions/hash-functions)의 결과일 수 있습니다. 샤딩을 사용하는 배포 예시에서는 `rand()`를 샤딩 키로 사용하며, 언제 그리고 어떻게 다른 샤딩 키를 선택해야 하는지에 대해 추가로 설명합니다.

### 분산 조정 \{#distributed-coordination\}

ClickHouse Keeper는 데이터 복제와 분산 DDL 쿼리 실행을 위한 조정 시스템을 제공합니다. ClickHouse Keeper는 Apache ZooKeeper와 호환됩니다.