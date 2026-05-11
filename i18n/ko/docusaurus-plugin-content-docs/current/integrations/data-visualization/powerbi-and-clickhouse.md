---
sidebar_label: 'Power BI'
slug: /integrations/powerbi
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui']
description: 'Microsoft Power BI는 Microsoft에서 개발한 대화형 데이터 시각화 소프트웨어 제품으로, 주된 목적은 비즈니스 인텔리전스입니다.'
title: 'Power BI'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import powerbi_odbc_install from '@site/static/images/integrations/data-visualization/powerbi_odbc_install.png';
import powerbi_odbc_search from '@site/static/images/integrations/data-visualization/powerbi_odbc_search.png';
import powerbi_odbc_verify from '@site/static/images/integrations/data-visualization/powerbi_odbc_verify.png';
import powerbi_get_data from '@site/static/images/integrations/data-visualization/powerbi_get_data.png';
import powerbi_search_clickhouse from '@site/static/images/integrations/data-visualization/powerbi_search_clickhouse.png';
import powerbi_connect_db from '@site/static/images/integrations/data-visualization/powerbi_connect_db.png';
import powerbi_connect_user from '@site/static/images/integrations/data-visualization/powerbi_connect_user.png';
import powerbi_table_navigation from '@site/static/images/integrations/data-visualization/powerbi_table_navigation.png';
import powerbi_add_dsn from '@site/static/images/integrations/data-visualization/powerbi_add_dsn.png';
import powerbi_select_unicode from '@site/static/images/integrations/data-visualization/powerbi_select_unicode.png';
import powerbi_connection_details from '@site/static/images/integrations/data-visualization/powerbi_connection_details.png';
import powerbi_select_odbc from '@site/static/images/integrations/data-visualization/powerbi_select_odbc.png';
import powerbi_select_dsn from '@site/static/images/integrations/data-visualization/powerbi_select_dsn.png';
import powerbi_dsn_credentials from '@site/static/images/integrations/data-visualization/powerbi_dsn_credentials.png';
import powerbi_16 from '@site/static/images/integrations/data-visualization/powerbi_16.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Power BI \{#power-bi\}

<ClickHouseSupportedBadge/>

Microsoft Power BI는 [ClickHouse Cloud](https://clickhouse.com/cloud) 또는 자가 관리형 배포의 데이터에 대해 쿼리를 실행하거나 메모리에 로드할 수 있습니다.

데이터를 시각화하는 데 사용할 수 있는 Power BI의 유형은 다음과 같습니다.

* Power BI Desktop: 대시보드와 시각화를 생성하기 위한 Windows 데스크톱 애플리케이션
* Power BI Service: Power BI Desktop에서 생성한 대시보드를 호스팅하기 위한 Azure 내 SaaS

Power BI에서는 Desktop 버전에서 대시보드를 생성한 후 Power BI Service에 게시해야 합니다.

이 튜토리얼에서는 다음 과정을 안내합니다.

* [ClickHouse ODBC 드라이버 설치](#install-the-odbc-driver)
* [Power BI Desktop에 ClickHouse Power BI Connector 설치](#power-bi-installation)
* [Power BI Desktop에서 시각화를 위해 ClickHouse에서 데이터 쿼리](#query-and-visualise-data)
* [Power BI Service용 온프레미스 데이터 게이트웨이 설정](#power-bi-service)

## 사전 준비 사항 \{#prerequisites\}

### Power BI 설치 \{#power-bi-installation\}

이 튜토리얼은 Windows 컴퓨터에 Microsoft Power BI Desktop이 설치되어 있다고 가정합니다. Power BI Desktop은 [여기](https://www.microsoft.com/en-us/download/details.aspx?id=58494)에서 다운로드하여 설치할 수 있습니다.

Power BI를 최신 버전으로 업데이트할 것을 권장합니다. ClickHouse Connector는 `2.137.751.0` 버전부터 기본으로 제공됩니다.

### ClickHouse 연결 정보 수집 \{#gather-your-clickhouse-connection-details\}

ClickHouse 인스턴스에 연결하려면 다음 정보가 필요합니다:

* Hostname - ClickHouse 호스트 이름
* Username - 사용자 이름
* Password - 사용자 비밀번호
* Database - 연결하려는 인스턴스의 데이터베이스 이름

## Power BI desktop \{#power-bi-desktop\}

Power BI Desktop에서 데이터를 쿼리하려면 다음 단계를 완료해야 합니다:

1. ClickHouse ODBC Driver 설치
2. ClickHouse Connector 찾기
3. ClickHouse에 연결
4. 데이터를 쿼리하고 시각화

### ODBC 드라이버 설치 \{#install-the-odbc-driver\}

최신 [ClickHouse ODBC 릴리스](https://github.com/ClickHouse/clickhouse-odbc/releases)를 다운로드합니다.

제공된 `.msi` 설치 프로그램을 실행하고 마법사의 안내를 따릅니다.

<Image size="md" img={powerbi_odbc_install} alt="설치 옵션을 표시하는 ClickHouse ODBC 드라이버 설치 마법사" border />

<br/>

:::note
`Debug symbols`는 선택 사항이며 필수는 아닙니다.
:::

#### ODBC 드라이버 확인 \{#verify-odbc-driver\}

드라이버 설치가 완료되면 다음과 같이 설치가 성공적으로 완료되었는지 확인할 수 있습니다:

시작 메뉴에서 ODBC를 검색하고 "ODBC Data Sources **(64-bit)**"를 선택합니다.

<Image size="md" img={powerbi_odbc_search} alt="ODBC Data Sources (64-bit) 옵션이 표시된 Windows 검색 화면" border />

<br/>

ClickHouse 드라이버가 목록에 있는지 확인합니다.

<Image size="md" img={powerbi_odbc_verify} alt="Drivers 탭에서 ClickHouse 드라이버가 표시된 ODBC Data Source Administrator 화면" border />

<br/>

### ClickHouse 커넥터 찾기 \{#find-the-clickhouse-connector\}

:::note
Power BI Desktop 버전 `2.137.751.0`에서 사용할 수 있습니다.
:::
Power BI Desktop 시작 화면에서 "Get Data"를 클릭하십시오.

<Image size="md" img={powerbi_get_data} alt="Get Data 버튼이 표시된 Power BI Desktop 홈 화면" border />

<br/>

"ClickHouse"를 검색하십시오.

<Image size="md" img={powerbi_search_clickhouse} alt="검색창에서 ClickHouse를 검색한 Power BI Get Data 대화 상자" border />

<br/>

### ClickHouse에 연결하기 \{#connect-to-clickhouse\}

커넥터를 선택한 후 ClickHouse 인스턴스 자격 증명을 입력합니다:

* Host (필수) - 인스턴스의 도메인/주소입니다. 앞뒤에 별도의 접두사나 접미사를 추가하지 마십시오.
* Port (필수) - 인스턴스 포트입니다.
* Database - 데이터베이스 이름입니다.
* Options - [ClickHouse ODBC GitHub 페이지](https://github.com/ClickHouse/clickhouse-odbc#configuration)에 나열된 ODBC 옵션을 지정합니다.
* Data Connectivity mode - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="호스트, 포트, 데이터베이스 및 연결 모드 필드가 표시된 ClickHouse 연결 대화 상자" border />

<br/>

:::note
ClickHouse에 직접 쿼리할 때는 DirectQuery를 선택할 것을 권장합니다.

데이터 양이 적은 사용 사례라면 import 모드를 선택할 수 있으며, 전체 데이터가 Power BI로 로드됩니다.
:::

* 사용자 이름과 비밀번호를 지정합니다.

<Image size="md" img={powerbi_connect_user} alt="사용자 이름과 비밀번호를 입력하는 ClickHouse 연결 자격 증명 대화 상자" border />

<br/>

### 데이터 쿼리 및 시각화 \{#query-and-visualise-data\}

마지막으로 Navigator 뷰에 데이터베이스와 테이블이 표시되어야 합니다. 원하는 테이블을 선택한 다음 "Load"를 클릭하여
ClickHouse에서 데이터를 가져옵니다.

<Image size="md" img={powerbi_table_navigation} alt="Power BI Navigator 뷰에 표시된 ClickHouse 데이터베이스 테이블과 샘플 데이터" border />

<br/>

가져오기가 완료되면 Power BI에서 ClickHouse 데이터에 기존과 동일한 방식으로 접근할 수 있습니다.

<br/>

## Power BI service \{#power-bi-service\}

Microsoft Power BI Service를 사용하려면 [온-프레미스 데이터 게이트웨이](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)를 만들어야 합니다.

커스텀 커넥터 구성 방법에 대한 자세한 내용은 Microsoft 문서인 [온-프레미스 데이터 게이트웨이에서 커스텀 데이터 커넥터 사용](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)을 참고하십시오.

## ODBC 드라이버(가져오기 전용) \{#odbc-driver-import-only\}

DirectQuery를 사용하는 ClickHouse Connector의 사용을 권장합니다.

온프레미스 데이터 게이트웨이 인스턴스에 [ODBC Driver](#install-the-odbc-driver)를 설치하고, 위에서 설명한 대로 [검증](#verify-odbc-driver)합니다.

### 새 User DSN 만들기 \{#create-a-new-user-dsn\}

드라이버 설치가 완료되면 ODBC 데이터 원본을 생성할 수 있습니다. 시작 메뉴에서 ODBC를 검색한 후 「ODBC Data Sources (64-bit)」를 선택합니다.

<Image size="md" img={powerbi_odbc_search} alt="ODBC Data Sources (64-bit) 옵션이 표시된 Windows 검색" border />

<br/>

여기에서 새 User DSN을 추가합니다. 왼쪽에 있는 「Add」 버튼을 클릭합니다.

<Image size="md" img={powerbi_add_dsn} alt="새 DSN 생성을 위해 Add 버튼이 강조된 ODBC Data Source Administrator" border />

<br/>

ODBC 드라이버의 Unicode 버전을 선택합니다.

<Image size="md" img={powerbi_select_unicode} alt="ClickHouse Unicode Driver 선택이 표시된 Create New Data Source 대화 상자" border />

<br/>

연결 정보를 입력합니다.

<Image size="sm" img={powerbi_connection_details} alt="연결 파라미터가 포함된 ClickHouse ODBC Driver 구성 대화 상자" border />

<br/>

:::note
SSL이 활성화된 배포 환경(예: ClickHouse Cloud 또는 자가 관리형 인스턴스)을 사용하는 경우 `SSLMode` 필드에 `require`를 지정해야 합니다.

- `Host`에는 항상 프로토콜(즉, `http://` 또는 `https://`)을 포함하지 않습니다.
- `Timeout`은 초를 나타내는 정수입니다. 기본값은 30초입니다.
:::

### Power BI로 데이터 가져오기 \{#get-data-into-power-bi\}

아직 Power BI를 설치하지 않았다면 [Power BI Desktop을 다운로드하여 설치](https://www.microsoft.com/en-us/download/details.aspx?id=58494)합니다.

Power BI Desktop 시작 화면에서 "Get Data"를 클릭합니다.

<Image size="md" img={powerbi_get_data} alt="Get Data 버튼을 보여주는 Power BI Desktop 홈 화면" border />

<br/>

"Other" -> "ODBC"를 선택합니다.

<Image size="md" img={powerbi_select_odbc} alt="Other 범주 아래에서 ODBC 옵션이 선택된 Power BI Get Data 대화 상자" border />

<br/>

목록에서 이전에 생성한 데이터 소스를 선택합니다.

<Image size="md" img={powerbi_select_dsn} alt="구성된 ClickHouse DSN이 표시된 ODBC 드라이버 선택 대화 상자" border />

<br/>

:::note
데이터 소스를 생성할 때 자격 증명을 지정하지 않았다면, 사용자 이름과 비밀번호를 입력하라는 메시지가 표시됩니다.
:::

<Image size="md" img={powerbi_dsn_credentials} alt="ODBC DSN 연결용 자격 증명 대화 상자" border />

<br/>

마지막으로 Navigator 보기에서 데이터베이스와 테이블이 표시됩니다. 원하는 테이블을 선택하고 "Load"를 클릭하여 ClickHouse에서 데이터를 가져옵니다.

<Image size="md" img={powerbi_table_navigation} alt="ClickHouse 데이터베이스 테이블과 샘플 데이터를 보여주는 Power BI Navigator 보기" border />

<br/>

가져오기가 완료되면 Power BI에서 ClickHouse 데이터를 다른 데이터와 마찬가지로 사용할 수 있습니다.

## 대용량 데이터셋 작업 최적화 \{#optimizing-work-with-large-datasets\}

PowerBI는 중간 규모의 데이터량을 가진 전통적인 행 기반(row-based) 데이터베이스를 위해 설계되었습니다. ClickHouse에서 수십억 행 규모로 작업할 때는 최적의 성능을 위해 특정 아키텍처 패턴이 필요합니다.

PowerBI는 중첩 서브쿼리, 복잡한 조인, 실시간 변환이 포함된 SQL 쿼리를 자동으로 생성합니다. 이러한 패턴은 전통적인 SQL 데이터베이스에서는 잘 동작하지만, ClickHouse와 같은 대규모 컬럼형 데이터베이스에 대해 쿼리할 때는 비효율적일 수 있습니다.

**대용량 데이터셋에 대한 권장 접근 방식:** 원본 테이블을 직접 쿼리하는 대신, 각 대시보드 시각화마다 ClickHouse에 전용 `materialized views`를 생성하십시오. 이를 통해 다음과 같은 이점을 얻을 수 있습니다.

- 데이터량과 상관없이 일관되고 빠른 성능
- ClickHouse 클러스터에 가해지는 부하 감소
- 보다 예측 가능한 비용

:::warning
대시보드 응답 속도가 느리다면, ClickHouse의 [`query_log`](/operations/system-tables/query_log)를 확인하여 Power BI가 실제로 어떤 SQL 쿼리를 실행하는지 살펴보십시오. 일반적인 문제로는 중첩 서브쿼리, 전체 테이블 스캔, 비효율적인 조인 등이 있습니다. 문제를 파악한 후, 해당 문제를 해결하는 [materialized views](/materialized-views)를 생성하십시오.
:::

### 구현 모범 사례 \{#implementation-best-practices\}

####  사전 집계 전략 \{#pre-aggregation-strategy\}

여러 집계 수준에서 materialized view를 생성합니다:

- 최근의 상세 대시보드를 위한 시간별 집계
- 과거 추세 분석을 위한 일별 집계
- 장기 보고를 위한 월별 롤업 집계
- 애드혹 분석을 위해 적절한 TTL을 설정하여 원시 데이터를 보존

#### 데이터 모델링 최적화 \{#data-modelling-optimization\}

- 쿼리 패턴에 맞는 `ORDER BY` 키를 정의합니다
- 시계열 데이터에는 파티션을 사용합니다
- 효율적인 조회를 위해 작은 차원 테이블을 딕셔너리(Dictionary)로 변환합니다
- 추가적인 쿼리 최적화를 위해 프로젝션을 활용합니다

## 알려진 제한 사항 \{#known-limitations\}

### UInt64 \{#uint64\}

UInt64 또는 그보다 큰 부호 없는 정수 타입은 Power BI에서 지원하는 최대 정수 타입이 Int64이므로 데이터 세트로 자동 로드되지 않습니다.

:::note
데이터를 올바르게 가져오려면 Navigator에서 "Load" 버튼을 누르기 전에 먼저 "Transform Data"를 클릭합니다.
:::

이 예제에서 `pageviews` 테이블에는 UInt64 컬럼이 있으며, 기본적으로 "Binary"로 인식됩니다.
"Transform Data"를 클릭하면 Power Query Editor가 열리며, 여기에서 컬럼의 타입을 예를 들어
Text로 다시 지정할 수 있습니다.

<Image size="md" img={powerbi_16} alt="Power Query Editor에서 UInt64 컬럼의 데이터 타입 변환을 보여주는 화면" border />

<br/>

모든 작업을 마치면 왼쪽 상단의 "Close & Apply"를 클릭한 후 데이터 로드를 진행합니다.