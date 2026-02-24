---
slug: /cloud/managed-postgres/scaling
sidebar_label: '스케일링'
title: '스케일링'
description: '유연한 VM 유형과 독립적인 리소스 스케일링으로 ClickHouse가 관리하는 Postgres 인스턴스를 수직으로 스케일링할 수 있습니다'
keywords: ['Postgres 스케일링', '수직 스케일링', 'VM 유형', 'NVMe 스케일링', '인스턴스 유형', '성능 스케일링']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import instanceTypes from '@site/static/images/managed-postgres/instance-types.png';
import scalingSettings from '@site/static/images/managed-postgres/scaling-settings.png';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="scaling" />

Managed Postgres는 워크로드 요구 사항에 맞게 조정할 수 있는 유연한 스케일링 옵션을 제공합니다. 50개가 넘는 NVMe 기반 인스턴스 타입 중에서 선택할 수 있으며, CPU, 메모리, 스토리지를 독립적으로 확장하여 특정 사용 사례에 맞게 성능과 비용을 최적화할 수 있습니다.


## 인스턴스 유형과 유연성 \{#instance-types\}

Managed Postgres는 다양한 워크로드 특성에 최적화된 폭넓은 인스턴스 유형을 제공합니다:

- 컴퓨트, 메모리, 스토리지 최적화 구성을 아우르는 **50개 이상의 인스턴스 유형**
- 모든 인스턴스 유형에서 일관된 고성능 디스크 I/O를 제공하는 **NVMe 기반 스토리지**
- **리소스 독립 확장**: 워크로드에 맞게 CPU, 메모리, 스토리지를 적절히 조합하여 선택

<Image img={instanceTypes} alt="인스턴스 유형" size="md" border/>

### 적절한 인스턴스 유형 선택 \{#choosing-instance\}

워크로드 특성에 따라 적합한 리소스 구성이 달라집니다.

| 워크로드 유형                                      | CPU   | 메모리 | 스토리지 | 권장 인스턴스                                  |
|---------------------------------------------------|-------|--------|----------|-----------------------------------------------|
| **컴퓨트 최적화형**                               | 높음  | 중간   | 중간     | 컴퓨트 최적화형(높은 vCPU 개수)               |
| **메모리 최적화형** (대규모 워킹 세트)            | 중간  | 높음   | 중간     | 메모리 최적화형(CPU 대비 메모리 비율이 높음)  |
| **스토리지 최적화형** (대용량 데이터셋, 높은 I/O) | 중간  | 중간   | 높음     | 스토리지 최적화형(높은 NVMe 용량)             |

## 스케일링 방식 \{#how-scaling-works\}

인스턴스 유형을 변경하면 Managed Postgres가 수직 스케일링 작업을 수행하여 새 인프라를 프로비저닝하고, 중단 시간을 최소화하면서 데이터베이스를 마이그레이션합니다.

<Image img={scalingSettings} alt="Scaling Settings" size="md" border/>

### 확장 프로세스 \{#scaling-process\}

확장 워크플로는 백업에서 새로운 대기 인스턴스를 기동한 뒤, 제어된 페일오버를 수행합니다:

1. **대기 인스턴스 프로비저닝**: 대상 인스턴스 타입(CPU, 메모리, 스토리지 구성)으로 새로운 대기 인스턴스를 생성합니다.

2. **S3 백업에서 복원**: S3에 저장된 최신 백업에서 복원하여 대기 인스턴스를 초기화합니다.

3. **병렬 WAL 재생(Replay)**: 대기 인스턴스는 [WAL-G](https://github.com/wal-g/wal-g)로 구동되는 병렬 복원 메커니즘을 사용해 백업 이후의 모든 Write-Ahead Log(WAL) 변경 사항을 적용합니다.
   - WAL-G는 빠르고 병렬화된 복원 작업을 가능하게 합니다.
   - WAL-G의 개발자는 당사가 파트너십을 맺은 Ubicloud 팀에 속해 있어, 깊이 있는 전문성과 최적화를 보장합니다.

4. **복제(Replication) 동기화**: 대기 인스턴스는 지속적인 WAL 변경 사항을 스트리밍하고 적용하여 프라이머리와의 차이를 따라잡습니다.

5. **페일오버**: 대기 인스턴스가 완전히 동기화되면, 제어된 페일오버를 통해 대기 인스턴스를 새로운 프라이머리로 승격합니다.
   - **이 단계만 다운타임이 발생합니다**(약 30초)
   - 페일오버 동안 모든 활성 연결이 끊어집니다.
   - 클라이언트는 페일오버가 완료된 후 다시 연결해야 합니다.

6. **기존 인스턴스 사용 중단**: 페일오버가 완료된 후 기존 인스턴스는 사용이 중단(decommission)됩니다.

### 스케일링 소요 시간 \{#scaling-duration\}

스케일링에 필요한 전체 시간은 주로 데이터베이스 크기와 백업에서 다시 재생해야 하는 WAL 데이터 양에 따라 달라집니다:

- **백업 복구**: 최신 전체 백업을 S3에서 새 인스턴스로 복구하는 데 걸리는 시간
- **WAL 재생**: 마지막 전체 백업 이후의 증분 WAL 변경 사항을 재생하는 데 걸리는 시간
- **병렬 복구**: WAL-G의 병렬 복구 메커니즘으로 전체 프로세스가 크게 빨라집니다

복구 시간은 수분에서 수시간까지 걸릴 수 있지만, 실제 유지 관리/다운타임은 매우 짧으며(약 30초 정도) 최소 수준입니다.

:::important[다운타임 최소화]
전체 스케일링 프로세스에 얼마나 오랜 시간이 걸리더라도, 페일오버 동안 애플리케이션에 발생하는 다운타임은 약 30초 정도입니다. 모든 복구 및 동기화 작업은 대기 인스턴스에서 백그라운드로 수행됩니다.
:::

### WAL-G를 사용한 병렬 복구 \{#parallel-restore\}

Managed Postgres는 스케일링 작업 중 백업 복구를 가속하기 위해 [WAL-G](https://github.com/wal-g/wal-g)를 사용합니다. 특히 WAL-G의 개발자는 파트너십을 맺고 있는 Ubicloud 팀의 일원으로, 복구 프로세스에 대한 깊은 전문성을 제공합니다.

WAL-G는 다음과 같은 기능을 제공합니다:

- **병렬 다운로드 및 압축 해제**: 여러 백업 세그먼트를 S3에서 가져와 동시에 압축을 해제합니다.
- **효율적인 WAL 재생**: 가능한 경우 증분 WAL 변경 사항을 병렬로 적용합니다.
- **최적화된 스트리밍**: 중간 복사본 없이 S3 스토리지에서 직접 스트리밍합니다.
- **빠른 복구**: 전체 시간은 데이터 크기에 따라 달라지지만, 병렬화된 접근 방식 덕분에 복구 속도가 상당히 빨라집니다.

이러한 최적화 덕분에 새 스탠바이 인스턴스를 기동하는 데 필요한 시간이 크게 줄어듭니다. 무엇보다 복구는 전적으로 백그라운드에서 진행되며, 애플리케이션이 겪는 중단 시간은 약 30초의 짧은 페일오버 구간에만 발생합니다.

### 스케일링 작업 시작하기 \{#initiating-scaling\}

Managed Postgres 인스턴스를 스케일링하려면 다음 단계를 수행하십시오.

1. 인스턴스의 **Settings** 탭으로 이동합니다.
2. **Scaling** 섹션에서 **Service size** 항목까지 스크롤합니다.
3. 대상 인스턴스 유형을 선택합니다.
4. 변경 사항을 검토한 후 「Apply changes」를 클릭합니다.

## 스케일링 전략 \{#scaling-strategies\}

### 수직 확장 \{#vertical-scaling\}

수직 확장(인스턴스 유형 변경)은 Managed Postgres에서 리소스를 조정하는 기본적인 방법입니다. 이 방식은 다음과 같은 이점을 제공합니다.

- **세밀한 제어**: 50개 이상의 인스턴스 유형 중에서 선택하여 CPU, 메모리, 스토리지 리소스를 정밀하게 조정할 수 있습니다.
- **워크로드 최적화**: 특정 워크로드(연산, 메모리 또는 스토리지 집약적)에 최적화된 구성을 선택할 수 있습니다.
- **비용 효율성**: 과도하게 프로비저닝하지 않고 필요한 리소스에 대해서만 비용을 지불할 수 있습니다.

### 수평 확장을 위한 읽기 레플리카 \{#read-replicas\}

읽기 비중이 높은 워크로드의 경우, 읽기 처리 용량을 수평으로 확장하기 위해 [읽기 레플리카](/cloud/managed-postgres/read-replicas) 사용을 고려하십시오.

- 읽기 쿼리를 전용 읽기 레플리카 인스턴스로 분산합니다.
- 각 읽기 레플리카는 자체 컴퓨트 리소스와 메모리를 보유한 완전히 독립적인 Postgres 인스턴스입니다.
- 읽기 레플리카는 효율적인 복제를 위해 객체 스토리지에 저장된 WAL 변경 사항을 스트리밍합니다.

이 방식은 리포팅 대시보드, 분석용 쿼리, 읽기 집약적인 API 엔드포인트 등과 같이 읽기 대비 쓰기 비율이 높은 애플리케이션에 적합합니다.

### ClickHouse 통합을 위한 CDC 스케일링 \{#cdc-scaling\}

[ClickPipes](/cloud/managed-postgres/clickhouse-integration)를 사용하여 ClickHouse로 데이터를 복제하는 경우, CDC(Change Data Capture) 파이프라인을 독립적으로 스케일링할 수 있습니다:

- CDC 워커를 1개에서 24개의 CPU 코어까지 스케일링
- 메모리는 CPU 코어 수의 4배로 자동 스케일링
- [ClickPipes OpenAPI](/integrations/clickpipes/postgres/scaling)를 통해 스케일링 조정

이를 통해 Postgres 인스턴스 리소스와는 별도로 복제 처리량을 개별적으로 최적화할 수 있습니다.

## 오토스케일링(로드맵) \{#autoscaling\}

:::note[곧 제공 예정]
Managed Postgres의 자동 스토리지 확장은 로드맵에 포함되어 있습니다. 이 기능은 데이터베이스 용량이 증가함에 따라 인스턴스 크기를 자동으로 확장하여, 수동 조정이 필요 없도록 합니다.
:::

## 추가 자료 \{#resources\}

- [설정 및 구성](/cloud/managed-postgres/settings)
- [읽기 레플리카](/cloud/managed-postgres/read-replicas)
- [고가용성](/cloud/managed-postgres/high-availability)
- [성능 벤치마크](/cloud/managed-postgres/benchmarks)