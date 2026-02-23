---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase — это простой в использовании UI-инструмент с открытым исходным кодом для анализа ваших данных.'
title: 'Подключение Metabase к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
  - website: 'https://github.com/clickhouse/metabase-clickhouse-driver'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Подключение Metabase к ClickHouse \{#connecting-metabase-to-clickhouse\}

<PartnerBadge/>

Metabase — это простой в использовании UI‑инструмент с открытым исходным кодом для формирования запросов к вашим данным. Metabase — это Java‑приложение, которое можно запустить, просто <a href="https://www.metabase.com/start/oss/jar" target="_blank">скачав JAR‑файл</a> и выполнив его командой `java -jar metabase.jar`. Metabase подключается к ClickHouse с помощью JDBC‑драйвера, который нужно скачать и поместить в папку `plugins`:

## Цель \{#goal\}

В этом руководстве вы будете задавать вопросы о данных в ClickHouse с помощью Metabase и визуализировать ответы. Один из ответов будет выглядеть так:

<Image size="md" img={metabase_08} alt="Визуализация в виде круговой диаграммы Metabase, показывающая данные из ClickHouse" border />

<p/>

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), так что вы можете выбрать его. В той же категории документации есть и несколько других примеров.
:::

## 1. Соберите параметры подключения \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2.  Загрузите плагин ClickHouse для Metabase \{#2--download-the-clickhouse-plugin-for-metabase\}

1. Если у вас нет папки `plugins`, создайте её как подпапку в каталоге, где сохранён файл `metabase.jar`.

2. Плагин представляет собой JAR‑файл с именем `clickhouse.metabase-driver.jar`. Загрузите последнюю версию JAR‑файла по адресу <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>.

3. Сохраните `clickhouse.metabase-driver.jar` в папку `plugins`.

4. Запустите (или перезапустите) Metabase, чтобы драйвер корректно загрузился.

5. Откройте Metabase по адресу <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>. При первом запуске вы увидите приветственный экран и вам потребуется ответить на ряд вопросов. Если будет предложено выбрать базу данных, выберите вариант "**I'll add my data later**":

## 3.  Подключение Metabase к ClickHouse \{#3--connect-metabase-to-clickhouse\}

1. Нажмите на значок шестерёнки в правом верхнем углу и выберите **Admin Settings**, чтобы открыть <a href="http://localhost:3000/admin/settings/setup" target="_blank">страницу администрирования Metabase</a>.

2. Нажмите **Add a database**. Также вы можете открыть вкладку **Databases** и нажать кнопку **Add database**.

3. Если установка драйвера прошла успешно, вы увидите **ClickHouse** в выпадающем меню **Database type**:

    <Image size="md" img={metabase_01} alt="Окно выбора базы данных в Metabase с ClickHouse в качестве одного из вариантов" border />

4. Укажите для базы данных **Display name** — это настройка Metabase, поэтому можно использовать любое удобное имя.

5. Введите параметры подключения к вашей базе данных ClickHouse. Включите защищённое соединение, если ваш сервер ClickHouse настроен на использование SSL. Например:

    <Image size="md" img={metabase_02} alt="Форма параметров подключения Metabase к базе данных ClickHouse" border />

6. Нажмите кнопку **Save**, после чего Metabase просканирует вашу базу данных на наличие таблиц.

## 4. Выполните SQL-запрос \{#4-run-a-sql-query\}

1. Выйдите из **Admin settings**, нажав кнопку **Exit admin** в правом верхнем углу.

2. В правом верхнем углу нажмите меню **+ New** и обратите внимание, что вы можете задавать вопросы, выполнять SQL-запросы и создавать дашборды:

    <Image size="sm" img={metabase_03} alt="Меню Metabase New с вариантами создания вопросов, SQL-запросов и дашбордов" border />

3. Например, вот SQL-запрос, выполняемый для таблицы `uk_price_paid`, который возвращает среднюю цену по годам с 1995 по 2022:

    <Image size="md" img={metabase_04} alt="SQL-редактор Metabase с запросом к данным UK price paid" border />

## 5. Задайте вопрос \{#5-ask-a-question\}

1. Нажмите **+ New** и выберите **Question**. Обратите внимание, что вы можете сформировать вопрос, начав с базы данных и таблицы. Например, следующий вопрос задаётся к таблице `uk_price_paid` в базе данных `default`. Вот простой вопрос, который вычисляет среднюю цену по городам в графстве Большой Манчестер:

    <Image size="md" img={metabase_06} alt="Интерфейс конструктора вопросов Metabase с данными по ценам в Великобритании" border />

2. Нажмите кнопку **Visualize**, чтобы увидеть результаты в табличном представлении.

    <Image size="md" img={metabase_07} alt="Визуализация Metabase, показывающая табличные результаты средних цен по городам" border />

3. Ниже результатов нажмите кнопку **Visualization**, чтобы изменить визуализацию на столбчатую диаграмму (или любой другой доступный вариант):

    <Image size="md" img={metabase_08} alt="Круговая диаграмма Metabase со средними ценами по городам в Большом Манчестере" border />

## Узнайте больше \{#learn-more\}

Чтобы узнать больше о Metabase и создании дашбордов, обратитесь к <a href="https://www.metabase.com/docs/latest/" target="_blank">документации Metabase</a>.