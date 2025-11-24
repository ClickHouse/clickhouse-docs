---
'title': 'MongoDB ClickPipe 일시 중지 및 재개'
'description': 'MongoDB ClickPipe 일시 중지 및 재개'
'sidebar_label': '테이블 일시 중지'
'slug': '/integrations/clickpipes/mongodb/pause_and_resume'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mongodb'
- 'cdc'
- 'data ingestion'
- 'real-time sync'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

MongoDB ClickPipe를 일시 중지하는 것이 유용할 수 있는 시나리오가 있습니다. 예를 들어, 정적 상태의 기존 데이터에 대한 분석을 실행하려고 할 수 있습니다. 또는 MongoDB에서 업그레이드를 수행하고 있을 수도 있습니다. MongoDB ClickPipe를 일시 중지하고 다시 시작하는 방법은 다음과 같습니다.

## MongoDB ClickPipe를 일시 중지하는 단계 {#pause-clickpipe-steps}

1. 데이터 소스 탭에서 일시 중지할 MongoDB ClickPipe를 클릭합니다.
2. **설정** 탭으로 이동합니다.
3. **일시 중지** 버튼을 클릭합니다.

<Image img={pause_button} border size="md"/>

4. 확인을 위한 대화 상자가 나타납니다. 다시 일시 중지를 클릭합니다.

<Image img={pause_dialog} border size="md"/>

4. **메트릭** 탭으로 이동합니다.
5. 파이프의 상태가 **일시 중지됨**으로 변경될 때까지 기다립니다.

<Image img={pause_status} border size="md"/>

## MongoDB ClickPipe를 재개하는 단계 {#resume-clickpipe-steps}
1. 데이터 소스 탭에서 재개할 MongoDB ClickPipe를 클릭합니다. 미러의 초기 상태는 **일시 중지됨**이어야 합니다.
2. **설정** 탭으로 이동합니다.
3. **재개** 버튼을 클릭합니다.

<Image img={resume_button} border size="md"/>

4. 확인을 위한 대화 상자가 나타납니다. 다시 재개를 클릭합니다.

<Image img={resume_dialog} border size="md"/>

5. **메트릭** 탭으로 이동합니다.
6. 파이프의 상태가 **실행 중**으로 변경될 때까지 기다립니다.
