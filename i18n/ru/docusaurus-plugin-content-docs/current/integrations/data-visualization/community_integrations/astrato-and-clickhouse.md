---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato приносит в предприятия и data‑бизнесы подлинную самообслуживаемую BI, передавая аналитику в руки каждого пользователя и позволяя им создавать собственные дашборды, отчеты и data‑приложения, чтобы отвечать на вопросы по данным без помощи IT. Astrato ускоряет внедрение, повышает скорость принятия решений и объединяет аналитику, встроенную аналитику, ввод данных и data‑приложения на одной платформе. Astrato объединяет действия и аналитику в едином решении, вводит живой write-back, позволяет взаимодействовать с ML‑моделями, ускорять аналитику с помощью AI и выходить за рамки простых дашбордов благодаря поддержке pushdown SQL в Astrato.'
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

Astrato использует Pushdown SQL для прямых запросов к ClickHouse Cloud или локальным развёртываниям. Это означает, что вы получаете доступ ко всем необходимым данным, пользуясь ведущей в отрасли производительностью ClickHouse.



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

- Нажмите **Test Connection**. Если подключение выполнено успешно, задайте подключению **имя** и нажмите **Next.**

- Настройте **права доступа пользователей** к подключению и нажмите **connect.**

<Image
  size='md'
  img={astrato_3_user_access}
  alt='Права доступа пользователей при подключении Astrato к ClickHouse'
  border
/>

- Подключение и представление данных созданы.

:::note
Если создается дубликат, к имени источника данных добавляется временная метка.
:::


## Создание семантической модели / представления данных {#creating-a-semantic-model--data-view}

В нашем редакторе представлений данных вы увидите все свои таблицы и схемы в ClickHouse. Выберите некоторые из них, чтобы начать.

<Image
  size='lg'
  img={astrato_4a_clickhouse_data_view}
  alt='Подключение Astrato к ClickHouse: Доступ пользователя'
  border
/>

Теперь, когда вы выбрали данные, перейдите к определению **представления данных**. Нажмите «Определить» в правом верхнем углу веб-страницы.

Здесь вы можете выполнять объединения данных, а также **создавать управляемые измерения и меры** — это идеально для обеспечения согласованности бизнес-логики в различных командах.

<Image
  size='lg'
  img={astrato_4b_clickhouse_data_view_joins}
  alt='Подключение Astrato к ClickHouse: Доступ пользователя'
  border
/>

**Astrato интеллектуально предлагает варианты объединений** на основе ваших метаданных, включая использование ключей в ClickHouse. Эти предложенные объединения упрощают начало работы с вашими хорошо управляемыми данными ClickHouse, избавляя от необходимости изобретать велосипед. Мы также отображаем **качество объединений**, чтобы вы могли подробно изучить все предложения от Astrato.

<Image
  size='lg'
  img={astrato_4c_clickhouse_completed_data_view}
  alt='Подключение Astrato к ClickHouse: Доступ пользователя'
  border
/>


## Создание дашборда {#creating-a-dashboard}

Всего за несколько шагов вы можете создать свой первый график в Astrato.

1. Откройте панель визуализаций
2. Выберите визуализацию (давайте начнем со столбчатой диаграммы)
3. Добавьте измерение(я)
4. Добавьте меру(ы)

<Image
  size='lg'
  img={astrato_5a_clickhouse_build_chart}
  alt='Подключение Astrato к ClickHouse: Доступ пользователя'
  border
/>

### Просмотр генерируемого SQL для каждой визуализации {#view-generated-sql-supporting-each-visualization}

Прозрачность и точность — основа Astrato. Мы обеспечиваем видимость каждого генерируемого запроса, что позволяет вам сохранять полный контроль. Все вычисления выполняются непосредственно в ClickHouse, используя его высокую скорость и обеспечивая надежную безопасность и управление.

<Image
  size='lg'
  img={astrato_5b_clickhouse_view_sql}
  alt='Подключение Astrato к ClickHouse: Доступ пользователя'
  border
/>

### Пример готового дашборда {#example-completed-dashboard}

Красивый полноценный дашборд или приложение для работы с данными теперь в шаге от вас. Чтобы увидеть больше примеров того, что мы создали, загляните в нашу галерею демонстраций на сайте. https://astrato.io/gallery

<Image
  size='lg'
  img={astrato_5c_clickhouse_complete_dashboard}
  alt='Подключение Astrato к ClickHouse: Доступ пользователя'
  border
/>
