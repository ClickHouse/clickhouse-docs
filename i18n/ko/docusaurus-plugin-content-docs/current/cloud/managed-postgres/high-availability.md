---
slug: /cloud/managed-postgres/high-availability
sidebar_label: '고가용성'
title: '고가용성'
description: 'ClickHouse Managed Postgres에서 고가용성을 위해 스탠바이 레플리카와 복제 모드를 구성합니다'
keywords: ['high availability', 'ha', 'standby', 'replication', 'failover', 'postgres ha']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="high-availability" />

Managed Postgres는 내구성과 성능 요구사항에 맞출 수 있도록 다양한 수준의 고가용성을 제공합니다. 데이터베이스를 프로비저닝할 때 하나 또는 두 개의 대기 레플리카를 추가할 수 있으며, 필요에 따라 나중에 **Settings** 페이지에서 이 구성을 조정할 수도 있습니다.

{/* TODO(kaushik-ubi): 고가용성 구성 화면 스크린샷
    Path: /static/images/cloud/managed-postgres/high-availability-config.png */}


## 고가용성 옵션 \{#high-availability-options\}

### 2개 스탠바이 \{#two-standbys\}

2개의 스탠바이를 사용할 때는 기본 노드(primary)와 함께 2개의 레플리카 노드가 프로비저닝됩니다. 두 스탠바이는 모두 기본 노드와 동일한 크기이며, 기본 노드에 장애가 발생하면 어느 쪽이든 역할을 넘겨받을 수 있습니다.

이 구성은 **동기식 복제(synchronous replication)** 를 사용하며, 기본 노드는 쓰기를 확정하기 전에 최소 1개의 스탠바이로부터 확인 응답을 기다립니다. 이는 비동기식 복제(asynchronous replication)보다 더 강한 내구성(durability) 보장을 제공합니다. 두 스탠바이 모두의 확인 응답이 아니라 하나의 확인 응답만 필요하므로, 단일 스탠바이와 함께 사용하는 동기식 복제에 비해 성능 영향은 더 적습니다.

### 1 Standby \{#one-standby\}

Standby가 1개인 경우 primary와 함께 레플리카 노드가 프로비저닝됩니다. Standby는 primary와 동일한 크기이며, primary에 장애가 발생하면 이를 대신할 수 있습니다.

데이터는 **비동기 복제(asynchronous replication)** 를 사용하여 standby로 복제됩니다. 이는 쓰기 작업이 standby의 승인(acknowledgement)을 기다리지 않고 primary에 커밋된다는 의미입니다. 비동기 복제를 사용하면 추가 네트워크 지연으로 인해 고가용성 구성이 쓰기 작업을 느려지지 않도록 할 수 있습니다. 그러나 이는 primary 장애가 발생하는 시점에 standby가 가장 최신 트랜잭션을 아직 받지 못했을 수 있다는 의미이기도 합니다. 대부분의 애플리케이션에서는 성능과, 아주 최근의 일부 쓰기 작업을 잃을 수 있는 작은 위험 사이의 이러한 절충이 충분히 가치가 있습니다. 쓰기 내구성이 반드시 보장되어야 하는 경우 Standby 2개 구성을 선택하는 것이 좋습니다.

### No Standby \{#no-standby\}

이 옵션을 사용하면 선택한 크기에 해당하는 기본 노드(primary node)만 프로비저닝됩니다. Standby 노드는 생성되지 않습니다. 기본 노드는 장애 발생 여부가 계속 모니터링되지만, 레플리카가 즉시 대체할 준비가 되어 있지 않으므로 문제의 성격에 따라 복구에 더 오랜 시간이 걸릴 수 있습니다. 이 구성은 어느 정도의 다운타임이 허용되는 개발 환경, 테스트, 또는 중요도가 낮은 워크로드에 가장 적합합니다.

## 스탠바이 vs 읽기 레플리카 \{#standbys-vs-read-replicas\}

스탠바이와 읽기 레플리카는 Managed Postgres에서 서로 다른 목적을 가지며 별도로 구성됩니다.

**스탠바이(standby)**는 고가용성과 자동 장애 조치에만 전용됩니다. 스트리밍 복제(streaming replication)를 사용하여 프라이머리에서 데이터를 복제하며, 프라이머리에 장애가 발생했을 때 승격될 준비가 항상 되어 있습니다. 스탠바이는 읽기 쿼리를 위해 제공되지 않습니다.

**읽기 레플리카(read replica)**는 읽기 확장을 위해 설계되었습니다. 객체 스토리지에서 WAL(Write-Ahead Log) 데이터를 가져오며, 자체 연결 엔드포인트를 가진 별도의 네트워크 환경에서 실행됩니다. 읽기 레플리카를 사용하면 HA 보장에 영향을 주지 않고 프라이머리에서 읽기 트래픽을 분산할 수 있습니다.

### 왜 스탠바이가 읽기 쿼리를 처리하지 않는지 \{#why-standbys-dont-serve-read-queries\}

일부 데이터베이스 제공자는 읽기 전용 쿼리를 위해 hot standby를 제공하지만, Managed Postgres는 의도적으로 그렇게 하지 않습니다. 스탠바이에서 읽기 쿼리를 허용하면, 기본(primary)에 장애가 발생했을 때 즉시 역할을 넘겨받을 수 있도록 준비하는 본래 목적이 훼손될 수 있습니다.

주요 우려 사항은 두 가지입니다.

1. **WAL 재생 경쟁**: 쓰기 부하가 큰 워크로드에서는 스탠바이에서의 읽기 쿼리가 시스템 리소스를 두고 WAL 재생과 경쟁합니다. 이 경쟁으로 인해 복제(replication) 지연이 커질 수 있으며, 이는 스탠바이가 기본(primary)을 따라가지 못한다는 의미입니다. 스탠바이가 지연된 상태에서 페일오버가 발생하면 최신 데이터를 가지고 있지 않게 되고, 문제 없이 역할을 넘겨받을 수 없을 수도 있습니다.

2. **VACUUM 간섭**: 스탠바이에서 오래 실행되는 읽기 쿼리는 기본(primary)에서 `VACUUM`(및 `AUTOVACUUM`)이 삭제된 튜플(dead tuple)을 정리하는 것을 막을 수 있습니다. PostgreSQL은 어떤 레플리카에서든 활성 쿼리가 여전히 접근해야 할 수도 있는 행(row)을 제거할 수 없습니다. 이로 인해 시간이 지남에 따라 테이블 팽창(table bloat)과 성능 저하가 발생할 수 있습니다.

스탠바이를 페일오버 전용으로 유지함으로써 Managed Postgres는 스탠바이가 항상 동기화 상태를 유지하며, 최소한의 데이터 손실과 다운타임으로 역할을 넘겨받을 준비가 되도록 합니다. 읽기 확장을 위해서는 [read replicas](/cloud/managed-postgres/read-replicas)를 대신 사용하십시오.

## 장애 처리 \{#handling-failures\}

모든 Managed Postgres 인스턴스는 고가용성 활성화 여부와 관계없이 장애 발생 여부를 지속적으로 모니터링합니다. 모든 상황에서 시스템은 장애로부터 자동 복구를 시도합니다.

스탠바이 노드가 있는 경우 자동 복구가 더 빠르고 단순합니다. 시스템은 일반적으로 스탠바이 노드를 프라이머리로 승격하여 몇 분 이내에 복구합니다. 스탠바이 노드가 없으면 복구에 수동 개입이 필요할 수 있으며, 이로 인해 중단 시간이 크게 늘어날 수 있습니다.