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



## Создание пользователя с правами доступа и слотом репликации {#creating-a-user-with-permissions-and-replication-slot}

Давайте создадим нового пользователя для ClickPipes с необходимыми правами, подходящими для CDC,
а также создадим публикацию, которую мы будем использовать для репликации.

Для этого перейдите в **SQL Editor** вашего проекта Supabase.
Здесь мы можем выполнить следующие SQL-команды:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Предоставить пользователю права на репликацию
  ALTER USER clickpipes_user REPLICATION;

-- Создать публикацию. Она будет использоваться при создании зеркала
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image img={supabase_commands} alt="Команды для пользователя и публикации" size="large" border />

Нажмите **Run**, чтобы создать публикацию и пользователя.

:::note

Обязательно замените `clickpipes_user` и `clickpipes_password` на нужные вам имя пользователя и пароль.

Также не забудьте использовать то же имя публикации при создании зеркала в ClickPipes.

:::


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
