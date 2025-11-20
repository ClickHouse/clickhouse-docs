---
'title': 'MySQL ClickPipe에서의 병렬 스냅샷'
'description': 'MySQL ClickPipe에서의 병렬 스냅샷 설명을 위한 문서'
'slug': '/integrations/clickpipes/mysql/parallel_initial_load'
'sidebar_label': '병렬 스냅샷 작동 방식'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import snapshot_params from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/snapshot_params.png'
import partition_key from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/partition_key.png'
import Image from '@theme/IdealImage';

This document explains parallelized snapshot/initial load in the MySQL ClickPipe works and talks about the snapshot parameters that can be used to control it.

## 개요 {#overview-mysql-snapshot}

초기 로드는 CDC ClickPipe의 첫 번째 단계로, ClickPipe가 소스 데이터베이스의 테이블에서 ClickHouse로 역사 데이터를 동기화한 후 CDC를 시작합니다. 많은 경우 개발자들은 이를 단일 스레드 방식으로 수행합니다. 그러나 MySQL ClickPipe는 이 프로세스를 병렬화할 수 있어 초기 로드를 상당히 빠르게 할 수 있습니다.

### 파티션 키 컬럼 {#key-mysql-snapshot}

기능 플래그를 활성화한 후 ClickPipe 테이블 선택기에서 아래 설정을 볼 수 있어야 합니다(ClickPipe 생성 및 편집 시 모두 해당됨):
<Image img={partition_key} alt="Partition key column" size="md"/>

MySQL ClickPipe는 소스 테이블의 컬럼을 사용하여 소스 테이블을 논리적으로 파티셔닝합니다. 이 컬럼을 **파티션 키 컬럼**이라고 합니다. 이는 소스 테이블을 파티션으로 나누는 데 사용되며, ClickPipe에 의해 병렬 처리될 수 있습니다.

:::warning
파티션 키 컬럼은 소스 테이블에서 인덱스가 있어야 성능 향상을 보장할 수 있습니다. MySQL에서 `SHOW INDEX FROM <table_name>`을 실행해 확인할 수 있습니다.
:::

### 논리적 파티셔닝 {#logical-partitioning-mysql-snapshot}

아래 설정에 대해 이야기해 보겠습니다:

<Image img={snapshot_params} alt="Snapshot parameters" size="md"/>

#### 파티션 당 행 수 {#numrows-mysql-snapshot}
이 설정은 파티션을 구성하는 행 수를 제어합니다. ClickPipe는 이 크기만큼 소스 테이블을 청크 단위로 읽으며, 청크는 설정된 초기 로드 병렬성에 따라 병렬로 처리됩니다. 기본값은 파티션당 100,000행입니다.

#### 초기 로드 병렬성 {#parallelism-mysql-snapshot}
이 설정은 병렬로 처리되는 파티션 수를 제어합니다. 기본값은 4로, 이는 ClickPipe가 소스 테이블의 4개의 파티션을 병렬로 읽는다는 의미입니다. 이는 초기 로드를 빠르게 하기 위해 늘릴 수 있지만, 소스 인스턴스 사양에 따라 합리적인 값으로 유지하는 것이 좋습니다. ClickPipe는 소스 테이블의 크기와 파티션당 행 수에 따라 파티션 수를 자동으로 조정합니다.

#### 병렬로 처리되는 테이블 수 {#tables-parallel-mysql-snapshot}
병렬 스냅샷과는 그리 관련이 없지만, 이 설정은 초기 로드 중 병렬로 처리되는 테이블 수를 제어합니다. 기본값은 1입니다. 이는 파티션의 병렬 처리 수 위에 설정되는 값이므로, 예를 들어 4개의 파티션과 2개의 테이블이 있는 경우 ClickPipe는 병렬로 8개의 파티션을 읽게 됩니다.

### MySQL에서 병렬 스냅샷 모니터링 {#monitoring-parallel-mysql-snapshot}
MySQL에서 **SHOW processlist**를 실행하여 병렬 스냅샷이 작동하는 모습을 볼 수 있습니다. ClickPipe는 소스 데이터베이스에 여러 개의 연결을 생성하며, 각각은 소스 테이블의 다른 파티션을 읽게 됩니다. 다른 범위를 가진 **SELECT** 쿼리를 보면 ClickPipe가 소스 테이블을 읽고 있음을 의미합니다. 여기서 COUNT(*)와 파티셔닝 쿼리도 확인할 수 있습니다.

### 제한 사항 {#limitations-parallel-mysql-snapshot}
- 스냅샷 매개변수는 파이프 생성 후 수정할 수 없습니다. 변경하려면 새로운 ClickPipe를 생성해야 합니다.
- 기존 ClickPipe에 테이블을 추가할 때는 스냅샷 매개변수를 변경할 수 없습니다. ClickPipe는 새 테이블에 대해 기존 매개변수를 사용합니다.
- 파티션 키 컬럼은 `NULL` 값을 포함해서는 안 되며, 이는 파티셔닝 로직에 의해 스킵됩니다.
