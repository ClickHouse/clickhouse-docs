---
'sidebar_label': 'Superset'
'sidebar_position': 198
'slug': '/integrations/superset'
'keywords':
- 'superset'
'description': 'Apache Superset는 오픈 소스 데이터 탐색 및 시각화 플랫폼입니다.'
'title': 'Connect Superset to ClickHouse'
'show_related_blogs': true
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_visualization'
- 'website': 'https://github.com/ClickHouse/clickhouse-connect'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import superset_01 from '@site/static/images/integrations/data-visualization/superset_01.png';
import superset_02 from '@site/static/images/integrations/data-visualization/superset_02.png';
import superset_03 from '@site/static/images/integrations/data-visualization/superset_03.png';
import superset_04 from '@site/static/images/integrations/data-visualization/superset_04.png';
import superset_05 from '@site/static/images/integrations/data-visualization/superset_05.png';
import superset_06 from '@site/static/images/integrations/data-visualization/superset_06.png';
import superset_08 from '@site/static/images/integrations/data-visualization/superset_08.png';
import superset_09 from '@site/static/images/integrations/data-visualization/superset_09.png';
import superset_10 from '@site/static/images/integrations/data-visualization/superset_10.png';
import superset_11 from '@site/static/images/integrations/data-visualization/superset_11.png';
import superset_12 from '@site/static/images/integrations/data-visualization/superset_12.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Superset을 ClickHouse에 연결하기

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a>은 Python으로 작성된 오픈 소스 데이터 탐색 및 시각화 플랫폼입니다. Superset은 ClickHouse에서 제공하는 Python 드라이버를 사용하여 ClickHouse에 연결합니다. 작동 방식을 살펴보겠습니다...

## 목표 {#goal}

이 가이드에서는 ClickHouse 데이터베이스의 데이터를 사용하여 Superset에서 대시보드를 구축할 것입니다. 대시보드는 다음과 같은 모습일 것입니다:

<Image size="md" img={superset_12} alt="여러 시각화(원형 차트 및 표 포함)를 보여주는 영국 부동산 가격을 나타내는 Superset 대시보드" border />
<br/>

:::tip 데이터 추가하기
작업할 데이터 세트가 없는 경우 예제 중 하나를 추가할 수 있습니다. 이 가이드는 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 데이터 세트를 사용하므로, 해당 데이터 세트를 선택할 수 있습니다. 같은 문서 카테고리에서 살펴볼 수 있는 여러 다른 예제들도 있습니다.
:::

## 1. 연결 세부 정보 수집하기 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. 드라이버 설치하기 {#2-install-the-driver}

1. Superset은 ClickHouse에 연결하기 위해 `clickhouse-connect` 드라이버를 사용합니다. `clickhouse-connect`에 대한 세부 정보는 <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>에 있으며, 다음 명령어로 설치할 수 있습니다:

```console
pip install clickhouse-connect
```

2. Superset을 시작(또는 재시작)합니다.

## 3. Superset을 ClickHouse에 연결하기 {#3-connect-superset-to-clickhouse}

1. Superset의 상단 메뉴에서 **Data**를 선택한 다음 드롭다운 메뉴에서 **Databases**를 선택합니다. **+ Database** 버튼을 클릭하여 새 데이터베이스를 추가합니다:

<Image size="lg" img={superset_01} alt="Superset 인터페이스에서 + Database 버튼이 강조 표시된 데이터베이스 메뉴" border />
<br/>

2. 첫 번째 단계에서 데이터베이스 유형으로 **ClickHouse Connect**를 선택합니다:

<Image size="sm" img={superset_02} alt="ClickHouse Connect 옵션이 선택된 Superset 데이터베이스 연결 마법사" border />
<br/>

3. 두 번째 단계에서:
- SSL을 켜거나 끕니다.
- 이전에 수집한 연결 정보를 입력합니다.
- **DISPLAY NAME**을 지정합니다: 원하는 이름을 사용할 수 있습니다. 여러 ClickHouse 데이터베이스에 연결할 경우 더 설명적인 이름을 사용하는 것이 좋습니다.

<Image size="sm" img={superset_03} alt="ClickHouse 연결 매개변수를 보여주는 Superset 연결 구성 양식" border />
<br/>

4. **CONNECT** 버튼을 클릭한 다음 **FINISH** 버튼을 클릭하여 설정 마법사를 완료하면 데이터베이스 목록에 데이터베이스가 표시됩니다.

## 4. 데이터 세트 추가하기 {#4-add-a-dataset}

1. Superset에서 ClickHouse 데이터와 상호 작용하려면 **_dataset_**을 정의해야 합니다. Superset의 상단 메뉴에서 **Data**를 선택한 다음 드롭다운 메뉴에서 **Datasets**를 선택합니다.

2. 데이터 세트를 추가하는 버튼을 클릭합니다. 새로운 데이터베이스를 데이터 소스로 선택하면 데이터베이스에 정의된 테이블이 표시됩니다:

<Image size="sm" img={superset_04} alt="ClickHouse 데이터베이스에서 사용 가능한 테이블을 보여주는 Superset 데이터 세트 생성 대화 상자" border />
<br/>

3. 대화 상자 하단의 **ADD** 버튼을 클릭하면 테이블이 데이터 세트 목록에 나타납니다. 이제 대시보드를 구축하고 ClickHouse 데이터를 분석할 준비가 되었습니다!

## 5. Superset에서 차트 및 대시보드 생성하기 {#5--creating-charts-and-a-dashboard-in-superset}

Superset에 익숙하다면, 다음 섹션이 매우 친숙할 것입니다. Superset이 처음이라면... 다른 많은 멋진 시각화 도구와 비슷합니다 - 시작하는 데는 시간이 오래 걸리지 않지만, 도구를 사용하면서 세부 사항과 뉘앙스는 시간이 지남에 따라 배우게 됩니다.

1. 대시보드로 시작합니다. Superset의 상단 메뉴에서 **Dashboards**를 선택합니다. 오른쪽 상단의 버튼을 클릭하여 새 대시보드를 추가합니다. 다음 대시보드의 이름은 **UK property prices**입니다:

<Image size="md" img={superset_05} alt="차트를 추가할 준비가 된 UK property prices라는 이름의 빈 Superset 대시보드" border />
<br/>

2. 새 차트를 만들려면 상단 메뉴에서 **Charts**를 선택하고 새로운 차트를 추가하는 버튼을 클릭합니다. 여러 옵션이 표시됩니다. 다음 예제는 **CHOOSE A DATASET** 드롭다운에서 **uk_price_paid** 데이터 세트를 사용한 **원형 차트**를 보여줍니다:

<Image size="md" img={superset_06} alt="원형 차트 시각화 유형이 선택된 Superset 차트 생성 인터페이스" border />
<br/>

3. Superset 원형 차트에는 **Dimension**과 **Metric**이 필요하며, 나머지 설정은 선택 사항입니다. 차원과 메트릭에 사용할 수 있는 필드를 선택할 수 있으며, 이 예제에서는 ClickHouse 필드 `district`를 차원으로, `AVG(price)`를 메트릭으로 사용합니다.

<Image size="md" img={superset_08} alt="원형 차트를 위한 district 필드를 선택한 차원 구성" border />
<Image size="md" img={superset_09} alt="원형 차트를 위한 AVG(price) 집계 함수를 보여주는 메트릭 구성" border />
<br/>

5. 원형 차트보다 도넛 차트를 선호한다면 **CUSTOMIZE**에서 해당 옵션과 기타 설정을 조정할 수 있습니다:

<Image size="sm" img={superset_10} alt="도넛 차트 옵션과 기타 원형 차트 구성 설정이 표시된 사용자 정의 패널" border />
<br/>

6. 차트를 저장하려면 **SAVE** 버튼을 클릭한 다음 **ADD TO DASHBOARD** 드롭다운에서 **UK property prices**를 선택하고 **SAVE & GO TO DASHBOARD**를 클릭하여 차트를 저장하고 대시보드에 추가합니다:

<Image size="md" img={superset_11} alt="대시보드 선택 드롭다운과 Save & Go to Dashboard 버튼이 있는 차트 저장 대화상자" border />
<br/>

7. 끝났습니다. ClickHouse의 데이터를 기반으로 Superset에서 대시보드를 구축하면 빠른 데이터 분석의 새로운 세계가 열립니다!

<Image size="md" img={superset_12} alt="ClickHouse의 영국 부동산 가격 데이터에 대한 여러 시각화를 포함한 완료된 Superset 대시보드" border />
<br/>
