---
sidebar_label: 'Neon Postgres'
description: 'Настройка инстанса Neon Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Руководство по настройке источника Neon Postgres'
doc_type: 'guide'
keywords: ['clickpipes', 'postgresql', 'cdc', 'загрузка данных', 'синхронизация в реальном времени']
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Neon Postgres

Это руководство по настройке Neon Postgres, который вы можете использовать для репликации в ClickPipes.
Перед началом убедитесь, что вы вошли в свою [консоль Neon](https://console.neon.tech/app/projects).



## Создание пользователя с правами доступа {#creating-a-user-with-permissions}

Создадим нового пользователя для ClickPipes с необходимыми правами доступа, подходящими для CDC,
а также создадим публикацию, которую будем использовать для репликации.

Для этого перейдите на вкладку **SQL Editor**.
Здесь можно выполнить следующие SQL-команды:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Предоставляем пользователю права на репликацию
  ALTER USER clickpipes_user REPLICATION;

-- Создаём публикацию. Она будет использоваться при создании зеркала
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image
  size='lg'
  img={neon_commands}
  alt='Команды для создания пользователя и публикации'
  border
/>

Нажмите **Run**, чтобы создать публикацию и пользователя.


## Включение логической репликации {#enable-logical-replication}

В Neon логическую репликацию можно включить через пользовательский интерфейс. Это необходимо для репликации данных с помощью CDC в ClickPipes.
Перейдите на вкладку **Settings** (Настройки), затем в раздел **Logical Replication** (Логическая репликация).

<Image
  size='lg'
  img={neon_enable_replication}
  alt='Включение логической репликации'
  border
/>

Нажмите **Enable** (Включить), чтобы завершить настройку. После включения вы увидите сообщение об успешном выполнении.

<Image
  size='lg'
  img={neon_enabled_replication}
  alt='Логическая репликация включена'
  border
/>

Проверьте следующие настройки в вашем экземпляре Neon Postgres:

```sql
SHOW wal_level; -- должно быть logical
SHOW max_wal_senders; -- должно быть 10
SHOW max_replication_slots; -- должно быть 10
```


## Белый список IP-адресов (для корпоративного плана Neon) {#ip-whitelisting-for-neon-enterprise-plan}

Если у вас корпоративный план Neon Enterprise, вы можете добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в белый список, чтобы разрешить репликацию из ClickPipes в ваш экземпляр Neon Postgres.
Для этого перейдите на вкладку **Settings** и откройте раздел **IP Allow**.

<Image size='lg' img={neon_ip_allow} alt='Экран настройки разрешенных IP-адресов' border />


## Копирование параметров подключения {#copy-connection-details}

Теперь, когда пользователь создан, публикация готова и репликация включена, можно скопировать параметры подключения для создания нового ClickPipe.
Перейдите в раздел **Dashboard** и в текстовом поле, где отображается строка подключения,
измените представление на **Parameters Only**. Эти параметры понадобятся на следующем шаге.

<Image size='lg' img={neon_conn_details} alt='Параметры подключения' border />


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.
