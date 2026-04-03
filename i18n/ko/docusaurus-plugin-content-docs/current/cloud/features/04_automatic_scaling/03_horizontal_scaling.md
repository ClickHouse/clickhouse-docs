---
sidebar_position: 3
sidebar_label: '수평 스케일링'
slug: /cloud/features/autoscaling/horizontal
description: 'ClickHouse Cloud에서 수동으로 수행하는 수평 스케일링'
keywords: ['수평 스케일링', '스케일링', '레플리카', '수동 스케일링', '급증', '버스트']
title: '수평 스케일링'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import scaling_patch_request from '@site/static/images/cloud/manage/scaling-patch-request.png';
import scaling_patch_response from '@site/static/images/cloud/manage/scaling-patch-response.png';
import scaling_configure from '@site/static/images/cloud/manage/scaling-configure.png';
import scaling_memory_allocation from '@site/static/images/cloud/manage/scaling-memory-allocation.png';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge'

## 수동 수평 스케일링 \{#manual-horizontal-scaling\}

<ScalePlanFeatureBadge feature="Manual horizontal scaling" />

ClickHouse Cloud [공개 API](https://clickhouse.com/docs/cloud/manage/api/swagger#/paths/~1v1~1organizations~1:organizationId~1services~1:serviceId~1scaling/patch)를 사용하여 서비스의 스케일링 설정을 업데이트해 서비스를 확장하거나, Cloud Console에서 레플리카 수를 조정할 수 있습니다.

**Scale** 및 **Enterprise** 티어에서는 단일 레플리카 서비스도 지원합니다. 한 번 스케일 아웃한 서비스는 다시 스케일 인하여 최소 1개의 레플리카까지 줄일 수 있습니다. 단일 레플리카 서비스는 가용성이 낮아지므로 프로덕션 환경에는 권장되지 않습니다.

:::note
서비스는 최대 20개의 레플리카까지 수평 스케일링할 수 있습니다. 추가 레플리카가 필요하면 지원 팀에 문의하십시오.
:::

### API를 통한 수평 스케일링 \{#horizontal-scaling-via-api\}

클러스터를 수평 스케일링하려면 API를 통해 `PATCH` 요청을 보내 레플리카 수를 조정하십시오. 아래 스크린샷은 레플리카가 `3`개인 클러스터를 `6`개 레플리카로 스케일 아웃하는 API 호출과 이에 대한 응답을 보여줍니다.

<Image img={scaling_patch_request} size="lg" alt="스케일링 PATCH 요청" border />

*`numReplicas`를 업데이트하는 `PATCH` 요청*

<Image img={scaling_patch_response} size="md" alt="스케일링 PATCH 응답" border />

*`PATCH` 요청에 대한 응답*

이미 스케일링 요청이 진행 중인 상태에서 새 스케일링 요청을 보내거나 여러 요청을 연속해서 보내면, 스케일링 서비스는 중간 상태를 무시하고 최종 레플리카 수에 맞춰 조정됩니다.*

### UI를 통한 수평 스케일링 \{#horizontal-scaling-via-ui\}

UI에서 서비스를 수평 스케일링하려면 **설정** 페이지에서 서비스의 레플리카 수를 조정할 수 있습니다.

<Image img={scaling_configure} size="md" alt="스케일링 설정" border />

*ClickHouse Cloud 콘솔의 서비스 스케일링 설정*

서비스 스케일링이 완료되면 Cloud Console의 Metrics 대시보드에 서비스에 대한 올바른 리소스 할당이 표시되어야 합니다. 아래 스크린샷은 클러스터가 총 메모리 `96 GiB`로 스케일링된 상태를 보여주며, 이는 각각 `16 GiB`의 메모리가 할당된 `6`개의 레플리카에 해당합니다.

<Image img={scaling_memory_allocation} size="md" alt="스케일링 메모리 할당" border />