---
'title': 'Добавление конкретных TABLE в ClickPipe'
'description': 'Описывает шаги, необходимые для добавления конкретных TABLE в ClickPipe.'
'sidebar_label': 'Добавить TABLE'
'slug': '/integrations/clickpipes/mysql/add_table'
'show_title': false
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# Добавление конкретных таблиц в ClickPipe

Существуют сценарии, когда полезно добавить конкретные таблицы в пайп. Это становится общей необходимостью по мере масштабирования вашей транзакционной или аналитической нагрузки.

## Шаги для добавления конкретных таблиц в ClickPipe {#add-tables-steps}

Это можно сделать следующими шагами:
1. [Приостановить](./pause_and_resume.md) пайп.
2. Нажмите на «Настройки таблицы».
3. Найдите вашу таблицу - это можно сделать, используя строку поиска.
4. Выберите таблицу, нажав на флажок.
<br/>
<Image img={add_table} border size="md"/>

5. Нажмите «Обновить».
6. При успешном обновлении пайп будет иметь статусы `Setup`, `Snapshot` и `Running` в указанном порядке. Начальную загрузку таблицы можно отслеживать на вкладке **Tables**.

:::info
CDC для существующих таблиц автоматически возобновляется после завершения снимка новой таблицы.
:::