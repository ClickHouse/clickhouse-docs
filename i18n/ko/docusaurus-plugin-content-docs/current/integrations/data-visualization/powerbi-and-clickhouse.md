---
'sidebar_label': 'Power BI'
'slug': '/integrations/powerbi'
'keywords':
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Microsoft Power BI는 비즈니스 인텔리전스에 주로 초점을 맞춘 Microsoft에서 개발한 대화형 데이터
  시각화 소프트웨어 제품입니다.'
'title': 'Power BI'
'doc_type': 'guide'
'integration':
- 'support_level': 'core'
- 'category': 'data_visualization'
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


# Power BI

<ClickHouseSupportedBadge/>

Microsoft Power BI는 [ClickHouse Cloud](https://clickhouse.com/cloud) 또는 자체 관리 배포에서 데이터를 쿼리하거나 메모리로 로드할 수 있습니다.

데이터 시각화를 위해 사용할 수 있는 여러 가지 Power BI 버전이 있습니다:

* Power BI Desktop: 대시보드 및 시각화를 만들기 위한 Windows 데스크톱 애플리케이션
* Power BI Service: Azure 내에서 SaaS 형태로 제공되어 Power BI Desktop에서 생성한 대시보드를 호스팅합니다

Power BI는 데스크톱 버전 내에서 대시보드를 생성하고 이를 Power BI Service에 게시해야 합니다.

이 튜토리얼은 다음과 같은 프로세스를 안내합니다:

* [ClickHouse ODBC 드라이버 설치하기](#install-the-odbc-driver)
* [Power BI Desktop에 ClickHouse Power BI 커넥터 설치하기](#power-bi-installation)
* [Power BI Desktop에서 ClickHouse의 데이터 쿼리 및 시각화하기](#query-and-visualise-data)
* [Power BI Service를 위한 온프레미스 데이터 게이트웨이 설정하기](#power-bi-service)

## 요구 사항 {#prerequisites}

### Power BI 설치 {#power-bi-installation}

이 튜토리얼은 당신이 Windows 기계에 Microsoft Power BI Desktop이 설치되어 있다고 가정합니다. Power BI Desktop을 [여기서](https://www.microsoft.com/en-us/download/details.aspx?id=58494) 다운로드하고 설치할 수 있습니다.

우리는 Power BI의 최신 버전으로 업데이트하는 것을 권장합니다. ClickHouse 커넥터는 버전 `2.137.751.0`부터 기본적으로 제공됩니다.

### ClickHouse 연결 세부정보 수집하기 {#gather-your-clickhouse-connection-details}

ClickHouse 인스턴스에 연결하기 위해 다음 정보를 필요로 합니다:

* Hostname - ClickHouse
* Username - 사용자 자격증명
* Password - 사용자 비밀번호
* Database - 연결하고자 하는 인스턴스의 데이터베이스 이름

## Power BI Desktop {#power-bi-desktop}

Power BI Desktop에서 데이터 쿼리를 시작하려면 다음 단계를 완료해야 합니다:

1. ClickHouse ODBC 드라이버 설치
2. ClickHouse 커넥터 찾기
3. ClickHouse에 연결
4. 데이터 쿼리 및 시각화

### ODBC 드라이버 설치 {#install-the-odbc-driver}

최신 [ClickHouse ODBC 릴리스](https://github.com/ClickHouse/clickhouse-odbc/releases)를 다운로드합니다.

제공된 `.msi` 설치 프로그램을 실행하고 마법사에 따라 진행합니다.

<Image size="md" img={powerbi_odbc_install} alt="ClickHouse ODBC 드라이버 설치 마법사가 설치 옵션을 보여주는 화면" border />
<br/>

:::note
`Debug symbols`는 선택 사항이며 필수 사항이 아닙니다.
:::

#### ODBC 드라이버 확인 {#verify-odbc-driver}

드라이버 설치가 완료되면 설치가 성공적으로 이루어졌는지 확인할 수 있습니다:

시작 메뉴에서 ODBC를 검색하고 "ODBC Data Sources **(64-bit)**"를 선택합니다.

<Image size="md" img={powerbi_odbc_search} alt="Windows 검색에서 ODBC Data Sources (64-bit) 옵션이 표시되는 화면" border />
<br/>

ClickHouse 드라이버가 나열되어 있는지 확인합니다.

<Image size="md" img={powerbi_odbc_verify} alt="ODBC 데이터 소스 관리자에서 드라이버 탭에 ClickHouse 드라이버가 표시되는 화면" border />
<br/>

### ClickHouse 커넥터 찾기 {#find-the-clickhouse-connector}

:::note
Power BI Desktop 버전 `2.137.751.0`에서 사용 가능
:::
Power BI Desktop 시작 화면에서 "Get Data"를 클릭합니다.

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop 홈 화면에 Get Data 버튼이 표시되는 화면" border />
<br/>

"ClickHouse"를 검색합니다.

<Image size="md" img={powerbi_search_clickhouse} alt="Power BI Get Data 대화상자에서 검색란에 ClickHouse 검색 결과가 표시되는 화면" border />
<br/>

### ClickHouse에 연결 {#connect-to-clickhouse}

커넥터를 선택하고 ClickHouse 인스턴스 자격증명을 입력합니다:

* Host (필수) - 인스턴스 도메인/주소. 접두사/접미사를 추가하지 말고 입력하세요.
* Port (필수) - 인스턴스 포트
* Database - 데이터베이스 이름
* Options - [ClickHouse ODBC GitHub 페이지](https://github.com/ClickHouse/clickhouse-odbc#configuration)에 나열된 모든 ODBC 옵션
* Data Connectivity mode - DirectQuery

<Image size="md" img={powerbi_connect_db} alt="ClickHouse 연결 대화상자에서 호스트, 포트, 데이터베이스 및 연결 모드 필드가 표시되는 화면" border />
<br/>

:::note
ClickHouse에 직접 쿼리하기 위해 DirectQuery를 선택하는 것을 권장합니다.

데이터 양이 적은 경우 import 모드를 선택할 수 있으며, 모든 데이터가 Power BI에 로드됩니다.
:::

* 사용자 이름과 비밀번호 지정

<Image size="md" img={powerbi_connect_user} alt="사용자 이름 및 비밀번호를 위한 ClickHouse 연결 자격증명 대화상자" border />
<br/>

### 데이터 쿼리 및 시각화 {#query-and-visualise-data}

마지막으로, Navigator 보기에서 데이터베이스 및 테이블을 확인할 수 있습니다. 원하는 테이블을 선택하고 "Load"를 클릭하여 ClickHouse에서 데이터를 가져옵니다.

<Image size="md" img={powerbi_table_navigation} alt="ClickHouse 데이터베이스 테이블과 샘플 데이터가 표시되는 Power BI Navigator 보기" border />
<br/>

가져오기가 완료되면 ClickHouse 데이터가 Power BI에서 정상적으로 접근 가능해야 합니다.
<br/>

## Power BI Service {#power-bi-service}

Microsoft Power BI Service를 사용하기 위해서는 [온프레미스 데이터 게이트웨이](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-onprem)를 생성해야 합니다.

사용자 지정 커넥터 설정 방법에 대한 자세한 내용은 Microsoft의 문서인 [온프레미스 데이터 게이트웨이와 함께 사용자 지정 데이터 커넥터 사용하기](https://learn.microsoft.com/en-us/power-bi/connect-data/service-gateway-custom-connectors)를 참조하십시오.

## ODBC 드라이버 (가져오기 전용) {#odbc-driver-import-only}

DirectQuery를 사용하는 ClickHouse 커넥터를 사용하는 것을 권장합니다.

온프레미스 데이터 게이트웨이 인스턴스에 [ODBC 드라이버](#install-the-odbc-driver)를 설치하고 위에서 설명한 대로 [확인](#verify-odbc-driver)합니다.

### 새 사용자 DSN 만들기 {#create-a-new-user-dsn}

드라이버 설치가 완료되면 ODBC 데이터 소스를 생성할 수 있습니다. 시작 메뉴에서 ODBC를 검색하고 "ODBC Data Sources (64-bit)"를 선택합니다.

<Image size="md" img={powerbi_odbc_search} alt="Windows 검색에서 ODBC Data Sources (64-bit) 옵션이 표시되는 화면" border />
<br/>

여기에서 새 사용자 DSN을 추가해야 합니다. 왼쪽의 "Add" 버튼을 클릭합니다.

<Image size="md" img={powerbi_add_dsn} alt="새 DSN 생성을 위한 Add 버튼이 강조 표시된 ODBC 데이터 소스 관리자" border />
<br/>

ODBC 드라이버의 유니코드 버전을 선택합니다.

<Image size="md" img={powerbi_select_unicode} alt="ClickHouse Unicode 드라이버 선택을 보여주는 새 데이터 소스 만들기 대화상자" border />
<br/>

연결 세부정보를 입력합니다.

<Image size="sm" img={powerbi_connection_details} alt="연결 매개변수가 포함된 ClickHouse ODBC 드라이버 구성 대화상자" border />
<br/>

:::note
SSL이 활성화된 배포(예: ClickHouse Cloud 또는 자체 관리 인스턴스)를 사용하는 경우 `SSLMode` 필드에 `require`를 입력해야 합니다.

- `Host`는 항상 프로토콜(즉, `http://` 또는 `https://`)이 생략되어야 합니다.
- `Timeout`은 초를 나타내는 정수입니다. 기본값: `30초`.
:::

### Power BI로 데이터 가져오기 {#get-data-into-power-bi}

Power BI가 아직 설치되지 않았다면, [Power BI Desktop을 다운로드하고 설치](https://www.microsoft.com/en-us/download/details.aspx?id=58494)하십시오.

Power BI Desktop 시작 화면에서 "Get Data"를 클릭합니다.

<Image size="md" img={powerbi_get_data} alt="Power BI Desktop 홈 화면에 Get Data 버튼이 표시되는 화면" border />
<br/>

"Other" -> "ODBC"를 선택합니다.

<Image size="md" img={powerbi_select_odbc} alt="기타 카테고리에서 ODBC 옵션이 선택된 Power BI Get Data 대화상자" border />
<br/>

목록에서 이전에 생성한 데이터 소스를 선택합니다.

<Image size="md" img={powerbi_select_dsn} alt="구성된 ClickHouse DSN이 표시되는 ODBC 드라이버 선택 대화상자" border />
<br/>

:::note
데이터 소스를 생성할 때 자격증명을 지정하지 않은 경우, 사용자 이름과 비밀번호를 입력하라는 메시지가 표시됩니다.
:::

<Image size="md" img={powerbi_dsn_credentials} alt="ODBC DSN 연결을 위한 자격증명 대화상자" border />
<br/>

마지막으로, Navigator 보기에서 데이터베이스 및 테이블을 확인할 수 있습니다. 원하는 테이블을 선택하고 "Load"를 클릭하여 ClickHouse에서 데이터를 가져옵니다.

<Image size="md" img={powerbi_table_navigation} alt="ClickHouse 데이터베이스 테이블과 샘플 데이터가 표시되는 Power BI Navigator 보기" border />
<br/>

가져오기가 완료되면 ClickHouse 데이터가 Power BI에서 정상적으로 접근 가능해야 합니다.

## 알려진 제한 사항 {#known-limitations}

### UInt64 {#uint64}

UInt64와 같은 부호 없는 정수 유형은 Power BI가 지원하는 최대 정수 유형인 Int64보다 더 큰 경우 자동으로 데이터 세트에 로드되지 않습니다.

:::note
데이터를 올바르게 가져오기 위해, Navigator에서 "Load" 버튼을 클릭하기 전에 먼저 "Transform Data"를 클릭하십시오.
:::

이 예에서 `pageviews` 테이블은 UInt64 컬럼을 가지고 있으며, 기본적으로 "Binary"로 인식됩니다.
"Transform Data"를 클릭하면 Power Query Editor가 열리며, 여기서 컬럼의 유형을 다시 지정할 수 있습니다. 예를 들어, Text로 설정할 수 있습니다.

<Image size="md" img={powerbi_16} alt="UInt64 컬럼의 데이터 유형 변환을 보여주는 Power Query Editor" border />
<br/>

완료되면 왼쪽 상단의 "Close & Apply"를 클릭하고 데이터를 로드하는 작업을 진행합니다.
