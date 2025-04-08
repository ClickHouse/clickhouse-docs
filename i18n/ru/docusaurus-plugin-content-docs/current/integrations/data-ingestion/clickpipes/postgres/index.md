---
sidebar_label: 'ClickPipes для Postgres'
description: 'Бесшовное подключение вашего Postgres к ClickHouse Cloud.'
slug: /integrations/clickpipes/postgres
title: 'Прием данных из Postgres в ClickHouse (с использованием CDC)'
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import postgres_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/postgres-connection-details.jpg'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_replication_slot from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-replication-slot.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/select-destination-db.jpg'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# Прием данных из Postgres в ClickHouse (с использованием CDC)

<BetaBadge/>

:::info
В настоящее время прием данных из Postgres в ClickHouse Cloud через ClickPipes находится в стадии публичной бета-версии.
:::


Вы можете использовать ClickPipes для приема данных из вашей исходной базы данных Postgres в ClickHouse Cloud. Исходная база данных Postgres может быть размещена на локальном сервере или в облаке, включая Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase и другие.


## Предварительные условия {#prerequisites}

Чтобы начать, вам необходимо убедиться, что ваша база данных Postgres настроена правильно. В зависимости от вашего экземпляра Postgres, вы можете следовать любому из следующих руководств:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic), если вы используете любого другого поставщика Postgres или собственный экземпляр


:::warning

Прокси-серверы Postgres, такие как PgBouncer, RDS Proxy, Supabase Pooler и др., не поддерживаются для репликации на основе CDC. Пожалуйста, убедитесь, что не используете их для настройки ClickPipes, а вместо этого добавьте данные для подключения к фактической базе данных Postgres.

:::

После настройки вашей исходной базы данных Postgres вы можете продолжить создание вашего ClickPipe.

## Создание вашего ClickPipe {#creating-your-clickpipe}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)
1. В консоли ClickHouse Cloud перейдите к вашему облачному сервису ClickHouse.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. Выберите кнопку `Data Sources` в меню слева и нажмите "Настроить ClickPipe"

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

3. Выберите плитку `Postgres CDC`

### Добавление подключения вашей исходной базы данных Postgres {#adding-your-source-postgres-database-connection}

4. Заполните данные подключения для вашей исходной базы данных Postgres, которые вы настроили на шаге предварительных условий.

   :::info

   Перед тем как начать добавлять данные для подключения, убедитесь, что вы внесли IP-адреса ClickPipes в белый список в правилах вашего брандмауэра. Вы можете найти список IP-адресов ClickPipes [здесь](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходного Postgres, связанным с [верхней частью этой страницы](#prerequisites).

   :::

   <Image img={postgres_connection_details} alt="Заполнение данных подключения" size="lg" border/>

#### (Необязательно) Настройка SSH-туннелирования {#optional-setting-up-ssh-tunneling}

Вы можете указать данные для SSH-туннелирования, если ваша исходная база данных Postgres недоступна публично.


1. Включите переключатель "Использовать SSH-туннелирование".
2. Заполните данные SSH подключения.

   <Image img={ssh_tunnel} alt="SSH-туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию на основе ключа, нажмите "Отозвать и сгенерировать пару ключей", чтобы создать новую пару ключей и скопируйте сгенерированный публичный ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите на "Проверить подключение", чтобы проверить соединение.

:::note

Убедитесь, что вы внесли в белый список [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в правилах вашего брандмауэра для SSH-бастионного хоста, чтобы ClickPipes мог установить SSH-туннель.

:::

После заполнения данных для подключения нажмите "Далее".

### Настройка параметров репликации {#configuring-the-replication-settings}

5. Убедитесь, что выбрали слот репликации из выпадающего списка, который вы создали на шаге предварительных условий.

   <Image img={select_replication_slot} alt="Выбор слота репликации" size="lg" border/>

#### Расширенные параметры {#advanced-settings}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Интервал синхронизации**: Это интервал, с которым ClickPipes будет опрашивать исходную базу данных на наличие изменений. Это повлияет на целевой сервис ClickHouse, для пользователей, чувствительных к затратам, мы рекомендуем установить это значение на более высокое значение (более `3600`).
- **Параллельные потоки для первичной загрузки**: Это количество параллельных рабочих потоков, которые будут использованы для получения начального снимка. Это полезно, когда у вас есть большое количество таблиц и вы хотите контролировать количество параллельных рабочих потоков, используемых для получения начального снимка. Этот параметр применяется к каждой таблице.
- **Размер пакета извлечения**: Количество строк, которое нужно извлечь за один пакет. Это настройка наилучшего усилия и может не соблюдаться во всех случаях.
- **Количество строк снимка на партицию**: Это количество строк, которые будут извлечены в каждой партиции во время начального снимка. Это полезно, когда у вас есть большое количество строк в ваших таблицах и вы хотите контролировать количество строк, извлекаемых в каждой партиции.
- **Количество таблиц снимка параллельно**: Это количество таблиц, которые будут извлечены параллельно во время начального снимка. Это полезно, когда у вас есть большое количество таблиц и вы хотите контролировать количество таблиц, извлекаемых параллельно.


### Настройка таблиц {#configuring-the-tables}

6. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете либо выбрать существующую базу данных, либо создать новую.

   <Image img={select_destination_db} alt="Выбор целевой базы данных" size="lg" border/>

7. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных Postgres. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse, а также исключить определенные столбцы.

   :::warning

   Если вы определяете ключ сортировки в ClickHouse иначе, чем первичный ключ в Postgres, пожалуйста, не забудьте прочитать все [соображения](https://docs.peerdb.io/mirror/ordering-key-different) на эту тему!

   :::

### Проверка разрешений и запуск ClickPipe {#review-permissions-and-start-the-clickpipe}

8. Выберите роль "Полный доступ" из выпадающего меню разрешений и нажмите "Завершить настройку".

   <Image img={ch_permissions} alt="Проверка разрешений" size="lg" border/>

## Что дальше? {#whats-next}

После того как вы переместили данные из Postgres в ClickHouse, следующим очевидным вопросом будет, как смоделировать ваши данные в ClickHouse, чтобы максимально их использовать. Пожалуйста, обратитесь к этой странице о [Советах по моделированию данных ClickHouse для пользователей Postgres](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling), чтобы помочь вам смоделировать данные в ClickHouse.

Также пожалуйста, обратитесь к [Часто задаваемым вопросам ClickPipes для Postgres](./postgres/faq) для получения дополнительной информации о распространенных проблемах и способах их решения.

:::info

[Это](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling) особенно важно, так как ClickHouse отличается от Postgres, и вы можете столкнуться с некоторыми сюрпризами. Этот гид поможет избежать потенциальных подводных камней и гарантирует, что вы сможете извлечь максимум из ClickHouse.

:::
