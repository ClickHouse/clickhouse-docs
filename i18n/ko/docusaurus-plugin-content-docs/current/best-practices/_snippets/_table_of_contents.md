| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [기본 키 선택하기](/best-practices/choosing-a-primary-key)                      | 쿼리 성능을 극대화하고 저장 오버헤드를 최소화하는 기본 키 선택 방법.                             |
| [데이터 유형 선택하기](/best-practices/select-data-types)                         | 메모리 사용량을 줄이고, 압축을 개선하며, 쿼리를 가속화하기 위해 최적의 데이터 유형 선택하기.      |
| [물리화된 뷰 사용하기](/best-practices/use-materialized-views)                   | 물리화된 뷰를 활용하여 데이터를 사전 집계하고 분석 쿼리를 극적으로 가속화하기.                      |
| [JOIN 최소화 및 최적화하기](/best-practices/minimize-optimize-joins)             | ClickHouse의 `JOIN` 기능을 효율적으로 사용하는 모범 사례.                                            |
| [파티셔닝 키 선택하기](/best-practices/choosing-a-partitioning-key)              | 효율적인 데이터 가지치기와 더 빠른 쿼리 실행을 가능하게 하는 파티셔닝 전략 선택하기.               |
| [삽입 전략 선택하기](/best-practices/selecting-an-insert-strategy)              | 적절한 삽입 패턴으로 데이터 수집 처리량을 최적화하고 자원 소비를 줄이기.                         |
| [데이터 스킵 인덱스](/best-practices/use-data-skipping-indices-where-appropriate) | irrelevant한 데이터 블록을 건너뛰고 필터링된 쿼리를 가속화하기 위해 이차 인덱스를 전략적으로 적용하기. |
| [변경 피하기](/best-practices/avoid-mutations)                                    | 성능 향상을 위해 비용이 많이 드는 `UPDATE`/`DELETE` 작업을 제거하는 스키마 및 워크플로 설계하기.  |
| [OPTIMIZE FINAL 피하기](/best-practices/avoid-optimize-final)                     | `OPTIMIZE FINAL`이 도움이 되기보다는 해로운 경우를 이해하여 성능 병목 현상을 예방하기.              |
| [적절한 경우 JSON 사용하기](/best-practices/use-json-where-appropriate)          | ClickHouse에서 반구조화된 JSON 데이터를 다룰 때 유연성과 성능의 균형을 맞추기.                      |
