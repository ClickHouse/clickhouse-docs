---
sidebar_label: 'Загрузка данных из MongoDB в ClickHouse'
description: 'Описывает, как бесшовно подключить вашу MongoDB к ClickHouse Cloud.'
slug: /integrations/clickpipes/mongodb
title: 'Загрузка данных из MongoDB в ClickHouse (с использованием CDC)'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'data ingestion', 'real-time sync']
---

import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mongodb_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-tile.png'
import mongodb_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/mongodb-connection-details.png'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mongodb/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'


# Загрузка данных из MongoDB в ClickHouse (с использованием CDC)

<BetaBadge/>

:::info
Загрузка данных из MongoDB в ClickHouse Cloud с помощью ClickPipes находится на стадии открытого бета-тестирования.
:::

:::note
В консоли и документации ClickHouse Cloud термины «table» и «collection» для MongoDB используются взаимозаменяемо.
:::

Вы можете использовать ClickPipes для загрузки данных из вашей базы данных MongoDB в ClickHouse Cloud. Исходная база данных MongoDB может быть развернута локально (on-premises) или в облаке с использованием таких сервисов, как MongoDB Atlas.



## Предварительные требования {#prerequisites}

Для начала работы необходимо убедиться, что ваша база данных MongoDB правильно настроена для репликации. Шаги настройки зависят от способа развёртывания MongoDB, поэтому следуйте соответствующему руководству ниже:

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [Generic MongoDB](./mongodb/source/generic)

3. [Amazon DocumentDB](./mongodb/source/documentdb)

После настройки исходной базы данных MongoDB вы можете продолжить создание ClickPipe.


## Создание ClickPipe {#create-your-clickpipe}

Убедитесь, что вы вошли в учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

1. В консоли ClickHouse Cloud перейдите к вашему сервису ClickHouse Cloud.

<Image img={cp_service} alt='Сервис ClickPipes' size='lg' border />

2. Нажмите кнопку `Data Sources` в меню слева и выберите "Set up a ClickPipe".

<Image img={cp_step0} alt='Выбор импорта' size='lg' border />

3. Выберите плитку `MongoDB CDC`.

<Image img={mongodb_tile} alt='Выбор MongoDB' size='lg' border />

### Добавление подключения к исходной базе данных MongoDB {#add-your-source-mongodb-database-connection}

4. Заполните данные подключения для исходной базы данных MongoDB, которую вы настроили на этапе предварительных требований.

   :::info
   Перед добавлением данных подключения убедитесь, что вы внесли IP-адреса ClickPipes в белый список правил брандмауэра. На следующей странице вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходной MongoDB, ссылки на которые приведены [в начале этой страницы](#prerequisites).
   :::

   <Image
     img={mongodb_connection_details}
     alt='Заполнение данных подключения'
     size='lg'
     border
   />

#### (Опционально) Настройка SSH-туннелирования {#optional-set-up-ssh-tunneling}

Вы можете указать параметры SSH-туннелирования, если исходная база данных MongoDB недоступна публично.

1. Включите переключатель "Use SSH Tunnelling".
2. Заполните данные SSH-подключения.

   <Image img={ssh_tunnel} alt='SSH-туннелирование' size='lg' border />

3. Для использования аутентификации на основе ключей нажмите "Revoke and generate key pair", чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный публичный ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите "Verify Connection" для проверки подключения.

:::note
Убедитесь, что вы внесли [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в белый список правил брандмауэра для SSH bastion-хоста, чтобы ClickPipes мог установить SSH-туннель.
:::

После заполнения данных подключения нажмите `Next`.

#### Настройка расширенных параметров {#advanced-settings}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Интервал синхронизации**: Интервал, с которым ClickPipes будет опрашивать исходную базу данных на предмет изменений. Это влияет на целевой сервис ClickHouse; для пользователей, чувствительных к затратам, мы рекомендуем устанавливать более высокое значение (более `3600`).
- **Размер пакета извлечения**: Количество строк для извлечения в одном пакете. Это параметр по принципу «наилучшего усилия», который может не соблюдаться во всех случаях.
- **Количество таблиц для параллельного снимка**: Количество таблиц, которые будут извлекаться параллельно во время создания начального снимка. Это полезно, когда у вас большое количество таблиц и вы хотите контролировать количество таблиц, извлекаемых параллельно.

### Настройка таблиц {#configure-the-tables}

5. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image
     img={select_destination_db}
     alt='Выбор целевой базы данных'
     size='lg'
     border
   />

6. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных MongoDB. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse.

### Проверка разрешений и запуск ClickPipe {#review-permissions-and-start-the-clickpipe}

7. Выберите роль "Full access" из выпадающего списка разрешений и нажмите "Complete Setup".

   <Image img={ch_permissions} alt='Проверка разрешений' size='lg' border />


## Что дальше? {#whats-next}

После настройки ClickPipe для репликации данных из MongoDB в ClickHouse Cloud вы можете сосредоточиться на запросах и моделировании данных для достижения оптимальной производительности.


## Ограничения {#caveats}

При использовании этого коннектора следует учитывать следующие ограничения:

- Требуется MongoDB версии 5.1.0 или выше.
- Для CDC используется встроенный API Change Streams MongoDB, который использует oplog MongoDB для захвата изменений в реальном времени.
- Документы из MongoDB по умолчанию реплицируются в ClickHouse с типом данных JSON. Это обеспечивает гибкое управление схемой и позволяет использовать богатый набор операторов JSON в ClickHouse для выполнения запросов и аналитики. Подробнее о работе с JSON-данными можно узнать [здесь](https://clickhouse.com/docs/sql-reference/data-types/newjson).
- Самостоятельная настройка PrivateLink в настоящее время недоступна. Если вы используете AWS и вам требуется PrivateLink, обратитесь по адресу db-integrations-support@clickhouse.com или создайте тикет в службу поддержки — мы поможем вам его настроить.
