---
slug: '/integrations/clickpipes/postgres/source/supabase'
sidebar_label: 'Supabase Postgres'
description: 'Настройка экземпляра Supabase в качестве источника для ClickPipes'
title: 'Руководство по настройке источника Supabase'
doc_type: guide
---
import supabase_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-commands.jpg'
import supabase_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/supabase/supabase-connection-details.jpg'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Supabase

Это руководство о том, как настроить Supabase Postgres для использования в ClickPipes.

:::note

ClickPipes поддерживает Supabase через IPv6 изначально для бесшовной репликации.

:::

## Создание пользователя с разрешениями и слотом репликации {#creating-a-user-with-permissions-and-replication-slot}

Давайте создадим нового пользователя для ClickPipes с необходимыми разрешениями, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого вы можете перейти в **SQL Редактор** вашего проекта Supabase. Здесь мы можем выполнить следующие SQL команды:
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

<Image img={supabase_commands} alt="Команды пользователя и публикации" size="large" border/>

Нажмите **Запустить**, чтобы получить готовую публикацию и пользователя.

:::note

Не забудьте заменить `clickpipes_user` и `clickpipes_password` на желаемое имя пользователя и пароль.

Также помните, что необходимо использовать то же имя публикации при создании зеркала в ClickPipes.

:::

## Увеличение `max_slot_wal_keep_size` {#increase-max_slot_wal_keep_size}

:::warning

Этот шаг перезапустит вашу базу данных Supabase и может вызвать кратковременные простои.

Вы можете увеличить параметры `max_slot_wal_keep_size` для вашей базы данных Supabase до более высокого значения (не менее 100 ГБ или `102400`), следуя [документации Supabase](https://supabase.com/docs/guides/database/custom-postgres-config#cli-supported-parameters).

Для более точной рекомендации этого значения вы можете обратиться в команду ClickPipes.

:::

## Подробности подключения для использования с Supabase {#connection-details-to-use-for-supabase}

Перейдите в `Настройки проекта` вашего Supabase -> `База данных` (в разделе `Конфигурация`).

**Важно**: Отключите `Отобразить пул соединений` на этой странице и перейдите в раздел `Параметры подключения`, запишите/скопируйте параметры.

<Image img={supabase_connection_details} size="lg" border alt="Найдите детали подключения Supabase" border/>

:::info

Пул соединений не поддерживается для репликации на основе CDC, поэтому его необходимо отключить.

:::

## Примечание по RLS {#note-on-rls}
Пользователь Postgres ClickPipes не должен быть ограничен политиками RLS, так как это может привести к потере данных. Вы можете отключить политики RLS для пользователя, выполнив следующую команду:
```sql
ALTER USER clickpipes_user BYPASSRLS;
```

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать прием данных из вашей инстанции Postgres в ClickHouse Cloud. Убедитесь, что вы запомнили детали подключения, которые вы использовали при настройке вашей инстанции Postgres, так как они понадобятся вам в процессе создания ClickPipe.