---
sidebar_label: 'Tableau Desktop'
sidebar_position: 1
slug: /integrations/tableau
keywords: ['clickhouse', 'tableau', 'connect', 'integrate', 'ui']
description: 'Tableau는 ClickHouse 데이터베이스와 테이블을 데이터 소스로 사용할 수 있습니다.'
title: 'Tableau를 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/analytikaplus/clickhouse-tableau-connector-jdbc'
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


# Tableau를 ClickHouse에 연결하기 \{#connecting-tableau-to-clickhouse\}

<ClickHouseSupportedBadge/>

ClickHouse는 [Tableau Exchange](https://exchange.tableau.com/products/1064)에 등록된 공식 Tableau 커넥터를 제공합니다.
이 커넥터는 ClickHouse의 고급 [JDBC driver](/integrations/language-clients/java/jdbc)를 기반으로 동작합니다.

이 커넥터를 사용하면 Tableau에서 ClickHouse 데이터베이스와 테이블을 데이터 원본으로 사용할 수 있습니다. 이 기능을 사용하려면
아래 설정 가이드를 따르십시오.

<TOCInline toc={toc}/>

## 사용 전 필수 설정 \{#setup-required-prior-usage\}

1. 연결에 필요한 세부 정보를 확인합니다.
   <ConnectionDetails />

2. <a href="https://www.tableau.com/products/desktop/download" target="_blank">Tableau
   Desktop</a>를 다운로드하여 설치합니다.
3. `clickhouse-tableau-connector-jdbc` 지침에 따라 호환되는 버전의
   <a href="https://github.com/ClickHouse/clickhouse-java/releases/" target="_blank">ClickHouse JDBC driver</a>를 다운로드합니다.

:::note
[clickhouse-jdbc-X.X.X-all-dependencies.jar](https://github.com/ClickHouse/clickhouse-java/releases) JAR 파일을 반드시 다운로드해야 합니다. 이 아티팩트는 버전 `0.9.2`부터 제공됩니다.
:::

4. JDBC driver를 다음 폴더에 저장합니다(사용 중인 OS에 따라, 폴더가 없으면 생성합니다).
    - macOS: `~/Library/Tableau/Drivers`
    - Windows: `C:\Program Files\Tableau\Drivers`
5. Tableau에서 ClickHouse 데이터 소스를 구성한 후 데이터 시각화 작성을 시작합니다.

## Tableau에서 ClickHouse 데이터 소스 구성 \{#configure-a-clickhouse-data-source-in-tableau\}

`clickhouse-jdbc` 드라이버를 설치하고 설정했으므로, 이제 ClickHouse의 **TPCD** 데이터베이스에 연결하는
Tableau 데이터 소스를 정의하는 방법을 살펴보겠습니다.

1. Tableau를 시작합니다. (이미 실행 중이었다면 다시 시작하십시오.)

2. 왼쪽 메뉴에서 **To a Server** 섹션 아래의 **More**를 클릭합니다. 사용 가능한 커넥터 목록에서 **ClickHouse by ClickHouse**를 검색합니다:

<Image size="md" img={tableau_connecttoserver} alt="ClickHouse by ClickHouse 옵션이 강조된 커넥터 선택 메뉴가 표시된 Tableau 연결 화면" border />

<br/>

:::note
연결 가능한 커넥터 목록에서 **ClickHouse by ClickHouse** 커넥터가 보이지 않습니까? 오래된 Tableau Desktop 버전 때문일 수 있습니다.
이 문제를 해결하려면 Tableau Desktop 애플리케이션을 업그레이드하거나, [커넥터를 수동으로 설치](#install-the-connector-manually)하는 방법을 고려하십시오.
:::

3. **ClickHouse by ClickHouse**를 클릭하면 다음과 같은 대화 상자가 나타납니다:

<Image size="md" img={tableau_connector_details} alt="ClickHouse JDBC 커넥터 세부 정보와 설치 버튼이 표시된 Tableau 커넥터 설치 대화 상자" border />

<br/>

4. **Install and Restart Tableau**를 클릭합니다. 그런 다음 애플리케이션을 다시 시작합니다.
5. 다시 시작한 후 커넥터의 전체 이름은 `ClickHouse JDBC by ClickHouse, Inc.`가 됩니다. 이 커넥터를 클릭하면 다음과 같은 대화 상자가 나타납니다:

<Image size="md" img={tableau_connector_dialog} alt="server, port, database, username, password 입력 필드가 있는 Tableau의 ClickHouse 연결 대화 상자" border />

<br/>

6. 연결 정보를 입력합니다:

    | Setting  | Value                                                  |
    | ----------- |--------------------------------------------------------|
    | Server      | **접두사나 접미사가 없는 ClickHouse 호스트** |
    | Port   | **8443**                                               |
    | Database | **default**                                            |
    | Username | **default**                                            |
    | Password | *\*****                                                |

:::note
ClickHouse Cloud를 사용할 때는 보안 연결을 위해 SSL 체크박스를 활성화해야 합니다.
:::

<br/>

:::note
ClickHouse 데이터베이스 이름은 **TPCD**이지만, 위 대화 상자에서는 **Database**를 **default**로 설정한 다음,
다음 단계에서 **Schema**로 **TPCD**를 선택해야 합니다. (이는 커넥터의 버그로 인한 동작일 가능성이 있어 추후 변경될 수 있지만,
현재 버전에서는 데이터베이스로 **default**를 사용해야 합니다.)
:::

7. **Sign In** 버튼을 클릭하면 새 Tableau 통합 문서가 표시됩니다:

<Image size="md" img={tableau_newworkbook} alt="데이터베이스 선택 옵션이 있는 초기 연결 화면을 보여 주는 새 Tableau 통합 문서" border />

<br/>

8. **Schema** 드롭다운에서 **TPCD**를 선택하면 **TPCD**에 있는 테이블 목록이 표시됩니다:

<Image size="md" img={tableau_tpcdschema} alt="CUSTOMER, LINEITEM, NATION, ORDERS 등 TPCD 데이터베이스 테이블이 표시된 Tableau 스키마 선택 화면" border />

<br/>

이제 Tableau에서 시각화를 생성할 준비가 되었습니다!

## Tableau에서 시각화 만들기 \{#building-visualizations-in-tableau\}

이제 Tableau에서 ClickHouse 데이터 소스를 구성했으므로, 데이터를 시각화해 보겠습니다...

1. **CUSTOMER** 테이블을 워크북으로 끌어옵니다. 컬럼은 보이지만, 데이터 테이블은 비어 있는 상태임을 확인할 수 있습니다:

<Image size="md" img={tableau_workbook1} alt="CUSTOMER 테이블을 캔버스로 끌어와 컬럼 헤더는 보이지만 데이터는 없는 Tableau 워크북" border />

<br/>

2. **Update Now** 버튼을 클릭하면 **CUSTOMER**에서 100개의 행이 테이블에 채워집니다.

3. **ORDERS** 테이블을 워크북으로 끌어온 다음, 두 테이블 간의 관계 필드로 **Custkey** 를 설정합니다:

<Image size="md" img={tableau_workbook2} alt="Custkey 필드를 사용해 CUSTOMER와 ORDERS 테이블 간 연결을 보여주는 Tableau 관계 편집기" border />

<br/>

4. 이제 **ORDERS** 와 **LINEITEM** 테이블이 서로 연관된 데이터 소스로 구성되었으므로, 이 관계를 사용해 데이터에 대한 다양한 질문에 답할 수 있습니다. 워크북 하단의 **Sheet 1** 탭을 선택합니다.

<Image size="md" img={tableau_workbook3} alt="분석에 사용할 수 있는 ClickHouse 테이블의 차원과 측정값을 보여주는 Tableau 워크시트" border />

<br/>

5. 매년 특정 항목이 얼마나 주문되었는지 알고 싶다고 가정해 보겠습니다. **ORDERS** 에서 **OrderDate** 를 끌어 **Columns** 섹션(가로 필드)에 놓고, **LINEITEM** 에서 **Quantity** 를 끌어 **Rows** 에 놓습니다. 그러면 Tableau가 다음과 같은 꺾은선형 차트를 생성합니다:

<Image size="sm" img={tableau_workbook4} alt="ClickHouse 데이터에서 연도별 주문 수량을 보여주는 Tableau 꺾은선형 차트" border />

<br/>

아주 흥미로운 꺾은선형 차트는 아니지만, 이 데이터셋은 스크립트로 생성되었고 쿼리 성능 테스트용으로 만들어졌기 때문에 TCPD 데이터의 시뮬레이션된 주문에서 큰 변동이 없다는 점을 알 수 있습니다.

6. 분기별로, 그리고 배송 방식(항공, 우편, 선박, 트럭 등)별로 평균 주문 금액(달러 기준)을 알고 싶다고 가정해 보겠습니다:

    - **New Worksheet** 탭을 클릭해 새 시트를 생성합니다
    - **ORDERS** 에서 **OrderDate** 를 **Columns** 에 끌어 놓고, **Year** 에서 **Quarter** 로 변경합니다
    - **LINEITEM** 에서 **Shipmode** 를 **Rows** 로 끌어 놓습니다

다음과 같은 화면이 보입니다:

<Image size="sm" img={tableau_workbook5} alt="컬럼에는 분기, 행에는 배송 방식이 배치된 Tableau 크로스탭 뷰" border />

<br/>

7. **Abc** 값은 메트릭을 테이블에 끌어 놓기 전까지 공간을 채우기 위한 자리 표시자일 뿐입니다. **ORDERS** 에서 **Totalprice** 를 테이블 위로 끌어 놓습니다. 기본 계산 방식이 **Totalprices** 의 **SUM** 인 것을 확인할 수 있습니다:

<Image size="md" img={tableau_workbook6} alt="분기 및 배송 방식별 총 금액 합계를 보여주는 Tableau 크로스탭" border />

<br/>

8. **SUM** 을 클릭하고 **Measure** 를 **Average** 로 변경합니다. 같은 드롭다운 메뉴에서 **Format** 을 선택하고 **Numbers** 를 **Currency (Standard)** 로 변경합니다:

<Image size="md" img={tableau_workbook7} alt="통화 형식으로 분기 및 배송 방식별 평균 주문 금액을 보여주는 Tableau 크로스탭" border />

<br/>

잘하셨습니다! Tableau를 ClickHouse에 성공적으로 연결했으며, 이제 ClickHouse 데이터를 분석하고 시각화할 수 있는 폭넓은 가능성이 열렸습니다.

## 커넥터 수동 설치 \{#install-the-connector-manually\}

기본적으로 커넥터가 포함되지 않은 구버전 Tableau Desktop을 사용하는 경우, 다음 단계를 따라 수동으로 설치할 수 있습니다.

1. [Tableau Exchange](https://exchange.tableau.com/products/1064)에서 최신 taco 파일을 다운로드하십시오.
2. taco 파일을 다음 위치에 두십시오.
   * macOS: `~/Documents/My Tableau Repository/Connectors`
   * Windows: `C:\Users\[Windows User]\Documents\My Tableau Repository\Connectors`
3. Tableau Desktop을 다시 시작하십시오. 설정이 정상적으로 완료되었으면 `New Data Source` 섹션에서 커넥터를 확인할 수 있습니다.

## 연결 및 분석 팁 \{#connection-and-analysis-tips\}

Tableau-ClickHouse 통합을 최적화하는 방법에 대해 더 자세한 안내가 필요하면 
[연결 팁](/integrations/tableau/connection-tips)과 [분석 팁](/integrations/tableau/analysis-tips) 페이지를 참조하십시오.

## 테스트 \{#tests\}

커넥터는 [TDVT 프레임워크](https://tableau.github.io/connector-plugin-sdk/docs/tdvt)를 사용해 테스트되고 있으며, 현재 97% 수준의 테스트 커버리지를 유지하고 있습니다.

## 요약 \{#summary\}

범용 ODBC/JDBC ClickHouse 드라이버를 사용하여 Tableau를 ClickHouse에 연결할 수 있습니다. 그러나 이 커넥터를 사용하면 연결 설정 절차를 보다 간편하게 진행할 수 있습니다. 커넥터 사용 중 문제가 발생하면 언제든지 <a href="https://github.com/ClickHouse/clickhouse-tableau-connector-jdbc/issues" target="_blank"  >GitHub</a>에서 문의하십시오.