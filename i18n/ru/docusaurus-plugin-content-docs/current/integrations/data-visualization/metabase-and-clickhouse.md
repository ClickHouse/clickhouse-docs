---
sidebar_label: Metabase
sidebar_position: 131
slug: /integrations/metabase
keywords: [ClickHouse, Metabase, connect, integrate, ui]
description: Metabase - это простое в использовании, open source UI средство для заданий вопросов о ваших данных.
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import metabase_01 from '@site/static/images/integrations/data-visualization/metabase_01.png';
import metabase_02 from '@site/static/images/integrations/data-visualization/metabase_02.png';
import metabase_03 from '@site/static/images/integrations/data-visualization/metabase_03.png';
import metabase_04 from '@site/static/images/integrations/data-visualization/metabase_04.png';
import metabase_06 from '@site/static/images/integrations/data-visualization/metabase_06.png';
import metabase_07 from '@site/static/images/integrations/data-visualization/metabase_07.png';
import metabase_08 from '@site/static/images/integrations/data-visualization/metabase_08.png';


# Подключение Metabase к ClickHouse

Metabase - это простое в использовании, open source UI средство для заданий вопросов о ваших данных. Metabase - это Java приложение, которое можно запустить, просто <a href="https://www.metabase.com/start/oss/jar" target="_blank">скачав JAR файл</a> и запустив его с помощью `java -jar metabase.jar`. Metabase подключается к ClickHouse с помощью JDBC драйвера, который вы скачиваете и помещаете в папку `plugins`:

## Цель {#goal}

В этом руководстве вы зададите несколько вопросов о ваших данных ClickHouse с помощью Metabase и визуализируете ответы. Один из ответов будет выглядеть так:

  <img src={metabase_08} class="image" alt="Круговая диаграмма" />
<p/>

:::tip Добавьте данные
Если у вас нет набора данных, с которым можно работать, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), так что вы можете выбрать его. В той же категории документации есть несколько других наборов данных, которые можно рассмотреть.
:::

## 1. Соберите ваши данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Скачайте плагин ClickHouse для Metabase {#2--download-the-clickhouse-plugin-for-metabase}

1. Если у вас нет папки `plugins`, создайте ее как подпапку, где вы сохранили `metabase.jar`.

2. Плагин - это JAR файл с именем `clickhouse.metabase-driver.jar`. Скачайте последнюю версию JAR файла по адресу <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>

3. Сохраните `clickhouse.metabase-driver.jar` в папке `plugins`.

4. Запустите (или перезапустите) Metabase, чтобы драйвер загрузился правильно.

5. Доступ к Metabase по адресу <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>. При первоначальном запуске вы увидите приветственный экран и должны будете пройти через список вопросов. Если вас попросят выбрать базу данных, выберите "**Я добавлю свои данные позже**":

## 3. Подключите Metabase к ClickHouse {#3--connect-metabase-to-clickhouse}

1. Нажмите на значок шестеренки в правом верхнем углу и выберите **Настройки администратора**, чтобы перейти на вашу <a href="http://localhost:3000/admin/settings/setup" target="_blank">админстративную страницу Metabase</a>.

2. Нажмите на **Добавить базу данных**. Кроме того, вы можете нажать на вкладку **Базы данных** и выбрать кнопку **Добавить базу данных**.

3. Если установка вашего драйвера сработала, вы увидите **ClickHouse** в выпадающем меню для **Тип базы данных**:

    <img src={metabase_01} class="image" alt="Добавить базу данных ClickHouse" />

4. Дайте вашей базе данных **Отображаемое имя**, которое является параметром Metabase - используйте любое имя, которое вам нравится.

5. Введите данные для подключения к вашей базе данных ClickHouse. Включите безопасное соединение, если ваш сервер ClickHouse настроен на использование SSL. Например:

    <img src={metabase_02} class="image" style={{width: '80%'}}  alt="Детали подключения" />

6. Нажмите кнопку **Сохранить**, и Metabase просканирует вашу базу данных на наличие таблиц.

## 4. Выполните SQL запрос {#4-run-a-sql-query}

1. Выйдите из **Настроек администратора**, нажав кнопку **Выйти из администратора** в правом верхнем углу.

2. В правом верхнем углу нажмите на меню **+ Новое** и обратите внимание, что вы можете задавать вопросы, выполнять SQL запросы и строить панель инструментов:

    <img src={metabase_03} class="image" style={{width: 283}} alt="Новое меню" />

3. Например, вот SQL запрос, выполненный над таблицей с именем `uk_price_paid`, который возвращает среднюю цену, уплаченную по годам с 1995 по 2022 год:

    <img src={metabase_04} class="image" alt="Выполнить SQL запрос" />

## 5. Задайте вопрос {#5-ask-a-question}

1. Нажмите **+ Новое** и выберите **Вопрос**. Обратите внимание, что вы можете сформировать вопрос, начиная с базы данных и таблицы. Например, следующий вопрос задается таблице с именем `uk_price_paid` в базе данных `default`. Вот простой вопрос, который рассчитывает среднюю цену по городам в графстве Большой Манчестер:

    <img src={metabase_06} class="image" alt="Новый вопрос" />

2. Нажмите кнопку **Визуализировать**, чтобы увидеть результаты в табличном виде.

    <img src={metabase_07} class="image" alt="Новый вопрос" />

3. Под результатами нажмите кнопку **Визуализация**, чтобы изменить визуализацию на столбчатую диаграмму (или любой из других доступных вариантов):

    <img src={metabase_08} class="image" alt="Визуализация круговой диаграммы" />

## Узнайте больше {#learn-more}

Найдите дополнительную информацию о Metabase и о том, как создавать панели инструментов, <a href="https://www.metabase.com/docs/latest/" target="_blank">посетив документацию Metabase</a>.

## Связанный контент {#related-content}

- Блог: [Визуализация данных с ClickHouse - Часть 3 - Metabase](https://clickhouse.com/blog/visualizing-data-with-metabase)
