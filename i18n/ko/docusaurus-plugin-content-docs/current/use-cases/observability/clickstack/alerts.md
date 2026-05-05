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
import add_raw_sql_alert from '@site/static/images/use-cases/observability/add_raw_sql_alert.png';
import open_sql_chart_mode from '@site/static/images/use-cases/observability/open_sql_chart_mode.png';
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

  #### 차트 편집 대화상자 열기

  차트의 구성 메뉴를 열고 알림 버튼을 선택합니다. 그러면 차트 편집 대화상자가 표시됩니다.

  <Image img={edit_chart_alert} alt="차트 알림 편집" size="lg" />

  #### 알림 추가

  **Add Alert**를 선택합니다.

  <Image img={add_chart_alert} alt="차트에 알림 추가" size="lg" />

  #### 알림 조건 정의

  조건(`>=`, `>`, `<=`, `<`, `=`, `!=`, `<= x >=`, `> or <`), 임계값, 기간, 그리고 웹훅(webhook)를 정의합니다. 여기에서 설정한 기간은 알림이 얼마나 자주 트리거되는지도 결정합니다.

  <Image img={create_chart_alert} alt="차트에 대한 알림 생성" size="lg" />

  이 화면에서 바로 새로운 웹훅(webhook)를 추가할 수 있습니다. 자세한 내용은 [웹훅 추가](#add-webhook)를 참조하십시오.
</VerticalStepper>

## 웹훅 추가하기 {#add-webhook}

알림을 생성할 때 기존 웹훅을 사용하거나 새 웹훅을 생성할 수 있습니다. 한 번 생성한 웹훅은 다른 알림에서도 재사용할 수 있습니다.

웹훅은 Slack, PagerDuty를 비롯한 여러 서비스 유형뿐 아니라 일반(generic) 대상에 대해서도 생성할 수 있습니다.

예를 들어, 아래 차트에 대한 알림을 생성하는 예를 살펴보겠습니다. 웹훅을 지정하기 전에 사용자는 `Add New Webhook`을 선택할 수 있습니다.

<Image img={add_new_webhook} alt="새 웹훅 추가" size="lg"/>

이 작업을 수행하면 새 웹훅을 생성할 수 있는 웹훅 생성 대화 상자가 열립니다.

<Image img={add_webhook_dialog} alt="웹훅 생성" size="md"/>

웹훅 이름은 필수이며 설명은 선택 사항입니다. 그 밖에 반드시 입력해야 하는 설정은 서비스 유형에 따라 달라집니다.

ClickStack Open Source와 ClickStack Cloud 간에는 사용 가능한 서비스 유형이 다릅니다. 자세한 내용은 [서비스 유형 연동](#integrations)을 참고하십시오.

### 서비스 유형 통합 {#integrations}

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

## 경보 관리 {#managing-alerts}

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

### 알림 삭제하기 {#deleting-alerts}

알림을 삭제하려면 연결된 검색 또는 차트의 편집 대화 상자를 열고 **Remove Alert**를 선택합니다.
아래 예시에서 `Remove Alert` 버튼을 클릭하면 차트에서 해당 알림이 삭제됩니다.

<Image img={remove_chart_alert} alt="차트 알림 제거" size="lg"/>

## SQL 기반 차트 알림

SQL 기반 차트 알림을 사용하면 원하는 ClickHouse SQL을 작성해 알림 조건을 정의할 수 있습니다. 이를 통해 필터링, 집계, 계산을 완전히 제어할 수 있으며, SQL로 표현할 수 있는 모든 내용을 알림으로 만들 수 있습니다.

### 지원되는 차트 타입

SQL 기반 알림은 3가지 차트 표시 타입에서 지원됩니다.

| 차트 타입           | 동작                                                                 |
| --------------- | ------------------------------------------------------------------ |
| **줄**        | 시계열 알림입니다. 쿼리는 시간 버킷으로 구분된 행을 생성해야 합니다. 각 버킷은 임계값에 대해 개별적으로 평가됩니다. |
| **Stacked Bar** | 시계열 알림입니다. 줄과 동일하게 동작합니다.                                       |
| **Number**      | 단일 값 알림입니다. 쿼리는 단일 숫자 결과를 반환하며, 평가 시마다 한 번 임계값과 비교됩니다.             |

그 밖의 SQL 기반 차트 타입(Table, Pie, Heatmap 등)은 알림을 지원하지 않습니다.

### SQL 알림 생성하기 \{#deleting-alerts\}

SQL 기반 차트에 알림을 생성하려면 다음 단계를 따르십시오.

<VerticalStepper headerLevel="h4">
  #### 대시보드에서 SQL 기반 차트 생성 또는 열기

  저장된 대시보드에서 [**SQL** 차트 모드로 새 차트를 생성](./dashboards/sql-visualizations.md)하거나, 기존 SQL 기반 차트를 열어 편집합니다.

  표시 유형으로 **줄**, **Stacked Bar** 또는 **Number**를 선택합니다.

  <Image img={open_sql_chart_mode} alt="SQL 차트 생성" size="lg" />

  #### 알림 추가

  차트 편집기의 알림 섹션에서 **Add Alert**를 선택합니다. 다음 항목을 설정합니다.

  * **Threshold type**: `>=` (크거나 같음), `>` (큼), `<=` (작거나 같음), `<` (작음), `=` (같음), `!=` (같지 않음), `<= x >=` (범위 내), 또는 `> or <` (범위 밖)
  * **Threshold value**: 비교할 숫자 값
  * **Interval**: 알림을 평가하는 주기(1m, 5m, 15m, 30m, 1h, 6h, 12h 또는 1d)입니다. 각 평가에 적용되는 시간 범위도 함께 결정합니다.
  * **웹훅**: 알림이 트리거될 때 사용할 알림 채널입니다. [웹훅 추가](#add-webhook)를 참조하십시오.

  <Image img={add_raw_sql_alert} alt="차트 알림 편집" size="lg" />

  :::warning 알림 시간 범위
  일반적으로 알림 쿼리는 각 인터벌마다 한 번씩 실행됩니다. 그러나 오류나 쿼리 지연으로 하나 이상의 인터벌이 건너뛰어진 경우, 다음 실행에서는 누락된 인터벌이 포함된 시간 범위를 사용합니다. 이 경우 쿼리의 인터벌 매개변수는 여전히 알림에 설정된 주기를 사용하지만, 시간 범위 매개변수는 더 긴 시간 범위를 반영합니다.
  :::

  #### 대시보드 저장

  알림을 활성화하려면 대시보드를 저장합니다. 알림은 설정된 인터벌에 따라 평가를 시작합니다.
</VerticalStepper>

### 쿼리 결과가 해석되는 방식

알림 시스템은 SQL 쿼리가 반환하는 컬럼을 검사하여 임계값과 비교할 대상을 결정합니다.

* **값 컬럼**: `SELECT` 절의 **마지막 숫자 컬럼**이 알림 값으로 사용됩니다. 쿼리가 여러 숫자 컬럼(예: `count, avg_latency, p99_latency`)을 반환하는 경우, 마지막 컬럼인 `p99_latency`만 임계값과 비교됩니다.
* **타임스탬프 컬럼**: 시계열 차트(Line 및 Stacked Bar)에서는 결과의 Date/DateTime 컬럼이 시간 버킷, 즉 시계열 차트의 x축으로 식별됩니다. 각 시간 버킷의 값 컬럼은 임계값에 대해 개별적으로 평가되며, 어느 한 시간 버킷에서라도 값이 구성된 임계값을 초과하면 알림이 트리거됩니다.
* **그룹 컬럼**: 숫자 컬럼도 아니고 타임스탬프 컬럼도 아닌 모든 컬럼(예: `ServiceName`, `Environment`)은 그룹화 차원으로 처리됩니다. 그룹이 있으면 각 고유한 그룹 값 조합이 별도로 추적되며, 각각에 대해 알림이 생성됩니다. ClickStack은 구성된 임계값을 초과하는 값을 가진 각 그룹마다 알림을 전송합니다. 그룹은 시계열 차트에서만 사용할 수 있습니다.

### 쿼리 매개변수와 매크로 \{#supported-chart-types\}

SQL 알림 쿼리에서는 평가 시 자동으로 대체되는 템플릿 매개변수와 매크로를 지원합니다. 이는 [SQL 기반 차트를 구축할 때](./dashboards/sql-visualizations.md) 사용할 수 있는 매개변수 및 매크로와 동일합니다.

#### 필수 및 권장 매개변수

선 또는 누적 막대형 차트 알림에 사용하는 쿼리에는 **반드시** 인터벌 매개변수 또는 매크로(`{intervalSeconds:Int64}`, `{intervalMilliseconds:Int64}`, `$__timeInterval(col)`, 또는 `$__timeInterval_ms(col)`)가 포함되어야 합니다. 알림이 실행될 때 이 값은 알림에 설정된 기간으로 대체됩니다.

알림에 사용하는 쿼리에는 **가능하면** 시간 범위 필터(`{startDateMilliseconds:Int64}` 및 `{endDateMilliseconds:Int64}`, 또는 `$__timeFilter(col)` 등)를 포함하는 것이 좋습니다. 쿼리에 시간 범위 필터가 포함되어 있는지와 관계없이 알림 쿼리는 알림에 설정된 기간을 기준으로 실행됩니다. 시간 범위 필터가 없으면 쿼리는 실행될 때마다 소스 테이블에서 사용 가능한 전체 시간 범위를 조회합니다.

:::warning 알림 시간 범위
일반적으로 알림 쿼리는 인터벌마다 한 번씩 실행됩니다. 그러나 오류 또는 느린 쿼리로 인해 하나 이상의 인터벌을 건너뛰면, 다음 실행에서는 누락된 인터벌이 포함된 시간 범위를 사용합니다. 이 경우 쿼리의 인터벌 매개변수는 계속 알림에 설정된 기간으로 지정되지만, 시간 범위 매개변수에는 더 긴 시간 범위가 반영됩니다.
:::

### 알림 쿼리 예시

#### 서비스별 오류율 (시계열) \{#add-sql-alert\}

트래픽이 적은 서비스에서 불필요한 알림이 발생하지 않도록, 알림 기간 동안 요청 수가 최소 10건 이상인 서비스에서 오류율이 5%를 초과할 때만 알림을 발생시킵니다.

```sql
WITH error_rates AS (
  SELECT
    $__timeInterval(Timestamp) as ts,
    ServiceName,
    countIf (SpanKind = 'Server') as request_count,
    countIf (
      SpanKind = 'Server'
      and StatusCode = 'Error'
    ) as error_count,
    error_count / request_count * 100 AS error_percent
  FROM $__sourceTable
  WHERE $__timeFilter(Timestamp)
  GROUP BY ts, ServiceName
)
SELECT ts, ServiceName, error_percent
FROM error_rates
WHERE request_count > 10
```

**표시 유형**: 줄 또는 Stacked Bar
**임계값**: `>= 5` (오류 비율이 5%에 도달하면 트리거됨)

이 쿼리에서 `ServiceName`은 숫자형 컬럼도 타임스탬프 컬럼도 아니므로 각 서비스가 별도의 알림 그룹으로 추적됩니다. 알림은 서비스별로 독립적으로 트리거됩니다.

#### 후행 평균을 사용한 이상 탐지(시계열) \{#save-sql-dashboard\}

이동 평균에서 표준편차의 2배를 초과할 정도로 오류 수가 증가할 때 알림을 설정합니다. 이렇게 하면 고정 임계값이 아니라 최근의 기준 동작과 비교해 급증한 패턴을 포착할 수 있습니다.

```sql
WITH buckets AS (
  SELECT
    $__timeInterval(Timestamp) AS ts,
    count() AS bucket_count
  FROM $__sourceTable
  WHERE TimestampTime >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
        - toIntervalSecond($__interval_s * 30) -- Fetch 30 intervals back
    AND TimestampTime < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
    AND SeverityText = 'error'
  GROUP BY ts
  ORDER BY ts
  WITH FILL
    FROM toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))
    TO toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))
    STEP toIntervalSecond($__interval_s)
),

anomaly_detection AS (
  SELECT
    ts,
    bucket_count,
    avg(bucket_count) OVER (
      ORDER BY ts ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING
    ) AS previous_30_avg,
    stddevPop(bucket_count) OVER (
      ORDER BY ts ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING
    ) AS previous_30_stddev,
    greatest(
      bucket_count - (previous_30_avg + 2 * previous_30_stddev), 0
    ) AS excess_error_count
  FROM buckets
)

SELECT ts, excess_error_count
FROM anomaly_detection
WHERE ts >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
  AND ts < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
```

**표시 유형**: 줄
**임계값**: `> 0` (이동 기준선을 초과하는 오류가 감지되면 알림이 발생합니다)

이 쿼리는 이동 윈도 계산의 초기값을 설정하기 위해 날짜 범위 시작 *이전* 30개 인터벌을 먼저 가져온 다음, 최종 출력은 평가 윈도에 해당하는 부분만 필터링합니다.

## 일반적인 경고 시나리오 {#common-alert-scenarios}

다음은 HyperDX를 사용해 구성할 수 있는 일반적인 경고 시나리오입니다.

**오류:** 기본으로 제공되는 저장된 검색 `All Error Events` 및 `HTTP Status >= 400`에 대해 경고를 설정하여, 오류가 과도하게 발생할 때 알림을 받도록 할 것을 권장합니다.

**느린 작업:** 느린 작업(예: `duration:>5000`)을 찾는 검색을 설정한 다음, 느린 작업이 너무 많이 발생할 때 경고가 발생하도록 설정할 수 있습니다.

**사용자 이벤트:** 신규 사용자가 가입하거나 중요한 사용자 작업이 수행될 때 고객 대응 팀이 알림을 받을 수 있도록 경고를 설정할 수도 있습니다.