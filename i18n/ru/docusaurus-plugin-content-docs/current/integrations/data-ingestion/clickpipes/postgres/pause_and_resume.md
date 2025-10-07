---
slug: '/integrations/clickpipes/postgres/pause_and_resume'
sidebar_label: 'Приостановить таблицу'
description: 'Настройка и Возобновление Postgres ClickPipe'
title: 'Приостановка и возобновление Postgres ClickPipe'
doc_type: guide
---
import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

В некоторых сценариях может быть полезно приостановить Postgres ClickPipe. Например, вы можете захотеть провести аналитику по существующим данным в статичном состоянии. Или вы можете выполнять обновления в Postgres. Вот как вы можете приостановить и возобновить Postgres ClickPipe.

## Шаги для приостановки Postgres ClickPipe {#pause-clickpipe-steps}

1. На вкладке Data Sources нажмите на Postgres ClickPipe, который вы хотите приостановить.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Pause**.

<Image img={pause_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите на Pause снова.

<Image img={pause_dialog} border size="md"/>

4. Перейдите на вкладку **Metrics**.
5. Через примерно 5 секунд (а также после обновления страницы) статус пайпа должен быть **Paused**.

:::warning
Приостановка Postgres ClickPipe не приостановит рост слотов репликации.
:::

<Image img={pause_status} border size="md"/>

## Шаги для возобновления Postgres ClickPipe {#resume-clickpipe-steps}
1. На вкладке Data Sources нажмите на Postgres ClickPipe, который вы хотите возобновить. Статус зеркала должен быть **Paused** изначально.
2. Перейдите на вкладку **Settings**.
3. Нажмите кнопку **Resume**.

<Image img={resume_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите на Resume снова.

<Image img={resume_dialog} border size="md"/>

5. Перейдите на вкладку **Metrics**.
6. Через примерно 5 секунд (а также после обновления страницы) статус пайпа должен быть **Running**.