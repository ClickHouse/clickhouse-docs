---
'sidebar_label': 'Metabase'
'sidebar_position': 131
'slug': '/integrations/metabase'
'keywords':
- 'Metabase'
'description': 'Metabase является простым в использовании, открытым инструментом пользовательского
  интерфейса для задавания вопросов о ваших данных.'
'title': 'Соединение Metabase с ClickHouse'
'show_related_blogs': true
'doc_type': 'guide'
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
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Metabase к ClickHouse

<CommunityMaintainedBadge/>

Metabase — это простое в использовании, открытое пользовательское средство для получения информации о ваших данных. Metabase — это Java-приложение, которое можно запустить, просто <a href="https://www.metabase.com/start/oss/jar" target="_blank">скачав файл JAR</a> и запустив его с помощью `java -jar metabase.jar`. Metabase подключается к ClickHouse с помощью JDBC-драйвера, который вы скачиваете и помещаете в папку `plugins`:

## Цель {#goal}

В этом руководстве вы зададите несколько вопросов своим данным ClickHouse с помощью Metabase и визуализируете ответы. Один из ответов будет выглядеть следующим образом:

  <Image size="md" img={metabase_08} alt="Визуализация круговой диаграммы Metabase, показывающей данные из ClickHouse" border />
<p/>

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. Это руководство использует набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), так что вы можете выбрать именно его. В той же категории документации есть несколько других наборов данных для просмотра.
:::

## 1. Соберите данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2.  Скачайте плагин ClickHouse для Metabase {#2--download-the-clickhouse-plugin-for-metabase}

1. Если у вас нет папки `plugins`, создайте ее как подпапку там, где вы сохранили `metabase.jar`.

2. Плагин представляет собой файл JAR с именем `clickhouse.metabase-driver.jar`. Скачайте последнюю версию файла JAR по адресу <a href="https://github.com/clickhouse/metabase-clickhouse-driver/release" target="_blank">https://github.com/clickhouse/metabase-clickhouse-driver/releases/latest</a>.

3. Сохраните `clickhouse.metabase-driver.jar` в своей папке `plugins`.

4. Запустите (или перезапустите) Metabase, чтобы драйвер правильно загрузился.

5. Получите доступ к Metabase по адресу <a href="http://localhost:3000/" target="_blank">http://hostname:3000</a>. При первом запуске вы увидите экран приветствия и будете вынуждены пройти через список вопросов. Если будет предложено выбрать базу данных, выберите "**Я добавлю свои данные позже**":

## 3.  Подключите Metabase к ClickHouse {#3--connect-metabase-to-clickhouse}

1. Нажмите на значок шестеренки в верхнем правом углу и выберите **Настройки администратора**, чтобы перейти на свою <a href="http://localhost:3000/admin/settings/setup" target="_blank">административную страницу Metabase</a>.

2. Нажмите на **Добавить базу данных**. Кроме того, вы можете нажать на вкладку **Базы данных** и выбрать кнопку **Добавить базу данных**.

3. Если установка вашего драйвера прошла успешно, вы увидите **ClickHouse** в выпадающем меню для **Тип базы данных**:

    <Image size="md" img={metabase_01} alt="Выбор базы данных Metabase, показывающий ClickHouse как вариант" border />

4. Дайте своей базе данных **Отображаемое имя**, которое является настройкой Metabase - используйте любое имя, которое вам нравится.

5. Введите данные подключения к вашей базе данных ClickHouse. Включите безопасное соединение, если ваш сервер ClickHouse настроен на использование SSL. Например:

    <Image size="md" img={metabase_02} alt="Форма деталей подключения Metabase для базы данных ClickHouse" border />

6. Нажмите кнопку **Сохранить**, и Metabase просканирует вашу базу данных на наличие таблиц.

## 4. Выполните SQL-запрос {#4-run-a-sql-query}

1. Выйдите из **Настроек администратора**, нажав кнопку **Выйти из администратора** в верхнем правом углу.

2. В верхнем правом углу нажмите меню **+ Новое** и обратите внимание, что вы можете задавать вопросы, выполнять SQL-запросы и создавать dashboards:

    <Image size="sm" img={metabase_03} alt="Новое меню Metabase, показывающее варианты создания вопросов, SQL-запросов и dashboards" border />

3. Например, вот SQL-запрос, выполненный на таблице с именем `uk_price_paid`, который возвращает среднюю цену, уплаченную по годам с 1995 по 2022:

    <Image size="md" img={metabase_04} alt="Редактор SQL Metabase, показывающий запрос к данным UK Price Paid" border />

## 5. Задайте вопрос {#5-ask-a-question}

1. Нажмите на **+ Новое** и выберите **Вопрос**. Обратите внимание, что вы можете построить вопрос, начав с базы данных и таблицы. Например, следующий вопрос задается к таблице с именем `uk_price_paid` в базе данных `default`. Вот простой вопрос, который вычисляет среднюю цену по городам в графстве Большой Манчестер:

    <Image size="md" img={metabase_06} alt="Интерфейс конструктора вопросов Metabase с данными о ценах в Великобритании" border />

2. Нажмите кнопку **Визуализировать**, чтобы увидеть результаты в табличном представлении.

    <Image size="md" img={metabase_07} alt="Визуализация Metabase, показывающая табличные результаты средних цен по городам" border />

3. Под результатами нажмите кнопку **Визуализация**, чтобы изменить визуализацию на столбчатую диаграмму (или любой другой доступный вариант):

    <Image size="md" img={metabase_08} alt="Визуализация круговой диаграммы Metabase средних цен по городам в Большом Манчестере" border />

## Узнайте больше {#learn-more}

Найдите больше информации о Metabase и о том, как создавать dashboards, <a href="https://www.metabase.com/docs/latest/" target="_blank">посетив документацию Metabase</a>.
