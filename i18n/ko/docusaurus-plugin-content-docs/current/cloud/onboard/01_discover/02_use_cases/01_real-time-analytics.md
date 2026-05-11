---
slug: /cloud/get-started/cloud/use-cases/real-time-analytics
title: '실시간 분석'
description: 'ClickHouse Cloud를 사용하여 인사이트를 즉시 확보하고 데이터 기반 의사 결정을 내릴 수 있는 실시간 분석 애플리케이션을 구축하는 방법을 알아봅니다'
keywords: ['use cases', 'real-time analytics']
sidebar_label: '실시간 분석'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import rta_0 from '@site/static/images/cloud/onboard/discover/use_cases/0_rta.png';
import rta_1 from '@site/static/images/cloud/onboard/discover/use_cases/1_rta.png';
import rta_2 from '@site/static/images/cloud/onboard/discover/use_cases/2_rta.png';
import rta_3 from '@site/static/images/cloud/onboard/discover/use_cases/3_rta.png';

<iframe width="758" height="426" src="https://www.youtube.com/embed/SnFff0KYwuo?si=aNpGzSobzFhUlyX5" title="YouTube 동영상 플레이어" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## 실시간 분석(real-time analytics)이란? \{#what-is-real-time-analytics\}

실시간 분석(real-time analytics)은 데이터가 생성되는 즉시 최종 사용자와 고객에게 인사이트를 전달하는 데이터 처리 방식을 의미합니다. 이는 데이터를 배치 단위로 수집한 뒤, 생성된 지 상당한 시간이 지난 후에 처리하는 전통적 또는 배치 분석과는 다릅니다.

실시간 분석 시스템은 시간 순서대로 정렬된 일련의 이벤트로 구성된 이벤트 스트림을 기반으로 구축됩니다. 이벤트는 이미 발생한 어떤 일을 의미합니다. 예를 들어 전자상거래 웹사이트에서 장바구니에 상품을 추가하는 행위, 사물인터넷(Internet of Things, IoT) 센서로부터 측정값이 전송되는 것, 축구 경기에서의 골을 향한 슈팅 등이 모두 이벤트가 될 수 있습니다.

아래에는 (가상의 IoT 센서에서 나온) 이벤트의 예가 나와 있습니다.

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

조직은 이러한 이벤트를 집계하고 분석하여 고객에 대한 인사이트를 얻을 수 있습니다. 이는 전통적으로 배치 분석 방식으로 수행해 왔으며, 다음 섹션에서는 배치 분석과 실시간 분석을 비교합니다.


## 실시간 분석 vs 배치 분석 \{#real-time-analytics-vs-batch-analytics\}

아래 다이어그램은 개별 이벤트 관점에서 전형적인 배치 분석 시스템이 어떻게 동작하는지 보여줍니다.

<Image img={rta_0} size="md" border alt="배치 분석 다이어그램" />

이벤트가 발생한 시점부터 이를 처리하고 인사이트를 얻기까지 상당한 지연이 발생함을 알 수 있습니다. 전통적으로는 이것이 유일한 데이터 분석 방식이었고, 데이터를 배치로 처리하기 위해 인위적인 시간 경계를 설정해야 했습니다. 예를 들어, 하루 동안 수집된 모든 데이터를 하루가 끝날 때 한 번에 처리하는 방식입니다. 이는 많은 사용 사례에서는 잘 동작했지만, 다른 경우에는 오래된 데이터를 기반으로 작업하게 되어 최적이 아니며, 데이터에 충분히 빠르게 대응하지 못하게 만듭니다.

반면, 실시간 분석 시스템에서는 다음 다이어그램에 나타난 것처럼 이벤트가 발생하자마자 즉시 대응합니다.

<Image img={rta_1} size="md" border alt="실시간 분석 다이어그램" />

이제 이벤트가 생성되면 거의 즉시 그로부터 인사이트를 도출할 수 있습니다. 그렇다면 이것이 왜 유용할까요?



## 실시간 분석의 이점 \{#benefits-of-real-time-analytics\}

오늘날과 같이 변화가 빠른 환경에서 조직은 변화하는 상황에 민첩하게 대응하기 위해 실시간 분석에 의존합니다. 실시간 분석 시스템은 비즈니스에 여러 측면에서 이점을 제공합니다.

### 더 나은 의사 결정 \{#better-decision-making\}

실시간 분석을 통해 실행 가능한 인사이트에 접근하면 의사 결정을 개선할 수 있습니다. 비즈니스 운영자가 이벤트가 발생하는 즉시 이를 확인할 수 있으면, 적시에 개입하기가 훨씬 쉬워집니다.

예를 들어 애플리케이션을 변경한 뒤 이러한 변경이 사용자 경험에 부정적인 영향을 주는지 알고 싶다면, 필요할 경우 변경 사항을 되돌릴 수 있도록 가능한 한 빨리 이를 파악해야 합니다. 실시간성이 떨어지는 접근 방식에서는 이러한 분석을 다음 날까지 기다려야 할 수도 있으며, 그 시점에는 이미 많은 사용자가 불만을 갖게 되었을 수 있습니다.

### 새로운 제품과 수익원 \{#new-products-and-revenue-streams\}

실시간 분석은 비즈니스가 새로운 수익원을 창출하도록 도와줍니다. 조직은 사용자에게 분석 쿼리 기능에 대한 액세스를 제공하는 새로운 데이터 중심 제품과 서비스를 개발할 수 있습니다. 이러한 제품은 사용자가 액세스 권한에 비용을 지불할 만큼 매력적인 경우가 많습니다.

또한 기존 애플리케이션의 활용도를 높여 사용자 참여도와 유지율을 높일 수 있습니다. 이는 애플리케이션 사용량 증가로 이어지고, 결과적으로 조직의 수익 증가로 연결됩니다.

### 향상된 고객 경험 \{#improved-customer-experience\}

실시간 분석을 사용하면 비즈니스는 고객 행동, 선호도, 요구 사항에 대한 인사이트를 즉시 얻을 수 있습니다. 이를 통해 비즈니스는 시의적절한 지원을 제공하고 상호 작용을 개인화하며, 고객이 다시 찾게 만드는 더욱 매력적인 경험을 만들어 낼 수 있습니다.



## Real-time analytics use cases \{#real-time-analytics-use-cases\}

실시간 분석의 실제 가치는 그 활용 사례를 살펴볼 때 분명해집니다. 몇 가지 사례를 살펴보겠습니다.

### Fraud detection \{#fraud-detection\}

Fraud detection은 가짜 계정에서 결제 사기에 이르기까지 다양한 사기 패턴을 탐지하는 것을 의미합니다. 의심스러운 활동에 플래그를 설정하고, 트랜잭션을 차단하며, 필요할 경우 계정을 비활성화하기 위해 가능한 한 빨리 이러한 사기를 탐지해야 합니다.

이 사용 사례는 의료, 디지털 뱅킹, 금융 서비스, 리테일 등 여러 산업 전반에 걸쳐 적용됩니다.

[Instacart](https://www.instacart.com/)는 수백만 명의 활성 고객과 쇼퍼를 보유한 북미 선도 온라인 식료품 회사입니다. Instacart는 자사 fraud detection 플랫폼인 Yoda의 일부로 ClickHouse를 사용합니다. 위에서 설명한 일반적인 사기 유형에 더해, 고객과 쇼퍼 간의 담합까지 탐지하려고 합니다.

<Image img={rta_2} size="md" border alt="사기 탐지를 위한 실시간 분석" />

Instacart는 실시간 fraud detection을 가능하게 하는 ClickHouse의 다음과 같은 특징을 확인했습니다.

> ClickHouse는 LSM-tree 기반 MergeTree 패밀리 엔진을 지원합니다.  
> 이는 쓰기 작업에 최적화되어 있어 대량의 데이터를 실시간으로 수집하는 데 적합합니다.

> ClickHouse는 분석 쿼리에 맞게 명시적으로 설계되고 최적화되었습니다.  
> 이는 데이터가 지속적으로 분석되어 사기를 나타낼 수 있는 패턴을 찾는 애플리케이션의 요구와 완벽하게 부합합니다.

### Time-sensitive decision making \{#ftime-sensitive-decision-making\}

Time-sensitive decision-making은 사용자 또는 조직이 이용 가능한 최신 정보를 기반으로 빠르게 근거 있는 결정을 내려야 하는 상황을 의미합니다. 실시간 분석은 트레이더가 시장 변동에 반응하거나, 소비자가 구매 결정을 내리거나, 전문가가 실시간 운영 변화에 맞춰 대응하는 등 동적인 환경에서 근거 있는 선택을 내릴 수 있도록 지원합니다.

Coinhall은 캔들스틱 차트를 통해 시간 경과에 따른 가격 변동에 대한 실시간 인사이트를 제공합니다. 이 차트는 각 거래 기간별 시가, 고가, 저가, 종가를 보여줍니다. Coinhall은 이러한 유형의 쿼리를 빠르게 실행하고, 동시에 많은 수의 동시 사용자를 처리할 수 있어야 했습니다.

<Image img={rta_3} size="md" border alt="시간 민감 의사 결정을 위한 실시간 분석" />

> 성능 측면에서 ClickHouse는 캔들스틱 쿼리를 20밀리초에 실행하여, 400밀리초 이상 소요된 다른 데이터베이스와 비교해 명확한 승자였습니다.  
> 최신 가격 쿼리는 8밀리초에 실행하여 45밀리초가 소요된 차선의 성능(SingleStore)을 크게 앞질렀습니다.  
> 마지막으로, ASOF JOIN 쿼리는 50밀리초에 처리한 반면, Snowflake는 20분이 걸렸고 Rockset은 타임아웃되었습니다.
