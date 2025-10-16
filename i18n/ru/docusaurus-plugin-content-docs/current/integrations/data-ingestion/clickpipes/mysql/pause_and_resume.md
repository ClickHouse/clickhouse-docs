---
'title': 'Настройка и возобновление MySQL ClickPipe'
'description': 'Настройка и возобновление MySQL ClickPipe'
'sidebar_label': 'Настроить таблицу'
'slug': '/integrations/clickpipes/mysql/pause_and_resume'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import pause_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_button.png'
import pause_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_dialog.png'
import pause_status from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/pause_status.png'
import resume_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_button.png'
import resume_dialog from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/resume_dialog.png'

Есть сценарии, когда может быть полезно приостановить MySQL ClickPipe. Например, вы можете захотеть провести аналитику по существующим данным в статическом состоянии. Или вы можете выполнять обновления MySQL. Вот как вы можете приостановить и возобновить MySQL ClickPipe.

## Шаги для приостановки MySQL ClickPipe {#pause-clickpipe-steps}

1. На вкладке Источники данных нажмите на MySQL ClickPipe, который вы хотите приостановить.
2. Перейдите на вкладку **Настройки**.
3. Нажмите на кнопку **Приостановить**.

<Image img={pause_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите на Приостановить снова.

<Image img={pause_dialog} border size="md"/>

5. Перейдите на вкладку **Метрики**.
6. Через 5 секунд (а также при обновлении страницы) статус трубопровода должен быть **Приостановлен**.

<Image img={pause_status} border size="md"/>

## Шаги для возобновления MySQL ClickPipe {#resume-clickpipe-steps}
1. На вкладке Источники данных нажмите на MySQL ClickPipe, который вы хотите возобновить. Статус зеркала изначально должен быть **Приостановлен**.
2. Перейдите на вкладку **Настройки**.
3. Нажмите на кнопку **Возобновить**.

<Image img={resume_button} border size="md"/>

4. Должно появиться диалоговое окно для подтверждения. Нажмите на Возобновить снова.

<Image img={resume_dialog} border size="md"/>

5. Перейдите на вкладку **Метрики**.
6. Через 5 секунд (а также при обновлении страницы) статус трубопровода должен быть **Работает**.