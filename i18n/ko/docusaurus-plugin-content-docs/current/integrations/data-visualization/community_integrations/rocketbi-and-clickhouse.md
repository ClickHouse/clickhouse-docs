---
'sidebar_label': 'Rocket BI'
'sidebar_position': 131
'slug': '/integrations/rocketbi'
'keywords':
- 'clickhouse'
- 'RocketBI'
- 'connect'
- 'integrate'
- 'ui'
'description': 'RocketBI는 데이터를 신속하게 분석하고 드래그 앤 드롭 시각화를 만들며 동료들과 웹 브라우저에서 바로 협업할 수
  있도록 도와주는 자체 관리 비즈니스 인텔리전스 플랫폼입니다.'
'title': '목표: 첫 번째 대시보드 만들기'
'doc_type': 'guide'
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


# 목표: Rocket.BI로 첫 번째 대시보드 만들기

<CommunityMaintainedBadge/>

이 가이드에서는 Rocket.BI를 사용하여 간단한 대시보드를 설치하고 구축하는 방법을 설명합니다.
이것이 대시보드입니다:

<Image size="md" img={rocketbi_01} alt="Rocket BI 대시보드가 차트 및 KPI와 함께 판매 메트릭을 표시하고 있습니다." border />
<br/>

[이 링크를 통해 대시보드를 확인할 수 있습니다.](https://demo.rocket.bi/dashboard/sales-dashboard-7?token=7eecf750-cbde-4c53-8fa8-8b905fec667e)

## 설치 {#install}

프리빌트 도커 이미지를 사용하여 RocketBI를 시작하세요.

docker-compose.yml 및 구성 파일을 가져옵니다:

```bash
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/docker-compose.yml
wget https://raw.githubusercontent.com/datainsider-co/rocket-bi/main/docker/.clickhouse.env
```
.clickhouse.env를 편집하고 ClickHouse 서버 정보를 추가합니다.

다음 명령을 실행하여 RocketBI를 시작합니다: ``` docker-compose up -d . ```

브라우저를 열고 ```localhost:5050```으로 이동한 후, 이 계정으로 로그인합니다: ```hello@gmail.com/123456```

소스에서 빌드하거나 고급 구성을 원하신다면 여기에서 확인하실 수 있습니다: [Rocket.BI Readme](https://github.com/datainsider-co/rocket-bi/blob/main/README.md)

## 대시보드 구축하기 {#lets-build-the-dashboard}

대시보드에서 보고서를 찾고 **+새로 만들기**를 클릭하여 시각화를 시작하세요.

**무제한 대시보드**를 만들고 대시보드에서 **무제한 차트**를 그릴 수 있습니다.

<Image size="md" img={rocketbi_02} alt="Rocket BI에서 새로운 차트를 만드는 과정의 애니메이션" border />
<br/>

Youtube에서 고해상도 튜토리얼 보시기: [https://www.youtube.com/watch?v=TMkdMHHfvqY](https://www.youtube.com/watch?v=TMkdMHHfvqY)

### 차트 컨트롤 구축하기 {#build-the-chart-controls}

#### 메트릭 컨트롤 만들기 {#create-a-metrics-control}
탭 필터에서 사용하고자 하는 메트릭 필드를 선택합니다. 집계 설정을 확인해야 합니다.

<Image size="md" img={rocketbi_03} alt="선택한 필드와 집계 설정을 보여주는 Rocket BI 메트릭 컨트롤 구성 패널" border />
<br/>

필터 이름을 바꾸고 대시보드에 컨트롤을 저장합니다.

<Image size="md" img={rocketbi_04} alt="대시보드에 저장할 준비가 된 필터 이름이 변경된 메트릭 컨트롤" border />

#### 날짜 유형 컨트롤 만들기 {#create-a-date-type-control}
주 날짜 열로 사용될 날짜 필드를 선택합니다:

<Image size="md" img={rocketbi_05} alt="사용 가능한 날짜 열을 보여주는 Rocket BI의 날짜 필드 선택 인터페이스" border />
<br/>

다양한 조회 범위를 가진 중복 변형을 추가합니다. 예를 들어, 연도, 월, 일 또는 주 중 하루.

<Image size="md" img={rocketbi_06} alt="연도, 월, 일 등 다양한 기간 옵션을 보여주는 날짜 범위 구성" border />
<br/>

필터 이름을 바꾸고 대시보드에 컨트롤을 저장합니다.

<Image size="md" img={rocketbi_07} alt="대시보드에 저장할 준비가 된 필터 이름이 변경된 날짜 범위 컨트롤" border />

### 이제 차트를 만들어 보겠습니다 {#now-let-build-the-charts}

#### 파이 차트: 지역별 판매 메트릭 {#pie-chart-sales-metrics-by-regions}
새 차트를 추가하고, 파이 차트를 선택합니다.

<Image size="md" img={rocketbi_08} alt="파이 차트 옵션이 강조 표시된 차트 유형 선택 패널" border />
<br/>

우선 데이터 세트에서 "지역" 컬럼을 레전드 필드로 드래그 앤 드롭합니다.

<Image size="md" img={rocketbi_09} alt="레전드 필드에 지역 컬럼이 추가되고 있는 드래그 앤 드롭 인터페이스" border />
<br/>

그 후, 차트 컨트롤 탭으로 변경합니다.

<Image size="md" img={rocketbi_10} alt="시각화 구성 옵션을 보여주는 차트 컨트롤 탭 인터페이스" border />
<br/>

메트릭 컨트롤을 값 필드로 드래그 앤 드롭합니다.

<Image size="md" img={rocketbi_11} alt="파이 차트의 값 필드에 메트릭 컨트롤이 추가되고 있는 모습" border />
<br/>

(메트릭 컨트롤을 정렬로 사용할 수도 있습니다.)

추가 커스터마이징을 위해 차트 설정으로 이동합니다.

<Image size="md" img={rocketbi_12} alt="파이 차트의 사용자 지정 옵션을 보여주는 차트 설정 패널" border />
<br/>

예를 들어, 데이터 레이블을 백분율로 변경합니다.

<Image size="md" img={rocketbi_13} alt="파이 차트에 백분율을 표시하도록 데이터 레이블 설정이 변경되고 있는 모습" border />
<br/>

차트를 저장하고 대시보드에 추가합니다.

<Image size="md" img={rocketbi_14} alt="기타 컨트롤과 함께 새로 추가된 파이 차트를 보여주는 대시보드 보기" border />

#### 시계열 차트에서 날짜 컨트롤 사용하기 {#use-date-control-in-a-time-series-chart}
스택형 컬럼 차트를 사용해 보겠습니다.

<Image size="md" img={rocketbi_15} alt="시계열 데이터로 스택형 컬럼 차트 생성 인터페이스" border />
<br/>

차트 컨트롤에서 메트릭 컨트롤을 Y축으로, 날짜 범위를 X축으로 사용합니다.

<Image size="md" img={rocketbi_16} alt="Y축의 메트릭과 X축의 날짜 범위를 보여주는 차트 컨트롤 구성" border />
<br/>

지역 컬럼을 분할 항목으로 추가합니다.

<Image size="md" img={rocketbi_17} alt="스택형 컬럼 차트에서 분할 차원으로 지역 컬럼이 추가되고 있는 모습" border />
<br/>

KPI로 숫자 차트를 추가하고 대시보드를 빛내세요.

<Image size="md" img={rocketbi_18} alt="KPI 숫자 차트, 파이 차트 및 시계열 시각화를 포함한 완성된 대시보드" border />
<br/>

이제 Rocket.BI로 첫 번째 대시보드를 성공적으로 구축하셨습니다.
