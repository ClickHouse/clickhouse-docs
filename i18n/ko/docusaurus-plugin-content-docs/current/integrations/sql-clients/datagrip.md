---
'sidebar_label': 'DataGrip'
'slug': '/integrations/datagrip'
'description': 'DataGrip은 기본적으로 ClickHouse를 지원하는 데이터베이스 IDE입니다.'
'title': 'DataGrip을 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'sql_client'
- 'website': 'https://www.jetbrains.com/datagrip/'
'keywords':
- 'DataGrip'
- 'database IDE'
- 'JetBrains'
- 'SQL client'
- 'integrated development environment'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# ClickHouse에 DataGrip 연결하기

<CommunityMaintainedBadge/>

## 1. DataGrip 시작 또는 다운로드하기 {#start-or-download-datagrip}

DataGrip은 https://www.jetbrains.com/datagrip/에서 다운로드 가능합니다.

## 2. 연결 세부정보 수집하기 {#1-gather-your-connection-details}
<ConnectionDetails />

## 3. ClickHouse 드라이버 로드하기 {#2-load-the-clickhouse-driver}

1. DataGrip을 실행하고, **데이터 원본** 탭에서 **데이터 원본 및 드라이버** 대화상자의 **+** 아이콘을 클릭합니다.

<Image img={datagrip_5} size="lg" border alt="DataGrip 데이터 원본 탭에서 + 아이콘 강조" />

  **ClickHouse**를 선택합니다.

  :::tip
  연결을 설정하는 동안 순서가 변경됩니다. ClickHouse가 목록의 상단에 없을 수 있습니다.
  :::

<Image img={datagrip_6} size="sm" border alt="DataGrip에서 데이터 원본 목록 중 ClickHouse 선택" />

- **드라이버** 탭으로 전환하고 ClickHouse 드라이버를 로드합니다.

  DataGrip은 다운로드 크기를 최소화하기 위해 드라이버와 함께 제공되지 않습니다. **드라이버** 탭에서 **완전 지원** 목록에서 **ClickHouse**를 선택하고 **+** 기호를 확장합니다. **제공된 드라이버** 옵션에서 **최신 안정성** 드라이버를 선택합니다:

<Image img={datagrip_1} size="lg" border alt="DataGrip 드라이버 탭에서 ClickHouse 드라이버 설치" />

## 4. ClickHouse에 연결하기 {#3-connect-to-clickhouse}

- 데이터베이스 연결 세부정보를 지정하고 **연결 테스트**를 클릭합니다. 
첫 번째 단계에서 연결 세부정보를 수집했으므로 호스트 URL, 포트, 사용자 이름, 비밀번호 및 데이터베이스 이름을 입력한 후 연결을 테스트합니다.

:::tip
**호스트** 필드에는 프로토콜 접두사인 `https://` 없이 호스트 이름만 입력하세요 (예: `your-host.clickhouse.cloud`).

ClickHouse Cloud 연결의 경우, 아래의 URL 필드에 `?ssl=true`를 추가해야 합니다. 완전한 JDBC URL은 다음과 같아야 합니다:

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloud는 모든 연결에 대해 SSL 암호화를 요구합니다. `?ssl=true` 매개변수가 없으면 올바른 자격 증명의 경우에도 "연결 재설정" 오류가 표시됩니다.

JDBC URL 설정에 대한 자세한 내용은 [ClickHouse JDBC 드라이버](https://github.com/ClickHouse/clickhouse-java) 리포지토리를 참조하십시오.
:::

<Image img={datagrip_7} border alt="ClickHouse 설정이 포함된 DataGrip 연결 세부정보 양식" />

## 더 배우기 {#learn-more}

DataGrip에 대한 자세한 정보는 DataGrip 문서를 방문하십시오.
