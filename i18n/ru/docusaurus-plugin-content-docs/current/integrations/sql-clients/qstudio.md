---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio — это бесплатный SQL инструмент.'
title: 'Подключение QStudio к ClickHouse'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение QStudio к ClickHouse

<CommunityMaintainedBadge/>

QStudio — это бесплатный графический интерфейс SQL, который позволяет запускать SQL скрипты, легко просматривать таблицы, строить графики и экспортировать результаты. Он работает на каждой операционной системе с любой базой данных.

QStudio подключается к ClickHouse с использованием JDBC.

## 1. Соберите ваши данные ClickHouse {#1-gather-your-clickhouse-details}

QStudio использует JDBC через HTTP(S) для подключения к ClickHouse; вам необходимо:

- endpoint
- номер порта
- имя пользователя
- пароль

<ConnectionDetails />

## 2. Скачать QStudio {#2-download-qstudio}

QStudio доступен по адресу https://www.timestored.com/qstudio/download/

## 3. Добавить базу данных {#3-add-a-database}

- Когда вы впервые откроете QStudio, нажмите на опции меню **Server->Add Server** или на кнопку добавления сервера на панели инструментов.
- Затем укажите данные:

<Image img={qstudio_add_connection} size="lg" border alt="Экран настройки подключения базы данных QStudio, показывающий настройки подключения к ClickHouse" />

1.   Тип сервера: Clickhouse.com
2.   Обратите внимание, что для Host вы ДОЛЖНЫ указать https://
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.   Имя пользователя: default
    Пароль: `XXXXXXXXXXX`
4. Нажмите Добавить

Если QStudio обнаружит, что драйвер JDBC для ClickHouse не установлен, он предложит скачать его для вас:

## 4. Запрос к ClickHouse {#4-query-clickhouse}

- Откройте редактор запросов и выполните запрос. Вы можете выполнять запросы с помощью
- Ctrl + e - Выполнить выделенный текст
- Ctrl + Enter - Выполнить текущую строку

- Пример запроса:

<Image img={qstudio_running_query} size="lg" border alt="Интерфейс QStudio, показывающий выполнение примера SQL запроса к базе данных ClickHouse" />

## Следующие шаги {#next-steps}

Смотрите [QStudio](https://www.timestored.com/qstudio), чтобы узнать о возможностях QStudio, и [документацию ClickHouse](https://clickhouse.com/docs), чтобы узнать о возможностях ClickHouse.
