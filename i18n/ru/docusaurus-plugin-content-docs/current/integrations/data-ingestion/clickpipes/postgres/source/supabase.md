---
sidebar_label: 'Supabase Postgres'
description: 'Настройка экземпляра Supabase как источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Руководство по настройке источника Supabase'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Supabase

Это руководство о том, как настроить Supabase Postgres для использования в ClickPipes.

:::note

ClickPipes поддерживает Supabase через IPv6 на нативном уровне для бесперебойной репликации.

:::


## Создание пользователя с разрешениями и слотом репликации {#creating-a-user-with-permissions-and-replication-slot}

Давайте создадим нового пользователя для ClickPipes с необходимыми разрешениями, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого вы можете перейти в **SQL редактор** вашего проекта Supabase. Здесь мы можем выполнить следующие SQL команды:
```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Дать разрешение на репликацию пользователю
  ALTER USER clickpipes_user REPLICATION;

-- Создать публикацию. Мы будем использовать это при создании зеркала
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image img={supabase_commands} alt="Команды для пользователя и публикации" size="large" border/>


Нажмите **Run**, чтобы подготовить публикацию и пользователя.

:::note

Не забудьте заменить `clickpipes_user` и `clickpipes_password` на желаемое имя пользователя и пароль.

Также помните о необходимости использовать то же имя публикации при создании зеркала в ClickPipes.

:::


## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}


:::warning

Этот шаг перезапустит вашу базу данных Supabase и может вызвать кратковременный простой.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашей базы данных Supabase до более высокого значения (по крайней мере 100GB или `102400`), следуя [документации Supabase](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters).

Для получения более точной рекомендации по этому значению вы можете обратиться в команду ClickPipes.

:::

## Подробности подключения для Supabase {#connection-details-to-use-for-supabase}

Перейдите в `Project Settings` -> `Database` (в разделе `Configuration`) вашего проекта Supabase.

**Важно**: Отключите `Display connection pooler` на этой странице и перейдите в раздел `Connection parameters`, чтобы записать/скопировать параметры.

<Image img={supabase_connection_details} size="lg" border alt="Найти детали подключения Supabase" border/>

:::info

Пул соединений не поддерживается для репликации на основе CDC, поэтому его необходимо отключить.

:::


## Что дальше? {#whats-next}

Теперь вы можете [создать ваш ClickPipe](../index.md) и начать загрузку данных из вашего экземпляра Postgres в ClickHouse Cloud. Убедитесь, что вы записали детали подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам во время процесса создания ClickPipe.
