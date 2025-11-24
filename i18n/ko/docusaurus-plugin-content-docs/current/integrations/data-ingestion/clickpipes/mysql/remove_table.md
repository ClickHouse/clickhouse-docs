---
'title': 'ClickPipe에서 특정 테이블 제거'
'description': 'ClickPipe에서 특정 테이블 제거'
'sidebar_label': '테이블 제거'
'slug': '/integrations/clickpipes/mysql/removing_tables'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

일부 경우, 특정 테이블을 MySQL ClickPipe에서 제외하는 것이 의미가 있습니다. 예를 들어, 분석 작업에 필요하지 않은 테이블을 건너뛰면 ClickHouse에서 저장소 및 복제 비용을 줄일 수 있습니다.

## 특정 테이블 제거 단계 {#remove-tables-steps}

첫 번째 단계는 파이프에서 테이블을 제거하는 것입니다. 다음 단계로 진행할 수 있습니다:

1. [파이프 일시 중지](./pause_and_resume.md)하기.
2. 테이블 설정 편집을 클릭합니다.
3. 검색창에서 테이블을 검색하여 테이블을 찾습니다.
4. 선택된 체크박스를 클릭하여 테이블의 선택을 해제합니다.
<br/>

<Image img={remove_table} border size="md"/>

5. 업데이트를 클릭합니다.
6. 업데이트가 성공적으로 완료되면 **메트릭** 탭에서 상태가 **실행 중**으로 표시됩니다. 이 테이블은 더 이상 이 ClickPipe에 의해 복제되지 않습니다.
