---
'sidebar_label': 'Извлечение данных из Postgres в ClickHouse'
'description': 'Бесперебійно подключите ваш Postgres к ClickHouse Cloud.'
'slug': '/integrations/clickpipes/postgres'
'title': 'Извлечение данных из Postgres в ClickHouse (с использованием CDC)'
'doc_type': 'guide'
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


# Импорт данных из Postgres в ClickHouse (с использованием CDC)

Вы можете использовать ClickPipes для импорта данных из вашей исходной базы данных Postgres в ClickHouse Cloud. Исходная база данных Postgres может быть размещена on-premises или в облаке, включая Amazon RDS, Google Cloud SQL, Azure Database for Postgres, Supabase и другие.

## Предварительные требования {#prerequisites}

Перед началом убедитесь, что ваша база данных Postgres настроена правильно. В зависимости от вашей исходной инстанции Postgres, вы можете следовать любому из следующих руководств:

1. [Amazon RDS Postgres](./postgres/source/rds)

2. [Amazon Aurora Postgres](./postgres/source/aurora)

3. [Supabase Postgres](./postgres/source/supabase)

4. [Google Cloud SQL Postgres](./postgres/source/google-cloudsql)

5. [Azure Flexible Server for Postgres](./postgres/source/azure-flexible-server-postgres)

6. [Neon Postgres](./postgres/source/neon-postgres)

7. [Crunchy Bridge Postgres](./postgres/source/crunchy-postgres)

8. [Generic Postgres Source](./postgres/source/generic), если вы используете какого-либо другого провайдера Postgres или самоуправляемую инстанцию.

9. [TimescaleDB](./postgres/source/timescale), если вы используете расширение TimescaleDB на управляемом сервисе или самоуправляемой инстанции.

:::warning

Прокси-серверы Postgres, такие как PgBouncer, RDS Proxy, Supabase Pooler и т.д., не поддерживаются для репликации на основе CDC. Пожалуйста, убедитесь, что вы не используете их для настройки ClickPipes и вместо этого добавьте данные для подключения к самой базе данных Postgres.

:::

Как только ваша исходная база данных Postgres будет настроена, вы можете продолжить создание вашего ClickPipe.

## Создание вашего ClickPipe {#creating-your-clickpipe}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)
1. В консоли ClickHouse Cloud перейдите к службе ClickHouse Cloud.

<Image img={cp_service} alt="Служба ClickPipes" size="lg" border/>

2. Выберите кнопку `Data Sources` в левом меню и нажмите на "Настроить ClickPipe"

<Image img={cp_step0} alt="Выберите импорты" size="lg" border/>

3. Выберите плитку `Postgres CDC`

   <Image img={postgres_tile} alt="Выберите Postgres" size="lg" border/>

### Добавление подключения к вашей исходной базе данных Postgres {#adding-your-source-postgres-database-connection}

4. Заполните данные подключения к вашей исходной базе данных Postgres, которые вы настроили на этапе предварительных требований.

   :::info

   Перед тем как начать добавлять данные для подключения, убедитесь, что вы добавили IP-адреса ClickPipes в список разрешенных в ваших правилах брандмауэра. Список IP-адресов ClickPipes можно найти [здесь](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходного Postgres, связанным с [этой страницей](#prerequisites).

   :::

   <Image img={postgres_connection_details} alt="Заполните данные для подключения" size="lg" border/>

#### (По желанию) Настройка AWS Private Link {#optional-setting-up-aws-private-link}

Вы можете использовать AWS Private Link для подключения к вашей исходной базе данных Postgres, если она размещена в AWS. Это полезно, если вы хотите сохранить передачу данных в приватном режиме.
Вы также можете следовать [руководству по настройке подключения](/integrations/clickpipes/aws-privatelink).

#### (По желанию) Настройка SSH-тоннелирования {#optional-setting-up-ssh-tunneling}

Вы можете указать данные для SSH-тоннелирования, если ваша исходная база данных Postgres не доступна публично.

1. Включите переключатель "Использовать SSH-тоннелирование".
2. Заполните данные для SSH-подключения.

   <Image img={ssh_tunnel} alt="SSH тоннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию на основе ключей, нажмите "Отозвать и сгенерировать ключи" для генерации новой пары ключей и скопируйте сгенерированный публичный ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите "Проверить подключение", чтобы проверить соединение.

:::note

Убедитесь, что вы добавили в список разрешенных [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в ваших правилах брандмауэра для хоста SSH-бастион, чтобы ClickPipes мог установить SSH-тоннель.

:::

После того как данные для подключения будут заполнены, нажмите на "Далее".

### Настройка параметров репликации {#configuring-the-replication-settings}

5. Убедитесь, что вы выбрали слот репликации из выпадающего списка, который вы создали на этапе предварительных требований.

   <Image img={select_replication_slot} alt="Выберите слот репликации" size="lg" border/>

#### Расширенные настройки {#advanced-settings}

Вы можете настроить Расширенные настройки, если это необходимо. Краткое описание каждой настройки предоставлено ниже:

- **Интервал синхронизации**: Это интервал, с которым ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это влияет на службу ClickHouse, для пользователей с ограниченным бюджетом мы рекомендуем устанавливать это значение на более высокое (более `3600`).
- **Параллельные потоки для первоначальной загрузки**: Это количество параллельных рабочих процессов, которые будут использоваться для получения первоначального снимка. Это полезно, когда у вас много таблиц, и вы хотите контролировать количество параллельных рабочих процессов, используемых для получения первоначального снимка. Эта настройка применяется к каждой таблице.
- **Размер пакета извлечения**: Количество строк для извлечения в одном пакете. Это значение является рекомендательным и может не соблюдаться во всех случаях.
- **Количество строк снимка на партицию**: Это количество строк, которые будут извлечены в каждой партиции во время первоначального снимка. Это полезно, когда в ваших таблицах много строк, и вы хотите контролировать количество строк, извлекаемых в каждой партиции.
- **Количество таблиц снимка параллельно**: Это количество таблиц, которые будут извлекаться параллельно во время первоначального снимка. Это полезно, когда у вас много таблиц, и вы хотите контролировать количество таблиц, извлекаемых параллельно.

### Настройка таблиц {#configuring-the-tables}

6. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image img={select_destination_db} alt="Выберите целевую базу данных" size="lg" border/>

7. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных Postgres. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse, а также исключить конкретные колонки.

   :::warning
   Если вы определяете ключ сортировки в ClickHouse отличным от первичного ключа в Postgres, не забудьте прочитать все [особенности](/integrations/clickpipes/postgres/ordering_keys), связанные с этим
   :::

### Проверьте разрешения и начните ClickPipe {#review-permissions-and-start-the-clickpipe}

8. Выберите роль "Полный доступ" из выпадающего списка разрешений и нажмите "Завершить настройку".

   <Image img={ch_permissions} alt="Проверьте разрешения" size="lg" border/>

## Что дальше? {#whats-next}

После того как вы настроили ваш ClickPipe для репликации данных из PostgreSQL в ClickHouse Cloud, вы можете сосредоточиться на том, как запрашивать и моделировать ваши данные для оптимальной производительности. Ознакомьтесь с [руководством по миграции](/migrations/postgresql/overview), чтобы оценить, какая стратегия лучше всего соответствует вашим требованиям, а также с страницами [Стратегии дедупликации (с использованием CDC)](/integrations/clickpipes/postgres/deduplication) и [Ключи сортировки](/integrations/clickpipes/postgres/ordering_keys) для лучших практик в работе с нагрузками CDC.

Для получения распространенных вопросов по PostgreSQL CDC и устранению неполадок, смотрите [страницу часто задаваемых вопросов Postgres](/integrations/clickpipes/postgres/faq).
