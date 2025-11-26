---
title: 'Приостановка и возобновление ClickPipe для Postgres'
description: 'Приостановка и возобновление ClickPipe для Postgres'
sidebar_label: 'Приостановка таблицы'
slug: /integrations/clickpipes/postgres/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

В некоторых сценариях может быть полезно приостановить Postgres ClickPipe. Например, вы можете захотеть выполнить анализ существующих данных в неизменном состоянии. Или же вы можете проводить обновление Postgres. Ниже описано, как приостановить и возобновить Postgres ClickPipe.


## Шаги по приостановке Postgres ClickPipe {#pause-clickpipe-steps}

1. На вкладке **Data Sources** нажмите на Postgres ClickPipe, который вы хотите приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size="md"/>

4. Появится диалоговое окно для подтверждения. Снова нажмите Pause.

<Image img={pause_dialog} border size="md"/>

4. Перейдите на вкладку **Metrics**.
5. Примерно через 5 секунд (а также после обновления страницы) статус ClickPipe должен измениться на **Paused**.

:::warning
Приостановка Postgres ClickPipe не останавливает рост replication slots.
:::

<Image img={pause_status} border size="md"/>



## Шаги по возобновлению работы Postgres ClickPipe {#resume-clickpipe-steps}
1. На вкладке Data Sources нажмите на Postgres ClickPipe, работу которого вы хотите возобновить. Статус зеркала изначально должен быть **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size="md"/>

4. Появится диалоговое окно для подтверждения. Нажмите **Resume** ещё раз.

<Image img={resume_dialog} border size="md"/>

5. Перейдите на вкладку **Metrics**.
6. Примерно через 5 секунд (а также после обновления страницы) статус ClickPipe должен стать **Running**.
