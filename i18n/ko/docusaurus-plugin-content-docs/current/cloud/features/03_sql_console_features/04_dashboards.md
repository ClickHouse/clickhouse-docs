---
'sidebar_label': '대시보드'
'slug': '/cloud/manage/dashboards'
'title': '대시보드'
'description': 'SQL Console의 대시보드 기능을 사용하면 저장된 쿼리에서 시각화를 수집하고 공유할 수 있습니다.'
'doc_type': 'guide'
'keywords':
- 'ClickHouse Cloud'
- 'dashboards'
- 'data visualization'
- 'SQL console dashboards'
- 'cloud analytics'
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


# 대시보드

SQL 콘솔의 대시보드 기능을 사용하면 저장된 쿼리에서 시각화를 수집하고 공유할 수 있습니다. 쿼리를 저장하고 시각화하는 것부터 시작하여, 대시보드에 쿼리 시각화를 추가하고, 쿼리 파라미터를 사용하여 대시보드를 상호작용형으로 만드는 방법을 배워보세요.

## 핵심 개념 {#core-concepts}

### 쿼리 공유 {#query-sharing}

동료와 대시보드를 공유하려면 기본적인 저장 쿼리도 함께 공유해야 합니다. 시각화를 보기 위해서는 사용자에게 최소한 읽기 전용 액세스 권한이 있어야 합니다.

### 상호작용성 {#interactivity}

대시보드를 상호작용형으로 만들기 위해 [쿼리 파라미터](/sql-reference/syntax#defining-and-using-query-parameters)를 사용하세요. 예를 들어, `WHERE` 절에 쿼리 파라미터를 추가하여 필터 역할을 할 수 있습니다.

대시보드의 시각화 설정에서 “필터” 유형을 선택하여 **Global** 필터 사이드 패널을 통해 쿼리 파라미터 입력을 전환할 수 있습니다. 또한 대시보드의 다른 객체(표와 같은)에 연결하여 쿼리 파라미터 입력을 전환할 수 있습니다. 아래의 빠른 시작 가이드 “[필터 구성하기](/cloud/manage/dashboards#configure-a-filter)” 섹션을 참조하시기 바랍니다.

## 빠른 시작 {#quick-start}

[query_log](/operations/system-tables/query_log) 시스템 테이블을 사용하여 ClickHouse 서비스를 모니터링하는 대시보드를 생성해 보겠습니다.

## 빠른 시작 {#quick-start-1}

### 저장된 쿼리 만들기 {#create-a-saved-query}

시각화할 저장된 쿼리가 이미 있는 경우, 이 단계를 건너뛸 수 있습니다.

새 쿼리 탭을 열고 ClickHouse 시스템 테이블을 사용하여 서비스의 쿼리 양을 날짜별로 세는 쿼리를 작성해 보겠습니다:

<Image img={dashboards_2} size="md" alt="저장된 쿼리 만들기" border/>

쿼리의 결과를 테이블 형식으로 보거나 차트 뷰에서 시각화를 구축하기 시작할 수 있습니다. 다음 단계에서는 쿼리를 `queries over time`으로 저장해 보겠습니다:

<Image img={dashboards_3} size="md" alt="쿼리 저장" border/>

저장된 쿼리와 관련된 자세한 문서는 [쿼리 저장 섹션](/cloud/get-started/sql-console#saving-a-query)에서 확인할 수 있습니다.

쿼리 종류별 쿼리 수를 세는 또 다른 쿼리인 `query count by query kind`를 생성하고 저장할 수 있습니다. SQL 콘솔에서 데이터의 막대 차트 시각화는 다음과 같습니다.

<Image img={dashboards_4} size="md" alt="쿼리 결과의 막대 차트 시각화" border/>

이제 두 개의 쿼리가 생겼으므로, 이 쿼리들을 시각화하고 수집할 대시보드를 만들어 보겠습니다.

### 대시보드 생성하기 {#create-a-dashboard}

대시보드 패널로 이동하여 “새 대시보드”를 클릭합니다. 이름을 지정한 후, 첫 번째 대시보드를 성공적으로 생성한 것입니다!

<Image img={dashboards_5} size="md" alt="새 대시보드 생성" border/>

### 시각화 추가하기 {#add-a-visualization}

두 개의 저장된 쿼리인 `queries over time`과 `query count by query kind`가 있습니다. 첫 번째 쿼리를 선형 차트로 시각화해 보겠습니다. 시각화에 제목과 부제목을 지정하고, 시각화할 쿼리를 선택합니다. 다음으로 “선형” 차트 유형을 선택하고 x 및 y축을 지정합니다.

<Image img={dashboards_6} size="md" alt="시각화 추가하기" border/>

여기서는 숫자 형식, 범례 레이아웃 및 축 레이블과 같은 추가적인 스타일 변경도 가능합니다.

다음으로 두 번째 쿼리를 테이블로 시각화하고 선형 차트 바로 아래에 배치해 보겠습니다.

<Image img={dashboards_7} size="md" alt="쿼리 결과를 테이블로 시각화" border/>

두 개의 저장된 쿼리를 시각화하여 첫 번째 대시보드를 생성했습니다!

### 필터 구성하기 {#configure-a-filter}

쿼리 종류에 대한 필터를 추가하여 대시보드를 상호작용형으로 만들어 보겠습니다. 이를 통해 Insert 쿼리와 관련된 트렌드만 표시할 수 있습니다. 이 작업은 [쿼리 파라미터](/sql-reference/syntax#defining-and-using-query-parameters)를 사용하여 수행합니다.

선형 차트 옆의 세 개의 점을 클릭하고, 쿼리 옆의 연필 버튼을 클릭하여 인라인 쿼리 편집기를 엽니다. 여기에서 대시보드에서 기본 저장 쿼리를 직접 편집할 수 있습니다.

<Image img={dashboards_8} size="md" alt="기본 쿼리 편집" border/>

이제 노란색 실행 쿼리 버튼을 누르면 이전에 보았던 쿼리가 Insert 쿼리로만 필터링되어 표시됩니다. 쿼리를 업데이트하려면 저장 버튼을 클릭하세요. 차트 설정으로 돌아가면 선형 차트를 필터링할 수 있습니다.

이제 상단 리본의 Global Filters를 사용하여 입력을 변경하여 필터를 전환할 수 있습니다.

<Image img={dashboards_9} size="md" alt="전역 필터 조정" border/>

선형 차트의 필터를 테이블에 연결하고자 할 경우, 시각화 설정으로 돌아가서 query_kind 쿼리 파라미터의 값 출처를 테이블로 변경하고, query_kind 컬럼을 연결할 필드로 선택할 수 있습니다.

<Image img={dashboards_10} size="md" alt="쿼리 파라미터 변경" border/>

이제 쿼리 종류 테이블에서 선형 차트의 필터를 직접 제어할 수 있어 대시보드를 상호작용형으로 만들 수 있습니다.

<Image img={dashboards_11} size="md" alt="선형 차트의 필터 제어" border/>
