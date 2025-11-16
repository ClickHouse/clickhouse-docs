---
'slug': '/use-cases/observability/clickstack/getting-started/remote-demo-data'
'title': '원격 데모 데이터 세트'
'sidebar_position': 2
'pagination_prev': null
'pagination_next': null
'description': 'ClickStack 및 원격 데모 데이터 세트 시작하기'
'doc_type': 'guide'
'keywords':
- 'clickstack'
- 'example data'
- 'sample dataset'
- 'logs'
- 'observability'
---

import Image from '@theme/IdealImage';
import demo_connection from '@site/static/images/use-cases/observability/hyperdx-demo/demo_connection.png';
import edit_demo_connection from '@site/static/images/use-cases/observability/hyperdx-demo/edit_demo_connection.png';
import edit_demo_source from '@site/static/images/use-cases/observability/hyperdx-demo/edit_demo_source.png';
import step_2 from '@site/static/images/use-cases/observability/hyperdx-demo/step_2.png';
import step_3 from '@site/static/images/use-cases/observability/hyperdx-demo/step_3.png';
import step_4 from '@site/static/images/use-cases/observability/hyperdx-demo/step_4.png';
import step_5 from '@site/static/images/use-cases/observability/hyperdx-demo/step_5.png';
import step_6 from '@site/static/images/use-cases/observability/hyperdx-demo/step_6.png';
import step_7 from '@site/static/images/use-cases/observability/hyperdx-demo/step_7.png';
import step_8 from '@site/static/images/use-cases/observability/hyperdx-demo/step_8.png';
import step_9 from '@site/static/images/use-cases/observability/hyperdx-demo/step_9.png';
import step_10 from '@site/static/images/use-cases/observability/hyperdx-demo/step_10.png';
import step_11 from '@site/static/images/use-cases/observability/hyperdx-demo/step_11.png';
import step_12 from '@site/static/images/use-cases/observability/hyperdx-demo/step_12.png';
import step_13 from '@site/static/images/use-cases/observability/hyperdx-demo/step_13.png';
import step_14 from '@site/static/images/use-cases/observability/hyperdx-demo/step_14.png';
import step_15 from '@site/static/images/use-cases/observability/hyperdx-demo/step_15.png';
import step_16 from '@site/static/images/use-cases/observability/hyperdx-demo/step_16.png';
import step_17 from '@site/static/images/use-cases/observability/hyperdx-demo/step_17.png';
import step_18 from '@site/static/images/use-cases/observability/hyperdx-demo/step_18.png';
import step_19 from '@site/static/images/use-cases/observability/hyperdx-demo/step_19.png';
import step_20 from '@site/static/images/use-cases/observability/hyperdx-demo/step_20.png';
import step_21 from '@site/static/images/use-cases/observability/hyperdx-demo/step_21.png';
import step_22 from '@site/static/images/use-cases/observability/hyperdx-demo/step_22.png';
import step_23 from '@site/static/images/use-cases/observability/hyperdx-demo/step_23.png';
import step_24 from '@site/static/images/use-cases/observability/hyperdx-demo/step_24.png';
import demo_sources from '@site/static/images/use-cases/observability/hyperdx-demo//demo_sources.png';
import edit_connection from '@site/static/images/use-cases/observability/edit_connection.png';
import DemoArchitecture from '@site/i18n/ko/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/example-datasets/_snippets/_demo.md';

**다음 가이드는 [올인원 이미지에 대한 설명](/use-cases/observability/clickstack/getting-started) 또는 [로컬 모드 전용](/use-cases/observability/clickstack/deployment/local-mode-only)을 이용하여 ClickStack을 배포하고 초기 사용자 생성을 완료했다고 가정합니다. 대안으로, 사용자는 모든 로컬 설정을 건너뛰고 ClickStack이 호스팅하는 데모인 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에 간단히 연결할 수 있으며, 이 데이터세트를 사용합니다.**

이 가이드는 [sql.clickhouse.com](https://sql.clickhouse.com)에서 호스팅되는 샘플 데이터세트를 사용하며, 이 데이터세트는 로컬 ClickStack 배포에서 연결할 수 있습니다.

:::warning HyperDX는 ClickHouse Cloud에서 지원되지 않음
ClickHouse Cloud에서 HyperDX가 호스팅될 때 원격 데이터베이스는 지원되지 않습니다. 따라서 이 데이터세트는 지원되지 않습니다.
:::

이 데이터세트에는 ClickHouse 버전의 공식 OpenTelemetry (OTel) 데모에서 캡처된 약 40시간의 데이터가 포함되어 있습니다. 데이터는 매일 밤 재생되며, 타임스탬프는 현재 시간 창에 맞게 조정되므로 사용자는 HyperDX의 통합 로그, 추적 및 메트릭을 사용하여 시스템 동작을 탐색할 수 있습니다.

:::note 데이터 변동
데이터세트가 매일 자정에 재생되기 때문에, 데모를 탐색하는 시간에 따라 정확한 시각화가 달라질 수 있습니다.
:::

## 데모 시나리오 {#demo-scenario}

이 데모에서는 망원경 및 관련 액세서리를 판매하는 전자 상거래 웹사이트와 관련된 사고를 조사합니다.

고객 지원 팀은 사용자가 체크아웃에서 결제를 완료하는 데 문제가 있다고 보고했습니다. 문제는 사이트 안정성 엔지니어링(SRE) 팀으로 에스컬레이션되어 조사 중입니다.

HyperDX를 사용하여 SRE 팀은 로그, 추적 및 메트릭을 분석하여 문제를 진단하고 해결한 뒤, 세션 데이터를 검토하여 그들의 결론이 실제 사용자 행동과 일치하는지 확인할 것입니다.

## Open Telemetry 데모 {#otel-demo}

이 데모는 공식 OpenTelemetry 데모의 [ClickStack 유지 보수 분기](https://github.com/ClickHouse/opentelemetry-demo)를 사용합니다.

<DemoArchitecture/>

## 데모 단계 {#demo-steps}

**이 데모는 [ClickStack SDKs](/use-cases/observability/clickstack/sdks)로 계측되었으며, Kubernetes에 서비스를 배포하였고, 여기서 메트릭 및 로그도 수집되었습니다.**

<VerticalStepper headerLevel="h3">

### 데모 서버에 연결 {#connect-to-the-demo-server}

:::note 로컬 전용 모드
로컬 모드로 배포할 때 `데모 서버에 연결`을 클릭한 경우 이 단계를 건너뛸 수 있습니다. 이 모드를 사용할 경우 소스는 `Demo_` 접두사가 붙습니다. e.g. `Demo_Logs`
:::

`팀 설정`으로 이동하여 `로컬 연결`에 대해 `편집`을 클릭합니다:

<Image img={edit_connection} alt="연결 편집" size="lg"/>

연결 이름을 `Demo`로 바꾸고 이후 양식을 사용하여 데모 서버에 대한 다음 연결 세부 정보를 입력합니다:

- `연결 이름`: `Demo`
- `호스트`: `https://sql-clickhouse.clickhouse.com`
- `사용자 이름`: `otel_demo`
- `비밀번호`: 비워 둡니다.

<Image img={edit_demo_connection} alt="데모 연결 편집" size="lg"/>

### 소스 수정 {#modify-sources}

:::note 로컬 전용 모드
로컬 모드로 배포할 때 `데모 서버에 연결`을 클릭한 경우 이 단계를 건너뛸 수 있습니다. 이 모드를 사용할 경우 소스는 `Demo_` 접두사가 붙습니다. e.g. `Demo_Logs`
:::

`소스`로 스크롤하여 각 소스 - `Logs`, `Traces`, `Metrics`, 및 `Sessions` - 를 `otel_v2` 데이터베이스를 사용하도록 수정합니다.

<Image img={edit_demo_source} alt="데모 소스 편집" size="lg"/>

:::note
각 소스에 전체 데이터베이스 목록이 나열되도록 페이지를 새로 고쳐야 할 수도 있습니다.
:::

### 시간 범위 조정 {#adjust-the-timeframe}

오른쪽 상단의 시간 선택기를 사용하여 지난 `1일`의 모든 데이터를 표시하도록 시간을 조정합니다.

<Image img={step_2} alt="단계 2" size="lg"/>

개요 막대 차트에서 오류 수에 약간의 차이를 볼 수 있으며, 몇 개의 연속 막대에서 빨간색이 소폭 증가합니다.

:::note
막대의 위치는 데이터세트를 쿼리하는 시간에 따라 달라질 수 있습니다.
:::

### 오류 필터링 {#filter-to-errors}

오류 발생을 강조하기 위해 `SeverityText` 필터를 사용하고 `error`를 선택하여 오류 수준의 항목만 표시합니다.

오류가 더 분명해질 것입니다:

<Image img={step_3} alt="단계 3" size="lg"/>

### 오류 패턴 식별 {#identify-error-patterns}

HyperDX의 클러스터링 기능을 사용하여 오류를 자동으로 식별하고 의미 있는 패턴으로 그룹화할 수 있습니다. 이는 큰 볼륨의 로그와 추적을 처리할 때 사용자 분석을 가속화합니다. 이를 사용하려면 왼쪽 패널의 `분석 모드` 메뉴에서 `이벤트 패턴`을 선택합니다.

오류 클러스터는 결제 실패와 관련된 문제를 드러내며, `주문을 제출하지 못함`이라는 이름 붙여진 패턴을 포함합니다. 추가 클러스터는 카드 충전 문제와 캐시가 가득 찼다는 것을 나타냅니다.

<Image img={step_4} alt="단계 4" size="lg"/>

이 오류 클러스터는 서로 다른 서비스에서 유래한 것으로 보입니다.

### 오류 패턴 탐색 {#explore-error-pattern}

우리의 보고된 문제인 사용자가 결제를 완료할 수 없는 것과 연관된 가장 분명한 오류 클러스터인 `주문을 제출하지 못함`을 클릭합니다.

이렇게 하면 `frontend` 서비스와 관련된 이 오류의 모든 발생 목록이 표시됩니다:

<Image img={step_5} alt="단계 5" size="lg"/>

결과로 나온 오류 중 하나를 선택합니다. 로그 메타데이터가 자세히 표시됩니다. `개요` 및 `컬럼 값`을 스크롤하면 캐시로 인한 카드 충전 문제를 암시합니다:

`카드를 충전하지 못했습니다: 카드를 충전할 수 없습니다: rpc 오류: 코드 = 알 수 없음 설명 = 비자 캐시가 가득 찼습니다: 새 항목을 추가할 수 없습니다.`

<Image img={step_6} alt="단계 6" size="lg"/>

### 인프라 탐색 {#explore-the-infrastructure}

우리는 결제 실패의 원인이 될 가능성이 있는 캐시 관련 오류를 식별했습니다. 여전히 이 문제가 우리의 마이크로서비스 아키텍처에서 어디에서 발생했는지를 확인해야 합니다.

캐시 문제를 고려할 때, 기본 인프라를 조사하는 것이 합리적입니다 - 관련된 파드에서 메모리 문제를 겪고 있을까요? ClickStack에서는 로그와 메트릭이 통합되어 컨텍스트에서 표시되어 근본 원인을 빠르게 발견할 수 있게 합니다.

`인프라` 탭을 선택하여 `frontend` 서비스의 기본 파드와 관련된 메트릭을 보고, 시간을 `1d`로 넓힙니다:

<Image img={step_7} alt="단계 7" size="lg"/>

문제가 인프라와 관련이 없는 것으로 보입니다 - 시간 범위에 걸쳐 중요한 메트릭이 변하지 않았습니다: 오류 전후 모두. 인프라 탭을 닫습니다.

### 추적 탐색 {#explore-a-trace}

ClickStack에서는 추적이 로그와 메트릭과 자동으로 연관되어 있습니다. 우리가 선택한 로그와 연결된 추적을 탐색하여 책임이 있는 서비스를 식별해 봅시다.

`추적`을 선택하여 관련 추적을 시각화합니다. 이어지는 뷰를 스크롤하면 HyperDX가 마이크로서비스 간 분산 추적을 어떻게 시각화하는지를 확인할 수 있으며, 각 서비스의 스팬이 연결됩니다. 결제는 체크아웃 및 통화 변환을 수행하는 여러 마이크로서비스를 포함하는 것이 분명합니다.

<Image img={step_8} alt="단계 8" size="lg"/>

뷰 하단으로 스크롤하면 `payment` 서비스가 오류를 발생시키고, 이는 다시 호출 체인으로 전파되는 것을 볼 수 있습니다. 

<Image img={step_9} alt="단계 9" size="lg"/>

### 추적 검색 {#searching-traces} 

우리는 사용자가 결제를 완료하지 못하는 이유가 결제 서비스의 캐시 문제 때문임을 확인했습니다. 이 서비스의 추적을 더 자세히 살펴보고 근본 원인에 대해 더 알아봅시다.

`검색`을 선택하여 메인 검색 뷰로 전환합니다. `Traces`의 데이터 소스를 변경하고 `결과 테이블` 뷰를 선택합니다. **시간 범위가 여전히 지난 하루에 걸쳐 있는지 확인하세요.**

<Image img={step_10} alt="단계 10" size="lg"/>

이 뷰는 지난 하루 동안의 모든 추적을 보여줍니다. 문제의 출처가 결제 서비스임을 알고 있으므로 `ServiceName`에 `payment` 필터를 적용합니다.

<Image img={step_11} alt="단계 11" size="lg"/>

추적에서 `이벤트 패턴`을 선택하여 이벤트 클러스터링을 적용하면, `payment` 서비스에서의 캐시 문제를 즉시 확인할 수 있습니다.

<Image img={step_12} alt="단계 12" size="lg"/>

### 추적의 인프라 탐색 {#explore-infrastructure-for-a-trace}

`결과 테이블`을 클릭하여 결과 뷰로 전환합니다. `StatusCode` 필터와 `Error` 값을 사용하여 오류를 필터링합니다. 

<Image img={step_13} alt="단계 13" size="lg"/>

`Error: Visa cache full: cannot add new item.` 오류를 선택하고, `인프라` 탭으로 전환하여 시간 범위를 `1d`로 넓힙니다.

<Image img={step_14} alt="단계 14" size="lg"/>

추적을 메트릭과 상관시켜 보면, `payment` 서비스에서 메모리와 CPU가 증가한 후 `0`으로 축소되는 모습을 볼 수 있습니다(이는 파드 재시작에 기인한 것으로 볼 수 있습니다) - 캐시 문제는 자원 문제를 초래한 것으로 보입니다. 이는 결제 완료 시간에 영향을 미쳤을 것으로 예상됩니다.

### 더 빠른 해결을 위한 이벤트 델타 {#event-deltas-for-faster-resolution} 

이벤트 델타는 성능 또는 오류 비율의 변화를 특정 데이터의 하위 집합에 귀속시켜 이상을 드러내어 근본 원인을 더 빠르게 파악할 수 있도록 합니다.

`payment` 서비스에서 캐시 문제가 발생했음을 알고 있으며, 이는 자원 소비 증가를 초래하지만, 근본 원인은 완전히 파악하지 못했습니다.

결과 테이블 뷰로 돌아가 오류가 포함된 시간 범위를 선택하여 데이터를 제한합니다. 오류 왼쪽과 이후 시간의 여러 시간을 선택해야 합니다(문제가 여전히 발생하고 있을 수 있습니다):

<Image img={step_15} alt="단계 15" size="lg"/>

오류 필터를 제거하고 왼쪽 `분석 모드` 메뉴에서 `이벤트 델타`를 선택합니다.

<Image img={step_16} alt="단계 16" size="lg"/>

상단 패널은 시간의 분포를 보여주며, 색상은 이벤트 밀도(스팬 수)를 나타냅니다. 주요 집중 영역 외부의 이벤트 집합은 일반적으로 조사할 가치가 있는 이벤트들입니다.

지속 시간이 `200ms`를 초과하는 이벤트를 선택하고 `선택으로 필터링`을 적용하면 느린 이벤트로 분석을 제한할 수 있습니다:

<Image img={step_17} alt="단계 17" size="lg"/>

데이터의 하위 집합에 대한 분석 결과, 대부분의 성능 스파이크가 `visa` 거래와 관련이 있음을 확인할 수 있습니다.

### 더 많은 컨텍스트를 위한 차트 사용 {#using-charts-for-more-context}

ClickStack에서는 로그, 추적 또는 메트릭에서 임의의 숫자 값을 차트로 작성하여 보다 많은 컨텍스트를 제공합니다. 

우리는 다음을 확인했습니다:

- 문제는 결제 서비스에 있습니다.
- 캐시가 가득 찼습니다.
- 이는 자원 소비 증가를 초래했습니다.
- 이 문제로 인해 비자 결제가 완료되지 않았으며 - 적어도 수행하는 데 오랜 시간이 걸립니다.

<br/>

왼쪽 메뉴에서 `차트 탐색기`를 선택합니다. 결제 완료 시간을 차트 유형별로 차트하기 위해 다음 값을 입력합니다:

- `데이터 소스`: `Traces`
- `메트릭`: `최대`
- `SQL 칼럼`: `Duration`
- `어디서`: `ServiceName: payment`
- `시간 범위`: `지난 1일`

<br/>

`▶️`를 클릭하면 시간이 지남에 따라 결제 성능이 어떻게 저하되었는지를 볼 수 있습니다. 

<Image img={step_18} alt="단계 18" size="lg"/>

`Group By`를 `SpanAttributes['app.payment.card_type']`로 설정(자동 완성을 위해 `card`를 입력)하면 비자 거래의 성능 저하를 관리하는 서비스 성능을 확인할 수 있습니다:

<Image img={step_19} alt="단계 19" size="lg"/>

오류가 발생하면 응답이 `0s`로 돌아옴을 유의하세요.

### 더 많은 컨텍스트를 위한 메트릭 탐색 {#exploring-metrics-for-more-context}

마지막으로 캐시 크기를 메트릭으로 기록하여 시간이 지남에 따라 어떻게 변했는지 확인하여 더 많은 컨텍스트를 부여합니다.

다음 값을 입력합니다:

- `데이터 소스`: `Metrics`
- `메트릭`: `최대`
- `SQL 칼럼`: `visa_validation_cache.size (gauge)` (자동 완성을 위해 `cache`를 입력)
- `어디서`: `ServiceName: payment`
- `Group By`: `<empty>`

캐시 크기가 4-5시간 동안 증가한 모습을 확인할 수 있습니다(소프트웨어 배포 이후일 가능성이 높습니다) 및 최대 크기 `100,000`에 도달했습니다. `샘플 일치 이벤트`에서 캐시가 이 한도에 도달함에 따라 오류가 발생하는 것을 볼 수 있으며, 그 이후에는 크기가 `0`으로 기록되고 응답 또한 `0s`가 됩니다.

<Image img={step_20} alt="단계 20" size="lg"/>

요약하자면, 로그, 추적 및 마지막으로 메트릭을 탐색함으로써 우리는 다음과 같은 결론에 도달했습니다:

- 문제는 결제 서비스에 있습니다.
- 서비스 동작의 변화는 아마도 배포로 인한 결과로, 비자 캐시가 4-5시간에 걸쳐 느리게 증가하며 최대 크기 `100,000`에 도달했습니다.
- 캐시가 증가함에 따라, 자원 소비가 늘어나는 결과를 초래했으며 - 이는 구현상의 문제일 가능성이 높습니다.
- 캐시가 증가함에 따라 비자 결제 성능이 저하되었습니다.
- 최대 크기에 도달하면 캐시는 결제를 거부하고 스스로를 크기 `0`으로 보고했습니다.

### 세션 사용 {#using-sessions} 

세션은 사용자 경험을 재생하여 오류가 발생한 경과를 시각적으로 보여줍니다. 일반적으로 근본 원인 진단에 사용되지는 않지만, 고객 지원 팀에 보고된 문제를 확인하는 데 유용하며 더 깊은 조사에 대한 출발점이 될 수 있습니다.

HyperDX에서는 세션이 추적 및 로그와 연결되어 근본 원인의 완전한 뷰를 제공합니다.

예를 들어, 지원 팀이 결제 문제를 겪은 사용자의 이메일인 `Braulio.Roberts23@hotmail.com`을 제공하면, 로그 또는 추적을 직접 검색하기 보다는 그들의 세션으로 시작하는 것이 더 효과적입니다.

왼쪽 메뉴에서 `클라이언트 세션` 탭으로 이동하고 데이터 소스가 `세션`으로 설정되어 있으며, 시간 범위가 `지난 1일`로 설정되어 있는지 확인합니다:

<Image img={step_21} alt="단계 21" size="lg"/>

`SpanAttributes.userEmail: Braulio`로 검색하여 고객의 세션을 찾습니다. 세션을 선택하면 왼쪽에서 고객 세션의 브라우저 이벤트와 관련된 스팬을 보여주며, 오른쪽에서는 사용자의 브라우저 경험이 다시 렌더링됩니다:

<Image img={step_22} alt="단계 22" size="lg"/>

### 세션 재생 {#replaying-sessions} 

세션은 ▶️ 버튼을 눌러 재생할 수 있습니다. `하이라이트` 및 `모든 이벤트` 간 전환하면서 스팬 세부 사항의 다양한 정도를 허용하는데, 전자는 주요 이벤트 및 오류를 강조합니다.

스팬의 하단으로 스크롤하면 `/api/checkout`과 관련된 `500` 오류를 확인할 수 있습니다. 이 특정 스팬에 대해 ▶️ 버튼을 선택하면 세션의 이 시점으로 재생이 이동하여 고객의 경험을 확인할 수 있습니다 - 결제가 단순히 작동하지 않으며 오류가 표시되지 않습니다.

<Image img={step_23} alt="단계 23" size="lg"/>

스팬을 선택하면 이 오류가 내부 오류로 인해 발생했음을 확인할 수 있습니다. `추적` 탭을 클릭하고 연결된 스팬을 스크롤함으로써 고객이 실제로 우리의 캐시 문제의 피해자였음을 확인할 수 있습니다.

<Image img={step_24} alt="단계 24" size="lg"/>

</VerticalStepper>

이 데모는 전자 상거래 앱에서 발생한 결제 실패와 관련된 실제 사건을 설명하며, ClickStack이 통합된 로그, 추적, 메트릭, 세션 재생을 통해 근본 원인을 어떻게 밝혀내는지를 보여줍니다 - 특정 기능을 더 깊이 탐색하기 위해 우리의 [기타 시작 가이드](/use-cases/observability/clickstack/sample-datasets)를 탐색하십시오.
