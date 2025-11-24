---
'title': '알림'
'slug': '/cloud/notifications'
'description': '당신의 ClickHouse Cloud 서비스에 대한 알림'
'keywords':
- 'cloud'
- 'notifications'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import notifications_1 from '@site/static/images/cloud/manage/notifications-1.png';
import notifications_2 from '@site/static/images/cloud/manage/notifications-2.png';
import notifications_3 from '@site/static/images/cloud/manage/notifications-3.png';
import notifications_4 from '@site/static/images/cloud/manage/notifications-4.png';

ClickHouse Cloud는 서비스 또는 조직과 관련된 중요한 이벤트에 대한 알림을 전송합니다. 알림이 어떻게 전송되고 구성되는지 이해하기 위해 염두에 두어야 할 몇 가지 개념이 있습니다:

1. **알림 카테고리**: 청구 알림, 서비스 관련 알림 등과 같은 알림 그룹을 나타냅니다. 각 카테고리 내에서 배달 모드를 구성할 수 있는 여러 알림이 있습니다.
2. **알림 심각도**: 알림 심각도는 알림의 중요성에 따라 `info`, `warning`, 또는 `critical`로 구분됩니다. 이는 구성할 수 없습니다.
3. **알림 채널**: 채널은 UI, 이메일, Slack 등과 같이 알림이 수신되는 모드를 나타냅니다. 대부분의 알림에 대해 이는 구성 가능합니다.

## 알림 수신 {#receiving-notifications}

알림은 다양한 채널을 통해 수신할 수 있습니다. 현재 ClickHouse Cloud는 이메일, ClickHouse Cloud UI 및 Slack을 통해 알림 수신을 지원합니다. 왼쪽 상단 메뉴의 종 모양 아이콘을 클릭하면 현재 알림을 볼 수 있는 팝업이 열립니다. 팝업 하단의 **모두 보기** 버튼을 클릭하면 모든 알림의 활동 로그를 보여주는 페이지로 이동합니다.

<Image img={notifications_1} size="md" alt="ClickHouse Cloud notifications flyout" border/>

<Image img={notifications_2} size="md" alt="ClickHouse Cloud notifications activity log" border/>

## 알림 사용자 정의 {#customizing-notifications}

각 알림에 대해 알림 수신 방식을 사용자 정의할 수 있습니다. 알림 팝업이나 알림 활동 로그의 두 번째 탭에서 설정 화면에 접근할 수 있습니다.

Cloud 사용자는 Cloud UI를 통해 제공되는 알림을 사용자 정의할 수 있으며, 이러한 사용자 정의는 각 개별 사용자에게 반영됩니다. Cloud 사용자는 자신의 이메일로 전송되는 알림도 사용자 정의할 수 있지만, 사용자 정의 이메일과 Slack 채널로 전송되는 알림은 관리자 권한이 있는 사용자만 설정할 수 있습니다.

특정 알림의 배달을 구성하려면 연필 아이콘을 클릭하여 알림 배달 채널을 수정합니다.

<Image img={notifications_3} size="md" alt="ClickHouse Cloud notifications settings screen" border/>

<Image img={notifications_4} size="md" alt="ClickHouse Cloud notification delivery settings" border/>

:::note
특정 **필수** 알림, 예를 들어 **결제 실패**와 같은 알림은 구성할 수 없습니다.
:::

## 지원되는 알림 {#supported-notifications}

현재 우리는 청구(결제 실패, 사용량 초과 등)와 관련된 알림 및 확장 이벤트(확장 완료, 확장 차단 등)와 관련된 알림을 전송합니다.
