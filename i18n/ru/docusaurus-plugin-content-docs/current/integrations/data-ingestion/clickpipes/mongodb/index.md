---
sidebar_label: 'Приём данных из MongoDB в ClickHouse'
description: 'Описывает, как бесшовно подключить MongoDB к ClickHouse Cloud.'
slug: /integrations/clickpipes/mongodb
title: 'Приём данных из MongoDB в ClickHouse (с использованием CDC)'
doc_type: 'guide'
keywords: ['clickpipes', 'mongodb', 'cdc', 'ингестия данных', 'синхронизация в реальном времени']
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

# Приём данных из MongoDB в ClickHouse (с использованием CDC) {#ingesting-data-from-mongodb-to-clickhouse-using-cdc}

<BetaBadge/>

:::info
Приём данных из MongoDB в ClickHouse Cloud через ClickPipes находится в стадии публичного бета-тестирования.
:::

:::note
В консоли и документации ClickHouse Cloud термины «table» и «collection» для MongoDB используются взаимозаменяемо.
:::

Вы можете использовать ClickPipes, чтобы организовать приём данных из вашей базы данных MongoDB в ClickHouse Cloud. Исходная база данных MongoDB может размещаться в локальной инфраструктуре (on-premises) или в облаке с использованием сервисов, таких как MongoDB Atlas.

## Предварительные требования {#prerequisites}

Прежде чем начать, необходимо убедиться, что ваша база данных MongoDB корректно настроена для репликации данных. Шаги настройки зависят от того, как вы разворачиваете MongoDB, поэтому выполните инструкции из соответствующего руководства ниже:

1. [MongoDB Atlas](./mongodb/source/atlas)

2. [Обычная установка MongoDB](./mongodb/source/generic)

3. [Amazon DocumentDB](./mongodb/source/documentdb)

После того как исходная база данных MongoDB настроена, можно продолжить создание ClickPipe.

## Создайте свой ClickPipe {#create-your-clickpipe}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

1. В консоли ClickHouse Cloud перейдите к своему сервису ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. В левом меню выберите кнопку `Data Sources` и нажмите "Set up a ClickPipe".

<Image img={cp_step0} alt="Выбор импортов" size="lg" border/>

3. Выберите плитку `MongoDB CDC`.

<Image img={mongodb_tile} alt="Выбор MongoDB" size="lg" border/>

### Добавьте подключение к исходной базе данных MongoDB {#add-your-source-mongodb-database-connection}

4. Заполните данные подключения к исходной базе данных MongoDB, которую вы настроили на шаге с предварительными требованиями.

   :::info
   Прежде чем добавлять данные подключения, убедитесь, что вы внесли IP-адреса ClickPipes в список разрешённых в правилах своего брандмауэра. На следующей странице вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходной MongoDB, указанным [в начале этой страницы](#prerequisites).
   :::

   <Image img={mongodb_connection_details} alt="Заполнение данных подключения" size="lg" border/>

#### (Необязательно) Настройка SSH-туннелирования {#optional-set-up-ssh-tunneling}

Вы можете указать параметры SSH-туннелирования, если ваша исходная база данных MongoDB недоступна из публичной сети.

1. Включите переключатель "Use SSH Tunnelling".
2. Заполните данные SSH-подключения.

   <Image img={ssh_tunnel} alt="SSH-туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию по ключу, нажмите "Revoke and generate key pair", чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный открытый ключ на SSH-сервер в файл `~/.ssh/authorized_keys`.
4. Нажмите "Verify Connection", чтобы проверить подключение.

:::note
Убедитесь, что вы внесли [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в список разрешённых в правилах брандмауэра для SSH bastion-хоста, чтобы ClickPipes мог установить SSH-туннель.
:::

После заполнения данных подключения нажмите `Next`.

#### Настройка расширенных параметров {#advanced-settings}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Sync interval**: интервал, с которым ClickPipes будет опрашивать исходную базу данных на наличие изменений. Это влияет на целевой сервис ClickHouse; для пользователей, чувствительных к стоимости, мы рекомендуем устанавливать более высокое значение (более `3600`).
- **Pull batch size**: количество строк, выбираемых за один пакет. Это параметр с режимом best-effort и он может не соблюдаться во всех случаях.
- **Snapshot number of tables in parallel**: количество таблиц, которые будут выгружаться параллельно во время первоначального snapshot-а. Это полезно, если у вас много таблиц и вы хотите контролировать количество таблиц, обрабатываемых параллельно.

### Настройка таблиц {#configure-the-tables}

5. Здесь вы можете выбрать целевую базу данных для своего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image img={select_destination_db} alt="Выбор целевой базы данных" size="lg" border/>

6. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных MongoDB. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse.

### Проверьте права доступа и запустите ClickPipe {#review-permissions-and-start-the-clickpipe}

7. Выберите роль "Full access" в раскрывающемся списке прав доступа и нажмите "Complete Setup".

   <Image img={ch_permissions} alt="Проверка прав доступа" size="lg" border/>

## Что дальше? {#whats-next}

После того как вы настроили ClickPipe для репликации данных из MongoDB в ClickHouse Cloud, можно сосредоточиться на том, как строить запросы и моделировать данные для оптимальной производительности.

## Ограничения {#caveats}

Ниже приведены несколько ограничений, которые следует учитывать при использовании этого коннектора:

- Требуется версия MongoDB 5.1.0+.
- Для CDC мы используем родной API MongoDB Change Streams, который полагается на MongoDB oplog для фиксации изменений в реальном времени. 
- Документы из MongoDB по умолчанию реплицируются в ClickHouse как тип данных JSON. Это обеспечивает гибкое управление схемой и позволяет использовать богатый набор JSON-операторов в ClickHouse для запросов и аналитики. Подробнее о выполнении запросов к JSON-данным можно узнать [здесь](https://clickhouse.com/docs/sql-reference/data-types/newjson).
- Самостоятельная конфигурация PrivateLink в настоящее время недоступна. Если вы используете AWS и вам необходим PrivateLink, свяжитесь с нами по адресу db-integrations-support@clickhouse.com или создайте заявку в службу поддержки — мы поможем вам его включить.
