---
title: 'Добавление конкретных таблиц в ClickPipe'
description: 'Описывает шаги, необходимые для добавления конкретных таблиц в ClickPipe.'
sidebar_label: 'Добавить таблицу'
slug: /integrations/clickpipes/postgres/add_table
show_title: false
keywords: ['clickpipes postgres', 'add table', 'table configuration', 'initial load', 'snapshot']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import add_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/add_table.png'


# Добавление отдельных таблиц в ClickPipe

В некоторых сценариях бывает полезно добавить в конвейер отдельные таблицы. Это становится распространённой практикой по мере роста ваших транзакционных или аналитических нагрузок.



## Шаги по добавлению таблиц в ClickPipe {#add-tables-steps}

Для этого выполните следующие действия:

1. [Приостановите](./pause_and_resume.md) работу конвейера.
2. Нажмите «Изменить настройки таблицы» (Edit Table settings).
3. Найдите нужную таблицу — для этого воспользуйтесь строкой поиска.
4. Выберите таблицу, установив флажок.

   <br />
   <Image img={add_table} border size='md' />

5. Нажмите «Обновить» (Update).
6. После успешного обновления конвейер последовательно пройдет через статусы `Setup`, `Snapshot` и `Running`. Ход начальной загрузки таблицы можно отслеживать на вкладке **Tables**.

:::info
CDC для существующих таблиц возобновляется автоматически после завершения создания снимка новой таблицы.
:::
