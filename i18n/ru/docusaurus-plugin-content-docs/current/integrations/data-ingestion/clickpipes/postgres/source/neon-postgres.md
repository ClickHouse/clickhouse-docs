---
sidebar_label: Neon Postgres
description: Настройка экземпляра Neon Postgres в качестве источника для ClickPipes
slug: /integrations/clickpipes/postgres/source/neon-postgres
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'


# Руководство по настройке источника Neon Postgres

Это руководство о том, как настроить Neon Postgres, который вы можете использовать для репликации в ClickPipes.
Убедитесь, что вы вошли в свою [консоль Neon](https://console.neon.tech/app/projects) для этой настройки.

## Создание пользователя с разрешениями {#creating-a-user-with-permissions}

Давайте создадим нового пользователя для ClickPipes с необходимыми разрешениями, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого перейдите на вкладку **SQL Console**.
Здесь мы можем выполнить следующие SQL команды:

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

<img src={neon_commands} alt="Команды для пользователя и публикации"/>

Нажмите **Run**, чтобы подготовить публикацию и пользователя.

## Включение логической репликации {#enable-logical-replication}
В Neon вы можете включить логическую репликацию через интерфейс. Это необходимо для того, чтобы CDC ClickPipes мог реплицировать данные.
Перейдите на вкладку **Settings**, а затем в раздел **Logical Replication**.

<img src={neon_enable_replication} alt="Включить логическую репликацию"/>

Нажмите **Enable**, чтобы все было готово. Вы должны увидеть ниже сообщение об успешной активации, как только вы её включите.

<img src={neon_enabled_replication} alt="Логическая репликация включена"/>

Давайте проверим следующие настройки в вашем экземпляре Neon Postgres:
```sql
SHOW wal_level; -- должно быть logical
SHOW max_wal_senders; -- должно быть 10
SHOW max_replication_slots; -- должно быть 10
```

## Белый список IP (Для плана Neon Enterprise) {#ip-whitelisting-for-neon-enterprise-plan}
Если у вас есть план Neon Enterprise, вы можете внести в белый список [IPs ClickPipes](../../index.md#list-of-static-ips), чтобы разрешить репликацию из ClickPipes в ваш экземпляр Neon Postgres.
Для этого вы можете нажать на вкладку **Settings** и перейти в раздел **IP Allow**.

<img src={neon_ip_allow} alt="Экран разрешения IP"/>

## Копировать детали подключения {#copy-connection-details}
Теперь, когда у нас есть пользователь, публикация и включенная репликация, мы можем скопировать детали подключения для создания нового ClickPipe.
Перейдите на **Dashboard** и в текстовом поле, где отображается строка подключения, измените вид на **Parameters Only**. Эти параметры нам понадобятся для следующего шага.

<img src={neon_conn_details} alt="Детали подключения"/>

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud.
Не забудьте записать детали подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
