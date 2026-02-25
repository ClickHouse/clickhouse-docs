---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato предоставляет настоящую самообслуживаемую BI‑аналитику для предприятий и дата‑бизнеса, передавая аналитику в руки каждого пользователя и позволяя им самостоятельно создавать дашборды, отчёты и data apps, отвечать на вопросы к данным без помощи ИТ‑специалистов. Astrato ускоряет внедрение, повышает скорость принятия решений и объединяет аналитику, embedded analytics, ввод данных и data apps на единой платформе. Astrato объединяет действия и аналитику, предлагает живой write-back, позволяет взаимодействовать с моделями ML, ускоряет аналитику с помощью AI — выходите за рамки простых дашбордов благодаря поддержке pushdown SQL в Astrato.'
title: 'Подключение Astrato к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
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


# Подключение Astrato к ClickHouse \{#connecting-astrato-to-clickhouse\}

<CommunityMaintainedBadge/>

Astrato использует Pushdown SQL для выполнения запросов напрямую в ClickHouse Cloud или локальные развертывания ClickHouse. Это означает, что вы можете получать доступ ко всем необходимым данным, пользуясь лидирующей в отрасли производительностью ClickHouse.

## Необходимые данные для подключения \{#connection-data-required\}

При настройке подключения к источнику данных вам потребуется знать:

- Подключение к данным: Hostname, Port

- Учетные данные базы данных: Username, Password

<ConnectionDetails />

## Создание подключения данных к ClickHouse \{#creating-the-data-connection-to-clickhouse\}

- В боковой панели выберите **Data** и откройте вкладку **Data Connection**
(или перейдите по ссылке: https://app.astrato.io/data/sources)
​
- Нажмите кнопку **New Data Connection** в правом верхнем углу экрана.

<Image size="sm" img={astrato_1_dataconnection} alt="Подключение данных Astrato" border />

- Выберите **ClickHouse**.

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Подключение данных Astrato к ClickHouse" border />

- Заполните обязательные поля в диалоговом окне подключения.

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Astrato подключение к ClickHouse обязательные поля" border />

- Нажмите **Test Connection**. Если подключение успешно, задайте **имя** для подключения данных и нажмите **Next.**

- Настройте **user access** к подключению данных и нажмите **connect.**

<Image size="md" img={astrato_3_user_access} alt="Astrato подключение к ClickHouse User Access" border />

-   Подключение создано, и создано представление данных (dataview).

:::note
Если создан дубликат, к имени источника данных добавляется временная метка.
:::

## Создание семантической модели / представления данных \{#creating-a-semantic-model--data-view\}

В нашем редакторе Data View вы увидите все свои таблицы и схемы в ClickHouse; выберите некоторые из них, чтобы начать работу.

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Подключение Astrato к ClickHouse, доступ пользователя" border />

Теперь, когда вы выбрали данные, перейдите к определению **представления данных**. Нажмите кнопку **Define** в правом верхнем углу веб‑страницы.

Здесь вы можете объединять данные, а также **создавать управляемые измерения и показатели** — это оптимально для обеспечения единообразия бизнес‑логики в различных командах.

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Подключение Astrato к ClickHouse, доступ пользователя" border />

**Astrato интеллектуально предлагает соединения** на основе ваших метаданных, в том числе используя ключи в ClickHouse. Наши рекомендуемые соединения упрощают вам начальный этап работы с хорошо управляемыми данными ClickHouse, без необходимости изобретать все заново. Мы также показываем **качество соединений**, чтобы у вас была возможность детально просмотреть все предложения в Astrato.

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Подключение Astrato к ClickHouse, доступ пользователя" border />

## Создание дашборда \{#creating-a-dashboard\}

Всего за несколько шагов вы можете создать свой первый график в Astrato.

1. Откройте панель визуализации
2. Выберите тип визуализации (начнём с Column Bar Chart)
3. Добавьте измерение(я)
4. Добавьте меру(ы)

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Astrato connect to ClickHouse User Access" border />

### Просмотр сгенерированного SQL для каждой визуализации \{#view-generated-sql-supporting-each-visualization\}

Прозрачность и точность лежат в основе Astrato. Мы делаем каждый сгенерированный запрос видимым, позволяя вам сохранять полный контроль. Все вычисления выполняются непосредственно в ClickHouse, что позволяет использовать его высокую скорость при сохранении надежной безопасности и управляемости.

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Astrato connect to ClickHouse User Access" border />

### Пример готовой панели мониторинга \{#example-completed-dashboard\}

Красивая, полностью оформленная панель мониторинга или data‑приложение уже совсем рядом. Чтобы увидеть больше примеров того, что мы создали, перейдите в нашу галерею демонстраций на сайте: https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Доступ пользователей в Astrato при подключении к ClickHouse" border />