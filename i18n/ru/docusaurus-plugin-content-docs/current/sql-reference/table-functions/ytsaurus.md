---
description: 'Табличная функция позволяет читать данные из кластера YTsaurus.'
sidebar_label: 'ytsaurus'
sidebar_position: 85
slug: /sql-reference/table-functions/ytsaurus
title: 'ytsaurus'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# Табличная функция ytsaurus

<ExperimentalBadge/>

Табличная функция позволяет читать данные из кластера YTsaurus.



## Синтаксис {#syntax}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
Это экспериментальная функция, которая может быть изменена с нарушением обратной совместимости в будущих релизах.
Чтобы включить использование табличной функции YTsaurus,
используйте настройку [allow_experimental_ytsaurus_table_function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine).
Выполните команду `set allow_experimental_ytsaurus_table_function = 1`.
:::


## Аргументы {#arguments}

- `http_proxy_url` — URL HTTP-прокси YTsaurus.
- `cypress_path` — путь Cypress к источнику данных.
- `oauth_token` — токен OAuth.
- `format` — [формат](/interfaces/formats) источника данных.

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных по заданному пути Cypress в кластере YTsaurus.

**См. также**

- [движок ytsaurus](/engines/table-engines/integrations/ytsaurus.md)
