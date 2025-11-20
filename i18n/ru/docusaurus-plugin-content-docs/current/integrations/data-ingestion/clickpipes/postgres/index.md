---
sidebar_label: 'Загрузка данных из Postgres в ClickHouse'
description: 'Легко подключайте ваш Postgres к ClickHouse Cloud.'
slug: /integrations/clickpipes/postgres
title: 'Загрузка данных из Postgres в ClickHouse (с использованием CDC)'
keywords: ['PostgreSQL', 'ClickPipes', 'CDC', 'change data capture', 'database replication']
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


# Загрузка данных из Postgres в ClickHouse (с использованием CDC)

Вы можете использовать ClickPipes для загрузки данных из исходной базы данных Postgres в ClickHouse Cloud. Исходная база данных Postgres может быть размещена локально (on‑premises) или в облаке, включая Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase и другие.



## Предварительные требования {#prerequisites}

Для начала работы необходимо убедиться, что ваша база данных Postgres настроена корректно. В зависимости от используемого экземпляра Postgres вы можете воспользоваться одним из следующих руководств:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Универсальный источник Postgres](./postgres/source/generic), если вы используете другого провайдера Postgres или самостоятельно развёрнутый экземпляр.

9. [TimescaleDB](./postgres/source/timescale), если вы используете расширение TimescaleDB в управляемом сервисе или самостоятельно развёрнутом экземпляре.

:::warning

Прокси-серверы Postgres, такие как PgBouncer, RDS Proxy, Supabase Pooler и другие, не поддерживаются для репликации на основе CDC. Убедитесь, что вы НЕ используете их при настройке ClickPipes, а вместо этого указываете параметры подключения непосредственно к базе данных Postgres.

:::

После настройки исходной базы данных Postgres можно приступить к созданию ClickPipe.


## Создание ClickPipe {#creating-your-clickpipe}

Убедитесь, что вы вошли в учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # "   TODO update image here"

1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<Image img={cp_service} alt='ClickPipes service' size='lg' border />

2. Нажмите кнопку `Data Sources` в меню слева и выберите "Set up a ClickPipe"

<Image img={cp_step0} alt='Select imports' size='lg' border />

3. Выберите плитку `Postgres CDC`

   <Image img={postgres_tile} alt='Select Postgres' size='lg' border />

### Добавление подключения к исходной базе данных Postgres {#adding-your-source-postgres-database-connection}

4. Заполните параметры подключения к исходной базе данных Postgres, которую вы настроили на этапе предварительных требований.

   :::info

   Перед добавлением параметров подключения убедитесь, что вы добавили IP-адреса ClickPipes в белый список правил брандмауэра. Список IP-адресов ClickPipes можно найти [здесь](../index.md#list-of-static-ips).
   Дополнительную информацию см. в руководствах по настройке исходной базы данных Postgres, ссылки на которые приведены [в начале этой страницы](#prerequisites).

   :::

   <Image
     img={postgres_connection_details}
     alt='Fill in connection details'
     size='lg'
     border
   />

#### (Опционально) Настройка AWS Private Link {#optional-setting-up-aws-private-link}

Вы можете использовать AWS Private Link для подключения к исходной базе данных Postgres, если она размещена на AWS. Это полезно, если вы
хотите обеспечить конфиденциальность передачи данных.
Следуйте [руководству по настройке подключения](/integrations/clickpipes/aws-privatelink).

#### (Опционально) Настройка SSH-туннелирования {#optional-setting-up-ssh-tunneling}

Вы можете указать параметры SSH-туннелирования, если исходная база данных Postgres недоступна публично.

1. Включите переключатель "Use SSH Tunnelling".
2. Заполните параметры SSH-подключения.

   <Image img={ssh_tunnel} alt='SSH tunneling' size='lg' border />

3. Для использования аутентификации на основе ключей нажмите "Revoke and generate key pair", чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный публичный ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите "Verify Connection" для проверки подключения.

:::note

Убедитесь, что вы добавили [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в белый список правил брандмауэра для SSH bastion-хоста, чтобы ClickPipes мог установить SSH-туннель.

:::

После заполнения параметров подключения нажмите "Next".

### Настройка параметров репликации {#configuring-the-replication-settings}

5. Убедитесь, что вы выбрали слот репликации из выпадающего списка, который вы создали на этапе предварительных требований.

   <Image
     img={select_replication_slot}
     alt='Select replication slot'
     size='lg'
     border
   />

#### Расширенные настройки {#advanced-settings}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Sync interval**: Интервал, с которым ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это влияет на целевой сервис ClickHouse; для пользователей, чувствительных к затратам, рекомендуется устанавливать более высокое значение (более `3600`).
- **Parallel threads for initial load**: Количество параллельных рабочих потоков, которые будут использоваться для получения начального снимка. Это полезно при большом количестве таблиц, когда требуется контролировать количество параллельных рабочих потоков для получения начального снимка. Этот параметр применяется для каждой таблицы.
- **Pull batch size**: Количество строк для получения в одном пакете. Это параметр типа best effort, который может не соблюдаться во всех случаях.
- **Snapshot number of rows per partition**: Количество строк, которые будут получены в каждой партиции во время начального снимка. Это полезно при большом количестве строк в таблицах, когда требуется контролировать количество строк, получаемых в каждой партиции.
- **Snapshot number of tables in parallel**: Количество таблиц, которые будут получены параллельно во время начального снимка. Это полезно при большом количестве таблиц, когда требуется контролировать количество таблиц, получаемых параллельно.

### Настройка таблиц {#configuring-the-tables}

6. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image
     img={select_destination_db}
     alt='Select destination database'
     size='lg'
     border
   />


7. Вы можете выбрать таблицы для репликации из исходной базы данных Postgres. При выборе таблиц можно также переименовать таблицы в целевой базе данных ClickHouse и исключить определённые столбцы.

   :::warning
   Если вы определяете ключ сортировки в ClickHouse иначе, чем первичный ключ в Postgres, обязательно ознакомьтесь со всеми [рекомендациями](/integrations/clickpipes/postgres/ordering_keys) по этому вопросу
   :::

### Проверка разрешений и запуск ClickPipe {#review-permissions-and-start-the-clickpipe}

8. Выберите роль «Full access» из выпадающего списка разрешений и нажмите «Complete Setup».

   <Image img={ch_permissions} alt='Проверка разрешений' size='lg' border />


## Что дальше? {#whats-next}

После настройки ClickPipe для репликации данных из PostgreSQL в ClickHouse Cloud вы можете сосредоточиться на запросах и моделировании данных для достижения оптимальной производительности. См. [руководство по миграции](/migrations/postgresql/overview) для оценки стратегии, наиболее подходящей для ваших требований, а также страницы [Стратегии дедупликации (с использованием CDC)](/integrations/clickpipes/postgres/deduplication) и [Ключи сортировки](/integrations/clickpipes/postgres/ordering_keys) с рекомендациями по работе с CDC.

Ответы на распространённые вопросы о PostgreSQL CDC и устранении неполадок см. на [странице часто задаваемых вопросов по Postgres](/integrations/clickpipes/postgres/faq).
