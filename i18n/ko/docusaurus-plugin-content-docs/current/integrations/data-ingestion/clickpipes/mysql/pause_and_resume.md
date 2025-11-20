---
'title': 'MySQL ClickPipe 일시 중단 및 재개'
'description': 'MySQL ClickPipe 일시 중단 및 재개'
'sidebar_label': '테이블 일시 중단'
'slug': '/integrations/clickpipes/mysql/pause_and_resume'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'mysql'
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

MySQL ClickPipe를 일시 중지하는 것이 유용할 수 있는 상황이 있습니다. 예를 들어, 정적 상태의 기존 데이터에 대해 일부 분석을 수행하려고 할 수 있습니다. 또는 MySQL에서 업그레이드를 수행할 수도 있습니다. MySQL ClickPipe를 일시 중지하고 다시 시작하는 방법은 다음과 같습니다.

## MySQL ClickPipe를 일시 중지하는 단계 {#pause-clickpipe-steps}

1. 데이터 소스 탭에서 일시 중지할 MySQL ClickPipe를 클릭합니다.
2. **설정** 탭으로 이동합니다.
3. **일시 중지** 버튼을 클릭합니다.

<Image img={pause_button} border size="md"/>

4. 확인을 위한 대화 상자가 나타나야 합니다. 다시 한 번 일시 중지를 클릭합니다.

<Image img={pause_dialog} border size="md"/>

4. **메트릭** 탭으로 이동합니다.
5. 약 5초 후(페이지 새로 고침 시에도) 파이프의 상태가 **일시 중지** 상태여야 합니다.

<Image img={pause_status} border size="md"/>

## MySQL ClickPipe를 다시 시작하는 단계 {#resume-clickpipe-steps}
1. 데이터 소스 탭에서 다시 시작할 MySQL ClickPipe를 클릭합니다. 미러의 상태는 처음에 **일시 중지**이어야 합니다.
2. **설정** 탭으로 이동합니다.
3. **다시 시작** 버튼을 클릭합니다.

<Image img={resume_button} border size="md"/>

4. 확인을 위한 대화 상자가 나타나야 합니다. 다시 한 번 다시 시작을 클릭합니다.

<Image img={resume_dialog} border size="md"/>

5. **메트릭** 탭으로 이동합니다.
6. 약 5초 후(페이지 새로 고침 시에도) 파이프의 상태가 **실행 중**이어야 합니다.
