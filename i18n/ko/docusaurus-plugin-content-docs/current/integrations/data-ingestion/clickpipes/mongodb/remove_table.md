---
'title': 'ClickPipe에서 특정 테이블 제거하기'
'description': 'ClickPipe에서 특정 테이블 제거하기'
'sidebar_label': '테이블 제거'
'slug': '/integrations/clickpipes/mongodb/removing_tables'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

일부 경우에는 MongoDB ClickPipe에서 특정 테이블을 제외하는 것이 의미가 있습니다. 예를 들어, 분석 워크로드에 필요하지 않은 테이블은 건너뛰면 ClickHouse에서 저장소 및 복제 비용을 줄일 수 있습니다.

## 특정 테이블을 제거하는 단계 {#remove-tables-steps}

첫 번째 단계는 파이프에서 테이블을 제거하는 것입니다. 이는 다음과 같은 단계로 수행할 수 있습니다:

1. [일시 중지](./pause_and_resume.md) 파이프를 클릭합니다.
2. 테이블 설정 편집을 클릭합니다.
3. 검색창에서 테이블을 검색하여 찾아냅니다.
4. 선택된 체크박스를 클릭하여 테이블의 선택을 해제합니다.
<br/>

<Image img={remove_table} border size="md"/>

5. 업데이트를 클릭합니다.
6. 업데이트가 성공적으로 완료되면, **Metrics** 탭에서 상태가 **Running**으로 표시됩니다. 이 테이블은 더 이상 이 ClickPipe에 의해 복제되지 않습니다.
