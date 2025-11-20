---
'sidebar_label': 'Tableau Online'
'sidebar_position': 2
'slug': '/integrations/tableau-online'
'keywords':
- 'clickhouse'
- 'tableau'
- 'online'
- 'mysql'
- 'connect'
- 'integrate'
- 'ui'
'description': 'Tableau Online는 데이터를 활용하여 사람들이 어디서든 더 빠르고 자신 있게 의사결정을 내릴 수 있도록 합니다.'
'title': 'Tableau Online'
'doc_type': 'guide'
---

import MySQLCloudSetup from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import Image from '@theme/IdealImage';
import tableau_online_01 from '@site/static/images/integrations/data-visualization/tableau_online_01.png';
import tableau_online_02 from '@site/static/images/integrations/data-visualization/tableau_online_02.png';
import tableau_online_03 from '@site/static/images/integrations/data-visualization/tableau_online_03.png';
import tableau_online_04 from '@site/static/images/integrations/data-visualization/tableau_online_04.png';
import tableau_desktop_01 from '@site/static/images/integrations/data-visualization/tableau_desktop_01.png';
import tableau_desktop_02 from '@site/static/images/integrations/data-visualization/tableau_desktop_02.png';
import tableau_desktop_03 from '@site/static/images/integrations/data-visualization/tableau_desktop_03.png';
import tableau_desktop_04 from '@site/static/images/integrations/data-visualization/tableau_desktop_04.png';
import tableau_desktop_05 from '@site/static/images/integrations/data-visualization/tableau_desktop_05.png';


# Tableau Online

Tableau Online은 공식 MySQL 데이터 소스를 사용하여 ClickHouse Cloud 또는 자체 관리 ClickHouse 설정에 MySQL 인터페이스로 연결할 수 있습니다.

## ClickHouse Cloud 설정 {#clickhouse-cloud-setup}
<MySQLCloudSetup />

## 자체 관리 ClickHouse 서버 설정 {#on-premise-clickhouse-server-setup}
<MySQLOnPremiseSetup />

## Tableau Online을 ClickHouse에 연결하기 (SSL 없이 자체 관리) {#connecting-tableau-online-to-clickhouse-on-premise-without-ssl}

Tableau Cloud 사이트에 로그인하고 새로운 Published Data Source를 추가합니다.

<Image size="md" img={tableau_online_01} alt="Tableau Online 인터페이스, Published Data Source를 생성하기 위한 'New' 버튼 표시" border />
<br/>

사용 가능한 커넥터 목록에서 "MySQL"을 선택합니다.

<Image size="md" img={tableau_online_02} alt="MySQL 옵션이 강조 표시된 Tableau Online 커넥터 선택 화면" border />
<br/>

ClickHouse 설정 중에 수집한 연결 세부 사항을 지정합니다.

<Image size="md" img={tableau_online_03} alt="서버, 포트, 데이터베이스 및 자격 증명 필드가 있는 Tableau Online MySQL 연결 구성 화면" border />
<br/>

Tableau Online이 데이터베이스를 분석하고 사용 가능한 테이블 목록을 제공합니다. 원하는 테이블을 오른쪽의 캔버스로 드래그합니다. 추가로, "Update Now"를 클릭하면 데이터를 미리 볼 수 있으며, 분석된 필드 유형이나 이름을 세부 조정할 수 있습니다.

<Image size="md" img={tableau_online_04} alt="왼쪽에 데이터베이스 테이블, 오른쪽에 드래그 앤 드롭 기능이 있는 캔버스를 보여주는 Tableau Online 데이터 소스 페이지" border />
<br/>

그 후, 남은 것은 오른쪽 상단 코너의 "Publish As"를 클릭하는 것뿐이며, 새로운 데이터 세트를 Tableau Online에서 평소처럼 사용할 수 있습니다.

NB: Tableau Online을 Tableau Desktop과 결합하여 ClickHouse 데이터 세트를 공유하려면, 기본 MySQL 커넥터로 Tableau Desktop을 사용하도록 하십시오. 데이터 소스 드롭다운에서 MySQL을 선택하면 표시되는 설정 가이드를 따라야 합니다 [여기](https://www.tableau.com/support/drivers)에서 확인할 수 있습니다. M1 Mac을 사용하는 경우 [이 해결 방법 스레드](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)를 확인하여 드라이버 설치 문제를 해결하십시오.

## Tableau Online을 ClickHouse에 연결하기 (SSL이 있는 클라우드 또는 자체 관리 설정) {#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl}

Tableau Online MySQL 연결 설정 마법사를 통해 SSL 인증서를 제공할 수 없으므로, 유일한 방법은 Tableau Desktop을 사용하여 연결을 설정한 후 Tableau Online으로 내보내는 것입니다. 이 프로세스는 꽤 간단합니다.

Windows 또는 Mac 머신에서 Tableau Desktop을 실행하고, "Connect" -> "To a Server" -> "MySQL"을 선택합니다. 
먼저 머신에 MySQL 드라이버를 설치해야 할 수 있습니다. 
데이터 소스 드롭다운에서 MySQL을 선택하면 표시되는 설정 가이드를 따라 설치할 수 있습니다 [여기](https://www.tableau.com/support/drivers)에서 확인하세요. 
M1 Mac을 사용하는 경우 [이 해결 방법 스레드](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)를 확인하여 드라이버 설치 문제를 해결하십시오.

<Image size="md" img={tableau_desktop_01} alt="MySQL 옵션이 강조 표시된 Tableau Desktop 인터페이스의 Connect 메뉴" border />
<br/>

:::note
MySQL 연결 설정 UI에서 "SSL" 옵션이 활성화되어 있는지 확인하십시오. 
ClickHouse Cloud의 SSL 인증서는 [Let's Encrypt](https://letsencrypt.org/certificates/)에 의해 서명되었습니다. 
이 루트 인증서를 [여기](https://letsencrypt.org/certs/isrgrootx1.pem)에서 다운로드할 수 있습니다.
:::

ClickHouse Cloud 인스턴스의 MySQL 사용자 자격 증명과 다운로드한 루트 인증서의 경로를 제공하십시오.

<Image size="sm" img={tableau_desktop_02} alt="SSL 옵션이 활성화된 Tableau Desktop MySQL 연결 대화 상자, 서버, 사용자 이름, 비밀번호 및 인증서 필드" border />
<br/>

일반적으로 원하는 테이블을 선택합니다 (Tableau Online과 유사하게), 
그 후 "Server" -> "Publish Data Source" -> Tableau Cloud를 선택합니다.

<Image size="md" img={tableau_desktop_03} alt="Publish Data Source 옵션이 강조 표시된 Server 메뉴의 Tableau Desktop" border />
<br/>

중요: "Authentication" 옵션에서 "Embedded password"를 선택해야 합니다.

<Image size="md" img={tableau_desktop_04} alt="Embedded password가 선택된 인증 옵션을 보여주는 Tableau Desktop 게시 대화 상자" border />
<br/>

추가로, "Update workbook to use the published data source"를 선택합니다.

<Image size="sm" img={tableau_desktop_05} alt="게시된 데이터 소스를 사용하도록 워크북을 업데이트하는 옵션이 선택된 Tableau Desktop 게시 대화 상자" border />
<br/>

마지막으로 "Publish"를 클릭하면 내장된 자격 증명을 가진 데이터 소스가 Tableau Online에서 자동으로 열립니다.

## 알려진 제한 사항 (ClickHouse 23.11) {#known-limitations-clickhouse-2311}

모든 알려진 제한 사항은 ClickHouse `23.11`에서 수정되었습니다. 다른 호환성 문제가 발생하면 주저하지 말고 [문의하십시오](https://clickhouse.com/company/contact)거나 [새 문제를 생성](https://github.com/ClickHouse/ClickHouse/issues)해 주십시오.
