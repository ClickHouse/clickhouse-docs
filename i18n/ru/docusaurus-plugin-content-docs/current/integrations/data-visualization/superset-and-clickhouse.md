---
sidebar_label: Суперсет
sidebar_position: 198
slug: /integrations/superset
keywords: [clickhouse, супerset, подключение, интеграция, ui]
description: Apache Superset - это платформa для исследования и визуализации данных с открытым исходным кодом.
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# Подключение Superset к ClickHouse

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> - это платформа для исследования и визуализации данных с открытым исходным кодом, написанная на Python. Superset подключается к ClickHouse с помощью Python-драйвера, предоставленного ClickHouse. Давайте посмотрим, как это работает...

## Цель {#goal}

В этом руководстве вы создадите панель мониторинга в Superset с данными из базы данных ClickHouse. Панель мониторинга будет выглядеть так:

<img alt="Новая панель мониторинга" src={superset_12}/>
<br/>

:::tip Добавьте некоторые данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), поэтому вы можете выбрать его. В той же категории документации есть несколько других наборов данных на выбор.
:::

## 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Установите драйвер {#2-install-the-driver}

1. Superset использует драйвер `clickhouse-connect` для подключения к ClickHouse. Подробности о `clickhouse-connect` можно найти по адресу <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>, и его можно установить с помощью следующей команды:

    ```console
    pip install clickhouse-connect
    ```

2. Запустите (или перезапустите) Superset.

## 3. Подключите Superset к ClickHouse {#3-connect-superset-to-clickhouse}

1. Внутри Superset выберите **Data** из верхнего меню, а затем **Databases** из выпадающего меню. Добавьте новую базу данных, нажав кнопку **+ Database**:

<img alt="Добавить новую базу данных" src={superset_01}/>
<br/>

2. На первом шаге выберите **ClickHouse Connect** как тип базы данных:

<img alt="Выберите Clickhouse" src={superset_02}/>
<br/>

3. На втором шаге:
  - Установите SSL в включенное или выключенное положение.
  - Введите информацию о подключении, которую вы собрали ранее.
  - Укажите **DISPLAY NAME**: это может быть любое имя, которое вам нравится. Если вы будете подключаться к нескольким базам данных ClickHouse, сделайте имя более описательным.

<img alt="Проверьте соединение" src={superset_03}/>
<br/>

4. Нажмите кнопки **CONNECT**, а затем **FINISH**, чтобы завершить мастер настройки, и вы должны увидеть вашу базу данных в списке баз данных.

## 4. Добавьте набор данных {#4-add-a-dataset}

1. Чтобы взаимодействовать с данными ClickHouse в Superset, вам нужно определить **_dataset_**. В верхнем меню Superset выберите **Data**, затем **Datasets** из выпадающего меню.

2. Нажмите кнопку для добавления набора данных. Выберите вашу новую базу данных в качестве источника данных, и вы должны увидеть таблицы, определенные в вашей базе данных:

<img alt="Новый набор данных" src={superset_04}/>
<br/>

3. Нажмите кнопку **ADD** внизу диалогового окна, и ваша таблица появится в списке наборов данных. Вы готовы создать панель мониторинга и проанализировать ваши данные ClickHouse!

## 5. Создание диаграмм и панели мониторинга в Superset {#5--creating-charts-and-a-dashboard-in-superset}

Если вы знакомы с Superset, вам будет легко перейти к следующему разделу. Если вы новичок в Superset, что ж... это похоже на многие другие крутые инструменты визуализации, доступные в мире - на изучение интерфейса нужно немного времени, но детали и нюансы осваиваются постепенно с использованием инструмента.

1. Вы начинаете с панели мониторинга. В верхнем меню Superset выберите **Dashboards**. Нажмите кнопку в правом верхнем углу, чтобы добавить новую панель мониторинга. Следующая панель мониторинга называется **UK property prices**:

<img alt="Новая панель мониторинга" src={superset_05}/>
<br/>

2. Чтобы создать новую диаграмму, выберите **Charts** из верхнего меню и нажмите кнопку для добавления новой диаграммы. Вам будет показано много вариантов. В следующем примере показан **Круговой график** с использованием набора данных **uk_price_paid** из выпадающего списка **CHOOSE A DATASET**:

<img alt="Новая диаграмма" src={superset_06}/>
<br/>

3. Круговые диаграммы Superset требуют **Dimension** и **Metric**, остальные параметры являются необязательными. Вы можете выбрать свои собственные поля для измерения и метрики, в этом примере используется поле ClickHouse `district` в качестве измерения и `AVG(price)` в качестве метрики.

<img alt="Метрика SUM" src={superset_08}/>
<img alt="Метрика SUM" src={superset_09}/>
<br/>

5. Если вы предпочитаете кольцевые диаграммы вместо круговых, вы можете установить это и другие параметры в разделе **CUSTOMIZE**:

<img alt="Добавить диаграмму на панель мониторинга" src={superset_10}/>
<br/>

6. Нажмите кнопку **SAVE**, чтобы сохранить диаграмму, затем выберите **UK property prices** в выпадающем меню **ADD TO DASHBOARD**, после чего **SAVE & GO TO DASHBOARD** сохранит диаграмму и добавит ее на панель мониторинга:

<img alt="Добавить диаграмму на панель мониторинга" src={superset_11}/>
<br/>

7. Вот и всё. Создание панелей мониторинга в Superset на основе данных ClickHouse открывает целый мир молниеносной аналитики данных!

<img alt="Новая панель мониторинга" src={superset_12}/>
<br/>

## Связанный контент {#related-content}

- Блог: [Визуализация данных с ClickHouse - Часть 2 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
