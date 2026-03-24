---
title: 'MongoDB ClickPipe 일시 중지 및 재개'
description: 'MongoDB ClickPipe 일시 중지 및 재개'
sidebar_label: '테이블 일시 중지'
slug: /integrations/clickpipes/mongodb/pause_and_resume
doc_type: 'guide'
keywords: ['ClickPipes', 'MongoDB', 'CDC', '데이터 수집', '실시간 동기화']
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

MongoDB ClickPipe를 일시 중지하는 것이 유용한 경우가 있습니다. 예를 들어, 기존 데이터를 정적인 상태로 유지한 채 일부 분석을 실행해야 할 수 있습니다. 또는 MongoDB 업그레이드를 수행 중일 수도 있습니다. 다음은 MongoDB ClickPipe를 일시 중지하고 재개하는 방법입니다.


## MongoDB ClickPipe를 일시 중지하는 단계 \{#pause-clickpipe-steps\}

1. Data Sources 탭에서 일시 중지하려는 MongoDB ClickPipe를 클릭합니다.
2. **Settings** 탭으로 이동합니다.
3. **Pause** 버튼을 클릭합니다.

<Image img={pause_button} border size="md"/>

4. 확인 대화 상자가 표시되면 **Pause**를 다시 클릭합니다.

<Image img={pause_dialog} border size="md"/>

4. **Metrics** 탭으로 이동합니다.
5. ClickPipe의 상태가 **Paused**로 표시될 때까지 기다립니다.

<Image img={pause_status} border size="md"/>

## MongoDB ClickPipe 재개 단계 \{#resume-clickpipe-steps\}

1. **Data Sources** 탭에서 재개하려는 MongoDB ClickPipe를 클릭합니다. 미러 상태는 처음에 **Paused**로 표시됩니다.
2. **Settings** 탭으로 이동합니다.
3. **Resume** 버튼을 클릭합니다.

<Image img={resume_button} border size="md"/>

4. 확인 대화 상자가 표시되면, 다시 **Resume**을 클릭합니다.

<Image img={resume_dialog} border size="md"/>

5. **Metrics** 탭으로 이동합니다.
6. 파이프 상태가 **Running**으로 변경될 때까지 기다립니다.