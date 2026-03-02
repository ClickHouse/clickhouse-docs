---
sidebar_label: 'DbVisualizer'
slug: /integrations/dbvisualizer
description: 'DbVisualizer는 ClickHouse 지원이 강화된 데이터베이스 도구입니다.'
title: 'DbVisualizer를 ClickHouse에 연결하기'
keywords: ['DbVisualizer', '데이터베이스 시각화', 'SQL 클라이언트', 'JDBC 드라이버', '데이터베이스 도구']
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import dbvisualizer_driver_manager from '@site/static/images/integrations/sql-clients/dbvisualizer-driver-manager.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DbVisualizer에서 ClickHouse에 연결하기 \{#connecting-dbvisualizer-to-clickhouse\}

<CommunityMaintainedBadge/>

## DbVisualizer 시작 또는 다운로드 \{#start-or-download-dbvisualizer\}

DbVisualizer는 https://www.dbvis.com/download/에서 다운로드할 수 있습니다.

## 1. 연결 정보 수집하기 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. 내장 JDBC 드라이버 관리 \{#2-built-in-jdbc-driver-management\}

DbVisualizer에는 ClickHouse용 최신 JDBC 드라이버가 기본적으로 포함되어 있습니다. 최신 릴리스는 물론 드라이버의 이전 버전까지 손쉽게 사용할 수 있도록, 완전한 JDBC 드라이버 관리 기능이 내장되어 있습니다.

<Image img={dbvisualizer_driver_manager} size="lg" border alt="ClickHouse JDBC 드라이버 구성이 표시된 DbVisualizer 드라이버 관리자 인터페이스" />

## 3. ClickHouse에 연결하기 \{#3-connect-to-clickhouse\}

DbVisualizer에서 데이터베이스에 연결하려면 먼저 Database Connection을 생성하고 설정해야 합니다.

1. **Database-&gt;Create Database Connection**에서 새 연결을 생성한 후, 팝업 메뉴에서 해당 데이터베이스에 사용할 드라이버를 선택합니다.

2. 새 연결에 대한 **Object View** 탭이 열립니다.

3. **Name** 필드에 연결 이름을 입력하고, 필요한 경우 **Notes** 필드에 연결에 대한 설명을 입력합니다.

4. **Database Type**은 **Auto Detect**로 그대로 둡니다.

5. **Driver Type**에서 선택한 드라이버에 초록색 체크 표시가 되어 있으면 사용할 준비가 된 것입니다. 초록색 체크 표시가 없다면 **Driver Manager**에서 드라이버를 추가로 구성해야 할 수도 있습니다.

6. 나머지 필드에 데이터베이스 서버에 대한 정보를 입력합니다.

7. **Ping Server** 버튼을 클릭하여 지정된 주소와 포트로 네트워크 연결을 설정할 수 있는지 확인합니다.

8. Ping Server 결과에서 서버에 도달할 수 있음이 표시되면, **Connect**를 클릭하여 데이터베이스 서버에 연결합니다.

:::tip
데이터베이스에 연결하는 데 문제가 발생하는 경우, [연결 문제 해결(Fixing Connection Issues)](https://www.dbvis.com/docs/ug/troubleshooting/fixing-connection-issues/)을 참고하십시오.
:::

## 더 알아보기 \{#learn-more\}

DbVisualizer에 대한 자세한 내용은 [DbVisualizer 문서](https://www.dbvis.com/docs/ug/)를 참고하십시오.