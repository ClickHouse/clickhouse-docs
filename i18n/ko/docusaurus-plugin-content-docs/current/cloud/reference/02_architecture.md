---
sidebar_label: '아키텍처'
slug: /cloud/reference/architecture
title: 'ClickHouse Cloud 아키텍처'
description: '이 페이지에서는 ClickHouse Cloud의 아키텍처를 설명합니다'
keywords: ['ClickHouse Cloud', 'cloud architecture', 'separation of storage and compute']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import Architecture from '@site/static/images/cloud/reference/architecture.png';


# ClickHouse Cloud 아키텍처 \{#clickhouse-cloud-architecture\}

<Image img={Architecture} size='lg' alt='Cloud 아키텍처'/>

## 오브젝트 스토어 기반 스토리지 \{#storage-backed-by-object-store\}

- 사실상 무제한에 가까운 스토리지 용량
- 데이터를 수동으로 복제하거나 공유할 필요가 없음
- 특히 접근 빈도가 낮은 데이터를 저장할 때 데이터 보관 비용이 크게 절감됨

## 컴퓨트 \{#compute\}

- 자동 확장 및 유휴 상태 전환: 사전 용량 산정이 필요 없으며, 최대 사용량에 대비해 과도하게 프로비저닝할 필요가 없습니다
- 자동 유휴 전환 및 재개: 사용자가 없을 때 컴퓨트 리소스를 실행 상태로 계속 유지할 필요가 없습니다
- 기본적으로 보안 및 고가용성이 보장됩니다

## 관리 \{#administration\}

- 설정, 모니터링, 백업 및 청구 작업이 자동으로 처리됩니다.
- 비용 관리는 기본적으로 활성화되어 있으며 Cloud 콘솔에서 조정할 수 있습니다.

## 서비스 격리 \{#service-isolation\}

### 네트워크 격리 \{#network-isolation\}

모든 서비스는 네트워크 계층에서 서로 격리되어 있습니다.

### Compute isolation \{#compute-isolation\}

모든 서비스는 각자의 Kubernetes 네임스페이스 내에서 별도의 파드로 배포되며, 네트워크 수준에서 격리됩니다.

### 스토리지 격리 \{#storage-isolation\}

모든 서비스는 공유 버킷(AWS, GCP) 또는 스토리지 컨테이너(Azure)의 별도 하위 경로를 사용합니다.

AWS의 경우 스토리지에 대한 액세스는 AWS IAM을 통해 제어되며, 각 IAM 역할은 서비스별로 고유합니다. Enterprise 서비스에서는 [CMEK](/cloud/security/cmek)를 활성화하여 저장 데이터에 대한 고급 데이터 격리를 제공할 수 있습니다. 현재 CMEK는 AWS 서비스에만 지원됩니다.

GCP와 Azure의 경우 서비스는 객체 스토리지 수준에서 격리되며(모든 서비스가 자체 버킷 또는 스토리지 컨테이너를 가짐), 각 서비스가 독립적으로 분리됩니다.

## 컴퓨트-컴퓨트 분리 \{#compute-compute-separation\}

[Compute-compute separation](/cloud/reference/warehouses)을 사용하면 동일한 객체 스토리지를 공유하면서도 각각 고유한 서비스 URL을 가지는 여러 컴퓨트 노드 그룹을 생성할 수 있습니다. 이를 통해 동일한 데이터를 공유하더라도 읽기와 쓰기처럼 서로 다른 사용 사례 간에 컴퓨트를 분리할 수 있습니다. 또한 필요에 따라 각 컴퓨트 그룹을 독립적으로 확장할 수 있어 리소스를 보다 효율적으로 활용할 수 있습니다.

## 동시성 한도 \{#concurrency-limits\}

ClickHouse Cloud 서비스에서는 초당 쿼리 수(QPS)에 대한 제한은 없습니다. 그러나 레플리카당 동시에 실행할 수 있는 쿼리는 1000개로 제한됩니다. QPS는 궁극적으로 평균 쿼리 실행 시간과 서비스 내 레플리카 수에 의해 결정됩니다.

자가 관리형 ClickHouse 인스턴스나 다른 데이터베이스/데이터 웨어하우스와 비교했을 때 ClickHouse Cloud의 주요 장점은 [레플리카를 추가하여(수평 확장)](/manage/scaling#manual-horizontal-scaling) 동시성을 쉽게 높일 수 있다는 점입니다.