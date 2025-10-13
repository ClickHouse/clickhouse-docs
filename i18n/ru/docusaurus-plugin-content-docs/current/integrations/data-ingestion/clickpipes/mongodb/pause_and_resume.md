---
'title': 'Настройка и Восстановление MongoDB ClickPipe'
'description': 'Настройка и Восстановление MongoDB ClickPipe'
'sidebar_label': 'Настроить Таблицу'
'slug': '/integrations/clickpipes/mongodb/pause_and_resume'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

Существуют сценарии, когда может быть полезно приостановить MongoDB ClickPipe. Например, вы можете захотеть провести некоторую аналитику на существующих данных в статическом состоянии. Или же вы можете выполнять обновления в MongoDB. Вот как вы можете приостановить и возобновить MongoDB ClickPipe.

## Шаги для приостановки MongoDB ClickPipe {#pause-clickpipe-steps}

1. На вкладке Источники данных кликните на MongoDB ClickPipe, который вы хотите приостановить.
2. Перейдите на вкладку **Настройки**.
3. Нажмите кнопку **Приостановить**.

<Image img={pause_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите кнопку Приостановить снова.

<Image img={pause_dialog} border size="md"/>

4. Перейдите на вкладку **Метрики**.
5. Подождите, пока статус трубы не изменится на **Приостановлена**.

<Image img={pause_status} border size="md"/>

## Шаги для возобновления MongoDB ClickPipe {#resume-clickpipe-steps}
1. На вкладке Источники данных кликните на MongoDB ClickPipe, который вы хотите возобновить. Статус зеркала должен изначально быть **Приостановлен**.
2. Перейдите на вкладку **Настройки**.
3. Нажмите кнопку **Возобновить**.

<Image img={resume_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите кнопку Возобновить снова.

<Image img={resume_dialog} border size="md"/>

5. Перейдите на вкладку **Метрики**.
6. Подождите, пока статус трубы не изменится на **Работает**.