---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['superset']
description: 'Apache Superset — это платформа с открытым исходным кодом для исследования и визуализации данных.'
title: 'Подключение Superset к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import superset_01 from '@site/static/images/integrations/data-visualization/superset_01.png';
import superset_02 from '@site/static/images/integrations/data-visualization/superset_02.png';
import superset_03 from '@site/static/images/integrations/data-visualization/superset_03.png';
import superset_04 from '@site/static/images/integrations/data-visualization/superset_04.png';
import superset_05 from '@site/static/images/integrations/data-visualization/superset_05.png';
import superset_06 from '@site/static/images/integrations/data-visualization/superset_06.png';
import superset_08 from '@site/static/images/integrations/data-visualization/superset_08.png';
import superset_09 from '@site/static/images/integrations/data-visualization/superset_09.png';
import superset_10 from '@site/static/images/integrations/data-visualization/superset_10.png';
import superset_11 from '@site/static/images/integrations/data-visualization/superset_11.png';
import superset_12 from '@site/static/images/integrations/data-visualization/superset_12.png';
import ClickHouseSupportedBadge from '@theme/badges/ClickHouseSupported';


# Подключение Superset к ClickHouse \{#connect-superset-to-clickhouse\}

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> — это платформа с открытым исходным кодом для исследования и визуализации данных, написанная на Python. Superset подключается к ClickHouse с помощью Python-драйвера от ClickHouse. Давайте посмотрим, как это работает...

## Цель \{#goal\}

В этом руководстве вы создадите дашборд в Superset с данными из базы данных ClickHouse. Дашборд будет выглядеть так:

<Image size="md" img={superset_12} alt="Панель Superset, показывающая цены на недвижимость в Великобритании с несколькими визуализациями, включая круговые диаграммы и таблицы" border />

<br/>

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), поэтому вы можете выбрать его. В той же категории документации есть и несколько других примеров.
:::

## 1. Соберите данные для подключения \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Установите драйвер \{#2-install-the-driver\}

1. Superset использует драйвер `clickhouse-connect` для подключения к ClickHouse. Подробную информацию о `clickhouse-connect` см. на странице <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>; установить его можно с помощью следующей команды:

    ```console
    pip install clickhouse-connect
    ```

    :::note Настройка Docker Compose
    Для установок на базе Docker см. [руководство по настройке баз данных Superset](https://superset.apache.org/docs/configuration/databases/#clickhouse) с инструкциями по добавлению `clickhouse-connect` в контейнер.
    :::

2. Запустите (или перезапустите) Superset.

## 3. Подключите Superset к ClickHouse \{#3-connect-superset-to-clickhouse\}

1. В Superset выберите **Data** в верхнем меню, затем **Databases** в выпадающем списке. Добавьте новую базу данных, нажав кнопку **+ Database**:

<Image size="lg" img={superset_01} alt="Интерфейс Superset с меню Database и выделенной кнопкой + Database" border />

<br/>

2. На первом шаге выберите **ClickHouse Connect** в качестве типа базы данных:

<Image size="sm" img={superset_02} alt="Мастер подключения базы данных Superset с выбранным вариантом ClickHouse Connect" border />

<br/>

3. На втором шаге:

- Включите или выключите SSL.
- Введите информацию о подключении, собранную ранее.
- Укажите **DISPLAY NAME**: это может быть любое удобное вам имя. Если вы будете подключаться к нескольким базам данных ClickHouse, сделайте имя более описательным.

<Image size="sm" img={superset_03} alt="Форма конфигурации подключения Superset с параметрами подключения к ClickHouse" border />

<br/>

4. Нажмите кнопки **CONNECT**, а затем **FINISH**, чтобы завершить мастер настройки, после чего вы должны увидеть свою базу данных в списке баз данных.

## 4. Добавление набора данных \{#4-add-a-dataset\}

1. Чтобы работать с данными ClickHouse в Superset, необходимо определить **_dataset_** (набор данных). В верхнем меню Superset выберите **Data**, затем **Datasets** в раскрывающемся списке.

2. Нажмите кнопку добавления набора данных. Выберите вашу новую базу данных как источник данных (datasource), и вы увидите таблицы, определённые в этой базе данных:

<Image size="sm" img={superset_04} alt="Диалог создания набора данных в Superset, показывающий доступные таблицы из базы данных ClickHouse" border />

<br/>

3. Нажмите кнопку **ADD** в нижней части диалогового окна, и ваша таблица появится в списке наборов данных. Теперь вы готовы создавать дашборд и анализировать данные ClickHouse!

## 5.  Создание графиков и дашборда в Superset \{#5--creating-charts-and-a-dashboard-in-superset\}

Если вы уже знакомы с Superset, то в этом разделе будете чувствовать себя как дома. Если вы новичок в Superset, то... он похож на многие другие современные инструменты визуализации: начать работу несложно, а детали и нюансы осваиваются со временем по мере использования инструмента.

1. Начните с дашборда. В верхнем меню Superset выберите **Dashboards**. Нажмите кнопку в правом верхнем углу, чтобы добавить новый дашборд. В следующем примере дашборд называется **UK property prices**:

<Image size="md" img={superset_05} alt="Пустой дашборд Superset с именем UK property prices, готовый для добавления графиков" border />

<br/>

2. Чтобы создать новый график, выберите **Charts** в верхнем меню и нажмите кнопку для добавления нового графика. Вам будет показано много вариантов. В следующем примере показан график типа **Pie Chart**, использующий датасет **uk_price_paid** из выпадающего списка **CHOOSE A DATASET**:

<Image size="md" img={superset_06} alt="Интерфейс создания графика Superset с выбранным типом визуализации Pie Chart" border />

<br/>

3. Для круговых диаграмм в Superset требуется задать **Dimension** и **Metric**, остальные параметры являются необязательными. Вы можете выбрать свои собственные поля для Dimension и Metric; в этом примере используется поле ClickHouse `district` в качестве Dimension и `AVG(price)` в качестве Metric.

<Image size="md" img={superset_08} alt="Конфигурация Dimension с выбранным полем district для круговой диаграммы" border />

<Image size="md" img={superset_09} alt="Конфигурация Metric с агрегатной функцией AVG(price) для круговой диаграммы" border />

<br/>

5. Если вы предпочитаете кольцевые диаграммы (doughnut) вместо круговых, вы можете задать это и другие параметры во вкладке **CUSTOMIZE**:

<Image size="sm" img={superset_10} alt="Панель Customize с опцией кольцевой диаграммы и другими настройками конфигурации круговой диаграммы" border />

<br/>

6. Нажмите кнопку **SAVE**, чтобы сохранить график, затем выберите **UK property prices** в выпадающем списке **ADD TO DASHBOARD**, после чего **SAVE & GO TO DASHBOARD** сохранит график и добавит его на дашборд:

<Image size="md" img={superset_11} alt="Диалог сохранения графика с выпадающим списком выбора дашборда и кнопкой Save & Go to Dashboard" border />

<br/>

7. На этом всё. Построение дашбордов в Superset на основе данных в ClickHouse открывает целый мир сверхбыстрой аналитики!

<Image size="md" img={superset_12} alt="Готовый дашборд Superset с несколькими визуализациями данных о ценах на недвижимость в Великобритании из ClickHouse" border />

<br/>