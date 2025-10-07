---
'description': 'Табличная функция позволяет читать данные из кластера YTsaurus.'
'sidebar_label': 'ytsaurus'
'sidebar_position': 85
'slug': '/sql-reference/table-functions/ytsaurus'
'title': 'ytsaurus'
'doc_type': 'reference'
---
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ytsaurus Табличная Функция

<ExperimentalBadge/>

Табличная функция позволяет читать данные из кластера YTsaurus.

## Синтаксис {#syntax}

```sql
ytsaurus(http_proxy_url, cypress_path, oauth_token, format)
```

:::info
Это экспериментальная функция, которая может изменяться в обратнос совместимые способы в будущих релизах.
Включите использование табличной функции YTsaurus
с помощью настройки [allow_experimental_ytsaurus_table_function](/operations/settings/settings#allow_experimental_ytsaurus_table_engine).
Введите команду `set allow_experimental_ytsaurus_table_function = 1`.
:::

## Аргументы {#arguments}

- `http_proxy_url` — URL к http-прокси YTsaurus.
- `cypress_path` — Путь Cypress к источнику данных.
- `oauth_token` — OAuth токен.
- `format` — [формат](/interfaces/formats) источника данных.

**Возвращаемое значение**

Таблица с указанной структурой для чтения данных в указанном пути cypress YTsaurus кластера.

**Смотрите также**

- [ytsaurus движок](/engines/table-engines/integrations/ytsaurus.md)