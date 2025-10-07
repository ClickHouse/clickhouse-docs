---
'sidebar_label': 'Astrato'
'sidebar_position': 131
'slug': '/integrations/astrato'
'keywords':
- 'clickhouse'
- 'Power BI'
- 'connect'
- 'integrate'
- 'ui'
- 'data apps'
- 'data viz'
- 'embedded analytics'
- 'Astrato'
'description': 'Astrato приносит истинную бизнес-аналитику (BI) для предприятий и
  бизнесов данных, предоставляя аналитику в руки каждого пользователя, позволяя им
  создавать свои собственные панели, отчеты и приложения для данных, что позволяет
  отвечать на вопросы о данных без помощи ИТ. Astrato ускоряет принятие решений, ускоряет
  процесс принятия решений и объединяет аналитику, встроенную аналитику, ввод данных
  и приложения для данных в одной платформе. Astrato объединяет действия и аналитику
  в одном, вводит live-представление, взаимодействует с ML моделями, ускоряет вашу
  аналитику с помощью ИИ – выходите за рамки панелей благодаря поддержке pushdown
  SQL в Astrato.'
'title': 'Подключение Astrato к ClickHouse'
'doc_type': 'guide'
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


# Подключение Astrato к ClickHouse

<CommunityMaintainedBadge/>

Astrato использует Pushdown SQL для запроса к ClickHouse Cloud или локальным развертываниям напрямую. Это означает, что вы можете получить доступ ко всему необходимому вам данным, используя производительность ClickHouse, признанную в отрасли.

## Необходимые данные для соединения {#connection-data-required}

При настройке вашего соединения с данными вам понадобятся следующие данные:

- Соединение с данными: Имя хоста, Порт

- Учетные данные базы данных: Имя пользователя, Пароль

<ConnectionDetails />

## Создание соединения с ClickHouse {#creating-the-data-connection-to-clickhouse}

- Выберите **Данные** в боковой панели и перейдите на вкладку **Соединение с данными**
(или перейдите по этой ссылке: https://app.astrato.io/data/sources)
​
- Нажмите на кнопку **Новое соединение с данными** в верхнем правом углу экрана.

<Image size="sm" img={astrato_1_dataconnection} alt="Соединение данных Astrato" border />

- Выберите **ClickHouse**.

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Соединение с данными ClickHouse Astrato" border />

- Заполните обязательные поля в диалоговом окне соединения.

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Обязательные поля для подключения Astrato к ClickHouse" border />

- Нажмите **Проверить соединение**. Если соединение успешно, дайте соединению с данными **имя** и нажмите **Далее.**

- Установите **доступ пользователя** к соединению с данными и нажмите **подключиться.**

<Image size="md" img={astrato_3_user_access} alt="Доступ пользователя Astrato к ClickHouse" border />

-   Соединение создано, и создано представление данных.

:::note
если дубликат будет создан, к имени источника данных будет добавлен временной штамп.
:::

## Создание семантической модели / представления данных {#creating-a-semantic-model--data-view}

В редакторе представления данных вы увидите все свои таблицы и схемы в ClickHouse, выберите некоторые для начала.

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Доступ пользователя Astrato к ClickHouse" border />

Теперь, когда вы выбрали свои данные, перейдите к определению **представления данных**. Нажмите "определить" в правом верхнем углу веб-страницы.

Здесь вы можете соединять данные, а также **создавать регулируемые размеры и меры** - идеально для обеспечения согласованности в бизнес-логике среди разных команд.

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Доступ пользователя Astrato к ClickHouse" border />

**Astrato интеллектуально предлагает соединения** с использованием ваших метаданных, включая использование ключей в ClickHouse. Наши предложенные соединения облегчают вам старт, работая с вашими хорошо управляемыми данными ClickHouse, без необходимости изобретать велосипед. Мы также показываем вам **качество соединения**, чтобы у вас была возможность детально просмотреть все предложения от Astrato.

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Доступ пользователя Astrato к ClickHouse" border />

## Создание панели управления {#creating-a-dashboard}

Всего за несколько шагов вы можете создать свой первый график в Astrato.
1. Откройте панель визуализаций
2. Выберите визуализацию (давайте начнем с столбчатой диаграммы)
3. Добавьте размер(ы)
4. Добавьте мера(ы)

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Доступ пользователя Astrato к ClickHouse" border />

### Просмотр сгенерированного SQL для каждой визуализации {#view-generated-sql-supporting-each-visualization}

Прозрачность и точность лежат в основе Astrato. Мы гарантируем, что каждый сгенерированный запрос виден, что позволяет вам сохранять полный контроль. Все вычисления происходят непосредственно в ClickHouse, используя его скорость при поддержании надежной безопасности и управления.

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Доступ пользователя Astrato к ClickHouse" border />

### Пример завершенной панели управления {#example-completed-dashboard}

Прекрасная завершенная панель управления или приложение для данных уже близко. Чтобы увидеть больше того, что мы построили, посетите нашу демо-галерею на нашем сайте. https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Доступ пользователя Astrato к ClickHouse" border />
