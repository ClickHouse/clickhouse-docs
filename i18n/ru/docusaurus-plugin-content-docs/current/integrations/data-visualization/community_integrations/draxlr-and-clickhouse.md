---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'подключение', 'интеграция', 'интерфейс']
description: 'Draxlr — это инструмент для бизнес-аналитики с возможностями визуализации и анализа данных.'
title: 'Подключение Draxlr к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
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

<CommunityMaintainedBadge />

Draxlr предлагает интуитивно понятный интерфейс для подключения к базе данных ClickHouse, который позволяет вашей команде изучать данные, визуализировать их и публиковать аналитические выводы за считанные минуты. В этом руководстве описаны шаги, необходимые для успешного подключения.

## 1. Получите учетные данные ClickHouse \{#1-get-your-clickhouse-credentials\}

<ConnectionDetails />

## 2.  Подключите Draxlr к ClickHouse \{#2--connect-draxlr-to-clickhouse\}

1. Нажмите кнопку **Connect a Database** на панели навигации.

2. Выберите **ClickHouse** из списка доступных баз данных и нажмите **Next**.

3. Выберите один из вариантов хостинга и нажмите **Next**.

4. Укажите любое имя в поле **Connection Name**.

5. Заполните форму данными подключения.

<Image size="md" img={draxlr_01} alt="Форма подключения Draxlr с параметрами конфигурации базы данных ClickHouse" border />

6. Нажмите кнопку **Next** и дождитесь, пока подключение будет установлено. Если подключение выполнено успешно, откроется страница со списком таблиц.

## 4. Explore данные \{#4-explore-your-data\}

1. Нажмите на одну из таблиц в списке.

2. Откроется страница Explore, где можно увидеть данные в таблице.

3. Вы можете добавлять фильтры, выполнять JOIN и сортировать данные.

<Image size="md" img={draxlr_02} alt="Интерфейс просмотра данных Draxlr с фильтрами и параметрами сортировки" border />

4. Вы также можете нажать кнопку **Graph** и выбрать тип графика для визуализации данных.

<Image size="md" img={draxlr_05} alt="Параметры визуализации графиков Draxlr для данных ClickHouse" border />

## 4. Использование SQL-запросов \{#4-using-sql-queries\}

1. Нажмите кнопку Explore на панели навигации.

2. Нажмите кнопку **Raw Query** и введите запрос в текстовое поле.

<Image size="md" img={draxlr_03} alt="Интерфейс SQL-запросов Draxlr для ClickHouse" border />

3. Нажмите кнопку **Execute Query**, чтобы просмотреть результаты.

## 4. Сохранение запроса \{#4-saving-you-query\}

1. После выполнения запроса нажмите кнопку **Save Query**.

<Image size="md" img={draxlr_04} alt="Диалог сохранения запроса Draxlr с параметрами панели мониторинга" border />

2. В текстовом поле **Query Name** можно указать имя запроса и выбрать папку для его категории.

3. Также можно использовать параметр **Add to dashboard**, чтобы добавить результат на панель мониторинга.

4. Нажмите кнопку **Save**, чтобы сохранить запрос.

## 5. Создание панелей мониторинга \{#5-building-dashboards\}

1. Нажмите кнопку **Панели мониторинга** на панели навигации.

<Image size="md" img={draxlr_06} alt="Интерфейс управления панелями мониторинга Draxlr" border />

2. Чтобы добавить новую панель мониторинга, нажмите кнопку **Добавить +** на левой боковой панели.

3. Чтобы добавить новый виджет, нажмите кнопку **Добавить** в правом верхнем углу.

4. Выберите запрос из списка сохранённых запросов, укажите тип визуализации и нажмите кнопку **Добавить элемент панели мониторинга**.

## Подробнее \{#learn-more\}

Подробнее о Draxlr см. на сайте [документации Draxlr](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928).