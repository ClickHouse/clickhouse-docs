---
'sidebar_label': 'Neon Postgres'
'description': 'Настройка экземпляра Neon Postgres в качестве источника для ClickPipes'
'slug': '/integrations/clickpipes/postgres/source/neon-postgres'
'title': 'Настройка источника Neon Postgres'
'doc_type': 'guide'
---

import neon_commands from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-commands.png'
import neon_enable_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enable-replication.png'
import neon_enabled_replication from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-enabled-replication.png'
import neon_ip_allow from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-ip-allow.png'
import neon_conn_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/setup/neon-postgres/neon-conn-details.png'
import Image from '@theme/IdealImage';


# Руководство по настройке источника Neon Postgres

Это руководство о том, как настроить Neon Postgres, который вы можете использовать для репликации в ClickPipes. Убедитесь, что вы вошли в свою [консоль Neon](https://console.neon.tech/app/projects) для этой настройки.

## Создание пользователя с правами {#creating-a-user-with-permissions}

Давайте создадим нового пользователя для ClickPipes с необходимыми правами, подходящими для CDC, и также создадим публикацию, которую мы будем использовать для репликации.

Для этого вы можете перейти на вкладку **SQL Editor**. Здесь мы можем выполнить следующие SQL команды:

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

<Image size="lg" img={neon_commands} alt="Команды пользователя и публикации" border/>

Нажмите на **Run**, чтобы подготовить публикацию и пользователя.

## Включение логической репликации {#enable-logical-replication}
В Neon вы можете включить логическую репликацию через интерфейс. Это необходимо для того, чтобы CDC ClickPipes мог реплицировать данные. Перейдите на вкладку **Settings**, а затем в раздел **Logical Replication**.

<Image size="lg" img={neon_enable_replication} alt="Включение логической репликации" border/>

Нажмите на **Enable**, чтобы все настроить. Вы должны увидеть сообщение об успехе, как только вы это включите.

<Image size="lg" img={neon_enabled_replication} alt="Логическая репликация включена" border/>

Давайте проверим следующие настройки в вашем экземпляре Neon Postgres:
```sql
SHOW wal_level; -- should be logical
SHOW max_wal_senders; -- should be 10
SHOW max_replication_slots; -- should be 10
```

## Белый список IP-адресов (для плана Neon Enterprise) {#ip-whitelisting-for-neon-enterprise-plan}
Если у вас есть план Neon Enterprise, вы можете добавить в белый список [IP-адреса ClickPipes](../../index.md#list-of-static-ips), чтобы разрешить репликацию из ClickPipes в ваш экземпляр Neon Postgres. Для этого вы можете кликнуть на вкладку **Settings** и перейти в раздел **IP Allow**.

<Image size="lg" img={neon_ip_allow} alt="Экран разрешения IP" border/>

## Копирование данных подключения {#copy-connection-details}
Теперь, когда у нас есть пользователь, публикация готова, и репликация включена, мы можем скопировать данные подключения для создания нового ClickPipe. Перейдите на **Dashboard** и в текстовом поле, где отображается строка подключения, измените вид на **Parameters Only**. Эти параметры нам понадобятся на следующем этапе.

<Image size="lg" img={neon_conn_details} alt="Детали подключения" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud. Убедитесь, что вы записали данные подключения, которые использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
