---
slug: /use-cases/observability/clickstack/getting-started/remote-demo-data
title: '원격 데모 데이터셋'
sidebar_position: 2
pagination_prev: null
pagination_next: null
description: 'ClickStack과 원격 데모 데이터셋으로 시작하기'
doc_type: 'guide'
keywords: ['clickstack', '예제 데이터', '샘플 데이터셋', '로그', '관측성']
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

**다음 가이드는 [all-in-one 이미지용 안내](/use-cases/observability/clickstack/getting-started/oss) 또는 [Local Mode Only](/use-cases/observability/clickstack/deployment/local-mode-only)를 사용해 오픈 소스 ClickStack을 배포하고, 초기 사용자 생성을 완료했다고 가정합니다. 또는 로컬 설정을 모두 건너뛰고, 동일한 데이터셋을 사용하는 ClickStack 호스팅 데모인 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)에 바로 연결해도 됩니다.**

이 가이드에서는 공개 ClickHouse playground인 [sql.clickhouse.com](https://sql.clickhpouse.com)에 호스팅된 샘플 데이터셋을 사용하며, 로컬 ClickStack 배포에서 이 데이터셋에 연결할 수 있습니다.

:::warning Managed ClickStack에서 지원되지 않음
Managed ClickStack에서는 원격 데이터베이스가 지원되지 않습니다. 따라서 이 데이터셋도 지원되지 않습니다.
:::


여기에는 공식 OpenTelemetry (OTel) 데모의 ClickHouse 버전에서 캡처한 약 40시간 분량의 데이터가 포함되어 있습니다. 이 데이터는 타임스탬프가 현재 시간 구간에 맞도록 조정된 상태로 매일 밤 재생되며, HyperDX의 통합 로그, 트레이스, 메트릭을 사용하여 시스템 동작을 탐색할 수 있습니다.

:::note 데이터 변동
데이터셋이 매일 자정부터 재생되므로, 데모를 탐색하는 시점에 따라 시각화 결과가 정확히 일치하지 않을 수 있습니다.
:::

## 데모 시나리오 \{#demo-scenario\}

이 데모에서는 망원경과 관련 액세서리를 판매하는 전자상거래(e-commerce) 웹사이트에서 발생한 장애를 조사합니다.

고객 지원팀에서 사용자가 체크아웃 단계에서 결제를 완료하지 못하고 있다는 보고를 접수했습니다. 이 문제는 조사를 위해 사이트 신뢰성 엔지니어링(SRE) 팀으로 에스컬레이션되었습니다.

SRE 팀은 HyperDX를 사용하여 로그, 트레이스, 메트릭을 분석해 문제를 진단하고 해결한 뒤, 세션 데이터를 검토하여 결론이 실제 사용자 행동과 일치하는지 확인합니다.

## OpenTelemetry 데모 \{#otel-demo\}

이 데모에서는 공식 OpenTelemetry 데모의 [ClickStack에서 포크하여 유지 관리하는 버전](https://github.com/ClickHouse/opentelemetry-demo)을 사용합니다.

<DemoArchitecture/>

## 데모 단계 \{#demo-steps\}

**이 데모는 [ClickStack SDKS](/use-cases/observability/clickstack/sdks)로 계측되어 있으며, 서비스는 Kubernetes에 배포되어 해당 서비스로부터 메트릭과 로그도 수집합니다.**

<VerticalStepper headerLevel="h3">
  ### 데모 서버에 연결

  :::note Local-Only 모드
  Local Mode로 배포할 때 `Connect to Demo Server`를 클릭했다면 이 단계를 건너뛸 수 있습니다. 이 모드를 사용하는 경우 소스 이름 앞에 `Demo_` 접두사가 붙습니다(예: `Demo_Logs`).
  :::

  `Team Settings`로 이동한 후 `Local Connection`의 `Edit`을 클릭하세요:

  <Image img={edit_connection} alt="연결 수정" size="lg" />

  연결 이름을 `Demo`로 변경하고, 데모 서버에 대한 다음 연결 정보를 입력하여 양식을 완성하십시오:

  * `Connection Name`: `Demo`
  * `Host`: `https://sql-clickhouse.clickhouse.com`
  * `Username`: `otel_demo`
  * `Password`: 비워 두십시오

  <Image img={edit_demo_connection} alt="데모 연결 수정" size="lg" />

  ### 소스 수정하기

  :::note Local-Only 모드
  Local Mode로 배포할 때 `Connect to Demo Server`를 클릭했다면 이 단계를 건너뛸 수 있습니다. 이 모드를 사용하는 경우 소스 이름 앞에 `Demo_` 접두사가 붙습니다(예: `Demo_Logs`).
  :::

  위로 스크롤하여 `Sources`로 이동한 후, 각 소스(`Logs`, `Traces`, `Metrics`, `Sessions`)가 `otel_v2` 데이터베이스를 사용하도록 수정하세요.

  <Image img={edit_demo_source} alt="데모 소스 편집" size="lg" />

  :::note
  각 소스에서 전체 데이터베이스 목록이 표시되도록 페이지를 새로고침해야 할 수 있습니다.
  :::

  ### 시간 범위 조정하기

  오른쪽 상단의 시간 선택기를 사용하여 이전 `1일`의 모든 데이터를 표시하도록 시간을 조정하세요.

  <Image img={step_2} alt="2단계" size="lg" />

  개요 막대 차트에서 오류 수에 작은 차이가 나타날 수 있으며, 연속된 여러 막대에서 빨간색 영역이 약간 증가합니다.

  :::note
  막대의 위치는 데이터셋을 쿼리하는 시점에 따라 달라집니다.
  :::

  ### 오류 필터링하기

  오류 발생을 강조하려면 `SeverityText` 필터를 사용하고 `error`를 선택하여 오류 수준의 항목만 표시하세요.

  오류가 더 명확하게 나타납니다:

  <Image img={step_3} alt="3단계" size="lg" />

  ### 오류 패턴 식별하기

  HyperDX의 클러스터링 기능을 사용하면 오류를 자동으로 식별하고 의미 있는 패턴으로 그룹화할 수 있습니다. 이를 통해 대량의 로그 및 트레이스를 처리할 때 사용자 분석 속도가 향상됩니다. 이 기능을 사용하려면 왼쪽 패널의 `Analysis Mode` 메뉴에서 `Event Patterns`를 선택하세요.

  오류 클러스터는 `Failed to place order`라는 명명된 패턴을 포함하여 결제 실패와 관련된 문제를 보여줍니다. 추가 클러스터는 카드 청구 문제 및 캐시가 가득 찬 문제도 나타냅니다.

  <Image img={step_4} alt="4단계" size="lg" />

  이러한 오류 클러스터는 서로 다른 서비스에서 발생한 것으로 추정됩니다.

  ### 오류 패턴 탐색

  사용자가 결제를 완료할 수 없다는 보고된 문제와 연관된 가장 명확한 오류 클러스터를 클릭하십시오: `Failed to place order`.

  `frontend` 서비스와 연관된 해당 오류의 모든 발생 목록이 표시됩니다:

  <Image img={step_5} alt="5단계" size="lg" />

  결과로 나타난 오류 중 하나를 선택하세요. 로그 메타데이터가 상세히 표시됩니다. `Overview`와 `Column Values`를 모두 스크롤하면 캐시로 인해 충전 카드에 문제가 있음을 확인할 수 있습니다:

  `failed to charge card: could not charge the card: rpc error: code = Unknown desc = Visa cache full: cannot add new item.`

  <Image img={step_6} alt="6단계" size="lg" />

  ### 인프라 탐색

  결제 실패를 유발할 가능성이 있는 캐시 관련 오류를 식별했습니다. 마이크로서비스 아키텍처 내에서 이 문제의 발생 지점을 파악해야 합니다.

  캐시 문제가 발생했으므로 기반 인프라를 조사하는 것이 합리적입니다. 연관된 파드에 메모리 문제가 있을 가능성이 있습니다. ClickStack에서는 로그와 메트릭이 통합되어 컨텍스트와 함께 표시되므로 근본 원인을 신속하게 파악할 수 있습니다.

  `Infrastructure` 탭을 선택하여 `frontend` 서비스의 기반이 되는 파드와 연관된 메트릭을 확인하고, 시간 범위를 `1d`로 확장하세요:

  <Image img={step_7} alt="7단계" size="lg" />

  이 문제는 인프라와 관련이 없는 것으로 보입니다. 오류 발생 전후 기간 동안 눈에 띄게 변경된 메트릭이 없습니다. 인프라 탭을 닫으세요.

  ### 트레이스 탐색

  ClickStack에서는 트레이스가 로그 및 메트릭과 자동으로 연관됩니다. 선택한 로그에 연결된 트레이스를 탐색하여 해당 서비스를 식별하세요.

  `Trace`를 선택하여 연관된 트레이스를 시각화하십시오. 이후 화면을 아래로 스크롤하면 HyperDX가 마이크로서비스 전반에 걸친 분산 트레이스를 시각화하고 각 서비스의 스팬을 연결하는 방식을 확인할 수 있습니다. 결제 작업에는 체크아웃 및 통화 변환을 수행하는 서비스를 포함하여 여러 마이크로서비스가 관여함을 명확히 보여줍니다.

  <Image img={step_8} alt="8단계" size="lg" />

  화면 하단으로 스크롤하면 `payment` 서비스에서 오류가 발생하고 있으며, 이 오류가 호출 체인을 따라 상위로 전파되는 것을 확인할 수 있습니다.

  <Image img={step_9} alt="9단계" size="lg" />

  ### 트레이스 검색하기

  결제 서비스의 캐시 문제로 인해 사용자가 구매를 완료하지 못하고 있음을 확인했습니다. 이 서비스의 트레이스를 더 자세히 살펴보고 근본 원인에 대해 자세히 알아보겠습니다.

  `Search`를 선택하여 메인 Search 뷰로 전환하세요. `Traces`의 데이터 소스를 전환하고 `Results table` 뷰를 선택하세요. **시간 범위가 여전히 지난 하루로 설정되어 있는지 확인하세요.**

  <Image img={step_10} alt="10단계" size="lg" />

  이 뷰는 지난 하루 동안의 모든 트레이스를 표시합니다. 문제가 결제 서비스에서 발생한다는 것을 확인했으므로, `ServiceName`에 `payment` 필터를 적용하세요.

  <Image img={step_11} alt="11단계" size="lg" />

  `Event Patterns`를 선택하여 트레이스에 이벤트 클러스터링을 적용하면 `payment` 서비스의 캐시 문제를 즉시 확인할 수 있습니다.

  <Image img={step_12} alt="12단계" size="lg" />

  ### 트레이스에 대한 인프라 탐색하기

  `Results table`을 클릭하여 결과 보기로 전환하세요. `StatusCode` 필터와 `Error` 값을 사용하여 오류를 필터링하세요.

  <Image img={step_13} alt="13단계" size="lg" />

  `Error: Visa cache full: cannot add new item.` 오류를 선택하고 `Infrastructure` 탭으로 전환한 다음, 시간 범위를 `1d`로 확장하세요.

  <Image img={step_14} alt="14단계" size="lg" />

  트레이스와 메트릭을 상관 분석하면 `payment` 서비스에서 메모리와 CPU가 증가한 후 `0`으로 급락하는 것을 확인할 수 있습니다(파드 재시작으로 인한 것으로 판단됩니다). 이는 캐시 문제가 리소스 문제를 야기했음을 시사합니다. 결제 완료 시간에 영향을 미쳤을 것으로 예상됩니다.

  ### 신속한 문제 해결을 위한 이벤트 델타

  Event Deltas는 성능 또는 오류율의 변화를 특정 데이터 하위 집합에 연결하여 이상 징후를 표면화하므로, 근본 원인을 신속하게 파악할 수 있습니다.

  `payment` 서비스에 캐시 문제가 있어 리소스 소비가 증가하고 있음을 확인했지만, 근본 원인은 아직 완전히 파악하지 못한 상태입니다.

  결과 테이블 뷰로 돌아가서 오류가 포함된 시간 범위를 선택하여 데이터를 제한하세요. 오류 발생 시점을 기준으로 앞뒤로 몇 시간씩 선택하세요 (문제가 여전히 발생 중일 수 있습니다):

  <Image img={step_15} alt="15단계" size="lg" />

  오류 필터를 제거하고 왼쪽 `Analysis Mode` 메뉴에서 `Event Deltas`를 선택하세요.

  <Image img={step_16} alt="16단계" size="lg" />

  상단 패널은 타이밍 분포를 표시하며, 색상은 이벤트 밀도(스팬 수)를 나타냅니다. 주요 집중 영역 외부에 있는 이벤트들은 일반적으로 조사가 필요한 항목입니다.

  지속 시간이 `200ms`보다 긴 이벤트를 선택하고 `Filter by selection` 필터를 적용하면 느린 이벤트만으로 분석을 제한할 수 있습니다:

  <Image img={step_17} alt="17단계" size="lg" />

  데이터 하위 집합에 대한 분석을 수행한 결과, 대부분의 성능 급증은 `visa` 트랜잭션과 관련되어 있습니다.

  ### 차트를 사용한 추가 컨텍스트 확인

  ClickStack에서는 로그, 트레이스 또는 메트릭의 모든 숫자 값을 차트로 표시하여 더 풍부한 컨텍스트를 제공합니다.

  다음 사항을 설정하였습니다:

  * 현재 결제 서비스에 문제가 있습니다
  * 캐시가 가득 찼습니다
  * 이로 인해 리소스 사용량이 증가했습니다.
  * 이 문제로 인해 비자 결제가 완료되지 못하거나, 설령 완료되더라도 매우 오랜 시간이 걸리게 되었습니다.

  <br />

  왼쪽 메뉴에서 `Chart Explorer`를 선택하십시오. 차트 유형별 결제 완료 소요 시간을 차트로 표시하려면 다음 값을 입력하십시오:

  * `Data Source`: `Traces`
  * `Metric`: `최대`
  * `SQL Column`: `Duration`
  * `Where`: `ServiceName: payment`
  * `Timespan`: `지난 1일`

  <br />

  `▶️`를 클릭하면 시간 경과에 따른 결제 성능 저하 과정을 확인할 수 있습니다.

  <Image img={step_18} alt="18단계" size="lg" />

  `Group By`를 `SpanAttributes['app.payment.card_type']`로 설정하면 (자동 완성을 위해 `card`만 입력하세요) Mastercard 대비 Visa 트랜잭션에서 서비스 성능이 저하된 것을 확인할 수 있습니다:

  <Image img={step_19} alt="19단계" size="lg" />

  오류가 발생하면 응답이 `0s`에 반환되는 점에 유의하십시오.

  ### 메트릭의 추가 컨텍스트 탐색하기

  마지막으로 캐시 크기를 메트릭으로 시각화하여 시간 경과에 따른 동작을 확인하고 더 많은 컨텍스트를 확보합니다.

  다음 값을 완성하세요:

  * `데이터 소스`: `메트릭`
  * `Metric`: `Maximum`
  * `SQL Column`: `visa_validation_cache.size (gauge)` (자동 완성을 위해 `cache`만 입력하면 됩니다)
  * `조건`: `ServiceName: payment`
  * `Group By`: `<empty>`

  캐시 크기가 4-5시간 동안(소프트웨어 배포 이후로 추정) 증가하여 최대 크기 `100,000`에 도달하는 과정을 확인할 수 있습니다. `Sample Matched Events`에서 오류가 캐시가 이 한계에 도달한 시점과 연관되어 있으며, 이후 캐시 크기가 `0`으로 기록되고 응답 시간도 `0s`로 반환되는 것을 확인할 수 있습니다.

  <Image img={step_20} alt="20단계" size="lg" />

  요약하면, 로그, 트레이스, 그리고 최종적으로 메트릭을 탐색한 결과 다음과 같은 결론을 도출했습니다:

  * 문제는 결제 서비스에 있습니다
  * 서비스 동작 변경(배포의 영향으로 추정됨)으로 인해 비자 캐시가 4~5시간에 걸쳐 서서히 증가하여 최대 크기인 `100,000`까지 커졌습니다.
  * 캐시 크기가 커지면서 리소스 사용량이 늘어났으며, 이는 구현이 좋지 않았기 때문으로 추정됩니다
  * 캐시가 커지면서 Visa 결제 처리 성능이 저하되었습니다
  * 최대 크기에 도달하자 캐시는 결제를 거부하고, 크기가 `0`이라고 보고했습니다.

  ### 세션 사용

  세션 기능을 사용하면 사용자 경험을 재생하여 사용자 관점에서 오류가 어떻게 발생했는지 시각적으로 확인할 수 있습니다. 근본 원인 진단에 주로 사용되지는 않지만, 고객 지원팀에 보고된 문제를 확인하는 데 유용하며 심층 조사의 출발점으로 활용할 수 있습니다.

  HyperDX에서는 세션이 트레이스 및 로그와 연결되어 근본 원인을 완전히 파악할 수 있습니다.

  예를 들어, 지원 팀에서 결제 문제를 겪은 사용자의 이메일 `Braulio.Roberts23@hotmail.com`을 제공한 경우, 로그나 트레이스를 직접 검색하기보다 해당 사용자의 세션부터 확인하는 것이 더 효과적입니다.

  왼쪽 메뉴에서 `Client Sessions` 탭으로 이동한 다음, 데이터 소스가 `Sessions`로 설정되어 있고 시간 범위가 `Last 1 day`로 설정되어 있는지 확인하세요:

  <Image img={step_21} alt="21단계" size="lg" />

  `SpanAttributes.userEmail: Braulio`를 검색하여 고객의 세션을 찾으세요. 세션을 선택하면 왼쪽에 해당 고객 세션의 브라우저 이벤트 및 관련 스팬이 표시되며, 오른쪽에는 사용자의 브라우저 경험이 재현됩니다:

  <Image img={step_22} alt="22단계" size="lg" />

  ### 세션 재생

  ▶️ 버튼을 눌러 세션을 재생할 수 있습니다. `Highlighted`와 `All Events` 간 전환을 통해 스팬(span)의 세분화 수준을 조정할 수 있으며, `Highlighted`는 주요 이벤트와 오류를 강조 표시합니다.

  스팬 목록의 하단으로 스크롤하면 `/api/checkout`과 연관된 `500` 오류를 확인할 수 있습니다. 해당 스팬의 ▶️ 버튼을 선택하면 재생이 세션의 해당 시점으로 이동하며, 이를 통해 고객이 경험한 상황을 확인할 수 있습니다 - 오류 메시지 표시 없이 결제가 작동하지 않는 것으로 보입니다.

  <Image img={step_23} alt="23단계" size="lg" />

  스팬을 선택하면 내부 오류로 인해 발생했음을 확인할 수 있습니다. `Trace` 탭을 클릭하고 연결된 스팬을 스크롤하여 확인하면, 해당 고객이 실제로 캐시 문제의 영향을 받았음을 알 수 있습니다.

  <Image img={step_24} alt="24단계" size="lg" />
</VerticalStepper>

이 데모에서는 전자상거래 앱에서 결제 실패가 발생한 실제 인시던트를 단계별로 살펴보면서, ClickStack이 통합 로그, 트레이스, 메트릭, 세션 리플레이를 통해 어떻게 근본 원인을 파악하도록 돕는지 보여줍니다. 특정 기능을 더 심층적으로 살펴보려면 [다른 시작하기 가이드](/use-cases/observability/clickstack/sample-datasets)를 참조하십시오.