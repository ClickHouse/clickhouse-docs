---
sidebar_label: 'ClickPipes для MySQL'
description: 'Описание того, как бесшовно подключить ваш MySQL к ClickHouse Cloud.'
slug: /integrations/clickpipes/mysql
title: 'Прием данных из MySQL в ClickHouse (с использованием CDC)'
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


# Прием данных из MySQL в ClickHouse с использованием CDC

<BetaBadge/>

:::info
В настоящее время прием данных из MySQL в ClickHouse Cloud через ClickPipes находится на этапе частного предпросмотра.
:::


Вы можете использовать ClickPipes для приема данных из вашей исходной базы данных MySQL в ClickHouse Cloud. Исходная база данных MySQL может быть размещена на месте или в облаке.

## Предварительные условия {#prerequisites}

Чтобы начать, вам сначала необходимо убедиться, что ваша база данных MySQL настроена правильно. В зависимости от вашей исходной инстанции MySQL вы можете следовать любому из следующих руководств:

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL для MySQL](./mysql/source/gcp)

4. [Amazon RDS MariaDB](./mysql/source/rds_maria)

После настройки вашей исходной базы данных MySQL вы можете продолжить создавать ваш ClickPipe.

## Создайте ваш ClickPipe {#creating-your-clickpipe}

Убедитесь, что вы вошли в свой аккаунт ClickHouse Cloud. Если у вас еще нет аккаунта, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)
1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. Выберите кнопку `Источники данных` в меню слева и нажмите на "Настроить ClickPipe"

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

3. Выберите плитку `MySQL CDC`

<Image img={mysql_tile} alt="Выбор MySQL" size="lg" border/>

### Добавьте соединение с вашей исходной базой данных MySQL {#adding-your-source-mysql-database-connection}

4. Заполните данные соединения для вашей исходной базы данных MySQL, которые вы настроили на этапе предварительных условий.

   :::info

   Перед добавлением ваших данных соединения убедитесь, что вы добавили IP-адреса ClickPipes в белый список в правилах вашего брандмауэра. На следующей странице вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходного MySQL, связанным с [верхней частью этой страницы](#prerequisites).

   :::

   <Image img={mysql_connection_details} alt="Заполнение данных соединения" size="lg" border/>

#### (Необязательно) Настройка SSH-туннелирования {#optional-setting-up-ssh-tunneling}

Вы можете указать детали SSH-туннелирования, если ваша исходная база данных MySQL недоступна публично.

1. Включите переключатель "Использовать SSH-туннелирование".
2. Заполните данные соединения SSH.

   <Image img={ssh_tunnel} alt="SSH-туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию на основе ключа, нажмите "Отозвать и сгенерировать пару ключей", чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный открытый ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите "Проверить соединение", чтобы проверить соединение.

:::note

Убедитесь, что вы добавили в белый список [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в правилах вашего брандмауэра для SSH-бастиона, чтобы ClickPipes мог установить SSH-туннель.

:::

После заполнения данных соединения нажмите "Далее".

#### Настройка расширенных параметров {#advanced-settings}

Вы можете настроить расширенные параметры, если это необходимо. Краткое описание каждого параметра приведено ниже:

- **Интервал синхронизации**: Это интервал, с которым ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это влияет на сервис ClickHouse назначения, для пользователей, чувствительных к затратам, мы рекомендуем держать это значение выше `3600`.
- **Параллельные потоки для начальной загрузки**: Это количество параллельных рабочих процессов, которые будут использоваться для получения начального снимка. Это полезно, когда у вас есть большое количество таблиц и вы хотите контролировать количество параллельных рабочих процессов, используемых для получения начального снимка. Этот параметр применяется к каждой таблице.
- **Размер партии для извлечения**: Количество строк для извлечения за один раз. Это настройка с наилучшей попыткой и может не соблюдаться во всех случаях.
- **Количество строк снимка на партицию**: Это количество строк, которое будет извлечено в каждой партиции во время начального снимка. Это полезно, когда у вас есть большое количество строк в ваших таблицах и вы хотите контролировать количество строк, извлекаемых в каждой партиции.
- **Количество таблиц для извлечения параллельно**: Это количество таблиц, которые будут извлечены параллельно во время начального снимка. Это полезно, когда у вас есть большое количество таблиц и вы хотите контролировать количество таблиц, извлекаемых параллельно.

### Настройка таблиц {#configuring-the-tables}

5. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image img={select_destination_db} alt="Выбор целевой базы данных" size="lg" border/>

6. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных MySQL. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse, а также исключить определенные колонки.

### Проверьте разрешения и начните ClickPipe {#review-permissions-and-start-the-clickpipe}

7. Выберите роль "Полный доступ" из выпадающего списка разрешений и нажмите "Завершить настройку".

   <Image img={ch_permissions} alt="Проверка разрешений" size="lg" border/>

Наконец, пожалуйста, обратитесь к странице ["Часто задаваемые вопросы по ClickPipes для MySQL"](/integrations/clickpipes/mysql/faq) для получения дополнительной информации о распространенных проблемах и о том, как их разрешить.
