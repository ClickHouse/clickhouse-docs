---
title: 'BYOC 운영 및 유지 관리'
slug: /cloud/reference/byoc/operations
sidebar_label: '운영 및 유지 관리'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'operations', 'maintenance']
description: '자체 Cloud 인프라에 ClickHouse를 배포합니다'
doc_type: 'reference'
---

## 개요 \{#overview\}

ClickHouse Cloud는 BYOC 배포에 대한 업그레이드와 유지 관리를 관리하여 서비스가 보안이 유지되고, 성능이 우수하며, 항상 최신 상태를 유지하도록 합니다. 이 페이지에서는 BYOC 인프라의 다양한 구성 요소에 대한 업그레이드 프로세스와 유지 관리 시간대가 어떻게 운영되는지 설명합니다.

## ClickHouse 서비스 업그레이드 프로세스 \{#clickhouse-upgrade-process\}

ClickHouse 데이터베이스는 정기적으로 업그레이드하며, 여기에는 버전 업그레이드, 버그 수정, 성능 향상이 포함됩니다. ClickHouse Cloud는 업그레이드를 위해 ["make before break" (MBB)](https://clickhouse.com/docs/cloud/features/mbb) 방식을 사용하며, 이 방식은 기존 레플리카를 제거하기 전에 업데이트된 레플리카를 먼저 추가하여 실행 중인 워크로드에 대한 방해를 최소화하고 보다 원활한 업그레이드를 가능하게 합니다.

BYOC 환경에서 ClickHouse 서비스 업그레이드는 표준 ClickHouse Cloud 서비스와 동일한 프로세스와 패턴을 따르며, 릴리스 채널(Fast, Regular, Slow)과 예약된 유지 관리 시간대를 모두 지원합니다. 모든 Scale 및 Enterprise 티어 기능은 BYOC 배포에서 사용할 수 있습니다. 업그레이드 일정, 릴리스 채널 및 유지 관리 시간대에 대한 자세한 내용은 [업그레이드 문서](/manage/updates)를 참조하십시오.

## Cloud 서비스 및 리소스 업그레이드 프로세스 \{#cloud-upgrade-process\}

ClickHouse Cloud는 보안, 안정성, 신규 기능에 대한 접근을 보장하기 위해 Kubernetes에서 실행되는 지원 서비스와 BYOC 배포 내 인프라 구성 요소를 정기적으로 업그레이드합니다. 이러한 Cloud 서비스 업그레이드는 백그라운드에서 수행되며, 표준 Cloud 릴리스 주기에 맞춰 진행됩니다. 모든 지원 서비스는 ArgoCD를 통해 관리되며, 업그레이드는 중단 없이 수행되도록 설계되어 있습니다. 이러한 업데이트 동안 서비스 중단은 발생하지 않습니다.

업그레이드되는 Cloud 서비스의 예는 다음과 같습니다:

- **ClickHouse Operator**: ClickHouse 클러스터를 관리하는 Kubernetes 오퍼레이터
- **Istio Services**: 인그레스 및 에이전트 구성 요소
- **Monitoring Stack**: Prometheus, Grafana, AlertManager, Thanos 구성 요소

## Kubernetes 클러스터 업그레이드 프로세스 \{#k8s-upgrade-process\}

ClickHouse 서비스를 호스팅하는 Kubernetes 클러스터(AWS의 EKS, GCP의 GKE)는 보안, 호환성, 새로운 기능 활용을 위해 주기적인 업그레이드가 필요합니다. ClickHouse Cloud는 BYOC 배포에 대한 모든 Kubernetes 클러스터 업그레이드를 관리하여 클러스터가 지원되는 버전으로 최신 상태를 유지하도록 합니다.

### 클러스터 업그레이드 유형 \{#cluster-upgrade-types\}

**컨트롤 플레인 업그레이드(Control Plane Upgrades)**: Kubernetes 컨트롤 플레인 구성 요소(API server, etcd, controller manager)는 ClickHouse Cloud에서 업그레이드됩니다. 이러한 업그레이드는 일반적으로 워크로드 관점에서 대부분 투명하게 처리되며, 파드 재시작이 필요하지 않습니다.

**노드 그룹 업그레이드(Node Group Upgrades)**: 워커 노드 업그레이드는 노드 교체가 필요하며, 실행 중인 파드에 영향을 줄 수 있습니다. ClickHouse Cloud는 중단을 최소화하기 위해 make-before-break 방식을 사용해 이러한 업그레이드를 조정합니다.

- 새 노드는 기존 노드가 제거되기 전에 업데이트된 Kubernetes 버전으로 프로비저닝됩니다.
- 파드는 정상적으로 드레이닝(draining)된 후 새 노드로 마이그레이션됩니다.
- 파드가 새 노드로 성공적으로 마이그레이션된 이후에만 기존 노드가 종료됩니다.

:::note
Kubernetes 노드 업그레이드 과정에서 마이그레이션 중 잠시 파드가 재시작될 수 있습니다. ClickHouse Cloud는 워크로드에 대한 영향을 최소화하기 위해 Pod Disruption Budget과 정상 종료(graceful shutdown)를 사용합니다.
:::

### 업그레이드 일정 \{#upgrade-schedule\}

Kubernetes 클러스터 업그레이드는 ClickHouse Support를 통해 고객과 조율하여 일정이 수립됩니다. 업그레이드 계획은 사전에 공유하고, 운영에 미치는 영향을 최소화할 수 있도록 적절한 점검 시간을 함께 협의하여 결정합니다.

### 버전 지원 \{#version-support\}

ClickHouse Cloud는 클라우드 서비스 제공자(AWS EKS 또는 Google GKE)가 정의한 지원 버전 범위 내에서 Kubernetes 클러스터를 유지 관리합니다. 클러스터가 제공자 요구사항과의 호환성을 유지하면서 최신 보안 패치와 기능 업데이트를 지속적으로 반영하도록 관리합니다.