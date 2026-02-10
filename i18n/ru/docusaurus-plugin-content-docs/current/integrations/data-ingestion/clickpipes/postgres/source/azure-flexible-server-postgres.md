---
sidebar_label: 'Azure Flexible Server для Postgres'
description: 'Настройка Azure Flexible Server для Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/azure-flexible-server-postgres
title: 'Руководство по настройке источника Azure Flexible Server для Postgres'
keywords: ['azure', 'flexible server', 'postgres', 'clickpipes', 'wal level']
doc_type: 'guide'
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import server_parameters from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/server_parameters.png';
import wal_level from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/wal_level.png';
import restart from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/restart.png';
import firewall from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/azure-flexible-server-postgres/firewall.png';
import Image from '@theme/IdealImage';


# Руководство по настройке источника Azure Flexible Server для Postgres \{#azure-flexible-server-for-postgres-source-setup-guide\}

ClickPipes поддерживает Postgres версии 12 и выше.

## Включение логической репликации \{#enable-logical-replication\}

**Вам не нужно** выполнять приведённые ниже шаги, если `wal_level` установлен в значение `logical`. Этот параметр, как правило, уже настроен заранее, если вы мигрируете с другого инструмента репликации данных.

1. Перейдите в раздел **Server parameters**

<Image img={server_parameters} alt="Параметры сервера в Azure Flexible Server for Postgres" size="lg" border/>

2. Измените значение `wal_level` на `logical`

<Image img={wal_level} alt="Изменение wal_level на logical в Azure Flexible Server for Postgres" size="lg" border/>

3. Это изменение потребует перезапуска сервера, поэтому перезапустите его, когда получите соответствующий запрос.

<Image img={restart} alt="Перезапуск сервера после изменения wal_level" size="lg" border/>

## Создание пользователей ClickPipes и выдача прав доступа \{#creating-clickpipes-user-and-granting-permissions\}

Подключитесь к Azure Flexible Server Postgres под учетной записью администратора и выполните следующие команды:

1. Создайте отдельного пользователя для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте на уровне схемы доступ только для чтения пользователю, которого вы создали на предыдущем шаге. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Выдайте пользователю привилегии репликации:

   ```sql
   ALTER USER clickpipes_user WITH REPLICATION;
   ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в публикацию только необходимые таблицы, чтобы избежать лишней нагрузки на производительность.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **первичный ключ**, _либо_ иметь **replica identity**, настроенную в значение `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по выбору области публикаций.
   :::

   - Чтобы создать публикацию для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в определённой схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, сгенерированных из указанных таблиц, и позже будет использоваться для приёма потока репликации.

5. Установите `wal_sender_timeout` в 0 для `clickpipes_user`:

   ```sql
   ALTER ROLE clickpipes_user SET wal_sender_timeout to 0;
   ```

## Добавьте IP-адреса ClickPipes в Firewall \{#add-clickpipes-ips-to-firewall\}

Выполните приведённые ниже шаги, чтобы добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в вашу сеть.

1. Перейдите на вкладку **Networking** и добавьте [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в Firewall
   вашего Azure Flexible Server Postgres или Jump Server/Bastion, если вы используете SSH-туннелирование.

<Image img={firewall} alt="Добавление IP-адресов ClickPipes в Firewall Azure Flexible Server Postgres" size="lg"/>

## Что дальше? \{#whats-next\}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно запишите параметры подключения, которые вы использовали при настройке экземпляра Postgres, так как они понадобятся при создании ClickPipe.