---
slug: '/integrations/clickpipes/mysql'
sidebar_label: 'ClickPipes для MySQL'
description: 'Описывает, как без проблем подключить ваш MySQL к ClickHouse Cloud.'
title: 'Прием данных из MySQL в ClickHouse (с использованием CDC)'
doc_type: guide
---
import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';


# Получение данных из MySQL в ClickHouse (с использованием CDC)

<BetaBadge/>

:::info
Получение данных из MySQL в ClickHouse Cloud через ClickPipes находится в публичной бета-версии.
:::

Вы можете использовать ClickPipes для получения данных из вашей исходной базы данных MySQL в ClickHouse Cloud. Исходная база данных MySQL может быть развернута на месте или в облаке, используя такие сервисы, как Amazon RDS, Google Cloud SQL и другие.

## Предварительные условия {#prerequisites}

Для начала вам нужно убедиться, что ваша база данных MySQL правильно настроена для репликации binlog. Шаги по настройке зависят от того, как вы развертываете MySQL, поэтому, пожалуйста, следуйте соответствующему руководству ниже:

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL для MySQL](./mysql/source/gcp)

4. [Общий MySQL](./mysql/source/generic)

5. [Amazon RDS MariaDB](./mysql/source/rds_maria)

6. [Общий MariaDB](./mysql/source/generic_maria)

После того, как ваша исходная база данных MySQL настроена, вы можете продолжить создание вашего ClickPipe.

## Создание вашего ClickPipe {#create-your-clickpipe}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO обновить изображение здесь)
1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. Выберите кнопку `Источники данных` в левом меню и нажмите на "Настроить ClickPipe".

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

3. Выберите плитку `MySQL CDC`.

<Image img={mysql_tile} alt="Выбор MySQL" size="lg" border/>

### Добавьте соединение с вашей исходной базой данных MySQL {#add-your-source-mysql-database-connection}

4. Заполните данные соединения для вашей исходной базы данных MySQL, которую вы настроили на этапе предварительных условий.

   :::info
   Прежде чем начать добавлять данные соединения, убедитесь, что вы внесли IP-адреса ClickPipes в белый список в ваших правилах межсетевого экрана. На следующей странице вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходного MySQL, связанным в [вверху этой страницы](#prerequisites).
   :::

   <Image img={mysql_connection_details} alt="Заполните данные соединения" size="lg" border/>

#### (Необязательно) Настройка SSH туннелирования {#optional-set-up-ssh-tunneling}

Вы можете указать данные для SSH-туннелирования, если ваша исходная база данных MySQL недоступна публично.

1. Включите переключатель "Использовать SSH-туннелирование".
2. Заполните данные SSH-соединения.

   <Image img={ssh_tunnel} alt="SSH туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию на основе ключа, нажмите на "Отозвать и сгенерировать пару ключей", чтобы создать новую пару ключей и скопируйте сгенерированный открытый ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите на "Проверить соединение", чтобы проверить подключение.

:::note
Убедитесь, что вы внесли в белый список [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в ваших правилах межсетевого экрана для SSH-бастионного хоста, чтобы ClickPipes мог установить SSH-туннель.
:::

После заполнения данных соединения нажмите `Далее`.

#### Настройка дополнительных параметров {#advanced-settings}

Вы можете настроить дополнительные параметры, если это необходимо. Краткое описание каждого параметра представлено ниже:

- **Интервал синхронизации**: Это интервал, с которым ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это имеет значение для конечного сервиса ClickHouse, для пользователей, чувствительных к затратам, мы рекомендуем установить это значение выше (более `3600`).
- **Параллельные потоки для начальной загрузки**: Это количество параллельных рабочих процессов, которые будут использоваться для получения начального снимка. Это полезно, когда у вас есть большое количество таблиц, и вы хотите контролировать количество параллельных рабочих процессов, используемых для получения начального снимка. Этот параметр устанавливается на уровне таблицы.
- **Размер пакета извлечения**: Количество строк для извлечения за один пакет. Это лучший выбор, и он может не соблюдаться во всех случаях.
- **Количество строк снимка на партицию**: Это количество строк, которые будут извлечены в каждой партиции во время начального снимка. Это полезно, когда у вас есть большое количество строк в ваших таблицах, и вы хотите контролировать количество строк, извлекаемых в каждой партиции.
- **Количество таблиц снимка параллельно**: Это количество таблиц, которые будут извлечены параллельно во время начального снимка. Это полезно, когда у вас есть большое количество таблиц, и вы хотите контролировать количество таблиц, извлекаемых параллельно.

### Настройка таблиц {#configure-the-tables}

5. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image img={select_destination_db} alt="Выбор целевой базы данных" size="lg" border/>

6. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных MySQL. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse, а также исключить определенные столбцы.

### Проверьте разрешения и начните ClickPipe {#review-permissions-and-start-the-clickpipe}

7. Выберите роль "Полный доступ" из выпадающего списка разрешений и нажмите "Завершить настройку".

   <Image img={ch_permissions} alt="Проверка разрешений" size="lg" border/>

Наконец, пожалуйста, обратитесь к странице ["Часто задаваемые вопросы ClickPipes для MySQL"](/integrations/clickpipes/mysql/faq) для получения дополнительной информации о распространенных проблемах и способах их решения.

## Что дальше? {#whats-next}

[//]: # "TODO Написать руководство по миграции, специфичное для MySQL, и лучшие практики, аналогичные существующим для PostgreSQL. Текущее руководство по миграции указывает на движок таблиц MySQL, что не совсем идеально."

После того как вы настроили ваш ClickPipe для репликации данных из MySQL в ClickHouse Cloud, вы можете сосредоточиться на том, как запрашивать и моделировать ваши данные для оптимальной производительности. Для общих вопросов по MySQL CDC и устранению неполадок см. страницу [Часто задаваемые вопросы MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).