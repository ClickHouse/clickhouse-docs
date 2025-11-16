---
'title': 'Postgres ClickPipe 일시 중지 및 재개'
'description': 'Postgres ClickPipe의 일시 중지 및 재개'
'sidebar_label': '테이블 일시 중지'
'slug': '/integrations/clickpipes/postgres/pause_and_resume'
'doc_type': 'guide'
'keywords':
- 'clickpipes'
- 'postgresql'
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

There are scenarios where it would be useful to pause a Postgres ClickPipe. For example, you may want to run some analytics on existing data in a static state. Or, you might be performing upgrades on Postgres. Here is how you can pause and resume a Postgres ClickPipe.

## Steps to pause a Postgres ClickPipe {#pause-clickpipe-steps}

1. In the Data Sources tab, click on the Postgres ClickPipe you wish to pause.
2. Head over to the **Settings** tab.
3. Click on the **Pause** button.

<Image img={pause_button} border size="md"/>

4. A dialog box should appear for confirmation. Click on Pause again.

<Image img={pause_dialog} border size="md"/>

4. Head over to the **Metrics** tab.
5. In around 5 seconds (and also on page refresh), the status of the pipe should be **Paused**.

:::warning
Pausing a Postgres ClickPipe will not pause the growth of replication slots.
:::

<Image img={pause_status} border size="md"/>

## Steps to resume a Postgres ClickPipe {#resume-clickpipe-steps}
1. In the Data Sources tab, click on the Postgres ClickPipe you wish to resume. The status of the mirror should be **Paused** initially.
2. Head over to the **Settings** tab.
3. Click on the **Resume** button.

<Image img={resume_button} border size="md"/>

4. A dialog box should appear for confirmation. Click on Resume again.

<Image img={resume_dialog} border size="md"/>

5. Head over to the **Metrics** tab.
6. In around 5 seconds (and also on page refresh), the status of the pipe should be **Running**.

---

Postgres ClickPipe를 일시 중지하는 것이 유용한 시나리오가 있습니다. 예를 들어, 정적 상태의 기존 데이터에 대해 분석을 수행하고 싶을 수 있습니다. 또는 Postgres에서 업그레이드를 수행 중일 수 있습니다. 다음은 Postgres ClickPipe를 일시 중지하고 다시 시작하는 방법입니다.

## Postgres ClickPipe 일시 중지하는 단계 {#pause-clickpipe-steps}

1. 데이터 소스 탭에서 일시 중지하려는 Postgres ClickPipe를 클릭합니다.
2. **설정** 탭으로 이동합니다.
3. **일시 중지** 버튼을 클릭합니다.

<Image img={pause_button} border size="md"/>

4. 확인을 위한 대화 상자가 나타나야 합니다. 다시 일시 중지를 클릭합니다.

<Image img={pause_dialog} border size="md"/>

4. **메트릭** 탭으로 이동합니다.
5. 약 5초 후(페이지 새로고침 시에도) 파이프의 상태가 **일시 중지됨**이어야 합니다.

:::warning
Postgres ClickPipe를 일시 중지하더라도 복제 슬롯의 증가는 중지되지 않습니다.
:::

<Image img={pause_status} border size="md"/>

## Postgres ClickPipe 다시 시작하는 단계 {#resume-clickpipe-steps}
1. 데이터 소스 탭에서 다시 시작하려는 Postgres ClickPipe를 클릭합니다. 미러의 상태는 초기적으로 **일시 중지됨**이어야 합니다.
2. **설정** 탭으로 이동합니다.
3. **다시 시작** 버튼을 클릭합니다.

<Image img={resume_button} border size="md"/>

4. 확인을 위한 대화 상자가 나타나야 합니다. 다시 다시 시작을 클릭합니다.

<Image img={resume_dialog} border size="md"/>

5. **메트릭** 탭으로 이동합니다.
6. 약 5초 후(페이지 새로고침 시에도) 파이프의 상태가 **실행 중**이어야 합니다.
