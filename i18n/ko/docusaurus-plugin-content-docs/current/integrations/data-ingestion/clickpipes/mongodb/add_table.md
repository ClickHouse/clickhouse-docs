---
title: 'ClickPipe에 특정 테이블 추가하기'
description: 'ClickPipe에 특정 테이블을 추가하는 데 필요한 단계를 설명합니다.'
sidebar_label: '테이블 추가'
slug: /integrations/clickpipes/mongodb/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# ClickPipe에 특정 테이블 추가하기 \{#adding-specific-tables-to-a-clickpipe\}

특정 테이블을 ClickPipe에 추가하는 것이 유용한 경우가 있습니다. 트랜잭션 워크로드나 분석 워크로드가 확장될수록 이는 일반적인 요구 사항이 됩니다.

## ClickPipe에 특정 테이블을 추가하는 단계 \{#add-tables-steps\}

다음 단계로 수행합니다.

1. 파이프를 [일시 중지](./pause_and_resume.md)합니다.
2. 「Edit Table settings」를 클릭합니다.
3. 검색 창에서 테이블을 검색하여 원하는 테이블을 찾습니다.
4. 체크박스를 클릭하여 테이블을 선택합니다.

<br/>

<Image img={add_table} border size="md"/>

5. 「Update」를 클릭합니다.
6. 업데이트가 완료되면 파이프의 상태는 순서대로 `Setup`, `Snapshot`, `Running`이 됩니다. 테이블의 초기 적재는 **Tables** 탭에서 모니터링할 수 있습니다.

:::info
기존 테이블에 대한 CDC는 새 테이블의 스냅샷이 완료된 후 자동으로 다시 시작됩니다.
:::