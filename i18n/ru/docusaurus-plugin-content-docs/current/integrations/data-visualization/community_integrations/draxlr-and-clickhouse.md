---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'подключение', 'интеграция', 'ui']
description: 'Draxlr — инструмент бизнес-аналитики для визуализации и анализа данных.'
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

# Подключение Draxlr к ClickHouse {#connecting-draxlr-to-clickhouse}

<CommunityMaintainedBadge/>

Draxlr предоставляет интуитивно понятный интерфейс для подключения к вашей базе данных ClickHouse, позволяя вашей команде исследовать данные, визуализировать их и публиковать полученные аналитические материалы за считанные минуты. В этом руководстве пошагово описан процесс настройки успешного подключения.

## 1. Получите учетные данные для доступа к ClickHouse {#1-get-your-clickhouse-credentials}

<ConnectionDetails />

## 2.  Подключение Draxlr к ClickHouse {#2--connect-draxlr-to-clickhouse}

1. Нажмите кнопку **Connect a Database** на панели навигации.

2. Выберите **ClickHouse** из списка доступных баз данных и нажмите Next.

3. Выберите один из вариантов размещения и нажмите Next.

4. Укажите любое имя в поле **Connection Name**.

5. Заполните форму параметрами подключения.

<Image size="md" img={draxlr_01} alt="Форма подключения Draxlr с параметрами конфигурации базы данных ClickHouse" border />

6. Нажмите кнопку **Next** и дождитесь установления подключения. При успешном подключении откроется страница таблиц.

## 4. Исследуйте данные {#4-explore-your-data}

1. Нажмите на одну из таблиц в списке.

2. Вы перейдёте на страницу исследования, где сможете просмотреть данные в таблице.

3. Вы можете добавлять фильтры, выполнять операции `JOIN` и настраивать сортировку данных.

<Image size="md" img={draxlr_02} alt="Интерфейс исследования данных Draxlr с параметрами фильтрации и сортировки" border />

4. Вы также можете использовать кнопку **Graph** и выбрать тип графика для визуализации данных.

<Image size="md" img={draxlr_05} alt="Варианты визуализации графиков Draxlr для данных ClickHouse" border />

## 4. Использование SQL-запросов {#4-using-sql-queries}

1. Нажмите кнопку Explore на панели навигации.

2. Нажмите кнопку **Raw Query** и введите запрос в текстовое поле.

<Image size="md" img={draxlr_03} alt="Интерфейс выполнения SQL-запросов Draxlr для ClickHouse" border />

3. Нажмите кнопку **Execute Query**, чтобы увидеть результаты.

## 4. Сохранение запроса {#4-saving-you-query}

1. После выполнения запроса нажмите кнопку **Save Query**.

<Image size="md" img={draxlr_04} alt="Диалоговое окно сохранения запроса Draxlr с параметрами панели мониторинга" border />

2. В текстовом поле **Query Name** вы можете задать имя запросу и выбрать папку для его размещения.

3. Вы также можете использовать опцию **Add to dashboard**, чтобы добавить результат на панель мониторинга.

4. Нажмите кнопку **Save**, чтобы сохранить запрос.

## 5. Создание дашбордов {#5-building-dashboards}

1. Нажмите кнопку **Dashboards** на панели навигации.

<Image size="md" img={draxlr_06} alt="Интерфейс управления дашбордами Draxlr" border />

2. Чтобы добавить новый дашборд, нажмите кнопку **Add +** на левой боковой панели.

3. Чтобы добавить новый виджет, нажмите кнопку **Add** в правом верхнем углу.

4. Выберите запрос из списка сохранённых запросов, укажите тип визуализации, затем нажмите кнопку **Add Dashboard Item**.

## Подробнее {#learn-more}

Дополнительную информацию о Draxlr можно найти в [документации Draxlr](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928).