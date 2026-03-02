---
title: 'MySQL ClickPipe의 병렬 스냅샷'
description: 'MySQL ClickPipe에서 병렬 스냅샷 기능을 설명하는 문서'
slug: /integrations/clickpipes/mysql/parallel_initial_load
sidebar_label: '병렬 스냅샷이 작동하는 방식'
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

이 문서는 MySQL ClickPipe에서 병렬 처리된 스냅샷/초기 로드가 동작하는 방식과 이를 제어하는 데 사용할 수 있는 스냅샷 매개변수에 대해 설명합니다.


## 개요 \{#overview-mysql-snapshot\}

초기 로드(initial load)는 CDC ClickPipe의 첫 번째 단계로, ClickPipe가 CDC를 시작하기 전에 소스 데이터베이스의 테이블에 있는 과거 데이터를 ClickHouse로 동기화하는 과정입니다. 많은 경우 개발자는 이 작업을 단일 스레드 방식으로 수행합니다.
그러나 MySQL ClickPipe는 이 프로세스를 병렬 처리할 수 있으며, 이를 통해 초기 로드 속도를 크게 높일 수 있습니다.

### 파티션 키 컬럼 \{#key-mysql-snapshot\}

기능 플래그를 활성화하면 ClickPipe 테이블 선택기에서 아래 설정을 확인할 수 있습니다(ClickPipe를 생성하거나 편집할 때 모두 동일하게 표시됩니다).

<Image img={partition_key} alt="파티션 키 컬럼" size="md"/>

MySQL ClickPipe는 소스 테이블의 한 컬럼을 사용하여 소스 테이블을 논리적으로 파티션합니다. 이 컬럼을 **파티션 키 컬럼**이라고 합니다. 이 컬럼을 사용하여 소스 테이블을 여러 파티션으로 나누며, 이렇게 나뉜 파티션은 ClickPipe에서 병렬로 처리됩니다.

:::warning
충분한 성능 향상을 위해서는 소스 테이블에서 파티션 키 컬럼에 인덱스가 생성되어 있어야 합니다. 이는 MySQL에서 `SHOW INDEX FROM <table_name>`을 실행하여 확인할 수 있습니다.
:::

### 논리적 파티셔닝 \{#logical-partitioning-mysql-snapshot\}

다음 설정을 살펴봅니다:

<Image img={snapshot_params} alt="스냅샷 파라미터" size="md"/>

#### 스냅샷 파티션당 행 수 \{#numrows-mysql-snapshot\}

이 설정은 하나의 파티션을 이루는 행 수를 정의합니다. ClickPipe는 소스 테이블을 이 크기만큼의 청크 단위로 읽으며, 청크는 설정된 초기 로드 병렬성에 따라 병렬로 처리됩니다. 기본값은 파티션당 100,000개의 행입니다.

#### 초기 로드 병렬성 \{#parallelism-mysql-snapshot\}

이 설정은 동시에 처리되는 파티션 수를 제어합니다. 기본값은 4이며, 이는 ClickPipe가 소스 테이블의 파티션 4개를 병렬로 읽는다는 의미입니다. 이 값을 늘리면 초기 로드를 더 빠르게 진행할 수 있지만, 소스 데이터베이스에 과부하가 걸리지 않도록 소스 인스턴스의 사양에 따라 합리적인 수준으로 유지하는 것이 좋습니다. ClickPipe는 소스 테이블의 크기와 파티션당 행 수에 따라 파티션 개수를 자동으로 조정합니다.

#### 병렬로 스냅샷하는 테이블 개수 \{#tables-parallel-mysql-snapshot\}

엄밀히 말해 병렬 스냅샷 자체를 제어하는 설정은 아니지만, 이 설정은 초기 로드 동안 동시에 처리되는 테이블 개수를 제어합니다. 기본값은 1입니다. 이 값은 파티션 병렬 처리 수준에 더해 적용된다는 점에 유의해야 합니다. 예를 들어 파티션이 4개이고 테이블이 2개인 경우 ClickPipe는 총 8개의 파티션을 병렬로 읽습니다.

### MySQL에서 병렬 스냅샷 모니터링 \{#monitoring-parallel-mysql-snapshot\}

MySQL에서 **SHOW processlist**를 실행하여 병렬 스냅샷이 어떻게 동작하는지 확인할 수 있습니다. ClickPipe는 소스 데이터베이스에 여러 개의 커넥션을 생성하며, 각 커넥션은 소스 테이블의 서로 다른 파티션을 읽습니다. 서로 다른 범위를 가진 **SELECT** 쿼리가 보인다면 ClickPipe가 소스 테이블을 읽고 있다는 것을 의미합니다. 또한 여기에서 COUNT(*)와 파티션 관련 쿼리도 확인할 수 있습니다.

### 제한 사항 \{#limitations-parallel-mysql-snapshot\}

- 스냅샷 매개변수는 ClickPipe 생성 후에는 수정할 수 없습니다. 변경하려면 새 ClickPipe를 생성해야 합니다.
- 기존 ClickPipe에 테이블을 추가할 때는 스냅샷 매개변수를 변경할 수 없습니다. ClickPipe는 새 테이블에 대해서도 기존 매개변수를 사용합니다.
- 파티션 키 컬럼에는 `NULL` 값이 포함되면 안 됩니다. 이러한 값은 파티션 처리 로직에서 건너뜁니다.