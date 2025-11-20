---
'sidebar_label': '아키텍처'
'slug': '/cloud/reference/architecture'
'title': 'ClickHouse Cloud 아키텍처'
'description': '이 페이지는 ClickHouse Cloud의 아키텍처를 설명합니다.'
'keywords':
- 'ClickHouse Cloud'
- 'cloud architecture'
- 'separation of storage and compute'
'doc_type': 'reference'
---

import Image from '@theme/IdealImage';
import Architecture from '@site/static/images/cloud/reference/architecture.png';


# ClickHouse Cloud 아키텍처

<Image img={Architecture} size='lg' alt='Cloud architecture'/>

## 객체 저장소 기반 스토리지 {#storage-backed-by-object-store}
- 사실상 무제한 스토리지
- 데이터를 수동으로 공유할 필요 없음
- 특히 자주 액세스되지 않는 데이터를 저장하는 경우 주요 가격 인하

## 컴퓨트 {#compute}
- 자동 스케일링 및 유휴 상태: 처음부터 크기를 정할 필요가 없고, 피크 사용을 위해 과도하게 할당할 필요 없음
- 자동 유휴 및 재개: 아무도 사용하지 않을 때 사용하지 않는 컴퓨트를 실행할 필요 없음
- 기본적으로 안전하고 고가용성 확보

## 관리 {#administration}
- 설정, 모니터링, 백업 및 청구가 자동으로 수행됨.
- 비용 제어가 기본적으로 활성화되며, Cloud 콘솔을 통해 조정 가능.

## 서비스 격리 {#service-isolation}

### 네트워크 격리 {#network-isolation}

모든 서비스는 네트워크 계층에서 격리되어 있음.

### 컴퓨트 격리 {#compute-isolation}

모든 서비스는 각각의 Kubernetes 공간에 별도의 파드로 배포되며, 네트워크 수준에서 격리되어 있음.

### 스토리지 격리 {#storage-isolation}

모든 서비스는 공유 버킷 (AWS, GCP) 또는 저장소 컨테이너 (Azure)의 별도의 하위 경로를 사용함.

AWS의 경우, 스토리지 접근은 AWS IAM을 통해 제어되며, 각 IAM 역할은 서비스마다 고유함. 엔터프라이즈 서비스의 경우, [CMEK](/cloud/security/cmek)를 활성화하여 저장 시 고급 데이터 격리를 제공할 수 있음. CMEK는 현재 AWS 서비스에 대해서만 지원됨.

GCP 및 Azure의 경우, 서비스는 객체 스토리지 격리 기능을 가지고 있음 (모든 서비스는 자체 버킷 또는 저장소 컨테이너 보유).

## 컴퓨트-컴퓨트 분리 {#compute-compute-separation}
[컴퓨트-컴퓨트 분리](/cloud/reference/warehouses)를 통해 사용자는 각자 서비스 URL을 가진 여러 컴퓨트 노드 그룹을 생성할 수 있으며, 모든 그룹은 동일한 공유 객체 스토리지를 사용함. 이는 동일한 데이터를 공유하면서 쓰기에서 읽기에 대한 다양한 사용 사례의 컴퓨트 격리를 가능하게 함. 또한, 필요한 만큼 컴퓨트 그룹의 독립적인 스케일링을 허용하여 자원 활용을 보다 효율적으로 만듦.

## 동시성 한도 {#concurrency-limits}

귀하의 ClickHouse Cloud 서비스에서 초당 쿼리 수(QPS)의 제한은 없음. 그러나 복제본 당 1000개의 동시 쿼리 한도가 존재함. QPS는 궁극적으로 평균 쿼리 실행 시간과 귀하의 서비스 내 복제본 수의 함수임.

자체 관리 ClickHouse 인스턴스나 다른 데이터베이스/데이터 웨어하우스와 비교할 때 ClickHouse Cloud의 주요 장점은 [복제본 추가 (수평 스케일링)](/manage/scaling#manual-horizontal-scaling)을 통해 동시성을 쉽게 증가시킬 수 있다는 점임.
