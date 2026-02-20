---
slug: /use-cases/observability/clickstack/alerts
title: 'ClickStack에서 알림 사용하기'
sidebar_label: '알림'
pagination_prev: null
pagination_next: null
description: 'ClickStack에서 알림 사용하기'
doc_type: 'guide'
keywords: ['ClickStack', 'observability', 'alerts', 'search-alerts', 'notifications', 'thresholds', 'slack', 'email', 'pagerduty', 'error-monitoring', 'performance-monitoring', 'user-events']
---

import Image from '@theme/IdealImage';
import search_alert from '@site/static/images/use-cases/observability/search_alert.png';
import edit_chart_alert from '@site/static/images/use-cases/observability/edit_chart_alert.png';
import add_chart_alert from '@site/static/images/use-cases/observability/add_chart_alert.png';
import create_chart_alert from '@site/static/images/use-cases/observability/create_chart_alert.png';
import alerts_search_view from '@site/static/images/use-cases/observability/alerts_search_view.png';
import add_new_webhook from '@site/static/images/use-cases/observability/add_new_webhook.png';
import add_webhook_dialog from '@site/static/images/use-cases/observability/add_webhook_dialog.png';
import manage_alerts from '@site/static/images/use-cases/observability/manage_alerts.png';
import alerts_view from '@site/static/images/use-cases/observability/alerts_view.png';
import multiple_search_alerts from '@site/static/images/use-cases/observability/multiple_search_alerts.png';
import remove_chart_alert from '@site/static/images/use-cases/observability/remove_chart_alert.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack에는 알림 기능이 기본으로 포함되어 있어 로그, 메트릭, 트레이스 전반에서 팀이 실시간으로 문제를 감지하고 대응할 수 있습니다.

알림은 HyperDX 인터페이스에서 직접 생성할 수 있으며 Slack, PagerDuty와 같은 대표적인 알림 시스템과 연동됩니다.

알림 기능은 ClickStack 데이터 전반에서 원활하게 동작하여 시스템 상태를 추적하고, 성능 회귀(regression)를 포착하며, 주요 비즈니스 이벤트를 모니터링하는 데 도움이 됩니다.


## 알림 유형 \{#types-of-alerts\}

ClickStack는 상호 보완적인 두 가지 방식으로 알림을 생성할 수 있습니다: **검색 알림(Search alerts)**과 **대시보드 차트 알림(Dashboard chart alerts)**입니다. 알림이 생성되면 해당 검색 또는 차트에 연결됩니다.

### 1. Search alerts \{#search-alerts\}

Search alert를 사용하면 저장된 검색 결과를 기반으로 알림을 트리거할 수 있습니다. 이를 통해 특정 이벤트나 패턴이 예상보다 더 자주(또는 더 적게) 발생할 때 이를 감지할 수 있습니다.

정의된 시간 범위 내에서 일치하는 결과 개수가 지정된 임계값을 초과하거나 그 미만으로 떨어지면 알림이 트리거됩니다.

Search alert를 생성하려면:

<VerticalStepper headerLevel="h4">

검색에 대한 alert를 생성하려면 해당 검색이 저장되어 있어야 합니다. 기존에 저장된 검색에 대해 alert를 생성하거나, alert 생성 과정에서 검색을 저장할 수 있습니다. 아래 예시에서는 검색이 아직 저장되지 않았다고 가정합니다.

#### Open alert creation dialog \{#open-dialog\}

먼저 [search](/use-cases/observability/clickstack/search)를 입력한 다음, `Search` 페이지 우측 상단에 있는 `Alerts` 버튼을 클릭합니다.

<Image img={alerts_search_view} alt="Alerts 검색 화면" size="lg"/>

#### Create the alert \{#create-the-alert\}

Alert 생성 패널에서 다음을 수행할 수 있습니다:

- Alert와 연결된 저장된 검색에 이름을 지정합니다.
- 임계값을 설정하고, 주어진 기간 동안 해당 임계값에 도달해야 하는 횟수를 지정합니다. 임계값은 상한 또는 하한으로도 사용할 수 있습니다. 여기에서 설정한 기간은 alert가 얼마나 자주 트리거되는지도 결정합니다.
- `grouped by` 값을 지정합니다. 이를 통해 `ServiceName`과 같이 검색 결과에 집계를 적용하여 동일한 검색에서 여러 개의 alert를 트리거할 수 있습니다.
- 알림을 전송할 webhook 목적지를 선택합니다. 이 화면에서 바로 새로운 webhook을 추가할 수 있습니다. 자세한 내용은 [Adding a webhook](#add-webhook)을 참고하십시오.

저장하기 전에 ClickStack에서 임계값 조건을 시각화하여, 설정한 대로 동작하는지 확인할 수 있습니다.

<Image img={search_alert} alt="Search alerts" size="lg"/>

</VerticalStepper>

하나의 검색에 여러 alert를 추가할 수 있습니다. 위 과정을 반복하면, 현재 alert들이 alert 편집 대화 상자 상단의 탭으로 표시되며 각 alert에는 번호가 할당됩니다.

<Image img={multiple_search_alerts} alt="여러 개의 alert" size="md"/>

### 2. 대시보드 차트 알림 \{#dashboard-alerts\}

대시보드 알림은 차트에 대한 알림 기능을 확장합니다.

저장된 대시보드에서 직접 차트 기반 알림을 생성할 수 있으며, 이를 통해 전체 SQL 집계와 ClickHouse 함수로 고급 계산을 수행할 수 있습니다.

지표가 정의된 임계값을 초과하거나 하회하면 알림이 자동으로 트리거되어, KPI, 지연 시간 또는 기타 주요 지표를 시간 경과에 따라 모니터링할 수 있습니다.

:::note
대시보드의 시각화에 대해 알림을 생성하려면, 해당 대시보드가 저장된 상태여야 합니다.
:::

대시보드 알림을 추가하려면 다음 단계를 수행합니다.

<VerticalStepper headerLevel="h4">

알림은 차트 생성 과정에서, 차트를 대시보드에 추가할 때, 또는 기존 차트에 나중에 추가할 수 있습니다. 아래 예에서는 차트가 이미 대시보드에 존재한다고 가정합니다.

#### 차트 편집 대화상자 열기 \{#open-chart-dialog\}

차트의 구성 메뉴를 열고 알림 버튼을 선택합니다. 그러면 차트 편집 대화상자가 표시됩니다.

<Image img={edit_chart_alert} alt="차트 알림 편집" size="lg"/>

#### 알림 추가 \{#add-chart-alert\}

**Add Alert**를 선택합니다.

<Image img={add_chart_alert} alt="차트에 알림 추가" size="lg"/>

#### 알림 조건 정의 \{#define-alert-conditions\}

조건(`>=`, `<`), 임계값, 기간, 그리고 웹후크(webhook)를 정의합니다. 여기에서 설정한 기간은 알림이 얼마나 자주 트리거되는지도 결정합니다.

<Image img={create_chart_alert} alt="차트에 대한 알림 생성" size="lg"/>

이 화면에서 바로 새로운 웹후크(webhook)를 추가할 수 있습니다. 자세한 내용은 [웹후크 추가](#add-webhook)를 참조하십시오.

</VerticalStepper>

## 웹훅 추가하기 \{#add-webhook\}

알림을 생성할 때 기존 웹훅을 사용하거나 새 웹훅을 생성할 수 있습니다. 한 번 생성한 웹훅은 다른 알림에서도 재사용할 수 있습니다.

웹훅은 Slack, PagerDuty를 비롯한 여러 서비스 유형뿐 아니라 일반(generic) 대상에 대해서도 생성할 수 있습니다.

예를 들어, 아래 차트에 대한 알림을 생성하는 예를 살펴보겠습니다. 웹훅을 지정하기 전에 사용자는 `Add New Webhook`을 선택할 수 있습니다.

<Image img={add_new_webhook} alt="새 웹훅 추가" size="lg"/>

이 작업을 수행하면 새 웹훅을 생성할 수 있는 웹훅 생성 대화 상자가 열립니다.

<Image img={add_webhook_dialog} alt="웹훅 생성" size="md"/>

웹훅 이름은 필수이며 설명은 선택 사항입니다. 그 밖에 반드시 입력해야 하는 설정은 서비스 유형에 따라 달라집니다.

ClickStack Open Source와 ClickStack Cloud 간에는 사용 가능한 서비스 유형이 다릅니다. 자세한 내용은 [서비스 유형 연동](#integrations)을 참고하십시오.

### 서비스 유형 통합 \{#integrations\}

ClickStack 경고는 기본적으로 다음 서비스 유형과 통합됩니다:

- **Slack**: 웹훅 또는 API를 통해 채널로 알림을 직접 전송합니다.
- **PagerDuty**: PagerDuty API를 통해 온콜 담당 팀으로 인시던트를 라우팅합니다.
- **Webhook**: 일반 웹훅을 사용하여 임의의 사용자 정의 시스템이나 워크플로에 경고를 연결합니다.

:::note ClickHouse Cloud 전용 통합
Slack API 및 PagerDuty 통합은 ClickHouse Cloud에서만 지원됩니다.
:::

서비스 유형에 따라 제공해야 하는 세부 정보가 달라집니다. 구체적으로:

**Slack (Webhook URL)**

- Webhook URL. 예: `https://hooks.slack.com/services/<unique_path>`. 자세한 내용은 [Slack 문서](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/)를 참고하십시오.

**Slack (API)**

- Slack 봇 토큰. 자세한 내용은 [Slack 문서](https://docs.slack.dev/authentication/tokens/#bot/)를 참고하십시오.

**PagerDuty API**

- PagerDuty 통합 키. 자세한 내용은 [PagerDuty 문서](https://support.pagerduty.com/main/docs/api-access-keys)를 참고하십시오.

**Generic**

- Webhook URL
- Webhook 헤더(선택 사항)
- Webhook 본문(선택 사항). 본문은 현재 `{{title}}`, `{{body}}`, `{{link}}` 템플릿 변수를 지원합니다.

## 경보 관리 \{#managing-alerts\}

경보는 HyperDX 왼쪽 패널의 경보 패널에서 중앙에서 관리할 수 있습니다.

<Image img={manage_alerts} alt="경보 관리" size="lg"/>

이 화면에서 ClickStack 내에서 생성되어 현재 실행 중인 모든 경보를 확인할 수 있습니다.

<Image img={alerts_view} alt="경보 보기" size="lg"/>

이 화면에는 경보의 평가 이력도 표시됩니다. 경보는 반복적인 시간 간격(경보 생성 시 설정한 기간/지속 시간)에 따라 평가됩니다. 각 평가 시 HyperDX가 데이터를 쿼리하여 경보 조건이 충족되었는지 확인합니다.

- **빨간색 막대**: 해당 평가 동안 임계값 조건이 충족되어 경보가 발동됨(알림 전송됨)
- **초록색 막대**: 경보가 평가되었으나 임계값 조건이 충족되지 않음(알림 전송 안 됨)

각 평가는 서로 독립적으로 수행됩니다. 경보는 해당 시간 구간의 데이터를 확인하고, 그 시점에 조건이 참인 경우에만 발동됩니다.

위 예시에서 첫 번째 경보는 모든 평가에서 발동되어 지속적인 문제가 있음을 나타냅니다. 두 번째 경보는 문제가 해결된 상태를 보여 줍니다. 처음 두 번(빨간색 막대)만 발동되었고, 이후 평가에서는 임계값 조건이 더 이상 충족되지 않았습니다(초록색 막대).

경보를 클릭하면 해당 경보가 연결된 차트 또는 검색으로 이동합니다.

### 알림 삭제하기 \{#deleting-alerts\}

알림을 삭제하려면 연결된 검색 또는 차트의 편집 대화 상자를 열고 **Remove Alert**를 선택합니다.
아래 예시에서 `Remove Alert` 버튼을 클릭하면 차트에서 해당 알림이 삭제됩니다.

<Image img={remove_chart_alert} alt="차트 알림 제거" size="lg"/>

## 일반적인 경고 시나리오 \{#common-alert-scenarios\}

다음은 HyperDX를 사용해 구성할 수 있는 일반적인 경고 시나리오입니다.

**오류:** 기본으로 제공되는 저장된 검색 `All Error Events` 및 `HTTP Status >= 400`에 대해 경고를 설정하여, 오류가 과도하게 발생할 때 알림을 받도록 할 것을 권장합니다.

**느린 작업:** 느린 작업(예: `duration:>5000`)을 찾는 검색을 설정한 다음, 느린 작업이 너무 많이 발생할 때 경고가 발생하도록 설정할 수 있습니다.

**사용자 이벤트:** 신규 사용자가 가입하거나 중요한 사용자 작업이 수행될 때 고객 대응 팀이 알림을 받을 수 있도록 경고를 설정할 수도 있습니다.