---
sidebar_label: 'Google Cloud SQL'
description: 'Настройка экземпляра Google Cloud SQL Postgres в качестве источника для ClickPipes'
slug: /integrations/clickpipes/postgres/source/google-cloudsql
title: 'Руководство по настройке источника Google Cloud SQL Postgres'
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


# Руководство по настройке источника Google Cloud SQL Postgres

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковом меню), пожалуйста, обратитесь к конкретному руководству для этого провайдера.

:::


## Поддерживаемые версии Postgres {#supported-postgres-versions}

Всё, что начиная с Postgres 12

## Включение логической репликации {#enable-logical-replication}

**Вам не нужно** выполнять следующие шаги, если настройки `cloudsql.logical_decoding` включены и `wal_sender_timeout` равен 0. Эти настройки должны быть в основном предварительно сконфигурированы, если вы мигрируете с другого инструмента репликации данных.

1. Нажмите кнопку **Редактировать** на странице Обзор.

<Image img={edit_button} alt="Кнопка редактирования в Cloud SQL Postgres" size="lg" border/>

2. Перейдите к флагам и измените `cloudsql.logical_decoding` на включено и `wal_sender_timeout` на 0. Эти изменения потребуют перезапуска вашего сервера Postgres.

<Image img={cloudsql_logical_decoding1} alt="Изменение cloudsql.logical_decoding на включено" size="lg" border/>
<Image img={cloudsql_logical_decoding2} alt="Изменены cloudsql.logical_decoding и wal_sender_timeout" size="lg" border/>
<Image img={cloudsql_logical_decoding3} alt="Перезапуск сервера" size="lg" border/>


## Создание пользователя ClickPipes и выдача разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Cloud SQL Postgres через администратора и выполните следующие команды:

1. Создайте пользователя Postgres только для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте пользователю `clickpipes_user` доступ только для чтения к схеме, из которой вы реплицируете таблицы. Ниже приведен пример настройки разрешений для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, вы можете выполнить эти три команды для каждой схемы.

   ```sql
   GRANT USAGE ON SCHEMA "public" TO clickpipes_user;
   GRANT SELECT ON ALL TABLES IN SCHEMA "public" TO clickpipes_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA "public" GRANT SELECT ON TABLES TO clickpipes_user;
   ```

3. Предоставьте этому пользователю доступ к репликации:

   ```sql
   ALTER ROLE clickpipes_user REPLICATION;
   ```

4. Создайте публикацию, которую вы будете использовать для создания ЗЕРКАЛА (репликации) в будущем.

   ```sql
   CREATE PUBLICATION clickpipes_publication FOR ALL TABLES;
   ```

[//]: # (TODO Добавить SSH туннелирование)


## Добавление IP-адресов ClickPipes в брандмауэр {#add-clickpipes-ips-to-firewall}

Пожалуйста, выполните следующие шаги, чтобы добавить IP-адреса ClickPipes в вашу сеть.

:::note

Если вы используете SSH туннелирование, вам нужно добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в правила брандмауэра Jump Server/Bastion.

:::

1. Перейдите в раздел **Подключения**

<Image img={connections} alt="Раздел подключения в Cloud SQL" size="lg" border/>

2. Перейдите в подраздел Сетевое взаимодействие

<Image img={connections_networking} alt="Подраздел сетевого взаимодействия в Cloud SQL" size="lg" border/>

3. Добавьте [публичные IP-адреса ClickPipes](../../index.md#list-of-static-ips)

<Image img={firewall1} alt="Добавление сетей ClickPipes в брандмауэр" size="lg" border/>
<Image img={firewall2} alt="Сети ClickPipes добавлены в брандмауэр" size="lg" border/>


## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать прием данных из вашего экземпляра Postgres в ClickHouse Cloud.
Не забудьте записать детали подключения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
