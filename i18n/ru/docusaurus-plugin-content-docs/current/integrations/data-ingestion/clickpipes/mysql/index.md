---
sidebar_label: 'Приём данных из MySQL в ClickHouse'
description: 'Бесшовный приём данных из вашей базы данных MySQL или MariaDB в ClickHouse Cloud.'
slug: /integrations/clickpipes/mysql
title: 'Приём данных из MySQL в ClickHouse (с использованием CDC)'
doc_type: 'guide'
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
Ингестия данных из MySQL в ClickHouse Cloud с помощью ClickPipes находится в стадии публичной беты.
:::

MySQL ClickPipe предоставляет полностью управляемый и отказоустойчивый способ приёма данных из баз данных MySQL и MariaDB в ClickHouse Cloud. Он поддерживает как **массовые загрузки (bulk loads)** для одноразовой ингестии, так и **Change Data Capture (CDC)** для непрерывной ингестии.

MySQL ClickPipes могут развертываться и управляться вручную через интерфейс ClickPipes UI. В будущем можно будет развертывать и управлять MySQL ClickPipes программно с использованием [OpenAPI](https://clickhouse.com/docs/cloud/manage/api/swagger#tag/ClickPipes/paths/~1v1~1organizations~1%7BorganizationId%7D~1services~1%7BserviceId%7D~1clickpipes/post) и [Terraform](https://registry.terraform.io/providers/ClickHouse/clickhouse/3.8.1-alpha1/docs/resources/clickpipe).

## Предварительные требования \{#prerequisites\}

[//]: # "TODO Binlog replication configuration is not needed for one-time ingestion pipes. This has been a source of confusion in the past, so we should also provide the bare minimum requirements for bulk loads to avoid scaring users off."

Для начала необходимо убедиться, что ваша база данных MySQL корректно настроена для репликации binlog. Шаги настройки зависят от того, как вы разворачиваете MySQL, поэтому следуйте соответствующему руководству ниже:

### Поддерживаемые источники данных \{#supported-data-sources\}

| Название             | Логотип | Подробности       |
|----------------------|--------|-------------------|
| **Amazon RDS MySQL** <br></br> _Разовая загрузка, CDC_ |  | Следуйте инструкциям в руководстве по настройке [Amazon RDS MySQL](./mysql/source/rds). |
| **Amazon Aurora MySQL** <br></br> _Разовая загрузка, CDC_ |  | Следуйте инструкциям в руководстве по настройке [Amazon Aurora MySQL](./mysql/source/aurora). |
| **Cloud SQL for MySQL** <br></br> _Разовая загрузка, CDC_ | | Следуйте инструкциям в руководстве по настройке [Cloud SQL for MySQL](./mysql/source/gcp). |
| **Azure Flexible Server for MySQL** <br></br> _Разовая загрузка_ |  | Следуйте инструкциям в руководстве по настройке [Azure Flexible Server for MySQL](./mysql/source/azure-flexible-server-mysql). |
| **Self-hosted MySQL** <br></br> _Разовая загрузка, CDC_ | | Следуйте инструкциям в руководстве по настройке [Generic MySQL](./mysql/source/generic). |
| **Amazon RDS MariaDB** <br></br> _Разовая загрузка, CDC_ |  | Следуйте инструкциям в руководстве по настройке [Amazon RDS MariaDB](./mysql/source/rds_maria). |
| **Self-hosted MariaDB** <br></br> _Разовая загрузка, CDC_ | | Следуйте инструкциям в руководстве по настройке [Generic MariaDB](./mysql/source/generic_maria). |

После настройки исходной базы данных MySQL вы можете продолжить создание ClickPipe.

## Создайте ClickPipe \{#create-your-clickpipe\}

Убедитесь, что вы вошли в свою учетную запись ClickHouse Cloud. Если у вас еще нет учетной записи, вы можете зарегистрироваться [здесь](https://cloud.clickhouse.com/).

[//]: # (   TODO обновить изображение здесь)

1. В консоли ClickHouse Cloud перейдите к своему сервису ClickHouse Cloud.

<Image img={cp_service} alt="Сервис ClickPipes" size="lg" border/>

2. В левом меню выберите кнопку `Data Sources` и нажмите «Настроить ClickPipe».

<Image img={cp_step0} alt="Выберите импорты" size="lg" border/>

3. Выберите плитку `MySQL CDC`.

<Image img={mysql_tile} alt="Выберите MySQL" size="lg" border/>

### Добавьте подключение к исходной базе данных MySQL \{#add-your-source-mysql-database-connection\}

4. Заполните параметры подключения для исходной базы данных MySQL, которую вы настроили на этапе предварительной настройки.

   :::info
   Прежде чем добавлять параметры подключения, убедитесь, что вы включили IP-адреса ClickPipes в список разрешённых в правилах брандмауэра. По следующей ссылке вы можете найти [список IP-адресов ClickPipes](../index.md#list-of-static-ips).
   Для получения дополнительной информации обратитесь к руководствам по настройке исходной базы данных MySQL, приведённым по [ссылке в начале этой страницы](#prerequisites).
   :::

   <Image img={mysql_connection_details} alt="Заполните параметры подключения" size="lg" border/>

#### (Необязательно) Настройка SSH-туннелирования \{#optional-set-up-ssh-tunneling\}

Вы можете указать параметры SSH-туннелирования, если ваша исходная база данных MySQL недоступна из публичной сети.

1. Включите переключатель «Использовать SSH-туннелирование».
2. Заполните параметры SSH-подключения.

   <Image img={ssh_tunnel} alt="SSH-туннелирование" size="lg" border/>

3. Чтобы использовать аутентификацию по ключу, нажмите «Отозвать и сгенерировать пару ключей», чтобы сгенерировать новую пару ключей, и скопируйте сгенерированный открытый ключ на ваш SSH-сервер в файл `~/.ssh/authorized_keys`.
4. Нажмите «Проверить подключение», чтобы проверить соединение.

:::note
Убедитесь, что вы добавили [IP-адреса ClickPipes](../clickpipes#list-of-static-ips) в список разрешённых в правилах брандмауэра для SSH bastion-хоста, чтобы ClickPipes мог установить SSH-туннель.
:::

После заполнения параметров подключения нажмите `Next`.

#### Настройка расширенных параметров \{#advanced-settings\}

При необходимости вы можете настроить расширенные параметры. Краткое описание каждого параметра приведено ниже:

- **Sync interval**: Интервал, с которым ClickPipes будет опрашивать исходную базу данных на наличие изменений. Это влияет на целевой сервис ClickHouse; для пользователей, чувствительных к затратам, мы рекомендуем устанавливать более высокое значение (свыше `3600`).
- **Parallel threads for initial load**: Количество параллельных рабочих потоков, которое будет использоваться для получения начального снимка. Полезно, когда у вас большое количество таблиц и вы хотите контролировать число параллельных потоков, используемых для получения начального снимка. Этот параметр задается для каждой таблицы.
- **Pull batch size**: Количество строк, извлекаемых в одном пакете. Это параметр по принципу best effort и может соблюдаться не во всех случаях.
- **Snapshot number of rows per partition**: Количество строк, которое будет извлечено в каждой партиции во время начального снимка. Полезно, когда в таблицах большое количество строк и вы хотите контролировать число строк, извлекаемых в каждой партиции.
- **Snapshot number of tables in parallel**: Количество таблиц, которые будут извлекаться параллельно во время начального снимка. Полезно, когда у вас большое количество таблиц и вы хотите контролировать число таблиц, обрабатываемых параллельно.

### Настройте таблицы \{#configure-the-tables\}

5. Здесь вы можете выбрать целевую базу данных для ClickPipe. Вы можете либо выбрать существующую базу данных, либо создать новую.

   <Image img={select_destination_db} alt="Select destination database" size="lg" border/>

6. Вы можете выбрать таблицы, которые хотите реплицировать из исходной базы данных MySQL. При выборе таблиц вы также можете переименовать таблицы в целевой базе данных ClickHouse, а также исключить определённые столбцы.

### Проверьте права доступа и запустите ClickPipe \{#review-permissions-and-start-the-clickpipe\}

7. Выберите роль «Full access» в раскрывающемся списке прав доступа и нажмите «Complete Setup».

   <Image img={ch_permissions} alt="Проверка прав доступа" size="lg" border/>

Дополнительные сведения о распространённых проблемах и способах их решения см. на странице ["ClickPipes for MySQL FAQ"](/integrations/clickpipes/mysql/faq).

## Что дальше? \{#whats-next\}

[//]: # "TODO Написать специализированное руководство по миграции и лучшие практики для MySQL, аналогичные существующим для PostgreSQL. Текущее руководство по миграции указывает на движок таблиц MySQL (MySQL table engine), что не является оптимальным вариантом."

После того как вы настроили ClickPipe для репликации данных из MySQL в ClickHouse Cloud, вы можете сосредоточиться на том, как выполнять запросы и моделировать данные для достижения оптимальной производительности. Ответы на распространённые вопросы по MySQL CDC и устранению неполадок см. на странице [MySQL FAQs](/integrations/data-ingestion/clickpipes/mysql/faq.md).