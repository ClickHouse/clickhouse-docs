---
title: 'Приостановка и возобновление Postgres ClickPipe'
description: 'Приостановка и возобновление Postgres ClickPipe'
sidebar_label: 'Приостановка таблицы'
slug: /integrations/clickpipes/postgres/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
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

Есть сценарии, в которых полезно приостановить Postgres ClickPipe. Например, вам может потребоваться выполнить аналитические запросы по существующим данным в статическом состоянии. Или вы можете выполнять обновление Postgres. Ниже описано, как приостановить и возобновить Postgres ClickPipe.


## Шаги по приостановке Postgres ClickPipe \{#pause-clickpipe-steps\}

1. На вкладке Data Sources нажмите на Postgres ClickPipe, который вы хотите приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size="md"/>

4. Для подтверждения должно появиться диалоговое окно. Нажмите **Pause** ещё раз.

<Image img={pause_dialog} border size="md"/>

4. Перейдите на вкладку **Metrics**.
5. Примерно через 5 секунд (а также после обновления страницы) статус ClickPipe должен стать **Paused**.

:::warning
Приостановка Postgres ClickPipe не приостанавливает рост слотов репликации.
:::

<Image img={pause_status} border size="md"/>

## Шаги по возобновлению Postgres ClickPipe \{#resume-clickpipe-steps\}

1. На вкладке **Data Sources** нажмите на Postgres ClickPipe, который нужно возобновить. Статус зеркала изначально должен быть **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size="md"/>

4. Появится диалоговое окно подтверждения. Нажмите **Resume** ещё раз.

<Image img={resume_dialog} border size="md"/>

5. Перейдите на вкладку **Metrics**.
6. Примерно через 5 секунд (а также после обновления страницы) статус ClickPipe должен измениться на **Running**.