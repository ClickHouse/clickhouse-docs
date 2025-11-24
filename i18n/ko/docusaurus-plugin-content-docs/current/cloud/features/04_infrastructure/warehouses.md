---
'title': '창고'
'slug': '/cloud/reference/warehouses'
'keywords':
- 'compute separation'
- 'cloud'
- 'architecture'
- 'compute-compute'
- 'warehouse'
- 'warehouses'
- 'hydra'
'description': 'ClickHouse Cloud에서의 컴퓨트-컴퓨트 분리'
'doc_type': 'reference'
---

import compute_1 from '@site/static/images/cloud/reference/compute-compute-1.png';
import compute_2 from '@site/static/images/cloud/reference/compute-compute-2.png';
import compute_3 from '@site/static/images/cloud/reference/compute-compute-3.png';
import compute_4 from '@site/static/images/cloud/reference/compute-compute-4.png';
import compute_5 from '@site/static/images/cloud/reference/compute-compute-5.png';
import compute_7 from '@site/static/images/cloud/reference/compute-compute-7.png';
import compute_8 from '@site/static/images/cloud/reference/compute-compute-8.png';
import Image from '@theme/IdealImage';

```md

# 웨어하우스

## compute-compute 분리란 무엇인가요? {#what-is-compute-compute-separation}

compute-compute 분리는 Scale 및 Enterprise 티어에서 사용 가능합니다.

각 ClickHouse Cloud 서비스에는 다음이 포함됩니다:
- 두 개 이상의 ClickHouse 노드(또는 복제본)의 그룹이 필요하지만, 자식 서비스는 단일 복제본일 수 있습니다.
- 서비스에 연결하기 위해 사용하는 서비스 URL인 엔드포인트(또는 ClickHouse Cloud UI 콘솔을 통해 생성된 여러 엔드포인트)입니다 (예: `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`).
- 서비스가 모든 데이터 및 일부 메타데이터를 저장하는 객체 저장소 폴더:

:::note
자식 단일 서비스는 단일 부모 서비스와 달리 수직으로 확장할 수 있습니다.
:::

<Image img={compute_1} size="md" alt="Current service in ClickHouse Cloud" />

<br />

_Fig. 1 - ClickHouse Cloud의 현재 서비스_

compute-compute 분리는 사용자가 동일한 객체 저장소 폴더를 사용하는 여러 컴퓨팅 노드 그룹을 생성할 수 있도록 하며, 따라서 동일한 테이블, 뷰 등과 함께 사용할 수 있습니다.

각 컴퓨팅 노드 그룹은 자체 엔드포인트를 가지고 있어 작업 부하에 사용할 복제본 세트를 선택할 수 있습니다. 일부 작업 부하는 작은 규모의 복제본 하나로도 만족될 수 있으며, 다른 작업 부하는 완전한 고가용성(HA)과 수백 기가의 메모리를 요구할 수 있습니다. compute-compute 분리는 읽기 작업과 쓰기 작업을 분리할 수 있게 해 주어 서로 간섭하지 않도록 합니다:

<Image img={compute_2} size="md" alt="Compute separation in ClickHouse Cloud" />

<br />

_Fig. 2 - ClickHouse Cloud의 compute 분리_

기존 서비스와 동일한 데이터를 공유하는 추가 서비스를 생성하거나, 동일한 데이터를 공유하는 여러 서비스를 갖춘 완전히 새로운 설정을 생성할 수 있습니다.

## 웨어하우스란 무엇인가요? {#what-is-a-warehouse}

ClickHouse Cloud에서 _웨어하우스_는 동일한 데이터를 공유하는 서비스 집합입니다.
각 웨어하우스에는 기본 서비스(가장 먼저 생성된 서비스)와 보조 서비스가 있습니다. 예를 들어, 아래 스크린샷에서는 두 개의 서비스가 있는 "DWH Prod" 웨어하우스를 볼 수 있습니다:

- 기본 서비스 `DWH Prod`
- 보조 서비스 `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="Warehouse example with primary and secondary services" background='white' />

<br />

_Fig. 3 - 웨어하우스 예시_

웨어하우스의 모든 서비스는 다음을 공유합니다:

- 리전 (예: us-east1)
- 클라우드 서비스 제공업체 (AWS, GCP 또는 Azure)
- ClickHouse 데이터베이스 버전

서비스는 속한 웨어하우스에 따라 정렬할 수 있습니다.

## 액세스 제어 {#access-controls}

### 데이터베이스 자격 증명 {#database-credentials}

웨어하우스의 모든 서비스는 동일한 테이블 집합을 공유하므로 다른 서비스에 대한 액세스 제어도 공유합니다. 이는 Service 1에서 생성된 모든 데이터베이스 사용자가 동일한 권한(테이블, 뷰 등에 대한 부여)으로 Service 2를 사용할 수 있음을 의미하며, 그 반대도 마찬가지입니다. 사용자는 각 서비스에 대해 다른 엔드포인트를 사용하지만 동일한 사용자 이름과 비밀번호를 사용할 것입니다. 다시 말해, _사용자는 동일한 저장소와 함께 작업하는 서비스 간에 공유됩니다:_

<Image img={compute_3} size="md" alt="User access across services sharing same data" />

<br />

_Fig. 4 - 사용자 Alice는 Service 1에서 생성되었지만 동일한 데이터를 공유하는 모든 서비스에 접근하기 위해 동일한 자격 증명을 사용할 수 있습니다._

### 네트워크 액세스 제어 {#network-access-control}

특정 서비스가 다른 애플리케이션이나 임시 사용자에 의해 사용되는 것을 제한하는 것은 종종 유용합니다. 이는 ClickHouse Cloud 콘솔의 특정 서비스에서 **설정**으로 이동하여 현재 정규 서비스에 대해 구성하는 방법과 유사한 방식으로 네트워크 제한을 사용하여 수행할 수 있습니다.

각 서비스에 대해 IP 필터링 설정을 개별적으로 적용할 수 있어 어떤 애플리케이션이 어떤 서비스에 접근할 수 있는지를 제어할 수 있습니다. 이를 통해 특정 서비스 사용을 제한할 수 있습니다:

<Image img={compute_4} size="md" alt="Network access control settings"/>

<br />

_Fig. 5 - Alice는 네트워크 설정으로 인해 Service 2에 접근할 수 없습니다._

### 읽기 대 읽기-쓰기 {#read-vs-read-write}

때로는 특정 서비스에 대한 쓰기 액세스를 제한하고 웨어하우스 내의 서비스 집합만 쓰기를 허용하는 것이 유용합니다. 이는 두 번째 및 다수의 서비스를 생성할 때 수행할 수 있습니다(첫 번째 서비스는 항상 읽기-쓰기여야 합니다):

<Image img={compute_5} size="lg" alt="Read-write and Read-only services in a warehouse"/>

<br />

_Fig. 6 - 웨어하우스의 읽기-쓰기 및 읽기 전용 서비스_

:::note
1. 읽기 전용 서비스는 현재 사용자 관리 작업(생성, 삭제 등)을 허용합니다. 이 동작은 향후 변경될 수 있습니다.
2. 현재 새로 고칠 수 있는 물리화된 뷰는 읽기 전용 서비스를 포함한 웨어하우스의 모든 서비스에서 실행됩니다. 그러나 이 동작은 향후 변경될 것이며 RW 서비스에서만 실행될 것입니다.
:::

## 확장 {#scaling}

웨어하우스의 각 서비스는 다음과 관련하여 작업 부하에 맞게 조정할 수 있습니다:
- 노드(복제본) 수. 기본 서비스(웨어하우스에서 가장 먼저 생성된 서비스)는 2개 이상의 노드를 가져야 합니다. 각 보조 서비스는 1개 이상의 노드를 가질 수 있습니다.
- 노드(복제본)의 크기
- 서비스가 자동으로 확장되어야 하는지 여부
- 서비스가 비활성 시 유휴 상태여야 하는지 여부(그룹의 첫 번째 서비스에는 적용할 수 없습니다 - **제한 사항** 섹션을 참조하십시오)

## 동작의 변경 사항 {#changes-in-behavior}
서비스에 대해 compute-compute가 활성화되면(최소 하나의 보조 서비스가 생성됨), `clusterAllReplicas()` 함수 호출이 `default` 클러스터 이름으로 수행되면 호출된 서비스의 복제본만 활용됩니다. 즉, 동일한 데이터 세트에 연결된 두 개의 서비스가 있을 때, 서비스 1에서 `clusterAllReplicas(default, system, processes)`가 호출되면 서비스 1에서 실행 중인 프로세스만 표시됩니다. 필요하다면, 예를 들어 `clusterAllReplicas('all_groups.default', system, processes)`를 호출하여 모든 복제본에 접근할 수 있습니다.

## 제한 사항 {#limitations}

1. **기본 서비스는 항상 운영 중이어야 하며 유휴 상태가 될 수 없습니다(제한 사항은 GA 이후 일정 시간이 지나면 제거될 것입니다).** 비공식 미리보기 및 GA 이후 일정 시간 동안 기본 서비스(일반적으로 다른 서비스를 추가하여 확장하려는 기존 서비스)는 항상 운영 중이며 유휴 상태 설정이 비활성화됩니다. 하나의 보조 서비스가 있는 경우 기본 서비스를 중지하거나 유휴 상태로 만들 수 없습니다. 모든 보조 서비스가 제거되면 원본 서비스를 다시 중지하거나 유Idle 수 있습니다.

2. **때때로 작업 부하를 분리할 수 없습니다.** 데이터베이스 작업 부하를 서로 분리할 수 있는 옵션을 제공하는 것이 목표이지만, 한 서비스의 작업 부하가 동일한 데이터를 공유하는 다른 서비스에 영향을 미칠 수 있는 경우가 있을 수 있습니다. 이러한 경우는 주로 OLTP 유사 작업 부하와 관련된 드문 상황입니다.

3. **모든 읽기-쓰기 서비스가 백그라운드 병합 작업을 수행합니다.** ClickHouse에 데이터를 삽입할 때, 데이터베이스는 먼저 데이터를 일부 스테이징 파티션에 삽입하고, 이후 백그라운드에서 병합을 수행합니다. 이러한 병합은 메모리와 CPU 자원을 소모할 수 있습니다. 두 개의 읽기-쓰기 서비스가 동일한 저장소를 공유할 경우, 두 서비스 모두 백그라운드 작업을 수행하고 있습니다. 즉, Service 1에서 `INSERT` 쿼리가 있을 경우, 병합 작업은 Service 2에 의해 완료될 수 있습니다. 주의할 점은 읽기 전용 서비스는 백그라운드 병합을 수행하지 않으므로 이 작업에 자원을 소모하지 않습니다.

4. **모든 읽기-쓰기 서비스가 S3Queue 테이블 엔진 삽입 작업을 수행합니다.** RW 서비스에서 S3Queue 테이블을 생성할 때, 웨어하우스의 다른 모든 RW 서비스가 S3에서 데이터를 읽고 데이터베이스에 데이터를 쓸 수 있습니다.

5. **하나의 읽기-쓰기 서비스에 대한 삽입이 유휴 상태가 가능하도록 한 다른 읽기-쓰기 서비스의 유휴 상태를 방지할 수 있습니다.** 결과적으로 두 번째 서비스가 첫 번째 서비스의 백그라운드 병합 작업을 수행하게 됩니다. 이러한 백그라운드 작업은 두 번째 서비스가 유Idle 상태로 진입하는 것을 방지할 수 있습니다. 백그라운드 작업이 완료되면 해당 서비스는 유Idle 상태가 됩니다. 읽기 전용 서비스는 영향을 받지 않으며 지체 없이 유Idle 상태로 전환됩니다.

6. **CREATE/RENAME/DROP DATABASE 쿼리는 기본적으로 유Idle/중지된 서비스에 의해 차단될 수 있습니다.** 이러한 쿼리는 멈출 수 있습니다. 이를 우회하려면, 세션 또는 쿼리 수준에서 `settings distributed_ddl_task_timeout=0`로 데이터베이스 관리 쿼리를 실행할 수 있습니다. 예를 들어:

```sql
CREATE DATABASE db_test_ddl_single_query_setting
SETTINGS distributed_ddl_task_timeout=0
```

7. **현재 웨어하우스 당 서비스 수에 대한 소프트 한계가 5개입니다.** 단일 웨어하우스에 5개 이상의 서비스가 필요한 경우 지원 팀에 문의하십시오.

## 가격 책정 {#pricing}

웨어하우스의 모든 서비스(기본 및 보조)의 컴퓨팅 가격은 동일합니다. 저장소는 처음(원본) 서비스에서만 청구됩니다.

작업 부하 크기와 티어 선택에 따라 비용을 추정하는 데 도움이 되는 [가격 책정](https://clickhouse.com/pricing) 페이지의 가격 계산기를 참조하십시오.

## 백업 {#backups}

- 단일 웨어하우스의 모든 서비스가 동일한 저장소를 공유하므로 백업은 기본(초기) 서비스에서만 수행됩니다. 따라서 웨어하우스의 모든 서비스에 대한 데이터가 백업됩니다.
- 웨어하우스의 기본 서비스에서 백업을 복원하면 기존 웨어하우스에 연결되지 않은 완전히 새로운 서비스로 복원됩니다. 이후 복원이 완료된 직후에 새로운 서비스에 추가 서비스를 추가할 수 있습니다.

## 웨어하우스 사용하기 {#using-warehouses}

### 웨어하우스 생성하기 {#creating-a-warehouse}

웨어하우스를 생성하려면 기존 서비스와 데이터를 공유할 두 번째 서비스를 생성해야 합니다. 이는 기존 서비스 중 하나에서 더하기 기호를 클릭하여 수행할 수 있습니다:

<Image img={compute_7} size="md" alt="Creating a new service in a warehouse" border background='white' />

<br />

_Fig. 7 - 웨어하우스에 새로운 서비스를 만들기 위해 더하기 기호를 클릭합니다._

서비스 생성 화면에서 원본 서비스가 새로운 서비스의 데이터 출처로 드롭다운에서 선택됩니다. 생성된 후, 이 두 서비스는 웨어하우스를 형성하게 됩니다.

### 웨어하우스 이름 변경하기 {#renaming-a-warehouse}

웨어하우스의 이름을 변경하는 방법은 두 가지가 있습니다:

- 서비스 페이지의 오른쪽 상단에 있는 "웨어하우스별 정렬"을 선택한 다음, 웨어하우스 이름 근처의 연필 아이콘을 클릭합니다.
- 어떤 서비스의 웨어하우스 이름을 클릭하여 그곳에서 웨어하우스의 이름을 변경할 수 있습니다.

### 웨어하우스 삭제하기 {#deleting-a-warehouse}

웨어하우스를 삭제하는 것은 모든 컴퓨팅 서비스와 데이터(테이블, 뷰, 사용자 등)를 삭제하는 것을 의미합니다. 이 작업은 되돌릴 수 없습니다.
웨어하우스는 반드시 첫 번째로 생성된 서비스를 삭제하여야만 삭제할 수 있습니다. 이를 위해:

1. 최초로 생성된 서비스 이외에 생성된 모든 서비스를 삭제합니다;
2. 첫 번째 서비스를 삭제합니다 (경고: 이 단계에서 웨어하우스의 모든 데이터가 삭제됩니다).
