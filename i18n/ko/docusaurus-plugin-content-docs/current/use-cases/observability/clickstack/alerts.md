---
'slug': '/use-cases/observability/clickstack/alerts'
'title': 'ClickStack로 검색하기'
'sidebar_label': '알림'
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack로 알림'
'doc_type': 'guide'
'keywords':
- 'ClickStack'
- 'observability'
- 'alerts'
- 'search-alerts'
- 'notifications'
- 'thresholds'
- 'slack'
- 'email'
- 'pagerduty'
- 'error-monitoring'
- 'performance-monitoring'
- 'user-events'
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

## ClickStack에서의 알림 {#alerting-in-clickstack}

ClickStack은 알림을 위한 기본 제공 지원을 포함하고 있어 팀이 로그, 메트릭 및 추적에서 문제를 실시간으로 감지하고 대응할 수 있도록 합니다.

알림은 HyperDX 인터페이스에서 직접 생성할 수 있으며, Slack 및 PagerDuty와 같은 인기 있는 알림 시스템과 통합됩니다.

알림은 ClickStack 데이터 전반에 걸쳐 원활하게 작동하여 시스템 상태를 추적하고 성능 퇴화를 잡아내며 주요 비즈니스 이벤트를 모니터링하는 데 도움을 줍니다.

## 알림 유형 {#types-of-alerts}

ClickStack은 **검색 알림**과 **대시보드 차트 알림** 등 알림 생성을 위한 두 가지 상호 보완적인 방법을 지원합니다. 알림이 생성되면 검색 또는 차트 중 하나에 연결됩니다.

### 1. 검색 알림 {#search-alerts}

검색 알림은 저장된 검색 결과를 기반으로 알림을 트리거할 수 있도록 합니다. 이는 특정 이벤트나 패턴이 예상보다 더 자주(또는 덜 자주) 발생할 때 감지하는 데 도움을 줍니다.

정의된 시간 창 내에서 일치하는 결과 수가 특정 임계값을 초과하거나 미만일 때 알림이 트리거됩니다.

검색 알림을 생성하려면:

<VerticalStepper headerLevel="h4">

검색에 대한 알림을 생성하려면 검색이 저장되어 있어야 합니다. 사용자는 기존 저장 검색에 대해 알림을 생성하거나 알림 생성 과정 중 검색을 저장할 수 있습니다. 아래 예에서는 검색이 저장되지 않았다고 가정합니다.

#### 알림 생성 대화상자 열기 {#open-dialog}

[검색](/use-cases/observability/clickstack/search)을 입력하고 `Search` 페이지의 우측 상단 모서리에 있는 `Alerts` 버튼을 클릭하여 시작합니다.

<Image img={alerts_search_view} alt="Alerts search view" size="lg"/>

#### 알림 생성 {#create-the-alert}

알림 생성 패널에서 다음을 수행할 수 있습니다:

- 알림과 연결된 저장 검색에 이름을 지정합니다.
- 임계값을 설정하고 주어진 기간 내에 몇 번 도달해야 하는지를 지정합니다. 임계값은 상한 또는 하한으로도 사용될 수 있습니다. 여기서 기간은 알림이 얼마나 자주 트리거되는지를 결정합니다.
- `grouped by` 값을 지정합니다. 이를 통해 검색이 집계의 적용을 받을 수 있으며, 예를 들어 `ServiceName` 등으로 여러 알림을 동일한 검색으로 트리거할 수 있습니다.
- 알림에 대한 웹훅 대상을 선택합니다. 이 보기에서 새로운 웹훅을 추가할 수 있습니다. 자세한 내용은 [웹훅 추가하기](#add-webhook)를 참조하세요.

저장하기 전에 ClickStack은 임계값 조건을 시각화하여 원하는 대로 작동할 것인지 확인할 수 있도록 합니다.

<Image img={search_alert} alt="Search alerts" size="lg"/>

</VerticalStepper>

여러 알림을 검색에 추가할 수 있다는 점에 유의하세요. 위 프로세스가 반복되면 사용자는 편집 알림 대화 상자의 상단에서 현재 알림을 탭 형태로 보게 되며, 각 알림에는 번호가 할당됩니다.

<Image img={multiple_search_alerts} alt="Multiple alerts" size="md"/>

### 2. 대시보드 차트 알림 {#dashboard-alerts}

대시보드 알림은 차트에 대한 알림 기능을 확장합니다.

저장된 대시보드에서 직접 차트 기반 알림을 생성할 수 있으며, 전체 SQL 집계와 ClickHouse 함수를 통해 고급 계산을 수행합니다.

메트릭이 정의된 임계값을 초과할 경우 알림이 자동으로 트리거되어 시간이 지남에 따라 KPI, 지연 시간 또는 기타 주요 메트릭을 모니터링할 수 있도록 합니다.

:::note
대시보드의 시각화에 대한 알림을 생성하려면 대시보드가 저장되어 있어야 합니다.
:::

대시보드 알림을 추가하려면:

<VerticalStepper headerLevel="h4">

알림은 차트를 생성하는 과정 중, 대시보드에 차트를 추가할 때, 또는 기존 차트에 추가될 수 있습니다. 아래 예에서는 차트가 이미 대시보드에 존재한다고 가정합니다.

#### 차트 편집 대화상자 열기 {#open-chart-dialog}

차트의 구성 메뉴를 열고 알림 버튼을 선택합니다. 그러면 차트 편집 대화상자가 표시됩니다.

<Image img={edit_chart_alert} alt="Edit chart alert" size="lg"/>

#### 알림 추가 {#add-chart-alert}

**Add Alert**를 선택합니다.

<Image img={add_chart_alert} alt="Add alert to chart" size="lg"/>

#### 알림 조건 정의 {#define-alert-conditions}

조건(`>=`, `<`), 임계값, 기간 및 웹훅을 정의합니다. 여기서 기간은 알림이 얼마나 자주 트리거되는지를 결정합니다.

<Image img={create_chart_alert} alt="Create alert for chart" size="lg"/>

이 보기에서 새로운 웹훅을 직접 추가할 수 있습니다. 자세한 내용은 [웹훅 추가하기](#add-webhook)를 참조하세요.

</VerticalStepper>

## 웹훅 추가하기 {#add-webhook}

알림 생성 중 사용자는 기존 웹훅을 사용하거나 새로 생성할 수 있습니다. 생성된 웹훅은 다른 알림에서 재사용할 수 있습니다.

웹훅은 Slack 및 PagerDuty를 포함한 다양한 서비스 유형에 대해 생성할 수 있으며, 일반적인 대상에도 연결할 수 있습니다.

예를 들어, 아래 차트에 대한 알림 생성을 고려해 보겠습니다. 웹훅을 지정하기 전에 사용자는 `Add New Webhook`을 선택할 수 있습니다.

<Image img={add_new_webhook} alt="Add new webhook" size="lg"/>

이것은 웹훅 생성 대화상자를 열어 사용자가 새로운 웹훅을 생성할 수 있습니다:

<Image img={add_webhook_dialog} alt="Webhook creation" size="md"/>

웹훅 이름은 필수이며, 설명은 선택 사항입니다. 완료해야 하는 다른 설정은 서비스 유형에 따라 다릅니다.

ClickStack Open Source와 ClickStack Cloud 간에 사용 가능한 서비스 유형이 다르다는 점에 유의하세요. [서비스 유형 통합](#integrations)을 참조하세요.

### 서비스 유형 통합 {#integrations}

ClickStack 알림은 다음 서비스 유형과 기본 제공 통합됩니다:

- **Slack**: 웹훅 또는 API를 통해 채널에 직접 알림을 전송합니다.
- **PagerDuty**: PagerDuty API를 통해 교대 팀을 위한 사건을 라우팅합니다.
- **Webhook**: 알림을 사용자 정의 시스템이나 워크플로우와 연결합니다.

:::note ClickHouse Cloud 전용 통합
Slack API 및 PagerDuty 통합은 ClickHouse Cloud에서만 지원됩니다.
:::

서비스 유형에 따라 사용자는 다른 세부정보를 제공해야 합니다. 구체적으로:

**Slack (Webhook URL)**

- 웹훅 URL. 예: `https://hooks.slack.com/services/<unique_path>`입니다. 자세한 내용은 [Slack 문서](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/)를 참조하세요.

**Slack (API)**

- Slack 봇 토큰. 자세한 내용은 [Slack 문서](https://docs.slack.dev/authentication/tokens/#bot/)를 참조하세요.

**PagerDuty API**

- PagerDuty 통합 키. 자세한 내용은 [PagerDuty 문서](https://support.pagerduty.com/main/docs/api-access-keys)를 참조하세요.

**일반**

- 웹훅 URL
- 웹훅 헤더(선택 사항)
- 웹훅 본문(선택 사항). 본문은 현재 템플릿 변수 `{{title}}`, `{{body}}`, 및 `{{link}}`를 지원합니다.

## 알림 관리 {#managing-alerts}

알림은 HyperDX의 왼쪽 패널에서 중앙에서 관리할 수 있습니다.

<Image img={manage_alerts} alt="Manage alerts" size="lg"/>

이 보기에서 사용자는 ClickStack에서 생성된 모든 알림을 확인하고 현재 실행 중인 알림을 확인할 수 있습니다.

<Image img={alerts_view} alt="Alerts view" size="lg"/>

이 뷰는 또한 알림 평가 기록을 표시합니다. 알림은 반복적인 시간 간격(알림 생성 중 설정된 기간/지속 시간으로 정의됨)으로 평가됩니다. 각 평가 동안 HyperDX는 데이터에 대해 알림 조건이 충족되는지를 확인하기 위해 쿼리를 실행합니다:

- **빨간 막대**: 이 평가에서 임계값 조건이 충족되어 알림이 발생했습니다(알림 전송됨)
- **녹색 막대**: 알림이 평가되었지만 임계값 조건이 충족되지 않았습니다(알림이 전송되지 않음)

각 평가는 독립적입니다 - 알림은 해당 시간 창에 대한 데이터를 검사하고 조건이 그 시점에 참일 경우에만 발생합니다.

위 예제에서 첫 번째 알림은 모든 평가에서 발생했으며, 이는 지속적인 문제를 나타냅니다. 두 번째 알림은 해결된 문제를 보여주며 - 초기에는 두 번 발생했고(빨간 막대), 이후 평가에서는 임계값 조건이 더 이상 충족되지 않았습니다(녹색 막대).

알림을 클릭하면 알림이 연결된 차트 또는 검색으로 이동합니다.

### 알림 삭제 {#deleting-alerts}

알림을 제거하려면 관련된 검색 또는 차트의 편집 대화상자를 열고 **Remove Alert**를 선택합니다. 아래 예에서 `Remove Alert` 버튼은 차트에서 알림을 제거합니다.

<Image img={remove_chart_alert} alt="Remove chart alert" size="lg"/>

## 일반적인 알림 시나리오 {#common-alert-scenarios}

다음은 HyperDX를 사용할 수 있는 몇 가지 일반적인 알림 시나리오입니다:

**오류:** 기본 `All Error Events` 및 `HTTP Status >= 400` 저장 검색에 대한 알림을 설정하여 과도한 오류가 발생할 때 알림을 받을 것을 권장합니다.

**느린 작업:** 느린 작업(예: `duration:>5000`)에 대한 검색을 설정한 뒤 너무 많은 느린 작업이 발생할 때 알림을 설정할 수 있습니다.

**사용자 이벤트:** 신규 사용자가 가입하거나 중요한 사용자 작업이 수행될 때 고객 대면 팀에 알림을 설정할 수도 있습니다.
