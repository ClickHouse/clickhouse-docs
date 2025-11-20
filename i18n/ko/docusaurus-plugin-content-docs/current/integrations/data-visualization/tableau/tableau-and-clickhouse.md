---
'sidebar_label': 'Tableau Desktop'
'sidebar_position': 1
'slug': '/integrations/tableau'
'keywords':
- 'clickhouse'
- 'tableau'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableau는 ClickHouse DATABASE 및 TABLE을 데이터 소스로 사용할 수 있습니다.'
'title': 'Tableau를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_visualization'
- 'website': 'https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc'
---

import TOCInline from '@theme/TOCInline';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import tableau_connecttoserver from '@site/static/images/integrations/data-visualization/tableau_connecttoserver.png';
import tableau_connector_details from '@site/static/images/integrations/data-visualization/tableau_connector_details.png';
import tableau_connector_dialog from '@site/static/images/integrations/data-visualization/tableau_connector_dialog.png';
import tableau_newworkbook from '@site/static/images/integrations/data-visualization/tableau_newworkbook.png';
import tableau_tpcdschema from '@site/static/images/integrations/data-visualization/tableau_tpcdschema.png';
import tableau_workbook1 from '@site/static/images/integrations/data-visualization/tableau_workbook1.png';
import tableau_workbook2 from '@site/static/images/integrations/data-visualization/tableau_workbook2.png';
import tableau_workbook3 from '@site/static/images/integrations/data-visualization/tableau_workbook3.png';
import tableau_workbook4 from '@site/static/images/integrations/data-visualization/tableau_workbook4.png';
import tableau_workbook5 from '@site/static/images/integrations/data-visualization/tableau_workbook5.png';
import tableau_workbook6 from '@site/static/images/integrations/data-visualization/tableau_workbook6.png';
import tableau_workbook7 from '@site/static/images/integrations/data-visualization/tableau_workbook7.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Tableau를 ClickHouse에 연결하기

<ClickHouseSupportedBadge/>

ClickHouse는 [Tableau Exchange](https://exchange.tableau.com/products/1064)에서 제공되는 공식 Tableau 커넥터를 제공합니다. 이 커넥터는 ClickHouse의 고급 [JDBC 드라이버](/integrations/language-clients/java/jdbc)를 기반으로 합니다.

이 커넥터를 사용하여 Tableau는 ClickHouse 데이터베이스 및 테이블을 데이터 소스로 통합합니다. 이 기능을 활성화하려면 아래의 설정 가이드를 따르세요.

<TOCInline toc={toc}/>

## 사용 전에 필요한 설정 {#setup-required-prior-usage}

1. 연결 세부정보 수집
   <ConnectionDetails />

2. <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau desktop</a>를 다운로드하고 설치합니다.
3. `clickhouse-tableau-connector-jdbc` 지침에 따라 <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC 드라이버</a>의 호환 버전을 다운로드합니다.

:::note
[clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JAR 파일을 다운로드해야 합니다. 이 아티팩트는 `0.9.2` 버전부터 사용 가능합니다.
:::

4. JDBC 드라이버를 다음 폴더에 저장합니다(운영 체제에 따라, 폴더가 없으면 만들 수 있습니다):
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Tableau에서 ClickHouse 데이터 소스를 구성하고 데이터 시각화를 시작하세요!

## Tableau에서 ClickHouse 데이터 소스 구성하기 {#configure-a-clickhouse-data-source-in-tableau}

이제 `clickhouse-jdbc` 드라이버가 설치 및 설정되었으므로, Tableau에서 ClickHouse의 **TPCD** 데이터베이스에 연결하는 데이터 소스를 정의하는 방법을 살펴보겠습니다.

1. Tableau를 시작합니다. (이미 실행 중이라면 재시작합니다.)

2. 왼쪽 메뉴에서 **To a Server** 섹션 아래의 **More**를 클릭합니다. 사용 가능한 커넥터 목록에서 **ClickHouse by ClickHouse**를 검색합니다:

<Image size="md" img={tableau_connecttoserver} alt="ClickHouse by ClickHouse 옵션이 강조 표시된 커넥터 선택 메뉴를 보여주는 Tableau 연결 화면" border />
<br/>

:::note
커넥터 목록에서 **ClickHouse by ClickHouse**가 보이지 않나요? 이는 오래된 Tableau Desktop 버전과 관련이 있을 수 있습니다. 이를 해결하려면 Tableau Desktop 응용 프로그램을 업그레이드하거나 [커넥터를 수동으로 설치](#install-the-connector-manually)하는 것을 고려하세요.
:::

3. **ClickHouse by ClickHouse**를 클릭하면 다음 대화 상자가 나타납니다:

<Image size="md" img={tableau_connector_details} alt="ClickHouse JDBC 커넥터 세부 정보 및 설치 버튼이 표시된 Tableau 커넥터 설치 대화 상자" border />
<br/>
 
4. **Install and Restart Tableau**를 클릭합니다. 응용 프로그램을 재시작합니다.
5. 재시작 후, 커넥터의 전체 이름은 `ClickHouse JDBC by ClickHouse, Inc.`가 됩니다. 클릭하면 다음 대화 상자가 나타납니다:

<Image size="md" img={tableau_connector_dialog} alt="서버, 포트, 데이터베이스, 사용자 이름 및 비밀번호 필드를 표시하는 Tableau의 ClickHouse 연결 대화 상자" border />
<br/>

6. 연결 세부정보를 입력합니다:

    | 설정    | 값                                                      |
    | ----------- |----------------------------------------------------------|
    | 서버       | **귀하의 ClickHouse 호스트(접두사나 접미사 없이)**      |
    | 포트       | **8443**                                               |
    | 데이터베이스 | **default**                                            |
    | 사용자 이름 | **default**                                            |
    | 비밀번호   | *\*****                                                |

:::note
ClickHouse 클라우드에서 작업할 때는 보안 연결을 위해 SSL 확인란을 활성화해야 합니다.
:::
<br/>

:::note
우리 ClickHouse 데이터베이스의 이름은 **TPCD**이지만, 위 대화 상자에서 **데이터베이스**를 **default**로 설정한 다음, 다음 단계에서 **Schema**에 **TPCD**를 선택해야 합니다. (이는 커넥터의 버그로 인한 것으로, 이 동작이 변경될 수 있지만, 현재로써는 데이터베이스로 **default**를 사용해야 합니다.)
:::

7. **Sign In** 버튼을 클릭하면 새로운 Tableau 작업 공간이 열립니다:

<Image size="md" img={tableau_newworkbook} alt="데이터베이스 선택 옵션이 있는 초기 연결 화면을 보여주는 새로운 Tableau 작업 공간" border />
<br/>

8. **Schema** 드롭다운에서 **TPCD**를 선택하면 **TPCD**의 테이블 목록이 나타납니다:

<Image size="md" img={tableau_tpcdschema} alt="CUSTOMER, LINEITEM, NATION, ORDERS 및 기타 테이블을 포함한 TPCD 데이터베이스 테이블을 보여주는 Tableau 스키마 선택" border />
<br/>

이제 Tableau에서 시각화를 만들 준비가 되었습니다!

## Tableau에서 시각화 구축하기 {#building-visualizations-in-tableau}

이제 Tableau에서 ClickHouse 데이터 소스가 구성되었으므로, 데이터를 시각화해 보겠습니다...

1. **CUSTOMER** 테이블을 작업 공간으로 드래그합니다. 열이 나타나지만 데이터 테이블은 비어 있습니다:

<Image size="md" img={tableau_workbook1} alt="데이터가 없는 열 제목만 표시되는 CUSTOMER 테이블이 캔버스로 드래그된 Tableau 작업 공간" border />
<br/>

2. **Update Now** 버튼을 클릭하면 **CUSTOMER**에서 100개의 행이 테이블에 채워집니다.

3. **ORDERS** 테이블을 작업 공간에 드래그한 후, 두 테이블 간의 관계 필드로 **Custkey**를 설정합니다:

<Image size="md" img={tableau_workbook2} alt="Custkey 필드를 사용하여 CUSTOMER와 ORDERS 테이블 간의 연결을 보여주는 Tableau 관계 편집기" border />
<br/>

4. 이제 **ORDERS**와 **LINEITEM** 테이블이 데이터 소스로 서로 연결되어 있으므로, 이 관계를 사용하여 데이터에 대한 질문을 할 수 있습니다. 작업 공간의 하단에서 **Sheet 1** 탭을 선택합니다.

<Image size="md" img={tableau_workbook3} alt="분석을 위해 사용 가능한 ClickHouse 테이블의 차원 및 측정을 보여주는 Tableau 워크시트" border />
<br/>

5. 매년 특정 품목이 얼마나 주문되었는지 알고 싶다고 가정해 보겠습니다. **ORDERS**에서 **OrderDate**를 **Columns** 섹션(수평 필드)으로 드래그한 후, **LINEITEM**에서 **Quantity**를 **Rows**로 드래그합니다. Tableau는 다음의 선 그래프를 생성할 것입니다:

<Image size="sm" img={tableau_workbook4} alt="ClickHouse 데이터에서 연도별로 주문된 수량을 보여주는 Tableau 선 그래프" border />
<br/>

그리 흥미로운 선 그래프는 아니지만, 데이터셋은 스크립트에 의해 생성되었고 쿼리 성능 테스트를 위해 구축되었으므로, TCPD 데이터의 시뮬레이션된 주문에서 많은 변화를 관찰할 수 없습니다.

6. 분기별 및 배송 모드(항공, 우편, 선박, 트럭 등)에 따른 평균 주문 금액(달러)을 알고 싶다고 가정해 보겠습니다:

    - **New Worksheet** 탭을 클릭하여 새 시트를 생성합니다.
    - **ORDERS**에서 **OrderDate**를 **Columns**로 드래그한 후, **Year**를 **Quarter**로 변경합니다.
    - **LINEITEM**에서 **Shipmode**를 **Rows**로 드래그합니다.

다음과 같은 결과를 볼 수 있습니다:

<Image size="sm" img={tableau_workbook5} alt="분기를 열로, 배송 모드를 행으로 표시하는 Tableau 교차표 보기" border />
<br/>

7. **Abc** 값은 테이블에 메트릭을 드래그할 때까지 공간을 채우는 것입니다. **ORDERS**에서 **Totalprice**를 테이블에 드래그합니다. 기본 계산이 **Totalprices**의 **SUM**인 것을 확인하세요:

<Image size="md" img={tableau_workbook6} alt="분기 및 배송 모드에 따른 총 가격 합계를 보여주는 Tableau 교차표" border />
<br/>

8. **SUM**을 클릭하고 **Measure**를 **Average**로 변경합니다. 같은 드롭다운 메뉴에서 **Format**을 선택하고 **Numbers**를 **Currency (Standard)**로 변경합니다:

<Image size="md" img={tableau_workbook7} alt="통화 서식이 적용된 분기 및 배송 모드별 평균 주문 가격을 보여주는 Tableau 교차표" border />
<br/>

잘 하셨습니다! Tableau를 ClickHouse에 성공적으로 연결했으며, ClickHouse 데이터를 분석하고 시각화할 수 있는 새로운 가능성이 열렸습니다.

## 커넥터를 수동으로 설치하기 {#install-the-connector-manually}

기본적으로 커넥터가 포함되지 않은 구식 Tableau Desktop 버전을 사용하는 경우, 다음 단계를 통해 수동으로 설치할 수 있습니다:

1. [Tableau Exchange](https://exchange.tableau.com/products/1064)에서 최신 taco 파일을 다운로드합니다.
2. taco 파일을 다음 경로에 넣습니다:
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktop을 재시작합니다. 설정이 성공적으로 진행되었다면, `New Data Source` 섹션에서 커넥터를 설정할 수 있습니다.

## 연결 및 분석 팁 {#connection-and-analysis-tips}

Tableau-ClickHouse 통합을 최적화하는 방법에 대한 추가 안내는 [Connection Tips](/integrations/tableau/connection-tips)와 [Analysis Tips](/integrations/tableau/analysis-tips)를 방문하세요.

## 테스트 {#tests}
커넥터는 [TDVT 프레임워크](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)로 테스트되고 있으며 현재 97%의 커버리지 비율을 유지하고 있습니다.

## 요약 {#summary}
일반 ODBC/JDBC ClickHouse 드라이버를 사용하여 Tableau를 ClickHouse에 연결할 수 있습니다. 그러나 이 커넥터는 연결 설정 과정을 간소화합니다. 커넥터에 문제가 있는 경우, 주저하지 말고 <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>에서 문의해 주십시오.
