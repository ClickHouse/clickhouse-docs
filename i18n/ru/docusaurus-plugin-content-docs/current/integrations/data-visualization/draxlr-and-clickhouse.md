---
sidebar_label: Draxlr
sidebar_position: 131
slug: /integrations/draxlr
keywords: [clickhouse, Draxlr, connect, integrate, ui]
description: Draxlr — это инструмент бизнес-аналитики с визуализацией данных и аналитикой.
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';



# Подключение Draxlr к ClickHouse

Draxlr предлагает интуитивно понятный интерфейс для подключения к вашей базе данных ClickHouse, позволяя вашей команде исследовать, визуализировать и публиковать инсайты за считанные минуты. Этот гайд проведет вас через шаги для успешного подключения.


## 1. Получите ваши данные для доступа к ClickHouse {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. Подключите Draxlr к ClickHouse {#2--connect-draxlr-to-clickhouse}

1. Нажмите на кнопку **Connect a Database** в навигационной панели.

2. Выберите **ClickHouse** из списка доступных баз данных и нажмите "дальше".

3. Выберите один из хостинг-сервисов и нажмите "дальше".

4. Используйте любое имя в поле **Connection Name**.

5. Добавьте данные подключения в форму.

  <img src={draxlr_01} class="image" style={{width: '80%'}}  alt="Форма подключения" />

6. Нажмите на кнопку **Next** и дождитесь установки соединения. Если соединение успешно, вы увидите страницу таблиц.

## 4. Исследуйте ваши данные {#4-explore-your-data}

1. Нажмите на одну из таблиц в списке.

2. Это перенесет вас на страницу исследования, чтобы увидеть данные в таблице.

3. Вы можете начать добавлять фильтры, выполнять объединения и сортировку ваших данных.

  <img src={draxlr_02} class="image" style={{width: '80%'}}  alt="Форма подключения" />

4. Вы также можете использовать кнопку **Graph** и выбрать тип графика для визуализации данных.

  <img src={draxlr_05} class="image" style={{width: '80%'}}  alt="Форма подключения" />


## 4. Использование SQL-запросов {#4-using-sql-queries}

1. Нажмите на кнопку Explore в навигационной панели.

2. Нажмите кнопку **Raw Query** и введите ваш запрос в текстовом поле.

  <img src={draxlr_03} class="image" style={{width: '80%'}}  alt="Форма подключения" />

3. Нажмите на кнопку **Execute Query**, чтобы увидеть результаты.


## 4. Сохранение вашего запроса {#4-saving-you-query}

1. После выполнения вашего запроса нажмите кнопку **Save Query**.

  <img src={draxlr_04} class="image" style={{width: '80%'}}  alt="Форма подключения" />

2. Вы можете ввести имя запроса в текстовом поле **Query Name** и выбрать папку для его категории.

3. Вы также можете использовать вариант **Add to dashboard**, чтобы добавить результат на панель инструментов.

4. Нажмите кнопку **Save**, чтобы сохранить запрос.


## 5. Создание панелей мониторинга {#5-building-dashboards}

1. Нажмите на кнопку **Dashboards** в навигационной панели.

  <img src={draxlr_06} class="image" style={{width: '80%'}}  alt="Форма подключения" />

2. Вы можете добавить новую панель, нажав на кнопку **Add +** в левом боковом меню.

3. Чтобы добавить новый виджет, нажмите на кнопку **Add** в правом верхнем углу.

4. Вы можете выбрать запрос из списка сохраненных запросов и выбрать тип визуализации, затем нажмите кнопку **Add Dashboard Item**.

## Узнайте больше {#learn-more}
Чтобы узнать больше о Draxlr, вы можете посетить [документацию Draxlr](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928).
