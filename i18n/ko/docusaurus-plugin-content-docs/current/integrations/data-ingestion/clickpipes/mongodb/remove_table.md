---
title: 'ClickPipe에서 특정 테이블 제거하기'
description: 'ClickPipe에서 특정 테이블 제거하기'
sidebar_label: '테이블 제거'
slug: /integrations/clickpipes/mongodb/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

특정 테이블을 MongoDB ClickPipe에서 제외하는 것이 더 적절한 경우도 있습니다. 예를 들어, 어떤 테이블이 분석 워크로드에 필요하지 않다면 이를 생략해 ClickHouse에서 발생하는 스토리지 및 복제 비용을 줄일 수 있습니다.


## 특정 테이블을 제거하는 단계 \{#remove-tables-steps\}

첫 단계는 파이프에서 테이블을 제거하는 것입니다. 다음 단계를 순서대로 수행합니다.

1. 파이프를 [일시 중지](./pause_and_resume.md)합니다.
2. "Edit Table Settings"를 클릭합니다.
3. 검색 창에서 검색하여 대상 테이블을 찾습니다.
4. 선택된 체크박스를 클릭하여 테이블 선택을 해제합니다.

<br/>

<Image img={remove_table} border size="md"/>

5. "Update"를 클릭합니다.
6. 성공적으로 업데이트되면 **Metrics** 탭에서 상태가 **Running**으로 표시됩니다. 이 테이블은 더 이상 이 ClickPipe에 의해 복제되지 않습니다.