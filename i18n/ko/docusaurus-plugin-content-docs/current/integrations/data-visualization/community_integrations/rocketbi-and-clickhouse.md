---
sidebar_label: 'Rocket BI'
sidebar_position: 131
slug: /integrations/rocketbi
keywords: ['clickhouse', 'RocketBI', 'connect', 'integrate', 'ui']
description: 'RocketBI는 웹 브라우저에서 바로 데이터를 빠르게 분석하고, 드래그 앤 드롭 방식으로 시각화를 생성하며, 동료와 손쉽게 협업할 수 있도록 지원하는 셀프 서비스형 비즈니스 인텔리전스 플랫폼입니다.'
title: '목표: 첫 번째 대시보드 구축'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import rocketbi_01 from '@site/static/images/integrations/data-visualization/rocketbi_01.gif';
import rocketbi_02 from '@site/static/images/integrations/data-visualization/rocketbi_02.gif';
import rocketbi_03 from '@site/static/images/integrations/data-visualization/rocketbi_03.png';
import rocketbi_04 from '@site/static/images/integrations/data-visualization/rocketbi_04.png';
import rocketbi_05 from '@site/static/images/integrations/data-visualization/rocketbi_05.png';
import rocketbi_06 from '@site/static/images/integrations/data-visualization/rocketbi_06.png';
import rocketbi_07 from '@site/static/images/integrations/data-visualization/rocketbi_07.png';
import rocketbi_08 from '@site/static/images/integrations/data-visualization/rocketbi_08.png';
import rocketbi_09 from '@site/static/images/integrations/data-visualization/rocketbi_09.png';
import rocketbi_10 from '@site/static/images/integrations/data-visualization/rocketbi_10.png';
import rocketbi_11 from '@site/static/images/integrations/data-visualization/rocketbi_11.png';
import rocketbi_12 from '@site/static/images/integrations/data-visualization/rocketbi_12.png';
import rocketbi_13 from '@site/static/images/integrations/data-visualization/rocketbi_13.png';
import rocketbi_14 from '@site/static/images/integrations/data-visualization/rocketbi_14.png';
import rocketbi_15 from '@site/static/images/integrations/data-visualization/rocketbi_15.png';
import rocketbi_16 from '@site/static/images/integrations/data-visualization/rocketbi_16.png';
import rocketbi_17 from '@site/static/images/integrations/data-visualization/rocketbi_17.png';
import rocketbi_18 from '@site/static/images/integrations/data-visualization/rocketbi_18.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# 목표: Rocket.BI로 첫 대시보드 만들기 \{#goal-build-your-first-dashboard-with-rocketbi\}

<CommunityMaintainedBadge/>

이 가이드에서는 Rocket.BI를 설치하고 간단한 대시보드를 만듭니다.
다음은 해당 대시보드입니다.

<Image size="md" img={rocketbi_01} alt="차트와 KPI로 판매 지표를 보여주는 Rocket BI 대시보드" border />

<br/>

[이 링크를 통해 대시보드를 확인할 수 있습니다.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## 설치 \{#install\}

사전 빌드된 Docker 이미지를 사용해 RocketBI를 시작합니다.

docker-compose.yml 및 구성 파일을 다운로드합니다:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```

`.clickhouse.env` 파일을 편집한 후 ClickHouse 서버 정보를 추가합니다.

다음 명령을 실행하여 RocketBI를 시작합니다: `docker-compose up -d .`

브라우저를 열고 `localhost:5050`에 접속한 다음, 다음 계정 정보로 로그인합니다: `hello@gmail.com/123456`

소스에서 직접 빌드하거나 고급 구성을 수행하려면 [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)를 참고하십시오.


## 대시보드를 만들어 보겠습니다 \{#lets-build-the-dashboard\}

Dashboard 화면에서 리포트를 확인하고, **+New**를 클릭하여 시각화를 시작합니다.

**무제한 대시보드**를 만들고, 각 대시보드에 **무제한 차트**를 추가할 수 있습니다.

<Image size="md" img={rocketbi_02} alt="Rocket BI에서 새 차트를 생성하는 과정을 보여주는 애니메이션" border />

<br/>

고해상도 튜토리얼은 YouTube에서 확인할 수 있습니다: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### 차트 컨트롤 구성하기 \{#build-the-chart-controls\}

#### 메트릭 컨트롤 생성 \{#create-a-metrics-control\}

Tab filter에서 사용하려는 메트릭 필드를 선택합니다. 집계 설정(aggregation setting)을 올바르게 선택했는지 확인합니다.

<Image size="md" img={rocketbi_03} alt="선택된 필드와 집계 설정이 표시된 Rocket BI 메트릭 컨트롤 구성 패널" border />

<br/>

필터 이름을 변경한 뒤 컨트롤을 대시보드에 저장합니다.

<Image size="md" img={rocketbi_04} alt="이름이 변경된 필터가 있는 메트릭 컨트롤이 대시보드에 저장할 준비가 된 상태" border />

#### 날짜 타입 컨트롤 생성 \{#create-a-date-type-control\}

Main Date 컬럼으로 사용할 Date 필드를 선택합니다:

<Image size="md" img={rocketbi_05} alt="Rocket BI에서 사용 가능한 날짜 컬럼을 보여주는 Date 필드 선택 인터페이스" border />

<br/>

서로 다른 조회 범위를 갖는 변형(복제본)을 추가합니다. 예를 들어 연, 월, 일 또는 요일 단위 날짜입니다.

<Image size="md" img={rocketbi_06} alt="연, 월, 일 등 서로 다른 기간 옵션을 보여주는 날짜 범위 구성 화면" border />

<br/>

필터 이름을 변경하고 컨트롤을 대시보드에 저장합니다.

<Image size="md" img={rocketbi_07} alt="필터 이름을 변경한 후 대시보드에 저장할 준비가 된 날짜 범위 컨트롤" border />

### 이제 차트를 만들어 보겠습니다 \{#now-let-build-the-charts\}

#### 파이 차트: 지역별 매출 지표 \{#pie-chart-sales-metrics-by-regions\}

새 차트 추가(Add new chart)를 선택한 다음, Pie Chart를 선택합니다.

<Image size="md" img={rocketbi_08} alt="파이 차트 옵션이 강조된 차트 유형 선택 패널" border />

<br/>

먼저 Dataset에서 "Region" 컬럼을 Legend 필드(Legend Field)로 드래그 앤 드롭합니다.

<Image size="md" img={rocketbi_09} alt="Region 컬럼이 Legend 필드에 추가되는 드래그 앤 드롭 인터페이스" border />

<br/>

그 다음 Chart Control 탭으로 이동합니다.

<Image size="md" img={rocketbi_10} alt="시각화 구성 옵션을 보여주는 Chart Control 탭 인터페이스" border />

<br/>

Metrics Control을 Value 필드(Value Field)로 드래그 앤 드롭합니다.

<Image size="md" img={rocketbi_11} alt="파이 차트의 Value 필드에 추가되는 Metrics Control" border />

<br/>

(Metrics Control은 정렬(Sorting)에도 사용할 수 있습니다.)

추가 설정은 Chart Setting에서 진행합니다.

<Image size="md" img={rocketbi_12} alt="파이 차트에 대한 사용자 설정 옵션을 보여주는 Chart Settings 패널" border />

<br/>

예를 들어, Data label을 Percentage로 변경합니다.

<Image size="md" img={rocketbi_13} alt="파이 차트에 퍼센트가 표시되도록 Data label 설정을 Percentage로 변경하는 화면" border />

<br/>

저장(Save)한 후 차트를 Dashboard에 추가(Add)합니다.

<Image size="md" img={rocketbi_14} alt="새로 추가된 파이 차트와 다른 컨트롤이 함께 표시된 Dashboard 화면" border />

#### 시계열 차트에서 날짜 컨트롤 사용하기 \{#use-date-control-in-a-time-series-chart\}

누적 막대형 차트(Stacked Column Chart)를 사용합니다

<Image size="md" img={rocketbi_15} alt="시계열 데이터로 누적 막대형 차트를 생성하는 인터페이스" border />

<br/>

Chart Control에서 Metrics Control을 Y축으로, Date Range를 X축으로 설정합니다

<Image size="md" img={rocketbi_16} alt="Y축에 metrics, X축에 date range가 설정된 차트 컨트롤 구성 화면" border />

<br/>

Breakdown에 Region 컬럼을 추가합니다

<Image size="md" img={rocketbi_17} alt="누적 막대형 차트에서 breakdown 차원으로 Region 컬럼이 추가되는 화면" border />

<br/>

Number Chart를 KPI로 추가하여 대시보드를 돋보이게 합니다

<Image size="md" img={rocketbi_18} alt="KPI 숫자 차트, 파이 차트, 시계열 시각화가 포함된 완성된 대시보드" border />

<br/>

이제 rocket.BI로 첫 번째 대시보드를 성공적으로 구성했습니다