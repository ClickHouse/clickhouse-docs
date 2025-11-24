| Topic                                                                           | Description                                                                                                                                                       |
|---------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [쿼리 최적화 가이드](/optimize/query-optimization)                        | 쿼리 최적화의 기초를 다루며, 일반적인 시나리오와 쿼리 실행 속도를 개선하기 위한 성능 기술을 포함합니다.                            |
| [기본 인덱스 고급 가이드](/guides/best-practices/sparse-primary-indexes) | ClickHouse의 독특한 스파스 기본 인덱싱 시스템에 대한 심층 분석, 전통적인 데이터베이스와의 차이점, 최적 인덱싱 전략에 대한 모범 사례를 설명합니다. |
| [쿼리 병렬 처리](/optimize/query-parallelism)                                | ClickHouse가 처리 레인과 `max_threads` 설정을 사용하여 쿼리 실행을 병렬화하는 방법과 병렬 실행을 검사하고 최적화하는 방법을 알아봅니다.    |
| [파티션 키](/optimize/partitioning-key)                                  | 파티션 키 선택을 마스터하여 효율적인 데이터 세그먼트 프루닝을 가능하게 하고 일반적인 파티셔닝 함정을 피하여 쿼리 성능을 극적으로 향상시킵니다.    |
| [데이터 스킵 인덱스](/optimize/skipping-indexes)                             | 비기본 키 컬럼에서 필터링된 쿼리를 가속화하기 위해 관련 없는 데이터 블록을 건너뛰도록 이차 인덱스를 전략적으로 적용합니다.                                  |
| [`PREWHERE` 최적화](/optimize/prewhere)                                   | `PREWHERE`가 불필요한 컬럼을 읽기 전에 데이터를 필터링하여 I/O를 자동으로 줄이는 방법과 그 효과를 모니터링하는 방법을 이해합니다.                  |
| [대량 삽입](/optimize/bulk-inserts)                                          | 데이터 삽입을 효과적으로 배치하여 수집 처리량을 극대화하고 리소스 오버헤드를 줄입니다.                                                               |
| [비동기 삽입](/optimize/asynchronous-inserts)                          | 클라이언트 측 복잡성을 줄이고 고주파 삽입에 대한 처리량을 증가시키기 위해 서버 측 배치를 활용하여 삽입 성능을 개선합니다.             |
| [변경 방지](/optimize/avoid-mutations)                                    | 데이터 정확성과 성능을 유지하면서 비용이 많이 드는 `UPDATE` 및 `DELETE` 작업을 제거하는 추가 전용 워크플로를 설계합니다.                              |
| [Nullable 컬럼 피하기](/optimize/avoid-nullable-columns)                      | 가능한 경우 Nullable 컬럼 대신 기본 값을 사용하여 저장 오버헤드를 줄이고 쿼리 성능을 개선합니다.                                         |
| [`OPTIMIZE FINAL` 피하기](/optimize/avoidoptimizefinal)                          | `OPTIMIZE TABLE FINAL`을 사용해야 할 때와 사용하지 말아야 할 때를 이해합니다.                                                                                              |
| [분석기](/operations/analyzer)                                                | ClickHouse의 새로운 쿼리 분석기를 활용하여 성능 병목 현상을 식별하고 더 나은 효율성을 위한 쿼리 실행 계획을 최적화합니다.                            |
| [쿼리 프로파일링](/operations/optimizing-performance/sampling-query-profiler)   | 샘플링 쿼리 프로파일러를 사용하여 쿼리 실행 패턴을 분석하고 성능 핫스팟을 식별하며 리소스 사용을 최적화합니다.                                 |
| [쿼리 캐시](/operations/query-cache)                                          | ClickHouse의 내장 쿼리 결과 캐싱을 활성화하고 구성하여 자주 실행되는 `SELECT` 쿼리를 가속화합니다.                                           |
| [하드웨어 테스트](/operations/performance-test)                                | ClickHouse 성능 벤치마크를 설치 없이 모든 서버에서 실행하여 하드웨어 성능을 평가합니다. (ClickHouse Cloud에는 적용되지 않음)                  |
