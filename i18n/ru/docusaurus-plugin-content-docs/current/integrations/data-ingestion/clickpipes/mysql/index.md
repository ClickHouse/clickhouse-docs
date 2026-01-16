---
sidebar_label: 'Приём данных из MySQL в ClickHouse'
description: 'Описывает, как бесшовно принимать данные из вашей базы данных MySQL или MariaDB в ClickHouse Cloud.'
slug: /integrations/clickpipes/mysql
title: 'Приём данных из MySQL в ClickHouse (с использованием CDC)'
doc_type: 'руководство'
keywords: ['MySQL', 'ClickPipes', 'CDC', 'фиксация изменений данных', 'репликация баз данных']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
---

import Aurorasvg from '@site/static/images/integrations/logos/amazon_aurora.svg';
import AFSsvg from '@site/static/images/integrations/logos/azure_database_mysql.svg';
import CloudSQLsvg from '@site/static/images/integrations/logos/gcp_cloudsql.svg';
import MariaDBsvg from '@site/static/images/integrations/logos/mariadb.svg';
import MySQLsvg from '@site/static/images/integrations/logos/mysql.svg';
import RDSsvg from '@site/static/images/integrations/logos/amazon_rds.svg';
import BetaBadge from '@theme/badges/BetaBadge';
import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import mysql_tile from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-tile.png'
import mysql_connection_details from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/mysql-connection-details.png'
import ssh_tunnel from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ssh-tunnel.jpg'
import select_destination_db from '@site/static/images/integrations/data-ingestion/clickpipes/mysql/select-destination-db.png'
import ch_permissions from '@site/static/images/integrations/data-ingestion/clickpipes/postgres/ch-permissions.jpg'
import Image from '@theme/IdealImage';

# Ингестия данных из MySQL в ClickHouse (с использованием CDC) \{#ingesting-data-from-mysql-to-clickhouse-using-cdc\}

<BetaBadge/>

:::info
Ингестия данных из MySQL в ClickHouse Cloud через ClickPipes находится в режиме открытого бета-тестирования.
:::

MySQL ClickPipe предоставляет полностью управляемый и отказоустойчивый способ ингестии данных из баз данных MySQL и MariaDB в ClickHouse Cloud. Поддерживаются как **bulk loads** для одноразовой ингестии, так и **Change Data Capture (CDC)** для непрерывной ингестии.

MySQL ClickPipes можно развёртывать и управлять ими вручную через ClickPipes UI. В будущем станет возможно развёртывать и управлять MySQL ClickPipes программно с помощью [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) и [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).

## Предварительные требования \\{#prerequisites\\}

[//]: # "TODO Binlog replication configuration is not needed for one-time ingestion pipes. This has been a source of confusion in the past, so we should also provide the bare minimum requirements for bulk loads to avoid scaring users off."

Прежде чем начать, необходимо убедиться, что ваша база данных MySQL корректно настроена для репликации binlog. Этапы настройки зависят от способа развертывания MySQL, поэтому следуйте соответствующему руководству ниже:

### Поддерживаемые источники данных \\{#supported-data-sources\\}

| Название             | Логотип | Подробности       |
|----------------------|---------|-------------------|
| **Amazon RDS MySQL** <br></br> _Разовая загрузка, CDC_ | <RDSsvg class="image" alt="логотип Amazon RDS" style={{width: '2.5rem', height: 'auto'}}/> | Следуйте руководству по настройке [Amazon RDS MySQL](./mysql/source/rds). |
| **Amazon Aurora MySQL** <br></br> _Разовая загрузка, CDC_ | <Aurorasvg class="image" alt="логотип Amazon Aurora" style={{width: '2.5rem', height: 'auto'}}/> | Следуйте руководству по настройке [Amazon Aurora MySQL](./mysql/source/aurora). |
| **Cloud SQL for MySQL** <br></br> _Разовая загрузка, CDC_ | <CloudSQLsvg class="image" alt="логотип Cloud SQL" style={{width: '2.5rem', height: 'auto'}}/>|  Следуйте руководству по настройке [Cloud SQL for MySQL](./mysql/source/gcp). |
| **Azure Flexible Server for MySQL** <br></br> _Разовая загрузка_ | <AFSsvg class="image" alt="логотип Azure Flexible Server for MySQL" style={{width: '2.5rem', height: 'auto'}}/> | Следуйте руководству по настройке [Azure Flexible Server for MySQL](./mysql/source/azure-flexible-server-mysql). |
| **Самостоятельно развернутый MySQL** <br></br> _Разовая загрузка, CDC_ | <MySQLsvg class="image" alt="логотип MySQL" style={{width: '2.5rem', height: 'auto'}}/>|  Следуйте руководству по настройке [Generic MySQL](./mysql/source/generic). |
| **Amazon RDS MariaDB** <br></br> _Разовая загрузка, CDC_ | <RDSsvg class="image" alt="логотип Amazon RDS" style={{width: '2.5rem', height: 'auto'}}/> | Следуйте руководству по настройке [Amazon RDS MariaDB](./mysql/source/rds_maria). |
| **Самостоятельно развернутая MariaDB** <br></br> _Разовая загрузка, CDC_ | <MariaDBsvg class="image" alt="логотип MariaDB" style={{width: '2.5rem', height: 'auto'}}/>|  Следуйте руководству по настройке [Generic MariaDB](./mysql/source/generic_maria). |

После настройки исходной базы данных MySQL можно продолжить создание ClickPipe.

## Создайте свой ClickPipe \\{#create-your-clickpipe\\}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO update image here)

1. В консоли ClickHouse Cloud перейдите к своему сервису ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. В левом меню выберите кнопку `Data Sources` и нажмите "Set up a ClickPipe".

<Image img={cp_step0} alt="Выбор импорта" size="lg" border/>

3. Выберите плитку `MySQL CDC`.

<Image img={mysql_tile} alt="Выберите MySQL" size="lg" border/>

### Добавьте подключение к исходной базе данных MySQL \\{#add-your-source-mysql-database-connection\\}

4. Заполните параметры подключения к исходной базе данных MySQL, которую вы настроили на этапе предварительной подготовки.

   :::info
   Прежде чем добавлять параметры подключения, убедитесь, что вы добавили IP-адреса ClickPipes в список разрешённых в правилах брандмауэра. На следующей странице вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходного MySQL, приведённым [в верхней части этой страницы](#prerequisites).
   :::

   <Image img={mysql_connection_details} alt="Заполните параметры подключения" size="lg" border/>

#### (Необязательно) Настройка SSH-туннелирования \\{#optional-set-up-ssh-tunneling\\}

Вы можете указать параметры SSH-туннелирования, если ваша исходная база данных MySQL недоступна из публичной сети.

1. Включите переключатель "Use SSH Tunnelling".
2. Заполните параметры SSH-подключения.

   <Image img={ssh_tunnel} alt="SSH-туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию по ключу, нажмите "Revoke and generate key pair", чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный открытый ключ на SSH-сервер в файл `~/.ssh/authorized_keys`.
4. Нажмите "Verify Connection", чтобы проверить подключение.

:::note
Убедитесь, что вы добавили [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в список разрешённых в правилах брандмауэра для bastion-хоста SSH, чтобы ClickPipes смог установить SSH-туннель.
:::

После того как параметры подключения будут заполнены, нажмите `Next`.

#### Настройка расширенных параметров \\{#advanced-settings\\}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Sync interval**: Интервал, с которым ClickPipes опрашивает исходную базу данных на предмет изменений. Это влияет на целевой сервис ClickHouse; для пользователей, чувствительных к стоимости, мы рекомендуем устанавливать более высокое значение (более `3600`).
- **Parallel threads for initial load**: Количество параллельных воркеров, которые будут использоваться для получения начального снимка. Полезно, если у вас много таблиц и вы хотите контролировать количество параллельных воркеров, используемых для получения начального снимка. Этот параметр задаётся для каждой таблицы.
- **Pull batch size**: Количество строк, извлекаемых в одном батче. Это параметр в режиме «best effort», и он может не всегда строго соблюдаться.
- **Snapshot number of rows per partition**: Количество строк, которые будут извлечены в каждом разделе (partition) во время начального снимка. Полезно, если у вас много строк в таблицах и вы хотите контролировать количество строк, извлекаемых в каждом разделе.
- **Snapshot number of tables in parallel**: Количество таблиц, которые будут извлекаться параллельно во время начального снимка. Полезно, если у вас много таблиц и вы хотите контролировать количество таблиц, извлекаемых параллельно.

### Настройка таблиц \\{#configure-the-tables\\}

5. Здесь вы можете выбрать целевую базу данных для вашего ClickPipe. Вы можете выбрать существующую базу данных или создать новую.

   <Image img={select_destination_db} alt="Выбор целевой базы данных" size="lg" border/>

6. Вы можете выбрать таблицы, которые нужно реплицировать из исходной базы данных MySQL. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse, а также исключить отдельные столбцы.

### Просмотрите права доступа и запустите ClickPipe \\{#review-permissions-and-start-the-clickpipe\\}

7. Выберите роль "Full access" в выпадающем списке прав доступа и нажмите "Complete Setup".

   <Image img={ch_permissions} alt="Просмотр прав доступа" size="lg" border/>

Наконец, для получения дополнительной информации о распространённых проблемах и способах их решения обратитесь к разделу ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq).

## Что дальше? \\{#whats-next\\}

[//]: # "TODO Write a MySQL-specific migration guide and best practices similar to the existing one for PostgreSQL. The current migration guide points to the MySQL table engine, which is not ideal."

После того как вы настроите ClickPipe для репликации данных из MySQL в ClickHouse Cloud, вы можете сосредоточиться на том, как выполнять запросы и моделировать данные для оптимальной производительности. Ответы на распространённые вопросы по CDC (фиксации изменений данных) в MySQL и устранению неполадок см. на [странице часто задаваемых вопросов по MySQL](/integrations/data-ingestion/clickpipes/mysql/faq.md).