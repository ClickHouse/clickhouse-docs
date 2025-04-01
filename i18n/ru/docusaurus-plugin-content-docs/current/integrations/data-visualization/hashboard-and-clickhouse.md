---
sidebar_label: 'Hashboard'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Hashboard', 'connect', 'integrate', 'ui', 'analytics']
description: 'Hashboard - это мощная аналитическая платформа, которую можно легко интегрировать с ClickHouse для анализа данных в реальном времени.'
title: 'Соединение ClickHouse с Hashboard'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Соединение ClickHouse с Hashboard

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) — это инструмент интерактивного исследования данных, который позволяет всем в вашей организации отслеживать метрики и находить практические инсайты. Hashboard отправляет живые SQL-запросы в вашу базу данных ClickHouse и особенно полезен для случаев самостоятельного, выборочного исследования данных.

<Image size="md" img={hashboard_01} alt="Интерфейс исследователя данных Hashboard, показывающий интерактивный генератор запросов и визуализацию" border />

<br/>

Этот гид проведет вас через шаги подключения Hashboard к вашему экземпляру ClickHouse. Эта информация также доступна в [документации интеграции ClickHouse Hashboard](https://docs.hashboard.com/docs/database-connections/clickhouse).

## Предварительные требования {#pre-requisites}

- База данных ClickHouse, размещенная либо на вашей инфраструктуре, либо на [ClickHouse Cloud](https://clickhouse.com/).
- [Учетная запись Hashboard](https://hashboard.com/getAccess) и проект.

## Шаги для подключения Hashboard к ClickHouse {#steps-to-connect-hashboard-to-clickhouse}

### 1. Соберите детали подключения {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Добавьте новое подключение к базе данных в Hashboard {#2-add-a-new-database-connection-in-hashboard}

1. Перейдите в ваш [проект Hashboard](https://hashboard.com/app).
2. Откройте страницу настроек, нажав на иконку шестеренки в боковой навигационной панели.
3. Нажмите `+ New Database Connection`.
4. В модальном окне выберите "ClickHouse."
5. Заполните поля **Connection Name**, **Host**, **Port**, **Username**, **Password** и **Database** информацией, собранной ранее.
6. Нажмите "Test", чтобы проверить, что соединение настроено успешно.
7. Нажмите "Add".

Теперь ваша база данных ClickHouse подключена к Hashboard, и вы можете продолжить с построением [Моделей данных](https://docs.hashboard.com/docs/data-modeling/add-data-model), [Исследований](https://docs.hashboard.com/docs/visualizing-data/explorations), [Метрик](https://docs.hashboard.com/docs/metrics) и [Дашбордов](https://docs.hashboard.com/docs/dashboards). Смотрите соответствующую документацию Hashboard для получения дополнительной информации об этих функциях.

## Узнайте больше {#learn-more}

Для получения более продвинутых функций и устранения возможных проблем посетите [документацию Hashboard](https://docs.hashboard.com/).
