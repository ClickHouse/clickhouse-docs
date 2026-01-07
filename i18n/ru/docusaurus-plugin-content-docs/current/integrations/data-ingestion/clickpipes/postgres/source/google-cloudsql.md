---
sidebar_label: 'Google Cloud SQL'
description: 'Настройка экземпляра Google Cloud SQL Postgres в качестве источника данных для ClickPipes'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Руководство по настройке источника Google Cloud SQL Postgres'
doc_type: 'guide'
keywords: ['google cloud sql', 'postgres', 'clickpipes', 'логическое декодирование', 'межсетевой экран']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';
import Image from '@theme/IdealImage';

# Руководство по настройке источника Google Cloud SQL Postgres {#google-cloud-sql-postgres-source-setup-guide}

:::info

Если вы используете одного из поддерживаемых провайдеров (см. боковую панель), обратитесь к соответствующему руководству по этому провайдеру.

:::

## Поддерживаемые версии Postgres {#supported-postgres-versions}

Любая версия Postgres 12 и новее

## Включение логической репликации {#enable-logical-replication}

**Вам не нужно** выполнять следующие шаги, если параметр `cloudsql.logical_decoding` включен, а `wal_sender_timeout` равен 0. Эти параметры, как правило, уже настроены заранее, если вы мигрируете с другого инструмента репликации данных.

1. Нажмите кнопку **Edit** на странице Overview.

<Image img={edit_button} alt="Кнопка Edit в Cloud SQL Postgres" size="lg" border/>

2. Перейдите в раздел Flags и измените `cloudsql.logical_decoding` на on, а `wal_sender_timeout` — на 0. Для применения этих изменений потребуется перезапустить сервер Postgres.

<Image img={cloudsql_logical_decoding1} alt="Изменение cloudsql.logical_decoding на on" size="lg" border/>

<Image img={cloudsql_logical_decoding2} alt="Изменены cloudsql.logical_decoding и wal_sender_timeout" size="lg" border/>

<Image img={cloudsql_logical_decoding3} alt="Перезапуск сервера" size="lg" border/>

## Создание пользователя ClickPipes и назначение прав {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Cloud SQL Postgres под учётной записью администратора и выполните следующие команды:

1. Создайте выделенного пользователя для ClickPipes:

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте на уровне схемы доступ только на чтение пользователю, созданному на предыдущем шаге. В следующем примере показаны права для схемы `public`. Повторите эти команды для каждой схемы, содержащей таблицы, которые вы хотите реплицировать:

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Предоставьте пользователю права на репликацию:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте [publication](https://www.postgresql.org/docs/current/logical-replication-publication.html) с таблицами, которые вы хотите реплицировать. Настоятельно рекомендуется включать в публикацию только те таблицы, которые вам действительно нужны, чтобы избежать лишней нагрузки на производительность.

   :::warning
   Любая таблица, включённая в публикацию, должна либо иметь определённый **primary key**, _либо_ иметь настроенную **replica identity** со значением `FULL`. См. раздел [Postgres FAQs](../faq.md#how-should-i-scope-my-publications-when-setting-up-replication) для рекомендаций по определению области публикаций.
   :::

   - Чтобы создать публикацию для конкретных таблиц:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLE table_to_replicate, table_to_replicate2;
      ```

   - Чтобы создать публикацию для всех таблиц в конкретной схеме:

      ```sql
      CREATE PUBLICATION clickpipes FOR TABLES IN SCHEMA "public";
      ```

   Публикация `clickpipes` будет содержать набор событий изменений, генерируемых указанными таблицами, и далее будет использоваться для приёма потока репликации.

[//]: # (TODO Add SSH Tunneling)

## Добавление IP-адресов ClickPipes в брандмауэр {#add-clickpipes-ips-to-firewall}

Выполните следующие шаги, чтобы добавить IP-адреса ClickPipes в вашу сеть.

:::note

Если вы используете SSH-туннелирование, вам необходимо добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в правила брандмауэра jump-сервера/бастиона.

:::

1. Перейдите в раздел **Connections**

<Image img={connections} alt="Раздел Connections в Cloud SQL" size="lg" border/>

2. Перейдите в подраздел Networking

<Image img={connections_networking} alt="Подраздел Networking в Cloud SQL" size="lg" border/>

3. Добавьте [публичные IP-адреса ClickPipes](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="Добавление сетей ClickPipes в брандмауэр" size="lg" border/>

<Image img={firewall2} alt="Сети ClickPipes добавлены в брандмауэр" size="lg" border/>

## Что дальше? {#whats-next}

Теперь вы можете [создать ClickPipe](../index.md) и начать приём данных из экземпляра Postgres в ClickHouse Cloud.
Обязательно сохраните сведения о подключении, которые вы использовали при настройке экземпляра Postgres — они понадобятся при создании ClickPipe.