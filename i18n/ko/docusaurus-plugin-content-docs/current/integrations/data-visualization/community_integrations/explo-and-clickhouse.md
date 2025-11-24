---
'sidebar_label': 'Explo'
'sidebar_position': 131
'slug': '/integrations/explo'
'keywords':
- 'clickhouse'
- 'Explo'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Explo는 데이터를 질문하기 위한 사용하기 쉬운 오픈 소스 UI 도구입니다.'
'title': 'Explo를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'data_visualization'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import explo_01 from '@site/static/images/integrations/data-visualization/explo_01.png';
import explo_02 from '@site/static/images/integrations/data-visualization/explo_02.png';
import explo_03 from '@site/static/images/integrations/data-visualization/explo_03.png';
import explo_04 from '@site/static/images/integrations/data-visualization/explo_04.png';
import explo_05 from '@site/static/images/integrations/data-visualization/explo_05.png';
import explo_06 from '@site/static/images/integrations/data-visualization/explo_06.png';
import explo_07 from '@site/static/images/integrations/data-visualization/explo_07.png';
import explo_08 from '@site/static/images/integrations/data-visualization/explo_08.png';
import explo_09 from '@site/static/images/integrations/data-visualization/explo_09.png';
import explo_10 from '@site/static/images/integrations/data-visualization/explo_10.png';
import explo_11 from '@site/static/images/integrations/data-visualization/explo_11.png';
import explo_12 from '@site/static/images/integrations/data-visualization/explo_12.png';
import explo_13 from '@site/static/images/integrations/data-visualization/explo_13.png';
import explo_14 from '@site/static/images/integrations/data-visualization/explo_14.png';
import explo_15 from '@site/static/images/integrations/data-visualization/explo_15.png';
import explo_16 from '@site/static/images/integrations/data-visualization/explo_16.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Explo를 ClickHouse에 연결하기

<CommunityMaintainedBadge/>

모든 플랫폼을 위한 고객 대면 분석. 아름다운 시각화를 위해 설계되었습니다. 단순성을 위해 엔지니어링되었습니다.

## 목표 {#goal}

이 가이드에서는 ClickHouse의 데이터를 Explo에 연결하고 결과를 시각화합니다. 차트는 다음과 같이 표시됩니다:
<Image img={explo_15} size="md" alt="Explo 대시보드" />

<p/>

:::tip 데이터를 추가하세요
작업할 데이터셋이 없다면 예제 중 하나를 추가할 수 있습니다. 이 가이드에서는 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 데이터셋을 사용하므로, 이를 선택할 수 있습니다. 같은 문서 카테고리에서 살펴볼 수 있는 여러 다른 예제가 있습니다.
:::

## 1. 연결 세부정보 수집하기 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Explo를 ClickHouse에 연결하기 {#2--connect-explo-to-clickhouse}

1. Explo 계정을 등록하세요.

2. 왼쪽 사이드바에서 Explo **데이터** 탭을 클릭하세요.

<Image img={explo_01} size="sm" alt="데이터 탭" border />

3. 오른쪽 상단에서 **데이터 소스 연결**을 클릭하세요.

<Image img={explo_02} size="sm" alt="데이터 소스 연결" border />

4. **시작하기** 페이지에 정보를 입력하세요.

<Image img={explo_03} size="md" alt="시작하기" border />

5. **Clickhouse**를 선택하세요.

<Image img={explo_04} size="md" alt="Clickhouse" border />

6. **Clickhouse 자격 증명**을 입력하세요.

<Image img={explo_05} size="md" alt="자격 증명" border />

7. **보안**을 구성하세요.

<Image img={explo_06} size="md" alt="보안" border />

8. Clickhouse 내에서 **Explo IP를 허용 목록에 추가**하세요.
`
54.211.43.19, 52.55.98.121, 3.214.169.94, and 54.156.141.148
`

## 3. 대시보드 만들기 {#3-create-a-dashboard}

1. 왼쪽 사이드 내비게이션 바에서 **대시보드** 탭으로 이동하세요.

<Image img={explo_07} size="sm" alt="대시보드" border />

2. 오른쪽 상단에서 **대시보드 만들기**를 클릭하고 대시보드 이름을 지정하세요. 이제 대시보드를 만들었습니다!

<Image img={explo_08} size="sm" alt="대시보드 만들기" border />

3. 이제 이와 유사한 화면이 표시되어야 합니다:

<Image img={explo_09} size="md" alt="Explo 대시보드" border />

## 4. SQL 쿼리 실행하기 {#4-run-a-sql-query}

1. 오른쪽 사이드바에서 스키마 제목 아래에 있는 테이블 이름을 가져옵니다. 그런 다음 다음 명령을 데이터셋 편집기에 입력하세요:
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<Image img={explo_10} size="md" alt="Explo 대시보드" border />

2. 이제 실행을 클릭하고 미리 보기 탭으로 이동하여 데이터를 확인하세요.

<Image img={explo_11} size="md" alt="Explo 대시보드" border />

## 5. 차트 만들기 {#5-build-a-chart}

1. 왼쪽에서 막대 차트 아이콘을 화면으로 드래그하세요.

<Image img={explo_16} size="sm" alt="Explo 대시보드" border />

2. 데이터셋을 선택하세요. 이제 다음과 같은 화면이 표시되어야 합니다:

<Image img={explo_12} size="sm" alt="Explo 대시보드" border />

3. X축에 **county**를, Y축 섹션에 **Price**를 다음과 같이 입력하세요:

<Image img={explo_13} size="sm" alt="Explo 대시보드" border />

4. 이제 집계 방식을 **AVG**로 변경하세요.

<Image img={explo_14} size="sm" alt="Explo 대시보드" border />

5. 이제 우리는 가격에 따라 나누어진 평균 주택 가격을 얻었습니다!

<Image img={explo_15} size="md" alt="Explo 대시보드" />

## 더 알아보기 {#learn-more}

Explo 및 대시보드 작성 방법에 대한 자세한 정보를 보려면 <a href="https://docs.explo.co/" target="_blank">Explo 문서 방문하기</a>를 참조하세요.
