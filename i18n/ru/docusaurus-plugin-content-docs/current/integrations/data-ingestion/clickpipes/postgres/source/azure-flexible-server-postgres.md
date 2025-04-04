---
sidebar_label: 'Гибкий сервер Azure для Postgres'
description: 'Настройка гибкого сервера Azure для Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Руководство по настройке источника гибкого сервера Azure для Postgres'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника гибкого сервера Azure для Postgres

ClickPipes поддерживает версию Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

**Вам не нужно** следовать ниже приведённым шагам, если `wal_level` установлен в `logical`. Этот параметр, как правило, должен быть предварительно настроен, если вы мигрируете с другого инструмента репликации данных.

1. Нажмите на раздел **Параметры сервера**

<Image img={server_parameters} alt="Параметры сервера в Гибком сервере Azure для Postgres" size="lg" border/>

2. Измените `wal_level` на `logical`

<Image img={wal_level} alt="Изменение wal_level на logical в Гибком сервере Azure для Postgres" size="lg" border/>

3. Это изменение потребует перезагрузки сервера. Поэтому перезагрузите сервер, когда будет предложено.

<Image img={restart} alt="Перезагрузка сервера после изменения wal_level" size="lg" border/>

## Создание пользователя ClickPipes и предоставление разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Гибкому серверу Azure Postgres через администратора и выполните ниже приведённые команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте пользователю `clickpipes_user` доступ только для чтения к схеме, из которой вы реплицируете таблицы. Ниже приведённый пример показывает, как настроить разрешения для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, вы можете выполнить эти три команды для каждой схемы.

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Предоставьте этому пользователю доступ к репликации:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте публикацию, которую вы будете использовать для создания MIRROR (репликации) в будущем.

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. Установите `wal_sender_timeout` в 0 для `clickpipes_user`

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## Добавление IP-адресов ClickPipes в брандмауэр {#add-clickpipes-ips-to-firewall}

Пожалуйста, выполните следующие шаги, чтобы добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в вашу сеть.

1. Перейдите на вкладку **Сеть** и добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в брандмауэр вашего Гибкого сервера Azure Postgres ИЛИ в Jump Server/Bastion, если вы используете SSH-туннелирование.

<Image img={firewall} alt="Добавление IP-адресов ClickPipes в брандмауэр Гибкого сервера Azure для Postgres" size="lg"/>


## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать прием данных из вашей инстанции Postgres в ClickHouse Cloud.
Не забудьте записать детали соединения, которые вы использовали при настройке вашей инстанции Postgres, так как они понадобятся вам в процессе создания ClickPipe.
