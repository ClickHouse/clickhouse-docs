---
'sidebar_position': 1
'sidebar_label': '자동 스케일링'
'slug': '/manage/scaling'
'description': 'ClickHouse Cloud에서 자동 스케일링 구성하기'
'keywords':
- 'autoscaling'
- 'auto scaling'
- 'scaling'
- 'horizontal'
- 'vertical'
- 'bursts'
'title': '자동 스케일링'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import auto_scaling from '@site/static/images/cloud/manage/AutoScaling.png';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'


# 자동 스케일링

스케일링은 클라이언트의 요청을 충족하기 위해 사용 가능한 리소스를 조정하는 능력을 의미합니다. Scale 및 Enterprise (표준 1:4 프로파일) 계층 서비스는 API를 프로그래밍 방식으로 호출하거나 UI에서 설정을 변경하여 수평적으로 스케일링할 수 있습니다. 이러한 서비스는 애플리케이션의 요구에 맞춰 **자동 스케일링**할 수 있습니다.

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

:::note
Scale 및 Enterprise 계층은 단일 및 다중 복제본 서비스를 모두 지원하지만, Basic 계층은 단일 복제본 서비스만 지원합니다. 단일 복제본 서비스는 크기가 고정되어 있으며 수직 또는 수평 스케일링을 허용하지 않습니다. 사용자는 Scale 또는 Enterprise 계층으로 업그레이드하여 서비스를 스케일링할 수 있습니다.
:::

## ClickHouse Cloud에서 스케일링 작동 방식 {#how-scaling-works-in-clickhouse-cloud}

현재 ClickHouse Cloud는 Scale 계층 서비스에 대해 수직 자동 스케일링 및 수동 수평 스케일링을 지원합니다.

Enterprise 계층 서비스의 경우 스케일링은 다음과 같이 작동합니다:

- **수평 스케일링**: 수동 수평 스케일링은 엔터프라이즈 계층의 모든 표준 및 사용자 지정 프로파일에서 가능하다.
- **수직 스케일링**:
  - 표준 프로파일(1:4)은 수직 자동 스케일링을 지원합니다.
  - 사용자 지정 프로파일(`highMemory` 및 `highCPU`)은 수직 자동 스케일링 또는 수동 수직 스케일링을 지원하지 않습니다. 그러나 이러한 서비스는 지원에 문의하여 수직으로 스케일링할 수 있습니다.

:::note
ClickHouse Cloud의 스케일링은 우리가 ["Make Before Break" (MBB)](/cloud/features/mbb) 접근 방식이라고 부르는 방식으로 이루어집니다. 이는 기존의 복제본을 제거하기 전에 새 크기의 복제본을 하나 이상 추가하여 스케일링 작업 중 용량 손실을 방지합니다. 기존 복제본을 제거하고 새 복제본을 추가하는 간격을 없애 MBB는 보다 원활하고 방해가 적은 스케일링 프로세스를 생성합니다. 이는 고용량 자원 사용이 추가 용량 필요성을 촉발하는 스케일 업 시나리오에서 특히 유익합니다. 모든 쿼리가 완료될 때까지 최대 1시간까지 기다린 후에 기존 복제본을 제거합니다. 이것은 기존 쿼리가 완료될 필요성과 동시에 기존 복제본이 너무 오래 남아있지 않도록 균형을 맞춥니다.

이 변경 사항의 일환으로 다음 사항에 유의하시기 바랍니다:
1. 역사적 시스템 테이블 데이터는 스케일링 이벤트의 일환으로 최대 30일 동안 유지됩니다. 또한, AWS 또는 GCP의 서비스에 대한 2024년 12월 19일 이전의 시스템 테이블 데이터와 Azure의 서비스에 대한 2025년 1월 14일 이전의 데이터는 새로운 조직 계층으로의 마이그레이션의 일환으로 유지되지 않습니다.
2. TDE(투명 데이터 암호화)를 사용하는 서비스의 경우 MBB 작업 이후 시스템 테이블 데이터는 현재 유지되지 않습니다. 이 제한 사항을 없애기 위해 작업 중입니다.
:::

### 수직 자동 스케일링 {#vertical-auto-scaling}

<ScalePlanFeatureBadge feature="Automatic vertical scaling"/>

Scale 및 Enterprise 서비스는 CPU 및 메모리 사용량에 기반한 자동 스케일링을 지원합니다. 우리는 서비스의 과거 사용량을 30시간의 기간에 걸쳐 모니터링하여 스케일링 결정을 내립니다. 사용량이 특정 임계값을 초과하거나 미치지 않으면, 수요에 맞게 서비스를 적절히 스케일합니다.

MBB가 아닌 서비스의 경우, CPU 기반 자동 스케일링은 CPU 사용량이 50-75% 범위의 상한선을 초과할 때 시작됩니다(실제 임계값은 클러스터 크기에 따라 다름). 이 시점에서 클러스터에 할당된 CPU가 두 배가 됩니다. CPU 사용량이 상한선의 절반(예: 50% 상한선의 경우 25%) 이하로 떨어지면, CPU 할당량이 절반으로 줄어듭니다.

MBB 스케일링 방식을 이미 이용 중인 서비스의 경우, 스케일 업은 75% CPU 임계값에서 발생하고, 스케일 다운은 그 임계값의 절반인 37.5%에서 발생합니다.

메모리 기반 자동 스케일링은 클러스터를 최대 메모리 사용량의 125%로 스케일링하며, OOM(out of memory) 오류가 발생할 경우 최대 150%까지 스케일링합니다.

**더 큰** CPU 또는 메모리 권장 사항이 선택되며, 서비스에 할당된 CPU 및 메모리는 `1` CPU 및 `4 GiB` 메모리의 일정한 증가로 스케일됩니다.

### 수직 자동 스케일링 구성하기 {#configuring-vertical-auto-scaling}

ClickHouse Cloud Scale 또는 Enterprise 서비스의 스케일링은 **Admin** 역할을 가진 조직 구성원이 조정할 수 있습니다. 수직 자동 스케일링을 구성하려면 서비스의 **Settings** 탭으로 가서 아래와 같이 최소 및 최대 메모리와 CPU 설정을 조정하십시오.

:::note
단일 복제본 서비스는 모든 계층에서 스케일링할 수 없습니다.
:::

<Image img={auto_scaling} size="lg" alt="Scaling settings page" border/>

복제본의 **최대 메모리**를 **최소 메모리**보다 높은 값으로 설정합니다. 그러면 서비스가 그 범위 내에서 필요에 따라 스케일됩니다. 이러한 설정은 서비스 초기 생성 과정에서도 가능합니다. 서비스의 각 복제본은 동일한 메모리 및 CPU 리소스를 할당받게 됩니다.

이러한 값을 동일하게 설정하면 본질적으로 서비스를 특정 구성에 "고정"하게 됩니다. 이렇게 하면 선택한 원하는 크기로 즉시 스케일링이 이루어집니다.

이로 인해 클러스터에서 모든 자동 스케일링이 비활성화되며, 서비스는 이 설정을 초과하는 CPU 또는 메모리 사용량 증가로부터 보호받지 못합니다.

:::note
Enterprise 계층 서비스의 경우 표준 1:4 프로파일이 수직 자동 스케일링을 지원합니다. 사용자 지정 프로파일은 출시 시 수직 자동 스케일링 또는 수동 수직 스케일링을 지원하지 않습니다. 그러나 이러한 서비스는 지원에 문의하여 수직으로 스케일링할 수 있습니다.
:::

## 수동 수평 스케일링 {#manual-horizontal-scaling}

<ScalePlanFeatureBadge feature="Manual horizontal scaling"/>

ClickHouse Cloud의 [공식 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)를 사용하여 서비스의 스케일링 설정을 업데이트하거나 클라우드 콘솔에서 복제 수를 조정하여 서비스를 스케일링할 수 있습니다.

**Scale** 및 **Enterprise** 계층은 또한 단일 복제본 서비스를 지원합니다. 한 번 스케일 아웃된 서비스는 최소 하나의 복제로 다시 스케일링할 수 있습니다. 단일 복제본 서비스는 가용성이 감소하므로 생산 환경 사용은 권장하지 않습니다.

:::note
서비스는 최대 20개의 복제로 수평 스케일링할 수 있습니다. 추가 복제가 필요하면 지원팀에 문의해 주시기 바랍니다.
:::

### API를 통한 수평 스케일링 {#horizontal-scaling-via-api}

클러스터를 수평적으로 스케일링하려면 API를 통해 `PATCH` 요청을 발행하여 복제본의 수를 조정합니다. 아래 스크린샷은 `3` 복제본 클러스터를 `6` 복제본으로 스케일 아웃하는 API 호출과 해당 응답을 보여줍니다.

<Image img={scaling_patch_request} size="lg" alt="Scaling PATCH request" border/>

*`numReplicas` 업데이트를 위한 `PATCH` 요청*

<Image img={scaling_patch_response} size="md" alt="Scaling PATCH response" border/>

*`PATCH` 요청의 응답*

진행 중인 하나의 요청이 있을 때 새 스케일링 요청이나 여러 요청을 연속해서 발행하면 스케일링 서비스는 중간 상태를 무시하고 최종 복제본 수치에 수렴합니다.

### UI를 통한 수평 스케일링 {#horizontal-scaling-via-ui}

UI에서 서비스를 수평으로 스케일링하려면 **Settings** 페이지에서 서비스의 복제본 수를 조정할 수 있습니다.

<Image img={scaling_configure} size="md" alt="Scaling configuration settings" border/>

*ClickHouse Cloud 콘솔의 서비스 스케일링 설정*

서비스가 스케일링된 후에는 클라우드 콘솔의 메트릭 대시보드에서 서비스에 대한 올바른 할당이 표시되어야 합니다. 아래 스크린샷은 클러스터가 총 메모리 `96 GiB`로 스케일링되었으며, 각 복제본이 `16 GiB`의 메모리 할당을 받고 있는 모습을 보여줍니다.

<Image img={scaling_memory_allocation} size="md" alt="Scaling memory allocation" border />

## 자동 대기 {#automatic-idling}
**Settings** 페이지에서 서비스가 비활성 상태일 때 자동 대기를 허용할지 여부를 선택할 수 있습니다(즉, 서비스가 사용자가 제출한 쿼리를 실행하지 않을 때). 자동 대기 기능은 서비스의 비용을 줄여주며, 서비스가 일시 정지된 동안 컴퓨팅 자원에 대한 요금이 청구되지 않습니다.

:::note
특정 특수 사례에서는, 예를 들어 서비스에 많은 수의 파트가 있는 경우, 서비스가 자동으로 대기 상태로 전환되지 않을 수 있습니다.

서비스는 [Refreshable Materialized Views](/materialized-view/refreshable-materialized-view)의 새로 고침, [S3Queue](/engines/table-engines/integrations/s3queue)에서의 소비 및 새로운 병합 작업의 일정을 일시 중단하여 대기 상태에 들어갈 수 있습니다. 서비스가 대기 상태로 전환되기 전에 기존의 병합 작업이 완료됩니다. Refreshable Materialized Views 및 S3Queue 소비의 연속적인 작동을 보장하기 위해 대기 상태 기능을 비활성화하십시오.
:::

:::danger 자동 대기를 사용하지 말아야 할 때
자동 대기는 쿼리에 대한 응답 전에 지연을 처리할 수 있는 경우에만 사용하십시오. 서비스가 일시 정지될 때 서비스에 대한 연결이 타임아웃되기 때문입니다. 자동 대기는 빈번하게 사용되지 않으며 지연을 감내할 수 있는 서비스에 적합합니다. 자주 사용되는 고객 대면 기능을 지원하는 서비스에는 권장되지 않습니다.
:::

## 작업 부하 급증 처리하기 {#handling-bursty-workloads}

앞으로 작업 부하 급증이 예상되는 경우, [ClickHouse Cloud API](/cloud/manage/api/api-overview)를 사용하여 서비스를 미리 스케일업하여 급증에 대비하고 수요가 감소하면 다시 스케일다운할 수 있습니다.

각 복제본의 현재 CPU 코어 및 사용 중인 메모리를 이해하려면 아래 쿼리를 실행하십시오:

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
