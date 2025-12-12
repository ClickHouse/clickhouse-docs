---
sidebar_label: 'Google Cloud SQL'
description: 'Настройка экземпляра Google Cloud SQL Postgres в качестве источника данных для ClickPipes'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Руководство по настройке источника Google Cloud SQL Postgres'
doc_type: 'guide'
keywords: ['google cloud sql', 'postgres', 'clickpipes', 'логическое декодирование', 'межсетевой экран']
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

## Создание пользователя ClickPipes и выдача прав {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Cloud SQL Postgres под администраторской учетной записью и выполните следующие команды:

1. Создайте отдельного пользователя Postgres, предназначенного исключительно для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте пользователю `clickpipes_user` доступ только для чтения к схеме, из которой вы реплицируете таблицы. Ниже приведен пример настройки прав для схемы `public`. Если вы хотите выдать доступ к нескольким схемам, выполните эти три команды для каждой схемы.

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Выдайте этому пользователю права на репликацию:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте publication, которую вы в дальнейшем будете использовать для создания MIRROR (репликации).

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # (TODO Добавить SSH-туннелирование)

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
