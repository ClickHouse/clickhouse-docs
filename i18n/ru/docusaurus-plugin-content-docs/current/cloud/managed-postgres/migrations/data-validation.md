---
slug: /cloud/managed-postgres/migrations/data-validation
sidebar_label: 'Проверка корректности данных'
title: 'Проверить корректность данных после миграции'
description: 'Узнайте, как проверить корректность данных после миграции в ClickHouse Managed Postgres'
keywords: ['postgres', 'postgresql', 'логическая репликация', 'миграция', 'передача данных', 'managed postgres']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

## Сравнение количества строк во всех таблицах \{#data-validation-counts\}

Простой способ проверить правильность данных после миграции — сравнить количество строк во всех таблицах в исходной и целевой базах данных. Вы можете сделать это, выполнив следующий запрос в обеих базах данных:

```sql
SELECT table_name, 
       (xpath('/row/cnt/text()', xml_count))[1]::text::bigint AS row_count
FROM (
  SELECT table_name, 
         query_to_xml('SELECT count(*) AS cnt FROM ' || quote_ident(table_name), false, true, '') AS xml_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
) t
ORDER BY table_name;
```