---
description: 'Настройки для MergeTree, которые находятся в `system.merge_tree_settings`'
slug: /operations/settings/merge-tree-settings
title: 'Настройки таблиц MergeTree'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';

Системная таблица `system.merge_tree_settings` показывает глобально установленные настройки MergeTree.

Настройки MergeTree можно установить в секции `merge_tree` файла конфигурации сервера или указать для каждой таблицы `MergeTree` индивидуально в
клауза `SETTINGS` оператора `CREATE TABLE`.

Пример настройки параметра `max_suspicious_broken_parts`:

Настройка по умолчанию для всех таблиц `MergeTree` в файле конфигурации сервера:

```text
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

Установить для конкретной таблицы:

```sql
CREATE TABLE tab
(
    `A` Int64
)
ENGINE = MergeTree
ORDER BY tuple()
SETTINGS max_suspicious_broken_parts = 500;
```

Изменить настройки для конкретной таблицы, используя `ALTER TABLE ... MODIFY SETTING`:

```sql
ALTER TABLE tab MODIFY SETTING max_suspicious_broken_parts = 100;

-- сброс к глобальному значению по умолчанию (значение из system.merge_tree_settings)
ALTER TABLE tab RESET SETTING max_suspicious_broken_parts;
```

## Настройки MergeTree {#mergetree-settings}
<!-- Эти настройки автоматически сгенерированы скриптом на 
https://github.com/ClickHouse/clickhouse-docs/blob/main/scripts/settings/autogenerate-settings.sh
-->
