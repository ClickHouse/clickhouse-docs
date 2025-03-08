---
sidebar_label: Google Cloud SQL
description: Настройте экземпляр Google Cloud SQL Postgres как источник для ClickPipes
slug: /integrations/clickpipes/postgres/source/google-cloudsql
---

import edit_button from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/edit.png';
import cloudsql_logical_decoding1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding1.png';
import cloudsql_logical_decoding2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding2.png';
import cloudsql_logical_decoding3 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/cloudsql_logical_decoding3.png';
import connections from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections.png';
import connections_networking from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/connections_networking.png';
import firewall1 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall1.png';
import firewall2 from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/source/google-cloudsql/firewall2.png';


# Настройка источника Google Cloud SQL Postgres

:::info

Если вы используете одного из поддерживаемых провайдеров (в боковой панели), пожалуйста, обратитесь к конкретному руководству для этого провайдера.

:::

## Поддерживаемые версии Postgres {#supported-postgres-versions}

Любая версия начиная с Postgres 12

## Включение логической репликации {#enable-logical-replication}

**Вам не нужно** следовать нижеизложенным шагам, если настройки `cloudsql.logical_decoding` включены и `wal_sender_timeout` равен 0. Эти настройки должны быть в основном предварительно сконфигурированы, если вы мигрируете с другого инструмента репликации данных.

1. Нажмите кнопку **Изменить** на странице Обзор.

<img src={edit_button} alt="Кнопка Изменить в Cloud SQL Postgres" />

2. Перейдите к Флагам и измените `cloudsql.logical_decoding` на включено, а `wal_sender_timeout` на 0. Эти изменения потребуют перезапуска вашего сервера Postgres.

<img src={cloudsql_logical_decoding1} alt="Изменение cloudsql.logical_decoding на включено" />
<img src={cloudsql_logical_decoding2} alt="Измененные cloudsql.logical_decoding и wal_sender_timeout" />
<img src={cloudsql_logical_decoding3} alt="Перезапуск сервера" />


## Создание пользователя ClickPipes и предоставление разрешений {#creating-clickpipes-user-and-granting-permissions}

Подключитесь к вашему Cloud SQL Postgres через администратора и выполните нижеуказанные команды:

1. Создайте пользователя Postgres исключительно для ClickPipes.

   ```sql
   CREATE USER clickpipes_user PASSWORD 'some-password';
   ```

2. Предоставьте только чтение доступ к схеме, из которой вы реплицируете таблицы для `clickpipes_user`. Пример ниже показывает настройку разрешений для схемы `public`. Если вы хотите предоставить доступ к нескольким схемам, вы можете выполнить эти три команды для каждой схемы.

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


## Добавить IP-адреса ClickPipes в брандмауэр {#add-clickpipes-ips-to-firewall}

Пожалуйста, выполните нижеуказанные шаги, чтобы добавить IP-адреса ClickPipes в вашу сеть.

:::note

Если вы используете SSH туннелирование, тогда вам нужно добавить [IP-адреса ClickPipes](../../index.md#list-of-static-ips) в правила брандмауэра Jump Server/Bastion.

:::

1. Перейдите в раздел **Подключения**

<img src={connections} alt="Раздел Подключения в Cloud SQL" />

2. Перейдите в подсекцию Сетевое взаимодействие

<img src={connections_networking} alt="Подсекция Сетевое взаимодействие в Cloud SQL" />

3. Добавьте [публичные IP-адреса ClickPipes](../../index.md#list-of-static-ips)

<img src={firewall1} alt="Добавить сети ClickPipes в брандмауэр" />
<img src={firewall2} alt="Сети ClickPipes добавлены в брандмауэр" />


## Что дальше? {#whats-next}

Теперь вы можете [создать свой ClickPipe](../index.md) и начать загрузку данных из вашего экземпляра Postgres в ClickHouse Cloud. Убедитесь, что вы записали данные соединения, которые вы использовали при настройке вашего экземпляра Postgres, так как они понадобятся вам в процессе создания ClickPipe.
