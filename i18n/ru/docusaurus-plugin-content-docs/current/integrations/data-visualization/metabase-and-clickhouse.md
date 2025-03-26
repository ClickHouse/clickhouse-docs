---
sidebar_label: 'Metabase'
sidebar_position: 131
slug: /integrations/metabase
keywords: ['ClickHouse', 'Metabase', 'connect', 'integrate', 'ui']
description: 'Metabase - это простой в использовании инструмент с открытым исходным кодом для получения ответов на вопросы о ваших данных.'
title: 'Подключение Metabase к ClickHouse'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Metabase к ClickHouse

<CommunityMaintainedBadge/>

Metabase - это простой в использовании инструмент с открытым исходным кодом для получения ответов на вопросы о ваших данных. Metabase - это Java-приложение, которое можно запустить, просто <a href="https://www.metabase.com/start/oss/jar" target="_blank">скачав JAR файл</a> и запустив его с помощью `java -jar metabase.jar`. Metabase подключается к ClickHouse, используя JDBC драйвер, который вы скачиваете и помещаете в папку `plugins`:

## Цель {#goal}

В этом руководстве вы зададите несколько вопросов о ваших данных ClickHouse с помощью Metabase и визуализируете ответы. Один из ответов будет выглядеть так:

  <Image size="md" img={metabase_08} alt="Визуализация круговой диаграммы Metabase с данными из ClickHouse" border />
<p/>

:::tip Добавьте несколько данных
Если у вас нет набора данных для работы, вы можете добавить один из примеров. Это руководство использует набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), поэтому вы можете выбрать его. Также есть несколько других, доступных в той же категории документации.
:::

## 1. Соберите детали соединения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2.  Скачайте плагин ClickHouse для Metabase {#2--download-the-clickhouse-plugin-for-metabase}

1. Если у вас нет папки `plugins`, создайте ее в папке, где сохранен `metabase.jar`.

2. Плагин - это JAR файл с именем `clickhouse.metabase-driver.jar`. Скачайте последнюю версию JAR файла по адресу <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>

3. Сохраните `clickhouse.metabase-driver.jar` в вашей папке `plugins`.

4. Запустите (или перезапустите) Metabase, чтобы драйвер был загружен должным образом.

5. Получите доступ к Metabase по адресу <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>. При первом запуске вы увидите приветственный экран и должны будете пройти через список вопросов. Если будет предложено выбрать базу данных, выберите "**I'll add my data later**":


## 3.  Подключите Metabase к ClickHouse {#3--connect-metabase-to-clickhouse}

1. Нажмите на иконку шестеренки в правом верхнем углу и выберите **Admin Settings**, чтобы перейти на вашу <a href="http://localhost:3000/admin/settings/setup" target="_blank">административную страницу Metabase</a>.

2. Нажмите **Add a database**. Альтернативно, вы можете нажать на вкладку **Databases** и выбрать кнопку **Add database**.

3. Если установка вашего драйвера прошла успешно, вы увидите **ClickHouse** в выпадающем меню для **Database type**:

    <Image size="md" img={metabase_01} alt="Выбор базы данных Metabase с ClickHouse в качестве опции" border />

4. Укажите **Display name** для вашей базы данных, это настройка Metabase - так что используйте любое имя, которое вам нравится.

5. Введите детали соединения вашей базы данных ClickHouse. Включите безопасное соединение, если ваш сервер ClickHouse настроен на использование SSL. Например:

    <Image size="md" img={metabase_02} alt="Форма деталей соединения Metabase для базы данных ClickHouse" border />

6. Нажмите кнопку **Save**, и Metabase просканирует вашу базу данных на наличие таблиц.

## 4. Запустите SQL запрос {#4-run-a-sql-query}

1. Выйдите из **Admin settings**, нажав кнопку **Exit admin** в правом верхнем углу.

2. В правом верхнем углу нажмите меню **+ New** и обратите внимание, что вы можете задавать вопросы, запускать SQL запросы и строить дашборды:

    <Image size="sm" img={metabase_03} alt="Новое меню Metabase с опциями для создания вопросов, SQL запросов и дашбордов" border />

3. Например, вот SQL запрос, выполненный на таблице с именем `uk_price_paid`, который возвращает среднюю цену, уплаченную по годам с 1995 по 2022:

    <Image size="md" img={metabase_04} alt="Редактор SQL Metabase с запросом на данные по UK price paid" border />

## 5. Задайте вопрос {#5-ask-a-question}

1. Нажмите на **+ New** и выберите **Question**. Обратите внимание, что вы можете построить вопрос, начиная с базы данных и таблицы. Например, следующий вопрос задаётся к таблице с именем `uk_price_paid` в базе данных `default`. Вот простой вопрос, который вычисляет среднюю цену по городам в округе Большой Манчестер:

    <Image size="md" img={metabase_06} alt="Интерфейс конструктора вопросов Metabase с данными по ценам в Великобритании" border />

2. Нажмите кнопку **Visualize**, чтобы увидеть результаты в виде таблицы.

    <Image size="md" img={metabase_07} alt="Визуализация Metabase, показывающая табличные результаты средних цен по городам" border />

3. Под результатами нажмите кнопку **Visualization**, чтобы изменить визуализацию на столбчатую диаграмму (или любой другой доступный вариант):

    <Image size="md" img={metabase_08} alt="Визуализация в виде круговой диаграммы Metabase средних цен по городам в Большом Манчестере" border />

## Узнайте больше {#learn-more}

Найдите больше информации о Metabase и о том, как строить дашборды, <a href="https://www.metabase.com/docs/latest/" target="_blank">посетив документацию Metabase</a>.

## Связанный контент {#related-content}

- Блог: [Визуализация данных с ClickHouse - Часть 3 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
