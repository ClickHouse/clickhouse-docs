---
slug: '/integrations/draxlr'
sidebar_label: Draxlr
sidebar_position: 131
description: 'Draxlr является инструментом бизнес-аналитики с визуализацией данных'
title: 'Подключение Draxlr к ClickHouse'
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
doc_type: guide
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Draxlr к ClickHouse

<CommunityMaintainedBadge/>

Draxlr предлагает интуитивно понятный интерфейс для подключения к вашей базе данных ClickHouse, позволяя вашей команде исследовать, визуализировать и публиковать идеи за считанные минуты. В этом руководстве будут описаны шаги для успешного подключения.

## 1. Получите свои учетные данные ClickHouse {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. Подключите Draxlr к ClickHouse {#2--connect-draxlr-to-clickhouse}

1. Нажмите кнопку **Подключить базу данных** на панели навигации.

2. Выберите **ClickHouse** из списка доступных баз данных и нажмите далее.

3. Выберите одну из услуг хостинга и нажмите далее.

4. В поле **Имя подключения** используйте любое имя.

5. Добавьте данные для подключения в форму.

  <Image size="md" img={draxlr_01} alt="Форма подключения Draxlr, показывающая параметры конфигурации базы данных ClickHouse" border />

6. Нажмите кнопку **Далее** и дождитесь установления соединения. Если соединение успешно, вы увидите страницу с таблицами.

## 4. Изучите свои данные {#4-explore-your-data}

1. Нажмите на одну из таблиц в списке.

2. Вы перейдете на страницу исследования, чтобы увидеть данные в таблице.

3. Вы можете начать добавлять фильтры, делать соединения и добавлять сортировку к своим данным.

  <Image size="md" img={draxlr_02} alt="Интерфейс исследования данных Draxlr с опциями фильтрации и сортировки" border />

4. Вы также можете использовать кнопку **График** и выбрать тип графика для визуализации данных.

  <Image size="md" img={draxlr_05} alt="Опции визуализации графиков Draxlr для данных ClickHouse" border />

## 4. Использование SQL-запросов {#4-using-sql-queries}

1. Нажмите на кнопку Исследовать на панели навигации.

2. Нажмите кнопку **Сырой запрос** и введите ваш запрос в текстовую область.

  <Image size="md" img={draxlr_03} alt="Интерфейс SQL-запросов Draxlr для ClickHouse" border />

3. Нажмите кнопку **Выполнить запрос**, чтобы увидеть результаты.

## 4. Сохранение вашего запроса {#4-saving-you-query}

1. После выполнения вашего запроса нажмите кнопку **Сохранить запрос**.

  <Image size="md" img={draxlr_04} alt="Диалоговое окно сохранения запроса Draxlr с опциями для панели управления" border />

2. Вы можете задать имя для запроса в текстовом поле **Имя запроса** и выбрать папку для его категоризации.

3. Вы также можете использовать опцию **Добавить в панель управления**, чтобы добавить результат на панель управления.

4. Нажмите кнопку **Сохранить**, чтобы сохранить запрос.

## 5. Создание панелей управления {#5-building-dashboards}

1. Нажмите на кнопку **Панели управления** на панели навигации.

  <Image size="md" img={draxlr_06} alt="Интерфейс управления панелями управления Draxlr" border />

2. Вы можете добавить новую панель, нажав на кнопку **Добавить +** в левой боковой панели.

3. Чтобы добавить новый виджет, нажмите кнопку **Добавить** в правом верхнем углу.

4. Вы можете выбрать запрос из списка сохранённых запросов и выбрать тип визуализации, затем нажмите кнопку **Добавить элемент панели управления**.

## Узнать больше {#learn-more}
Чтобы узнать больше о Draxlr, вы можете посетить [документацию Draxlr](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928).