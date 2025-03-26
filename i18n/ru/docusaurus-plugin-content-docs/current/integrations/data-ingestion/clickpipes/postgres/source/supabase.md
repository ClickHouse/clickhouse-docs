---
sidebar_label: 'Supabase Postgres'
description: 'Настройка экземпляра Supabase в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Руководство по настройке источника Supabase'
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Supabase

Это руководство о том, как настроить Supabase Postgres для использования в ClickPipes.

:::note

ClickPipes поддерживает Supabase через IPv6 нативно для бесшовной репликации.

:::


## Создание пользователя с разрешениями и слотом репликации {#creating-a-user-with-permissions-and-replication-slot}

Давайте создадим нового пользователя для ClickPipes с необходимыми разрешениями, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого вы можете перейти в **SQL Editor** вашего проекта Supabase. Здесь мы можем выполнить следующие SQL команды:
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

<Image img={supabase_commands} alt="Команды пользователя и публикации" size="large" border/>


Нажмите **Run**, чтобы публикация и пользователь были готовы.

:::note

Убедитесь, что вы заменили `clickpipes_user` и `clickpipes_password` на ваше желаемое имя пользователя и пароль.

Также не забудьте использовать то же имя публикации при создании зеркала в ClickPipes.

:::


## Увеличьте `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}


:::warning

Этот шаг перезапустит вашу базу данных Supabase и может вызвать кратковременное время простоя.

Вы можете увеличить параметр `max_slot_wal_keep_size` для вашей базы данных Supabase до более высокого значения (по крайней мере 100GB или `102400`), следуя [документации Supabase](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters).

Для более точной рекомендации этого значения вы можете обратиться к команде ClickPipes.

:::

## Детали подключения для Supabase {#connection-details-to-use-for-supabase}

Перейдите в `Project Settings` вашего проекта Supabase -> `Database` (в разделе `Configuration`).

**Важно**: Отключите `Display connection pooler` на этой странице и обратите внимание на раздел `Connection parameters`, запишите/скопируйте параметры.

<Image img={supabase_connection_details} size="lg" border alt="Найдите данные подключения Supabase" border/>

:::info

Пул соединений не поддерживается для репликации на основе CDC, поэтому его необходимо отключить.

:::


## Что дальше? {#whats-next}

Теперь вы можете [создать ваш ClickPipe](../index.md) и начать передавать данные из вашего экземпляра Postgres в ClickHouse Cloud. Обязательно запишите данные подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
