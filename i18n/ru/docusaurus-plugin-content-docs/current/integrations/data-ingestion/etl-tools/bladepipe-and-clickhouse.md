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

<PartnerBadge />

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> — это инструмент для сквозной интеграции данных в реальном времени с субсекундной задержкой, обеспечивающий бесперебойный поток данных между платформами.

ClickHouse — один из готовых коннекторов BladePipe, который позволяет пользователям автоматически передавать данные из различных источников в ClickHouse. На этой странице пошагово показано, как загружать данные в ClickHouse в реальном времени.

## Поддерживаемые источники \{#supported-sources\}

В настоящее время BladePipe поддерживает интеграцию данных в ClickHouse из следующих источников:

* MySQL/MariaDB/AuroraMySQL
* Oracle
* PostgreSQL/AuroraPostgreSQL
* MongoDB
* Kafka
* PolarDB-MySQL
* OceanBase
* TiDB

В дальнейшем планируется поддержка дополнительных источников.

<VerticalStepper headerLevel="h2">
  ## Загрузите и запустите BladePipe \{#1-run-bladepipe\}

  1. Войдите в <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>.

  2. Следуйте инструкциям в <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Install Worker (Docker)</a> или <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Install Worker (Binary)</a>, чтобы загрузить и установить воркер BladePipe.

  :::note
  Либо вы можете загрузить и развернуть <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>.
  :::

  ## Добавьте ClickHouse как целевую систему \{#2-add-clickhouse-as-a-target\}

  :::note

  1. BladePipe поддерживает ClickHouse версии `20.12.3.3` и выше.

  2. Чтобы использовать ClickHouse как целевую систему, убедитесь, что у пользователя есть разрешения SELECT, INSERT и общие DDL-разрешения.
     :::

  3. В BladePipe нажмите &quot;DataSource&quot; &gt; &quot;Add DataSource&quot;.

  4. Выберите `ClickHouse`, заполните настройки, указав хост и порт ClickHouse, имя пользователя и пароль, затем нажмите &quot;Test Connection&quot;.

     <Image img={bp_ck_1} size="lg" border alt="Добавление ClickHouse как целевой системы" />

  5. Нажмите &quot;Add DataSource&quot; внизу страницы — экземпляр ClickHouse будет добавлен.

  ## Добавьте MySQL как источник \{#3-add-mysql-as-a-source\}

  В этом руководстве в качестве источника используется экземпляр MySQL, и показан процесс загрузки данных из MySQL в ClickHouse.

  :::note
  Чтобы использовать MySQL как источник, убедитесь, что у пользователя есть <a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">необходимые разрешения</a>.
  :::

  1. В BladePipe нажмите &quot;DataSource&quot; &gt; &quot;Add DataSource&quot;.

  2. Выберите `MySQL`, заполните настройки, указав хост и порт MySQL, имя пользователя и пароль, затем нажмите &quot;Test Connection&quot;.

     <Image img={bp_ck_2} size="lg" border alt="Добавление MySQL как источника" />

  3. Нажмите &quot;Add DataSource&quot; внизу страницы — экземпляр MySQL будет добавлен.

  ## Создайте конвейер \{#4-create-a-pipeline\}

  1. В BladePipe нажмите &quot;DataJob&quot; &gt; &quot;Create DataJob&quot;.

  2. Выберите добавленные экземпляры MySQL и ClickHouse и нажмите &quot;Test Connection&quot;, чтобы убедиться, что BladePipe подключен к ним. Затем выберите базы данных для переноса.
     <Image img={bp_ck_3} size="lg" border alt="Выбор источника и целевой системы" />

  3. Для типа DataJob выберите &quot;Incremental&quot; вместе с опцией &quot;Full Data&quot;.
     <Image img={bp_ck_4} size="lg" border alt="Выбор типа синхронизации" />

  4. Выберите таблицы для репликации.
     <Image img={bp_ck_5} size="lg" border alt="Выбор таблиц" />

  5. Выберите столбцы для репликации.
     <Image img={bp_ck_6} size="lg" border alt="Выбор столбцов" />

  6. Подтвердите создание DataJob — после этого DataJob запустится автоматически.
     <Image img={bp_ck_8} size="lg" border alt="DataJob выполняется" />

  ## Проверка данных \{#5-verify-the-data\}

  1. Остановите запись данных в экземпляр MySQL и дождитесь завершения слияния данных в ClickHouse.
     :::note
     Поскольку время автоматического слияния в ClickHouse непредсказуемо, вы можете запустить слияние вручную, выполнив команду `OPTIMIZE TABLE xxx FINAL;`. Обратите внимание, что ручное слияние может завершиться неудачно.

  В качестве альтернативы можно выполнить команду `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;`, чтобы создать представление и выполнять запросы к нему для гарантии полного слияния данных.
  :::

  2. Создайте <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">задание проверки данных (Verification DataJob)</a>. После завершения задания проверьте результаты, чтобы убедиться, что данные в ClickHouse идентичны данным в MySQL.
     <Image img={bp_ck_9} size="lg" border alt="Проверка данных" />
</VerticalStepper>