---
'title': 'Удаление конкретных таблиц из ClickPipe'
'description': 'Удаление конкретных таблиц из ClickPipe'
'sidebar_label': 'Удалить таблицу'
'slug': '/integrations/clickpipes/postgres/removing_tables'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить конкретные таблицы из Postgres ClickPipe - например, если таблица не нужна для вашей аналитической нагрузки, ее пропуск может снизить затраты на хранение и репликацию в ClickHouse.

## Шаги для удаления конкретных таблиц {#remove-tables-steps}

Первый шаг - удалить таблицу из конвейера. Это можно сделать следующими шагами:

1. [Приостановите](./pause_and_resume.md) конвейер.
2. Нажмите «Настройки таблицы».
3. Найдите свою таблицу - это можно сделать, введя ее в строку поиска.
4. Снимите выбор таблицы, кликнув по отмеченному чекбоксу.
<br/>

<Image img={remove_table} border size="md"/>

5. Нажмите «Обновить».
6. После успешного обновления в вкладке **Метрики** статус будет **Запускается**. Эта таблица больше не будет реплицироваться этим ClickPipe.
