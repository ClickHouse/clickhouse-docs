---
slug: '/integrations/marimo'
sidebar_label: marimo
description: 'marimo — это блокнот Python нового поколения для взаимодействия с'
title: 'Использование marimo с ClickHouse'
doc_type: guide
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

[marimo](https://marimo.io/) — это открытая реактивная записная книжка для Python с встроенным SQL. Когда вы выполняете ячейку или взаимодействуете с элементом интерфейса, marimo автоматически запускает затронутые ячейки (или помечает их как устаревшие), поддерживая согласованность кода и выводов и предотвращая ошибки до их возникновения. Каждая записная книжка marimo хранится в виде чистого Python, исполняется как скрипт и может быть развернута как приложение.

<Image img={marimo_connect} size="md" border alt="Подключение к ClickHouse" />

## 1. Установка marimo с поддержкой SQL {#install-marimo-sql}

```shell
pip install "marimo[sql]" clickhouse_connect
marimo edit clickhouse_demo.py
```
Это должно открыть веб-браузер, работающий на localhost.

## 2. Подключение к ClickHouse. {#connect-to-clickhouse}

Перейдите на панель источников данных в левой части редактора marimo и нажмите на 'Добавить базу данных'.

<Image img={add_db_panel} size="sm" border alt="Добавить новую базу данных" />

Вам будет предложено заполнить данные базы данных.

<Image img={add_db_details} size="md" border alt="Заполните данные базы данных" />

Затем у вас будет ячейка, которую можно запустить для установления соединения.

<Image img={run_cell} size="md" border alt="Запустите ячейку для подключения к ClickHouse" />

## 3. Выполнение SQL {#run-sql}

После того как вы настроите соединение, вы можете создать новую SQL ячейку и выбрать движок clickhouse.

<Image img={choose_sql_engine} size="md" border alt="Выберите SQL движок" />

Для этого руководства мы используем набор данных такси Нью-Йорка.

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

<Image img={results} size="lg" border alt="Результаты в датафрейме" />

Теперь вы можете просмотреть результаты в датафрейме. Я хочу визуализировать самые дорогие высадки с заданного места посадки. marimo предлагает несколько компонентов пользовательского интерфейса, которые помогут вам. Я буду использовать выпадающий список для выбора места и altair для построения графиков.

<Image img={dropdown_cell_chart} size="lg" border alt="Комбинация выпадающего списка, таблицы и графика" />

Реактивная модель выполнения marimo также распространяется на SQL-запросы, поэтому изменения в вашем SQL автоматически запускают вычисления для зависимых ячеек (или, при необходимости, помечают ячейки как устаревшие для затратных вычислений). Поэтому график и таблица изменяются, когда запрос обновляется.

Вы также можете переключить вид приложения, чтобы получить чистый интерфейс для изучения ваших данных.

<Image img={run_app_view} size="md" border alt="Запустите вид приложения" />