---
title: 'Postgres ClickPipe 일시 중지 및 재개'
description: 'Postgres ClickPipe 일시 중지 및 재개'
sidebar_label: '테이블 일시 중지'
slug: /integrations/clickpipes/postgres/pause_and_resume
doc_type: 'guide'
keywords: ['ClickPipes', 'postgresql', 'CDC', '데이터 수집', '실시간 동기화']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

Postgres ClickPipe를 일시 중지하는 것이 유용한 상황이 있을 수 있습니다. 예를 들어, 정적인 상태의 기존 데이터에 대해 분석 작업을 수행해야 할 수도 있습니다. 또는 Postgres를 업그레이드하는 작업을 진행 중일 수도 있습니다. 다음은 Postgres ClickPipe를 일시 중지하고 다시 시작하는 방법입니다.


## Postgres ClickPipe를 일시 중지하는 단계 \{#pause-clickpipe-steps\}

1. **Data Sources** 탭에서 일시 중지할 Postgres ClickPipe를 클릭합니다.
2. **Settings** 탭으로 이동합니다.
3. **Pause** 버튼을 클릭합니다.

<Image img={pause_button} border size="md"/>

4. 확인을 위한 대화 상자가 표시됩니다. 다시 **Pause**를 클릭합니다.

<Image img={pause_dialog} border size="md"/>

4. **Metrics** 탭으로 이동합니다.
5. 약 5초 후(또는 페이지를 새로 고친 후) 파이프 상태가 **Paused**로 표시됩니다.

:::warning
Postgres ClickPipe를 일시 중지해도 replication slot의 증가는 중단되지 않습니다.
:::

<Image img={pause_status} border size="md"/>

## Postgres ClickPipe 재개 단계 \{#resume-clickpipe-steps\}

1. Data Sources 탭에서 재개할 Postgres ClickPipe를 클릭합니다. 처음에는 미러의 상태가 **Paused**여야 합니다.
2. **Settings** 탭으로 이동합니다.
3. **Resume** 버튼을 클릭합니다.

<Image img={resume_button} border size="md"/>

4. 확인용 대화 상자가 표시됩니다. **Resume**을 다시 클릭합니다.

<Image img={resume_dialog} border size="md"/>

5. **Metrics** 탭으로 이동합니다.
6. 약 5초 후(또는 페이지를 새로 고침하면) 파이프 상태가 **Running**으로 표시됩니다.