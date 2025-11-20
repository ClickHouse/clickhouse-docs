---
'title': 'ClickPipe에서 특정 테이블 제거'
'description': 'ClickPipe에서 특정 테이블 제거'
'sidebar_label': '테이블 제거'
'slug': '/integrations/clickpipes/postgres/removing_tables'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

In some cases, it makes sense to exclude specific tables from a Postgres ClickPipe - for example, if a table isn't needed for your analytics workload, skipping it can reduce storage and replication costs in ClickHouse.

## 특정 테이블 제거 단계 {#remove-tables-steps}

첫 번째 단계는 파이프에서 테이블을 제거하는 것입니다. 이는 다음의 단계로 수행할 수 있습니다.

1. [일시 중지](./pause_and_resume.md) 파이프.
2. 테이블 설정 편집을 클릭합니다.
3. 테이블을 찾습니다 - 이는 검색창에서 검색하여 수행할 수 있습니다.
4. 선택된 확인란을 클릭하여 테이블의 선택을 해제합니다.
<br/>

<Image img={remove_table} border size="md"/>

5. 업데이트를 클릭합니다.
6. 업데이트가 성공적으로 완료되면, **메트릭** 탭에서 상태가 **실행 중**으로 표시됩니다. 이 테이블은 더 이상 이 ClickPipe에 의해 복제되지 않습니다.
