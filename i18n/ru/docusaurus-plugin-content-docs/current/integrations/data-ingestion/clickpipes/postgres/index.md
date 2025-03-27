---
sidebar_label: 'ClickPipes для Postgres'
description: 'Бесперебойно подключите ваш Postgres к ClickHouse Cloud.'
slug: /integrations/clickpipes/postgres
title: 'Прием данных из Postgres в ClickHouse (с использованием CDC)'
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
import Image from '@theme/IdealImage';


# Прием данных из Postgres в ClickHouse (с использованием CDC)

<BetaBadge/>

:::info
В настоящее время прием данных из Postgres в ClickHouse Cloud через ClickPipes находится в открытом бета-тестировании.
:::

Вы можете использовать ClickPipes для приема данных из вашей исходной базы данных Postgres в ClickHouse Cloud. Исходная база данных Postgres может быть размещена на вашей собственной инфраструктуре или в облаке, включая Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase и другие.

## Предварительные условия {#prerequisites}

Чтобы начать, сначала нужно убедиться, что ваша база данных Postgres настроена правильно. В зависимости от вашей исходной инстанции Postgres, вы можете следовать любому из следующих руководств:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic), если вы используете какого-либо другого поставщика Postgres или используете самоуправляемую версию

:::warning

Прокси-серверы Postgres, такие как PgBouncer, RDS Proxy, Supabase Pooler и т. д., не поддерживаются для репликации на основе CDC. Пожалуйста, убедитесь, что вы не используете их для настройки ClickPipes, а вместо этого добавьте данные для подключения к фактической базе данных Postgres.

:::

После того как ваша исходная база данных Postgres настроена, вы можете продолжить создание вашего ClickPipe.

## Создание вашего ClickPipe {#creating-your-clickpipe}

Убедитесь, что вы вошли в свой аккаунт ClickHouse Cloud. Если у вас еще нет аккаунта, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)
1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. Выберите кнопку `Data Sources` в левом меню и нажмите на "Настроить ClickPipe"

<Image img={cp_step0} alt="Выберите импорты" size="lg" border/>

3. Выберите плитку `Postgres CDC`

   <Image img={postgres_tile} alt="Выберите Postgres" size="lg" border/>

### Добавление подключения к вашей исходной базе данных Postgres {#adding-your-source-postgres-database-connection}

4. Заполните детали подключения к вашей исходной базе данных Postgres, которые вы настроили на этапе предварительных условий.

   :::info

   Прежде чем начать добавление деталей подключения, убедитесь, что вы внесли IP-адреса ClickPipes в белый список в правилах вашего брандмауэра. Список IP-адресов ClickPipes можно найти [здесь](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходного Postgres, связанным с [верхней частью этой страницы](#prerequisites).

   :::

   <Image img={postgres_connection_details} alt="Заполните данные для подключения" size="lg" border/>

#### (Необязательно) Настройка SSH-тоннелирования {#optional-setting-up-ssh-tunneling}

Вы можете указать детали SSH-тоннелирования, если ваша исходная база данных Postgres не общедоступна.

1. Включите переключатель "Использовать SSH-тоннелирование".
2. Заполните детали SSH-подключения.

   <Image img={ssh_tunnel} alt="SSH-тоннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию на основе ключа, нажмите "Отозвать и сгенерировать пару ключей", чтобы сгенерировать новую пару ключей и скопировать сгенерированный открытый ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите "Проверить подключение", чтобы проверить подключение.

:::note

Убедитесь, что вы внесли [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в белый список в правилах вашего брандмауэра для SSH-бастионного хоста, чтобы ClickPipes мог установить SSH-тоннель.

:::

После заполнения деталей подключения нажмите "Далее".

### Настройка параметров репликации {#configuring-the-replication-settings}

5. Убедитесь, что вы выбрали слот репликации из выпадающего списка, который вы создали на этапе предварительных условий.

   <Image img={select_replication_slot} alt="Выберите слот репликации" size="lg" border/>

#### Расширенные настройки {#advanced-settings}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Интервал синхронизации**: Это интервал, с которым ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это влияет на целевой сервис ClickHouse, и для пользователей, заботящихся о стоимости, мы рекомендуем установить это значение выше (свыше `3600`).
- **Параллельные потоки для начальной загрузки**: Это количество параллельных рабочих процессов, которые будут использоваться для получения начального снимка. Это полезно, когда у вас есть большое количество таблиц, и вы хотите контролировать количество параллельных рабочих процессов, используемых для получения начального снимка. Эта настройка применяется к каждой таблице.
- **Размер пакета извлечения**: Количество строк для извлечения за один пакет. Это определение является лучшим, но может не соблюдаться во всех случаях.
- **Количество строк снимка на партицию**: Это количество строк, которые будут извлечены в каждой партиции во время начального снимка. Это полезно, когда у вас есть большое количество строк в ваших таблицах, и вы хотите контролировать количество строк, извлекаемых в каждой партиции.
- **Количество таблиц в параллельном режиме для снимка**: Это количество таблиц, которые будут извлечены параллельно во время начального снимка. Это полезно, когда у вас есть много таблиц, и вы хотите контролировать количество таблиц, извлекаемых параллельно.


### Настройка таблиц {#configuring-the-tables}

6. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете либо выбрать существующую базу данных, либо создать новую.

   <Image img={select_destination_db} alt="Выберите целевую базу данных" size="lg" border/>

7. Вы можете выбрать таблицы, которые вы хотите реплицировать из исходной базы данных Postgres. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse, а также исключить определенные столбцы.

   :::warning

   Если вы определяете Ключ сортировки в ClickHouse иначе, чем Первичный ключ в Postgres, пожалуйста, не забудьте прочитать все [соображения](https://docs.peerdb.io/mirror/ordering-key-different) по этому поводу!

   :::

### Проверьте права доступа и начните ClickPipe {#review-permissions-and-start-the-clickpipe}

8. Выберите роль "Полный доступ" из выпадающего списка разрешений и нажмите "Завершить настройку".

   <Image img={ch_permissions} alt="Проверьте разрешения" size="lg" border/>

## Что дальше? {#whats-next}

После того как вы переместили данные из Postgres в ClickHouse, следующий очевидный вопрос заключается в том, как моделью ваши данные в ClickHouse, чтобы максимально их использовать. Пожалуйста, обратитесь к этой странице с [Советами по моделированию данных ClickHouse для пользователей Postgres](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling), чтобы помочь вам смоделировать данные в ClickHouse.

Кроме того, пожалуйста, посмотрите [Часто задаваемые вопросы ClickPipes для Postgres](./postgres/faq) для получения дополнительной информации о распространенных проблемах и способах их решения.

:::info

[Это](https://docs.peerdb.io/bestpractices/clickhouse_datamodeling) особенно важно, так как ClickHouse отличается от Postgres, и вы можете столкнуться с некоторыми неожиданностями. Этот гид помогает обратить внимание на возможные подводные камни и гарантирует, что вы сможете в полной мере воспользоваться возможностями ClickHouse.

:::
