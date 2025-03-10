---
sidebar_label: 'Airbyte'
sidebar_position: 11
keywords: ['clickhouse', 'Airbyte', 'connect', 'integrate', 'etl', 'data integration']
slug: /integrations/airbyte
description: 'Потоковая передача данных в ClickHouse с использованием конвейеров данных Airbyte'
---

import airbyte01 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_01.png';
import airbyte02 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_02.png';
import airbyte03 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_03.png';
import airbyte04 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_04.png';
import airbyte05 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_05.png';
import airbyte06 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_06.png';
import airbyte07 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_07.png';
import airbyte08 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_08.png';
import airbyte09 from '@site/static/images/integrations/data-ingestion/etl-tools/airbyte_09.png';


# Соединение Airbyte с ClickHouse

:::note
Обратите внимание, что источник и назначение Airbyte для ClickHouse в настоящее время находятся в статусе Alpha и не подходят для перемещения больших наборов данных (> 10 миллионов строк).
:::

<a href="https://www.airbyte.com/" target="_blank">Airbyte</a> — это платформа интеграции данных с открытым исходным кодом. Она позволяет создавать <a href="https://airbyte.com/blog/why-the-future-of-etl-is-not-elt-but-el" target="_blank">ELT</a> конвейеры данных и поставляется с более чем 140 интеграциями из коробки. Этот пошаговый учебник покажет, как подключить Airbyte к ClickHouse в качестве назначения и загрузить пример набора данных.

## 1. Скачайте и запустите Airbyte {#1-download-and-run-airbyte}

1. Airbyte работает на Docker и использует `docker-compose`. Убедитесь, что вы скачали и установили последние версии Docker.

2. Разверните Airbyte, склонировав официальный репозиторий Github и запустив `docker-compose up` в вашем любимом терминале:

	```bash
	git clone https://github.com/airbytehq/airbyte.git --depth=1
	cd airbyte
	./run-ab-platform.sh
	```

4. Как только вы увидите баннер Airbyte в терминале, вы можете подключиться к <a href="http://localhost:8000" target="_blank">localhost:8000</a>

    <img src={airbyte01} class="image" alt="Баннер Airbyte" style={{width: '100%'}}/>

	:::note
	В качестве альтернативы вы можете зарегистрироваться и использовать <a href="https://docs.airbyte.com/deploying-airbyte/on-cloud" target="_blank">Airbyte Cloud</a>
	:::

## 2. Добавьте ClickHouse в качестве назначения {#2-add-clickhouse-as-a-destination}

В этом разделе мы покажем, как добавить экземпляр ClickHouse в качестве назначения.

1. Запустите ваш сервер ClickHouse (Airbyte совместим с версией ClickHouse `21.8.10.19` или выше) или войдите в свой облачный аккаунт ClickHouse:

    ```bash
    clickhouse-server start
    ```

2. В Airbyte выберите страницу "Назначения" и добавьте новое назначение:

    <img src={airbyte02} class="image" alt="Добавление назначения в Airbyte" style={{width: '100%'}}/>

3. Выберите ClickHouse из выпадающего списка "Тип назначения" и заполните форму "Настройка назначения", указав имя хоста и порты ClickHouse, имя базы данных, имя пользователя и пароль, а также выберите, является ли это SSL-соединением (эквивалентно флагу `--secure` в `clickhouse-client`):

    <img src={airbyte03} class="image" alt="Создание назначения ClickHouse в Airbyte"/>

4. Поздравляем! Теперь вы добавили ClickHouse в качестве назначения в Airbyte.

:::note
Чтобы использовать ClickHouse в качестве назначения, пользователь, который вы будете использовать, должен иметь права на создание баз данных, таблиц и вставку строк. Рекомендуем создать специального пользователя для Airbyte (например, `my_airbyte_user`) с следующими правами:

```sql
CREATE USER 'my_airbyte_user'@'%' IDENTIFIED BY 'your_password_here';

GRANT CREATE ON * TO my_airbyte_user;
```
:::

## 3. Добавьте набор данных в качестве источника {#3-add-a-dataset-as-a-source}

Примером набора данных, который мы будем использовать, являются данные такси Нью-Йорка <a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">(New York City Taxi Data)</a> (на <a href="https://github.com/toddwschneider/nyc-taxi-data" target="_blank">Github</a>). В этом руководстве мы будем использовать подмножество этого набора данных, соответствующее месяцу января 2022 года.

1. В Airbyte выберите страницу "Источники" и добавьте новый источник типа файл.

    <img src={airbyte04} class="image" alt="Добавление источника в Airbyte" style={{width: '100%'}}/>

2. Заполните форму "Настройка источника", указав имя источника и предоставив URL файла NYC Taxi за январь 2022 года (см. ниже). Убедитесь, что вы выбрали `parquet` в качестве формата файла, `HTTPS Public Web` в качестве поставщика хранения и `nyc_taxi_2022` в качестве имени набора данных.

	```text
	https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2022-01.parquet
	```

    <img src={airbyte05} class="image" alt="Создание источника ClickHouse в Airbyte"/>

3. Поздравляем! Вы только что добавили файл-источник в Airbyte.

## 4. Создайте соединение и загрузите набор данных в ClickHouse {#4-create-a-connection-and-load-the-dataset-into-clickhouse}

1. В Airbyte выберите страницу "Соединения" и добавьте новое соединение.

	<img src={airbyte06} class="image" alt="Добавление соединения в Airbyte" style={{width: '100%'}}/>

2. Выберите "Использовать существующий источник" и выберите данные такси Нью-Йорка, затем выберите "Использовать существующее назначение" и выберите ваш экземпляр ClickHouse.

3. Заполните форму "Настройка соединения", выбрав частоту репликации (для этого учебника мы используем `manual`) и выберите `nyc_taxi_2022` в качестве потока, который вы хотите синхронизировать. Убедитесь, что вы выбрали `Normalized Tabular Data` в качестве нормализации.

	<img src={airbyte07} class="image" alt="Создание соединения в Airbyte"/>

4. Теперь, когда соединение создано, нажмите "Синхронизировать сейчас", чтобы запустить загрузку данных (поскольку мы выбрали `Manual` в качестве частоты репликации).

	<img src={airbyte08} class="image" alt="Синхронизировать сейчас в Airbyte" style={{width: '100%'}}/>

5. Ваши данные начнут загружаться, вы можете развернуть вид, чтобы увидеть логи и прогресс Airbyte. Как только операция завершится, вы увидите сообщение `Завершено успешно` в логах:

	<img src={airbyte09} class="image" alt="Завершено успешно" style={{width: '100%'}}/>

6. Подключитесь к своему экземпляру ClickHouse, используя предпочитаемый клиент SQL, и проверьте полученную таблицу:

	```sql
	SELECT *
	FROM nyc_taxi_2022
	LIMIT 10
	```

	Ответ должен выглядеть следующим образом:
	```response
	Query id: 4f79c106-fe49-4145-8eba-15e1cb36d325

	┌─extra─┬─mta_tax─┬─VendorID─┬─RatecodeID─┬─tip_amount─┬─airport_fee─┬─fare_amount─┬─DOLocationID─┬─PULocationID─┬─payment_type─┬─tolls_amount─┬─total_amount─┬─trip_distance─┬─passenger_count─┬─store_and_fwd_flag─┬─congestion_surcharge─┬─tpep_pickup_datetime─┬─improvement_surcharge─┬─tpep_dropoff_datetime─┬─_airbyte_ab_id───────────────────────┬─────_airbyte_emitted_at─┬─_airbyte_normalized_at─┬─_airbyte_nyc_taxi_2022_hashid────┐
	│     0 │     0.5 │        2 │          1 │       2.03 │           0 │          17 │           41 │          162 │            1 │            0 │        22.33 │          4.25 │               3 │ N                  │                  2.5 │ 2022-01-24T16:02:27  │                   0.3 │ 2022-01-24T16:22:23   │ 000022a5-3f14-4217-9938-5657f9041c8a │ 2022-07-19 04:35:31.000 │    2022-07-19 04:39:20 │ 91F83E2A3AF3CA79E27BD5019FA7EC94 │
	│     3 │     0.5 │        1 │          1 │       1.75 │           0 │           5 │          186 │          246 │            1 │            0 │        10.55 │           0.9 │               1 │ N                  │                  2.5 │ 2022-01-22T23:23:05  │                   0.3 │ 2022-01-22T23:27:03   │ 000036b6-1c6a-493b-b585-4713e433b9cd │ 2022-07-19 04:34:53.000 │    2022-07-19 04:39:20 │ 5522F328014A7234E23F9FC5FA78FA66 │
	│     0 │     0.5 │        2 │          1 │       7.62 │        1.25 │          27 │          238 │           70 │            1 │         6.55 │        45.72 │          9.16 │               1 │ N                  │                  2.5 │ 2022-01-22T19:20:37  │                   0.3 │ 2022-01-22T19:40:51   │ 00003c6d-78ad-4288-a79d-00a62d3ca3c5 │ 2022-07-19 04:34:46.000 │    2022-07-19 04:39:20 │ 449743975782E613109CEE448AFA0AB3 │
	│   0.5 │     0.5 │        2 │          1 │          0 │           0 │         9.5 │          234 │          249 │            1 │            0 │         13.3 │           1.5 │               1 │ N                  │                  2.5 │ 2022-01-22T20:13:39  │                   0.3 │ 2022-01-22T20:26:40   │ 000042f6-6f61-498b-85b9-989eaf8b264b │ 2022-07-19 04:34:47.000 │    2022-07-19 04:39:20 │ 01771AF57922D1279096E5FFE1BD104A │
	│     0 │       0 │        2 │          5 │          5 │           0 │          60 │          265 │           90 │            1 │            0 │         65.3 │          5.59 │               1 │ N                  │                    0 │ 2022-01-25T09:28:36  │                   0.3 │ 2022-01-25T09:47:16   │ 00004c25-53a4-4cd4-b012-a34dbc128aeb │ 2022-07-19 04:35:46.000 │    2022-07-19 04:39:20 │ CDA4831B683D10A7770EB492CC772029 │
	│     0 │     0.5 │        2 │          1 │          0 │           0 │        11.5 │           68 │          170 │            2 │            0 │         14.8 │           2.2 │               1 │ N                  │                  2.5 │ 2022-01-25T13:19:26  │                   0.3 │ 2022-01-25T13:36:19   │ 00005c75-c3c8-440c-a8e8-b1bd2b7b7425 │ 2022-07-19 04:35:52.000 │    2022-07-19 04:39:20 │ 24D75D8AADD488840D78EA658EBDFB41 │
	│   2.5 │     0.5 │        1 │          1 │       0.88 │           0 │         5.5 │           79 │          137 │            1 │            0 │         9.68 │           1.1 │               1 │ N                  │                  2.5 │ 2022-01-22T15:45:09  │                   0.3 │ 2022-01-22T15:50:16   │ 0000acc3-e64f-4b58-8e15-dc47ff1685f3 │ 2022-07-19 04:34:37.000 │    2022-07-19 04:39:20 │ 2BB5B8E849A438E08F7FCF789E7D7E65 │
	│  1.75 │     0.5 │        1 │          1 │        7.5 │        1.25 │        27.5 │           17 │          138 │            1 │            0 │        37.55 │             9 │               1 │ N                  │                    0 │ 2022-01-30T21:58:19  │                   0.3 │ 2022-01-30T22:19:30   │ 0000b339-b44b-40b0-99f8-ebbf2092cc5b │ 2022-07-19 04:38:10.000 │    2022-07-19 04:39:20 │ DCCE79199EF9217CD769EFD5271302FE │
	│   0.5 │     0.5 │        2 │          1 │          0 │           0 │          13 │           79 │          140 │            2 │            0 │         16.8 │          3.19 │               1 │ N                  │                  2.5 │ 2022-01-26T20:43:14  │                   0.3 │ 2022-01-26T20:58:08   │ 0000caa8-d46a-4682-bd25-38b2b0b9300b │ 2022-07-19 04:36:36.000 │    2022-07-19 04:39:20 │ F502BE51809AF36582561B2D037B4DDC │
	│     0 │     0.5 │        2 │          1 │       1.76 │           0 │         5.5 │          141 │          237 │            1 │            0 │        10.56 │          0.72 │               2 │ N                  │                  2.5 │ 2022-01-27T15:19:54  │                   0.3 │ 2022-01-27T15:26:23   │ 0000cd63-c71f-4eb9-9c27-09f402fddc76 │ 2022-07-19 04:36:55.000 │    2022-07-19 04:39:20 │ 8612CDB63E13D70C1D8B34351A7CA00D │
	└───────┴─────────┴──────────┴────────────┴────────────┴─────────────┴─────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴───────────────┴─────────────────┴────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┴───────────────────────┴──────────────────────────────────────┴─────────────────────────┴────────────────────────┴──────────────────────────────────┘
	```

	```sql
	SELECT count(*)
	FROM nyc_taxi_2022
	```

	Ответ будет:
	```response
	Query id: a9172d39-50f7-421e-8330-296de0baa67e

	┌─count()─┐
	│ 2392428 │
	└─────────┘
	```

7. Обратите внимание, что Airbyte автоматически определил типы данных и добавил 4 колонки в таблицу назначения. Эти колонки используются Airbyte для управления логикой репликации и ведения логов операций. Более подробная информация доступна в <a href="https://docs.airbyte.com/integrations/destinations/clickhouse#output-schema" target="_blank">официальной документации Airbyte</a>.

	```sql
	    `_airbyte_ab_id` String,
	    `_airbyte_emitted_at` DateTime64(3, 'GMT'),
	    `_airbyte_normalized_at` DateTime,
	    `_airbyte_nyc_taxi_072021_hashid` String
	```

	Теперь, когда набор данных загружен в ваш экземпляр ClickHouse, вы можете создать новую таблицу и использовать более подходящие типы данных ClickHouse (<a href="https://clickhouse.com/docs/getting-started/example-datasets/nyc-taxi/" target="_blank">более подробная информация</a>).

8. Поздравляем - вы успешно загрузили данные такси Нью-Йорка в ClickHouse с использованием Airbyte!
