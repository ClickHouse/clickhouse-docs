---
title: 'Удаление отдельных таблиц из ClickPipe'
description: 'Удаление отдельных таблиц из ClickPipe'
sidebar_label: 'Удаление таблицы'
slug: /integrations/clickpipes/postgres/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'data ingestion', 'real-time sync']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить отдельные таблицы из Postgres ClickPipe — например, если таблица не используется в ваших аналитических задачах, её пропуск может снизить затраты на хранение и репликацию в ClickHouse.


## Шаги по удалению конкретных таблиц {#remove-tables-steps}

Первый шаг — удалить таблицу из пайпа. Это можно сделать следующим образом:

1. [Приостановите](./pause_and_resume.md) пайп.
2. Нажмите на «Edit Table Settings».
3. Найдите вашу таблицу — для этого воспользуйтесь строкой поиска.
4. Снимите выделение с таблицы, нажав на отмеченный флажок.
   <br />

<Image img={remove_table} border size='md' />

5. Нажмите «Update».
6. После успешного обновления на вкладке **Metrics** статус будет **Running**. Эта таблица больше не будет реплицироваться этим ClickPipe.
