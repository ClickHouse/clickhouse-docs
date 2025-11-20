---
'sidebar_label': 'Metabase'
'sidebar_position': 131
'slug': '/integrations/metabase'
'keywords':
- 'Metabase'
'description': 'Metabase는 데이터에 대한 질문을 하는 데 사용하기 쉬운 오픈 소스 UI 도구입니다.'
'title': 'Metabase를 ClickHouse에 연결하기'
'show_related_blogs': true
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_visualization'
- 'website': 'https://github.com/clickhouse/metabase-clickhouse-driver'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# ClickHouse에 Metabase 연결하기

<PartnerBadge/>

Metabase는 데이터에 대한 질문을 쉽게 할 수 있는 오픈 소스 UI 도구입니다. Metabase는 JAR 파일을 <a href="https://www.metabase.com/start/oss/jar" target="_blank">다운로드하여</a> `java -jar metabase.jar` 명령어로 실행할 수 있는 Java 애플리케이션입니다. Metabase는 JDBC 드라이버를 사용하여 ClickHouse에 연결하며, 이 드라이버를 다운로드하여 `plugins` 폴더에 넣습니다:

## 목표 {#goal}

이 가이드에서는 Metabase를 사용하여 ClickHouse 데이터에 대한 질문을 하고 그 답변을 시각화합니다. 답변 중 하나는 다음과 같을 것입니다:

  <Image size="md" img={metabase_08} alt="Metabase 파이 차트 시각화에 ClickHouse의 데이터가 표시됨" border />
<p/>

:::tip 데이터 추가하기
작업할 데이터셋이 없는 경우 예제 중 하나를 추가할 수 있습니다. 이 가이드에서는 [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) 데이터셋을 사용하므로, 해당 데이터셋을 선택할 수 있습니다. 같은 문서 카테고리에는 다른 여러 데이터셋도 있습니다.
:::

## 1. 연결 세부정보 수집하기 {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Metabase용 ClickHouse 플러그인 다운로드하기 {#2--download-the-clickhouse-plugin-for-metabase}

1. `plugins` 폴더가 없는 경우, `metabase.jar` 파일을 저장한 곳의 하위 폴더로 생성합니다.

2. 플러그인은 `clickhouse.metabase-driver.jar`라는 이름의 JAR 파일입니다. <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>에서 JAR 파일의 최신 버전을 다운로드합니다.

3. `clickhouse.metabase-driver.jar` 파일을 `plugins` 폴더에 저장합니다.

4. 드라이버가 제대로 로드되도록 Metabase를 시작(또는 재시작)합니다.

5. <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>에서 Metabase를 엽니다. 초기 시작 시 환영 화면이 표시되며, 질문 목록을 통해 진행해야 합니다. 데이터베이스를 선택하라는 메시지가 표시되면, "**내 데이터를 나중에 추가하겠습니다**"를 선택합니다.

## 3. Metabase를 ClickHouse에 연결하기 {#3--connect-metabase-to-clickhouse}

1. 오른쪽 상단 모서리에 있는 기어 아이콘을 클릭하고 **관리자 설정**을 선택하여 <a href="http://localhost:3000/admin/settings/setup" target="_blank">Metabase 관리자 페이지</a>로 이동합니다.

2. **데이터베이스 추가**를 클릭합니다. 또는 **데이터베이스** 탭을 클릭하고 **데이터베이스 추가** 버튼을 선택할 수 있습니다.

3. 드라이버 설치가 제대로 되었다면, **데이터베이스 유형** 드롭다운 메뉴에서 **ClickHouse**를 볼 수 있습니다:

    <Image size="md" img={metabase_01} alt="Metabase 데이터베이스 선택 화면에 ClickHouse 옵션이 표시됨" border />

4. 데이터베이스의 **표시 이름**을 지정합니다. 이는 Metabase 설정이므로, 원하는 이름을 사용할 수 있습니다.

5. ClickHouse 데이터베이스의 연결 세부정보를 입력합니다. ClickHouse 서버가 SSL을 사용하도록 구성된 경우 보안 연결을 활성화합니다. 예를 들어:

    <Image size="md" img={metabase_02} alt="ClickHouse 데이터베이스용 Metabase 연결 세부정보 양식" border />

6. **저장** 버튼을 클릭하면 Metabase가 데이터베이스에서 테이블을 검색합니다.

## 4. SQL 쿼리 실행하기 {#4-run-a-sql-query}

1. 오른쪽 상단 모서리의 **관리자 설정 종료** 버튼을 클릭하여 **관리자 설정**에서 나옵니다.

2. 오른쪽 상단 모서리에서 **+ 새로 만들기** 메뉴를 클릭하고 질문을 하고 SQL 쿼리를 실행하며 대시보드를 만들 수 있는 것을 확인합니다:

    <Image size="sm" img={metabase_03} alt="Metabase 새로 만들기 메뉴에 질문, SQL 쿼리 및 대시보드를 생성하는 옵션이 표시됨" border />

3. 예를 들어, 1995년부터 2022년까지의 연도별 평균 가격을 반환하는 `uk_price_paid`라는 테이블에서 실행된 SQL 쿼리는 다음과 같습니다:

    <Image size="md" img={metabase_04} alt="Metabase SQL 편집기에서 UK 가격 데이터에 대한 쿼리를 표시" border />

## 5. 질문하기 {#5-ask-a-question}

1. **+ 새로 만들기**를 클릭하고 **질문**을 선택합니다. 데이터베이스와 테이블에서 시작하여 질문을 구성할 수 있는 것을 확인합니다. 예를 들어, 다음 질문은 `default` 데이터베이스의 `uk_price_paid`라는 테이블에서 평균 가격을 그레이터 맨체스터의 각 마을별로 계산합니다:

    <Image size="md" img={metabase_06} alt="UK 가격 데이터와 함께하는 Metabase 질문 빌더 인터페이스" border />

2. **시각화** 버튼을 클릭하여 결과를 표 형식으로 확인합니다.

    <Image size="md" img={metabase_07} alt="그레이터 맨체스터의 각 마을별 평균 가격에 대한 Metabase 시각화" border />

3. 결과 아래에서 **시각화** 버튼을 클릭하여 시각화를 막대 차트(또는 다른 모든 옵션)로 변경합니다:

    <Image size="md" img={metabase_08} alt="그레이터 맨체스터의 각 마을별 평균 가격을 보여주는 Metabase 파이 차트 시각화" border />

## 더 알아보기 {#learn-more}

<a href="https://www.metabase.com/docs/latest/" target="_blank">Metabase 문서</a>를 <a href="https://www.metabase.com/docs/latest/" target="_blank">방문하여 대시보드 정의</a> 방법에 대한 자세한 정보를 찾아보세요.
