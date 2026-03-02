---
sidebar_label: 'Tableau Online'
sidebar_position: 2
slug: /integrations/tableau-online
keywords: ['clickhouse', 'tableau', 'online', 'mysql', 'connect', 'integrate', 'ui']
description: 'Tableau Online은 데이터를 보다 효율적으로 활용할 수 있게 해 어디에서나 사용자가 더 빠르고 자신 있게 의사 결정을 내릴 수 있도록 지원합니다.'
title: 'Tableau Online'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
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


# Tableau Online \{#tableau-online\}

Tableau Online은 공식 MySQL 데이터 소스를 사용하여 MySQL 인터페이스를 통해 ClickHouse Cloud 또는 온프레미스 ClickHouse 구성에 연결할 수 있습니다.

## ClickHouse Cloud 설정 \{#clickhouse-cloud-setup\}

<MySQLCloudSetup />

## 온프레미스 ClickHouse 서버 설정 \{#on-premise-clickhouse-server-setup\}

<MySQLOnPremiseSetup />

## Tableau Online를 ClickHouse에 연결하기 (온프레미스, SSL 없음) \{#connecting-tableau-online-to-clickhouse-on-premise-without-ssl\}

Tableau Cloud 사이트에 로그인한 후 새 Published Data Source를 추가합니다.

<Image size="md" img={tableau_online_01} alt="Published Data Source를 새로 만들기 위해 'New' 버튼이 표시된 Tableau Online 인터페이스" border />

<br/>

사용 가능한 커넥터 목록에서 "MySQL"을 선택합니다.

<Image size="md" img={tableau_online_02} alt="MySQL 옵션이 강조 표시된 Tableau Online 커넥터 선택 화면" border />

<br/>

ClickHouse 설정 과정에서 확인해 둔 연결 정보를 입력합니다.

<Image size="md" img={tableau_online_03} alt="서버, 포트, 데이터베이스 및 자격 증명 필드가 있는 Tableau Online MySQL 연결 구성 화면" border />

<br/>

Tableau Online이 데이터베이스를 분석하여 사용 가능한 테이블 목록을 제공합니다. 원하는 테이블을 오른쪽 캔버스로 드래그합니다. 또한 "Update Now"를 클릭하여 데이터를 미리 보고, 분석된 필드 유형이나 이름을 세부적으로 조정할 수 있습니다.

<Image size="md" img={tableau_online_04} alt="왼쪽에는 데이터베이스 테이블, 오른쪽에는 드래그 앤 드롭 기능이 있는 캔버스가 표시된 Tableau Online 데이터 소스 페이지" border />

<br/>

그다음 오른쪽 상단의 "Publish As"를 클릭하면 됩니다. 그러면 Tableau Online에서 새로 생성된 데이터셋을 평소와 같이 사용할 수 있습니다.

NB: Tableau Online을 Tableau Desktop과 함께 사용하여 ClickHouse 데이터셋을 공유하려는 경우, Data Source 드롭다운에서 MySQL을 선택했을 때 표시되는 설정 가이드를 따라 Tableau Desktop에서도 기본 MySQL 커넥터를 사용해야 합니다. 설정 가이드는 [여기](https://www.tableau.com/support/drivers)에 표시됩니다. M1 Mac을 사용하는 경우, 드라이버 설치 우회 방법은 [이 문제 해결 스레드](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)를 참고하십시오.

## Tableau Online을 ClickHouse에 연결하기 (Cloud 또는 온프레미스 SSL 설정) \{#connecting-tableau-online-to-clickhouse-cloud-or-on-premise-setup-with-ssl\}

Tableau Online MySQL 연결 설정 마법사를 통해 SSL 인증서를 제공하는 것은 불가능하므로, 
Tableau Desktop에서 먼저 연결을 설정한 뒤 이를 Tableau Online으로 내보내는 방법만 사용할 수 있습니다. 다만 이 절차는 비교적 간단합니다.

Windows 또는 Mac에서 Tableau Desktop을 실행한 뒤 "Connect" -> "To a Server" -> "MySQL"을 선택합니다.
먼저 로컬 환경에 MySQL 드라이버를 설치해야 할 수도 있습니다. 
이는 Data Source 드롭다운에서 MySQL을 선택했을 때 표시되는 [이 설정 가이드](https://www.tableau.com/support/drivers)를 따라 설치할 수 있습니다. 
M1 Mac을 사용하는 경우, 드라이버 설치 우회 방법은 [이 트러블슈팅 스레드](https://community.tableau.com/s/question/0D58b0000Ar6OhvCQE/unable-to-install-mysql-driver-for-m1-mac)를 확인하십시오.

<Image size="md" img={tableau_desktop_01} alt="Tableau Desktop 인터페이스에서 Connect 메뉴가 보이고 MySQL 옵션이 강조 표시된 화면" border />

<br/>

:::note
MySQL 연결 설정 UI에서 "SSL" 옵션이 활성화되어 있는지 확인하십시오. 
ClickHouse Cloud의 SSL 인증서는 [Let's Encrypt](https://letsencrypt.org/certificates/)에서 서명되었습니다. 
이 루트 인증서는 [여기](https://letsencrypt.org/certs/isrgrootx1.pem)에서 다운로드할 수 있습니다.
:::

ClickHouse Cloud 인스턴스의 MySQL 사용자 자격 증명과 다운로드한 루트 인증서 경로를 입력합니다.

<Image size="sm" img={tableau_desktop_02} alt="SSL 옵션이 활성화되어 있고 서버, 사용자 이름, 비밀번호, 인증서 필드가 있는 Tableau Desktop MySQL 연결 대화 상자" border />

<br/>

필요한 테이블을 (Tableau Online에서와 마찬가지로) 평소와 같이 선택한 다음, 
"Server" -> "Publish Data Source" -> Tableau Cloud를 선택합니다.

<Image size="md" img={tableau_desktop_03} alt="Server 메뉴가 표시되고 Publish Data Source 옵션이 강조된 Tableau Desktop 화면" border />

<br/>

중요: "Authentication" 옵션에서 "Embedded password"를 선택해야 합니다.

<Image size="md" img={tableau_desktop_04} alt="Authentication 옵션에서 Embedded password가 선택된 Tableau Desktop 게시 대화 상자" border />

<br/>

추가로 "Update workbook to use the published data source"를 선택합니다.

<Image size="sm" img={tableau_desktop_05} alt="'Update workbook to use the published data source' 옵션이 체크된 Tableau Desktop 게시 대화 상자" border />

<br/>

마지막으로 "Publish"를 클릭하면, 임베디드 자격 증명이 포함된 데이터 소스가 Tableau Online에서 자동으로 열립니다.

## 알려진 제한 사항(ClickHouse 23.11) \{#known-limitations-clickhouse-2311\}

알려진 제한 사항은 모두 ClickHouse `23.11`에서 수정되었습니다. 다른 호환성 문제를 발견하면 주저하지 말고 [문의](https://clickhouse.com/company/contact)하거나 [새 이슈](https://github.com/ClickHouse/ClickHouse/issues)를 등록하십시오.