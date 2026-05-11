---
slug: /cloud/managed-postgres/read-replicas
sidebar_label: '읽기 레플리카'
title: '읽기 레플리카'
description: '읽기 레플리카를 사용하여 ClickHouse Managed Postgres에서 읽기 중심 워크로드를 확장합니다'
keywords: ['읽기 레플리카', '확장성', '읽기 확장', 'Postgres 레플리카', '수평 확장']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import warehouseView from '@site/static/images/managed-postgres/warehouse-view.png';
import readReplicaDialog from '@site/static/images/managed-postgres/read-replica-dialog.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="read-replicas" />

읽기 레플리카를 사용하면 기본 Managed Postgres 데이터베이스의 하나 이상의 복사본을 생성할 수 있습니다. 이러한 레플리카는 PostgreSQL의 네이티브 복제 기능을 사용하여 기본 데이터베이스를 지속적으로 따라가며 변경 사항과 동기화됩니다.

읽기 레플리카를 관리하려면 웨어하우스에서 편집 아이콘을 클릭하십시오.

<Image img={warehouseView} alt="편집 아이콘이 있는 웨어하우스 화면" size="md" border />

그러면 웨어하우스 대화 상자가 열리며, 여기에서 기존 서비스를 확인하고 새로운 읽기 레플리카를 생성할 수 있습니다.

<Image img={readReplicaDialog} alt="읽기 레플리카 관리 대화 상자" size="md" border />


## 읽기 전용 레플리카를 사용하는 이유 \{#why-use-read-replicas\}

### 확장성 \{#scalability\}

읽기 레플리카를 사용하면 읽기 중심 워크로드를 여러 전용 인스턴스로 분산하여 데이터베이스를 수평으로 확장할 수 있습니다. 이는 보고용 쿼리, 분석 처리, 실시간 대시보드와 같이, 그렇지 않으면 운영 트래픽과 리소스를 두고 경쟁하게 될 작업에 특히 유용합니다.

### 격리 \{#isolation\}

분석 및 비즈니스 인텔리전스 쿼리를 읽기용 레플리카로 보내면, 기본 인스턴스는 쓰기 작업과 중요한 트랜잭션 워크로드에 집중하여 신속하게 응답할 수 있습니다. 이러한 분리는 전체 시스템 성능과 예측 가능성을 향상시킵니다. 또한 분석 또는 보고 도구에 쓰기 권한을 부여할 필요가 없다는 의미이기도 합니다. 이러한 도구는 레플리카를 대상으로 안전하게 동작하므로, 실수로 데이터를 변경할 위험이 없습니다.

### 비즈니스 연속성 \{#business-continuity\}

읽기 레플리카는 재해 복구 전략에서 핵심적인 역할을 할 수 있습니다. 기본 데이터베이스에 장애가 발생하면 읽기 레플리카를 기본(primary)으로 승격하여 다운타임과 데이터 손실을 최소화할 수 있습니다. 이는 고가용성 스탠바이 구성 외에 추가적인 복원력 계층을 제공합니다.

## 읽기 레플리카의 동작 방식 \{#how-read-replicas-work\}

Managed Postgres의 읽기 레플리카는 스트리밍 복제가 아니라 WAL 배송(WAL shipping) 아키텍처를 사용합니다. 이러한 설계는 기본(primary) 데이터베이스에 미치는 영향을 최소화하는 데 중점을 둡니다.

### 객체 스토리지 기반 WAL 전달 \{#wal-shipping-from-object-storage\}

기본(primary) 데이터베이스가 트랜잭션을 처리할 때 사전 기록 로그(Write-Ahead Log, WAL) 레코드를 생성합니다. 이러한 WAL 세그먼트는 지속적으로 아카이브되어 객체 스토리지(S3)에 저장됩니다. 읽기 레플리카는 기본 데이터베이스와 동기화를 유지하기 위해 객체 스토리지에서 이러한 WAL 세그먼트를 가져와 재적용합니다.

이 아키텍처는 기본 데이터베이스에 직접 연결해 스트리밍 복제(streaming replication)를 사용하는 [고가용성 대기 서버](/cloud/managed-postgres/high-availability)와는 다릅니다.

### 이 방식을 선택한 이유 \{#why-we-chose-this-approach\}

읽기 레플리카를 기본 데이터베이스에 스트리밍 스탠바이로 직접 연결하는 대신, 객체 스토리지에 저장된 WAL을 사용하도록 의도적으로 설계했습니다. 이 방식은 읽기 레플리카와 기본 데이터베이스 간에 완전한 격리를 제공합니다:

- **기본 데이터베이스에 대한 복제 오버헤드 없음**: 읽기 레플리카는 기본 데이터베이스에 대한 스트리밍 연결을 유지하지 않으므로, 미션 크리티컬 워크로드에 CPU, 메모리, 네트워크 부하를 추가하지 않습니다.
- **독립적인 스케일링**: 기본 데이터베이스 성능에 영향을 주지 않고 읽기 레플리카를 추가하거나 제거할 수 있습니다.
- **네트워크 격리**: 읽기 레플리카는 별도의 연결 엔드포인트를 가진 고유한 네트워크 환경에서 동작합니다.

### 복제 지연 특성 \{#replication-lag-characteristics\}

이 아키텍처의 절충점은 복제 지연입니다. WAL 세그먼트는 기본(primary)에서 정기적으로 아카이브되며, 일반적으로 60초마다 또는 세그먼트가 가득 찼을 때(둘 중 먼저 발생하는 시점)에 수행됩니다. 따라서 일반적인 조건에서는 읽기 레플리카가 기본(primary)보다 최대 수십 초 정도 뒤처질 수 있습니다.

대부분의 읽기 확장(read scaling) 사용 사례(리포팅, 분석, 대시보드)에서는 이러한 지연이 허용 가능한 수준입니다. 애플리케이션에서 거의 실시간에 가까운 읽기가 필요하다면, 쿼리를 기본(primary)로 보내는 구성이 가능한지, 또는 이 시간 범위 내에서의 최종 일관성(eventual consistency)으로도 요구 사항을 충족할 수 있는지 검토하십시오.