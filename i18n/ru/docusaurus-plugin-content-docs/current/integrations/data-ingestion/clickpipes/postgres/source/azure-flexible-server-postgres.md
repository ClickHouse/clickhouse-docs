---
sidebar_label: 'Azure Flexible Server для Postgres'
description: 'Настройка Azure Flexible Server для Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Руководство по настройке источника Azure Flexible Server для Postgres'
keywords: ['azure', 'flexible server', 'postgres', 'clickpipes', 'wal level']
doc_type: 'guide'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Azure Flexible Server для Postgres

ClickPipes поддерживает Postgres версии 12 и новее.



## Включение логической репликации {#enable-logical-replication}

**Вам не требуется** выполнять приведенные ниже действия, если параметр `wal_level` установлен в значение `logical`. Эта настройка обычно уже предварительно сконфигурирована, если вы мигрируете с другого инструмента репликации данных.

1. Перейдите в раздел **Server parameters** (Параметры сервера)

<Image
  img={server_parameters}
  alt='Параметры сервера в Azure Flexible Server для Postgres'
  size='lg'
  border
/>

2. Измените значение параметра `wal_level` на `logical`

<Image
  img={wal_level}
  alt='Изменение параметра wal_level на logical в Azure Flexible Server для Postgres'
  size='lg'
  border
/>

3. Это изменение требует перезапуска сервера. Перезапустите сервер при появлении соответствующего запроса.

<Image
  img={restart}
  alt='Перезапуск сервера после изменения параметра wal_level'
  size='lg'
  border
/>


## Создание пользователей ClickPipes и предоставление разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Azure Flexible Server Postgres от имени администратора и выполните следующие команды:

1. Создайте пользователя Postgres специально для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте доступ только для чтения к схеме, из которой реплицируются таблицы, для пользователя `clickpipes_user`. В примере ниже показана настройка разрешений для схемы `public`. Если необходимо предоставить доступ к нескольким схемам, выполните эти три команды для каждой схемы.

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Предоставьте этому пользователю права на репликацию:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте публикацию, которая будет использоваться для создания MIRROR (репликации) в дальнейшем.

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. Установите значение `wal_sender_timeout` равным 0 для `clickpipes_user`

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```


## Добавление IP-адресов ClickPipes в брандмауэр {#add-clickpipes-ips-to-firewall}

Выполните следующие действия, чтобы добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в вашу сеть.

1. Перейдите на вкладку **Networking** и добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в брандмауэр
   вашего Azure Flexible Server Postgres ИЛИ Jump Server/Bastion, если используется SSH-туннелирование.

<Image
  img={firewall}
  alt='Добавление IP-адресов ClickPipes в брандмауэр Azure Flexible Server для Postgres'
  size='lg'
/>


## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.
