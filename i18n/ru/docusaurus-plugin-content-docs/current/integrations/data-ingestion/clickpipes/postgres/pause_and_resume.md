---
title: 'Приостановка и возобновление Postgres ClickPipe'
description: 'Приостановка и возобновление Postgres ClickPipe'
sidebar_label: 'Приостановить таблицу'
slug: /integrations/clickpipes/postgres/pause_and_resume
---

import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'


Существуют сценарии, в которых полезно приостановить Postgres ClickPipe. Например, вы можете захотеть провести анализ существующих данных в статическом состоянии. Или вы можете проводить обновления Postgres. Вот как вы можете приостановить и возобновить Postgres ClickPipe.

## Шаги для приостановки Postgres ClickPipe {#pause-clickpipe-steps}

1. На вкладке Источники данных нажмите на Postgres ClickPipe, который вы хотите приостановить.
2. Перейдите на вкладку **Настройки**.
3. Нажмите кнопку **Приостановить**.
<br/>

<Image img={pause_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите на Приостановить снова.
<br/>

<Image img={pause_dialog} border size="md"/>

4. Перейдите на вкладку **Метрики**.
5. В течение около 5 секунд (а также при обновлении страницы) статус трубы должен быть **Приостановлено**.
<br/>

<Image img={pause_status} border size="md"/>

## Шаги для возобновления Postgres ClickPipe {#resume-clickpipe-steps}
1. На вкладке Источники данных нажмите на Postgres ClickPipe, который вы хотите возобновить. Статус зеркала должен быть изначально **Приостановлено**.
2. Перейдите на вкладку **Настройки**.
3. Нажмите кнопку **Возобновить**.
<br/>

<Image img={resume_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите на Возобновить снова.
<br/>

<Image img={resume_dialog} border size="md"/>

5. Перейдите на вкладку **Метрики**.
6. В течение около 5 секунд (а также при обновлении страницы) статус трубы должен быть **Работает**.
