---
title: 'Приостановка и возобновление ClickPipe для MySQL'
description: 'Приостановка и возобновление ClickPipe для MySQL'
sidebar_label: 'Пауза таблицы'
slug: /integrations/clickpipes/mysql/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

В некоторых случаях может быть полезно приостановить MySQL ClickPipe. Например, вы можете захотеть выполнить аналитику по существующим данным в статичном состоянии. Или, возможно, вы выполняете обновление MySQL. Ниже описано, как можно приостанавливать и возобновлять MySQL ClickPipe.


## Шаги для приостановки MySQL ClickPipe {#pause-clickpipe-steps}

1. На вкладке Data Sources нажмите на MySQL ClickPipe, который необходимо приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size='md' />

4. Появится диалоговое окно подтверждения. Нажмите Pause ещё раз.

<Image img={pause_dialog} border size='md' />

4. Перейдите на вкладку **Metrics**.
5. Примерно через 5 секунд (а также при обновлении страницы) статус конвейера изменится на **Paused**.

<Image img={pause_status} border size='md' />


## Шаги для возобновления MySQL ClickPipe {#resume-clickpipe-steps}

1. На вкладке Data Sources нажмите на MySQL ClickPipe, который необходимо возобновить. Изначально статус должен быть **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size='md' />

4. Появится диалоговое окно подтверждения. Нажмите Resume ещё раз.

<Image img={resume_dialog} border size='md' />

5. Перейдите на вкладку **Metrics**.
6. Примерно через 5 секунд (а также при обновлении страницы) статус должен измениться на **Running**.
