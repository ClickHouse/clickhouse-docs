---
title: 'Приостановка и возобновление MongoDB ClickPipe'
description: 'Приостановка и возобновление MongoDB ClickPipe'
sidebar_label: 'Приостановка таблицы'
slug: /integrations/clickpipes/mongodb/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

Существуют сценарии, когда бывает полезно приостановить MongoDB ClickPipe. Например, вам может понадобиться запустить аналитику по существующим данным в неизменяемом состоянии. Или вы можете выполнять обновление MongoDB. Ниже описано, как приостановить и возобновить MongoDB ClickPipe.


## Шаги для приостановки MongoDB ClickPipe {#pause-clickpipe-steps}

1. На вкладке Data Sources выберите MongoDB ClickPipe, который необходимо приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size='md' />

4. Появится диалоговое окно подтверждения. Нажмите Pause ещё раз.

<Image img={pause_dialog} border size='md' />

4. Перейдите на вкладку **Metrics**.
5. Дождитесь изменения статуса конвейера на **Paused**.

<Image img={pause_status} border size='md' />


## Шаги для возобновления MongoDB ClickPipe {#resume-clickpipe-steps}

1. На вкладке Data Sources выберите MongoDB ClickPipe, который необходимо возобновить. Изначально статус должен быть **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size='md' />

4. Появится диалоговое окно подтверждения. Нажмите Resume ещё раз.

<Image img={resume_dialog} border size='md' />

5. Перейдите на вкладку **Metrics**.
6. Дождитесь, пока статус канала изменится на **Running**.
