---
slug: /cloud/managed-postgres/migrations/faq
sidebar_label: 'FAQ'
title: 'FAQ по миграциям Managed Postgres'
description: 'Часто задаваемые вопросы о миграции данных в ClickHouse Managed Postgres.'
keywords: ['postgres', 'миграция', 'faq', 'Managed Postgres', 'логическая репликация', 'enum', 'ограничение уникальности']
doc_type: 'reference'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migrations-faq" />

# FAQ по миграциям Managed Postgres \{#managed-postgres-migrations-faq\}

Ответы на многие вопросы о том, как работает репликация Postgres, включая столбцы `TOAST`, слоты репликации, публикации, изменения схемы и сопоставление типов данных, приведены в [FAQ по ClickPipes для Postgres](/integrations/clickpipes/postgres/faq). Эта информация также применима и к миграциям Managed Postgres.

### Во время репликации появляется ошибка &quot;invalid input value for enum&quot; \{#invalid-enum-value\}

Эта ошибка возникает, когда в исходном Postgres есть значение enum, которого нет в целевом Managed Postgres. Логическая репликация не передаёт автоматически команды `ALTER TYPE ... ADD VALUE`, поэтому новые значения enum, добавленные в источнике после первоначальной настройки схемы, будут вызывать сбои вставки на целевом сервере.

Чтобы исправить это, добавьте отсутствующее значение в тип enum в целевом Postgres:

```sql
ALTER TYPE your_enum_type ADD VALUE 'new_value';
```

Замените `your_enum_type` на имя вашего enum-типа, а `'new_value'` — на отсутствующее значение из сообщения об ошибке.

### Во время репликации возникает ошибка нарушения ограничения уникальности \{#unique-constraint-violation\}

Нарушения ограничения уникальности могут возникать при логической репликации, когда порядок репликации приводит к конфликту с существующим ограничением уникальности на целевой стороне. Это может происходить в рабочих нагрузках CDC, связанных с повторным воспроизведением операций, которые временно нарушают уникальность до того, как последующее обновление устранит конфликт.

Чтобы разблокировать репликацию, удалите ограничение уникальности в целевом Postgres:

```sql
ALTER TABLE your_table DROP CONSTRAINT your_constraint_name;
```

Имя ограничения можно определить, выполнив:

```sql
SELECT conname, conrelid::regclass
FROM pg_constraint
WHERE contype = 'u';
```

Во время переключения повторно добавьте ограничение после завершения репликации, когда исходная база данных больше не будет активна:

```sql
ALTER TABLE your_table ADD CONSTRAINT your_constraint_name UNIQUE (column1, column2);
```