| Page                                                                                 | Description                                                                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| [Choosing a Primary Key](/best-practices/choosing-a-primary-key)                     | 쿼리 성능을 극대화하고 스토리지 오버헤드를 최소화할 수 있는 기본 키를 선택하는 방법을 설명합니다.         |
| [Select Data Types](/best-practices/select-data-types)                               | 메모리 사용량을 줄이고 압축률을 개선하며 쿼리를 가속화할 수 있는 최적의 데이터 타입을 선택하는 방법을 설명합니다. |
| [Use Materialized Views](/best-practices/use-materialized-views)                     | 구체화된 뷰(materialized view)를 활용하여 데이터를 사전 집계하고 분석 쿼리 속도를 크게 향상하는 방법을 설명합니다. |
| [Minimize and Optimize JOINs](/best-practices/minimize-optimize-joins)               | ClickHouse의 `JOIN` 기능을 효율적으로 사용하는 모범 사례를 다룹니다.                                    |
| [Choosing a Partitioning Key](/best-practices/choosing-a-partitioning-key)           | 효율적인 데이터 프루닝과 더 빠른 쿼리 실행을 가능하게 하는 파티셔닝 전략을 선택하는 방법을 설명합니다.     |
| [Selecting an Insert Strategy](/best-practices/selecting-an-insert-strategy)         | 적절한 insert 패턴을 통해 데이터 수집 처리량을 최적화하고 리소스 사용량을 줄이는 방법을 설명합니다.        |
| [Data Skipping Indices](/best-practices/use-data-skipping-indices-where-appropriate) | 보조 인덱스를 전략적으로 적용하여 관련 없는 데이터 블록을 건너뛰고 필터링된 쿼리를 가속화하는 방법을 설명합니다. |
| [Avoid Mutations](/best-practices/avoid-mutations)                                   | 비용이 큰 `UPDATE`/`DELETE` 연산을 제거하도록 스키마와 워크플로우를 설계하여 성능을 향상하는 방법을 설명합니다. |
| [Avoid OPTIMIZE FINAL](/best-practices/avoid-optimize-final)                         | `OPTIMIZE FINAL`을 사용하면 도움이 되기보다 해가 되는 경우를 이해하여 성능 병목 현상을 방지하는 방법을 설명합니다. |
| [Use JSON where appropriate](/best-practices/use-json-where-appropriate)             | ClickHouse에서 반정형 JSON 데이터를 다룰 때 유연성과 성능 간 균형을 맞추는 방법을 설명합니다.             |