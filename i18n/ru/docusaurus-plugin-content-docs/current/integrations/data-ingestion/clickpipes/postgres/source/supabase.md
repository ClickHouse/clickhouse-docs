---
sidebar_label: 'Supabase Postgres'
description: 'Настройка экземпляра Supabase в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/supabase
title: 'Руководство по настройке источника Supabase'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'загрузка данных', 'синхронизация в реальном времени']
---

import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Supabase

В этом руководстве описано, как настроить Supabase Postgres для использования в ClickPipes в качестве источника данных.

:::note

ClickPipes из коробки поддерживает Supabase по IPv6 для бесшовной репликации данных.

:::



## Создание пользователя с правами доступа и слотом репликации {#creating-a-user-with-permissions-and-replication-slot}

Создадим нового пользователя для ClickPipes с необходимыми правами доступа для CDC
и публикацию, которую будем использовать для репликации.

Для этого перейдите в **SQL Editor** вашего проекта Supabase.
Здесь можно выполнить следующие SQL-команды:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Give replication permission to the USER
  ALTER USER clickpipes_user REPLICATION;

-- Create a publication. We will use this when creating the mirror
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image
  img={supabase_commands}
  alt='Команды для создания пользователя и публикации'
  size='large'
  border
/>

Нажмите **Run**, чтобы создать публикацию и пользователя.

:::note

Обязательно замените `clickpipes_user` и `clickpipes_password` на желаемые имя пользователя и пароль.

Также не забудьте использовать то же имя публикации при создании зеркала в ClickPipes.

:::


## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

:::warning

Этот шаг приведет к перезапуску базы данных Supabase и может вызвать кратковременный простой.

Вы можете увеличить параметр `max_slot_wal_keep_size` для базы данных Supabase до большего значения (не менее 100 ГБ или `102400`), следуя инструкциям в [документации Supabase](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters)

Для получения более точных рекомендаций по выбору этого значения обратитесь к команде ClickPipes.

:::


## Параметры подключения для Supabase {#connection-details-to-use-for-supabase}

Перейдите в настройки проекта Supabase: `Project Settings` -> `Database` (в разделе `Configuration`).

**Важно**: Отключите параметр `Display connection pooler` на этой странице и перейдите в раздел `Connection parameters`, чтобы записать или скопировать параметры подключения.

<Image
  img={supabase_connection_details}
  size='lg'
  border
  alt='Расположение параметров подключения Supabase'
  border
/>

:::info

Пулер подключений не поддерживается для репликации на основе CDC, поэтому его необходимо отключить.

:::


## Примечание о RLS {#note-on-rls}

Пользователь ClickPipes Postgres не должен быть ограничен политиками RLS, так как это может привести к потере данных. Политики RLS для пользователя можно отключить, выполнив следующую команду:

```sql
ALTER USER clickpipes_user BYPASSRLS;
```


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.
