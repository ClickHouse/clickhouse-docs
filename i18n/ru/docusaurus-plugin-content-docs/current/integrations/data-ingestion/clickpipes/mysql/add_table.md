---
title: 'Добавление отдельных таблиц в ClickPipe'
description: 'Описывает шаги, необходимые для добавления отдельных таблиц в ClickPipe.'
sidebar_label: 'Добавить таблицу'
slug: /integrations/clickpipes/mysql/add_table
show_title: false
doc_type: 'guide'
keywords: ['clickpipes', 'mysql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'

В некоторых случаях полезно добавить в пайп определённые таблицы. По мере роста транзакционной или аналитической рабочей нагрузки это становится типичной необходимостью.

## Шаги по добавлению конкретных таблиц в ClickPipe \{#add-tables-steps\}

Для этого выполните следующие действия:

1. [Приостановите](./pause_and_resume.md) пайп.
2. Нажмите **Edit Table settings**.
3. Найдите нужную таблицу — для этого воспользуйтесь строкой поиска.
4. Выберите таблицу, установив флажок.

<br />

<Image img={add_table} border size="md" />

5. Нажмите **update**.
6. После успешного обновления пайп последовательно перейдет в статусы `Setup`, `Snapshot` и `Running`. Начальную загрузку таблицы можно отслеживать на вкладке **Tables**.

:::info
CDC для существующих таблиц автоматически возобновится после завершения снимка новой таблицы.
:::