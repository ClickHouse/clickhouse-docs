---
title: 'Добавление конкретных таблиц в ClickPipe'
description: 'Описывает шаги по добавлению конкретных таблиц в ClickPipe.'
sidebar_label: 'Добавить таблицу'
slug: /integrations/clickpipes/postgres/add_table
show_title: false
keywords: ['clickpipes postgres', 'add table', 'table configuration', 'initial load', 'snapshot']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

# Добавление отдельных таблиц в ClickPipe {#adding-specific-tables-to-a-clickpipe}

В некоторых случаях может потребоваться добавить в ClickPipe только определённые таблицы. Такая необходимость часто возникает по мере масштабирования ваших транзакционных или аналитических нагрузок.

## Шаги по добавлению отдельных таблиц в ClickPipe {#add-tables-steps}

Это можно сделать, выполнив следующие шаги:
1. [Приостановите](./pause_and_resume.md) конвейер.
2. Нажмите **Edit Table settings**.
3. Найдите свою таблицу — можно воспользоваться строкой поиска.
4. Выберите таблицу, установив флажок.
<br/>
<Image img={add_table} border size="md"/>

5. Нажмите **Update**.
6. После успешного обновления конвейер последовательно перейдёт в статусы `Setup`, `Snapshot` и `Running`. Первоначальную загрузку таблицы можно отслеживать на вкладке **Tables**.

:::info
CDC (фиксация изменений данных) для существующих таблиц автоматически возобновится после завершения создания snapshot новой таблицы.
:::
