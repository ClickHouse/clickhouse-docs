---
sidebar_label: '대시보드'
slug: /cloud/manage/dashboards
title: '대시보드'
description: 'SQL Console의 대시보드 기능을 사용하면 저장된 쿼리에서 생성된 시각화 결과를 모으고 공유할 수 있습니다.'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', '대시보드', '데이터 시각화', 'SQL 콘솔 대시보드', '클라우드 분석']
---

import BetaBadge from '@theme/badges/BetaBadge';
import Image from '@theme/IdealImage';
import dashboards_2 from '@site/static/images/cloud/dashboards/2_dashboards.png';
import dashboards_3 from '@site/static/images/cloud/dashboards/3_dashboards.png';
import dashboards_4 from '@site/static/images/cloud/dashboards/4_dashboards.png';
import dashboards_5 from '@site/static/images/cloud/dashboards/5_dashboards.png';
import dashboards_6 from '@site/static/images/cloud/dashboards/6_dashboards.png';
import dashboards_7 from '@site/static/images/cloud/dashboards/7_dashboards.png';
import dashboards_8 from '@site/static/images/cloud/dashboards/8_dashboards.png';
import dashboards_9 from '@site/static/images/cloud/dashboards/9_dashboards.png';
import dashboards_10 from '@site/static/images/cloud/dashboards/10_dashboards.png';
import dashboards_11 from '@site/static/images/cloud/dashboards/11_dashboards.png';


# 대시보드 \{#dashboards\}

SQL Console의 대시보드 기능을 사용하면 저장된 쿼리에서 생성된 시각화를 모아서 공유할 수 있습니다. 먼저 쿼리를 저장하고 시각화를 만든 다음, 해당 쿼리 시각화를 대시보드에 추가하고 쿼리 매개변수를 사용해 대시보드를 대화형으로 구성하십시오.

## 핵심 개념 \{#core-concepts\}

### 쿼리 공유 \{#query-sharing\}

대시보드를 동료와 공유하려면, 해당 대시보드에 사용된 저장된 쿼리도 함께 공유해야 합니다. 시각화를 확인하려면 최소한 해당 저장된 쿼리에 대한 읽기 전용 접근 권한이 있어야 합니다.

### 상호 작용성 \{#interactivity\}

대시보드를 대화형으로 만들려면 [쿼리 매개변수](/sql-reference/syntax#defining-and-using-query-parameters)를 사용합니다. 예를 들어, `WHERE` 절에 쿼리 매개변수를 추가하여 필터처럼 동작하게 할 수 있습니다. 

시각화 설정에서 「filter」 유형을 선택하면 **Global** 필터 사이드 패널을 통해 쿼리 매개변수 입력을 켜거나 끌 수 있습니다. 대시보드에서 다른 객체(예: 테이블)에 연결하여 쿼리 매개변수 입력을 토글할 수도 있습니다. 아래 빠른 시작 가이드의 「[필터 구성하기](/cloud/manage/dashboards#configure-a-filter)」 섹션을 참고하십시오. 

## 빠른 시작 \{#quick-start\}

[query\_log](/operations/system-tables/query_log) 시스템 테이블을 사용하여 ClickHouse 서비스를 모니터링하기 위한 대시보드를 만들어 보겠습니다. 

## 빠른 시작 \{#quick-start-1\}

### 저장된 쿼리 만들기 \{#create-a-saved-query\}

이미 시각화할 저장된 쿼리가 있는 경우 이 단계를 건너뛰면 됩니다. 

새 쿼리 탭을 엽니다. ClickHouse 시스템 테이블을 사용하여 특정 서비스의 일별 쿼리 양을 계산하는 쿼리를 작성해 보겠습니다:

<Image img={dashboards_2} size="md" alt="저장된 쿼리 만들기" border/>

쿼리 결과를 테이블 형식으로 보거나, 차트 보기에서 바로 시각화 구성을 시작할 수 있습니다. 다음 단계에서는 이 쿼리를 `queries over time`이라는 이름으로 저장합니다:

<Image img={dashboards_3} size="md" alt="쿼리 저장" border/>

저장된 쿼리에 대한 더 자세한 내용은 [「Saving a Query」 섹션](/cloud/get-started/sql-console#saving-a-query)에서 확인할 수 있습니다.

`query count by query kind`라는 또 다른 쿼리를 만들어 저장하고, 쿼리 종류별 쿼리 수를 계산합니다. 아래는 SQL 콘솔에서 이 데이터로 만든 막대 차트 시각화입니다. 

<Image img={dashboards_4} size="md" alt="쿼리 결과의 막대 차트 시각화" border/>

이제 쿼리가 두 개 준비되었으므로, 이 쿼리들을 시각화하고 모아 볼 대시보드를 생성하겠습니다. 

### 대시보드 생성 \{#create-a-dashboard\}

Dashboards 패널로 이동한 다음 「New Dashboard」를 클릭합니다. 이름을 지정하면 첫 대시보드를 성공적으로 생성한 것입니다!

<Image img={dashboards_5} size="md" alt="새 대시보드 생성" border/>

### 시각화 추가하기 \{#add-a-visualization\}

`queries over time`과 `query count by query kind`라는 두 개의 저장된 쿼리가 있습니다. 첫 번째 쿼리를 선형 차트로 시각화해 보겠습니다. 시각화에 제목과 부제목을 지정한 다음, 시각화할 쿼리를 선택하십시오. 이후 "Line" 차트 유형을 선택하고 x축과 y축을 지정하십시오.

<Image img={dashboards_6} size="md" alt="시각화 추가하기" border/>

여기에서는 숫자 형식, 범례 레이아웃, 축 레이블과 같은 추가적인 스타일 변경도 수행할 수 있습니다. 

다음으로, 두 번째 쿼리를 테이블로 시각화하고 선형 차트 아래에 배치하십시오. 

<Image img={dashboards_7} size="md" alt="쿼리 결과를 테이블로 시각화" border/>

이제 두 개의 저장된 쿼리를 시각화하여 첫 번째 대시보드를 만들었습니다!

### 필터 구성하기 \{#configure-a-filter\}

이제 쿼리 종류(query kind)에 대한 필터를 추가해 대시보드를 인터랙티브하게 만들어 보겠습니다. 이렇게 하면 Insert 쿼리와 관련된 추세만 표시할 수 있습니다. 이 작업은 [쿼리 매개변수](/sql-reference/syntax#defining-and-using-query-parameters)를 사용하여 수행합니다. 

라인 차트 옆의 점 세 개 아이콘을 클릭한 다음, 쿼리 옆의 연필 버튼을 클릭하여 인라인 쿼리 편집기를 엽니다. 여기에서 대시보드에서 바로 저장된 기본 쿼리를 직접 수정할 수 있습니다. 

<Image img={dashboards_8} size="md" alt="기본 쿼리 편집" border/>

이제 노란색 실행 쿼리(run query) 버튼을 누르면, 앞에서 사용한 동일한 쿼리가 Insert 쿼리만 포함하도록 필터링된 상태로 표시됩니다. 쿼리를 업데이트하려면 저장 버튼을 클릭하십시오. 차트 설정으로 돌아가면 라인 차트를 필터링할 수 있게 됩니다. 

이제 상단 리본의 Global Filters를 사용해 입력 값을 변경하여 필터를 토글할 수 있습니다. 

<Image img={dashboards_9} size="md" alt="글로벌 필터 조정" border/>

라인 차트의 필터를 테이블과 연결하려 한다고 가정해 보겠습니다. 이를 위해 시각화 설정으로 돌아가서 `query_kind` 쿼리 매개변수의 값 소스를 테이블로 변경한 후, 연결할 필드로 `query_kind` 컬럼을 선택하면 됩니다. 

<Image img={dashboards_10} size="md" alt="쿼리 매개변수 변경" border/>

이제 종류별 쿼리 테이블에서 라인 차트의 필터를 직접 제어하여 대시보드를 인터랙티브하게 만들 수 있습니다. 

<Image img={dashboards_11} size="md" alt="라인 차트에서 필터 제어" border/>