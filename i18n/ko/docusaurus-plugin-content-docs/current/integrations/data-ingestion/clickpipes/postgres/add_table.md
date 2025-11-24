---
'title': 'ClickPipe에 특정 테이블 추가하기'
'description': 'ClickPipe에 특정 테이블을 추가하는 데 필요한 단계를 설명합니다.'
'sidebar_label': '테이블 추가'
'slug': '/integrations/clickpipes/postgres/add_table'
'show_title': false
'keywords':
- 'clickpipes postgres'
- 'add table'
- 'table configuration'
- 'initial load'
- 'snapshot'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# ClickPipe에 특정 테이블 추가하기

파이프에 특정 테이블을 추가하는 것이 유용한 시나리오가 있습니다. 이는 트랜잭셔널 또는 분석 작업 부하가 확장됨에 따라 공통적인 필요가 됩니다.

## ClickPipe에 특정 테이블 추가하는 단계 {#add-tables-steps}

다음 단계로 진행할 수 있습니다:
1. [일시 중지](./pause_and_resume.md) 파이프를 선택합니다.
2. 테이블 설정 편집을 클릭합니다.
3. 테이블을 찾습니다 - 검색창에 입력하여 찾을 수 있습니다.
4. 체크박스를 클릭하여 테이블을 선택합니다.
<br/>
<Image img={add_table} border size="md"/>

5. 업데이트를 클릭합니다.
6. 업데이트에 성공하면, 파이프는 순서대로 `Setup`, `Snapshot`, `Running` 상태를 갖게 됩니다. 테이블의 초기 로드는 **Tables** 탭에서 추적할 수 있습니다.

:::info
기존 테이블에 대한 CDC는 새로운 테이블의 스냅샷이 완료된 후 자동으로 재개됩니다.
:::
