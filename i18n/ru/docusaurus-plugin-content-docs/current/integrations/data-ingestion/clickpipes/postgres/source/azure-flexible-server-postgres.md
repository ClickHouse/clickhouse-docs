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


# Руководство по настройке источника Azure Flexible Server для Postgres {#azure-flexible-server-for-postgres-source-setup-guide}

ClickPipes поддерживает Postgres версии 12 и новее.



## Включение логической репликации {#enable-logical-replication}

**Вам не нужно** выполнять следующие шаги, если параметр `wal_level` уже установлен в значение `logical`. Этот параметр, как правило, уже настроен, если вы мигрируете с другого инструмента репликации данных.

1. Нажмите на раздел **Server parameters**

<Image img={server_parameters} alt="Server Parameters в Azure Flexible Server для Postgres" size="lg" border/>

2. Измените значение `wal_level` на `logical`

<Image img={wal_level} alt="Изменение wal_level на logical в Azure Flexible Server для Postgres" size="lg" border/>

3. Это изменение потребует перезапуска сервера. Перезапустите сервер, когда будет предложено.

<Image img={restart} alt="Перезапуск сервера после изменения wal_level" size="lg" border/>



## Создание пользователей ClickPipes и выдача прав доступа {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Azure Flexible Server Postgres под учетной записью администратора и выполните следующие команды:

1. Создайте пользователя Postgres, предназначенного исключительно для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте пользователю `clickpipes_user` доступ только на чтение к схеме, из которой вы реплицируете таблицы. В приведенном ниже примере показана настройка прав доступа для схемы `public`. Если вы хотите выдать доступ к нескольким схемам, выполните эти три команды для каждой схемы.

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Выдайте этому пользователю права на репликацию:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте публикацию, которую вы будете использовать для создания MIRROR (репликации) в будущем.

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

5. Установите для `clickpipes_user` значение `wal_sender_timeout`, равное 0.

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```



## Добавьте IP-адреса ClickPipes в Firewall {#add-clickpipes-ips-to-firewall}

Выполните следующие шаги, чтобы добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в вашу сеть.

1. Перейдите на вкладку **Networking** и добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в Firewall
   вашего Azure Flexible Server for Postgres или Jump Server/Bastion, если вы используете SSH-туннелирование.

<Image img={firewall} alt="Добавление IP-адресов ClickPipes в Firewall в Azure Flexible Server for Postgres" size="lg"/>



## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из вашего экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся вам при создании ClickPipe.
