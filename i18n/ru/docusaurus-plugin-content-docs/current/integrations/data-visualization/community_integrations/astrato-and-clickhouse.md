---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato предоставляет по‑настоящему самостоятельную (Self-Service) BI для предприятий и data-бизнесов, передавая аналитику в руки каждого пользователя и позволяя им создавать собственные дашборды, отчеты и data apps, чтобы отвечать на вопросы к данным без участия IT. Astrato ускоряет внедрение, повышает скорость принятия решений и объединяет аналитику, встроенную аналитику, ввод данных и data apps на одной платформе. Astrato объединяет действия и аналитику в одном решении, обеспечивает работу в режиме live write-back, позволяет взаимодействовать с моделями ML, ускоряет аналитику с помощью AI — выходите за рамки простых дашбордов благодаря поддержке pushdown SQL в Astrato.'
title: 'Подключение Astrato к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import astrato_1_dataconnection from '@site/static/images/integrations/data-visualization/astrato_1_dataconnection.png';
import astrato_2a_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2a_clickhouse_connection.png';
import astrato_2b_clickhouse_connection from '@site/static/images/integrations/data-visualization/astrato_2b_clickhouse_connection.png';
import astrato_3_user_access from '@site/static/images/integrations/data-visualization/astrato_3_user_access.png';
import astrato_4a_clickhouse_data_view from '@site/static/images/integrations/data-visualization/astrato_4a_clickhouse_data_view.png';
import astrato_4b_clickhouse_data_view_joins from '@site/static/images/integrations/data-visualization/astrato_4b_clickhouse_data_view_joins.png';
import astrato_4c_clickhouse_completed_data_view from '@site/static/images/integrations/data-visualization/astrato_4c_clickhouse_completed_data_view.png';
import astrato_5a_clickhouse_build_chart from '@site/static/images/integrations/data-visualization/astrato_5a_clickhouse_build_chart.png';
import astrato_5b_clickhouse_view_sql from '@site/static/images/integrations/data-visualization/astrato_5b_clickhouse_view_sql.png';
import astrato_5c_clickhouse_complete_dashboard from '@site/static/images/integrations/data-visualization/astrato_5c_clickhouse_complete_dashboard.png';
import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Astrato к ClickHouse

<CommunityMaintainedBadge/>

Astrato использует Pushdown SQL для прямого выполнения запросов к ClickHouse Cloud или локальным развертываниям. Это означает, что вы можете получить доступ ко всем необходимым данным с опорой на лидирующую в отрасли производительность ClickHouse.



## Необходимые данные для подключения {#connection-data-required}

При настройке подключения к данным вам потребуется знать:

- Параметры подключения: имя хоста, порт

- Учетные данные базы данных: имя пользователя, пароль

<ConnectionDetails />


## Создание подключения к данным ClickHouse {#creating-the-data-connection-to-clickhouse}

- Выберите **Data** на боковой панели и перейдите на вкладку **Data Connection**
  (или перейдите по ссылке: https://app.astrato.io/data/sources)
  ​
- Нажмите кнопку **New Data Connection** в правом верхнем углу экрана.

<Image
  size='sm'
  img={astrato_1_dataconnection}
  alt='Подключение данных Astrato'
  border
/>

- Выберите **ClickHouse**.

<Image
  size='sm'
  img={astrato_2a_clickhouse_connection}
  alt='Подключение Astrato к ClickHouse'
  border
/>

- Заполните обязательные поля в диалоговом окне подключения.

<Image
  size='sm'
  img={astrato_2b_clickhouse_connection}
  alt='Обязательные поля для подключения Astrato к ClickHouse'
  border
/>

- Нажмите **Test Connection**. Если подключение выполнено успешно, задайте **имя** подключения и нажмите **Next.**

- Настройте **права доступа пользователей** к подключению и нажмите **connect.**

<Image
  size='md'
  img={astrato_3_user_access}
  alt='Права доступа пользователей при подключении Astrato к ClickHouse'
  border
/>

- Подключение и представление данных созданы.

:::note
Если создаётся дубликат, к имени источника данных добавляется временная метка.
:::


## Создание семантической модели / представления данных {#creating-a-semantic-model--data-view}

В редакторе Data View вы увидите все ваши таблицы и схемы в ClickHouse — выберите нужные для начала работы.

<Image
  size='lg'
  img={astrato_4a_clickhouse_data_view}
  alt='Подключение Astrato к ClickHouse — доступ пользователей'
  border
/>

После выбора данных перейдите к определению **представления данных**. Нажмите «Define» в правом верхнем углу страницы.

Здесь вы можете объединять данные, а также **создавать управляемые измерения и меры** — это идеальное решение для обеспечения единообразия бизнес-логики в разных командах.

<Image
  size='lg'
  img={astrato_4b_clickhouse_data_view_joins}
  alt='Подключение Astrato к ClickHouse — доступ пользователей'
  border
/>

**Astrato интеллектуально предлагает объединения**, используя ваши метаданные и ключи в ClickHouse. Предлагаемые объединения позволяют быстро начать работу с хорошо структурированными данными ClickHouse, не изобретая велосипед. Мы также показываем **качество объединений**, чтобы вы могли детально изучить все предложения от Astrato.

<Image
  size='lg'
  img={astrato_4c_clickhouse_completed_data_view}
  alt='Подключение Astrato к ClickHouse — доступ пользователей'
  border
/>


## Создание дашборда {#creating-a-dashboard}

Всего за несколько шагов вы можете создать свой первый график в Astrato.

1. Откройте панель визуализаций
2. Выберите визуализацию (начнём со столбчатой диаграммы)
3. Добавьте измерение(я)
4. Добавьте показатель(и)

<Image
  size='lg'
  img={astrato_5a_clickhouse_build_chart}
  alt='Astrato подключение к ClickHouse — доступ пользователя'
  border
/>

### Просмотр сгенерированного SQL для каждой визуализации {#view-generated-sql-supporting-each-visualization}

Прозрачность и точность — основа Astrato. Мы обеспечиваем видимость каждого сгенерированного запроса, позволяя вам сохранять полный контроль. Все вычисления выполняются непосредственно в ClickHouse, используя преимущества его скорости при сохранении надёжной безопасности и управления.

<Image
  size='lg'
  img={astrato_5b_clickhouse_view_sql}
  alt='Astrato подключение к ClickHouse — доступ пользователя'
  border
/>

### Пример готового дашборда {#example-completed-dashboard}

Красивый полноценный дашборд или приложение для работы с данными — уже совсем близко. Чтобы увидеть больше наших разработок, посетите демонстрационную галерею на нашем сайте: https://astrato.io/gallery

<Image
  size='lg'
  img={astrato_5c_clickhouse_complete_dashboard}
  alt='Astrato подключение к ClickHouse — доступ пользователя'
  border
/>
