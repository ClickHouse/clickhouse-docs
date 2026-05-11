---
sidebar_label: 'DataGrip'
slug: /integrations/datagrip
description: 'DataGrip은 ClickHouse를 기본으로 지원하는 데이터베이스 IDE입니다.'
title: 'DataGrip을 ClickHouse에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'sql_client'
  - website: 'https://www.jetbrains.com/datagrip/'
keywords: ['DataGrip', '데이터베이스 IDE', 'JetBrains', 'SQL 클라이언트', '통합 개발 환경']
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import datagrip_1 from '@site/static/images/integrations/sql-clients/datagrip-1.png';
import datagrip_5 from '@site/static/images/integrations/sql-clients/datagrip-5.png';
import datagrip_6 from '@site/static/images/integrations/sql-clients/datagrip-6.png';
import datagrip_7 from '@site/static/images/integrations/sql-clients/datagrip-7.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# DataGrip을 ClickHouse에 연결하기 \{#connecting-datagrip-to-clickhouse\}

<CommunityMaintainedBadge/>

## DataGrip 시작 또는 다운로드 \{#start-or-download-datagrip\}

DataGrip은 https://www.jetbrains.com/datagrip/ 에서 다운로드할 수 있습니다.

## 1. 연결 정보 준비하기 \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. ClickHouse 드라이버 로드 \{#2-load-the-clickhouse-driver\}

1. DataGrip을 실행한 다음 **Data Sources and Drivers** 대화 상자의 **Data Sources** 탭에서 **+** 아이콘을 클릭합니다.

<Image img={datagrip_5} size="lg" border alt="+ 아이콘이 강조된 DataGrip Data Sources 탭" />

**ClickHouse**를 선택합니다.

:::tip
  연결을 추가하면 목록 순서가 변경되므로, 아직 ClickHouse가 목록의 맨 위에 있지 않을 수 있습니다.
  :::

<Image img={datagrip_6} size="sm" border alt="데이터 소스 목록에서 ClickHouse를 선택하는 DataGrip 화면" />

- **Drivers** 탭으로 전환하여 ClickHouse 드라이버를 로드합니다.

  DataGrip은 다운로드 크기를 최소화하기 위해 드라이버를 기본으로 포함하지 않습니다. **Drivers** 탭에서 **Complete Support** 목록의 **ClickHouse**를 선택한 후 **+** 기호를 클릭합니다. 그런 다음 **Provided Driver** 옵션에서 **Latest stable** 드라이버를 선택합니다.

<Image img={datagrip_1} size="lg" border alt="ClickHouse 드라이버 설치를 보여주는 DataGrip Drivers 탭" />

## 3. ClickHouse에 연결하기 \{#3-connect-to-clickhouse\}

- 데이터베이스 연결 정보를 입력한 다음 **Test Connection**을 클릭합니다. 
1단계에서 수집한 연결 정보를 사용하여 호스트 URL, 포트, 사용자 이름, 비밀번호, 데이터베이스 이름을 입력한 후 연결을 테스트합니다.

:::tip
프로토콜 접두사(예: `https://`) 없이 **Host** 필드에는 호스트 이름만 입력하십시오(예: `your-host.clickhouse.cloud`).

ClickHouse Cloud에 연결할 때는 호스트 아래에 있는 **URL** 필드에 `?ssl=true`를 추가해야 합니다. 전체 JDBC URL은 다음과 같아야 합니다:

`jdbc:clickhouse://your-host.clickhouse.cloud:8443/default?ssl=true`

ClickHouse Cloud는 모든 연결에서 SSL 암호화를 요구합니다. `?ssl=true` 파라미터가 없으면 자격 증명이 올바르더라도 「Connection reset」 오류가 발생합니다.

JDBC URL 설정에 대한 자세한 내용은 [ClickHouse JDBC driver](https://github.com/ClickHouse/clickhouse-java) 저장소를 참조하십시오.
:::

<Image img={datagrip_7} border alt="ClickHouse 설정이 포함된 DataGrip 연결 정보 입력 폼" />

## 더 알아보기 \{#learn-more\}

DataGrip에 대한 자세한 내용은 DataGrip 문서를 참조하십시오.