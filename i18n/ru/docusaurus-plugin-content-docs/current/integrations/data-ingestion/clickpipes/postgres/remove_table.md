---
title: 'Удаление выбранных таблиц из ClickPipe'
description: 'Удаление выбранных таблиц из ClickPipe'
sidebar_label: 'Удалить таблицу'
slug: /integrations/clickpipes/postgres/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить отдельные таблицы из Postgres ClickPipe — например, если таблица не нужна для вашей аналитической задачи, её пропуск может снизить затраты на хранение и репликацию в ClickHouse.


## Шаги по удалению отдельных таблиц {#remove-tables-steps}

Сначала нужно удалить таблицу из pipe. Это можно сделать следующим образом:

1. [Приостановите](./pause_and_resume.md) pipe.
2. Нажмите **Edit Table Settings**.
3. Найдите нужную таблицу, воспользовавшись строкой поиска.
4. Снимите выделение с таблицы, щёлкнув по отмеченному чекбоксу.
<br/>

<Image img={remove_table} border size="md"/>

5. Нажмите **Update**.
6. После успешного обновления на вкладке **Metrics** статус будет **Running**. Эта таблица больше не будет реплицироваться этим ClickPipe.
