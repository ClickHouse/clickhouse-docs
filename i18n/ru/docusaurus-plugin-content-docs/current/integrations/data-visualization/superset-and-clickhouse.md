---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['superset']
description: 'Apache Superset — платформа с открытым исходным кодом для исследования и визуализации данных.'
title: 'Подключение Superset к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# Подключение Superset к ClickHouse

<ClickHouseSupportedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> — это платформа с открытым исходным кодом для исследования и визуализации данных, написанная на языке Python. Superset подключается к ClickHouse с помощью Python-драйвера, предоставляемого ClickHouse. Давайте посмотрим, как это работает...



## Цель {#goal}

В этом руководстве вы создадите дашборд в Superset с использованием данных из базы данных ClickHouse. Дашборд будет выглядеть следующим образом:

<Image
  size='md'
  img={superset_12}
  alt='Дашборд Superset с ценами на недвижимость в Великобритании, включающий несколько визуализаций: круговые диаграммы и таблицы'
  border
/>
<br />

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), поэтому можете выбрать его. В той же категории документации доступны и другие наборы данных.
:::


## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Установка драйвера {#2-install-the-driver}

1. Superset использует драйвер `clickhouse-connect` для подключения к ClickHouse. Подробная информация о `clickhouse-connect` доступна по адресу <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>. Установка выполняется следующей командой:

   ```console
   pip install clickhouse-connect
   ```

2. Запустите (или перезапустите) Superset.


## 3. Подключение Superset к ClickHouse {#3-connect-superset-to-clickhouse}

1. В Superset выберите **Data** в верхнем меню, затем **Databases** в выпадающем меню. Добавьте новую базу данных, нажав кнопку **+ Database**:

<Image
  size='lg'
  img={superset_01}
  alt='Интерфейс Superset с меню Database и выделенной кнопкой + Database'
  border
/>
<br />

2. На первом шаге выберите **ClickHouse Connect** в качестве типа базы данных:

<Image
  size='sm'
  img={superset_02}
  alt='Мастер подключения к базе данных Superset с выбранной опцией ClickHouse Connect'
  border
/>
<br />

3. На втором шаге:

- Включите или отключите SSL.
- Введите информацию о подключении, которую вы собрали ранее.
- Укажите **DISPLAY NAME** — это может быть любое имя на ваш выбор. Если вы будете подключаться к нескольким базам данных ClickHouse, используйте более описательное имя.

<Image
  size='sm'
  img={superset_03}
  alt='Форма конфигурации подключения Superset с параметрами подключения к ClickHouse'
  border
/>
<br />

4. Нажмите кнопки **CONNECT**, а затем **FINISH**, чтобы завершить работу мастера настройки. После этого вы увидите вашу базу данных в списке баз данных.


## 4. Добавление набора данных {#4-add-a-dataset}

1. Для работы с данными ClickHouse в Superset необходимо определить **_набор данных_**. В верхнем меню Superset выберите **Data**, затем **Datasets** из выпадающего меню.

2. Нажмите кнопку добавления набора данных. Выберите созданную базу данных в качестве источника данных — вы увидите таблицы, определённые в вашей базе данных:

<Image
  size='sm'
  img={superset_04}
  alt='Диалоговое окно создания набора данных Superset с доступными таблицами из базы данных ClickHouse'
  border
/>
<br />

3. Нажмите кнопку **ADD** в нижней части диалогового окна, и ваша таблица появится в списке наборов данных. Теперь вы готовы создавать дашборды и анализировать данные ClickHouse!


## 5. Создание графиков и дашборда в Superset {#5--creating-charts-and-a-dashboard-in-superset}

Если вы знакомы с Superset, то этот раздел не вызовет у вас затруднений. Если же вы впервые работаете с Superset, то... он похож на многие другие популярные инструменты визуализации — начать работу несложно, но детали и нюансы осваиваются со временем по мере использования инструмента.

1. Начните с создания дашборда. В верхнем меню Superset выберите **Dashboards**. Нажмите кнопку в правом верхнем углу, чтобы добавить новый дашборд. Следующий дашборд называется **UK property prices**:

<Image
  size='md'
  img={superset_05}
  alt='Пустой дашборд Superset с названием UK property prices, готовый для добавления графиков'
  border
/>
<br />

2. Чтобы создать новый график, выберите **Charts** в верхнем меню и нажмите кнопку для добавления нового графика. Вам будет предложено множество вариантов. В следующем примере показан график типа **Pie Chart** с использованием набора данных **uk_price_paid** из выпадающего списка **CHOOSE A DATASET**:

<Image
  size='md'
  img={superset_06}
  alt='Интерфейс создания графика в Superset с выбранным типом визуализации Pie Chart'
  border
/>
<br />

3. Для круговых диаграмм Superset требуется указать **Dimension** и **Metric**, остальные настройки являются необязательными. Вы можете выбрать собственные поля для измерения и метрики. В этом примере используется поле ClickHouse `district` в качестве измерения и `AVG(price)` в качестве метрики.

<Image
  size='md'
  img={superset_08}
  alt='Конфигурация измерения с выбранным полем district для круговой диаграммы'
  border
/>
<Image
  size='md'
  img={superset_09}
  alt='Конфигурация метрики с агрегатной функцией AVG(price) для круговой диаграммы'
  border
/>
<br />

5. Если вы предпочитаете кольцевые диаграммы круговым, вы можете настроить это и другие параметры в разделе **CUSTOMIZE**:

<Image
  size='sm'
  img={superset_10}
  alt='Панель настройки с опцией кольцевой диаграммы и другими параметрами конфигурации круговой диаграммы'
  border
/>
<br />

6. Нажмите кнопку **SAVE**, чтобы сохранить график, затем выберите **UK property prices** в выпадающем списке **ADD TO DASHBOARD**, после чего нажмите **SAVE & GO TO DASHBOARD** — это сохранит график и добавит его на дашборд:

<Image
  size='md'
  img={superset_11}
  alt='Диалог сохранения графика с выпадающим списком выбора дашборда и кнопкой Save & Go to Dashboard'
  border
/>
<br />

7. Вот и всё. Создание дашбордов в Superset на основе данных в ClickHouse открывает целый мир молниеносной аналитики данных!

<Image
  size='md'
  img={superset_12}
  alt='Готовый дашборд Superset с несколькими визуализациями данных о ценах на недвижимость в Великобритании из ClickHouse'
  border
/>
<br />
