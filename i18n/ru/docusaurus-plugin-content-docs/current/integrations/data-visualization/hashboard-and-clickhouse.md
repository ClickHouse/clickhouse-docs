---
slug: '/integrations/hashboard'
sidebar_label: Hashboard
sidebar_position: 132
description: 'Hashboard — это надежная аналитическая платформа, которая может быть'
title: 'Соединение ClickHouse с Hashboard'
keywords: ['clickhouse', 'Hashboard', 'connect', 'integrate', 'ui', 'analytics']
doc_type: guide
---
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';
import hashboard_01 from '@site/static/images/integrations/data-visualization/hashboard_01.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение ClickHouse к Hashboard

<CommunityMaintainedBadge/>

[Hashboard](https://hashboard.com) — это интерактивный инструмент для исследования данных, который позволяет любому в вашей организации отслеживать метрики и открывать доступные для действий инсайты. Hashboard выполняет живые SQL-запросы к вашей базе данных ClickHouse и особенно полезен для случаев самообслуживания и ад-хок исследования данных.

<Image size="md" img={hashboard_01} alt="Интерфейс исследователя данных Hashboard, показывающий интерактивный конструктор запросов и визуализацию" border />

<br/>

Этот гид проведет вас через этапы подключения Hashboard к вашей инстанции ClickHouse. Эта информация также доступна в [документации по интеграции ClickHouse от Hashboard](https://docs.hashboard.com/docs/database-connections/clickhouse).

## Предварительные требования {#pre-requisites}

- База данных ClickHouse, размещенная либо на вашей инфраструктуре, либо в [ClickHouse Cloud](https://clickhouse.com/).
- [Учетная запись Hashboard](https://hashboard.com/getAccess) и проект.

## Этапы подключения Hashboard к ClickHouse {#steps-to-connect-hashboard-to-clickhouse}

### 1. Соберите ваши детали подключения {#1-gather-your-connection-details}

<ConnectionDetails />

### 2. Добавьте новое соединение базы данных в Hashboard {#2-add-a-new-database-connection-in-hashboard}

1. Перейдите к вашему [проекту Hashboard](https://hashboard.com/app).
2. Откройте страницу Настроек, нажав на иконку шестеренки в боковом навигационном меню.
3. Нажмите `+ Новое соединение с базой данных`.
4. В модальном окне выберите "ClickHouse."
5. Заполните поля **Имя подключения**, **Хост**, **Порт**, **Имя пользователя**, **Пароль** и **База данных** информацией, собранной ранее.
6. Нажмите "Тест", чтобы проверить, что соединение настроено успешно.
7. Нажмите "Добавить".

Ваша база данных ClickHouse теперь подключена к Hashboard, и вы можете продолжить создание [Моделей данных](https://docs.hashboard.com/docs/data-modeling/add-data-model), [Исследований](https://docs.hashboard.com/docs/visualizing-data/explorations), [Метрик](https://docs.hashboard.com/docs/metrics) и [Панелей мониторинга](https://docs.hashboard.com/docs/dashboards). См. соответствующую документацию Hashboard для получения дополнительных сведений об этих функциях.

## Узнать больше {#learn-more}

Для более продвинутых функций и устранения неполадок посетите [документацию Hashboard](https://docs.hashboard.com/).