---
'title': 'Удаление конкретных таблиц из ClickPipe'
'description': 'Удаление конкретных таблиц из ClickPipe'
'sidebar_label': 'Удалить таблицу'
'slug': '/integrations/clickpipes/mysql/removing_tables'
'doc_type': 'guide'
---
import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить конкретные таблицы из MySQL ClickPipe - например, если таблица не нужна для вашей аналитической нагрузки, пропуск её может снизить затраты на хранение и репликацию в ClickHouse.

## Шаги для удаления конкретных таблиц {#remove-tables-steps}

Первый шаг - удалить таблицу из конвейера. Это можно сделать, следуя этим шагам:

1. [Приостановите](./pause_and_resume.md) конвейер.
2. Нажмите на Настройки таблицы.
3. Найдите вашу таблицу - это можно сделать, введя её название в строку поиска.
4. Снимите выделение с таблицы, нажав на выбранный флажок.
<br/>

<Image img={remove_table} border size="md"/>

5. Нажмите обновить.
6. После успешного обновления в вкладке **Метрики** статус будет **Работает**. Эта таблица больше не будет реплицироваться этим ClickPipe.