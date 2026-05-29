---
title: 'Добавление конкретных таблиц в ClickPipe'
description: 'Описывает шаги, необходимые для добавления конкретных таблиц в ClickPipe.'
sidebar_label: 'Добавить таблицу'
slug: /integrations/clickpipes/postgres/add_table
show_title: false
keywords: ['clickpipes postgres', 'добавить таблицу', 'конфигурация таблицы', 'первоначальная загрузка', 'снимок']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

В некоторых случаях полезно добавить в пайп определённые таблицы. По мере роста транзакционной или аналитической рабочей нагрузки это требуется всё чаще.

## Шаги по добавлению определённых таблиц в ClickPipe \{#add-tables-steps\}

Это можно сделать, выполнив следующие шаги:

1. [Приостановите](./pause_and_resume.md) пайп.
2. Нажмите Edit Table settings.
3. Найдите нужную таблицу — это можно сделать через строку поиска.
4. Выберите таблицу, установив флажок.

<br />

<Image img={add_table} border size="md" />

5. Нажмите update.
6. После успешного обновления пайп последовательно перейдёт в статусы `Setup`, `Snapshot` и `Running`. Начальную загрузку таблицы можно отслеживать на вкладке **Tables**.

:::info
Для существующих таблиц CDC автоматически возобновится после завершения снимка новой таблицы.
:::