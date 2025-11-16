---
'slug': '/cloud/get-started/cloud/use-cases/real-time-analytics'
'title': '실시간 분석'
'description': 'ClickHouse Cloud를 사용하여 즉각적인 인사이트와 데이터 기반 의사 결정을 위한 실시간 분석 애플리케이션을
  구축하는 방법을 알아보세요.'
'keywords':
- 'use cases'
- 'real-time analytics'
'sidebar_label': '실시간 분석'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import rta_0 from '@site/static/images/cloud/onboard/discover/use_cases/0_rta.png';
import rta_1 from '@site/static/images/cloud/onboard/discover/use_cases/1_rta.png';
import rta_2 from '@site/static/images/cloud/onboard/discover/use_cases/2_rta.png';
import rta_3 from '@site/static/images/cloud/onboard/discover/use_cases/3_rta.png';

<iframe width="758" height="426" src="https://www.youtube.com/embed/SnFff0KYwuo?si=aNpGzSobzFhUlyX5" title="YouTube 비디오 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## 실시간 분석이란 무엇인가? {#what-is-real-time-analytics}

실시간 분석은 데이터가 생성되자마자 최종 사용자와 고객에게 인사이트를 제공하는 데이터 처리 방식을 의미합니다. 이는 데이터가 배치로 수집되고 종종 생성된 후 오랜 시간이 지난 후에 처리되는 전통적 또는 배치 분석과 다릅니다.

실시간 분석 시스템은 사건의 흐름 위에 구축되며, 사건은 시간에 따라 정렬된 사건의 일련으로 구성됩니다. 사건은 이미 발생한 것입니다. 예를 들어, 전자상거래 웹사이트에서 장바구니에 항목을 추가하거나, 사물인터넷(IoT) 센서에서 측정값을 방출하거나, 축구 경기에서 골슛을 하는 것 등이 될 수 있습니다.

아래는 상상의 IoT 센서에서 발생한 사건의 예입니다:

```json
{
  "deviceId": "sensor-001",
  "timestamp": "2023-10-05T14:30:00Z",
  "eventType": "temperatureAlert",
  "data": {
    "temperature": 28.5,
    "unit": "Celsius",
    "thresholdExceeded": true
  }
}
```

조직들은 이러한 사건을 집계하고 분석하여 고객에 대한 인사이트를 발견할 수 있습니다. 이는 전통적으로 배치 분석을 사용하여 수행되었으며, 다음 섹션에서는 배치 분석과 실시간 분석을 비교할 것입니다.

## 실시간 분석 vs 배치 분석 {#real-time-analytics-vs-batch-analytics}

아래 다이어그램은 개별 사건의 관점에서 전형적인 배치 분석 시스템이 어떻게 보일 것인지 보여줍니다:

<Image img={rta_0} size="md" border alt="배치 분석 다이어그램" />

사건이 발생한 이후부터 우리가 이를 처리하고 인사이트를 얻기까지 상당한 간격이 있다는 것을 볼 수 있습니다. 전통적으로, 이는 데이터 분석의 유일한 수단이었으며, 우리는 배치로 데이터를 처리하기 위해 인위적인 시간 경계를 만들어야 했습니다. 예를 들어, 하루의 끝에서 수집된 모든 데이터를 처리할 수 있습니다. 이는 많은 경우에 적합했지만, 다른 경우에는 오래된 데이터로 작업하게 되어 최적의 결과를 가져오지 못하며, 데이터에 신속하게 반응할 수 없게 됩니다.

반대로, 실시간 분석 시스템에서는 다음 다이어그램에서 볼 수 있듯이 사건이 발생하는 즉시 반응합니다:

<Image img={rta_1} size="md" border alt="실시간 분석 다이어그램" />

이제 우리는 사건이 생성되는 즉시 인사이트를 유도할 수 있습니다. 그런데 이것이 왜 유용할까요?

## 실시간 분석의 이점 {#benefits-of-real-time-analytics}

오늘날 빠르게 변화하는 세상에서 조직들은 실시간 분석에 의존하여 변화하는 조건에 민첩하고 반응할 수 있습니다. 실시간 분석 시스템은 기업에 여러 가지 방식으로 이점을 제공합니다.

### 더 나은 의사결정 {#better-decision-making}

실시간 분석을 통해 실행 가능한 인사이트에 접근함으로써 의사결정이 향상될 수 있습니다. 비즈니스 운영자가 사건이 발생하는 즉시 볼 수 있다면, 시기적절한 개입을 하는 것이 훨씬 쉬워집니다.

예를 들어, 애플리케이션에 변경을 가하고 사용자 경험에 악영향을 미치는지 알고 싶다면, 필요하다면 신속하게 변경 사항을 되돌릴 수 있도록 가능한 한 빨리 알고 싶습니다. 덜 실시간적인 접근 방식으로는 이 분석을 하기 위해 다음 날까지 기다려야 할 수도 있으며, 그때까지 많은 불만족한 사용자가 생길 수 있습니다.

### 새로운 제품 및 수익원 {#new-products-and-revenue-streams}

실시간 분석은 기업이 새로운 수익원을 창출하는 데 도움을 줄 수 있습니다. 조직은 사용자에게 분석 쿼리 기능에 접근할 수 있는 새로운 데이터 기반 제품 및 서비스를 개발할 수 있습니다. 이러한 제품은 종종 사용자들이 접근하기 위해 비용을 지불할 정도로 매력적입니다.

추가로, 기존 애플리케이션은 사용자 참여 및 유지율을 높여 더욱 매력적으로 만들 수 있습니다. 이는 더 많은 애플리케이션 사용을 결과로 만들어 기업의 수익을 증가시킵니다.

### 향상된 고객 경험 {#improved-customer-experience}

실시간 분석을 통해 기업은 고객 행동, 선호 및 요구에 대한 즉각적인 인사이트를 얻을 수 있습니다. 이는 기업이 시기적절한 지원을 제공하고, 상호작용을 개인화하며, 고객을 지속적으로 유치하게 만드는 보다 매력적인 경험을 창출하는 데에 도움이 됩니다.

## 실시간 분석 사용 사례 {#real-time-analytics-use-cases}

실시간 분석의 실제 가치는 그 실용적인 응용을 고려할 때 명백해집니다. 몇 가지를 살펴보겠습니다.

### 사기 탐지 {#fraud-detection}

사기 탐지는 가짜 계정에서 결제 사기에 이르는 사기 패턴을 탐지하는 것입니다. 우리는 이 사기를 가능한 한 빨리 발견하여 의심스러운 활동에 플래그를 부착하고, 거래를 차단하며, 필요할 때 계정을 비활성화하고자 합니다.

이 사용 사례는 산업을 넘나듭니다: 의료, 디지털 뱅킹, 금융 서비스, 소매업, 등등.

[Instacart](https://www.instacart.com/)는 북미의 주요 온라인 식료품 회사로, 수백만 명의 활성 고객과 쇼핑객을 보유하고 있습니다. 이 회사는 ClickHouse를 Yoda라는 사기 탐지 플랫폼의 일환으로 사용합니다. 위에서 설명한 일반적인 사기 유형 외에도, 고객과 쇼핑객 간의 공모를 탐지하려고 합니다.

<Image img={rta_2} size="md" border alt="사기 탐지를 위한 실시간 분석" />

그들은 실시간 사기 탐지를 가능하게 하는 ClickHouse의 다음과 같은 특징을 확인했습니다:

> ClickHouse는 LSM 트리 기반의 MergeTree 계열 엔진을 지원합니다. 
> 이는 대량의 데이터를 실시간으로 수집하는 데 적합하도록 최적화되어 있습니다.

> ClickHouse는 분석 쿼리를 위해 명시적으로 설계되고 최적화되었습니다. 이는 데이터가 지속적으로 분석되어 사기를 나타낼 수 있는 패턴을 찾는 애플리케이션의 필요와 완벽하게 일치합니다.

### 시간에 민감한 의사결정 {#ftime-sensitive-decision-making}

시간에 민감한 의사결정은 사용자나 조직이 가장 최신의 정보를 바탕으로 신속하게 정보에 입각한 선택을 해야 하는 상황을 나타냅니다. 실시간 분석은 사용자가 동적인 환경에서 정보에 입각한 선택을 하도록 지원합니다. 이는 시장 변동에 반응하는 트레이더들이나, 구매 결정을 내리는 소비자들, 또는 실시간 운영 변화에 적응하는 전문가들에게 해당됩니다.

Coinhall은 사용자에게 각 거래 기간의 시가, 고가, 저가, 종가를 보여주는 촛대 차트를 통해 가격 변동에 대한 실시간 인사이트를 제공합니다. 그들은 이러한 유형의 쿼리를 신속하게 실행할 수 있어야 했습니다. 그리고 동시에 많은 사용자들이 접속할 수 있어야 했습니다.

<Image img={rta_3} size="md" border alt="시간에 민감한 의사결정을 위한 실시간 분석" />

> 성능 측면에서 ClickHouse는 20밀리초에 촛대 쿼리를 실행하여 분명한 승자가 되었으며, 다른 데이터베이스는 400밀리초 이상이 소요되었습니다. 최신 가격 쿼리는 8밀리초에 실행되어, 다음 가장 좋은 성능인 SingleStore의 45밀리초를 초과하였습니다. 마지막으로, ClickHouse는 50밀리초에 ASOF JOIN 쿼리를 처리했으며, Snowflake는 20분, Rockset은 시간 초과되었습니다.
