---
sidebar_position: 7
sidebar_label: '예약 스케일링'
slug: /cloud/features/autoscaling/scheduled-scaling
description: 'ClickHouse Cloud의 예약 스케일링 기능을 설명하는 문서'
keywords: ['예약 스케일링']
title: '예약 스케일링'
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import scheduled_scaling_1 from '@site/static/images/cloud/features/autoscaling/scheduled-scaling-1.png';
import scheduled_scaling_2 from '@site/static/images/cloud/features/autoscaling/scheduled-scaling-2.png';

<PrivatePreviewBadge />

ClickHouse Cloud 서비스는 CPU 및 메모리 사용률에 따라 자동으로 확장되지만, 많은 워크로드는 예측 가능한 패턴을 보입니다. 예를 들어 일일 수집량 급증, 야간에 실행되는 batch 작업, 또는 주말에 급격히 줄어드는 트래픽 등이 있습니다. 이러한 사용 사례에서는 Scheduled Scaling을 사용하여 실시간 메트릭과 관계없이 서비스를 정확히 언제 확장하거나 축소할지 정의할 수 있습니다.

Scheduled Scaling을 사용하면 ClickHouse Cloud 콘솔에서 시간 기반 규칙 세트를 직접 구성합니다. 각 규칙에는 시간, 반복 방식(매일, 매주 또는 사용자 지정), 그리고 대상 크기(수평 확장의 경우 레플리카 수, 수직 확장의 경우 메모리 티어)가 지정됩니다. 예약된 시간이 되면 ClickHouse Cloud가 변경 사항을 자동으로 적용하므로, 수요가 발생한 뒤에 대응하는 것이 아니라 수요가 도달하기 전에 서비스 크기를 적절히 맞출 수 있습니다.

이는 CPU 및 메모리 사용량 변화에 동적으로 반응하는 메트릭 기반 오토스케일링과는 다릅니다. Scheduled Scaling은 결정론적입니다. 즉, 확장이 정확히 언제 발생하고 어느 크기로 조정될지 명확히 알 수 있습니다. 이 두 방식은 상호 보완적입니다. 서비스는 기본 확장 일정을 유지하면서도, 워크로드가 예기치 않게 변동하는 경우 해당 시간대 내에서 오토스케일링의 이점을 계속 활용할 수 있습니다.

Scheduled Scaling은 현재 **비공개 프리뷰**로 제공됩니다. 조직에서 이 기능을 활성화하려면 ClickHouse Support 팀에 문의하십시오.

## 스케일링 일정 설정하기 \{#setting-up-a-scaling-schedule\}

일정을 구성하려면 ClickHouse Cloud 콘솔에서 서비스로 이동한 다음 설정으로 이동합니다. 여기에서 **Schedule Override**를 선택하고 새 규칙을 추가합니다.

<Image img={scheduled_scaling_1} size="md" alt="시간 기반 스케일링 규칙을 보여주는 ClickHouse Cloud 콘솔의 스케일링 일정 인터페이스" border />

<Image img={scheduled_scaling_2} size="md" alt="ClickHouse Cloud 콘솔에서 예약 스케일링 규칙을 구성하는 화면" border />

각 규칙에는 다음 항목이 필요합니다.

* **시간:** 스케일링 작업이 실행될 시점(로컬 시간대 기준)
* **반복:** 규칙이 반복되는 주기(예: 매주 평일, 매주 일요일)
* **대상 크기:** 스케일링할 레플리카 수 또는 메모리 할당량

여러 규칙을 조합해 전체 주간 일정을 구성할 수 있습니다. 예를 들어, 매주 평일 오전 6시에 5개의 레플리카로 스케일 아웃하고 오후 8시에 다시 2개의 레플리카로 축소하도록 설정할 수 있습니다.

## 사용 사례 \{#use-cases\}

**배치 및 ETL 워크로드:** 야간 수집 작업이 실행되기 전에 확장하고, 완료되면 다시 축소하여 낮 시간대의 유휴 상태에서 과도한 프로비저닝을 피할 수 있습니다.

**예측 가능한 트래픽 패턴:** 일정한 피크 시간대(예: 업무 시간 중 쿼리 트래픽)가 있는 서비스는 부하가 몰리기 전에 미리 확장하여, 오토스케일링이 반응할 때까지 기다리지 않고 부하를 처리할 수 있습니다.

**주말 축소:** 수요가 낮은 주말에는 레플리카 수 또는 메모리 티어를 줄이고, 월요일 아침의 급증에 대비해 그전에 용량을 복원합니다.

**비용 관리:** ClickHouse Cloud 비용을 관리하는 팀은 활용률이 낮은 것으로 예상되는 시간대에 예약된 축소를 설정하면, 수동 개입 없이도 리소스 소비를 의미 있게 줄일 수 있습니다.

:::note
예약 스케일링 작업과 동시에 오토스케일링 권장 사항이 발생하면 서로 영향을 줄 수 있습니다. 트리거 시점에는 예약된 작업이 우선합니다.
:::

## 워크로드 급증 대응 \{#handling-bursty-workloads\}

워크로드가 일시적으로 급증할 것으로 예상되면
[ClickHouse Cloud API](/cloud/manage/api/api-overview)를 사용하여
급증에 대비해 서비스를 미리 확장하고, 수요가 줄어들면 다시 축소할 수
있습니다.

각 레플리카에서 현재 사용 중인 CPU 코어와 메모리를
확인하려면 아래 쿼리를 실행하십시오:

```sql
SELECT *
FROM clusterAllReplicas('default', view(
    SELECT
        hostname() AS server,
        anyIf(value, metric = 'CGroupMaxCPU') AS cpu_cores,
        formatReadableSize(anyIf(value, metric = 'CGroupMemoryTotal')) AS memory
    FROM system.asynchronous_metrics
))
ORDER BY server ASC
SETTINGS skip_unavailable_shards = 1
```
