---
sidebar_label: 'Astrato'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Astrato']
description: 'Astrato приносит настоящий BI для самообслуживания предприятиям и бизнесам с данными, предоставляя аналитические инструменты каждому пользователю, позволяя им создавать собственные панели мониторинга, отчеты и приложения для данных, чтобы отвечать на вопросы о данных без помощи ИТ. Astrato ускоряет внедрение, упрощает принятие решений и объединяет аналитику, встроенную аналитику, ввод данных и приложения для данных на одной платформе. Astrato объединяет действия и аналитику, вводит live запись, взаимодействует с моделями ML, ускоряет вашу аналитику с помощью ИИ – выходите за пределы построения панелей мониторинга благодаря поддержке pushdown SQL в Astrato.'
title: 'Подключение Astrato к ClickHouse'
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

Astrato использует Pushdown SQL для прямого запроса ClickHouse Cloud или локальных развертываний. Это означает, что вы можете получить доступ ко всем необходимым данным, используя производительность ClickHouse, которая является одной из лучших в отрасли.

## Требуемые данные для подключения {#connection-data-required}

При настройке вашего подключения к данным вам понадобится знать:

- Подключение к данным: Имя хоста, Порт

- Учетные данные базы данных: Имя пользователя, Пароль

<ConnectionDetails />

## Создание подключения к ClickHouse {#creating-the-data-connection-to-clickhouse}

- Выберите **Data** в боковом меню и выберите вкладку **Data Connection**
(или перейдите по этой ссылке: https://app.astrato.io/data/sources)

- Нажмите на кнопку **New Data Connection** в правом верхнем углу экрана.

<Image size="sm" img={astrato_1_dataconnection} alt="Подключение данных Astrato" border />

- Выберите **ClickHouse**.

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Подключение данных Astrato к ClickHouse" border />

- Заполните обязательные поля в диалоговом окне подключения

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Обязательные поля для подключения Astrato к ClickHouse" border />

- Нажмите **Test Connection**. Если подключение успешно, дайте соединению **имя** и нажмите **Next.**

- Установите **доступ пользователя** к соединению данных и нажмите **connect.**

<Image size="md" img={astrato_3_user_access} alt="Доступ пользователя Astrato к ClickHouse" border />

- Соединение создано, и создана представление данных.

:::note
если создается дубликат, к имени источника данных добавляется временная метка.
:::

## Создание семантической модели / представления данных {#creating-a-semantic-model--data-view}

В нашем редакторе представления данных вы увидите все ваши Таблицы и Схемы в ClickHouse, выберите некоторые, чтобы начать.

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Представление данных Astrato для ClickHouse" border />

Теперь, когда вы выбрали данные, перейдите к определению **представления данных**. Нажмите определить в правом верхнем углу веб-страницы.

Здесь вы можете объединять данные, а также **создавать управляемые измерения и признаки** - идеально для обеспечения консистентности бизнес-логики в различных командах.

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Объединения данных Astrato для ClickHouse" border />

**Astrato умно предлагает объединения** с использованием ваших метаданных, включая использование ключей в ClickHouse. Наши предложенные объединения делают процесс простым, работая с вашими хорошо управляемыми данными ClickHouse, без необходимости изобретать велосипед. Мы также показываем **качество объединения**, чтобы вы могли рассмотреть все предложения подробно от Astrato.

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Законченные представления данных Astrato для ClickHouse" border />

## Создание панели мониторинга {#creating-a-dashboard}

Всего за несколько шагов вы можете создать свой первый график в Astrato.
1. Откройте панель визуализаций
2. Выберите визуализацию (начнем с столбчатой диаграммы)
3. Добавьте размерность(и)
4. Добавьте величину(и)

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Построение графика в Astrato" border />


### Просмотр сгенерированного SQL, поддерживающего каждую визуализацию {#view-generated-sql-supporting-each-visualization}

Прозрачность и точность являются основными принципами Astrato. Мы обеспечиваем видимость каждого сгенерированного запроса, позволяя вам сохранять полный контроль. Все вычисления происходят непосредственно в ClickHouse, используя его скорость при сохранении надежной безопасности и управления.

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Сгенерированный SQL для визуализаций Astrato" border />


### Пример завершенной панели мониторинга {#example-completed-dashboard}

Красивая завершенная панель мониторинга или приложение для данных уже не так далеко. Чтобы увидеть больше из того, что мы создали, перейдите в нашу галерею демонстраций на нашем веб-сайте. https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Завершенная панель мониторинга Astrato" border />
