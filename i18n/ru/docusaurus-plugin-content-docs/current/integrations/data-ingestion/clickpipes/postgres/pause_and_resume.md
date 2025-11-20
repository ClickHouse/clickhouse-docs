---
title: 'Приостановка и возобновление ClickPipe для Postgres'
description: 'Приостановка и возобновление ClickPipe для Postgres'
sidebar_label: 'Приостановить таблицу'
slug: /integrations/clickpipes/postgres/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

В некоторых случаях бывает полезно приостановить Postgres ClickPipe. Например, вам может понадобиться запустить аналитику по уже имеющимся данным в неизменяемом состоянии. Или вы можете выполнять обновление Postgres. Ниже описано, как можно приостанавливать и возобновлять Postgres ClickPipe.


## Шаги для приостановки Postgres ClickPipe {#pause-clickpipe-steps}

1. На вкладке Data Sources выберите Postgres ClickPipe, который необходимо приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size='md' />

4. Появится диалоговое окно подтверждения. Нажмите Pause ещё раз.

<Image img={pause_dialog} border size='md' />

4. Перейдите на вкладку **Metrics**.
5. Примерно через 5 секунд (а также при обновлении страницы) статус конвейера изменится на **Paused**.

:::warning
Приостановка Postgres ClickPipe не приостанавливает рост слотов репликации.
:::

<Image img={pause_status} border size='md' />


## Шаги для возобновления Postgres ClickPipe {#resume-clickpipe-steps}

1. На вкладке Data Sources нажмите на Postgres ClickPipe, который необходимо возобновить. Изначально статус должен быть **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size='md' />

4. Появится диалоговое окно подтверждения. Нажмите Resume ещё раз.

<Image img={resume_dialog} border size='md' />

5. Перейдите на вкладку **Metrics**.
6. Примерно через 5 секунд (а также при обновлении страницы) статус должен измениться на **Running**.
