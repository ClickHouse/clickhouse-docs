---
sidebar_label: 'Supabase Postgres'
description: 'Настройка экземпляра Supabase в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Руководство по настройке источника Supabase'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Supabase {#supabase-source-setup-guide}

Это руководство по настройке Supabase Postgres для использования в ClickPipes.

:::note

ClickPipes нативно поддерживает Supabase через IPv6 для бесшовной репликации.

:::

## Создание пользователя с правами и слотом репликации {#creating-a-user-with-permissions-and-replication-slot}

Подключитесь к вашему инстансу Supabase от имени пользователя с правами администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте пользователю, созданному на предыдущем шаге, права только на чтение на уровне схемы. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:
   
    ```sql
    GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
    ```

3. Предоставьте пользователю привилегии на репликацию:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в publication только те таблицы, которые вам действительно нужны, чтобы избежать лишних накладных расходов на производительность.

   :::warning
   Каждая таблица, включённая в publication, должна либо иметь определённый **primary key**, _либо_ её **replica identity** должна быть настроена в значение `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для получения рекомендаций по выбору области действия publication.
   :::

   - Чтобы создать publication для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать publication для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Publication `clickpipes` будет содержать набор событий изменений, сгенерированных из указанных таблиц, и позже будет использоваться для приёма потока репликации.

## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

:::warning

Этот шаг приведёт к перезапуску вашей базы данных Supabase и может вызвать короткий период недоступности.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашей базы данных Supabase до большего значения (как минимум до 100GB или `102400`), следуя инструкции в [Supabase Docs](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters).

За более точной рекомендацией этого значения вы можете обратиться к команде ClickPipes.

:::

## Параметры подключения для использования с Supabase {#connection-details-to-use-for-supabase}

Перейдите в `Project Settings` вашего проекта Supabase, затем в `Database` (в разделе `Configuration`).

**Важно**: Отключите `Display connection pooler` на этой странице, затем перейдите к разделу `Connection parameters` и запишите или скопируйте параметры.

<Image img={supabase_connection_details} size="lg" border alt="Найти параметры подключения Supabase" border/>

:::info

Пул подключений не поддерживается для репликации на основе CDC (фиксации изменений данных), поэтому его необходимо отключить.

:::

## Примечание по RLS {#note-on-rls}

К пользователю ClickPipes Postgres не должны применяться политики RLS, так как это может привести к потере данных. Вы можете отключить политики RLS для этого пользователя, выполнив следующую команду:

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся вам при создании ClickPipe.