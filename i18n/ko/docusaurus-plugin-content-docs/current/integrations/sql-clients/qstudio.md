---
'slug': '/integrations/qstudio'
'sidebar_label': 'QStudio'
'description': 'QStudio는 무료 SQL 도구입니다.'
'title': 'QStudio를 ClickHouse에 연결하기'
'doc_type': 'guide'
'keywords':
- 'qstudio'
- 'sql client'
- 'database tool'
- 'query tool'
- 'ide'
---

import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Connect QStudio to ClickHouse

<CommunityMaintainedBadge/>

QStudio는 무료 SQL GUI로, SQL 스크립트를 실행하고, 테이블을 쉽게 탐색하며, 차트를 작성하고 결과를 내보낼 수 있습니다. 모든 운영 체제와 모든 데이터베이스에서 작동합니다.

QStudio는 JDBC를 사용하여 ClickHouse에 연결합니다.

## 1. ClickHouse 세부정보 수집 {#1-gather-your-clickhouse-details}

QStudio는 HTTP(S)를 통해 JDBC를 사용하여 ClickHouse에 연결합니다. 필요 사항은 다음과 같습니다:

- endpoint
- port number
- username
- password

<ConnectionDetails />

## 2. QStudio 다운로드 {#2-download-qstudio}

QStudio는 https://www.timestored.com/qstudio/download/ 에서 사용할 수 있습니다.

## 3. 데이터베이스 추가 {#3-add-a-database}

- QStudio를 처음 열면 메뉴 옵션 **Server->Add Server**를 클릭하거나 툴바의 서버 추가 버튼을 클릭합니다.
- 그런 다음 세부정보를 설정합니다:

<Image img={qstudio_add_connection} size="lg" border alt="QStudio 데이터베이스 연결 구성 화면으로 ClickHouse 연결 설정이 표시됩니다." />

1.   서버 유형: Clickhouse.com
2.    호스트에는 반드시 https://를 포함해야 합니다.
    호스트: https://abc.def.clickhouse.cloud
    포트: 8443
3.  사용자 이름: default
    비밀번호: `XXXXXXXXXXX`
 4. 추가 클릭

QStudio가 ClickHouse JDBC 드라이버가 설치되어 있지 않은 경우 다운로드하라는 제안을 합니다:

## 4. ClickHouse 쿼리하기 {#4-query-clickhouse}

- 쿼리 편집기를 열고 쿼리를 실행합니다. 쿼리는 다음과 같이 실행할 수 있습니다.
- Ctrl + e - 강조 텍스트 실행
- Ctrl + Enter - 현재 줄 실행

- 예제 쿼리:

<Image img={qstudio_running_query} size="lg" border alt="QStudio 인터페이스로 ClickHouse 데이터베이스에 대한 샘플 SQL 쿼리 실행을 보여줍니다." />

## 다음 단계 {#next-steps}

QStudio의 기능에 대해 배우려면 [QStudio](https://www.timestored.com/qstudio)를 참조하고, ClickHouse의 기능에 대해 배우려면 [ClickHouse documentation](https://clickhouse.com/docs)을 참조하세요.
