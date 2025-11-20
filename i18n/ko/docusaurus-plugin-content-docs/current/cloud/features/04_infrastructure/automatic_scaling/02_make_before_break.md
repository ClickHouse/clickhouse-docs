---
'sidebar_position': 1
'sidebar_label': 'Make Before Break (MBB)'
'slug': '/cloud/features/mbb'
'description': 'ClickHouse Cloud에서의 Make Before Break (MBB) 작업을 설명하는 페이지'
'keywords':
- 'Make Before Break'
- 'MBB'
- 'Scaling'
- 'ClickHouse Cloud'
'title': 'ClickHouse Cloud에서의 Make Before Break (MBB) 작업'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import mbb_diagram from '@site/static/images/cloud/features/mbb/vertical_scaling.png';

ClickHouse Cloud는 **Make Before Break** (MBB) 접근 방식을 사용하여 클러스터 업그레이드 및 클러스터 확장을 수행합니다.  
이 접근 방식에서는 기존 복제본을 제거하기 전에 클러스터에 새 복제본을 추가합니다.  
이는 이전 복제본을 먼저 제거한 후 새 복제본을 추가하는 break-first 접근 방식과 대비됩니다.

MBB 접근 방식에는 여러 가지 이점이 있습니다:
* 기존 복제본을 제거하기 전에 용량이 클러스터에 추가되므로, **전체 클러스터 용량이 감소하지 않습니다**. 물론 노드나 디스크 장애와 같은 예기치 않은 사건은 클라우드 환경에서 여전히 발생할 수 있습니다.
* 이 접근 방식은 클러스터가 과중한 부하를 겪고 있는 상황에서 **기존 복제본이 과부하에 걸리는 것을 방지**하기 때문에 특히 유용합니다.
* 복제본을 먼저 제거할 필요 없이 신속하게 추가할 수 있기 때문에, 이 접근 방식은 **더 빠르고, 더 반응적인** 확장 경험으로 이어집니다.

아래 이미지는 서비스가 수직 확장되는 3개의 복제본을 가진 클러스터에서 이러한 일이 어떻게 발생할 수 있는지를 보여줍니다:

<Image img={mbb_diagram} size="lg" alt="3개의 복제본이 수직으로 확장되는 클러스터의 예시 다이어그램" />

전반적으로 MBB는 이전에 사용된 break-first 접근 방식에 비해 원활하고 덜 방해되는 확장 및 업그레이드 경험을 제공합니다.

MBB와 관련하여 사용자들이 알아야 할 주요 행동이 몇 가지 있습니다:

1. MBB 작업은 현재 복제본에서 기존 작업이 완료될 때까지 기다립니다.  
   이 기간은 현재 1시간으로 설정되어 있으며, 즉 복제본이 제거되기 전에 장기 실행 쿼리에 대해 확장 또는 업그레이드가 최대 1시간까지 대기할 수 있음을 의미합니다.  
   또한, 복제본에서 백업 프로세스가 실행 중인 경우 복제본이 종료되기 전에 해당 프로세스가 완료됩니다.
2. 복제본이 종료되기 전에 대기 시간이 있기 때문에, 클러스터가 설정된 최대 복제본 수보다 더 많은 복제본을 가질 수 있는 상황이 발생할 수 있습니다.  
   예를 들어, 서비스에 총 6개의 복제본이 있다고 가정할 때, MBB 작업이 진행 중일 때 3개의 추가 복제본이 클러스터에 추가되어 총 9개의 복제본이 생길 수 있으며, 이전 복제본이 여전히 쿼리를 처리하고 있습니다.  
   이는 클러스터가 원하는 복제본 수보다 한동안 더 많은 복제본을 가진다는 것을 의미합니다.  
   또한, 여러 MBB 작업이 동시에 겹칠 수 있어 복제본 축적이 발생할 수 있습니다. 이는 API를 통해 클러스터에 여러 개의 수직 확장 요청이 전송되는 시나리오에서 발생할 수 있습니다.  
   ClickHouse Cloud는 클러스터가 축적할 수 있는 복제본 수를 제한하기 위한 검사를 시행하고 있습니다.
3. MBB 작업에서는 시스템 테이블 데이터가 30일 동안 유지됩니다. 이는 클러스터에서 MBB 작업이 발생할 때마다 30일 분량의 시스템 테이블 데이터가 이전 복제본에서 새 복제본으로 복제된다는 것을 의미합니다.

MBB 작업의 메커니즘에 대해 더 알아보려면, ClickHouse 엔지니어링 팀의 [블로그 포스트](https://clickhouse.com/blog/make-before-break-faster-scaling-mechanics-for-clickhouse-cloud)를 참조하십시오.
