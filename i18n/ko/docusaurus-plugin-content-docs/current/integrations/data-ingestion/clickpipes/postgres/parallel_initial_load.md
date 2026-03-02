---
title: 'Postgres ClickPipe의 병렬 스냅샷'
description: 'Postgres ClickPipe에서 병렬 스냅샷이 어떻게 동작하는지 설명하는 문서입니다.'
slug: /integrations/clickpipes/postgres/parallel_initial_load
sidebar_label: '병렬 스냅샷 동작 방식'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

이 문서는 Postgres ClickPipe에서 스냅샷/초기 로드가 어떻게 병렬로 수행되는지 설명하며, 이를 제어하기 위해 사용할 수 있는 스냅샷 매개변수에 대해 다룹니다.


## 개요 \{#overview-pg-snapshot\}

초기 로드(initial load)는 CDC ClickPipe의 첫 번째 단계로, ClickPipe가 CDC를 시작하기 전에 소스 데이터베이스에 있는 테이블의 과거 데이터를 ClickHouse로 동기화하는 과정입니다. 대부분의 경우 개발자는 `pg_dump`나 `pg_restore`를 사용하거나, 소스 데이터베이스에서 읽고 ClickHouse에 쓰는 작업을 단일 스레드로 수행합니다.
그러나 Postgres ClickPipe는 이 과정을 병렬로 처리할 수 있으며, 이를 통해 초기 로드 속도를 크게 높일 수 있습니다.

### Postgres의 CTID 컬럼 \{#ctid-pg-snapshot\}

Postgres에서 테이블의 각 행에는 CTID라고 하는 고유 식별자가 있습니다. 이는 기본적으로 표시되지 않는 시스템 컬럼이지만, 테이블의 행을 고유하게 식별하는 데 사용할 수 있습니다. CTID는 블록 번호와 해당 블록 내 오프셋의 조합으로 구성되며, 이를 통해 행에 효율적으로 접근할 수 있습니다.

### 논리적 파티셔닝 \{#logical-partitioning-pg-snapshot\}

Postgres ClickPipe는 CTID 컬럼을 사용하여 소스 테이블을 논리적으로 파티셔닝합니다. 먼저 소스 테이블에 대해 COUNT(*)를 수행한 다음, 윈도 함수(window function)를 사용하는 파티셔닝 쿼리를 실행하여 각 파티션의 CTID 범위를 구합니다. 이를 통해 ClickPipe는 각 파티션을 별도의 스레드에서 처리하면서 소스 테이블을 병렬로 읽을 수 있습니다.

다음 설정에 대해 살펴보겠습니다:

<Image img={snapshot_params} alt="스냅샷 매개변수" size="md"/>

#### Snapshot number of rows per partition \{#numrows-pg-snapshot\}

이 설정은 하나의 파티션을 구성하는 행 수를 제어합니다. ClickPipe는 소스 테이블을 이 크기의 청크 단위로 읽고, 설정된 초기 로드 병렬성에 따라 청크를 병렬로 처리합니다. 기본값은 파티션당 행 100,000개입니다.

#### 초기 로드 병렬성 \{#parallelism-pg-snapshot\}

이 설정은 동시에 처리할 파티션 개수를 제어합니다. 기본값은 4이며, 이는 ClickPipe가 소스 테이블의 파티션 4개를 병렬로 읽는다는 의미입니다. 초기 로드를 더 빠르게 하기 위해 이 값을 늘릴 수 있지만, 소스 인스턴스의 사양에 따라 소스 데이터베이스에 과부하가 걸리지 않도록 적절한 수준으로 유지하는 것이 좋습니다. ClickPipe는 소스 테이블의 크기와 파티션당 행 수에 따라 파티션 개수를 자동으로 조정합니다.

#### 병렬로 스냅샷하는 테이블 수 \{#tables-parallel-pg-snapshot\}

병렬 스냅샷과 직접적인 관련은 없지만, 이 설정은 초기 로드 중에 동시에 처리되는 테이블 개수를 제어합니다. 기본값은 1입니다. 이 설정은 파티션의 병렬 처리에 더해 적용되므로, 파티션이 4개이고 테이블이 2개이면 ClickPipe는 8개의 파티션을 병렬로 읽습니다.

### Postgres에서 병렬 스냅샷 모니터링 \{#monitoring-parallel-pg-snapshot\}

**pg_stat_activity**를 분석하면 병렬 스냅샷이 실제로 어떻게 동작하는지 확인할 수 있습니다. ClickPipe는 소스 데이터베이스에 여러 개의 연결을 생성하고, 각 연결은 소스 테이블의 서로 다른 파티션을 읽습니다. 서로 다른 CTID 범위를 가진 **FETCH** 쿼리가 보인다면, 이는 ClickPipe가 소스 테이블을 읽고 있다는 의미입니다. 또한 여기에서 COUNT(*) 쿼리와 파티션을 위한 쿼리도 확인할 수 있습니다.

### 제한 사항 \{#limitations-parallel-pg-snapshot\}

- 스냅샷 매개변수는 ClickPipe를 생성한 후에는 수정할 수 없습니다. 변경하려면 새 ClickPipe를 생성해야 합니다.
- 기존 ClickPipe에 테이블을 추가할 때도 스냅샷 매개변수를 변경할 수 없습니다. ClickPipe는 새 테이블에 대해서도 기존 매개변수를 사용합니다.
- 파티션 키 컬럼에는 `NULL` 값을 포함하면 안 됩니다. 이러한 값은 파티션 처리 로직에서 건너뜁니다.