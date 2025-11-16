---
'sidebar_label': 'DbVisualizer'
'slug': '/integrations/dbvisualizer'
'description': 'DbVisualizer는 ClickHouse에 대한 확장 지원을 제공하는 데이터베이스 도구입니다.'
'title': 'DbVisualizer를 ClickHouse에 연결하기'
'keywords':
- 'DbVisualizer'
- 'database visualization'
- 'SQL client'
- 'JDBC driver'
- 'database tool'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'sql_client'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse에 DbVisualizer 연결하기

<CommunityMaintainedBadge/>

## 1. DbVisualizer 시작 또는 다운로드 {#start-or-download-dbvisualizer}

DbVisualizer는 https://www.dbvis.com/download/ 에서 다운로드할 수 있습니다.

## 2. 연결 세부정보 수집하기 {#1-gather-your-connection-details}

<ConnectionDetails />

## 3. 내장 JDBC 드라이버 관리 {#2-built-in-jdbc-driver-management}

DbVisualizer에는 ClickHouse에 대한 최신 JDBC 드라이버가 포함되어 있습니다. 최신 버전 및 드라이버의 역사적 버전을 가리키는 완전한 JDBC 드라이버 관리 기능이 내장되어 있습니다.

<Image img={dbvisualizer_driver_manager} size="lg" border alt="DbVisualizer 드라이버 관리자 인터페이스가 ClickHouse JDBC 드라이버 구성 표시" />

## 4. ClickHouse에 연결하기 {#3-connect-to-clickhouse}

DbVisualizer로 데이터베이스에 연결하려면 먼저 데이터베이스 연결을 생성하고 설정해야 합니다.

1. **Database->Create Database Connection**에서 새 연결을 생성하고 팝업 메뉴에서 데이터베이스 드라이버를 선택합니다.

2. 새 연결을 위한 **Object View** 탭이 열립니다.

3. **Name** 필드에 연결의 이름을 입력하고, 선택적으로 **Notes** 필드에 연결에 대한 설명을 입력합니다.

4. **Database Type**을 **Auto Detect**로 두십시오.

5. **Driver Type**에서 선택한 드라이버에 녹색 체크 마크가 표시되어 있으면 사용할 준비가 된 것입니다. 녹색 체크 마크가 표시되지 않는 경우 **Driver Manager**에서 드라이버를 구성해야 할 수 있습니다.

6. 나머지 필드에 데이터베이스 서버에 대한 정보를 입력합니다.

7. **Ping Server** 버튼을 클릭하여 지정된 주소와 포트에 대한 네트워크 연결을 설정할 수 있는지 확인합니다.

8. Ping Server의 결과에서 서버에 접근할 수 있음을 보여주면 **Connect**를 클릭하여 데이터베이스 서버에 연결합니다.

:::tip
데이터베이스에 연결하는 데 문제가 있는 경우 [연결 문제 해결](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/)에서 몇 가지 팁을 참조하세요.

## 더 알아보기 {#learn-more}

DbVisualizer에 대한 자세한 정보는 [DbVisualizer 문서](https://www.dbvis.com/docs/ug/)를 방문하세요.
