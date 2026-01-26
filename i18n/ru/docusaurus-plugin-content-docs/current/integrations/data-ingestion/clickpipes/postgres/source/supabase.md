---
sidebar_label: 'Supabase Postgres'
description: 'Настройте экземпляр Supabase в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Руководство по настройке источника Supabase'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в режиме реального времени']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Supabase \{#supabase-source-setup-guide\}

Это руководство по настройке Supabase Postgres для использования с ClickPipes.

:::note

ClickPipes нативно поддерживает Supabase по IPv6 для бесшовной репликации.

:::

## Создание пользователя с правами и слотом репликации \{#creating-a-user-with-permissions-and-replication-slot\}

Подключитесь к вашему экземпляру Supabase под учетной записью администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте на уровне схемы доступ только для чтения пользователю, созданному на предыдущем шаге. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Выдайте пользователю права на репликацию:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. Создайте [публикацию](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в публикацию только те таблицы, которые вам действительно нужны, чтобы избежать избыточной нагрузки на производительность.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **первичный ключ**, _либо_ для неё должна быть настроена **replica identity** со значением `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по выбору области публикаций.
   :::

   - Чтобы создать публикацию для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, сгенерированных из указанных таблиц, и впоследствии будет использоваться для приёма потока репликации.

## Увеличение `max_slot_wal_keep_size` \{#increase-max_slot_wal_keep_size\}

:::warning

Этот шаг приведёт к перезапуску вашей базы данных Supabase и может вызвать кратковременный простой.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашей базы данных Supabase до большего значения (как минимум 100 ГБ или `102400`), следуя инструкциям в [Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters).

Для подбора оптимального значения вы можете связаться с командой ClickPipes.

:::

## Параметры подключения для использования с Supabase \{#connection-details-to-use-for-supabase\}

Перейдите в `Project Settings` вашего проекта Supabase -> `Database` (в разделе `Configuration`).

**Важно**: Отключите опцию `Display connection pooler` на этой странице, затем перейдите к разделу `Connection parameters` и сохраните/скопируйте параметры.

<Image img={supabase_connection_details} size="lg" border alt="Найдите параметры подключения Supabase" border/>

:::info

Пулер подключений не поддерживается для репликации на основе CDC, поэтому его необходимо отключить.

:::

## Примечание по RLS \{#note-on-rls\}

Пользователь ClickPipes Postgres не должен подпадать под действие политик RLS, так как это может привести к потере данных. Вы можете отключить политики RLS для этого пользователя, выполнив следующую команду:

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, — они понадобятся вам при создании ClickPipe.