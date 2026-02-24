---
sidebar_label: 'Ингестия данных из MongoDB в ClickHouse'
description: 'Описывает, как напрямую подключить вашу MongoDB к ClickHouse Cloud.'
slug: /integrations/clickpipes/mongodb
title: 'Ингестия данных из MongoDB в ClickHouse (с использованием CDC)'
doc_type: 'руководство'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
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


# Приём данных из MongoDB в ClickHouse (с использованием CDC) \{#ingesting-data-from-mongodb-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
Приём данных из MongoDB в ClickHouse Cloud через ClickPipes находится в стадии публичного бета-тестирования.
:::

:::note
В консоли и документации ClickHouse Cloud термины «table» и «collection» используются как взаимозаменяемые для MongoDB.
:::

Вы можете использовать ClickPipes для приёма данных из базы данных MongoDB в ClickHouse Cloud. Исходная база данных MongoDB может размещаться в локальной инфраструктуре (on-premises) или в облаке с использованием таких сервисов, как MongoDB Atlas.

## Предварительные требования \{#prerequisites\}

Для начала необходимо убедиться, что ваша база данных MongoDB корректно настроена для репликации. Шаги настройки зависят от того, как вы разворачиваете MongoDB, поэтому следуйте соответствующему руководству ниже:

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [Generic MongoDB](./mongodb/source/generic)

3. [Amazon DocumentDB](./mongodb/source/documentdb)

После того как исходная база данных MongoDB будет настроена, вы можете приступить к созданию ClickPipe.

## Создайте ClickPipe \{#create-your-clickpipe\}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

1. В консоли ClickHouse Cloud перейдите к своему сервису ClickHouse Cloud Service.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. В левом меню выберите кнопку `Data Sources` и нажмите «Set up a ClickPipe».

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

3. Выберите плитку `MongoDB CDC`.

<Image img={mongodb_tile} alt="Выбор MongoDB" size="lg" border/>

### Добавьте подключение к исходной базе данных MongoDB \{#add-your-source-mongodb-database-connection\}

4. Заполните параметры подключения к исходной базе данных MongoDB, которую вы настроили на этапе предварительных требований.

   :::info
   Прежде чем добавлять параметры подключения, убедитесь, что вы добавили IP-адреса ClickPipes в список разрешённых в правилах вашего брандмауэра. На следующей странице вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходной базы данных MongoDB, на которые есть ссылки [в верхней части этой страницы](#prerequisites).
   :::

   <Image img={mongodb_connection_details} alt="Заполните параметры подключения" size="lg" border/>

#### (Необязательно) Настройка SSH-туннелирования \{#optional-set-up-ssh-tunneling\}

Вы можете указать параметры SSH-туннелирования, если ваша исходная база данных MongoDB недоступна из публичного интернета.

1. Включите переключатель "Use SSH Tunnelling".
2. Заполните параметры SSH-подключения.

   <Image img={ssh_tunnel} alt="SSH-туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию по ключу, нажмите "Revoke and generate key pair", чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный открытый ключ на ваш SSH-сервер в `~/.ssh/authorized_keys`.
4. Нажмите "Verify Connection", чтобы проверить подключение.

:::note
Убедитесь, что вы добавили [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в список разрешённых в правилах межсетевого экрана (firewall) для SSH bastion-хоста, чтобы ClickPipes мог установить SSH-туннель.
:::

После заполнения параметров подключения нажмите `Next`.

#### Настройка расширенных параметров \{#advanced-settings\}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Sync interval**: Интервал, с которым ClickPipes будет опрашивать исходную базу данных на наличие изменений. Это влияет на целевой сервис ClickHouse; для пользователей, чувствительных к затратам, мы рекомендуем устанавливать более высокое значение (выше `3600`).
- **Pull batch size**: Количество строк, извлекаемых за один пакет. Это параметр по принципу «best effort», и он может соблюдаться не во всех случаях.
- **Snapshot number of tables in parallel**: Количество таблиц, которые будут считываться параллельно во время начального snapshot. Это полезно, когда у вас большое количество таблиц и вы хотите контролировать число таблиц, извлекаемых параллельно.

### Настройте таблицы \{#configure-the-tables\}

5. Здесь вы можете выбрать целевую базу данных для своего ClickPipe. Можно либо выбрать существующую базу данных, либо создать новую.

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных MongoDB. При выборе таблиц вы также можете переименовать их в целевой базе данных ClickHouse.

### Проверьте разрешения и запустите ClickPipe \{#review-permissions-and-start-the-clickpipe\}

7. Выберите роль «Full access» в выпадающем списке разрешений и нажмите «Complete setup».

   <Image img={ch_permissions} alt="Review permissions" size="lg" border/>

## Что дальше? \{#whats-next\}

После того как вы настроили ClickPipe для репликации данных из MongoDB в ClickHouse Cloud, вы можете сосредоточиться на том, как лучше выполнять запросы к данным и моделировать их для обеспечения оптимальной производительности.

## Особенности и ограничения \{#caveats\}

Ниже перечислены несколько важных особенностей и ограничений при использовании этого коннектора:

- Требуется MongoDB версии 5.1.0+.
- Для CDC (фиксация изменений данных) мы используем нативный API Change Streams MongoDB, который полагается на MongoDB oplog для фиксации изменений в режиме реального времени.
- Документы из MongoDB по умолчанию реплицируются в ClickHouse как данные типа JSON. Это обеспечивает гибкое управление схемой и позволяет использовать широкий набор JSON-операторов в ClickHouse для запросов и аналитики. Подробнее о выполнении запросов к данным JSON можно узнать [здесь](https://clickhouse.com/docs/sql-reference/data-types/newjson).
- Самостоятельная настройка PrivateLink в настоящее время недоступна. Если вы используете AWS и вам требуется PrivateLink, свяжитесь с db-integrations-support@clickhouse.com или создайте тикет в службу поддержки — мы поможем вам включить эту возможность.