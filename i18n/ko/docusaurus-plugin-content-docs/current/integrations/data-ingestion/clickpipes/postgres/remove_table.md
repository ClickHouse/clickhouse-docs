---
title: 'ClickPipe에서 특정 테이블 제거'
description: 'ClickPipe에서 특정 테이블 제거'
sidebar_label: '테이블 제거'
slug: /integrations/clickpipes/postgres/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

일부 경우에는 Postgres ClickPipe에서 특정 테이블을 제외하는 것이 합리적입니다. 예를 들어, 특정 테이블이 분석 워크로드에 필요하지 않다면 해당 테이블을 제외하여 ClickHouse에서 스토리지 및 복제 비용을 절감할 수 있습니다.


## 특정 테이블을 제거하는 단계 \{#remove-tables-steps\}

첫 번째 단계는 파이프에서 테이블을 제거하는 것입니다. 다음 단계에 따라 수행합니다.

1. 파이프를 [일시 중지](./pause_and_resume.md)합니다.
2. 「Edit Table Settings」를 클릭합니다.
3. 검색 창에서 테이블을 검색하여 대상 테이블을 찾습니다.
4. 선택된 체크박스를 클릭하여 테이블 선택을 해제합니다.

<br/>

<Image img={remove_table} border size="md"/>

5. 「Update」를 클릭합니다.
6. 업데이트가 완료되면 **Metrics** 탭에서 상태가 **Running**으로 표시됩니다. 이 테이블은 더 이상 이 ClickPipe에 의해 복제되지 않습니다.