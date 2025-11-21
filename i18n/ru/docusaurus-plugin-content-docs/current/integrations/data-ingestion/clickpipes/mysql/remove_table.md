---
title: 'Удаление конкретных таблиц из ClickPipe'
description: 'Удаление конкретных таблиц из ClickPipe'
sidebar_label: 'Удалить таблицу'
slug: /integrations/clickpipes/mysql/removing_tables
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'загрузка данных', 'синхронизация в реальном времени']
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить отдельные таблицы из MySQL ClickPipe — например, если какая‑то таблица не нужна для вашей аналитики, её пропуск может снизить затраты на хранение и репликацию в ClickHouse.


## Шаги по удалению конкретных таблиц {#remove-tables-steps}

Первый шаг — удалить таблицу из пайпа. Это можно сделать следующим образом:

1. [Приостановите](./pause_and_resume.md) пайп.
2. Нажмите на **Edit Table Settings**.
3. Найдите вашу таблицу — для этого можно воспользоваться строкой поиска.
4. Снимите выделение с таблицы, нажав на отмеченный флажок.
   <br />

<Image img={remove_table} border size='md' />

5. Нажмите **Update**.
6. После успешного обновления на вкладке **Metrics** статус будет **Running**. Эта таблица больше не будет реплицироваться этим ClickPipe.
