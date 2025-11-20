---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['Metabase']
description: 'Metabase — это простой в использовании инструмент с открытым исходным кодом для работы с вашими данными.'
title: 'Подключение Metabase к ClickHouse'
show_related_blogs: true
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'data_visualization'
  - website: 'https://github.com/clickhouse/metabase-clickhouse-driver'
---

import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';
import PartnerBadge from '@theme/badges/PartnerBadge';


# Подключение Metabase к ClickHouse

<PartnerBadge/>

Metabase — это простой в использовании инструмент с открытым исходным кодом, который позволяет задавать вопросы к вашим данным через графический интерфейс. Metabase — это Java‑приложение, которое можно запустить, просто <a href="https://www.metabase.com/start/oss/jar" target="_blank">скачав JAR‑файл</a> и выполнив его командой `java -jar metabase.jar`. Metabase подключается к ClickHouse с помощью JDBC‑драйвера, который необходимо скачать и поместить в папку `plugins`:



## Цель {#goal}

В этом руководстве вы научитесь формулировать запросы к данным ClickHouse с помощью Metabase и визуализировать результаты. Один из результатов будет выглядеть следующим образом:

<Image
  size='md'
  img={metabase_08}
  alt='Визуализация круговой диаграммы в Metabase с данными из ClickHouse'
  border
/>
<p />

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md) — можете выбрать его. В той же категории документации доступны и другие наборы данных.
:::


## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Загрузка плагина ClickHouse для Metabase {#2--download-the-clickhouse-plugin-for-metabase}

1. Если у вас нет папки `plugins`, создайте её как подпапку в каталоге, где сохранён файл `metabase.jar`.

2. Плагин представляет собой JAR-файл с именем `clickhouse.metabase-driver.jar`. Загрузите последнюю версию JAR-файла по адресу <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>

3. Сохраните файл `clickhouse.metabase-driver.jar` в папке `plugins`.

4. Запустите (или перезапустите) Metabase, чтобы драйвер загрузился корректно.

5. Откройте Metabase по адресу <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>. При первом запуске отобразится экран приветствия, и вам потребуется ответить на ряд вопросов. Если будет предложено выбрать базу данных, выберите «**I'll add my data later**»:


## 3. Подключение Metabase к ClickHouse {#3--connect-metabase-to-clickhouse}

1. Нажмите на значок шестерёнки в правом верхнем углу и выберите **Admin Settings**, чтобы перейти на <a href="http://localhost:3000/admin/settings/setup" target="_blank">страницу администрирования Metabase</a>.

2. Нажмите **Add a database**. Также можно перейти на вкладку **Databases** и нажать кнопку **Add database**.

3. Если драйвер установлен корректно, вы увидите **ClickHouse** в выпадающем меню **Database type**:

   <Image
     size='md'
     img={metabase_01}
     alt='Выбор базы данных в Metabase с ClickHouse в списке опций'
     border
   />

4. Задайте **Display name** для вашей базы данных — это настройка Metabase, поэтому можно использовать любое удобное имя.

5. Введите параметры подключения к вашей базе данных ClickHouse. Включите безопасное соединение, если ваш сервер ClickHouse настроен на использование SSL. Например:

   <Image
     size='md'
     img={metabase_02}
     alt='Форма параметров подключения Metabase к базе данных ClickHouse'
     border
   />

6. Нажмите кнопку **Save**, и Metabase просканирует вашу базу данных для обнаружения таблиц.


## 4. Выполнение SQL-запроса {#4-run-a-sql-query}

1. Выйдите из **настроек администратора**, нажав кнопку **Exit admin** в правом верхнем углу.

2. В правом верхнем углу откройте меню **+ New** и обратите внимание, что вы можете задавать вопросы, выполнять SQL-запросы и создавать дашборды:

   <Image
     size='sm'
     img={metabase_03}
     alt='Меню New в Metabase с опциями создания вопросов, SQL-запросов и дашбордов'
     border
   />

3. Например, ниже показан SQL-запрос к таблице `uk_price_paid`, который возвращает среднюю цену по годам с 1995 по 2022:

   <Image
     size='md'
     img={metabase_04}
     alt='SQL-редактор Metabase с запросом к данным о ценах на недвижимость в Великобритании'
     border
   />


## 5. Создание запроса {#5-ask-a-question}

1. Нажмите **+ New** и выберите **Question**. Обратите внимание, что запрос можно создать, начав с выбора базы данных и таблицы. Например, следующий запрос выполняется к таблице `uk_price_paid` в базе данных `default`. Это простой запрос, который вычисляет среднюю цену по городам в графстве Большой Манчестер:

   <Image
     size='md'
     img={metabase_06}
     alt='Интерфейс конструктора запросов Metabase с данными о ценах в Великобритании'
     border
   />

2. Нажмите кнопку **Visualize**, чтобы увидеть результаты в табличном виде.

   <Image
     size='md'
     img={metabase_07}
     alt='Визуализация Metabase с табличными результатами средних цен по городам'
     border
   />

3. Под результатами нажмите кнопку **Visualization**, чтобы изменить визуализацию на столбчатую диаграмму (или выбрать любой другой доступный вариант):

   <Image
     size='md'
     img={metabase_08}
     alt='Круговая диаграмма Metabase со средними ценами по городам в Большом Манчестере'
     border
   />


## Узнать больше {#learn-more}

Дополнительную информацию о Metabase и создании дашбордов можно найти в <a href="https://www.metabase.com/docs/latest/" target="_blank">документации Metabase</a>.
