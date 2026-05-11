---
slug: /use-cases/observability/clickstack/faq
title: 'ClickStack 자주 묻는 질문(FAQ)'
sidebar_label: '자주 묻는 질문(FAQ)'
pagination_prev: null
pagination_next: null
description: 'ClickStack 알림(alerting), 대시보드 및 드릴다운(drill-downs), 메트릭 탐색(metrics discovery)에 대한 자주 묻는 질문을 다룹니다.'
doc_type: 'guide'
keywords: ['ClickStack', 'FAQ', '경보', '대시보드', '드릴다운', '메트릭 탐색']
---

이 페이지에서는 ClickStack의 알림(alerting), 대시보드 및 드릴다운(drill-downs), 메트릭 탐색(metrics discovery) 기능과 관련된 자주 묻는 질문에 답변합니다.

## 경보(Alerting) \{#alerting\}

<details>
<summary><strong>ClickStack에서 지원하는 경보 유형에는 어떤 것이 있습니까?</strong></summary>

ClickStack은 두 가지 유형의 경보를 지원합니다:

- [검색 경보](/use-cases/observability/clickstack/alerts#search-alerts) — 지정된 시간 창에서 조건에 일치하는 로그 또는 트레이스 결과의 개수가 임계값을 초과하거나 미만일 때 알림을 트리거합니다.
- [대시보드 차트 경보](/use-cases/observability/clickstack/alerts#dashboard-alerts) — 대시보드 타일에 표시된 메트릭이 정의된 임계값을 초과하거나 하회할 때 알림을 트리거합니다.

두 경보 유형 모두 정적 임계값 조건을 사용합니다. 자세한 내용은 [Alerts](/use-cases/observability/clickstack/alerts)를 참고하십시오.

</details>

<details>
<summary><strong>비율, p95/p99, 다중 메트릭 수식과 같은 복잡한 메트릭 조건에 대해 경보를 설정할 수 있습니까?</strong></summary>

두 메트릭의 비율 및 p95, p99 값은 [차트 빌더](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer) UI를 사용하여 대시보드 타일에 시각화할 수 있습니다. 그런 다음 해당 타일에 임계값 기반 경보를 생성할 수 있습니다.

하지만 현재 ClickStack은 다음을 지원하지 않습니다:

- 메트릭에 대한 사용자 정의 SQL 쿼리를 기반으로 한 경보
- 여러 조건 또는 여러 메트릭을 하나의 경보 규칙으로 결합한 경보
- 동적 또는 이상 탐지 기반 경보 조건(이상 탐지는 향후 지원 예정)

복잡한 메트릭에 대해 경보가 필요한 경우, 먼저 대시보드 차트로 시각화를 구성한 뒤 그 차트에 임계값 경보를 연결하는 방식이 권장됩니다.

</details>

<details>
<summary><strong>경보 사용 사례에 materialized view를 사용할 수 있습니까?</strong></summary>

materialized view는 적용 가능한 경보의 경우 ClickStack에서 자동으로 사용됩니다. 다만, 현재 OpenTelemetry 메트릭 데이터 소스에는 materialized view가 지원되지 않습니다. 메트릭의 경우 ClickStack은 기본 [ClickHouse OpenTelemetry 메트릭 스키마](/use-cases/observability/clickstack/ingesting-data/schemas)를 사용할 때 가장 잘 동작합니다. materialized view에 대한 자세한 내용은 [Materialized views](/use-cases/observability/clickstack/materialized_views)를 참고하십시오.

</details>

## 대시보드와 드릴다운 \{#dashboards-and-drill-downs\}

<details>
<summary><strong>ClickStack은 매개변수화된 대시보드나 대시보드 변수 기능을 지원합니까?</strong></summary>

ClickStack은 대시보드에서 ClickHouse로부터 조회한 데이터로 채워지는 사용자 지정 드롭다운 필터를 지원합니다. 이 필터를 사용하면 대시보드의 모든 타일을 특정 값(예: 서비스 이름, 환경, 호스트)에 동적으로 범위를 지정할 수 있습니다.

현재 ClickStack은 Grafana 템플릿 변수 스타일의 재사용 가능한 대시보드 변수는 지원하지 않습니다. ClickStack은 데이터 소스로 ClickHouse만을 사용하므로, 별도의 변수 추상화 계층 없이도 드릴다운 및 필터링 기능을 기본적으로 제공합니다.

대시보드를 생성하고 필터를 적용하는 방법에 대한 자세한 내용은 [Dashboards](/use-cases/observability/clickstack/dashboards)를 참고하십시오.

</details>

<details>
<summary><strong>어떤 드릴다운 기능을 사용할 수 있습니까?</strong></summary>

ClickStack은 다음과 같은 드릴다운 워크플로를 지원합니다.

- [대시보드 수준 필터링](/use-cases/observability/clickstack/dashboards#filter-dashboards) — 대시보드 수준에서 적용된 Lucene 또는 SQL 필터와 시간 범위 조정이 모든 타일에 전파됩니다.
- 사용자 지정 대시보드 필터 — 사용자 지정 대시보드는 데이터에서 가져온 값으로 채워지는 명시적인 필터 컨트롤을 지원하여, 사용자가 쿼리를 직접 작성하지 않고도 모든 타일의 범위를 지정할 수 있습니다.
- 클릭하여 이벤트 보기 — 대시보드 타일의 데이터를 클릭하고 **View Events**를 선택하면, 관련 로그 및 트레이스 데이터에 대한 필터가 적용된 상태로 [Search](/use-cases/observability/clickstack/search) 페이지로 이동합니다.
- [미리 구성된 대시보드 드릴다운](/use-cases/observability/clickstack/dashboards#presets) — [Services](/use-cases/observability/clickstack/dashboards#services-dashboard), [ClickHouse](/use-cases/observability/clickstack/dashboards#clickhouse-dashboard), [Kubernetes](/use-cases/observability/clickstack/dashboards#kubernetes-dashboard) 대시보드는 탭 간에 더 풍부하고 내장된 드릴다운 내비게이션을 제공합니다.

하나의 사용자 지정 대시보드에서 다른 대시보드로 이어지는 다단계 드릴다운(대시보드 → 대시보드 → 상세 보기)은 현재 지원되지 않습니다.

:::note
**View Events** 드릴다운은 로그 및 트레이스 데이터에서 가장 잘 동작합니다. 메트릭 데이터는 [Search](/use-cases/observability/clickstack/search) 페이지에서 직접 볼 수 없으므로, 메트릭 타일에서 드릴다운하는 경우 선택한 시간대 주변의 로그로 연결됩니다.
:::

</details>

## 메트릭 탐색 \{#metrics-discovery\}

<details>
<summary><strong>메트릭을 탐색하고 검색할 수 있는 UI가 있습니까?</strong></summary>

![Metric Attribute Explorer](/images/clickstack/faq/metrics-explorer.png)

메트릭 이름은 [차트 빌더](/use-cases/observability/clickstack/dashboards#navigate-chart-explorer)의 메트릭 이름 드롭다운을 통해 발견할 수 있습니다. 메트릭을 선택하면 Metric Attribute Explorer 패널에 메트릭의 설명, 단위, 사용 가능한 속성과 해당 값이 표시됩니다. 이를 통해 속성을 살펴보고 패널에서 바로 필터 또는 group by 필드로 추가할 수 있습니다.

현재는 로그 검색 환경과 유사한 전용 메트릭 검색 페이지가 없습니다. 메트릭 디스커버리 기능 개선은 활발히 진행 중인 개발 영역입니다.

</details>

<details>
<summary><strong>SQL 기반 탐색이 메트릭에 대한 장기적인 접근 방식으로 의도된 것입니까?</strong></summary>

아닙니다. 현재는 SQL 쿼리를 사용해 메트릭을 탐색할 수 있지만, 이것이 장기적인 접근 방식으로 의도된 것은 아닙니다. 개선된 메트릭 디스커버리 도구가 활발히 개발되고 있습니다.

</details>

## 추가로 읽어볼 자료 \{#further-reading\}

- [Alerts](/use-cases/observability/clickstack/alerts) — 검색 알림, 대시보드 차트 알림, 웹훅 연동.
- [Dashboards](/use-cases/observability/clickstack/dashboards) — 시각화 생성, 대시보드 구성, 필터 적용.
- [Search](/use-cases/observability/clickstack/search) — Lucene 및 SQL 문법을 사용한 로그와 트레이스 쿼리.
- [Schemas](/use-cases/observability/clickstack/ingesting-data/schemas) — 로그, 트레이스, 메트릭을 위한 OpenTelemetry 데이터 스키마.
- [Architecture](/use-cases/observability/clickstack/architecture) — ClickStack 구성 요소와 이들이 결합되는 방식.