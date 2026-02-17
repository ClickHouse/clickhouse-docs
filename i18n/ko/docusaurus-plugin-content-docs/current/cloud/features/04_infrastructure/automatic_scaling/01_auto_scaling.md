---
sidebar_position: 1
sidebar_label: '자동 확장'
slug: /manage/scaling
description: 'ClickHouse Cloud에서 자동 확장 구성'
keywords: ['자동 확장', '자동 스케일링', '확장', '수평', '수직', '버스트']
title: '자동 확장'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 자동 스케일링 \{#automatic-scaling\}

스케일링은 클라이언트 요구 사항을 충족하도록 사용 가능한 리소스를 조정하는 기능입니다. Scale 및 Enterprise(표준 1:4 프로필) 티어 서비스는 API를 프로그래밍 방식으로 호출하거나 UI에서 설정을 변경하여 시스템 리소스를 조정함으로써 수평으로 스케일링할 수 있습니다. 이러한 서비스는 애플리케이션 요구 사항을 충족하기 위해 수직으로 **자동 스케일링(autoscaling)** 될 수도 있습니다.

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale 및 Enterprise 티어는 단일 레플리카 및 다중 레플리카 서비스를 모두 지원하지만, Basic 티어는 단일 레플리카 서비스만 지원합니다. 단일 레플리카 서비스는 크기가 고정되도록 설계되며 수직 또는 수평 스케일링을 허용하지 않습니다. 서비스를 스케일링하려면 Scale 또는 Enterprise 티어로 업그레이드할 수 있습니다.
:::

## ClickHouse Cloud에서 스케일링이 작동하는 방식 \{#how-scaling-works-in-clickhouse-cloud\}

현재 ClickHouse Cloud는 Scale 티어 서비스에서 수직 자동 스케일링과 수동 수평 스케일링을 지원합니다.

Enterprise 티어 서비스의 스케일링은 다음과 같이 작동합니다.

- **수평 스케일링**: 수동 수평 스케일링은 Enterprise 티어의 모든 표준 및 커스텀 프로필에서 사용할 수 있습니다.
- **수직 스케일링**:
  - 표준 프로필(1:4)은 수직 자동 스케일링을 지원합니다.
  - 커스텀 프로필(`highMemory` 및 `highCPU`)은 수직 자동 스케일링이나 수동 수직 스케일링을 지원하지 않습니다. 다만 지원팀에 문의하면 이러한 서비스도 수직으로 스케일링하도록 지원을 받을 수 있습니다.

:::note
ClickHouse Cloud의 스케일링은 「["Make Before Break" (MBB)](/cloud/features/mbb)」 방식으로 수행됩니다.
이 방식은 기존 레플리카를 제거하기 전에 새 크기의 레플리카를 하나 이상 먼저 추가하여, 스케일링 작업 중 용량 손실이 발생하지 않도록 합니다.
기존 레플리카를 제거하는 시점과 새로운 레플리카를 추가하는 시점 사이의 간격을 없앰으로써, MBB는 더 매끄럽고 중단이 적은 스케일링 프로세스를 제공합니다.
이는 특히 리소스 사용률 증가로 추가 용량이 필요한 스케일 업(scale-up) 상황에서 유용하며, 레플리카를 너무 일찍 제거하면 리소스 제약이 더 심해질 수 있습니다.
이러한 접근 방식의 일환으로, 기존 레플리카를 제거하기 전에 이전 레플리카에서 실행 중인 쿼리가 완료될 수 있도록 최대 1시간 동안 기다립니다.
이는 기존 쿼리가 완료될 수 있도록 보장하는 동시에, 오래된 레플리카가 너무 오래 남아 있지 않도록 균형을 맞추기 위함입니다.
:::

### 수직 자동 스케일링 \{#vertical-auto-scaling\}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale 및 Enterprise 서비스는 CPU 및 메모리 사용량을 기반으로 자동 스케일링을 지원합니다. 스케일링 결정을 위해 과거 30시간에 해당하는 조회 구간 동안 서비스의 사용 이력을 지속적으로 모니터링합니다. 사용량이 특정 임계값을 초과하거나 그 아래로 내려가면 수요에 맞게 서비스를 적절히 스케일링합니다.

비-MBB 서비스의 경우, CPU 기반 자동 스케일링은 CPU 사용량이 50–75% 범위의 상위 임계값(실제 임계값은 클러스터 크기에 따라 다름)을 초과할 때 동작합니다. 이 시점에서 클러스터에 할당된 CPU는 2배로 증가합니다. CPU 사용량이 상위 임계값의 절반 아래로 떨어지면(예를 들어 상위 임계값이 50%인 경우 25%로 떨어질 때) CPU 할당은 절반으로 줄어듭니다. 

이미 MBB 스케일링 방식을 사용하는 서비스의 경우 CPU 사용량이 75% 임계값에 도달하면 스케일 업되며, 그 절반인 37.5%까지 떨어지면 스케일 다운됩니다.

메모리 기반 자동 스케일링은 클러스터를 최대 메모리 사용량의 125%까지 스케일링하며, OOM(out of memory) 오류가 발생하는 경우 최대 150%까지 스케일링합니다.

CPU 또는 메모리 권장 값 중 **더 큰 값**이 선택되며, 서비스에 할당되는 CPU와 메모리는 `1` CPU 및 `4 GiB` 메모리 단위로 서로 연동되어 함께 스케일링됩니다.

### 수직 자동 확장 구성 \{#configuring-vertical-auto-scaling\}

ClickHouse Cloud Scale 또는 Enterprise 서비스의 스케일링은 **Admin** 역할을 가진 조직 구성원이 조정할 수 있습니다. 수직 자동 확장을 구성하려면 서비스의 **Settings** 탭으로 이동한 후 아래와 같이 최소 및 최대 메모리와 CPU 설정을 조정합니다.

:::note
단일 레플리카 서비스는 모든 티어에서 스케일링할 수 없습니다.
:::

<Image img={auto_scaling} size="lg" alt="스케일링 설정 페이지" border/>

레플리카의 **Maximum memory**를 **Minimum memory**보다 더 큰 값으로 설정하십시오. 그러면 서비스는 해당 범위 내에서 필요에 따라 자동으로 스케일링됩니다. 이러한 설정은 초기 서비스 생성 단계에서도 사용할 수 있습니다. 서비스의 각 레플리카에는 동일한 메모리 및 CPU 리소스가 할당됩니다.

또한 이 값들을 동일하게 설정하여, 사실상 서비스를 특정 구성에 「고정(pinning)」할 수도 있습니다. 이렇게 하면 선택한 크기로 즉시 스케일링이 이루어집니다.

이렇게 설정하면 클러스터의 자동 스케일링이 비활성화되며, 해당 설정을 초과하는 CPU 또는 메모리 사용량 증가로부터 서비스가 보호되지 않는다는 점에 유의하십시오.

:::note
Enterprise 티어 서비스의 경우, 표준 1:4 프로필은 수직 자동 확장을 지원합니다.
Custom 프로필은 출시 시점에 수직 자동 확장 또는 수동 수직 스케일링을 지원하지 않습니다.
그러나 이러한 서비스는 지원팀에 문의하면 수직으로 스케일링할 수 있습니다.
:::

## 수동 수평 확장 \{#manual-horizontal-scaling\}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

ClickHouse Cloud의 [public APIs](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)를 사용해 서비스의 확장 설정을 업데이트하여 서비스를 확장하거나, Cloud 콘솔에서 레플리카 수를 조정할 수 있습니다.

**Scale** 및 **Enterprise** 티어는 단일 레플리카 서비스도 지원합니다. 한 번 수평 확장한 서비스는 최소 단일 레플리카까지 다시 축소할 수 있습니다. 단일 레플리카 서비스는 가용성이 낮아지므로 프로덕션 환경에서는 권장되지 않습니다.

:::note
서비스는 수평 확장을 통해 최대 20개의 레플리카까지 확장할 수 있습니다. 추가 레플리카가 필요한 경우 지원 팀에 문의하십시오.
:::

### API를 통한 수평 확장 \{#horizontal-scaling-via-api\}

클러스터를 수평 확장하려면 API를 통해 `PATCH` 요청을 전송하여 레플리카 수를 조정합니다. 아래 스크린샷은 레플리카가 `3`개인 클러스터를 `6`개의 레플리카로 확장하는 API 호출과 그에 대한 응답을 보여줍니다.

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*`numReplicas`를 업데이트하기 위한 `PATCH` 요청*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*`PATCH` 요청에 대한 응답*

이미 하나의 스케일링 작업이 진행 중인 상태에서 새로운 스케일링 요청을 보내거나 여러 요청을 연속해서 보내는 경우, 스케일링 서비스는 중간 상태를 무시하고 최종 레플리카 수에 맞춰 상태를 수렴합니다.

### UI를 통한 수평 확장 \{#horizontal-scaling-via-ui\}

UI에서 서비스를 수평 확장하려면 **Settings** 페이지에서 서비스의 레플리카 수를 조정합니다.

<Image img={scaling_configure} size="md" alt="스케일링 구성" border/>

*ClickHouse Cloud 콘솔의 서비스 스케일링 설정*

서비스가 확장되면 Cloud 콘솔의 메트릭 대시보드에 서비스에 대한 정확한 리소스 할당이 표시됩니다. 아래 스크린샷은 클러스터가 총 메모리 `96 GiB`(레플리카 `6`개, 각 레플리카에 `16 GiB` 메모리 할당)로 확장된 상태를 보여줍니다.

<Image img={scaling_memory_allocation} size="md" alt="스케일링된 메모리 할당" border />

## 자동 유휴 상태 전환 \{#automatic-idling\}

**Settings** 페이지에서 서비스가 일정 시간 동안 비활성 상태인 경우(예: 서비스가 사용자가 제출한 쿼리를 전혀 실행하지 않을 때) 자동으로 유휴 상태로 전환할지 여부를 선택할 수 있습니다. 자동 유휴 상태 전환 기능을 사용하면 서비스가 일시 중지된 동안에는 컴퓨트 리소스에 대한 요금이 부과되지 않으므로 서비스 비용을 절감할 수 있습니다.

### Adaptive Idling \{#adaptive-idling\}

ClickHouse Cloud는 비용 절감을 극대화하면서 서비스 중단을 방지하기 위해 Adaptive Idling을 사용합니다. 시스템은 서비스를 idle 상태로 전환하기 전에 여러 조건을 평가합니다. 아래 나열된 조건 중 하나라도 충족되면 Adaptive Idling이 idle 지속 시간 설정보다 우선하여 적용됩니다:

- 파트(parts) 수가 최대 idle 파트 임계값(기본값: 10,000)을 초과하면, 백그라운드 유지 관리가 계속될 수 있도록 서비스를 idle 상태로 전환하지 않습니다.
- 진행 중인 merge 작업이 있는 경우, 중요한 데이터 통합이 중단되지 않도록 이러한 merge가 완료될 때까지 서비스를 idle 상태로 전환하지 않습니다.
- 추가로, 서비스는 서버 초기화 시간에 따라 idle 타임아웃도 조정합니다:
  - 서버 초기화 시간이 15분 미만이면 Adaptive 타임아웃이 적용되지 않고, 사용자가 구성한 기본 idle 타임아웃이 사용됩니다.
  - 서버 초기화 시간이 15분에서 30분 사이이면 idle 타임아웃이 15분으로 설정됩니다.
  - 서버 초기화 시간이 30분에서 60분 사이이면 idle 타임아웃이 30분으로 설정됩니다.
  - 서버 초기화 시간이 60분을 초과하면 idle 타임아웃이 1시간으로 설정됩니다.

:::note
서비스는 [갱신 가능 구체화 뷰](/materialized-view/refreshable-materialized-view)의 갱신, [S3Queue](/engines/table-engines/integrations/s3queue)에서의 소비, 그리고 새로운 merge 스케줄링을 중단하는 idle 상태로 진입할 수 있습니다. 기존 merge 작업은 서비스가 idle 상태로 전환되기 전에 완료됩니다. 갱신 가능 구체화 뷰와 S3Queue 소비가 지속적으로 동작하도록 하려면 idle 상태 기능을 비활성화하십시오.
:::

:::danger 자동 idling을 사용하지 말아야 하는 경우
Automatic idling은 서비스가 일시 중지되면 서비스에 대한 연결이 타임아웃되므로, 쿼리에 응답하기까지 지연이 발생해도 무방한 사용 사례에서만 사용해야 합니다. Automatic idling은 사용 빈도가 낮고 일정 수준의 지연을 허용할 수 있는 서비스에 이상적입니다. 빈번하게 사용되는 고객 대상 기능을 제공하는 서비스에는 권장되지 않습니다.
:::

## 워크로드 급증 처리 \{#handling-bursty-workloads\}

앞으로 워크로드에 급증이 예상되는 경우
[ClickHouse Cloud API](/cloud/manage/api/api-overview)를 사용하여
급증을 처리할 수 있도록 서비스를 미리 확장한 뒤,
수요가 줄어들면 다시 축소할 수 있습니다.

각 레플리카에서 현재 사용 중인 CPU 코어 수와 메모리를 파악하려면
아래 쿼리를 실행하십시오.

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
