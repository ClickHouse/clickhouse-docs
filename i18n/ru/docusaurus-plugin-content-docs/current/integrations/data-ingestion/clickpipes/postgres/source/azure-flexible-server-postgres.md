---
sidebar_label: 'Azure Flexible Server для Postgres'
description: 'Настройте Azure Flexible Server для Postgres как источник для ClickPipes'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';


# Руководство по настройке источника Azure Flexible Server для Postgres

ClickPipes поддерживает версии Postgres 12 и выше.

## Включение логической репликации {#enable-logical-replication}

**Вам не нужно** выполнять следующие шаги, если `wal_level` установлен на `logical`. Эта настройка должна быть в основном предварительно настроена, если вы мигрируете с другого инструмента репликации данных.

1. Нажмите на раздел **Server parameters**

<img src={server_parameters} alt="Параметры сервера в Azure Flexible Server для Postgres" />

2. Измените `wal_level` на `logical`

<img src={wal_level} alt="Изменить wal_level на logical в Azure Flexible Server для Postgres" />

3. Это изменение потребует перезапуска сервера. Перезапустите, когда будет запрошено.

<img src={restart} alt="Перезапустите сервер после изменения wal_level" />

## Создание пользователя ClickPipes и предоставление прав {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Azure Flexible Server Postgres через администратора и выполните следующие команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте доступ только для чтения к схеме, из которой вы реплицируете таблицы в `clickpipes_user`. Пример ниже показывает настройку прав для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, вы можете выполнить эти три команды для каждой схемы.

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

1. Перейдите на вкладку **Networking** и добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в брандмауэр вашего Azure Flexible Server Postgres ИЛИ Jump Server/Bastion, если вы используете SSH-туннелирование.

<img src={firewall} alt="Добавить IP-адреса ClickPipes в брандмауэр в Azure Flexible Server для Postgres" />

## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загружать данные из вашего экземпляра Postgres в ClickHouse Cloud. Не забудьте записать детали соединения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам во время процесса создания ClickPipe.
