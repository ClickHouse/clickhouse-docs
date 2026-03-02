ClickHouse에서 **뮤테이션(mutations)**은 일반적으로 `ALTER TABLE ... DELETE` 또는 `ALTER TABLE ... UPDATE`를 사용하여 테이블의 기존 데이터를 수정하거나 삭제하는 작업을 의미합니다. 이러한 SQL 문은 표준 SQL 연산과 비슷해 보이지만, 내부 동작 방식은 근본적으로 다릅니다. 

행을 제자리에서 수정하는 대신, ClickHouse의 뮤테이션은 변경의 영향을 받는 [데이터 파트(data parts)](/parts) 전체를 다시 쓰는 비동기 백그라운드 작업입니다. 이는 ClickHouse의 컬럼 지향, 불변(immutable) 스토리지 모델 때문에 필요한 방식이며, 상당한 I/O 및 리소스 사용으로 이어질 수 있습니다.

뮤테이션이 실행되면 ClickHouse는 새로운 **뮤테이션된 파트(mutated parts)** 생성을 스케줄링하고, 새로운 파트가 준비될 때까지 기존 파트는 그대로 유지합니다. 준비가 완료되면 뮤테이션된 파트가 원본을 원자적으로 교체합니다. 그러나 이 동작은 파트 전체를 다시 쓰기 때문에, 단 하나의 행을 업데이트하는 것과 같은 작은 변경만 있어도 대규모 재쓰기와 과도한 쓰기 증폭(write amplification)이 발생할 수 있습니다. 

대용량 데이터셋에서는 디스크 I/O가 크게 급증하고 클러스터 전체 성능이 저하될 수 있습니다. 머지(merge)와 달리, 뮤테이션은 한 번 제출되면 롤백할 수 없으며, 명시적으로 취소하지 않는 이상 서버를 재시작한 이후에도 계속 실행됩니다. 자세한 내용은 [`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)을 참조하십시오.

:::tip ClickHouse에서 활성 또는 대기 중인 뮤테이션 수 모니터링
활성 또는 대기 중인 뮤테이션 수를 모니터링하는 방법은 다음 [지식 베이스 문서](/knowledgebase/view_number_of_active_mutations)를 참조하십시오.
:::

뮤테이션은 **전역적으로 순서가 보장됩니다(totally ordered)**. 즉, 뮤테이션이 발행되기 전에 삽입된 데이터에만 적용되고, 그 이후에 삽입된 신규 데이터에는 영향을 주지 않습니다. 삽입 작업을 차단하지는 않지만, 여전히 실행 중인 다른 쿼리와 겹칠 수 있습니다. 뮤테이션이 수행되는 동안 실행 중인 SELECT는 뮤테이션된 파트와 그렇지 않은 파트를 혼합해서 읽을 수 있으며, 이로 인해 실행 중 데이터에 대한 일관성 없는 뷰가 발생할 수 있습니다. ClickHouse는 파트 단위로 뮤테이션을 병렬 실행하므로, 특히 `x IN (SELECT ...)`와 같은 복잡한 서브쿼리가 포함된 경우 메모리와 CPU 사용량이 더욱 증가할 수 있습니다.

원칙적으로, 특히 대량 데이터 테이블에서는 **잦은 뮤테이션이나 대규모 뮤테이션은 피해야 합니다**. 대신 [ReplacingMergeTree](/guides/replacing-merge-tree)나 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree) 같은 대체 테이블 엔진(table engines)을 사용하는 것이 좋습니다. 이러한 엔진은 쿼리 시점이나 머지 과정에서 데이터 정정을 보다 효율적으로 처리하도록 설계되어 있습니다. 뮤테이션이 반드시 필요하다면, `system.mutations` 테이블을 사용해 상태를 면밀히 모니터링하고, 프로세스가 멈추었거나 비정상적으로 동작하는 경우 `KILL MUTATION`을 사용해 중단하십시오. 뮤테이션을 잘못 사용하면 성능 저하, 과도한 스토리지 변동, 서비스 불안정성으로 이어질 수 있으므로, 신중하고 제한적으로 사용해야 합니다.

데이터 삭제를 위해서는 [경량한 삭제(Lightweight deletes)](/guides/developer/lightweight-delete)를 사용하거나, [파티션(partitions)](/best-practices/choosing-a-partitioning-key)을 통해 데이터를 관리하는 방법도 고려할 수 있습니다. 이를 사용하면 전체 파트를 [효율적으로 드롭](/sql-reference/statements/alter/partition#drop-partitionpart)할 수 있습니다.