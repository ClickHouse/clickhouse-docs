---
'sidebar_label': 'BladePipe'
'sidebar_position': 20
'keywords':
- 'clickhouse'
- 'BladePipe'
- 'connect'
- 'integrate'
- 'cdc'
- 'etl'
- 'data integration'
'slug': '/integrations/bladepipe'
'description': 'Передача данных в ClickHouse с использованием конвейеров данных BladePipe'
'title': 'Подключение BladePipe к ClickHouse'
'doc_type': 'guide'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение BladePipe к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://www.bladepipe.com/" target="_blank">BladePipe</a> — это инструмент интеграции данных в реальном времени с задержкой менее одной секунды, способствующий бесперебойному потоку данных между платформами.

ClickHouse является одним из предустановленных коннекторов BladePipe, позволяющим пользователям автоматически интегрировать данные из различных источников в ClickHouse. Эта страница покажет, как загрузить данные в ClickHouse в реальном времени шаг за шагом.

## Поддерживаемые источники {#supported-sources}
В данный момент BladePipe поддерживает интеграцию данных в ClickHouse из следующих источников:
- MySQL/MariaDB/AuroraMySQL
- Oracle
- PostgreSQL/AuroraPostgreSQL
- MongoDB
- Kafka
- PolarDB-MySQL
- OceanBase
- TiDB

Поддержка большего числа источников будет добавлена.

<VerticalStepper headerLevel="h2">
## Загрузка и запуск BladePipe {#1-run-bladepipe}
1. Войдите в <a href="https://www.bladepipe.com/" target="_blank">BladePipe Cloud</a>.

2. Следуйте инструкциям в <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_docker" target="_blank">Установка Worker (Docker)</a> или <a href="https://doc.bladepipe.com/productOP/byoc/installation/install_worker_binary" target="_blank">Установка Worker (Binary)</a>, чтобы скачать и установить Worker BladePipe.

  :::note
  В качестве альтернативы вы можете скачать и развернуть <a href="https://doc.bladepipe.com/productOP/onPremise/installation/install_all_in_one_binary" target="_blank">BladePipe Enterprise</a>.
  :::

## Добавление ClickHouse в качестве цели {#2-add-clickhouse-as-a-target}

  :::note
  1. BladePipe поддерживает ClickHouse версии `20.12.3.3` и выше.
  2. Чтобы использовать ClickHouse в качестве цели, убедитесь, что у пользователя есть права SELECT, INSERT и общие разрешения DDL. 
  :::

1. В BladePipe нажмите "DataSource" > "Добавить DataSource".

2. Выберите `ClickHouse` и заполните настройки, указав хост и порт ClickHouse, имя пользователя и пароль, затем нажмите "Проверить соединение".

    <Image img={bp_ck_1} size="lg" border alt="Добавить ClickHouse в качестве цели" />

3. Нажмите "Добавить DataSource" внизу, и экземпляр ClickHouse будет добавлен.

## Добавление MySQL в качестве источника {#3-add-mysql-as-a-source}
В этом руководстве мы используем экземпляр MySQL в качестве источника и объясняем процесс загрузки данных MySQL в ClickHouse.

:::note
Чтобы использовать MySQL в качестве источника, убедитесь, что у пользователя есть <a href="https://doc.bladepipe.com/dataMigrationAndSync/datasource_func/MySQL/privs_for_mysql" target="_blank">необходимые права</a>. 
:::

1. В BladePipe нажмите "DataSource" > "Добавить DataSource".

2. Выберите `MySQL` и заполните настройки, указав хост и порт MySQL, имя пользователя и пароль, затем нажмите "Проверить соединение".

    <Image img={bp_ck_2} size="lg" border alt="Добавить MySQL в качестве источника" />

3. Нажмите "Добавить DataSource" внизу, и экземпляр MySQL будет добавлен.

## Создание канала {#4-create-a-pipeline}

1. В BladePipe нажмите "DataJob" > "Создать DataJob".

2. Выберите добавленные экземпляры MySQL и ClickHouse и нажмите "Проверить соединение", чтобы убедиться, что BladePipe подключен к экземплярам. Затем выберите базы данных, которые нужно переместить.
   <Image img={bp_ck_3} size="lg" border alt="Выберите источник и цель" />

3. Выберите "Инкрементный" для типа DataJob, вместе с опцией "Полные данные".
   <Image img={bp_ck_4} size="lg" border alt="Выбор типа синхронизации" />

4. Выберите таблицы, которые нужно реплицировать.
   <Image img={bp_ck_5} size="lg" border alt="Выбор таблиц" />

5. Выберите колонки, которые нужно реплицировать.
   <Image img={bp_ck_6} size="lg" border alt="Выбор колонок" />

6. Подтвердите создание DataJob, и DataJob будет запущен автоматически.
    <Image img={bp_ck_8} size="lg" border alt="DataJob выполняется" />

## Проверка данных {#5-verify-the-data}
1. Остановите запись данных в экземпляре MySQL и дождитесь, пока ClickHouse объединит данные.
:::note
Из-за непредсказуемого времени автоматического объединения ClickHouse вы можете вручную запустить объединение, выполнив команду `OPTIMIZE TABLE xxx FINAL;`. Обратите внимание, что есть вероятность, что это ручное объединение может не всегда пройти успешно.

В качестве альтернативы вы можете выполнить команду `CREATE VIEW xxx_v AS SELECT * FROM xxx FINAL;`, чтобы создать представление и выполнять запросы на представлении, чтобы убедиться, что данные полностью объединены.
:::

2. Создайте <a href="https://doc.bladepipe.com/operation/job_manage/create_job/create_period_verification_correction_job" target="_blank">Verification DataJob</a>. После завершения Verification DataJob просмотрите результаты, чтобы подтвердить, что данные в ClickHouse совпадают с данными в MySQL.
   <Image img={bp_ck_9} size="lg" border alt="Проверка данных" />
   
</VerticalStepper>