---
slug: /integrations/marimo
sidebar_label: 'marimo'
description: 'marimo — это Python-ноутбук нового поколения для работы с данными'
title: 'Использование marimo с ClickHouse'
doc_type: 'guide'
keywords: ['marimo', 'notebook', 'анализ данных', 'python', 'визуализация']
---

import Image from '@theme/IdealImage';
import marimo_connect from '@site/static/images/integrations/sql-clients/marimo/clickhouse-connect.gif';
import add_db_panel from '@site/static/images/integrations/sql-clients/marimo/panel-arrow.png';
import add_db_details from '@site/static/images/integrations/sql-clients/marimo/add-db-details.png';
import run_cell from '@site/static/images/integrations/sql-clients/marimo/run-cell.png';
import choose_sql_engine from '@site/static/images/integrations/sql-clients/marimo/choose-sql-engine.png';
import results from '@site/static/images/integrations/sql-clients/marimo/results.png';
import dropdown_cell_chart from '@site/static/images/integrations/sql-clients/marimo/dropdown-cell-chart.png';
import run_app_view from '@site/static/images/integrations/sql-clients/marimo/run-app-view.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Использование marimo с ClickHouse

<CommunityMaintainedBadge/>

[marimo](https://marimo.io/) — это реактивный блокнот с открытым исходным кодом для Python со встроенной поддержкой SQL. Когда вы запускаете ячейку или взаимодействуете с элементом интерфейса, marimo автоматически запускает затронутые ячейки (или помечает их как неактуальные), поддерживая согласованность кода и результатов и предотвращая появление ошибок. Каждый блокнот marimo хранится в виде чистого Python-кода, может выполняться как скрипт и развёртываться как приложение.

<Image img={marimo_connect} size="md" border alt="Подключение к ClickHouse" />



## 1. Установка marimo с поддержкой SQL {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```

После выполнения команды откроется веб-браузер на localhost.


## 2. Подключение к ClickHouse. {#connect-to-clickhouse}

Перейдите на панель источников данных в левой части редактора marimo и нажмите «Add database».

<Image img={add_db_panel} size='sm' border alt='Добавить новую базу данных' />

Вам будет предложено заполнить данные базы данных.

<Image
  img={add_db_details}
  size='md'
  border
  alt='Заполнить данные базы данных'
/>

После этого появится ячейка, которую можно запустить для установления соединения.

<Image
  img={run_cell}
  size='md'
  border
  alt='Запустить ячейку для подключения к ClickHouse'
/>


## 3. Выполнение SQL {#run-sql}

После настройки подключения вы можете создать новую SQL-ячейку и выбрать движок clickhouse.

<Image img={choose_sql_engine} size='md' border alt='Выбор SQL-движка' />

В этом руководстве мы будем использовать набор данных New York Taxi.

```sql
CREATE TABLE trips (
    trip_id             UInt32,
    pickup_datetime     DateTime,
    dropoff_datetime    DateTime,
    pickup_longitude    Nullable(Float64),
    pickup_latitude     Nullable(Float64),
    dropoff_longitude   Nullable(Float64),
    dropoff_latitude    Nullable(Float64),
    passenger_count     UInt8,
    trip_distance       Float32,
    fare_amount         Float32,
    extra               Float32,
    tip_amount          Float32,
    tolls_amount        Float32,
    total_amount        Float32,
    payment_type        Enum('CSH' = 1, 'CRE' = 2, 'NOC' = 3, 'DIS' = 4, 'UNK' = 5),
    pickup_ntaname      LowCardinality(String),
    dropoff_ntaname     LowCardinality(String)
)
ENGINE = MergeTree
PRIMARY KEY (pickup_datetime, dropoff_datetime);
```

```sql
INSERT INTO trips
SELECT
    trip_id,
    pickup_datetime,
    dropoff_datetime,
    pickup_longitude,
    pickup_latitude,
    dropoff_longitude,
    dropoff_latitude,
    passenger_count,
    trip_distance,
    fare_amount,
    extra,
    tip_amount,
    tolls_amount,
    total_amount,
    payment_type,
    pickup_ntaname,
    dropoff_ntaname
FROM gcs(
    'https://storage.googleapis.com/clickhouse-public-datasets/nyc-taxi/trips_0.gz',
    'TabSeparatedWithNames'
);
```

```sql
SELECT * FROM trips LIMIT 1000;
```

<Image img={results} size='lg' border alt='Результаты в виде датафрейма' />

Теперь вы можете просматривать результаты в виде датафрейма. Давайте визуализируем самые дорогие высадки из заданной точки посадки. marimo предоставляет несколько компонентов пользовательского интерфейса для этого. Мы используем выпадающий список для выбора местоположения и altair для построения графиков.

<Image
  img={dropdown_cell_chart}
  size='lg'
  border
  alt='Комбинация выпадающего списка, таблицы и графика'
/>

Реактивная модель выполнения marimo распространяется на SQL-запросы, поэтому изменения в SQL автоматически запускают последующие вычисления для зависимых ячеек (или опционально помечают ячейки как устаревшие для ресурсоёмких вычислений). Таким образом, график и таблица изменяются при обновлении запроса.

Вы также можете переключиться в режим просмотра приложения для получения удобного интерфейса исследования данных.

<Image img={run_app_view} size='md' border alt='Запуск режима просмотра приложения' />
