---
sidebar_label: 'Fabi.ai'
slug: /integrations/fabi.ai
keywords: ['clickhouse', 'Fabi.ai', '연결', '통합', '노트북', 'ui', '분석']
description: 'Fabi.ai는 올인원 협업형 데이터 분석 플랫폼입니다. SQL, Python, AI 및 노코드 방식을 활용하여 그 어느 때보다 빠르게 대시보드와 데이터 워크플로를 구축할 수 있습니다.'
title: 'ClickHouse를 Fabi.ai에 연결하기'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import fabi_01 from '@site/static/images/integrations/data-visualization/fabi_01.png';
import fabi_02 from '@site/static/images/integrations/data-visualization/fabi_02.png';
import fabi_03 from '@site/static/images/integrations/data-visualization/fabi_03.png';
import fabi_04 from '@site/static/images/integrations/data-visualization/fabi_04.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse를 Fabi.ai에 연결하기 \{#connecting-clickhouse-to-fabiai\}

<CommunityMaintainedBadge/>

<a href="https://www.fabi.ai/" target="_blank">Fabi.ai</a>는 올인원 협업형 데이터 분석 플랫폼입니다. SQL, Python, AI, 그리고 노코드(no-code)를 활용하여 그 어느 때보다 빠르게 대시보드와 데이터 워크플로를 구축할 수 있습니다. ClickHouse의 확장성과 강력한 성능을 함께 활용하면, 방대한 데이터셋에 대해 고성능 대시보드를 몇 분 만에 구축하고 공유할 수 있습니다.

<Image size="md" img={fabi_01} alt="Fabi.ai 데이터 탐색 및 워크플로 플랫폼" border />

## 연결 정보 준비 \{#gather-your-connection-details\}

<ConnectionDetails />

## Fabi.ai 계정을 생성하고 ClickHouse 연결하기 \{#connect-to-clickhouse\}

다음 링크에서 Fabi.ai 계정에 로그인하거나 새로 생성합니다: https://app.fabi.ai/

1. 계정을 처음 생성할 때 데이터베이스를 연결하라는 안내가 표시됩니다. 이미 계정이 있는 경우 Smartbook 화면의 왼쪽에 있는 data source 패널을 클릭한 후 「Add Data Source」를 선택합니다.
   
   <Image size="lg" img={fabi_02} alt="데이터 소스 추가" border />

2. 그러면 연결 정보를 입력하는 화면이 표시됩니다.

   <Image size="md" img={fabi_03} alt="ClickHouse 자격 증명 입력 양식" border />

3. 완료되었습니다. 이제 ClickHouse가 Fabi.ai에 성공적으로 통합되었습니다.

## ClickHouse 쿼리하기 \{#querying-clickhouse\}

Fabi.ai를 ClickHouse에 연결한 후, 원하는 [Smartbook](https://docs.fabi.ai/analysis_and_reporting/smartbooks)으로 이동하여 SQL 셀을 생성합니다. Fabi.ai 인스턴스에 하나의 데이터 소스만 연결되어 있는 경우 SQL 셀의 기본 데이터 소스로 ClickHouse가 자동 선택되며, 여러 데이터 소스가 연결되어 있는 경우에는 소스 드롭다운에서 쿼리를 실행할 소스를 선택할 수 있습니다.

<Image size="lg" img={fabi_04} alt="ClickHouse 쿼리하기" border />

## 추가 리소스 \{#additional-resources\}

[Fabi.ai](https://www.fabi.ai) 문서: https://docs.fabi.ai/introduction

[Fabi.ai](https://www.fabi.ai) 입문 튜토리얼 영상: https://www.youtube.com/playlist?list=PLjxPRVnyBCQXxxByw2CLC0q7c-Aw6t2nl