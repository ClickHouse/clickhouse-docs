---
title: 'Удаление отдельных таблиц из ClickPipe'
description: 'Удаление отдельных таблиц из ClickPipe'
sidebar_label: 'Удалить таблицу'
slug: /integrations/clickpipes/mysql/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить отдельные таблицы из MySQL ClickPipe — например, если какая‑то таблица не используется в ваших аналитических задачах, её пропуск может снизить затраты на хранение и репликацию в ClickHouse.


## Шаги по удалению отдельных таблиц {#remove-tables-steps}

Первый шаг — удалить таблицу из конвейера. Это можно сделать следующим образом:

1. [Приостановите](./pause_and_resume.md) конвейер.
2. Нажмите **Edit Table Settings**.
3. Найдите нужную таблицу — можно воспользоваться полем поиска.
4. Снимите выделение с таблицы, нажав на установленный флажок.
<br/>

<Image img={remove_table} border size="md"/>

5. Нажмите **Update**.
6. После успешного обновления на вкладке **Metrics** статус будет **Running**. Эта таблица больше не будет реплицироваться этим ClickPipe.
