---
title: '알림'
slug: /cloud/notifications
description: 'ClickHouse Cloud 서비스 알림'
keywords: ['cloud', 'notifications']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud는 서비스 또는 조직과 관련된 중요한 이벤트에 대한 알림을 전송합니다. 알림이 전송되고 구성되는 방식을 이해하려면 다음 개념을 염두에 두어야 합니다:

1. **알림 범주(Notification category)**: 결제 알림, 서비스 관련 알림 등과 같이 알림을 그룹화한 것을 의미합니다. 각 범주 내에는 여러 알림이 있으며, 각 알림에 대해 전달 방식(delivery mode)을 설정할 수 있습니다.
2. **알림 심각도(Notification severity)**: 알림이 얼마나 중요한지에 따라 `info`, `warning`, `critical` 중 하나가 될 수 있습니다. 이는 사용자가 변경할 수 없습니다.
3. **알림 채널(Notification channel)**: 채널은 UI, 이메일, Slack 등 알림을 수신하는 방식을 의미합니다. 대부분의 알림에서 채널을 구성할 수 있습니다.


## 알림 수신 \{#receiving-notifications\}

알림은 다양한 채널을 통해 수신할 수 있습니다. 현재 ClickHouse Cloud에서는 이메일, ClickHouse Cloud UI, Slack을 통해 알림 수신을 지원합니다. 좌측 상단 메뉴의 종 모양 아이콘을 클릭하면 현재 알림을 확인할 수 있는 플라이아웃이 열립니다. 플라이아웃 하단의 **View All** 버튼을 클릭하면 모든 알림의 활동 로그를 보여주는 페이지로 이동합니다.

<Image img={notifications_1} size="md" alt="ClickHouse Cloud 알림 플라이아웃" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud 알림 활동 로그" border/>

## 알림 사용자 지정 \{#customizing-notifications\}

각 알림마다 알림을 수신하는 방식을 사용자 지정할 수 있습니다. 알림 플라이아웃 또는 알림 활동 로그의 두 번째 탭에서 설정 화면을 열 수 있습니다.

Cloud UI를 통해 전달되는 알림을 사용자 지정할 수 있으며, 이러한 설정은 개별 사용자 단위로 반영됩니다. 본인의 이메일로 전달되는 알림도 사용자 지정할 수 있지만, 사용자 지정 이메일 주소 및 Slack 채널로 전달되는 알림을 설정할 수 있는 것은 관리자 권한이 있는 사용자뿐입니다.

특정 알림의 전달 방식을 설정하려면 연필 아이콘을 클릭하여 알림 전달 채널을 수정하십시오.

<Image img={notifications_3} size="md" alt="ClickHouse Cloud 알림 설정 화면" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud 알림 전달 설정" border/>

:::note
**Payment failed**와 같은 일부 **필수** 알림은 설정할 수 없습니다.
:::

## 지원되는 알림 \{#supported-notifications\}

현재 결제(결제 실패, 사용량이 지정된 임계값을 초과한 경우 등)와 관련된 알림과 스케일링 이벤트(스케일링 완료, 스케일링 차단 등)와 관련된 알림을 발송합니다.