---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato предоставляет компаниям и дата‑бизнесам полноценную модель Self-Service BI, передавая аналитические возможности в руки каждого пользователя и позволяя им самостоятельно создавать дашборды, отчёты и дата‑приложения и отвечать на вопросы по данным без помощи ИТ. Astrato ускоряет внедрение, повышает скорость принятия решений и объединяет аналитику, встроенную аналитику, ввод данных и дата‑приложения на одной платформе. Astrato объединяет действия и аналитику, поддерживает live write-back, позволяет взаимодействовать с ML‑моделями, ускорять аналитику с помощью ИИ и выходить за рамки классических дашбордов благодаря поддержке pushdown SQL в Astrato.'
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
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';

# Подключение Astrato к ClickHouse {#connecting-astrato-to-clickhouse}

<CommunityMaintainedBadge/>

Astrato использует технологию Pushdown SQL для прямого выполнения запросов к ClickHouse Cloud или локальным развертываниям ClickHouse. Это означает, что вы можете получать доступ ко всем необходимым данным, опираясь на ведущую в отрасли производительность ClickHouse.

## Необходимые данные для подключения {#connection-data-required}

При настройке подключения к данным вам потребуются:

- Подключение к данным: имя хоста, порт

- Учетные данные для базы данных: имя пользователя, пароль

<ConnectionDetails />

## Создание подключения данных к ClickHouse {#creating-the-data-connection-to-clickhouse}

- В боковой панели выберите **Data** и перейдите на вкладку **Data Connection**
(или откройте ссылку: https://app.astrato.io/data/sources)
​
- Нажмите кнопку **New Data Connection** в правом верхнем углу экрана.

<Image size="sm" img={astrato_1_dataconnection} alt="Подключение данных в Astrato" border />

- Выберите **ClickHouse**.

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Подключение Astrato к ClickHouse" border />

- Заполните обязательные поля в диалоговом окне подключения.

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Подключение Astrato к ClickHouse — обязательные поля" border />

- Нажмите **Test Connection**. Если подключение прошло успешно, задайте подключению данных **имя** и нажмите **Next.**

- Настройте **user access** к подключению данных и нажмите **connect.**

<Image size="md" img={astrato_3_user_access} alt="Подключение Astrato к ClickHouse — доступ пользователей" border />

-   Подключение создано, и создаётся представление данных (DataView).

:::note
Если создаётся дубликат, к имени источника данных добавляется метка времени (timestamp).
:::

## Создание семантической модели / представления данных {#creating-a-semantic-model--data-view}

В редакторе представления данных (Data View) вы увидите все свои таблицы и схемы (Schemas) в ClickHouse. Выберите нужные, чтобы начать.

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Подключение Astrato к ClickHouse User Access" border />

Теперь, когда вы выбрали данные, перейдите к определению **представления данных (data view)**. Нажмите кнопку **Define** в правом верхнем углу веб-страницы.

Здесь вы можете выполнять объединение данных, а также **создавать управляемые измерения и показатели** — это оптимально для обеспечения единообразия бизнес-логики в разных командах.

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Подключение Astrato к ClickHouse User Access" border />

**Astrato интеллектуально предлагает соединения (joins)**, используя ваши метаданные, включая ключи в ClickHouse. Наши предложенные соединения (joins) упрощают начальный этап работы с хорошо управляемыми данными ClickHouse, без необходимости изобретать все заново. Мы также показываем **качество соединений (join quality)**, чтобы у вас была возможность детально просмотреть все рекомендации Astrato.

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Подключение Astrato к ClickHouse User Access" border />

## Создание дашборда {#creating-a-dashboard}

Всего за несколько шагов вы можете построить свой первый график в Astrato.
1. Откройте панель визуализаций
2. Выберите тип визуализации (давайте начнем со столбчатой диаграммы Column Bar Chart)
3. Добавьте одно или несколько измерений
4. Добавьте одну или несколько метрик

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato connect to ClickHouse User Access" border />

### Просмотр сгенерированного SQL, лежащего в основе каждой визуализации {#view-generated-sql-supporting-each-visualization}

Прозрачность и точность лежат в основе Astrato. Мы делаем видимым каждый сгенерированный запрос, предоставляя вам полный контроль. Все вычисления выполняются непосредственно в ClickHouse, что позволяет воспользоваться его скоростью при сохранении надежного уровня безопасности и управляемости.

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato connect to ClickHouse User Access" border />

### Пример готового дашборда {#example-completed-dashboard}

Красивый и полноценный дашборд или data‑приложение уже совсем близко. Чтобы увидеть больше наших примеров, перейдите в нашу демо‑галерею на сайте: https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Astrato connect to ClickHouse User Access" border />
