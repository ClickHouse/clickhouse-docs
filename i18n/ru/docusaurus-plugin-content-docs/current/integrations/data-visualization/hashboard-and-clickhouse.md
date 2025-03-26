---
sidebar_label: 'Хэшборд'
sidebar_position: 132
slug: /integrations/hashboard
keywords: ['clickhouse', 'Хэшборд', 'подключение', 'интеграция', 'ui', 'аналитика']
description: 'Хэшборд - это надежная аналитическая платформа, которую можно легко интегрировать с ClickHouse для аналитики данных в реальном времени.'
title: 'Подключение ClickHouse к Хэшборду'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение ClickHouse к Хэшборду

<CommunityMaintainedBadge/>

[Хэшборд](https://hashboard.com) - это интерактивный инструмент для исследования данных, который позволяет любому в вашей организации отслеживать метрики и открывать действенные инсайты. Хэшборд выполняет живые SQL-запросы к вашей базе данных ClickHouse и особенно полезен для случаев самообслуживания и импровизированного исследования данных.


<Image size="md" img={hashboard_01} alt="Интерфейс исследователя данных Хэшборда, показывающий интерактивный конструктор запросов и визуализацию" border />

<br/>

Этот гайд проведет вас через шаги подключения Хэшборда к вашей инстанции ClickHouse. Эта информация также доступна в [документации по интеграции ClickHouse Хэшборда](https://docs.hashboard.com/docs/database-connections/clickhouse).


## Предварительные условия {#pre-requisites}

- База данных ClickHouse, размещенная либо на вашей инфраструктуре, либо на [ClickHouse Cloud](https://clickhouse.com/).
- [Учетная запись Хэшборда](https://hashboard.com/getAccess) и проект.

## Шаги по подключению Хэшборда к ClickHouse {#steps-to-connect-hashboard-to-clickhouse}

### 1. Соберите ваши детали подключения {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Добавьте новое соединение базы данных в Хэшборде {#2-add-a-new-database-connection-in-hashboard}

1. Перейдите к вашему [проекту Хэшборда](https://hashboard.com/app).
2. Откройте страницу настроек, нажав на иконку шестеренки в боковой навигационной панели.
3. Нажмите `+ Новое соединение базы данных`.
4. В модальном окне выберите "ClickHouse."
5. Заполните поля **Имя подключения**, **Хост**, **Порт**, **Имя пользователя**, **Пароль** и **База данных** информацией, собранной ранее.
6. Нажмите "Проверить", чтобы удостовериться, что соединение настроено успешно.
7. Нажмите "Добавить"

Ваша база данных ClickHouse теперь подключена к Хэшборду, и вы можете продолжить создание [Моделей данных](https://docs.hashboard.com/docs/data-modeling/add-data-model), [Исследований](https://docs.hashboard.com/docs/visualizing-data/explorations), [Метрик](https://docs.hashboard.com/docs/metrics) и [Панелей мониторинга](https://docs.hashboard.com/docs/dashboards). См. соответствующую документацию Хэшборда для получения более подробной информации о этих функциях.

## Узнать больше {#learn-more}

Для более сложных функций и устранения неполадок, посетите [документацию Хэшборда](https://docs.hashboard.com/).
