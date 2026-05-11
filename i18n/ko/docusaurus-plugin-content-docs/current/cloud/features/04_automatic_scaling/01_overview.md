---
sidebar_position: 1
sidebar_label: '개요'
slug: /manage/scaling
description: 'ClickHouse Cloud의 자동 스케일링 개요'
keywords: ['자동 스케일링', '오토 스케일링', '스케일링', '수평', '수직', '버스트']
title: '자동 스케일링'
doc_type: 'guide'
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

# 자동 스케일링 \{#automatic-scaling\}

스케일링은 클라이언트 요구에 맞춰 사용 가능한 리소스를 조정하는 기능입니다. Scale 및 Enterprise(표준 1:4 프로필) 티어 서비스는 API를 프로그래밍 방식으로 호출하거나 UI에서 설정을 변경해 시스템 리소스를 조정함으로써 수평 스케일링할 수 있습니다. 또한 이러한 서비스는 애플리케이션 요구를 충족하도록 수직 **자동 스케일링**도 지원합니다.

<ScalePlanFeatureBadge feature="자동 수직 스케일링" />

:::note
Scale 및 Enterprise 티어는 단일 및 다중 레플리카 서비스를 모두 지원하지만, Basic 티어는 단일 레플리카 서비스만 지원합니다. 단일 레플리카 서비스는 크기가 고정되도록 설계되어 수직 또는 수평 스케일링을 지원하지 않습니다. 서비스를 스케일링하려면 Scale 또는 Enterprise 티어로 업그레이드할 수 있습니다.
:::

## ClickHouse Cloud에서 스케일링이 작동하는 방식 \{#how-scaling-works-in-clickhouse-cloud\}

현재 ClickHouse Cloud는 Scale 티어 서비스에 대해 수직 자동 스케일링과 수동 수평 스케일링을 지원합니다.

Enterprise 티어 서비스의 스케일링은 다음과 같이 작동합니다.

* **수평 스케일링**: Enterprise 티어의 모든 표준 프로필과 사용자 지정 프로필에서 수동 수평 스케일링을 사용할 수 있습니다.
* **수직 스케일링**:
  * 표준 프로필(1:4)은 수직 자동 스케일링을 지원합니다.
  * 사용자 지정 프로필(`highMemory` 및 `highCPU`)은 수직 자동 스케일링과 수동 수직 스케일링을 지원하지 않습니다. 다만, 지원팀에 문의하면 이러한 서비스도 수직으로 스케일링할 수 있습니다.

:::note
ClickHouse Cloud의 스케일링은 [&quot;Make Before Break&quot;(MBB)](/cloud/features/mbb) 방식으로 수행됩니다.
이 방식에서는 기존 레플리카를 제거하기 전에 새 크기의 레플리카를 하나 이상 추가하므로, 스케일링 작업 중 용량 손실을 방지할 수 있습니다.
기존 레플리카를 제거하는 시점과 새 레플리카를 추가하는 시점 사이의 공백을 없앰으로써, MBB는 더 매끄럽고 중단 영향이 적은 스케일링 프로세스를 구현합니다.
특히 높은 리소스 사용률로 인해 추가 용량이 필요한 스케일 업 시나리오에서 매우 유용합니다. 레플리카를 너무 일찍 제거하면 리소스 제약이 더 악화되기 때문입니다.
이 접근 방식의 일환으로, 기존 레플리카에서 실행 중인 쿼리가 완료될 수 있도록 해당 레플리카를 제거하기 전 최대 1시간까지 기다립니다.
이를 통해 기존 쿼리가 완료될 시간을 보장하는 동시에, 오래된 레플리카가 지나치게 오래 남아 있지 않도록 균형을 맞춥니다.
:::

## 자세히 알아보기 \{#learn-more\}

* [수직 자동 스케일링](/cloud/features/autoscaling/vertical) — 사용량에 따라 CPU와 메모리를 자동으로 스케일링
* [수평 스케일링](/cloud/features/autoscaling/horizontal) — API 또는 UI를 통한 레플리카 수동 스케일링
* [Make Before Break (MBB)](/cloud/features/mbb) — ClickHouse Cloud에서 중단 없이 스케일링 작업을 수행하는 방법
* [자동 유휴 상태 전환](/cloud/features/autoscaling/idling) — 서비스 자동 일시 중지를 통한 비용 절감
* [스케일링 권장 사항](/cloud/features/autoscaling/scaling-recommendations) — 스케일링 권장 사항 이해하기
* [예약된 스케일링](/cloud/features/autoscaling/scaling-recommendations) — 실시간 메트릭과 관계없이 서비스가 확장 또는 축소될 시점을 정확히 지정할 수 있는 Scheduled Scaling 기능 이해하기