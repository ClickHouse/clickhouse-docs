---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['clickhouse', 'superset', 'connect', 'integrate', 'ui']
description: 'Apache Superset - это платформа для исследования и визуализации данных с открытым исходным кодом.'
title: 'Подключите Superset к ClickHouse'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключите Superset к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> - это платформа для исследования и визуализации данных с открытым исходным кодом, написанная на Python. Superset подключается к ClickHouse с помощью Python-драйвера, предоставленного ClickHouse. Давайте посмотрим, как это работает...

## Цель {#goal}

В этом руководстве вы создадите дашборд в Superset с данными из базы данных ClickHouse. Дашборд будет выглядеть так:

<Image size="md" img={superset_12} alt="Дашборд Superset с ценами на недвижимость в Великобритании с несколькими визуализациями, включая круговые диаграммы и таблицы" border />
<br/>

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. Это руководство использует набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), поэтому вы можете выбрать его. Также есть несколько других, которые можно посмотреть в той же категории документации.
:::

## 1. Соберите свои данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Установите драйвер {#2-install-the-driver}

1. Superset использует драйвер `clickhouse-connect` для подключения к ClickHouse. Подробности о `clickhouse-connect` можно найти по адресу <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>, его можно установить с помощью следующей команды:

    ```console
    pip install clickhouse-connect
    ```

2. Запустите (или перезапустите) Superset.

## 3. Подключите Superset к ClickHouse {#3-connect-superset-to-clickhouse}

1. В Superset выберите **Data** в верхнем меню, затем **Databases** в выпадающем меню. Добавьте новую базу данных, нажав кнопку **+ Database**:

<Image size="lg" img={superset_01} alt="Интерфейс Superset, показывающий меню База данных с выделенной кнопкой + База данных" border />
<br/>

2. На первом шаге выберите **ClickHouse Connect** в качестве типа базы данных:

<Image size="sm" img={superset_02} alt="Мастер подключения базы данных Superset с выбранной опцией ClickHouse Connect" border />
<br/>

3. На втором шаге:
  - Установите SSL вкл. или выкл.
  - Введите информацию о подключении, которую вы собрали ранее.
  - Укажите **DISPLAY NAME**: это может быть любое имя на ваш выбор. Если вы будете подключаться к нескольким базам данных ClickHouse, сделайте имя более описательным.

<Image size="sm" img={superset_03} alt="Форма конфигурации подключения Superset с параметрами подключения ClickHouse" border />
<br/>

4. Нажмите кнопки **CONNECT**, а затем **FINISH**, чтобы завершить мастер настройки, и вы должны увидеть вашу базу данных в списке баз данных.

## 4. Добавьте набор данных {#4-add-a-dataset}

1. Чтобы взаимодействовать с данными ClickHouse в Superset, вам нужно определить **_набор данных_**. В верхнем меню Superset выберите **Data**, затем **Datasets** из выпадающего меню.

2. Нажмите кнопку для добавления набора данных. Выберите вашу новую базу данных в качестве источника данных, и вы должны увидеть таблицы, определенные в вашей базе данных:

<Image size="sm" img={superset_04} alt="Диалоговое окно создания набора данных Superset с доступными таблицами из базы данных ClickHouse" border />
<br/>

3. Нажмите кнопку **ADD** в нижней части диалогового окна, и ваша таблица появится в списке наборов данных. Теперь вы готовы создать дашборд и проанализировать ваши данные ClickHouse!


## 5. Создание диаграмм и дашборда в Superset {#5--creating-charts-and-a-dashboard-in-superset}

Если вы знакомы с Superset, то в этом следующем разделе будете чувствовать себя как дома. Если вы новичок в Superset, ну...это как и большинство других классных инструментов визуализации - не займет много времени, чтобы начать, но детали и нюансы будут усваиваемы со временем, когда вы будете использовать инструмент.

1. Вы начинаете с дашборда. В верхнем меню Superset выберите **Dashboards**. Нажмите кнопку в правом верхнем углу, чтобы добавить новый дашборд. Следующий дашборд называется **Цены на недвижимость в Великобритании**:

<Image size="md" img={superset_05} alt="Пустой дашборд Superset, названный Цены на недвижимость в Великобритании, готовый для добавления диаграмм" border />
<br/>

2. Чтобы создать новую диаграмму, выберите **Charts** в верхнем меню и нажмите кнопку для добавления новой диаграммы. Вам будет представлено много вариантов. В следующем примере показана **Круговая диаграмма** с использованием набора данных **uk_price_paid** из выпадающего меню **CHOOSE A DATASET**:

<Image size="md" img={superset_06} alt="Интерфейс создания диаграммы Superset с выбранным типом визуализации Круговая диаграмма" border />
<br/>

3. Круговые диаграммы Superset требуют **Dimension** и **Metric**, остальные параметры являются необязательными. Вы можете выбрать свои собственные поля для измерения и метрики, в этом примере используется поле ClickHouse `district` в качестве измерения и `AVG(price)` в качестве метрики.

<Image size="md" img={superset_08} alt="Конфигурация измерения, показывающая выбранное поле района для круговой диаграммы" border />
<Image size="md" img={superset_09} alt="Конфигурация метрики, показывающая агрегатную функцию AVG(price) для круговой диаграммы" border />
<br/>

5. Если вам больше нравятся донатные диаграммы, то вы можете установить это и другие параметры в разделе **CUSTOMIZE**:

<Image size="sm" img={superset_10} alt="Панель настройки, показывающая опцию донатной диаграммы и другие параметры настройки круговой диаграммы" border />
<br/>

6. Нажмите кнопку **SAVE**, чтобы сохранить диаграмму, затем выберите **Цены на недвижимость в Великобритании** в выпадающем меню **ADD TO DASHBOARD**, затем **SAVE & GO TO DASHBOARD**, чтобы сохранить диаграмму и добавить ее на дашборд:

<Image size="md" img={superset_11} alt="Диалоговое окно сохранения диаграммы с выпадающим списком выбора дашборда и кнопкой Сохранить и перейти к дашборду" border />
<br/>

7. Вот и всё. Создание дашбордов в Superset на основе данных в ClickHouse открывает целый мир стремительной аналитики данных!

<Image size="md" img={superset_12} alt="Завершенный дашборд Superset с несколькими визуализациями данных о ценах на недвижимость в Великобритании из ClickHouse" border />
<br/>

## Связанный контент {#related-content}

- Блог: [Визуализация данных с ClickHouse - Часть 2 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
