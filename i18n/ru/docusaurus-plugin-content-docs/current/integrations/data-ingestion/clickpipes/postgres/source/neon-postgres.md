---
sidebar_label: 'Neon Postgres'
description: 'Настройка экземпляра Neon Postgres как источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Руководство по настройке источника Neon Postgres'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';

# Руководство по настройке источника Neon Postgres {#neon-postgres-source-setup-guide}

Это руководство по настройке Neon Postgres, который вы можете использовать для репликации данных в ClickPipes.
Для выполнения этой настройки убедитесь, что вы вошли в свою [консоль Neon](https://console.neon.tech/app/projects).

## Создание пользователя с правами доступа {#creating-a-user-with-permissions}

Давайте создадим нового пользователя для ClickPipes с необходимыми правами доступа для CDC,
а также создадим публикацию, которую будем использовать для репликации.

Для этого перейдите на вкладку **SQL Editor**.
Здесь мы можем выполнить следующие SQL команды:

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

<Image size="lg" img={neon_commands} alt="Команды для пользователя и публикации" border />

Нажмите **Run**, чтобы создать пользователя и публикацию.

## Включите логическую репликацию {#enable-logical-replication}

В Neon вы можете включить логическую репликацию через интерфейс. Это необходимо для работы CDC (фиксации изменений данных) в ClickPipes, чтобы реплицировать данные.
Перейдите на вкладку **Settings**, затем в раздел **Logical Replication**.

<Image size="lg" img={neon_enable_replication} alt="Включение логической репликации" border />

Нажмите **Enable**, чтобы завершить настройку. После включения вы должны увидеть сообщение об успешном выполнении, приведённое ниже.

<Image size="lg" img={neon_enabled_replication} alt="Логическая репликация включена" border />

Давайте проверим следующие настройки в вашем экземпляре Neon Postgres:

```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## Разрешение IP-адресов (для тарифа Neon Enterprise) {#ip-whitelisting-for-neon-enterprise-plan}
Если вы используете тариф Neon Enterprise, вы можете разрешить [IP-адреса ClickPipes](../../index.md#list-of-static-ips), чтобы включить репликацию из ClickPipes в экземпляр Neon Postgres.
Для этого откройте вкладку **Settings** и перейдите в раздел **IP Allow**.

<Image size="lg" img={neon_ip_allow} alt="Экран настройки разрешенных IP-адресов" border/>

## Скопируйте данные подключения {#copy-connection-details}
Теперь, когда у нас создан пользователь, подготовлена публикация и включена репликация, мы можем скопировать данные подключения, чтобы создать новый ClickPipe.
Перейдите в **Dashboard** и в текстовом поле, где отображается строка подключения,
измените режим отображения на **Parameters Only**. Эти параметры понадобятся нам на следующем шаге.

<Image size="lg" img={neon_conn_details} alt="Данные подключения" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, поскольку они понадобятся вам при создании ClickPipe.
