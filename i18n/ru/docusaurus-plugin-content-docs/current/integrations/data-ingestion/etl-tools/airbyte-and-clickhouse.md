---
sidebar_label: 'Airbyte'
sidebar_position: 11
keywords: ['clickhouse', 'Airbyte', 'подключение', 'интеграция', 'etl', 'интеграция данных']
slug: /integrations/airbyte
description: 'Организуйте потоковую передачу данных в ClickHouse с помощью конвейеров данных Airbyte'
title: 'Подключение Airbyte к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_ingestion'
  - website: 'https://airbyte.com/'
---

import Image from '@theme/IdealImage';
import airbyte01 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_01.png';
import airbyte02 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_02.png';
import airbyte03 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_03.png';
import airbyte04 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_04.png';
import airbyte05 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_05.png';
import airbyte06 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_06.png';
import airbyte07 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_07.png';
import airbyte08 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_08.png';
import airbyte09 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_09.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Подключение Airbyte к ClickHouse {#connect-airbyte-to-clickhouse}

<PartnerBadge />

:::note
Обратите внимание, что источник и назначение Airbyte для ClickHouse в настоящее время находятся в статусе Alpha и не подходят для перемещения больших наборов данных (> 10 млн строк)
:::

<a href='https://www.airbyte.com/' target='_blank'>
  Airbyte
</a>
— это платформа интеграции данных с открытым исходным кодом. Она позволяет создавать
<a
  href='https://airbyte.com/blog/why-the-future-of-etl-is-not-elt-but-el'
  target='_blank'
>
  ELT
</a>
-конвейеры данных и поставляется с более чем 140 готовыми коннекторами. Это
пошаговое руководство показывает, как подключить Airbyte к ClickHouse в качестве
целевой системы и загрузить тестовый набор данных.

<VerticalStepper headerLevel="h2">


## Загрузка и запуск Airbyte {#1-download-and-run-airbyte}

1. Airbyte работает в Docker и использует `docker-compose`. Убедитесь, что у вас установлены последние версии Docker.

2. Разверните Airbyte, клонировав официальный репозиторий Github и выполнив `docker-compose up` в предпочитаемом терминале:

        ```bash
        git clone https://github.com/airbytehq/airbyte.git --depth=1
        cd airbyte
        ./run-ab-platform.sh
        ```

4. Когда в терминале появится баннер Airbyte, вы можете подключиться по адресу <a href="http://localhost:8000" target="_blank">localhost:8000</a>

    <Image img={airbyte01} size="lg" border alt="Баннер Airbyte" />

        :::note
        В качестве альтернативы вы можете зарегистрироваться и использовать <a href="https://docs.airbyte.com/deploying-airbyte/on-cloud" target="_blank">Airbyte Cloud</a>
        :::



## Добавьте ClickHouse в качестве приемника данных {#2-add-clickhouse-as-a-destination}

В этом разделе мы покажем, как добавить экземпляр ClickHouse в качестве приемника данных.

1. Запустите сервер ClickHouse (Airbyte совместим с ClickHouse версии `21.8.10.19` и выше) или войдите в свою учетную запись ClickHouse Cloud:

   ```bash
   clickhouse-server start
   ```

2. В Airbyte откройте страницу «Destinations» и добавьте новый приемник данных:

   <Image img={airbyte02} size="lg" border alt="Добавление приемника данных в Airbyte" />

3. Выберите ClickHouse в раскрывающемся списке «Destination type» и заполните форму «Set up the destination», указав имя хоста и порты ClickHouse, имя базы данных, имя пользователя и пароль, а также отметьте, используется ли SSL-подключение (аналог флага `--secure` в `clickhouse-client`):

   <Image img={airbyte03} size="lg" border alt="Создание приемника данных ClickHouse в Airbyte" />

4. Поздравляем! Теперь вы добавили ClickHouse в качестве приемника данных в Airbyte.

:::note
Чтобы использовать ClickHouse как приемник данных, пользователь, от имени которого вы будете выполнять запись, должен иметь права на создание баз данных, таблиц и вставку строк. Мы рекомендуем создать отдельного пользователя для Airbyte (например, `my_airbyte_user`) со следующими правами:

```sql
CREATE USER 'my_airbyte_user'@'%' IDENTIFIED BY 'ваш_пароль';

GRANT CREATE ON * TO my_airbyte_user;
```

:::


## Добавьте датасет в качестве источника {#3-add-a-dataset-as-a-source}

В качестве примерного датасета мы будем использовать <a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">New York City Taxi Data</a> (на <a href="https://github.com/toddwschneider/nyc-taxi-data" target="_blank">GitHub</a>). В этом руководстве мы используем подмножество этого датасета за январь 2022 года.

1. В Airbyte перейдите на страницу «Sources» и добавьте новый источник типа file.

    <Image img={airbyte04} size="lg" border alt="Добавление источника в Airbyte" />

2. Заполните форму «Set up the source», указав имя источника и URL файла NYC Taxi за январь 2022 года (см. ниже). Обязательно выберите `parquet` в качестве формата файла, `HTTPS Public Web` в качестве Storage Provider и `nyc_taxi_2022` в качестве Dataset Name.

        ```text
        https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet
        ```

    <Image img={airbyte05} size="lg" border alt="Создание источника ClickHouse в Airbyte" />

3. Поздравляем! Теперь вы добавили файл-источник в Airbyte.



## Создайте подключение и загрузите набор данных в ClickHouse {#4-create-a-connection-and-load-the-dataset-into-clickhouse}

1. В Airbyte перейдите на страницу "Connections" и добавьте новое подключение.

<Image img={airbyte06} size="lg" border alt="Добавление подключения в Airbyte" />

2. Выберите "Use existing source" и укажите New York City Taxi Data, затем выберите "Use existing destination" и укажите ваш экземпляр ClickHouse.

3. Заполните форму "Set up the connection", выбрав Replication Frequency (в этом руководстве мы используем `manual`) и указав `nyc_taxi_2022` как поток для синхронизации. Убедитесь, что выбрали `Normalized Tabular Data` в качестве Normalization.

<Image img={airbyte07} size="lg" border alt="Создание подключения в Airbyte" />

4. После создания подключения нажмите "Sync now", чтобы запустить загрузку данных (так как мы выбрали `Manual` в качестве Replication Frequency).

<Image img={airbyte08} size="lg" border alt="Кнопка Sync now в Airbyte" />

5. Начнётся загрузка данных; вы можете развернуть панель, чтобы увидеть журналы Airbyte и ход выполнения. После завершения операции вы увидите сообщение `Completed successfully` в журналах:

<Image img={airbyte09} size="lg" border alt="Статус Completed successfully" />

6. Подключитесь к своему экземпляру ClickHouse, используя предпочитаемый SQL-клиент, и проверьте получившуюся таблицу:

        ```sql
        SELECT *
        FROM nyc_taxi_2022
        LIMIT 10
        ```

        Ответ должен выглядеть следующим образом:
        ```response
        Query id: 4f79c106-fe49-4145-8eba-15e1cb36d325



        ┌─extra─┬─mta&#95;tax─┬─VendorID─┬─RatecodeID─┬─tip&#95;amount─┬─airport&#95;fee─┬─fare&#95;amount─┬─DOLocationID─┬─PULocationID─┬─payment&#95;type─┬─tolls&#95;amount─┬─total&#95;amount─┬─trip&#95;distance─┬─passenger&#95;count─┬─store&#95;and&#95;fwd&#95;flag─┬─congestion&#95;surcharge─┬─tpep&#95;pickup&#95;datetime─┬─improvement&#95;surcharge─┬─tpep&#95;dropoff&#95;datetime─┬─&#95;airbyte&#95;ab&#95;id───────────────────────┬─────&#95;airbyte&#95;emitted&#95;at─┬─&#95;airbyte&#95;normalized&#95;at─┬─&#95;airbyte&#95;nyc&#95;taxi&#95;2022&#95;hashid────┐
│ 0 │ 0.5 │ 2 │ 1 │ 2.03 │ 0 │ 17 │ 41 │ 162 │ 1 │ 0 │ 22.33 │ 4.25 │ 3 │ N │ 2.5 │ 2022-01-24T16:02:27 │ 0.3 │ 2022-01-24T16:22:23 │ 000022a5-3f14-4217-9938-5657f9041c8a │ 2022-07-19 04:35:31.000 │ 2022-07-19 04:39:20 │ 91F83E2A3AF3CA79E27BD5019FA7EC94 │
│ 3 │ 0.5 │ 1 │ 1 │ 1.75 │ 0 │ 5 │ 186 │ 246 │ 1 │ 0 │ 10.55 │ 0.9 │ 1 │ N │ 2.5 │ 2022-01-22T23:23:05 │ 0.3 │ 2022-01-22T23:27:03 │ 000036b6-1c6a-493b-b585-4713e433b9cd │ 2022-07-19 04:34:53.000 │ 2022-07-19 04:39:20 │ 5522F328014A7234E23F9FC5FA78FA66 │
│ 0 │ 0.5 │ 2 │ 1 │ 7.62 │ 1.25 │ 27 │ 238 │ 70 │ 1 │ 6.55 │ 45.72 │ 9.16 │ 1 │ N │ 2.5 │ 2022-01-22T19:20:37 │ 0.3 │ 2022-01-22T19:40:51 │ 00003c6d-78ad-4288-a79d-00a62d3ca3c5 │ 2022-07-19 04:34:46.000 │ 2022-07-19 04:39:20 │ 449743975782E613109CEE448AFA0AB3 │
│ 0.5 │ 0.5 │ 2 │ 1 │ 0 │ 0 │ 9.5 │ 234 │ 249 │ 1 │ 0 │ 13.3 │ 1.5 │ 1 │ N │ 2.5 │ 2022-01-22T20:13:39 │ 0.3 │ 2022-01-22T20:26:40 │ 000042f6-6f61-498b-85b9-989eaf8b264b │ 2022-07-19 04:34:47.000 │ 2022-07-19 04:39:20 │ 01771AF57922D1279096E5FFE1BD104A │
│ 0 │ 0 │ 2 │ 5 │ 5 │ 0 │ 60 │ 265 │ 90 │ 1 │ 0 │ 65.3 │ 5.59 │ 1 │ N │ 0 │ 2022-01-25T09:28:36 │ 0.3 │ 2022-01-25T09:47:16 │ 00004c25-53a4-4cd4-b012-a34dbc128aeb │ 2022-07-19 04:35:46.000 │ 2022-07-19 04:39:20 │ CDA4831B683D10A7770EB492CC772029 │
│ 0 │ 0.5 │ 2 │ 1 │ 0 │ 0 │ 11.5 │ 68 │ 170 │ 2 │ 0 │ 14.8 │ 2.2 │ 1 │ N │ 2.5 │ 2022-01-25T13:19:26 │ 0.3 │ 2022-01-25T13:36:19 │ 00005c75-c3c8-440c-a8e8-b1bd2b7b7425 │ 2022-07-19 04:35:52.000 │ 2022-07-19 04:39:20 │ 24D75D8AADD488840D78EA658EBDFB41 │
│ 2.5 │ 0.5 │ 1 │ 1 │ 0.88 │ 0 │ 5.5 │ 79 │ 137 │ 1 │ 0 │ 9.68 │ 1.1 │ 1 │ N │ 2.5 │ 2022-01-22T15:45:09 │ 0.3 │ 2022-01-22T15:50:16 │ 0000acc3-e64f-4b58-8e15-dc47ff1685f3 │ 2022-07-19 04:34:37.000 │ 2022-07-19 04:39:20 │ 2BB5B8E849A438E08F7FCF789E7D7E65 │
│ 1.75 │ 0.5 │ 1 │ 1 │ 7.5 │ 1.25 │ 27.5 │ 17 │ 138 │ 1 │ 0 │ 37.55 │ 9 │ 1 │ N │ 0 │ 2022-01-30T21:58:19 │ 0.3 │ 2022-01-30T22:19:30 │ 0000b339-b44b-40b0-99f8-ebbf2092cc5b │ 2022-07-19 04:38:10.000 │ 2022-07-19 04:39:20 │ DCCE79199EF9217CD769EFD5271302FE │
│ 0.5 │ 0.5 │ 2 │ 1 │ 0 │ 0 │ 13 │ 79 │ 140 │ 2 │ 0 │ 16.8 │ 3.19 │ 1 │ N │ 2.5 │ 2022-01-26T20:43:14 │ 0.3 │ 2022-01-26T20:58:08 │ 0000caa8-d46a-4682-bd25-38b2b0b9300b │ 2022-07-19 04:36:36.000 │ 2022-07-19 04:39:20 │ F502BE51809AF36582561B2D037B4DDC │
│ 0 │ 0.5 │ 2 │ 1 │ 1.76 │ 0 │ 5.5 │ 141 │ 237 │ 1 │ 0 │ 10.56 │ 0.72 │ 2 │ N │ 2.5 │ 2022-01-27T15:19:54 │ 0.3 │ 2022-01-27T15:26:23 │ 0000cd63-c71f-4eb9-9c27-09f402fddc76 │ 2022-07-19 04:36:55.000 │ 2022-07-19 04:39:20 │ 8612CDB63E13D70C1D8B34351A7CA00D │
└───────┴─────────┴──────────┴────────────┴────────────┴─────────────┴─────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────┴─────────────────┴────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┴───────────────────────┴──────────────────────────────────────┴─────────────────────────┴────────────────────────┴──────────────────────────────────┘

```
```

        ```sql
        SELECT count(*)
        FROM nyc_taxi_2022
        ```

        Ответ:
        ```response
        Query id: a9172d39-50f7-421e-8330-296de0baa67e

        ┌─count()─┐
        │ 2392428 │
        └─────────┘
        ```

7.  Обратите внимание, что Airbyte автоматически определил типы данных и добавил 4 столбца в целевую таблицу. Эти столбцы используются Airbyte для управления логикой репликации и журналирования операций. Подробная информация доступна в <a href="https://docs.airbyte.com/integrations/destinations/clickhouse#output-schema" target="_blank">официальной документации Airbyte</a>.

        ```sql
            `_airbyte_ab_id` String,
            `_airbyte_emitted_at` DateTime64(3, 'GMT'),
            `_airbyte_normalized_at` DateTime,
            `_airbyte_nyc_taxi_072021_hashid` String
        ```

        Теперь, когда набор данных загружен в ваш экземпляр ClickHouse, вы можете создать новую таблицу и использовать более подходящие типы данных ClickHouse (<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">подробнее</a>).

8.  Поздравляем! Вы успешно загрузили данные о такси Нью-Йорка в ClickHouse с помощью Airbyte!

</VerticalStepper>
