---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'подключение', 'интеграция', 'ui']
description: 'Draxlr — это инструмент бизнес-аналитики для визуализации и анализа данных.'
title: 'Подключение Draxlr к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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

Draxlr предлагает интуитивно понятный интерфейс для подключения к базе данных ClickHouse, позволяя вашей команде за считанные минуты исследовать данные, визуализировать их и публиковать полученные инсайты. В этом руководстве описаны шаги по установлению успешного подключения.



## 1. Получите учетные данные ClickHouse {#1-get-your-clickhouse-credentials}

<ConnectionDetails />


## 2. Подключение Draxlr к ClickHouse {#2--connect-draxlr-to-clickhouse}

1. Нажмите кнопку **Connect a Database** на панели навигации.

2. Выберите **ClickHouse** из списка доступных баз данных и нажмите «Далее».

3. Выберите один из сервисов хостинга и нажмите «Далее».

4. Введите произвольное имя в поле **Connection Name**.

5. Укажите параметры подключения в форме.

<Image
  size='md'
  img={draxlr_01}
  alt='Форма подключения Draxlr с параметрами конфигурации базы данных ClickHouse'
  border
/>

6. Нажмите кнопку **Next** и дождитесь установления соединения. При успешном подключении откроется страница с таблицами.


## 4. Изучение данных {#4-explore-your-data}

1. Нажмите на одну из таблиц в списке.

2. Откроется страница просмотра данных таблицы.

3. Вы можете добавлять фильтры, выполнять объединения и сортировать данные.

<Image
  size='md'
  img={draxlr_02}
  alt='Интерфейс просмотра данных Draxlr с фильтрами и параметрами сортировки'
  border
/>

4. Также можно использовать кнопку **Graph** и выбрать тип графика для визуализации данных.

<Image
  size='md'
  img={draxlr_05}
  alt='Параметры визуализации графиков Draxlr для данных ClickHouse'
  border
/>


## 4. Использование SQL-запросов {#4-using-sql-queries}

1. Нажмите кнопку Explore на панели навигации.

2. Нажмите кнопку **Raw Query** и введите запрос в текстовое поле.

<Image
  size='md'
  img={draxlr_03}
  alt='Интерфейс SQL-запросов Draxlr для ClickHouse'
  border
/>

3. Нажмите кнопку **Execute Query**, чтобы просмотреть результаты.


## 4. Сохранение запроса {#4-saving-you-query}

1. После выполнения запроса нажмите кнопку **Save Query**.

<Image
  size='md'
  img={draxlr_04}
  alt='Диалоговое окно сохранения запроса Draxlr с параметрами дашборда'
  border
/>

2. Вы можете указать имя запроса в текстовом поле **Query Name** и выбрать папку для его категоризации.

3. Вы также можете использовать параметр **Add to dashboard**, чтобы добавить результат на дашборд.

4. Нажмите кнопку **Save**, чтобы сохранить запрос.


## 5. Создание дашбордов {#5-building-dashboards}

1. Нажмите кнопку **Dashboards** на панели навигации.

<Image
  size='md'
  img={draxlr_06}
  alt='Интерфейс управления дашбордами Draxlr'
  border
/>

2. Добавить новый дашборд можно, нажав кнопку **Add +** на левой боковой панели.

3. Чтобы добавить новый виджет, нажмите кнопку **Add** в правом верхнем углу.

4. Выберите запрос из списка сохранённых запросов, укажите тип визуализации и нажмите кнопку **Add Dashboard Item**.


## Узнать больше {#learn-more}

Чтобы узнать больше о Draxlr, посетите [документацию Draxlr](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928).
