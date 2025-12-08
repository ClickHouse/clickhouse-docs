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

# Подключение Superset к ClickHouse {#connect-superset-to-clickhouse}

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> — это платформа с открытым исходным кодом для исследования и визуализации данных, написанная на Python. Superset подключается к ClickHouse с помощью драйвера Python, предоставленного ClickHouse. Давайте посмотрим, как это работает...

## Цель {#goal}

В этом руководстве вы создадите дашборд в Superset на основе данных из базы данных ClickHouse. Дашборд будет выглядеть следующим образом:

<Image size="md" img={superset_12} alt="Дашборд Superset с ценами на недвижимость в Великобритании с несколькими визуализациями, включая круговые диаграммы и таблицы" border />
<br/>

:::tip Добавьте немного данных
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), поэтому вы можете выбрать именно его. В той же категории документации есть и несколько других наборов данных.
:::

## 1. Соберите параметры подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Установка драйвера {#2-install-the-driver}

1. Superset использует драйвер `clickhouse-connect` для подключения к ClickHouse. Подробную информацию о `clickhouse-connect` можно найти по адресу <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>, а установить его можно с помощью следующей команды:

    ```console
    pip install clickhouse-connect
    ```

2. Запустите (или перезапустите) Superset.

## 3. Подключение Superset к ClickHouse {#3-connect-superset-to-clickhouse}

1. В Superset выберите **Data** в верхнем меню, затем **Databases** в раскрывающемся меню. Добавьте новую базу данных, нажав кнопку **+ Database**:

<Image size="lg" img={superset_01} alt="Интерфейс Superset, показывающий меню Database с выделенной кнопкой + Database" border />
<br/>

2. На первом шаге выберите **ClickHouse Connect** в качестве типа базы данных:

<Image size="sm" img={superset_02} alt="Мастер подключения базы данных Superset с выбранным вариантом ClickHouse Connect" border />
<br/>

3. На втором шаге:
- Включите или отключите SSL.
- Введите информацию о подключении, которую вы собрали ранее.
- Укажите **DISPLAY NAME**: это может быть любое удобное вам имя. Если вы будете подключаться к нескольким базам данных ClickHouse, сделайте имя более описательным.

<Image size="sm" img={superset_03} alt="Форма конфигурации подключения Superset с параметрами подключения к ClickHouse" border />
<br/>

4. Нажмите кнопки **CONNECT**, а затем **FINISH**, чтобы завершить мастер настройки. После этого вы увидите свою базу данных в списке баз данных.

## 4. Добавьте набор данных {#4-add-a-dataset}

1. Чтобы работать с данными ClickHouse в Superset, необходимо определить **_dataset_** (набор данных). В верхнем меню Superset выберите **Data**, затем **Datasets** в раскрывающемся меню.

2. Нажмите кнопку добавления набора данных. Выберите вашу новую базу данных как источник данных (`datasource`), после чего вы увидите таблицы, определённые в этой базе:

<Image size="sm" img={superset_04} alt="Диалоговое окно создания набора данных в Superset, в котором отображаются доступные таблицы из базы данных ClickHouse" border />
<br/>

3. Нажмите кнопку **ADD** в нижней части диалогового окна, и ваша таблица появится в списке наборов данных. Теперь вы готовы создавать дашборды и анализировать данные в ClickHouse!

## 5.  Создание диаграмм и дашборда в Superset {#5--creating-charts-and-a-dashboard-in-superset}

Если вы уже знакомы с Superset, этот раздел покажется вам вполне привычным. Если вы новичок в Superset, то... он похож на многие другие современные инструменты визуализации данных: чтобы начать, много времени не нужно, а детали и нюансы приходят с опытом по мере работы с инструментом.

1. Начните с дашборда. В верхнем меню Superset выберите **Dashboards**. Нажмите кнопку в правом верхнем углу, чтобы добавить новый дашборд. Следующий дашборд называется **UK property prices**:

<Image size="md" img={superset_05} alt="Пустой дашборд Superset с названием UK property prices, готовый для добавления диаграмм" border />
<br/>

2. Чтобы создать новую диаграмму, выберите **Charts** в верхнем меню и нажмите кнопку для добавления новой диаграммы. Вам будет показано множество вариантов. В следующем примере показана диаграмма типа **Pie Chart**, использующая датасет **uk_price_paid** из выпадающего списка **CHOOSE A DATASET**:

<Image size="md" img={superset_06} alt="Интерфейс создания диаграммы в Superset с выбранным типом визуализации Pie Chart" border />
<br/>

3. Для круговых диаграмм (pie charts) в Superset требуются **Dimension** и **Metric**, остальные настройки являются необязательными. Вы можете выбрать свои поля для измерения (dimension) и метрики (metric); в этом примере используется поле ClickHouse `district` в качестве измерения и `AVG(price)` в качестве метрики.

<Image size="md" img={superset_08} alt="Конфигурация Dimension, показывающая выбор поля district для круговой диаграммы" border />
<Image size="md" img={superset_09} alt="Конфигурация Metric, показывающая агрегирующую функцию AVG(price) для круговой диаграммы" border />
<br/>

5. Если вы предпочитаете кольцевые диаграммы (doughnut charts) вместо круговых, вы можете задать это и другие параметры в разделе **CUSTOMIZE**:

<Image size="sm" img={superset_10} alt="Панель настройки с опцией кольцевой диаграммы и другими параметрами конфигурации круговой диаграммы" border />
<br/>

6. Нажмите кнопку **SAVE**, чтобы сохранить диаграмму, затем выберите **UK property prices** в выпадающем списке **ADD TO DASHBOARD**, после чего **SAVE & GO TO DASHBOARD** сохранит диаграмму и добавит её в дашборд:

<Image size="md" img={superset_11} alt="Диалог сохранения диаграммы с выпадающим списком выбора дашборда и кнопкой Save & Go to Dashboard" border />
<br/>

7. На этом всё. Построение дашбордов в Superset на основе данных в ClickHouse открывает целый мир молниеносной аналитики данных!

<Image size="md" img={superset_12} alt="Готовый дашборд Superset с несколькими визуализациями данных о ценах на недвижимость в Великобритании из ClickHouse" border />
<br/>
