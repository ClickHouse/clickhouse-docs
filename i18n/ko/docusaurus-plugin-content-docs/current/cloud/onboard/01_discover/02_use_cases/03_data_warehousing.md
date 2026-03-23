---
slug: /cloud/get-started/cloud/use-cases/data_lake_and_warehouse
title: '데이터 웨어하우징'
description: '데이터 레이크의 유연성과 ClickHouse Cloud의 성능을 결합해 현대적인 데이터 웨어하우스 아키텍처를 구축합니다'
keywords: ['데이터 웨어하우스', '데이터 레이크', '레이크하우스', 'Iceberg', 'Delta Lake', 'Hudi', 'Parquet', '오픈 테이블 포맷', '하이브리드 아키텍처', '사용 사례']
sidebar_label: '데이터 웨어하우징'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import data_warehousing from '@site/static/images/cloud/onboard/discover/use_cases/data-warehousing.png';

현대적인 데이터 웨어하우스는 더 이상 스토리지와 컴퓨트를 긴밀하게 결합하지 않습니다. 대신 스토리지, 거버넌스, 쿼리 처리용 계층을 분리하되 서로 연결함으로써, 워크플로에 적합한 도구를 유연하게 선택할 수 있습니다.

클라우드 객체 스토리지에 오픈 테이블 포맷과 ClickHouse 같은 고성능 쿼리 엔진을 추가하면, 데이터 레이크의 개방성을 유지하면서도 ACID 트랜잭션, 스키마 강제 적용, 고속 분석 쿼리와 같은 데이터베이스급 기능을 활용할 수 있습니다. 이러한 조합은 상호 운용 가능하고 비용 효율적인 스토리지와 뛰어난 성능을 함께 제공하여, 기존 분석은 물론 최신 AI/ML 워크로드까지 지원합니다.


## 이 아키텍처가 제공하는 것 \{#benefits\}

개방형 객체 스토리지와 테이블 포맷을 ClickHouse를 쿼리 엔진으로 결합하면 다음을 얻을 수 있습니다:

| 이점 | 설명 |
|---------|-------------|
| **일관된 테이블 업데이트** | 테이블 상태에 대한 원자적 커밋은 동시 쓰기로 인해 손상되거나 일부만 기록된 데이터가 생성되지 않도록 합니다. 이는 원시 데이터 레이크의 가장 큰 문제 중 하나를 해결합니다. |
| **스키마 관리** | 강제된 검증과 추적되는 스키마 진화는 스키마 불일치로 인해 데이터를 사용할 수 없게 되는 "data swamp" 문제를 방지합니다. |
| **쿼리 성능** | 인덱싱, 통계, 데이터 스키핑 및 클러스터링과 같은 데이터 레이아웃 최적화를 통해 SQL 쿼리를 전용 데이터 웨어하우스에 버금가는 속도로 실행할 수 있습니다. ClickHouse의 열 지향 엔진과 결합하면 객체 스토리지에 저장된 데이터에서도 이는 그대로 유지됩니다. |
| **거버넌스** | 카탈로그와 테이블 포맷은 행 및 열 수준에서 세분화된 접근 제어와 감사 기능을 제공하여 기본적인 데이터 레이크의 제한적인 보안 제어 문제를 해결합니다. |
| **스토리지와 컴퓨트의 분리** | 스토리지와 컴퓨트는 범용 객체 스토리지에서 독립적으로 확장되며, 이는 독점 웨어하우스 스토리지보다 훨씬 저렴합니다. 이러한 분리는 최신 클라우드 웨어하우스에서 표준이지만, 개방형 포맷을 사용하면 데이터와 함께 확장할 컴퓨트 엔진이 *무엇인지* 선택할 수 있습니다. |

## ClickHouse가 데이터 웨어하우스를 지원하는 방식 \{#architecture\}

데이터는 스트리밍 플랫폼과 기존 웨어하우스에서 객체 스토리지를 거쳐 ClickHouse로 유입되며, 여기에서 변환·최적화된 뒤 BI/AI 도구에 제공됩니다.

<Image img={data_warehousing} alt="ClickHouse 데이터 웨어하우징 아키텍처" size="md" />

ClickHouse는 데이터 웨어하우징 워크플로의 4가지 핵심 영역, 즉 데이터 수집, 쿼리, 변환, 그리고 팀에서 이미 사용 중인 도구와의 연결을 처리합니다.

<details open>
  <summary>**데이터 수집**</summary>

  대량 데이터 로드에는 일반적으로 S3 또는 GCS와 같은 객체 스토리지를 중간 계층으로 사용합니다. ClickHouse는 [Parquet](/integrations/data-formats/parquet) 읽기 성능이 뛰어나 [S3 table engine](/engines/table-engines/integrations/s3)을 사용해 초당 수억 행 규모로 데이터를 로드할 수 있습니다. 실시간 스트리밍의 경우 [ClickPipes](/integrations/clickpipes)가 Kafka 및 Confluent와 같은 플랫폼에 직접 연결됩니다.

  또한 Snowflake, BigQuery, Databricks와 같은 기존 데이터 웨어하우스에서 객체 스토리지로 내보낸 뒤 [table engines](/engines/table-engines)를 통해 ClickHouse로 로드하는 방식으로 마이그레이션할 수도 있습니다.
</details>

<details>
  <summary>**쿼리**</summary>

  S3 및 GCS와 같은 객체 스토리지에서 직접 데이터를 쿼리하거나, [Iceberg](/engines/table-engines/integrations/iceberg), [Delta Lake](/engines/table-engines/integrations/deltalake), [Hudi](/engines/table-engines/integrations/hudi)와 같은 오픈 테이블 포맷을 사용하는 데이터 레이크에서 쿼리할 수 있습니다. 이러한 형식에는 직접 연결할 수도 있고, [AWS Glue Catalog](/use-cases/data-lake/glue-catalog), [Unity Catalog](/use-cases/data-lake/unity-catalog), [Iceberg REST](/use-cases/data-lake/rest-catalog)와 같은 데이터 카탈로그를 통해 연결할 수도 있습니다.

  [materialized views](/materialized-views)에 대한 쿼리가 빠른 이유는 요약된 결과가 전용 테이블에 자동으로 저장되기 때문입니다. 따라서 분석하는 데이터 양과 관계없이 후속 쿼리의 응답성이 향상됩니다. 다른 데이터베이스 공급자가 성능 가속 기능을 더 높은 가격 등급이나 추가 요금 뒤에 숨기는 반면, ClickHouse Cloud는 반복 실행되거나 지연 시간에 민감한 쿼리를 위해 [쿼리 캐시](/operations/query-cache), [희소 인덱스](/optimize/skipping-indexes), [프로젝션](/data-modeling/projections)을 기본으로 제공합니다.

  ClickHouse는 70개 이상의 파일 형식과, 날짜, 배열, JSON, geo, 근사 집계를 대규모로 처리하기 위한 SQL 함수를 지원합니다.
</details>

<details>
  <summary>**데이터 변환**</summary>

  데이터 변환은 비즈니스 인텔리전스 및 분석 워크플로의 핵심 구성 요소입니다. ClickHouse의 materialized view는 이를 자동화합니다. 이러한 SQL 기반 뷰는 소스 테이블에 새 데이터가 삽입될 때 트리거되므로, 별도의 맞춤형 변환 파이프라인을 구축하고 관리하지 않아도 데이터가 들어오는 즉시 추출, 집계, 수정할 수 있습니다.

  더 복잡한 모델링 워크플로의 경우 ClickHouse의 [dbt integration](/integrations/dbt)을 사용하면 변환을 버전 관리되는 SQL 모델로 정의하고, 기존 dbt jobs를 ClickHouse에서 직접 실행하도록 마이그레이션할 수 있습니다.
</details>

<details>
  <summary>**통합**</summary>

  ClickHouse는 [Tableau](/integrations/tableau), [Looker](/integrations/looker)와 같은 BI 도구용 네이티브 커넥터를 제공합니다. 네이티브 커넥터가 없는 도구는 추가 설정 없이 [MySQL wire protocol](/interfaces/mysql)을 통해 연결할 수 있습니다. 시맨틱 레이어 워크플로의 경우 ClickHouse는 Cube와 통합되어 팀에서 메트릭을 한 번 정의하면 어떤 후속 도구에서든 이를 쿼리할 수 있도록 합니다. 금융 서비스, 게임, e-commerce 등 다양한 분야의 기업은 이러한 통합을 활용해 데이터가 도착하는 즉시 가치를 창출하고, 실시간 대시보드와 비즈니스 인텔리전스 워크플로를 운영합니다.

  ClickHouse는 REST 인터페이스도 지원하므로 복잡한 바이너리 프로토콜 없이 경량 애플리케이션을 구축할 수 있습니다. [MCP 서버](/use-cases/AI/MCP)는 ClickHouse를 LLM에 연결하여 LibreChat 또는 Claude와 같은 도구를 통한 대화형 분석을 지원합니다. 유연한 [RBAC](/operations/access-rights) 및 quota 제어를 사용하면 클라이언트 측 데이터 가져오기를 위해 읽기 전용 테이블을 공개적으로 노출할 수 있습니다.
</details>

## 하이브리드 아키텍처: 두 세계의 장점을 모두 활용 \{#hybrid-architecture-the-best-of-both-worlds\}

데이터 레이크를 쿼리하는 것을 넘어, 실시간 대시보드, 운영 분석, 인터랙티브 애플리케이션처럼 초저지연이 필요한 사용 사례를 위해 성능이 중요한 데이터를 ClickHouse의 네이티브 [MergeTree](/engines/table-engines/mergetree-family/mergetree) 스토리지로 수집할 수 있습니다.

이를 통해 계층화된 데이터 전략을 구현할 수 있습니다. 자주 액세스되는 핫 데이터는 ClickHouse의 최적화된 스토리지에 저장되어 1초 미만의 쿼리 응답을 제공하고, 전체 데이터 이력은 데이터 레이크에 유지된 채 계속 쿼리할 수 있습니다. 또한 ClickHouse materialized view를 사용해 데이터 레이크의 데이터를 최적화된 테이블로 지속적으로 변환하고 집계하여, 두 계층을 자동으로 연결할 수 있습니다.

기술적 제약이 아니라 성능 요구 사항에 따라 데이터가 저장될 위치를 선택할 수 있습니다.

:::tip ClickHouse Academy
자세히 알아보려면 무료 [Data Warehousing with ClickHouse](https://clickhouse.com/learn/data-warehousing) 과정을 수강하십시오.
:::