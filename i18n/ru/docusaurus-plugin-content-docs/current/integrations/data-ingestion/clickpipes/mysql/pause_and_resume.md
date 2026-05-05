---
title: 'Приостановка и возобновление ClickPipe для MySQL'
description: 'Приостановка и возобновление ClickPipe для MySQL'
sidebar_label: 'Приостановка таблицы'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'CDC', 'ингестия данных', 'синхронизация в реальном времени']
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

В некоторых случаях бывает полезно приостановить MySQL ClickPipe. Например, может потребоваться выполнить анализ существующих данных в неизменном состоянии. Также это может понадобиться при обновлении MySQL. Ниже описано, как приостановить и возобновить MySQL ClickPipe.

## Как приостановить MySQL ClickPipe \{#pause-clickpipe-steps\}

1. На вкладке Data Sources выберите MySQL ClickPipe, который нужно приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size="md" />

4. Появится диалоговое окно подтверждения. Нажмите **Pause** еще раз.

<Image img={pause_dialog} border size="md" />

4. Перейдите на вкладку **Metrics**.
5. Примерно через 5 секунд (а также после обновления страницы) статус канала должен измениться на **Paused**.

<Image img={pause_status} border size="md" />

## Как возобновить MySQL ClickPipe \{#resume-clickpipe-steps\}

1. На вкладке Data Sources выберите MySQL ClickPipe, который нужно возобновить. Изначально статус зеркала должен быть **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size="md" />

4. Появится диалоговое окно подтверждения. Нажмите **Resume** ещё раз.

<Image img={resume_dialog} border size="md" />

5. Перейдите на вкладку **Metrics**.
6. Примерно через 5 секунд (а также после обновления страницы) статус канала должен стать **Running**.