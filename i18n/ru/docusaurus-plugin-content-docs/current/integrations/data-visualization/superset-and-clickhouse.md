---
sidebar_label: 'Superset'
sidebar_position: 198
slug: /integrations/superset
keywords: ['clickhouse', 'superset', 'connect', 'integrate', 'ui']
description: 'Apache Superset — это платформа для исследования и визуализации данных с открытым исходным кодом.'
title: 'Подключение Superset к ClickHouse'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Superset к ClickHouse

<CommunityMaintainedBadge/>

<a href="https://superset.apache.org/" target="_blank">Apache Superset</a> — это платформа для исследования и визуализации данных с открытым исходным кодом, написанная на Python. Superset подключается к ClickHouse с помощью драйвера Python, предоставленного ClickHouse. Давайте рассмотрим, как это работает...

## Цель {#goal}

В этом руководстве вы создадите панель мониторинга в Superset с данными из базы данных ClickHouse. Панель будет выглядеть следующим образом:

<Image size="md" img={superset_12} alt="Панель мониторинга Superset, показывающая цены на недвижимость в Великобритании с несколькими визуализациями, включая круговые диаграммы и таблицы" border />
<br/>

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), так что вы можете выбрать именно его. В той же категории документации есть несколько других вариантов.
:::

## 1. Соберите детали подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Установите Драйвер {#2-install-the-driver}

1. Superset использует драйвер `clickhouse-connect` для подключения к ClickHouse. Подробности о `clickhouse-connect` можно найти на <a href="https://pypi.org/project/clickhouse-connect/" target="_blank">https://pypi.org/project/clickhouse-connect/</a>, и его можно установить с помощью следующей команды:

    ```console
    pip install clickhouse-connect
    ```

2. Запустите (или перезапустите) Superset.

## 3. Подключите Superset к ClickHouse {#3-connect-superset-to-clickhouse}

1. В Superset выберите **Data** в верхнем меню, затем выберите **Databases** в выпадающем меню. Добавьте новую базу данных, нажав кнопку **+ Database**:

<Image size="lg" img={superset_01} alt="Интерфейс Superset, показывающий меню База данных с выделенной кнопкой + Database" border />
<br/>

2. На первом этапе выберите **ClickHouse Connect** в качестве типа базы данных:

<Image size="sm" img={superset_02} alt="Мастер подключения к базе данных Superset, показывающий выбранный вариант ClickHouse Connect" border />
<br/>

3. На втором этапе:
  - Установите SSL в положении включено или выключено.
  - Введите информацию о подключении, которую вы собрали ранее.
  - Укажите **DISPLAY NAME**: это может быть любое имя по вашему выбору. Если вы собираетесь подключаться к нескольким базам данных ClickHouse, сделайте имя более описательным.

<Image size="sm" img={superset_03} alt="Форма конфигурации подключения Superset, показывающая параметры подключения ClickHouse" border />
<br/>

4. Нажмите кнопки **CONNECT**, а затем **FINISH**, чтобы завершить мастер настройки, и вы должны увидеть вашу базу данных в списке баз данных.

## 4. Добавьте Набор Данных {#4-add-a-dataset}

1. Чтобы взаимодействовать с вашими данными ClickHouse через Superset, вам нужно определить **_dataset_**. В верхнем меню Superset выберите **Data**, затем **Datasets** из выпадающего меню.

2. Нажмите кнопку для добавления набора данных. Выберите вашу новую базу данных в качестве источника данных, и вы должны увидеть таблицы, определенные в вашей базе данных:

<Image size="sm" img={superset_04} alt="Диалоговое окно создания набора данных Superset, показывающее доступные таблицы из базы данных ClickHouse" border />
<br/>

3. Нажмите кнопку **ADD** в нижней части диалогового окна, и ваша таблица появится в списке наборов данных. Вы готовы создать панель мониторинга и проанализировать ваши данные ClickHouse!

## 5. Создание графиков и панели мониторинга в Superset {#5--creating-charts-and-a-dashboard-in-superset}

Если вы знакомы с Superset, вы быстро освоитесь с этой следующей частью. Если вы новички в Superset, то это... похоже на многие другие интересные инструменты визуализации, доступные в мире — начать несложно, но детали и нюансы усваиваются со временем по мере использования инструмента.

1. Вы начинаете с панели мониторинга. В верхнем меню Superset выберите **Dashboards**. Нажмите кнопку в правом верхнем углу, чтобы добавить новую панель мониторинга. Следующая панель называется **UK property prices**:

<Image size="md" img={superset_05} alt="Пустая панель мониторинга Superset под названием UK property prices, готовая к добавлению графиков" border />
<br/>

2. Чтобы создать новый график, выберите **Charts** в верхнем меню и нажмите кнопку для добавления нового графика. Вам будут показаны множество опций. Следующий пример демонстрирует график **Pie Chart** с использованием набора данных **uk_price_paid** из выпадающего списка **CHOOSE A DATASET**:

<Image size="md" img={superset_06} alt="Интерфейс создания графика Superset с выбранным типом визуализации Pie Chart" border />
<br/>

3. Круговые диаграммы Superset требуют **Dimension** и **Metric**, остальные настройки являются необязательными. Вы можете выбрать свои собственные поля для измерения и метрики, в этом примере используется поле ClickHouse `district` в качестве измерения и `AVG(price)` в качестве метрики.

<Image size="md" img={superset_08} alt="Конфигурация измерения, показывающая выбранное поле district для круговой диаграммы" border />
<Image size="md" img={superset_09} alt="Конфигурация метрики, показывающая агрегатную функцию AVG(price) для круговой диаграммы" border />
<br/>

5. Если вам нравятся донатовые диаграммы больше, чем круговые, вы можете установить это и другие параметры в разделе **CUSTOMIZE**:

<Image size="sm" img={superset_10} alt="Панель настроек, показывающая опцию донатовой диаграммы и другие параметры конфигурации круговой диаграммы" border />
<br/>

6. Нажмите кнопку **SAVE**, чтобы сохранить график, затем выберите **UK property prices** из выпадающего списка **ADD TO DASHBOARD**, затем **SAVE & GO TO DASHBOARD** сохраняет график и добавляет его на панель мониторинга:

<Image size="md" img={superset_11} alt="Диалоговое окно сохранения графика с выпадающим списком выбора панели мониторинга и кнопкой Save & Go to Dashboard" border />
<br/>

7. Вот и всё. Создание панелей мониторинга в Superset на основе данных в ClickHouse открывает целый мир стремительной аналитики данных!

<Image size="md" img={superset_12} alt="Завершенная панель мониторинга Superset с несколькими визуализациями данных о ценах на недвижимость в Великобритании из ClickHouse" border />
<br/>

## Связанный контент {#related-content}

- Блог: [Визуализация данных с ClickHouse - Часть 2 - Superset](https://clickhouse.com/blog/visualizing-data-with-superset)
