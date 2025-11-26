---
title: 'Пауза и возобновление MySQL ClickPipe'
description: 'Пауза и возобновление MySQL ClickPipe'
sidebar_label: 'Пауза таблицы'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

Есть ситуации, когда полезно приостановить MySQL ClickPipe. Например, вы можете захотеть выполнить аналитику по существующим данным в неизменном состоянии. Или вы можете в этот момент обновлять MySQL. Ниже описано, как приостанавливать и возобновлять MySQL ClickPipe.


## Шаги по приостановке MySQL ClickPipe {#pause-clickpipe-steps}

1. На вкладке Data Sources выберите MySQL ClickPipe, который нужно приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size="md"/>

4. Должно появиться диалоговое окно подтверждения. Нажмите **Pause** ещё раз.

<Image img={pause_dialog} border size="md"/>

4. Перейдите на вкладку **Metrics**.
5. Примерно через 5 секунд (а также после обновления страницы) статус ClickPipe должен измениться на **Paused**.

<Image img={pause_status} border size="md"/>



## Шаги по возобновлению работы MySQL ClickPipe {#resume-clickpipe-steps}
1. На вкладке **Data Sources** нажмите на MySQL ClickPipe, который вы хотите возобновить. Статус конвейера изначально должен быть **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите **Resume** ещё раз.

<Image img={resume_dialog} border size="md"/>

5. Перейдите на вкладку **Metrics**.
6. Примерно через 5 секунд (а также при обновлении страницы) статус ClickPipe должен измениться на **Running**.
