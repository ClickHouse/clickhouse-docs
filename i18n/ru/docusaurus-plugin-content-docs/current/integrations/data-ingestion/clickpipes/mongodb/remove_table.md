---
'title': 'Удаление конкретных таблиц из ClickPipe'
'description': 'Удаление конкретных таблиц из ClickPipe'
'sidebar_label': 'Удалить таблицу'
'slug': '/integrations/clickpipes/mongodb/removing_tables'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить конкретные таблицы из MongoDB ClickPipe - например, если таблица не нужна для вашей рабочей нагрузки аналитики, пропуск ее может снизить расходы на хранение и репликацию в ClickHouse.

## Шаги по удалению конкретных таблиц {#remove-tables-steps}

Первый шаг - удалить таблицу из конвейера. Это можно сделать следующим образом:

1. [Приостановите](./pause_and_resume.md) конвейер.
2. Кликните на "Изменить настройки таблицы".
3. Найдите вашу таблицу - это можно сделать, используя строку поиска.
4. Снимите выбор с таблицы, кликнув на выбранный чекбокс.
<br/>

<Image img={remove_table} border size="md"/>

5. Нажмите "Обновить".
6. После успешного обновления в вкладке **Метрики** статус будет **Запущен**. Эта таблица больше не будет реплицироваться этим ClickPipe.
