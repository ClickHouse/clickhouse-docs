---
sidebar_position: 1
sidebar_label: 'Make Before Break (MBB)'
slug: /cloud/features/mbb
description: 'ClickHouse Cloud에서 Make Before Break (MBB) 동작 방식을 설명하는 페이지'
keywords: ['Make Before Break', 'MBB', 'Scaling', 'ClickHouse Cloud']
title: 'ClickHouse Cloud에서의 Make Before Break (MBB) 동작 방식'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import mbb_diagram from '@site/static/images/cloud/features/mbb/vertical_scaling.png';

ClickHouse Cloud는 클러스터 업그레이드와 클러스터 스케일링을 수행할 때 **Make Before Break**(MBB) 방식을 사용합니다.
이 방식에서는 기존 레플리카를 제거하기 전에 새로운 레플리카를 클러스터에 먼저 추가합니다.
이는 기존 레플리카를 먼저 제거한 뒤 새로운 레플리카를 추가하는 break-first 방식과는 반대입니다.

MBB 방식에는 여러 가지 장점이 있습니다:

* 용량이 제거되기 전에 클러스터에 먼저 추가되므로, break-first 방식과 달리 **전체 클러스터 용량이 감소하지 않습니다**. 물론 클라우드 환경에서는 노드나 디스크 장애와 같은 예기치 않은 이벤트가 여전히 발생할 수 있습니다.
* 이 방식은 클러스터에 부하가 많이 걸린 상황에서 특히 유용하며, break-first 방식에서 발생할 수 있는 것처럼 **기존 레플리카가 과부하 상태가 되는 것을 방지**합니다.
* 레플리카를 먼저 제거하기를 기다릴 필요 없이 빠르게 추가할 수 있으므로, 이 방식은 **더 빠르고, 더 즉각적인** 스케일링 경험을 제공합니다.

아래 이미지는 3개의 레플리카를 가진 클러스터에서 서비스가 수직으로 스케일링되는 경우를 보여줍니다:

<Image img={mbb_diagram} size="lg" alt="3개의 레플리카를 가진 클러스터가 수직으로 스케일링되는 예시 다이어그램" />

전반적으로, MBB는 이전에 사용되던 break-first 방식과 비교했을 때, 더 매끄럽고 중단이 적은 스케일링 및 업그레이드 경험을 제공합니다.

MBB와 관련하여 인지해야 할 몇 가지 주요 동작이 있습니다:

1. MBB 작업은 현재 레플리카에서 실행 중인 워크로드가 종료된 후에 해당 레플리카를 종료합니다.
   이 대기 시간은 현재 1시간으로 설정되어 있으며, 이는 스케일링이나 업그레이드 시 레플리카에서 실행 중인 장기 쿼리가 종료될 때까지 레플리카가 제거되기 전에 최대 1시간까지 기다릴 수 있음을 의미합니다.
   또한 레플리카에서 백업 프로세스가 실행 중인 경우, 레플리카가 종료되기 전에 백업이 완료되도록 기다립니다.
2. 레플리카가 종료되기 전에 대기 시간이 존재하므로, 클러스터에 설정된 최대 레플리카 수를 초과하는 상황이 발생할 수 있습니다.
   예를 들어, 총 6개의 레플리카를 갖는 서비스가 있을 때, MBB 작업이 진행 중이면 기존 레플리카가 여전히 쿼리를 처리하는 동안 클러스터에 3개의 레플리카가 추가되어 총 9개의 레플리카가 될 수 있습니다.
   이는 일정 기간 동안 클러스터가 원하는 레플리카 수보다 더 많은 레플리카를 가지게 됨을 의미합니다.
   또한 여러 MBB 작업이 서로 겹치면서 레플리카가 누적될 수 있습니다. 예를 들어, 여러 건의 수직 스케일링 요청이 API를 통해 클러스터로 전송되는 시나리오에서 이런 일이 발생할 수 있습니다.
   ClickHouse Cloud에는 클러스터에 누적될 수 있는 레플리카 수를 제한하기 위한 검증 메커니즘이 포함되어 있습니다.
3. MBB 작업에서는 system 테이블 데이터가 30일 동안 유지됩니다. 이는 클러스터에서 MBB 작업이 발생할 때마다, 이전 레플리카에서 새 레플리카로 30일치 system 테이블 데이터가 복제된다는 의미입니다.

MBB 작업의 동작 메커니즘에 대해 더 자세히 알고 싶다면, ClickHouse 엔지니어링 팀에서 작성한 [블로그 게시물](https://clickhouse.com/blog/make-before-break-faster-scaling-mechanics-for-clickhouse-cloud)을 참고하십시오.
