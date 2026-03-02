---
sidebar_label: 'Deepnote'
sidebar_position: 11
slug: /integrations/deepnote
keywords: ['clickhouse', 'Deepnote', '연결', '통합', '노트북']
description: '익숙한 노트북 환경에서 매우 큰 데이터 세트에 효율적으로 쿼리를 실행하고, 분석 및 모델링할 수 있습니다.'
title: 'ClickHouse를 Deepnote에 연결하기'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
  - website: 'https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote'
---

import deepnote_01 from '@site/static/images/integrations/data-visualization/deepnote_01.png';
import deepnote_02 from '@site/static/images/integrations/data-visualization/deepnote_02.png';
import deepnote_03 from '@site/static/images/integrations/data-visualization/deepnote_03.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import ConnectionDetails from '@site/i18n/ko/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# ClickHouse를 Deepnote에 연결하기 \{#connect-clickhouse-to-deepnote\}

<CommunityMaintainedBadge/>

<a href="https://www.deepnote.com/" target="_blank">Deepnote</a>는 팀이 인사이트를 발굴하고 공유할 수 있도록 설계된 협업 데이터 노트북입니다. Jupyter와 호환될 뿐만 아니라 클라우드 환경에서 동작하며, 데이터 사이언스 프로젝트를 효율적으로 공동 작업할 수 있는 중앙 집중형 협업 공간을 제공합니다.

이 가이드는 Deepnote 계정과 실행 중인 ClickHouse 인스턴스를 이미 보유하고 있다고 가정합니다.

## 대화형 예제 \{#interactive-example\}

Deepnote 데이터 노트북에서 ClickHouse에 쿼리하는 대화형 예제를 살펴보고 싶다면, 아래 버튼을 클릭하여 [ClickHouse playground](../../../getting-started/playground.md)와 연결된 템플릿 프로젝트를 실행하십시오.

[<Image size="logo" img="https://deepnote.com/buttons/launch-in-deepnote.svg" alt="Deepnote에서 실행" />](https://deepnote.com/launch?template=ClickHouse%20and%20Deepnote)

## ClickHouse에 연결하기 \{#connect-to-clickhouse\}

1. Deepnote에서 "Integrations" 개요 페이지를 선택한 다음 ClickHouse 타일을 클릭합니다.

<Image size="lg" img={deepnote_01} alt="ClickHouse 통합 타일" border />

2. ClickHouse 인스턴스에 대한 연결 정보를 입력합니다:

<ConnectionDetails />

<Image size="md" img={deepnote_02} alt="ClickHouse 세부 정보 대화 상자" border />

**_참고:_** ClickHouse에 대한 연결이 IP Access List로 보호되어 있는 경우 Deepnote의 IP 주소를 허용해야 할 수 있습니다. 자세한 내용은 [Deepnote 문서](https://docs.deepnote.com/integrations/authorize-connections-from-deepnote-ip-addresses)를 참조하십시오.

3. 축하합니다! 이제 Deepnote에 ClickHouse 통합이 완료되었습니다.

## ClickHouse 통합 사용하기. \{#using-clickhouse-integration\}

1. 먼저 노트북 오른쪽에 있는 ClickHouse 통합에 연결합니다.

   <Image size="lg" img={deepnote_03} alt="ClickHouse 세부 정보 대화상자" border />

2. 이제 새 ClickHouse 쿼리 블록을 만들어 데이터베이스를 쿼리합니다. 쿼리 결과는 DataFrame으로 저장되고, SQL 블록에서 지정한 변수에 할당됩니다.
3. 기존 [SQL 블록](https://docs.deepnote.com/features/sql-cells)을 ClickHouse 블록으로 변환할 수도 있습니다.