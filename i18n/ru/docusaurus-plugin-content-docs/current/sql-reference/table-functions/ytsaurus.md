---
description: 'Табличная функция позволяет считывать данные из кластера YTsaurus.'
sidebar_label: 'ytsaurus'
sidebar_position: 85
slug: /sql-reference/table-functions/ytsaurus
title: 'ytsaurus'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Табличная функция ytsaurus

<ExperimentalBadge/>

Табличная функция ytsaurus позволяет считывать данные из кластера YTsaurus.



## Синтаксис

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
Это экспериментальная функция, которая в будущих релизах может измениться с нарушением обратной совместимости.
Включите использование табличной функции YTsaurus
с помощью параметра [allow&#95;experimental&#95;ytsaurus&#95;table&#95;function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine).
Введите команду `set allow_experimental_ytsaurus_table_function = 1`.
:::


## Аргументы {#arguments}

- `http_proxy_url` — URL HTTP-прокси YTsaurus.
- `cypress_path` — путь Cypress к источнику данных.
- `oauth_token` — OAuth-токен.
- `format` — [формат](/interfaces/formats) источника данных.

**Возвращаемое значение**

Таблица заданной структуры для чтения данных по указанному пути Cypress в кластере YTsaurus.

**См. также**

- [движок YTsaurus](/engines/table-engines/integrations/ytsaurus.md)
