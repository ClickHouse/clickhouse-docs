---
sidebar_label: Supabase Postgres
description: Настройка экземпляра Supabase в качестве источника для ClickPipes
slug: /integrations/clickpipes/postgres/source/supabase
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg' 


# Руководство по настройке источника Supabase

Это руководство о том, как настроить Supabase Postgres для использования в ClickPipes.

:::note

ClickPipes поддерживает Supabase через IPv6 нативно для бесшовной репликации.

:::


## Создание пользователя с правами и слотом репликации {#creating-a-user-with-permissions-and-replication-slot}

Давайте создадим нового пользователя для ClickPipes с необходимыми правами, подходящими для CDC, а также создадим публикацию, которую мы будем использовать для репликации.

Для этого перейдите в **SQL Editor** для вашего проекта Supabase. Здесь мы можем выполнить следующие SQL команды:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Дать пользователю права на репликацию
  ALTER USER clickpipes_user REPLICATION;

-- Создать публикацию. Мы будем использовать это при создании зеркала
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<img src={supabase_commands} alt="Команды пользователя и публикации"/>


Нажмите на **Run**, чтобы подготовить публикацию и пользователя.

:::note

Обязательно замените `clickpipes_user` и `clickpipes_password` на ваше желаемое имя пользователя и пароль.

Также не забудьте использовать то же имя публикации при создании зеркала в ClickPipes.

:::


## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}


:::warning

Этот шаг перезапустит вашу базу данных Supabase и может вызвать кратковременный простой.

Вы можете увеличить параметр `max_slot_wal_keep_size` вашей базы данных Supabase до более высокого значения (по меньшей мере 100 ГБ или `102400`), следуя [документации Supabase](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)

Для получения более точной рекомендации по этому значению вы можете обратиться в команду ClickPipes.

:::

## Детали подключения для использования с Supabase {#connection-details-to-use-for-supabase}

Перейдите в `Project Settings` вашего проекта Supabase -> `Database` (в разделе `Configuration`).

**Важно**: Отключите `Display connection pooler` на этой странице и перейдите в раздел `Connection parameters`, чтобы записать или скопировать параметры.

<img src={supabase_connection_details} alt="Найдите детали подключения Supabase"/>

:::info

Connection pooler не поддерживается для репликации на основе CDC, поэтому его необходимо отключить.

:::


## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать импорт данных из вашего экземпляра Postgres в ClickHouse Cloud. Убедитесь, что вы записали детали подключения, которые использовали при настройке вашего экземпляра Postgres, так как они понадобятся во время процесса создания ClickPipe.
