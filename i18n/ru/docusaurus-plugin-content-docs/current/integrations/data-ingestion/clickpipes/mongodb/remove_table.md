---
title: 'Удаление конкретных таблиц из ClickPipe'
description: 'Удаление конкретных таблиц из ClickPipe'
sidebar_label: 'Удалить таблицу'
slug: /integrations/clickpipes/mongodb/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить отдельные таблицы из MongoDB ClickPipe — например, если таблица не нужна для ваших аналитических задач, пропуск такой таблицы может снизить затраты на хранение и репликацию в ClickHouse.


## Шаги по удалению отдельных таблиц {#remove-tables-steps}

Сначала нужно удалить таблицу из конвейера. Это можно сделать следующим образом:

1. [Приостановите](./pause_and_resume.md) конвейер.
2. Нажмите **Edit Table Settings**.
3. Найдите нужную таблицу — для этого используйте поле поиска.
4. Снимите флажок с таблицы, щёлкнув по отмеченному чекбоксу.
<br/>

<Image img={remove_table} border size="md"/>

5. Нажмите **Update**.
6. После успешного обновления на вкладке **Metrics** статус будет **Running**. Эта таблица больше не будет реплицироваться этим ClickPipe.
