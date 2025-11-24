In ClickHouse, **변경**은 테이블의 기존 데이터를 수정하거나 삭제하는 작업을 지칭합니다. 일반적으로 `ALTER TABLE ... DELETE` 또는 `ALTER TABLE ... UPDATE`를 사용합니다. 이러한 문장은 표준 SQL 작업과 유사해 보일 수 있지만, 내부적으로는 근본적으로 다릅니다.

ClickHouse에서 변경은 행을 제자리에서 수정하는 것이 아니라, 변경의 영향을 받는 전체 [데이터 파트](/parts)를 재작성하는 비동기 백그라운드 프로세스입니다. 이 접근 방식은 ClickHouse의 컬럼형, 불변 저장 모델로 인해 필요하며, 상당한 I/O 및 자원 사용을 초래할 수 있습니다.

변경이 발행되면 ClickHouse는 새로운 **변경된 파트**의 생성을 예약하며, 새로운 파트가 준비될 때까지 원래 파트는 손대지 않습니다. 준비가 완료되면 변경된 파트가 원본을 원자적으로 대체합니다. 그러나 이 작업은 전체 파트를 재작성하기 때문에, 단일 행을 업데이트하는 것과 같은 사소한 변경도 대규모 재작성 및 과도한 쓰기 증폭을 초래할 수 있습니다.

대규모 데이터셋의 경우, 이는 디스크 I/O에 상당한 급증을 유발하고 전체 클러스터 성능을 저하시킬 수 있습니다. 병합과 달리, 변경은 제출된 이후 롤백할 수 없으며, 명시적으로 취소하지 않는 한 서버 재시작 후에도 계속 실행됩니다—[`KILL MUTATION`](/sql-reference/statements/kill#kill-mutation)을 참조하십시오.

:::tip ClickHouse에서 활성 또는 대기 중인 변경 수 모니터링
활성 또는 대기 중인 변경 수를 모니터링하는 방법에 대한 내용은 다음 [지식 기반 기사](/knowledgebase/view_number_of_active_mutations)를 참조하십시오.
:::

변경은 **완전히 순서화**됩니다: 이는 변경이 발행되기 전의 데이터에 적용되며, 새로운 데이터는 영향을 받지 않습니다. 변경은 삽입을 차단하지 않지만, 여전히 다른 진행 중인 쿼리와 겹칠 수 있습니다. 변경 중 실행되는 SELECT는 변경된 파트와 변경되지 않은 파트를 혼합하여 읽을 수 있으며, 이로 인해 실행 중 데이터의 일관되지 않은 뷰가 발생할 수 있습니다. ClickHouse는 각 파트별로 변경을 병렬로 실행하여 복잡한 서브쿼리(예: x IN (SELECT ...))가 포함되었을 경우 메모리 및 CPU 사용량을 더욱 증가시킬 수 있습니다.

일반적으로, **빈번하거나 대규모 변경을 피하세요**, 특히 고용량 테이블에서. 대신 데이터 수정 작업을 쿼리 시 또는 병합 중에 보다 효율적으로 처리할 수 있도록 설계된 대체 테이블 엔진인 [ReplacingMergeTree](/guides/replacing-merge-tree) 또는 [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)를 사용하십시오. 변경이 절대적으로 필요하다면, system.mutations 테이블을 사용하여 신중하게 모니터링하고, 프로세스가 멈추거나 비정상 작동할 경우 `KILL MUTATION`을 사용하십시오. 변경을 잘못 사용하면 성능 저하, 과도한 저장소 churn, 잠재적인 서비스 불안정성을 초래할 수 있으므로 주의하여 드물게 사용하십시오.

데이터 삭제를 위해 사용자는 또한 [경량 삭제](/guides/developer/lightweight-delete) 또는 데이터 관리를 위한 [파티션](/best-practices/choosing-a-partitioning-key)을 고려할 수 있으며, 이를 통해 전체 파트를 [효율적으로 드롭](/sql-reference/statements/alter/partition#drop-partitionpart)할 수 있습니다.
