---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: [ 'clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato приносит настоящий Self-Service BI для предприятий и бизнесов с данными, предоставляя аналитику в руки каждого пользователя, позволяя им создавать собственные панели мониторинга, отчеты и приложения для работы с данными, что позволяет отвечать на вопросы по данным без помощи ИТ. Astrato ускоряет внедрение, ускоряет принятие решений и объединяет аналитику, встроенную аналитику, ввод данных и приложения для работы с данными на одной платформе. Astrato объединяет действия и аналитику в одном, вводит возможность актуализации данных, взаимодействует с моделями машинного обучения, ускоряет вашу аналитику с помощью ИИ – выходите за рамки создания панелей мониторинга благодаря поддержке pushdown SQL в Astrato.'
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


# Подключение Astrato к ClickHouse

Astrato использует Pushdown SQL для выполнения запросов к ClickHouse Cloud или локальным развертываниям напрямую. Это означает, что вы можете получить доступ ко всем необходимым данным, обеспечиваемым лидерским по производительности ClickHouse.

## Необходимые данные для подключения {#connection-data-required}

При настройке вашего подключения к данным вам нужно знать:

- Подключение к данным: имя хоста, порт

- Учетные данные базы данных: имя пользователя, пароль

<ConnectionDetails />

## Создание подключения к ClickHouse {#creating-the-data-connection-to-clickhouse}

- Выберите **Данные** в боковой панели и выберите вкладку **Подключение к данным**
(или перейдите по этой ссылке: https://app.astrato.io/data/sources)
​
- Нажмите на кнопку **Новое подключение к данным** в правом верхнем углу экрана.

<img  src={astrato_1_dataconnection}  class="image"  alt="Подключение данных Astrato"  style={{width:'50%',  'background-color':  'transparent'}}/>

<br/>

- Выберите **ClickHouse**.
<img  src={astrato_2a_clickhouse_connection}  class="image"  alt="Подключение данных Astrato к ClickHouse"  style={{width:'50%',  'background-color':  'transparent'}}/>

- Заполните обязательные поля в диалоговом окне подключения

<img  src={astrato_2b_clickhouse_connection}  class="image"  alt="Astrato подключение к ClickHouse обязательные поля"  style={{width:'50%',  'background-color':  'transparent'}}/>

- Нажмите **Проверить подключение**. Если подключение успешно, дайте подключению к данным **имя** и нажмите **Далее.**

- Установите **доступ пользователя** к подключению данных и нажмите **подключиться.**
​
<img  src={astrato_3_user_access}  class="image"  alt="Доступ пользователя Astrato к ClickHouse"  style={{width:'50%',  'background-color':  'transparent'}}/>

-   Подключение создано, и созданный представление данных.

:::note
если создается дубликат, к имени источника данных добавляется отметка времени.
:::

## Создание семантической модели / представления данных {#creating-a-semantic-model--data-view}

В нашем редакторе представления данных вы увидите все ваши таблицы и схемы в ClickHouse, выберите некоторые из них, чтобы начать.

<img  src={astrato_4a_clickhouse_data_view}  class="image"  alt="Astrato доступ пользователя к ClickHouse"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

Теперь, когда вы выбрали ваши данные, перейдите к определению **представления данных**. Нажмите определить в правом верхнем углу веб-страницы.

Здесь вы можете объединять данные, а также **создавать управляемые измерения и показатели** - идеальные для обеспечения согласованности бизнес-логики в различных командах.

<img  src={astrato_4b_clickhouse_data_view_joins}  class="image"  alt="Astrato доступ пользователя к ClickHouse"  style={{width:'75%',  'background-color':  'transparent'}}/>
<br/>

**Astrato интеллектуально предлагает соединения** используя ваши метаданные, включая использование ключей в ClickHouse. Наши предлагаемые соединения упрощают вам начало работы, основываясь на ваших хорошо управляемых данных ClickHouse, не изобретая колесо. Мы также показываем вам **качество соединения**, чтобы у вас была возможность подробно рассмотреть все предложения от Astrato.
<br/>
<img  src={astrato_4c_clickhouse_completed_data_view}  class="image"  alt="Astrato доступ пользователя к ClickHouse"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>

## Создание панели мониторинга {#creating-a-dashboard}

Всего за несколько шагов вы можете создать свой первый график в Astrato.
1. Откройте панель визуализаций
2. Выберите визуализацию (начнем с колоночной диаграммы)
3. Добавьте измерение(я)
4. Добавьте показатель(и)

<img  src={astrato_5a_clickhouse_build_chart}  class="image"  alt="Astrato доступ пользователя к ClickHouse"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### Просмотр сгенерированного SQL, поддерживающего каждую визуализацию {#view-generated-sql-supporting-each-visualization}

Прозрачность и точность – это основа Astrato. Мы гарантируем, что каждый сгенерированный запрос виден, позволяя вам сохранять полный контроль. Все вычисления происходят непосредственно в ClickHouse, используя его скорость, оставаясь при этом с надежной безопасностью и управляемостью.

<img  src={astrato_5b_clickhouse_view_sql}  class="image"  alt="Astrato доступ пользователя к ClickHouse"  style={{width:'75%',  'background-color':  'transparent'}}/><br/>


### Пример завершенной панели мониторинга {#example-completed-dashboard}

Прекрасная завершенная панель мониторинга или приложение для работы с данными теперь не так уж далеко. Чтобы увидеть больше того, что мы создали, перейдите в нашу галерею демо на нашем сайте. https://astrato.io/gallery

<img  src={astrato_5c_clickhouse_complete_dashboard}  class="image"  alt="Astrato доступ пользователя к ClickHouse"  style={{width:'75%',  'background-color':  'transparent'}}/>
