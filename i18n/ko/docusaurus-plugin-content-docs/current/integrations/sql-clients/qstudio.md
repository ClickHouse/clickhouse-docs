---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio는 무료 SQL 도구입니다.'
title: 'QStudio를 ClickHouse에 연결'
doc_type: 'guide'
keywords: ['qstudio', 'SQL 클라이언트', '데이터베이스 도구', '쿼리 도구', 'IDE']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# QStudio를 ClickHouse에 연결하기 \{#connect-qstudio-to-clickhouse\}

<CommunityMaintainedBadge/>

QStudio는 무료 SQL GUI 도구로서 SQL 스크립트를 실행하고, 테이블을 쉽게 탐색하며, 결과를 차트로 시각화하고 내보낼 수 있습니다. 모든 운영 체제와 모든 데이터베이스에서 사용할 수 있습니다.

QStudio는 JDBC를 사용하여 ClickHouse에 연결합니다.

## 1. ClickHouse 세부 정보 준비하기 \{#1-gather-your-clickhouse-details\}

QStudio는 HTTP(S)를 통한 JDBC를 사용하여 ClickHouse에 연결합니다. 다음 정보가 필요합니다:

- endpoint
- 포트 번호
- username
- password

<ConnectionDetails />

## 2. QStudio 다운로드 \{#2-download-qstudio\}

QStudio는 https://www.timestored.com/qstudio/download/에서 다운로드할 수 있습니다.

## 3. 데이터베이스 추가 \{#3-add-a-database\}

- QStudio를 처음 열면 메뉴에서 **Server->Add Server** 또는 도구 모음의 서버 추가 버튼을 클릭합니다.
- 그런 다음 세부 정보를 다음과 같이 설정합니다.

<Image img={qstudio_add_connection} size="lg" border alt="ClickHouse 연결 설정이 표시된 QStudio 데이터베이스 연결 구성 화면" />

1.   Server Type: Clickhouse.com
2.    Host에는 반드시 `https://`를 포함해야 합니다.  
    Host: https://abc.def.clickhouse.cloud  
    Port: 8443
3.  Username: default  
    Password: `XXXXXXXXXXX`
 4. Add를 클릭합니다.

QStudio에서 ClickHouse JDBC 드라이버가 설치되어 있지 않은 것을 감지하면, 드라이버를 다운로드할 수 있도록 안내합니다.

## 4. ClickHouse에 쿼리 실행하기 \{#4-query-clickhouse\}

- 쿼리 편집기를 열고 쿼리를 실행합니다. 다음 단축키로 쿼리를 실행할 수 있습니다.
- Ctrl + E - 선택한 텍스트를 실행합니다.
- Ctrl + Enter - 현재 줄을 실행합니다.

- 예제 쿼리:

<Image img={qstudio_running_query} size="lg" border alt="QStudio 인터페이스에서 ClickHouse 데이터베이스에 예제 SQL 쿼리를 실행하는 화면" />

## 다음 단계 \{#next-steps\}

QStudio의 기능은 [QStudio](https://www.timestored.com/qstudio)를 통해 살펴보고, ClickHouse의 기능은 [ClickHouse 설명서](https://clickhouse.com/docs)를 참고하여 알아보십시오.