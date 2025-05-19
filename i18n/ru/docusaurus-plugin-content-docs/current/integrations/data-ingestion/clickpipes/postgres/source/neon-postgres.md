---
sidebar_label: 'Neon Postgres'
description: 'Настройка экземпляра Neon Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/neon-postgres
title: 'Руководство по настройке источника Neon Postgres'
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Neon Postgres

Это руководство о том, как настроить Neon Postgres, который можно использовать для репликации в ClickPipes. Убедитесь, что вы вошли в свою [консоль Neon](https://console.neon.tech/app/projects) для этой настройки.

## Создание пользователя с правами {#creating-a-user-with-permissions}

Давайте создадим нового пользователя для ClickPipes с необходимыми правами, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого вы можете перейти на вкладку **SQL Editor**. Здесь мы можем выполнить следующие SQL команды:

```sql
  CREATE USER clickpipes_user PASSWORD 'clickpipes_password';
  GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
  GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;

-- Дайте пользователю разрешение на репликацию
  ALTER USER clickpipes_user REPLICATION;

-- Создайте публикацию. Мы будем использовать это при создании моста
  CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
```

<Image size="lg" img={neon_commands} alt="Команды для пользователя и публикации" border/>

Нажмите **Run**, чтобы подготовить публикацию и пользователя.

## Включение логической репликации {#enable-logical-replication}
В Neon вы можете включить логическую репликацию через интерфейс. Это необходимо для репликации данных в CDC ClickPipes. Перейдите на вкладку **Settings**, а затем в раздел **Logical Replication**.

<Image size="lg" img={neon_enable_replication} alt="Включить логическую репликацию" border/>

Нажмите **Enable**, чтобы все было готово. Вы должны увидеть сообщение об успехе после включения.

<Image size="lg" img={neon_enabled_replication} alt="Логическая репликация включена" border/>

Давайте проверим следующие настройки в вашем экземпляре Neon Postgres:
```sql
SHOW wal_level; -- должно быть logical
SHOW max_wal_senders; -- должно быть 10
SHOW max_replication_slots; -- должно быть 10
```

## Белый список IP-адресов (для Neon Enterprise плана) {#ip-whitelisting-for-neon-enterprise-plan}
Если у вас есть план Neon Enterprise, вы можете внести в белый список [IP-адреса ClickPipes](../../index.md#list-of-static-ips), чтобы разрешить репликацию от ClickPipes к вашему экземпляру Neon Postgres. Для этого вы можете перейти на вкладку **Settings** и перейти в раздел **IP Allow**.

<Image size="lg" img={neon_ip_allow} alt="Экран разрешенных IP" border/>

## Копирование деталей соединения {#copy-connection-details}
Теперь, когда у нас есть пользователь, публикация и включенная репликация, мы можем скопировать детали соединения, чтобы создать новый ClickPipe. Перейдите на **Dashboard** и в текстовом поле, где отображается строка соединения, измените вид на **Parameters Only**. Эти параметры нам понадобятся на следующем этапе.

<Image size="lg" img={neon_conn_details} alt="Детали соединения" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать прием данных из вашего экземпляра Postgres в ClickHouse Cloud. Не забудьте записать детали соединения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
