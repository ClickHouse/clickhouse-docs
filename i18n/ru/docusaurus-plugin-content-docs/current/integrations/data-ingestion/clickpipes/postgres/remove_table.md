---
title: 'Удаление специфических таблиц из ClickPipe'
description: 'Удаление специфических таблиц из ClickPipe'
sidebar_label: 'Удалить таблицу'
slug: /integrations/clickpipes/postgres/removing_tables
---

import Image from '@theme/IdealImage';
import remove_table from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/remove_table.png'

В некоторых случаях имеет смысл исключить специфические таблицы из ClickPipe Postgres — например, если таблица не нужна для вашей аналитической нагрузки, её пропуск может снизить расходы на хранение и репликацию в ClickHouse.

## Шаги для удаления специфических таблиц {#remove-tables-steps}

Первый шаг — удалить таблицу из конвейера. Это можно сделать следующими шагами:

1. [Приостановите](./pause_and_resume.md) конвейер.
2. Нажмите на Изменить настройки таблицы.
3. Найдите вашу таблицу — это можно сделать, введя её название в строку поиска.
4. Снимите выбор таблицы, нажав на выбранный чекбокс.
<br/>

<Image img={remove_table} border size="md"/>

5. Нажмите обновить.
6. После успешного обновления в вкладке **Метрики** статус будет **Работает**. Эта таблица больше не будет реплицироваться этим ClickPipe.
