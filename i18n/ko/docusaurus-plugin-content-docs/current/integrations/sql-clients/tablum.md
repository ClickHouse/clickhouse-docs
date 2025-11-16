---
'sidebar_label': 'TABLUM.IO'
'slug': '/integrations/tablumio'
'description': 'TABLUM.IO는 ClickHouse를 기본적으로 지원하는 데이터 관리 SaaS입니다.'
'title': 'TABLUM.IO를 ClickHouse에 연결하기'
'doc_type': 'guide'
'integration':
- 'support_level': 'partner'
- 'category': 'sql_client'
'keywords':
- 'tablum'
- 'sql client'
- 'database tool'
- 'query tool'
- 'desktop app'
---

import Image from '@theme/IdealImage';
import tablum_ch_0 from '@site/static/images/integrations/sql-clients/tablum-ch-0.png';
import tablum_ch_1 from '@site/static/images/integrations/sql-clients/tablum-ch-1.png';
import tablum_ch_2 from '@site/static/images/integrations/sql-clients/tablum-ch-2.png';
import tablum_ch_3 from '@site/static/images/integrations/sql-clients/tablum-ch-3.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# TABLUM.IO를 ClickHouse에 연결하기

<CommunityMaintainedBadge/>

## TABLUM.IO 시작 페이지 열기 {#open-the-tablumio-startup-page}

:::note
  Linux 서버에서 docker를 사용하여 TABLUM.IO의 자가 호스팅 버전을 설치할 수 있습니다.
:::

## 1. 서비스에 가입하거나 로그인하기 {#1-sign-up-or-sign-in-to-the-service}

  먼저, 이메일을 사용하여 TABLUM.IO에 가입하거나 Google이나 Facebook 계정을 통해 빠른 로그인을 사용하세요.

<Image img={tablum_ch_0} size="md" border alt="TABLUM.IO 로그인 페이지" />

## 2. ClickHouse 커넥터 추가하기 {#2-add-a-clickhouse-connector}

ClickHouse 연결 세부정보를 수집하고 **커넥터** 탭으로 이동하여 호스트 URL, 포트, 사용자 이름, 비밀번호, 데이터베이스 이름, 커넥터 이름을 입력합니다. 이러한 필드를 모두 완료한 후 **연결 테스트** 버튼을 클릭하여 세부정보를 확인하고 **나를 위한 커넥터 저장**을 클릭하여 영구적으로 저장합니다.

:::tip
정확한 **HTTP** 포트를 지정하고 연결 세부정보에 따라 **SSL** 모드를 전환하는 것을 확실히 하세요.
:::

:::tip
일반적으로, 포트는 TLS를 사용할 때 8443이고, TLS를 사용하지 않을 때는 8123입니다.
:::

<Image img={tablum_ch_1} size="lg" border alt="TABLUM.IO에 ClickHouse 커넥터 추가하기" />

## 3. 커넥터 선택하기 {#3-select-the-connector}

**데이터셋** 탭으로 이동합니다. 드롭다운에서 최근에 생성한 ClickHouse 커넥터를 선택합니다. 오른쪽 패널에서는 사용 가능한 테이블과 스키마 목록을 볼 수 있습니다.

<Image img={tablum_ch_2} size="lg" border alt="TABLUM.IO에서 ClickHouse 커넥터 선택하기" />

## 4. SQL 쿼리 입력 및 실행하기 {#4-input-a-sql-query-and-run-it}

SQL 콘솔에 쿼리를 입력하고 **쿼리 실행**을 누릅니다. 결과는 스프레드시트로 표시됩니다.

:::tip
컬럼 이름을 오른쪽 클릭하여 정렬, 필터 및 기타 작업이 포함된 드롭다운 메뉴를 여세요.
:::

<Image img={tablum_ch_3} size="lg" border alt="TABLUM.IO에서 SQL 쿼리 실행하기" />

:::note
TABLUM.IO를 사용하면
* TABLUM.IO 계정 내에서 여러 ClickHouse 커넥터를 생성하고 활용할 수 있습니다.
* 데이터 소스에 관계없이 로드된 데이터에 대해 쿼리를 실행할 수 있습니다.
* 결과를 새로운 ClickHouse 데이터베이스로 공유할 수 있습니다.
:::

## 더 알아보기 {#learn-more}

TABLUM.IO에 대한 자세한 정보는 https://tablum.io에서 확인하세요.
