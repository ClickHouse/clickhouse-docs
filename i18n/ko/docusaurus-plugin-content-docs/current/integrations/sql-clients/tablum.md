---
sidebar_label: 'TABLUM.IO'
slug: /integrations/tablumio
description: 'TABLUM.IO는 ClickHouse를 기본적으로 지원하는 데이터 관리 SaaS입니다.'
title: 'TABLUM.IO를 ClickHouse에 연결하기'
doc_type: 'guide'
keywords: ['tablum', 'SQL 클라이언트', '데이터베이스 도구', '쿼리 도구', '데스크톱 앱']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# TABLUM.IO를 ClickHouse와 연동하기 \{#connecting-tablumio-to-clickhouse\}

<CommunityMaintainedBadge/>

## TABLUM.IO 시작 페이지 열기 \{#open-the-tablumio-startup-page\}

:::note
  Linux 서버에서 Docker를 사용해 TABLUM.IO 셀프 호스티드 버전을 설치할 수 있습니다.
:::

## 1. 서비스에 가입하거나 로그인합니다 \{#1-sign-up-or-sign-in-to-the-service\}

먼저 이메일 주소로 TABLUM.IO에 가입하거나, Google 또는 Facebook 계정을 사용해 간편 로그인합니다.

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO 로그인 페이지" />

## 2. ClickHouse 커넥터 추가 \{#2-add-a-clickhouse-connector\}

ClickHouse 연결 정보를 준비한 다음 **Connector** 탭으로 이동하여 호스트 URL, 포트, 사용자 이름, 비밀번호, 데이터베이스 이름, 커넥터 이름을 입력합니다. 모든 필드를 입력한 후 **Test connection** 버튼을 클릭해 정보를 검증하고, 이후 **Save connector for me** 를 클릭해 커넥터를 저장합니다.

:::tip
연결 정보에 맞게 올바른 **HTTP** 포트를 지정하고 **SSL** 모드를 적절히 설정하십시오.
:::

:::tip
일반적으로 TLS를 사용할 때 포트는 8443이고, TLS를 사용하지 않을 때는 8123입니다.
:::

<Image img={tablum_ch_1} size="lg" border alt="TABLUM.IO에서 ClickHouse 커넥터를 추가하는 화면" />

## 3. 커넥터 선택 \{#3-select-the-connector\}

**Dataset** 탭으로 이동합니다. 드롭다운에서 방금 생성한 ClickHouse 커넥터를 선택합니다. 오른쪽 패널에는 사용 가능한 테이블과 스키마 목록이 표시됩니다.

<Image img={tablum_ch_2} size="lg" border alt="TABLUM.IO에서 ClickHouse 커넥터를 선택하는 화면" />

## 4. SQL 쿼리를 입력하고 실행합니다 \{#4-input-a-sql-query-and-run-it\}

SQL Console에 쿼리를 입력한 후 **Run Query**를 클릭하십시오. 결과는 스프레드시트 형식으로 표시됩니다.

:::tip
컬럼 이름을 마우스 오른쪽 버튼으로 클릭하여 정렬, 필터 및 기타 작업이 포함된 드롭다운 메뉴를 여십시오.
:::

<Image img={tablum_ch_3} size="lg" border alt="TABLUM.IO에서 SQL 쿼리를 실행하는 화면" />

:::note
TABLUM.IO를 사용하면 다음을 수행할 수 있습니다.

* TABLUM.IO 계정 내에서 여러 ClickHouse 커넥터를 생성하고 활용할 수 있습니다.
* 데이터 소스와 관계없이 로드된 모든 데이터에 대해 쿼리를 실행할 수 있습니다.
* 결과를 새 ClickHouse 데이터베이스로 공유할 수 있습니다.
:::

## 더 알아보기 \{#learn-more\}

TABLUM.IO에 대한 자세한 내용은 https://tablum.io에서 확인할 수 있습니다.