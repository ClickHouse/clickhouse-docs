---
title: 'Добавление конкретных таблиц в ClickPipe'
description: 'Описывает шаги, необходимые для добавления конкретных таблиц в ClickPipe.'
sidebar_label: 'Добавить таблицу'
slug: /integrations/clickpipes/mongodb/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# Добавление отдельных таблиц в ClickPipe

В ряде случаев бывает полезно добавить в ClickPipe отдельные таблицы. По мере масштабирования вашей транзакционной или аналитической нагрузки это становится распространённой необходимостью.



## Шаги по добавлению отдельных таблиц в ClickPipe {#add-tables-steps}

Выполните следующие шаги:
1. [Приостановите](./pause_and_resume.md) конвейер ClickPipe.
2. Нажмите **Edit Table settings**.
3. Найдите нужную таблицу — это можно сделать, введя её имя в строку поиска.
4. Выберите таблицу, установив флажок.
<br/>
<Image img={add_table} border size="md"/>

5. Нажмите **Update**.
6. После успешного обновления конвейер последовательно перейдёт в состояния `Setup`, `Snapshot` и `Running`. Начальную загрузку таблицы можно отслеживать на вкладке **Tables**.

:::info
CDC для существующих таблиц автоматически возобновится после завершения snapshot новой таблицы.
:::
