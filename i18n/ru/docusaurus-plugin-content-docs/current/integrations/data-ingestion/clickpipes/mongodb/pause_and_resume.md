---
title: 'Приостановка и возобновление MongoDB ClickPipe'
description: 'Приостановка и возобновление MongoDB ClickPipe'
sidebar_label: 'Приостановка таблицы'
slug: /integrations/clickpipes/mongodb/pause_and_resume
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
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

Существуют сценарии, когда полезно приостановить MongoDB ClickPipe. Например, вам может понадобиться проанализировать имеющиеся данные в неизменном виде. Или вы можете выполнять обновления MongoDB. Ниже описано, как можно приостановить и возобновить работу MongoDB ClickPipe.

## Как приостановить MongoDB ClickPipe \\{#pause-clickpipe-steps\\}

1. На вкладке Data Sources выберите MongoDB ClickPipe, который вы хотите приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size="md"/>

4. Появится диалоговое окно подтверждения. Нажмите **Pause** еще раз.

<Image img={pause_dialog} border size="md"/>

4. Перейдите на вкладку **Metrics**.
5. Дождитесь, пока статус конвейера не станет **Paused**.

<Image img={pause_status} border size="md"/>

## Шаги по возобновлению работы MongoDB ClickPipe \\{#resume-clickpipe-steps\\}

1. На вкладке **Data Sources** нажмите на MongoDB ClickPipe, который нужно возобновить. Статус зеркала изначально должен быть **Paused**.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size="md"/>

4. Появится диалоговое окно подтверждения. Нажмите **Resume** ещё раз.

<Image img={resume_dialog} border size="md"/>

5. Перейдите на вкладку **Metrics**.
6. Дождитесь, пока статус ClickPipe изменится на **Running**.