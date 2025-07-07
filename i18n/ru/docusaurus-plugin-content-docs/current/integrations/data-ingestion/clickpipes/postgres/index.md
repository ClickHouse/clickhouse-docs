---
sidebar_label: 'Прием данных из Postgres в ClickHouse'
description: 'Бесшовно соедините ваш Postgres с ClickHouse Cloud.'
slug: /integrations/clickpipes/postgres
title: 'Прием данных из Postgres в ClickHouse (с использованием CDC)'
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


# Прием данных из Postgres в ClickHouse (с использованием CDC)

<BetaBadge/>

:::info
В настоящее время прием данных из Postgres в ClickHouse Cloud через ClickPipes находится на этапе публичного бета-тестирования.
:::


Вы можете использовать ClickPipes для загрузки данных из вашей исходной базы данных Postgres в ClickHouse Cloud. Исходная база данных Postgres может быть размещена на локальном сервере или в облаке, включая Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase и другие.


## Предварительные требования {#prerequisites}

Для начала убедитесь, что ваша база данных Postgres правильно настроена. В зависимости от вашей исходной инстанции Postgres, вы можете следовать любым из следующих руководств:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Общий источник Postgres](./postgres/source/generic), если вы используете любого другого поставщика Postgres или используете саморазмещенную инстанцию.

9. [TimescaleDB](./postgres/source/timescale), если вы используете расширение TimescaleDB на управляемой службе или саморазмещенной инстанции.


:::warning

Прокси-серверы Postgres, такие как PgBouncer, RDS Proxy, Supabase Pooler и т. д., не поддерживаются для репликации на основе CDC. Пожалуйста, убедитесь, что вы не используете их для настройки ClickPipes и вместо этого добавьте детали подключения фактической базы данных Postgres.

:::

После того как ваша исходная база данных Postgres настроена, вы можете продолжить создание вашего ClickPipe.

## Создание вашего ClickPipe {#creating-your-clickpipe}

Убедитесь, что вы вошли в свой аккаунт ClickHouse Cloud. Если у вас еще нет аккаунта, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)
1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. Выберите кнопку `Источники данных` в левом меню и нажмите "Настроить ClickPipe"

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

3. Выберите плитку `Postgres CDC`

   <Image img={postgres_tile} alt="Выбор Postgres" size="lg" border/>

### Добавление подключения к исходной базе данных Postgres {#adding-your-source-postgres-database-connection}

4. Заполните данные подключения к вашей исходной базе данных Postgres, которые вы настроили на этапе предварительных требований.

   :::info

   Прежде чем начать добавлять ваши данные подключения, убедитесь, что вы добавили IP-адреса ClickPipes в белый список в ваших правилах брандмауэра. Список IP-адресов ClickPipes можно найти [здесь](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходной базы данных Postgres, связанным в [верху этой страницы](#prerequisites).

   :::

   <Image img={postgres_connection_details} alt="Заполните данные подключения" size="lg" border/>

#### (Необязательно) Настройка AWS Private Link {#optional-setting-up-aws-private-link}

Вы можете использовать AWS Private Link для подключения к вашей исходной базе данных Postgres, если она размещена на AWS. Это полезно, если вы хотите сохранить конфиденциальность передачи данных.
Вы можете следовать [руководству по настройке подключения](/integrations/clickpipes/aws-privatelink).

#### (Необязательно) Настройка SSH-туннелирования {#optional-setting-up-ssh-tunneling}

Вы можете указать детали SSH-туннелирования, если ваша исходная база данных Postgres недоступна публично.


1. Включите переключатель "Использовать SSH-туннелирование".
2. Заполните данные подключения SSH.

   <Image img={ssh_tunnel} alt="SSH-туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию на основе ключей, нажмите "Отозвать и сгенерировать пару ключей", чтобы сгенерировать новую пару ключей и скопировать сгенерированный открытый ключ на ваш SSH-сервер в файл `~/.ssh/authorized_keys`.
4. Нажмите "Проверить соединение", чтобы проверить подключение.

:::note

Пожалуйста, убедитесь, что вы добавили [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в белый список в ваших правилах брандмауэра для SSH хоста-посредника, чтобы ClickPipes мог установить SSH туннель.

:::

После заполнения данных подключения нажмите "Далее".

### Настройка параметров репликации {#configuring-the-replication-settings}

5. Убедитесь, что вы выбрали слот репликации из выпадающего списка, который вы создали на этапе предварительных требований.

   <Image img={select_replication_slot} alt="Выбор слота репликации" size="lg" border/>

#### Расширенные настройки {#advanced-settings}

При необходимости вы можете настроить Расширенные настройки. Краткое описание каждой настройки представлено ниже:

- **Интервал синхронизации**: Это интервал, в течение которого ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это имеет значение для сервиса ClickHouse назначения, для пользователей с ограниченным бюджетом мы рекомендуем устанавливать это на более высокое значение (более `3600`).
- **Параллельные потоки для первоначальной загрузки**: Это количество параллельных рабочих, которые будут использоваться для получения начального снимка. Это полезно, когда у вас много таблиц, и вы хотите контролировать количество параллельных рабочих, использованных для получения начального снимка. Эта настройка применяется к каждой таблице.
- **Размер пакета извлечения**: Количество строк для извлечения в одном пакете. Это настройка, основанная на лучших усилиях, и может не соблюдаться во всех случаях.
- **Число строк на партицию в снимке**: Это количество строк, которое будет извлечено в каждой партиции во время первоначального снимка. Это полезно, когда у вас большое количество строк в ваших таблицах, и вы хотите контролировать количество строк, извлекаемых в каждой партиции.
- **Количество таблиц в параллели в снимке**: Это количество таблиц, которые будут извлечены параллельно во время первоначального снимка. Это полезно, когда у вас большое количество таблиц, и вы хотите контролировать количество таблиц, извлекаемых параллельно.


### Настройка таблиц {#configuring-the-tables}

6. Здесь вы можете выбрать базу данных назначения для вашего ClickPipe. Вы можете либо выбрать существующую базу данных, либо создать новую.

   <Image img={select_destination_db} alt="Выбор базы данных назначения" size="lg" border/>

7. Вы можете выбрать таблицы, которые вы хотите реплицировать из исходной базы данных Postgres. При выборе таблиц вы также можете переименовать таблицы в базе данных ClickHouse назначения, а также исключить определенные колонки.

   :::warning
   Если вы определяете ключ сортировки в ClickHouse иначе, чем первичный ключ в Postgres, пожалуйста, не забудьте ознакомиться со всеми [соображениями](/integrations/clickpipes/postgres/ordering_keys) по этому поводу!
   :::

### Проверьте права и начните ClickPipe {#review-permissions-and-start-the-clickpipe}

8. Выберите роль "Полный доступ" из выпадающего списка разрешений и нажмите "Завершить настройку".

   <Image img={ch_permissions} alt="Проверка разрешений" size="lg" border/>

## Что дальше? {#whats-next}

После того как вы переместите данные из Postgres в ClickHouse, следующий очевидный вопрос — как запрашивать и моделировать ваши данные в ClickHouse, чтобы максимально использовать их. Пожалуйста, обратитесь к [руководству по миграции](/migrations/postgresql/overview) для получения пошаговых подходов к миграции из PostgreSQL в ClickHouse. Наряду с руководством по миграции, убедитесь, что вы ознакомились с страницами о [Стратегиях дедупликации (с использованием CDC)](/integrations/clickpipes/postgres/deduplication) и [Ключах сортировки](/integrations/clickpipes/postgres/ordering_keys), чтобы понять, как обрабатывать дубликаты и настраивать ключи сортировки при использовании CDC. 

Наконец, пожалуйста, обратитесь к странице ["Часто задаваемые вопросы по ClickPipes для Postgres"](/integrations/clickpipes/postgres/faq) для получения дополнительной информации о распространенных проблемах и способах их решения.
