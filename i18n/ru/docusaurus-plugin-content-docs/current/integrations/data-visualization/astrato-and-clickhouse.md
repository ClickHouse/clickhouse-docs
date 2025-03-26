---
sidebar_label: 'Астрато'
sidebar_position: 131
slug: /integrations/astrato
keywords: ['clickhouse', 'Power BI', 'connect', 'integrate', 'ui', 'data apps', 'data viz', 'embedded analytics', 'Астрато']
description: 'Астрато приносит настоящую самообслуживаемую бизнес-аналитику в предприятия и бизнесы, позволяя каждому пользователю строить свои собственные панели, отчеты и приложения для работы с данными, что позволяет отвечать на вопросы о данных без помощи ИТ. Астрато ускоряет внедрение, ускоряет принятие решений и объединяет аналитику, встроенную аналитику, ввод данных и приложения для работы с данными на одной платформе. Астрато объединяет действия и аналитику, вводит живую запись, взаимодействует с моделями машинного обучения, ускоряет вашу аналитику с помощью ИИ — выходите за пределы создания панелей, благодаря поддержке pushdown SQL в Астрато.'
title: 'Подключение Астрато к ClickHouse'
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


# Подключение Астрато к ClickHouse

<CommunityMaintainedBadge/>

Астрато использует Pushdown SQL для обращения к ClickHouse Cloud или локальным инсталляциям напрямую. Это означает, что вы можете получить доступ ко всем необходимым данным, используя передовую производительность ClickHouse.

## Необходимые данные для подключения {#connection-data-required}

При настройке вашего соединения с данными вам необходимо знать:

- Данные подключения: Имя хоста, Порт

- Учетные данные базы данных: Имя пользователя, Пароль

<ConnectionDetails />

## Создание подключения к ClickHouse {#creating-the-data-connection-to-clickhouse}

- Выберите **Данные** в боковой панели и нажмите на вкладку **Подключение данных** 
(или перейдите по этой ссылке: https://app.astrato.io/data/sources)
​
- Нажмите на кнопку **Новое подключение данных** в правом верхнем углу экрана.

<Image size="sm" img={astrato_1_dataconnection} alt="Подключение данных Астрато" border />

- Выберите **ClickHouse**.

<Image size="sm" img={astrato_2a_clickhouse_connection} alt="Подключение данных ClickHouse Астрато" border />

- Заполните обязательные поля в диалоговом окне подключения.

<Image size="sm" img={astrato_2b_clickhouse_connection} alt="Астрато подключение к ClickHouse обязательные поля" border />

- Нажмите **Проверить подключение**. Если подключение успешно, дайте имени вашему подключению данных и нажмите **Далее.**

- Установите **доступ пользователя** к подключению данных и нажмите **подключить.**

<Image size="md" img={astrato_3_user_access} alt="Подключение Астрато к ClickHouse Доступ пользователя" border />

- Подключение создано, и создан просмотр данных.

:::note
если создается дубликат, к имени источника данных добавляется временная метка.
:::

## Создание семантической модели / просмотра данных {#creating-a-semantic-model--data-view}

В редакторе Просмотра данных вы увидите все свои Таблицы и Схемы в ClickHouse, выберите несколько для начала.

<Image size="lg" img={astrato_4a_clickhouse_data_view} alt="Астрато подключение к ClickHouse Доступ пользователя" border />

Теперь, когда вы выбрали свои данные, перейдите к определению **просмотра данных**. Нажмите определить в верхнем правом углу веб-страницы.

Здесь вы можете объединять данные, а также **создавать управляемые измерения и показатели** - это идеально для обеспечения согласованности бизнес-логики в различных командах.

<Image size="lg" img={astrato_4b_clickhouse_data_view_joins} alt="Астрато подключение к ClickHouse Доступ пользователя" border />

**Астрато интеллектуально предлагает объединения** с использованием ваших метаданных, включая использование ключей в ClickHouse. Наши предложенные объединения облегчают вам начало работы, используя ваши хорошо управляемые данные ClickHouse, без переосмысления основ. Мы также показываем вам **качество объединения**, чтобы у вас была возможность подробно просмотреть все предложения от Астрато.

<Image size="lg" img={astrato_4c_clickhouse_completed_data_view} alt="Астрато подключение к ClickHouse Доступ пользователя" border />

## Создание панели мониторинга {#creating-a-dashboard}

Всего за несколько шагов вы можете создать свой первый график в Астрато.
1. Откройте панель визуализаций
2. Выберите визуализацию (начнем с Гистограммы)
3. Добавьте размерность(и)
4. Добавьте показатель(и)

<Image size="lg" img={astrato_5a_clickhouse_build_chart} alt="Астрато подключение к ClickHouse Доступ пользователя" border />

### Посмотреть сгенерированный SQL, поддерживающий каждую визуализацию {#view-generated-sql-supporting-each-visualization}

Прозрачность и точность лежат в основе Астрато. Мы гарантируем, что каждый сгенерированный запрос виден, что позволяет вам сохранять полный контроль. Все вычисления происходят напрямую в ClickHouse, используя его скорость при поддержании надежной безопасности и управления.

<Image size="lg" img={astrato_5b_clickhouse_view_sql} alt="Астрато подключение к ClickHouse Доступ пользователя" border />

### Пример завершенной панели мониторинга {#example-completed-dashboard}

Красивый завершенный дашборд или приложение для работы с данными теперь не далеко. Чтобы увидеть больше того, что мы создали, перейдите в нашу галерею демонстраций на нашем сайте. https://astrato.io/gallery

<Image size="lg" img={astrato_5c_clickhouse_complete_dashboard} alt="Астрато подключение к ClickHouse Доступ пользователя" border />
