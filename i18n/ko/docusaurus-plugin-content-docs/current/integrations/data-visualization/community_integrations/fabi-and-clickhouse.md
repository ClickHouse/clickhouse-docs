---
'sidebar_label': 'Fabi.ai'
'slug': '/integrations/fabi.ai'
'keywords':
- 'clickhouse'
- 'Fabi.ai'
- 'connect'
- 'integrate'
- 'notebook'
- 'ui'
- 'analytics'
'description': 'Fabi.ai는 올인원 협업 데이터 분석 플랫폼입니다. SQL, Python, AI 및 코드 없이 대시보드 및 데이터
  워크플로를 그 어느 때보다 빠르게 구축할 수 있습니다.'
'title': 'Connect ClickHouse to Fabi.ai'
'doc_type': 'guide'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse를 Fabi.ai에 연결하기

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a>는 올인원 협업 데이터 분석 플랫폼입니다. SQL, Python, AI 및 노코드를 활용하여 대시보드와 데이터 워크플로를 그 어느 때보다 빠르게 구축할 수 있습니다. ClickHouse의 규모와 성능을 결합하여 대규모 데이터 세트에서 고성능 대시보드를 몇 분 만에 구축하고 공유할 수 있습니다.

<Image size="md" img={fabi_01} alt="Fabi.ai 데이터 탐색 및 워크플로 플랫폼" border />

## 연결 세부정보 수집하기 {#gather-your-connection-details}

<ConnectionDetails />

## Fabi.ai 계정 생성 및 ClickHouse 연결하기 {#connect-to-clickhouse}

Fabi.ai 계정에 로그인하거나 생성하세요: https://app.fabi.ai/

1. 계정을 처음 생성할 때 데이터베이스를 연결하라는 메시지가 표시되거나, 이미 계정이 있는 경우, 스마트북의 왼쪽에 있는 데이터 소스 패널을 클릭하고 데이터 소스 추가를 선택하세요.
   
   <Image size="lg" img={fabi_02} alt="데이터 소스 추가" border />

2. 그러면 연결 세부정보를 입력하라는 메시지가 표시됩니다.

   <Image size="md" img={fabi_03} alt="ClickHouse 자격 증명 양식" border />

3. 축하합니다! 이제 ClickHouse가 Fabi.ai에 통합되었습니다.

## ClickHouse 쿼리하기 {#querying-clickhouse}

Fabi.ai를 ClickHouse에 연결한 후, 임의의 [스마트북](https://docs.fabi.ai/analysis_and_reporting/smartbooks)으로 이동하여 SQL 셀을 생성하세요. Fabi.ai 인스턴스에 연결된 데이터 소스가 하나만 있는 경우 SQL 셀은 자동으로 ClickHouse로 기본 설정되며, 그렇지 않은 경우 소스 드롭다운에서 쿼리할 소스를 선택할 수 있습니다.

   <Image size="lg" img={fabi_04} alt="ClickHouse 쿼리하기" border />

## 추가 리소스 {#additional-resources}

[Fabi.ai](https://www.fabi.ai) 문서: https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) 시작하기 튜토리얼 비디오: https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl
