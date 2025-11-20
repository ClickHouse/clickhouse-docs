---
sidebar_label: 'Загрузка данных из MySQL в ClickHouse'
description: 'Описывает, как бесшовно подключить MySQL к ClickHouse Cloud.'
slug: /integrations/clickpipes/mysql
title: 'Загрузка данных из MySQL в ClickHouse (с использованием CDC)'
doc_type: 'guide'
keywords: ['MySQL', 'ClickPipes', 'CDC', 'change data capture', 'database replication']
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


# Загрузка данных из MySQL в ClickHouse (с использованием CDC)

<BetaBadge/>

:::info
Загрузка данных из MySQL в ClickHouse Cloud с помощью ClickPipes доступна в рамках публичной бета-версии.
:::

Вы можете использовать ClickPipes для загрузки данных из исходной базы данных MySQL в ClickHouse Cloud. Исходная база данных MySQL может быть развернута локально (on‑premises) или в облаке с использованием таких сервисов, как Amazon RDS, Google Cloud SQL и другие.



## Предварительные требования {#prerequisites}

Для начала работы необходимо убедиться, что ваша база данных MySQL правильно настроена для репликации через binlog. Шаги настройки зависят от способа развертывания MySQL, поэтому следуйте соответствующему руководству ниже:

1. [Amazon RDS MySQL](./mysql/source/rds)

2. [Amazon Aurora MySQL](./mysql/source/aurora)

3. [Cloud SQL for MySQL](./mysql/source/gcp)

4. [Generic MySQL](./mysql/source/generic)

5. [Amazon RDS MariaDB](./mysql/source/rds_maria)

6. [Generic MariaDB](./mysql/source/generic_maria)

После настройки исходной базы данных MySQL вы можете продолжить создание ClickPipe.


## Создание ClickPipe {#create-your-clickpipe}

Убедитесь, что вы вошли в учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # "   TODO update image here"

1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<Image img={cp_service} alt='Сервис ClickPipes' size='lg' border />

2. Нажмите кнопку `Data Sources` в меню слева и выберите "Set up a ClickPipe"

<Image img={cp_step0} alt='Выбор импорта' size='lg' border />

3. Выберите плитку `MySQL CDC`

<Image img={mysql_tile} alt='Выбор MySQL' size='lg' border />

### Добавление подключения к исходной базе данных MySQL {#add-your-source-mysql-database-connection}

4. Заполните параметры подключения к исходной базе данных MySQL, которую вы настроили на этапе выполнения предварительных требований.

   :::info
   Перед добавлением параметров подключения убедитесь, что вы внесли IP-адреса ClickPipes в белый список правил брандмауэра. На следующей странице вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Дополнительную информацию см. в руководствах по настройке исходной базы данных MySQL, ссылки на которые приведены [в начале этой страницы](#prerequisites).
   :::

   <Image
     img={mysql_connection_details}
     alt='Заполнение параметров подключения'
     size='lg'
     border
   />

#### (Опционально) Настройка SSH-туннелирования {#optional-set-up-ssh-tunneling}

Вы можете указать параметры SSH-туннелирования, если исходная база данных MySQL недоступна публично.

1. Включите переключатель "Use SSH Tunnelling".
2. Заполните параметры SSH-подключения.

   <Image img={ssh_tunnel} alt='SSH-туннелирование' size='lg' border />

3. Для использования аутентификации на основе ключей нажмите "Revoke and generate key pair", чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный публичный ключ на ваш SSH-сервер в файл `~/.ssh/authorized_keys`.
4. Нажмите "Verify Connection" для проверки подключения.

:::note
Убедитесь, что вы внесли [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в белый список правил брандмауэра для SSH bastion-хоста, чтобы ClickPipes мог установить SSH-туннель.
:::

После заполнения параметров подключения нажмите `Next`.

#### Настройка расширенных параметров {#advanced-settings}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Sync interval**: Интервал, с которым ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это влияет на целевой сервис ClickHouse. Для пользователей, чувствительных к затратам, рекомендуется устанавливать более высокое значение (более `3600`).
- **Parallel threads for initial load**: Количество параллельных рабочих потоков, которые будут использоваться для получения начального снимка. Это полезно при наличии большого количества таблиц, когда требуется контролировать количество параллельных рабочих потоков для получения начального снимка. Этот параметр применяется для каждой таблицы.
- **Pull batch size**: Количество строк для получения в одном пакете. Это параметр типа best effort, который может не соблюдаться во всех случаях.
- **Snapshot number of rows per partition**: Количество строк, которые будут получены в каждой партиции во время начального снимка. Это полезно при наличии большого количества строк в таблицах, когда требуется контролировать количество строк, получаемых в каждой партиции.
- **Snapshot number of tables in parallel**: Количество таблиц, которые будут получены параллельно во время начального снимка. Это полезно при наличии большого количества таблиц, когда требуется контролировать количество таблиц, получаемых параллельно.

### Настройка таблиц {#configure-the-tables}

5. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image
     img={select_destination_db}
     alt='Выбор целевой базы данных'
     size='lg'
     border
   />

6. Вы можете выбрать таблицы для репликации из исходной базы данных MySQL. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse, а также исключить определенные столбцы.

### Проверка разрешений и запуск ClickPipe {#review-permissions-and-start-the-clickpipe}

7. Выберите роль "Full access" из выпадающего списка разрешений и нажмите "Complete Setup".

   <Image img={ch_permissions} alt='Проверка разрешений' size='lg' border />

Дополнительную информацию о распространенных проблемах и способах их решения см. на странице ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq).


## Что дальше? {#whats-next}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

После настройки ClickPipe для репликации данных из MySQL в ClickHouse Cloud вы можете сосредоточиться на запросах и моделировании данных для достижения оптимальной производительности. Ответы на часто задаваемые вопросы о MySQL CDC и решение проблем см. на [странице FAQ по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).
