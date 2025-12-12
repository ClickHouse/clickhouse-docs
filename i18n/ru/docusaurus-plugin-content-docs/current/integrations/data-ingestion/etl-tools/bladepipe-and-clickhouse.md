---
sidebar_label: 'BladePipe'
sidebar_position: 20
keywords: ['clickhouse', 'BladePipe', 'подключение', 'интеграция', 'CDC', 'ETL', 'интеграция данных']
slug: /integrations/bladepipe
description: 'Стриминг данных в ClickHouse с помощью конвейеров данных BladePipe'
title: 'Подключение BladePipe к ClickHouse'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import bp_ck_1 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_1.png';
import bp_ck_2 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_2.png';
import bp_ck_3 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_3.png';
import bp_ck_4 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_4.png';
import bp_ck_5 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_5.png';
import bp_ck_6 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_6.png';
import bp_ck_7 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_7.png';
import bp_ck_8 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_8.png';
import bp_ck_9 from '@site/static/images/integrations/data-ingestion/etl-tools/bp_ck_9.png';
import PartnerBadge from '@theme/badges/PartnerBadge';

# Подключение BladePipe к ClickHouse {#connect-bladepipe-to-clickhouse}

<PartnerBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> — это инструмент сквозной интеграции данных в режиме реального времени с задержкой менее секунды, обеспечивающий бесшовный поток данных между различными платформами. 

ClickHouse — один из готовых коннекторов BladePipe, что позволяет пользователям автоматически интегрировать данные из различных источников в ClickHouse. На этой странице показано, как пошагово настроить загрузку данных в ClickHouse в режиме реального времени.

## Поддерживаемые источники {#supported-sources}
В настоящее время BladePipe поддерживает интеграцию данных в ClickHouse из следующих источников:
- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

В дальнейшем планируется поддержка дополнительных источников.

<VerticalStepper headerLevel="h2">
## Загрузите и запустите BladePipe {#1-run-bladepipe}
1. Войдите в <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>.

2. Следуйте инструкциям в разделах <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Install Worker (Docker)</a> или <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Install Worker (Binary)</a>, чтобы загрузить и установить BladePipe Worker.

:::note
Также вы можете загрузить и развернуть <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>.
:::

## Добавление ClickHouse в качестве целевого хранилища {#2-add-clickhouse-as-a-target}

  :::note
  1. BladePipe поддерживает ClickHouse версии `20.12.3.3` и выше.
  2. Чтобы использовать ClickHouse в качестве целевого хранилища, убедитесь, что у пользователя есть привилегии SELECT, INSERT и базовые DDL-привилегии. 
  :::

1. В BladePipe выберите "DataSource" > "Add DataSource".

2. Выберите `ClickHouse` и заполните настройки, указав хост и порт ClickHouse, имя пользователя и пароль, затем нажмите "Test Connection".

    <Image img={bp_ck_1} size="lg" border alt="Добавление ClickHouse в качестве целевого хранилища" />

3. Нажмите "Add DataSource" внизу, после чего будет добавлен экземпляр ClickHouse.

## Добавление MySQL в качестве источника {#3-add-mysql-as-a-source}
В этом руководстве мы используем экземпляр MySQL в качестве источника и рассматриваем процесс загрузки данных MySQL в ClickHouse.

:::note
Чтобы использовать MySQL в качестве источника, убедитесь, что у пользователя есть <a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">необходимые права доступа</a>. 
:::

1. В BladePipe нажмите "DataSource" > "Add DataSource".

2. Выберите `MySQL` и заполните настройки, указав хост и порт MySQL, имя пользователя и пароль, затем нажмите "Test Connection".

    <Image img={bp_ck_2} size="lg" border alt="Добавление MySQL в качестве источника" />

3. Нажмите "Add DataSource" внизу — экземпляр MySQL будет добавлен.

## Создание конвейера {#4-create-a-pipeline}

1. В BladePipe нажмите "DataJob" > "Create DataJob".

2. Выберите добавленные инстансы MySQL и ClickHouse и нажмите "Test Connection", чтобы убедиться, что BladePipe может к ним подключиться. Затем выберите базы данных, которые нужно перенести.
   <Image img={bp_ck_3} size="lg" border alt="Выбор источника и получателя" />

3. Для типа DataJob выберите "Incremental" вместе с опцией "Full Data".
   <Image img={bp_ck_4} size="lg" border alt="Выбор типа синхронизации" />

4. Выберите таблицы для репликации.
   <Image img={bp_ck_5} size="lg" border alt="Выбор таблиц" />

5. Выберите столбцы для репликации.
   <Image img={bp_ck_6} size="lg" border alt="Выбор столбцов" />

6. Подтвердите создание DataJob — после этого он запустится автоматически.
    <Image img={bp_ck_8} size="lg" border alt="DataJob выполняется" />

## Проверка данных {#5-verify-the-data}

1. Остановите запись данных в экземпляр MySQL и дождитесь завершения слияния данных в ClickHouse.
   :::note
   Поскольку время автоматического слияния в ClickHouse непредсказуемо, вы можете запустить слияние вручную, выполнив команду `OPTIMIZE TABLE xxx FINAL;`. Обратите внимание, что ручное слияние может завершиться неудачно.

В качестве альтернативы можно выполнить команду `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;`, чтобы создать представление и выполнять запросы к нему для гарантии полного слияния данных.
:::

2. Создайте <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">задание проверки данных (Verification DataJob)</a>. После завершения задания проверьте результаты, чтобы убедиться, что данные в ClickHouse идентичны данным в MySQL.
   <Image img={bp_ck_9} size='lg' border alt='Проверка данных' />

</VerticalStepper>
