---
'title': 'ClickPipe에 특정 테이블 추가하기'
'description': 'ClickPipe에 특정 테이블을 추가하는 단계에 대해 설명합니다.'
'sidebar_label': '테이블 추가'
'slug': '/integrations/clickpipes/mysql/add_table'
'show_title': false
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# ClickPipe에 특정 테이블 추가하기

특정 테이블을 파이프에 추가하는 것이 유용한 경우가 있습니다. 이는 트랜잭션 또는 분석 워크로드가 확장됨에 따라 일반적인 필요가 됩니다.

## ClickPipe에 특정 테이블을 추가하는 단계 {#add-tables-steps}

다음 단계로 이 작업을 수행할 수 있습니다:
1. [파이프 일시 중지](./pause_and_resume.md) 방법.
2. 테이블 설정 편집을 클릭합니다.
3. 테이블을 찾습니다 - 검색창에서 검색하여 찾을 수 있습니다.
4. 체크박스를 클릭하여 테이블을 선택합니다.
<br/>
<Image img={add_table} border size="md"/>

5. 업데이트를 클릭합니다.
6. 업데이트가 성공적으로 완료되면, 파이프는 `Setup`, `Snapshot`, `Running`의 상태를 가지게 됩니다. 테이블의 초기 로드는 **Tables** 탭에서 추적할 수 있습니다.

:::info
기존 테이블에 대한 CDC는 새 테이블의 스냅샷이 완료된 후 자동으로 재개됩니다.
:::
