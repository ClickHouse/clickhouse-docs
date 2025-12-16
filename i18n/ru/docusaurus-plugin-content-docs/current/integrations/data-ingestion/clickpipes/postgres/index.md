---
sidebar_label: 'Приём данных из Postgres в ClickHouse'
description: 'Бесшовно подключайте Postgres к ClickHouse Cloud.'
slug: /integrations/clickpipes/postgres
title: 'Приём данных из Postgres в ClickHouse (с использованием CDC)'
keywords: ['PostgreSQL', 'ClickPipes', 'CDC', 'фиксация изменений данных', 'репликация баз данных']
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_tile from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-tile.png'
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';

# Приём данных из Postgres в ClickHouse (с использованием CDC) {#ingesting-data-from-postgres-to-clickhouse-using-cdc}

Вы можете использовать ClickPipes для приёма данных из исходной базы данных Postgres в ClickHouse Cloud. Исходная база данных Postgres может быть развернута в локальной инфраструктуре (on-premises) или в облаке, включая Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase и другие.

## Предварительные требования {#prerequisites}

Прежде чем начать, необходимо убедиться, что ваша база данных Postgres корректно настроена. В зависимости от используемого экземпляра Postgres вы можете следовать одному из следующих руководств:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic), если вы используете другого провайдера Postgres или самостоятельно развернутый экземпляр.

9. [TimescaleDB](./postgres/source/timescale), если вы используете расширение TimescaleDB в управляемом сервисе или на самостоятельно развернутом экземпляре.

:::warning

Прокси-сервисы для Postgres, такие как PgBouncer, RDS Proxy, Supabase Pooler и т. п., не поддерживаются для репликации на основе CDC. Обязательно НЕ используйте их при настройке ClickPipes и вместо этого укажите параметры подключения к самой базе данных Postgres.

:::

После того как исходная база данных Postgres настроена, вы можете продолжить создание ClickPipe.

## Создание вашего ClickPipe {#creating-your-clickpipe}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO обновить изображение здесь)
1. В консоли ClickHouse Cloud перейдите к своему ClickHouse Cloud Service.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. В левой панели меню выберите кнопку `Data Sources` и нажмите «Set up a ClickPipe».

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

3. Выберите плитку `Postgres CDC`.

   <Image img={postgres_tile} alt="Выбор Postgres" size="lg" border/>

### Добавление подключения к исходной базе данных Postgres {#adding-your-source-postgres-database-connection}

4. Заполните параметры подключения к вашей исходной базе данных Postgres, которую вы настроили на этапе предварительной настройки.

   :::info

   Прежде чем добавлять параметры подключения, убедитесь, что вы добавили IP-адреса ClickPipes в список разрешенных адресов в правилах брандмауэра. Список IP-адресов ClickPipes можно найти [здесь](../index.md#list-of-static-ips).
   За дополнительной информацией обратитесь к руководствам по настройке исходного Postgres, приведенным [в начале этой страницы](#prerequisites).

   :::

   <Image img={postgres_connection_details} alt="Заполнение параметров подключения" size="lg" border/>

#### (Необязательно) Настройка AWS Private Link {#optional-setting-up-aws-private-link}

Вы можете использовать AWS Private Link для подключения к вашей исходной базе данных Postgres, если она размещена в AWS. Это полезно, если вы
хотите, чтобы передача данных оставалась конфиденциальной.
Вы можете следовать [руководству по настройке подключения](/integrations/clickpipes/aws-privatelink).

#### (Необязательно) Настройка SSH-туннелирования {#optional-setting-up-ssh-tunneling}

Вы можете указать параметры SSH-туннелирования, если ваша исходная база данных Postgres недоступна из публичной сети.

1. Включите переключатель «Use SSH Tunnelling».
2. Заполните параметры SSH-подключения.

   <Image img={ssh_tunnel} alt="SSH-туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию на основе ключей, нажмите «Revoke and generate key pair», чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный открытый ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите «Verify Connection», чтобы проверить подключение.

:::note

Убедитесь, что вы внесли [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в список разрешенных адресов в правилах брандмауэра для SSH-бастион-хоста, чтобы ClickPipes смог установить SSH-туннель.

:::

После заполнения параметров подключения нажмите «Next».

### Настройка параметров репликации {#configuring-the-replication-settings}

5. Убедитесь, что вы выбрали слот репликации из раскрывающегося списка, который вы создали на этапе предварительной настройки.

   <Image img={select_replication_slot} alt="Выбор слота репликации" size="lg" border/>

#### Дополнительные настройки {#advanced-settings}

При необходимости вы можете настроить дополнительные параметры. Краткое описание каждого параметра приведено ниже:

- **Sync interval**: Интервал, с которым ClickPipes будет опрашивать исходную базу данных на наличие изменений. Это влияет на целевой сервис ClickHouse; для пользователей, чувствительных к стоимости, мы рекомендуем устанавливать более высокое значение (более `3600`).
- **Parallel threads for initial load**: Количество параллельных рабочих потоков, которые будут использоваться для получения начального снимка. Это полезно, когда у вас много таблиц и вы хотите контролировать количество параллельных рабочих процессов, используемых для получения начального снимка. Этот параметр задается для каждой таблицы.
- **Pull batch size**: Количество строк, извлекаемых за один пакет. Это желаемое значение, которое может не соблюдаться во всех случаях.
- **Snapshot number of rows per partition**: Количество строк, которые будут извлекаться в каждом разделе во время начального снимка. Это полезно, когда у вас много строк в таблицах и вы хотите контролировать количество строк, извлекаемых в каждом разделе.
- **Snapshot number of tables in parallel**: Количество таблиц, которые будут загружаться параллельно во время начального снимка. Это полезно, когда у вас много таблиц и вы хотите контролировать количество таблиц, загружаемых параллельно.

### Настройка таблиц {#configuring-the-tables}

6. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете либо выбрать существующую базу данных, либо создать новую.

   <Image img={select_destination_db} alt="Выбор целевой базы данных" size="lg" border/>

7. Вы можете выбрать таблицы, которые нужно реплицировать из исходной базы данных Postgres. При выборе таблиц вы также можете переименовать их в целевой базе данных ClickHouse, а также исключить определённые столбцы.

   :::warning
   Если вы задаёте ключ упорядочивания в ClickHouse, отличающийся от первичного ключа в Postgres, не забудьте ознакомиться со всеми [рекомендациями](/integrations/clickpipes/postgres/ordering_keys), связанными с этим.
   :::

### Проверьте права доступа и запустите ClickPipe {#review-permissions-and-start-the-clickpipe}

8. Выберите роль "Full access" в раскрывающемся списке прав доступа и нажмите "Complete Setup".

   <Image img={ch_permissions} alt="Просмотр прав доступа" size="lg" border/>

## Что дальше? {#whats-next}

После того как вы настроите ClickPipe для репликации данных из PostgreSQL в ClickHouse Cloud, вы можете сосредоточиться на том, как выполнять запросы к данным и моделировать их для оптимальной производительности. Ознакомьтесь с [руководством по миграции](/migrations/postgresql/overview), чтобы оценить, какая стратегия лучше всего соответствует вашим требованиям, а также со страницами [Стратегии дедупликации (с использованием CDC)](/integrations/clickpipes/postgres/deduplication) и [Ключи упорядочивания](/integrations/clickpipes/postgres/ordering_keys), где описаны передовые практики для сценариев с нагрузками CDC.

Для ответов на часто задаваемые вопросы по PostgreSQL CDC и устранения неполадок см. [страницу часто задаваемых вопросов по Postgres](/integrations/clickpipes/postgres/faq).
