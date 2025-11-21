---
sidebar_label: 'BladePipe'
sidebar_position: 20
keywords: ['clickhouse', 'BladePipe', 'подключение', 'интеграция', 'cdc', 'etl', 'интеграция данных']
slug: /integrations/bladepipe
description: 'Потоковая загрузка данных в ClickHouse с помощью потоков данных BladePipe'
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


# Подключение BladePipe к ClickHouse

<PartnerBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> — это инструмент для сквозной интеграции данных в режиме реального времени с задержкой менее секунды, обеспечивающий бесшовный обмен данными между платформами. 

ClickHouse — один из встроенных коннекторов BladePipe, позволяющий пользователям автоматически интегрировать данные из различных источников в ClickHouse. На этой странице пошагово показано, как загружать данные в ClickHouse в режиме реального времени.



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

Планируется добавление поддержки дополнительных источников.


<VerticalStepper headerLevel="h2">
## Загрузка и запуск BladePipe {#1-run-bladepipe}
1. Войдите в <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>.

2. Следуйте инструкциям в разделах <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Install Worker (Docker)</a> или <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Install Worker (Binary)</a>, чтобы загрузить и установить BladePipe Worker.

:::note
Также вы можете загрузить и развернуть <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>.
:::


## Добавление ClickHouse в качестве целевой системы {#2-add-clickhouse-as-a-target}

:::note

1. BladePipe поддерживает ClickHouse версии `20.12.3.3` и выше.
2. Для использования ClickHouse в качестве целевой системы убедитесь, что у пользователя есть права SELECT, INSERT и базовые права DDL.
   :::

3. В BladePipe нажмите «DataSource» > «Add DataSource».

4. Выберите `ClickHouse` и заполните настройки, указав хост и порт ClickHouse, имя пользователя и пароль, затем нажмите «Test Connection».

   <Image img={bp_ck_1} size='lg' border alt='Добавление ClickHouse в качестве целевой системы' />

5. Нажмите «Add DataSource» внизу, и экземпляр ClickHouse будет добавлен.


## Добавление MySQL в качестве источника {#3-add-mysql-as-a-source}

В этом руководстве мы используем экземпляр MySQL в качестве источника и описываем процесс загрузки данных из MySQL в ClickHouse.

:::note
Для использования MySQL в качестве источника убедитесь, что у пользователя есть <a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">необходимые разрешения</a>.
:::

1. В BladePipe нажмите «DataSource» > «Add DataSource».

2. Выберите `MySQL` и заполните настройки, указав хост и порт MySQL, имя пользователя и пароль, после чего нажмите «Test Connection».

   <Image img={bp_ck_2} size='lg' border alt='Добавление MySQL в качестве источника' />

3. Нажмите «Add DataSource» внизу — экземпляр MySQL будет добавлен.


## Создание конвейера {#4-create-a-pipeline}

1. В BladePipe нажмите «DataJob» > «Create DataJob».

2. Выберите добавленные экземпляры MySQL и ClickHouse и нажмите «Test Connection», чтобы убедиться, что BladePipe подключен к экземплярам. Затем выберите базы данных для переноса.

   <Image img={bp_ck_3} size='lg' border alt='Выбор источника и цели' />

3. Выберите «Incremental» в качестве типа DataJob вместе с опцией «Full Data».

   <Image img={bp_ck_4} size='lg' border alt='Выбор типа синхронизации' />

4. Выберите таблицы для репликации.

   <Image img={bp_ck_5} size='lg' border alt='Выбор таблиц' />

5. Выберите столбцы для репликации.

   <Image img={bp_ck_6} size='lg' border alt='Выбор столбцов' />

6. Подтвердите создание DataJob, после чего задание запустится автоматически.
   <Image img={bp_ck_8} size='lg' border alt='Выполнение DataJob' />


## Проверка данных {#5-verify-the-data}

1. Остановите запись данных в экземпляр MySQL и дождитесь слияния данных в ClickHouse.
   :::note
   Из-за непредсказуемого времени автоматического слияния в ClickHouse вы можете вручную инициировать слияние, выполнив команду `OPTIMIZE TABLE xxx FINAL;`. Обратите внимание, что ручное слияние может завершиться неудачно.

В качестве альтернативы вы можете выполнить команду `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;`, чтобы создать представление и выполнять запросы к нему для обеспечения полного слияния данных.
:::

2. Создайте <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">задание проверки данных (Verification DataJob)</a>. После завершения задания проверки просмотрите результаты, чтобы убедиться, что данные в ClickHouse идентичны данным в MySQL.
   <Image img={bp_ck_9} size='lg' border alt='Проверка данных' />

</VerticalStepper>
