---
sidebar_label: ClickPipes для Postgres
description: Бесшовное подключение вашего Postgres к ClickHouse Cloud.
slug: /integrations/clickpipes/postgres
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_tile from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-tile.jpg'
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'


# Погружение данных из Postgres в ClickHouse (с использованием CDC)

<BetaBadge/>

:::info
В настоящее время погружение данных из Postgres в ClickHouse Cloud через ClickPipes находится на публичной бета-версии.
:::


Вы можете использовать ClickPipes для погружения данных из вашей исходной базы данных Postgres в ClickHouse Cloud. Исходная база данных Postgres может быть размещена на локальном сервере или в облаке, включая Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase и другие.


## Предварительные требования {#prerequisites}

Чтобы начать, сначала убедитесь, что ваша база данных Postgres настроена правильно. В зависимости от вашей исходной инстанции Postgres, вы можете следовать любому из следующих руководств:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Supabase Postgres](./postgres/source/supabase)

3. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

4. [Azure Flexible Server для Postgres](./postgres/source/azure-flexible-server-postgres)

5. [Neon Postgres](./postgres/source/neon-postgres)

6. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

7. [Общий источник Postgres](./postgres/source/generic), если вы используете какого-либо другого поставщика Postgres или используете собственную инстанцию


:::warning

Прокси для Postgres, такие как PgBouncer, RDS Proxy, Supabase Pooler и т.д., не поддерживаются для репликации на основе CDC. Пожалуйста, убедитесь, что вы НЕ используете их для настройки ClickPipes, а вместо этого добавьте данные для подключения к фактической базе данных Postgres.

:::

Как только ваша исходная база данных Postgres настроена, вы можете продолжить создание вашего ClickPipe.

## Создание вашего ClickPipe {#creating-your-clickpipe}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)
1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<img src={cp_service} alt="Сервис ClickPipes" />

2. Выберите кнопку `Data Sources` в меню слева и нажмите "Настроить ClickPipe"

<img src={cp_step0} alt="Выберите импорт" />

3. Выберите плитку `Postgres CDC`

   <img src={postgres_tile} alt="Выберите Postgres" />

### Добавление соединения с вашей исходной базой данных Postgres {#adding-your-source-postgres-database-connection}

4. Заполните данные подключения для вашей исходной базы данных Postgres, которую вы настроили на этапе предварительных требований.

   :::info

   Перед тем как начать добавлять информацию для подключения, убедитесь, что вы внесли IP-адреса ClickPipes в белый список в правилах брандмауэра. Вы можете найти список IP-адресов ClickPipes [здесь](../index.md#list-of-static-ips).
   Для получения дополнительной информации ознакомьтесь с руководствами по настройке исходного Postgres, связанными в [верхней части этой страницы](#prerequisites).

   :::

   <img src={postgres_connection_details} alt="Заполните данные подключения" />

#### (Необязательно) Настройка SSH туннелирования {#optional-setting-up-ssh-tunneling}

Вы можете указать детали SSH туннелирования, если ваша исходная база данных Postgres недоступна публично.


1. Включите переключатель "Использовать SSH туннелирование".
2. Заполните данные подключения SSH.

   <img src={ssh_tunnel} alt="SSH туннелирование" />

3. Чтобы использовать аутентификацию на основе ключа, нажмите на "Отозвать и сгенерировать пару ключей", чтобы сгенерировать новую пару ключей и скопируйте сгенерированный открытый ключ на ваш SSH сервер в `~/.ssh/authorized_keys`.
4. Нажмите на "Проверить соединение", чтобы подтвердить соединение.

:::note

Убедитесь, что вы внесли [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в белый список в правилах брандмауэра для SSH бастионного хоста, чтобы ClickPipes мог установить SSH туннель.

:::

Как только данные подключения заполнены, нажмите "Далее".

### Настройка параметров репликации {#configuring-the-replication-settings}

5. Убедитесь, что вы выбрали слот репликации из выпадающего списка, который вы создали на этапе предварительных требований.

   <img src={select_replication_slot} alt="Выберите слот репликации" />

#### Расширенные настройки {#advanced-settings}

Вы можете настроить расширенные параметры при необходимости. Краткое описание каждого параметра приведено ниже:

- **Интервал синхронизации**: Это интервал, в течение которого ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это имеет значение для сервиса ClickHouse назначения, для экономных пользователей мы рекомендуем оставить это значение высоким (более `3600`).
- **Параллельные потоки для начальной загрузки**: Это количество параллельных рабочих процессов, которые будут использоваться для получения начального снимка. Это полезно, когда у вас большое количество таблиц, и вы хотите контролировать количество параллельных рабочих процессов, используемых для получения начального снимка. Эта настройка применяется к каждой таблице.
- **Размер партии для выборки**: Число строк, которые будут извлечены за один раз. Это настройка наилучшего усилия и может не учитываться во всех случаях.
- **Число строк снимка на партицию**: Это количество строк, которые будут извлечены в каждой партиции во время начального снимка. Это полезно, когда у вас большое количество строк в таблицах, и вы хотите контролировать количество строк, извлекаемых в каждой партиции.
- **Число таблиц для параллельного извлечения**: Это количество таблиц, которые будут извлечены параллельно во время начального снимка. Это полезно, когда у вас большое количество таблиц, и вы хотите контролировать количество таблиц, извлекаемых параллельно.


### Настройка таблиц {#configuring-the-tables}

6. Здесь вы можете выбрать базу данных назначения для вашего ClickPipe. Вы можете либо выбрать существующую базу данных, либо создать новую.

   <img src={select_destination_db} alt="Выберите базу данных назначения" />
   
7. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных Postgres. При выборе таблиц вы также можете переименовать таблицы в базе данных ClickHouse назначения, а также исключить конкретные колонки.

   :::warning

   Если вы определяете Ordering Key в ClickHouse иначе, чем Primary Key в Postgres, пожалуйста, не забудьте прочитать все [нюансы](https://docs.peerdb.io/mirror/ordering-key-different) вокруг этого!
   
   :::

### Проверьте права и начните ClickPipe {#review-permissions-and-start-the-clickpipe}

8. Выберите роль "Полный доступ" из выпадающего списка прав и нажмите "Завершить настройку".

   <img src={ch_permissions} alt="Проверьте права" />

## Что дальше? {#whats-next}

Как только вы переместили данные из Postgres в ClickHouse, следующий очевидный вопрос — как смоделировать ваши данные в ClickHouse, чтобы максимально их использовать. Пожалуйста, изучите эту страницу с [Советами по моделированию данных ClickHouse для пользователей Postgres](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling), чтобы помочь вам смоделировать данные в ClickHouse.

Кроме того, пожалуйста, ознакомьтесь с [FAQ по ClickPipes для Postgres](./postgres/faq) для получения дополнительной информации о распространенных проблемах и о том, как их решить.

:::info

[Это](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling) особенно важно, так как ClickHouse отличается от Postgres, и вы можете столкнуться с некоторыми сюрпризами. Это руководство помогает решить потенциальные трудности и гарантирует, что вы сможете в полной мере использовать ClickHouse.

:::
