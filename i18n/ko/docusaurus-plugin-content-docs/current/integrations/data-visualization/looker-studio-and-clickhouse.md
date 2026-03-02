---
sidebar_label: 'Looker Studio'
slug: /integrations/lookerstudio
keywords: ['clickhouse', 'looker', 'studio', 'connect', 'mysql', 'integrate', 'ui']
description: '이전 명칭이 Google Data Studio인 Looker Studio는 데이터를 맞춤형 정보 보고서와 대시보드로 변환하는 온라인 도구입니다.'
title: 'Looker Studio'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import Image from '@theme/IdealImage';
import MySQLCloudSetup from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_cloud_setup.mdx';
import MySQLOnPremiseSetup from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_clickhouse_mysql_on_premise_setup.mdx';
import looker_studio_01 from '@site/static/images/integrations/data-visualization/looker_studio_01.png';
import looker_studio_02 from '@site/static/images/integrations/data-visualization/looker_studio_02.png';
import looker_studio_03 from '@site/static/images/integrations/data-visualization/looker_studio_03.png';
import looker_studio_04 from '@site/static/images/integrations/data-visualization/looker_studio_04.png';
import looker_studio_05 from '@site/static/images/integrations/data-visualization/looker_studio_05.png';
import looker_studio_06 from '@site/static/images/integrations/data-visualization/looker_studio_06.png';
import looker_studio_enable_mysql from '@site/static/images/integrations/data-visualization/looker_studio_enable_mysql.png';
import looker_studio_mysql_cloud from '@site/static/images/integrations/data-visualization/looker_studio_mysql_cloud.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Looker Studio \{#looker-studio\}

<PartnerBadge/>

Looker Studio는 공식 Google MySQL 데이터 소스를 통해 MySQL 인터페이스로 ClickHouse에 연결할 수 있습니다.

## ClickHouse Cloud 설정 \{#clickhouse-cloud-setup\}

<MySQLCloudSetup />

## 온프레미스 ClickHouse 서버 설정 \{#on-premise-clickhouse-server-setup\}

<MySQLOnPremiseSetup />

## Looker Studio를 ClickHouse에 연결하기 \{#connecting-looker-studio-to-clickhouse\}

먼저 Google 계정으로 https://lookerstudio.google.com 에 로그인한 후 새 데이터 소스를 생성합니다:

<Image size="md" img={looker_studio_01} alt="Looker Studio 인터페이스에서 새 데이터 소스를 생성하는 화면" border />

<br/>

Google에서 제공하는 공식 MySQL 커넥터(이름은 **MySQL**로 표시됨)를 검색합니다:

<Image size="md" img={looker_studio_02} alt="Looker Studio 커넥터 목록에서 MySQL 커넥터를 검색하는 화면" border />

<br/>

연결 정보를 입력합니다. MySQL 인터페이스 포트는 기본적으로 9004이며,
서버 구성에 따라 다를 수 있습니다.

<Image size="md" img={looker_studio_03} alt="Looker Studio에서 ClickHouse MySQL 연결 정보를 입력하는 화면" border />

<br/>

이제 ClickHouse에서 데이터를 가져오는 방법은 두 가지입니다. 먼저, Table Browser 기능을 사용할 수 있습니다:

<Image size="md" img={looker_studio_04} alt="Looker Studio에서 Table Browser를 사용하여 ClickHouse 테이블을 선택하는 화면" border />

<br/>

또는 사용자 정의 쿼리를 지정하여 데이터를 가져올 수도 있습니다:

<Image size="md" img={looker_studio_05} alt="Looker Studio에서 사용자 정의 SQL 쿼리를 사용하여 ClickHouse에서 데이터를 가져오는 화면" border />

<br/>

마지막으로, 자동으로 분석된 테이블 구조를 확인하고 필요하다면 데이터 타입을 조정할 수 있습니다.

<Image size="md" img={looker_studio_06} alt="Looker Studio에서 분석된 ClickHouse 테이블 구조를 확인하는 화면" border />

<br/>

이제 데이터를 탐색하거나 새 보고서를 생성할 수 있습니다!

## ClickHouse Cloud에서 Looker Studio 사용하기 \{#using-looker-studio-with-clickhouse-cloud\}

ClickHouse Cloud를 사용할 때는 먼저 MySQL 인터페이스를 활성화해야 합니다. 연결 대화 상자의 「MySQL」 탭에서 활성화할 수 있습니다.

<Image size="md" img={looker_studio_enable_mysql} alt="ClickHouse Cloud 설정에서 MySQL 인터페이스 활성화" border />

<br/>

Looker Studio UI에서 「Enable SSL」 옵션을 선택합니다. ClickHouse Cloud의 SSL 인증서는 [Let's Encrypt](https://letsencrypt.org/certificates/)에서 서명한 것입니다. 이 루트 인증서는 [여기](https://letsencrypt.org/certs/isrgrootx1.pem)에서 다운로드할 수 있습니다.

<Image size="md" img={looker_studio_mysql_cloud} alt="ClickHouse Cloud SSL 설정으로 Looker Studio 연결 구성" border />

<br/>

나머지 단계는 바로 앞의 섹션에서 설명한 단계와 동일합니다.