---
title: 'Добавление конкретных таблиц в ClickPipe'
description: 'Описывает шаги, необходимые для добавления конкретных таблиц в ClickPipe.'
sidebar_label: 'Добавить таблицу'
slug: /integrations/clickpipes/mysql/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# Добавление отдельных таблиц в ClickPipe {#adding-specific-tables-to-a-clickpipe}

В некоторых случаях может понадобиться добавить в ClickPipe отдельные таблицы. Такая необходимость обычно возникает по мере масштабирования вашей транзакционной или аналитической нагрузки.

## Шаги по добавлению отдельных таблиц в ClickPipe {#add-tables-steps}

Это можно сделать следующим образом:
1. [Приостановите](./pause_and_resume.md) конвейер.
2. Нажмите **Edit Table settings**.
3. Найдите нужную таблицу — вы можете воспользоваться строкой поиска.
4. Выберите таблицу, установив флажок.
<br/>
<Image img={add_table} border size="md"/>

5. Нажмите **Update**.
6. После успешного обновления конвейер последовательно перейдет в состояния `Setup`, `Snapshot` и `Running`. Первоначальную загрузку таблицы можно отслеживать на вкладке **Tables**.

:::info
CDC (фиксация изменений данных) для существующих таблиц автоматически возобновится после завершения snapshot новой таблицы.
:::
