---
title: '웨어하우스'
slug: /cloud/reference/warehouses
keywords: ['컴퓨트 분리', '클라우드', '아키텍처', 'compute-compute', '웨어하우스', '웨어하우스', 'hydra']
description: 'ClickHouse Cloud의 컴퓨트-컴퓨트 분리'
doc_type: 'reference'
---

import compute_1 from '@site/static/images/cloud/reference/compute-compute-1.png';
import compute_2 from '@site/static/images/cloud/reference/compute-compute-2.png';
import compute_3 from '@site/static/images/cloud/reference/compute-compute-3.png';
import compute_4 from '@site/static/images/cloud/reference/compute-compute-4.png';
import compute_5 from '@site/static/images/cloud/reference/compute-compute-5.png';
import compute_7 from '@site/static/images/cloud/reference/compute-compute-7.png';
import compute_8 from '@site/static/images/cloud/reference/compute-compute-8.png';
import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';


# 웨어하우스 \{#warehouses\}

<ScalePlanFeatureBadge feature="컴퓨트-컴퓨트 분리" />

## 컴퓨트-컴퓨트 분리란 무엇인가요? \{#what-is-compute-compute-separation\}

컴퓨트-컴퓨트 분리가 무엇인지 설명하기 전에, ClickHouse Cloud에서 **서비스**가 무엇인지 이해하면 도움이 됩니다.

각 ClickHouse Cloud 서비스에는 다음이 포함됩니다:

* 전용 CPU 및 메모리 클러스터를 갖춘 ClickHouse 컴퓨트 노드(이를 **레플리카**라고 함)
* 서비스에 연결하기 위한 엔드포인트(또는 ClickHouse Cloud UI 콘솔을 통해 생성된 여러 엔드포인트)로, 로컬 및 서드파티 애플리케이션 연결에 사용됩니다(예: `https://dv2fzne24g.us-east-1.aws.clickhouse.cloud:8443`)
* 서비스가 모든 데이터와 메타데이터의 일부를 저장하는 객체 스토리지 폴더:

<Image img={compute_1} size="md" alt="ClickHouse Cloud의 단일 서비스" />

<br />

*그림 1 - ClickHouse Cloud의 단일 서비스*

단일 서비스를 사용하는 대신, 동일한 공유 스토리지에 접근할 수 있는 여러 서비스를 생성할 수 있으며, 이를 통해 데이터를 복제하지 않고도 특정 워크로드에 리소스를 전용으로 할당할 수 있습니다.
이 개념을 **컴퓨트-컴퓨트 분리**라고 합니다.

컴퓨트-컴퓨트 분리란 각 서비스가 자체 레플리카 집합과 엔드포인트를 가지면서도, 동일한 객체 스토리지 폴더를 사용하고 동일한 테이블, 뷰 등에 접근하는 것을 의미합니다.
즉, 워크로드에 맞는 적절한 크기의 컴퓨트를 선택할 수 있습니다. 일부 워크로드는 소형 레플리카 하나만으로도 충분할 수 있지만, 다른 워크로드는 완전한 고가용성(HA)과 여러 레플리카에서 수백 GB의 메모리를 필요로 할 수 있습니다.

컴퓨트-컴퓨트 분리를 사용하면 읽기 작업과 쓰기 작업을 분리하여 서로 간섭하지 않도록 할 수도 있습니다:

<Image img={compute_2} size="md" alt="ClickHouse Cloud의 컴퓨트 분리" />

<br />

*그림 2 - ClickHouse Cloud의 컴퓨트 분리*

## 웨어하우스란 무엇입니까? \{#what-is-a-warehouse\}

ClickHouse Cloud에서 &#95;웨어하우스(warehouse)&#95;는 동일한 데이터를 공유하는 **서비스** 집합입니다.
각 웨어하우스에는 기본 서비스(가장 먼저 생성된 서비스)와 하나 이상의 보조 서비스가 있습니다.
예를 들어, 아래 스크린샷에서는 두 개의 서비스로 구성된 「DWH Prod」 웨어하우스를 볼 수 있습니다:

* 기본 서비스 `DWH Prod`
* 보조 서비스 `DWH Prod Subservice`

<Image img={compute_8} size="lg" alt="기본 서비스와 보조 서비스를 포함한 웨어하우스 예시" background="white" />

<br />

*그림 3 - 웨어하우스 예시*

웨어하우스의 모든 서비스는 다음을 공유합니다:

* 리전(예: us-east1)
* Cloud 서비스 공급자(AWS, GCP 또는 Azure)
* ClickHouse 데이터베이스 버전
* ClickHouse Keeper(레플리카 관리용)

## 액세스 제어 \{#access-controls\}

### Database credentials \{#database-credentials\}

하나의 웨어하우스에 있는 모든 서비스는 동일한 테이블 집합을 공유하므로, 서비스 전반에 걸쳐 액세스 제어도 함께 공유됩니다.
즉, 서비스 1에서 생성된 모든 데이터베이스 사용자는 동일한 권한(테이블, 뷰 등에 대한 grant)으로 서비스 2도 사용할 수 있으며, 그 반대도 마찬가지입니다.
각 서비스마다 서로 다른 엔드포인트를 사용하지만, 모든 서비스에서 동일한 사용자 이름과 비밀번호를 사용합니다. 다시 말해, 아래 그림과 같이 **동일한 스토리지로 작업하는 서비스 간에는 사용자가 공유됩니다**:

<Image img={compute_3} size="md" alt="User access across services sharing same data" />

<br/>

_Fig. 4 - 사용자 Alice는 서비스 1에서 생성되었지만, 동일한 자격 증명을 사용해 동일한 데이터를 공유하는 모든 서비스에 액세스할 수 있습니다._

### Network access control \{#network-access-control\}

다른 애플리케이션이나 임시 사용자의 특정 서비스 접근을 제한하려면 네트워크 제한을 적용할 수 있습니다.
이렇게 하려면 ClickHouse Cloud 콘솔에서 접근을 제한하려는 해당 서비스의 서비스 탭에 있는 **Settings**로 이동하십시오.

IP 필터링 설정은 각 서비스에 개별적으로 적용할 수 있으므로 어떤 애플리케이션이 어떤 서비스에 접근할 수 있는지 제어할 수 있습니다.
이를 통해 사용자가 특정 서비스를 사용하지 못하도록 제한할 수 있습니다.

아래 예시에서 Alice는 웨어하우스의 서비스 2에 접근하지 못하도록 제한되어 있습니다:

<Image img={compute_4} size="md" alt="Network access control settings"/>

<br/>

_Fig. 5 - 네트워크 액세스 제어 설정으로 인해 Alice는 서비스 2에 접근할 수 없도록 제한되어 있습니다._

사용자가 _default_ 사용자가 아닌 개별 사용자로 연결하는 경우, 데이터에 대한 접근을 제어하기 위해 ClickHouse 역할(Role)과 권한(Grant)도 적용할 수 있습니다. 

### 읽기 전용 서비스와 읽기-쓰기 서비스 \{#read-vs-read-write\}

서비스는 다음 중 하나입니다:

* **read-write**
  * ClickHouse 데이터에 대해 읽기와 쓰기가 모두 가능합니다
  * 백그라운드 머지 작업(예: 데이터 삽입 후 파트 머지)을 수행하며, 이 작업은 CPU와 메모리를 사용합니다
  * 데이터를 외부로 내보낼 수 있습니다
* **read-only**
  * 데이터 읽기만 가능하며, ClickHouse의 데이터를 쓰거나 수정할 수 없습니다
  * 백그라운드 머지 작업을 수행하지 않으므로 리소스를 전부 읽기 쿼리에 사용할 수 있습니다
  * 여전히 데이터를 외부로 내보낼 수는 있지만(예: 테이블 함수를 통해), ClickHouse 내부 데이터는 변경할 수 없습니다
  * 백그라운드 머지로 인해 활성 상태가 유지될 수 있는 읽기-쓰기 서비스와 달리, 지연 없이 즉시 유휴 상태가 됩니다.

경우에 따라 중요한 읽기 워크로드를 쓰기/머지 오버헤드로부터 분리하기 위해 서비스를 읽기 전용으로 설정해야 할 수 있습니다.
이 설정은 두 번째 서비스와 이후에 생성하는 추가 서비스에 적용할 수 있지만, 아래 그림과 같이 첫 번째 서비스는 항상 읽기-쓰기입니다:

<Image img={compute_5} size="lg" alt="웨어하우스의 읽기-쓰기 및 읽기 전용 서비스" />

<br />

*그림 6 - 웨어하우스의 읽기-쓰기 및 읽기 전용 서비스*

:::note

1. 현재 읽기 전용 서비스는 사용자 관리 작업(CREATE, DROP 등)을 지원합니다.
2. [갱신 가능 구체화 뷰](/materialized-view/refreshable-materialized-view)는 웨어하우스의 읽기-쓰기(RW) 서비스에서만 실행됩니다.
   :::

## 스케일링 \{#scaling\}

웨어하우스의 각 서비스는 다음과 같은 측면에서 워크로드에 맞게 조정할 수 있습니다:

* 노드(레플리카) 수. 기본 서비스(해당 웨어하우스에서 가장 먼저 생성된 서비스)는 노드를 2개 이상으로 구성해야 합니다. 각 보조 서비스는 노드를 1개 이상 가질 수 있습니다.
* 노드(레플리카) 크기
* 서비스가 자동으로 스케일링되도록 할지 여부(수평 및 수직)
* 서비스가 비활성 상태일 때 유휴 상태로 전환되도록 할지 여부

자세한 내용은 [&quot;자동 스케일링&quot;](/manage/scaling) 페이지를 참조하십시오.

## Changes in `clusterAllReplicas` behavior \{#changes-in-behavior\}

웨어하우스에 여러 서비스가 있으면 `clusterAllReplicas()`의 동작이 변경됩니다.
`default` 클러스터 이름을 사용하면 웨어하우스의 모든 서비스가 아니라 현재 서비스 내의 레플리카만 대상으로 지정됩니다.

예를 들어, 서비스 1에서 `clusterAllReplicas(default, system, processes)`를 호출하면 서비스 1에서 실행 중인 프로세스만 반환됩니다.
웨어하우스의 모든 서비스에 걸쳐 쿼리하려면 대신 `all_groups.default` 클러스터 이름을 사용하십시오:

```sql
SELECT * FROM clusterAllReplicas('all_groups.default', system, processes)
```

:::note
보조 단일 노드 서비스는 수직 확장이 가능하지만, 기본 서비스인 단일 노드 서비스는 그렇지 않습니다.
:::

## 제한 사항 \{#limitations\}

### 워크로드 격리 제한 사항 \{#workload-isolation-limitations\}

일부 워크로드는 특정 서비스로 격리할 수 없습니다. 하나의 서비스에 있는 한 워크로드가 웨어하우스의 다른 서비스에 영향을 미치는 예외적인 경우가 있습니다. 여기에는 다음이 포함됩니다.

* **기본적으로 모든 읽기-쓰기 서비스는 백그라운드 병합(merge) 작업을 수행합니다.** ClickHouse에 데이터를 `INSERT`할 때 데이터베이스는 먼저 데이터를 일부 스테이징 파티션에 삽입한 후, 백그라운드에서 병합을 수행합니다. 이 병합 작업은 메모리와 CPU 리소스를 소비할 수 있습니다. 두 개의 읽기-쓰기 서비스가 동일한 스토리지를 공유하는 경우 두 서비스 모두 백그라운드 작업을 수행합니다. 이는 Service 1에서 `INSERT` 쿼리가 실행되었지만, 실제 병합 작업은 Service 2에서 완료되는 상황이 발생할 수 있음을 의미합니다.
  읽기 전용 서비스는 백그라운드 병합을 수행하지 않으므로, 이 작업에 리소스를 사용하지 않는다는 점에 유의하십시오. 지원 팀을 통해 서비스에서 병합을 비활성화할 수 있습니다.

* **모든 읽기-쓰기 서비스는 S3Queue 테이블 엔진 삽입 작업을 수행합니다.** 읽기/쓰기 서비스에서 S3Queue 테이블을 생성하면, 웨어하우스의 다른 모든 읽기/쓰기 서비스도 S3에서 데이터를 읽어 데이터베이스에 쓰기를 수행할 수 있습니다.

* **한 읽기-쓰기 서비스에서의 삽입 작업이, 유휴 기능이 활성화된 경우 다른 읽기-쓰기 서비스의 유휴 상태 전환을 방해할 수 있습니다.** 다음과 같은 상황이 있을 수 있습니다.
  한 서비스가 다른 서비스를 대신해 백그라운드 병합 작업을 수행합니다. 이러한 백그라운드 작업은 두 번째 서비스가 유휴 상태로 전환되는 것을 막을 수 있습니다. 백그라운드 작업이 모두 완료되면 서비스는 유휴 상태가 됩니다. 읽기 전용 서비스는 영향을 받지 않습니다.

### 유용한 참고 사항 \{#callouts\}

* **ClickHouse 버전**: [업그레이드 일정](/manage/updates)은 기본 서비스의 설정에 따라 결정됩니다. 보조 서비스는 기본 서비스와 별개의 릴리스 일정을 가질 수 없습니다.

* **기본적으로 `CREATE`/`RENAME`/`DROP DATABASE` 쿼리는 유휴 상태이거나 중지된 서비스로 인해 차단될 수 있습니다.** 서비스가 유휴 상태이거나 중지된 동안 이러한 쿼리를 실행하면 응답 없이 대기 상태로 멈출 수 있습니다. 이를 우회하려면 세션 수준 또는 개별 쿼리 수준에서 [`settings distributed_ddl_task_timeout=0`](/operations/settings/settings#distributed_ddl_task_timeout)을 사용해 데이터베이스 관리 쿼리를 실행할 수 있습니다.

예시:

```sql
CREATE DATABASE db_test_ddl_single_query_setting
SETTINGS distributed_ddl_task_timeout=0
```

서비스를 수동으로 중지한 경우, 쿼리가 실행되려면 해당 서비스를 다시 시작해야 합니다.

* **현재 웨어하우스당 서비스는 5개까지 소프트 제한이 있습니다.** 단일 웨어하우스에서 5개를 초과하는 서비스가 필요한 경우 지원 팀에 문의하십시오.
* **기본 서비스는 레플리카를 1개만 둘 수 없습니다** 보조 서비스는 레플리카를 1개로 구성할 수 있지만, 기본 서비스는 최소 2개의 레플리카가 있어야 합니다.
* **기본 서비스 유휴 상태 전환** 현재 기본 동작에서는 기본 서비스가 자동으로 유휴 상태 전환될 수 없습니다. 보조 서비스가 생성되면 이 기능은 비활성화됩니다. 이를 활성화하려면 지원 팀에 문의하여 상위 서비스 유휴 상태 전환 기능을 활성화하십시오. 상위 서비스 자동 유휴 상태 전환는 2026년 2분기에 기본적으로 활성화될 예정입니다(기존 서비스도 이 기능을 사용할 수 있게 되며, 새 서비스에서는 기본적으로 활성화됩니다). 

## 요금제 \{#pricing\}

컴퓨트 요금은 웨어하우스의 모든 서비스(기본 및 보조)에 동일하게 적용됩니다. 스토리지는 한 번만 청구되며, 최초(원본) 서비스에 포함됩니다.

워크로드 규모와 선택한 티어에 따라 비용을 추정하는 데 도움이 되는 요금 계산기는 [요금제](https://clickhouse.com/pricing) 페이지를 참조하십시오. Usage Breakdown 표에는 서비스 전반에 걸친 컴퓨트 비용 내역이 표시됩니다. 

## 백업 \{#backups\}

- 단일 웨어하우스의 모든 서비스는 동일한 스토리지를 공유하므로, 백업은 기본(초기) 서비스에서만 수행합니다. 이에 따라 해당 웨어하우스의 모든 서비스 데이터가 백업됩니다.
- 웨어하우스의 기본 서비스에서 생성한 백업을 복원하면, 기존 웨어하우스와 연결되지 않은 완전히 새로운 서비스로 복원됩니다. 그런 다음 복원이 완료되는 대로 새 서비스에 다른 서비스를 바로 추가할 수 있습니다.

## 웨어하우스 설정 방법 \{#setup-warehouses\}

### 웨어하우스 생성 \{#creating-a-warehouse\}

웨어하우스를 생성하려면 기존 서비스와 데이터를 공유할 두 번째 서비스를 생성해야 합니다. 이는 기존 서비스 중 하나에서 플러스 아이콘을 클릭하여 수행할 수 있습니다:

<Image img={compute_7} size="md" alt="웨어하우스에서 새 서비스 생성" />

<br />

*그림 7 - 웨어하우스에서 새 서비스를 생성하려면 플러스 아이콘을 클릭합니다*

서비스 생성 화면에서는 새 서비스의 데이터 소스로 드롭다운에서 원래 서비스가 선택되어 있습니다. 생성이 완료되면 이 두 서비스가 하나의 웨어하우스를 구성합니다.

### 웨어하우스 이름 변경 \{#renaming-a-warehouse\}

웨어하우스 이름을 변경하는 방법은 두 가지입니다.

- 서비스 페이지 오른쪽 상단에서 「Sort by warehouse」를 선택한 다음, 웨어하우스 이름 옆의 연필 아이콘을 클릭합니다.
- 어떤 서비스에서든 웨어하우스 이름을 클릭한 후, 해당 화면에서 웨어하우스 이름을 변경합니다.

### 웨어하우스 삭제 \{#deleting-a-warehouse\}

웨어하우스를 삭제하면 모든 컴퓨트 서비스와 데이터(테이블, 뷰, 사용자 등)가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
웨어하우스는 처음 생성된 서비스를 삭제해야만 삭제할 수 있습니다. 다음 순서대로 진행하십시오:

1. 처음 생성된 서비스를 제외하고 추가로 생성된 모든 서비스를 삭제합니다.
2. 처음 생성된 서비스를 삭제합니다(경고: 이 단계에서 웨어하우스의 모든 데이터가 삭제됩니다).