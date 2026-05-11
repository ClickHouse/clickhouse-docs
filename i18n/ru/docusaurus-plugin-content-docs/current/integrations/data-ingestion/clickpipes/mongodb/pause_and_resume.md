---
title: 'Приостановка и возобновление ClickPipe для MongoDB'
description: 'Приостановка и возобновление ClickPipe для MongoDB'
sidebar_label: 'Приостановка таблицы'
slug: /integrations/clickpipes/mongodb/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
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

В некоторых случаях бывает полезно приостановить ClickPipe для MongoDB. Например, если нужно выполнить аналитику на уже имеющихся данных в неизменном состоянии. Или если вы проводите обновление MongoDB. Вот как приостановить и затем возобновить ClickPipe для MongoDB.

## Как приостановить ClickPipe для MongoDB \{#pause-clickpipe-steps\}

1. На вкладке Data Sources выберите ClickPipe для MongoDB, который нужно приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size="md" />

4. Появится диалоговое окно подтверждения. Нажмите **Pause** еще раз.

<Image img={pause_dialog} border size="md" />

4. Перейдите на вкладку **Metrics**.
5. Подождите, пока статус ClickPipe не изменится на **Paused**.

<Image img={pause_status} border size="md" />

## Как возобновить ClickPipe для MongoDB \{#resume-clickpipe-steps\}

1. На вкладке Data Sources нажмите на ClickPipe для MongoDB, которую нужно возобновить. Изначально у зеркала должен быть статус **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size="md" />

4. Должно открыться диалоговое окно подтверждения. Ещё раз нажмите Resume.

<Image img={resume_dialog} border size="md" />

5. Перейдите на вкладку **Metrics**.
6. Дождитесь, пока статус ClickPipe не станет **Running**.