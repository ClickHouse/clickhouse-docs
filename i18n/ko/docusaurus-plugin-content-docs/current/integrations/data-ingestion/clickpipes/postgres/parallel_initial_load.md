---
'title': 'Postgres ClickPipe에서의 병렬 스냅샷'
'description': 'Postgres ClickPipe에서의 병렬 스냅샷을 설명하는 문서'
'slug': '/integrations/clickpipes/postgres/parallel_initial_load'
'sidebar_label': '병렬 스냅샷이 작동하는 방식'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/snapshot_params.png'
import Image from '@theme/IdealImage';

이 문서는 Postgres ClickPipe에서 병렬화된 스냅샷/초기 로드에 대해 설명하고 이를 제어하는 데 사용할 수 있는 스냅샷 매개변수에 대해 설명합니다.

## 개요 {#overview-pg-snapshot}

초기 로드는 CDC ClickPipe의 첫 번째 단계로, ClickPipe가 소스 데이터베이스의 테이블의 역사적 데이터를 ClickHouse로 동기화한 후 CDC를 시작합니다. 많은 경우, 개발자들은 pg_dump 또는 pg_restore와 같은 단일 스레드 방식으로 작업을 수행하거나 소스 데이터베이스에서 읽고 ClickHouse에 기록하는 단일 스레드를 사용합니다. 그러나 Postgres ClickPipe는 이 프로세스를 병렬화할 수 있어 초기 로드를 상당히 가속화할 수 있습니다.

### Postgres의 CTID 컬럼 {#ctid-pg-snapshot}
Postgres에서 테이블의 각 행은 CTID라는 고유 식별자를 가지고 있습니다. 이는 기본적으로 사용자에게 보이지 않는 시스템 컬럼으로, 테이블 내에서 행을 고유하게 식별하는 데 사용할 수 있습니다. CTID는 블록 번호와 블록 내 오프셋의 조합으로, 효율적인 행 접근을 가능하게 합니다.

### 논리적 파티셔닝 {#logical-partitioning-pg-snapshot}
Postgres ClickPipe는 CTID 컬럼을 사용하여 소스 테이블을 논리적으로 파티셔닝합니다. 이는 먼저 소스 테이블에서 COUNT(*)를 수행한 후, 창 함수로 파티셔닝 쿼리를 실행하여 각 파티션에 대한 CTID 범위를 가져오는 방식으로 파티션을 얻습니다. 이렇게 하면 ClickPipe가 소스 테이블을 병렬로 읽을 수 있으며, 각 파티션은 별도의 스레드로 처리됩니다.

아래 설정에 대해 이야기해 보겠습니다:

<Image img={snapshot_params} alt="스냅샷 매개변수" size="md"/>

#### 파티션당 스냅샷 행 수 {#numrows-pg-snapshot}

이 설정은 파티션을 구성하는 행 수를 제어합니다. ClickPipe는 이 크기의 청크로 소스 테이블을 읽으며, 청크는 설정된 초기 로드 병렬성에 따라 병렬로 처리됩니다. 기본값은 파티션당 100,000행입니다.

#### 초기 로드 병렬성 {#parallelism-pg-snapshot}

이 설정은 병렬로 처리되는 파티션 수를 제어합니다. 기본값은 4로, 이는 ClickPipe가 소스 테이블의 4개 파티션을 병렬로 읽는다는 의미입니다. 초기 로드를 가속화하기 위해 이 값을 늘릴 수 있지만, 소스 데이터베이스를 압도하지 않도록 소스 인스턴스 사양에 따라 합리적인 값으로 유지하는 것이 좋습니다. ClickPipe는 소스 테이블의 크기와 파티션당 행 수에 따라 자동으로 파티션 수를 조정합니다.

#### 병렬로 처리되는 테이블 수 {#tables-parallel-pg-snapshot}

병렬 스냅샷과는 직접적인 관련은 없지만, 이 설정은 초기 로드 중에 병렬로 처리되는 테이블 수를 제어합니다. 기본값은 1입니다. 이는 파티션의 병렬성 위에 추가되는 것이므로, 파티션이 4개이고 테이블이 2개인 경우 ClickPipe는 8개의 파티션을 병렬로 읽습니다.

### Postgres에서 병렬 스냅샷 모니터링 {#monitoring-parallel-pg-snapshot}

**pg_stat_activity**를 분석하여 병렬 스냅샷의 작동을 확인할 수 있습니다. ClickPipe는 소스 데이터베이스에 여러 연결을 생성하여 각기 다른 파티션의 소스 테이블을 읽습니다. 서로 다른 CTID 범위를 가진 **FETCH** 쿼리를 보면 ClickPipe가 소스 테이블을 읽고 있다는 것을 의미합니다. 여기에서 COUNT(*)와 파티셔닝 쿼리도 확인할 수 있습니다.

### 제한 사항 {#limitations-parallel-pg-snapshot}

- 파이프 생성 후 스냅샷 매개변수는 수정할 수 없습니다. 이를 변경하려면 새로운 ClickPipe를 생성해야 합니다.
- 기존 ClickPipe에 테이블을 추가할 때 스냅샷 매개변수를 변경할 수 없습니다. ClickPipe는 새로운 테이블에 대해 기존 매개변수를 사용합니다.
- 파티션 키 컬럼은 `NULL` 값을 포함해서는 안 되며, 이는 파티셔닝 논리에 의해 건너뛰어집니다.
