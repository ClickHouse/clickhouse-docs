---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio — это бесплатный инструмент SQL.'
title: 'Подключите QStudio к ClickHouse'
---

import ConnectionDetails from '@site/i18n/ru/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключите QStudio к ClickHouse

<CommunityMaintainedBadge/>

QStudio — это бесплатный GUI для SQL, который позволяет запускать SQL-скрипты, легко просматривать таблицы, строить графики и экспортировать результаты. Он работает на всех операционных системах и с любыми базами данных.

QStudio подключается к ClickHouse с использованием JDBC.

## 1. Соберите ваши данные ClickHouse {#1-gather-your-clickhouse-details}

QStudio использует JDBC через HTTP(S) для подключения к ClickHouse; вам понадобятся:

- endpoint
- номер порта
- имя пользователя
- пароль

<ConnectionDetails />

## 2. Скачайте QStudio {#2-download-qstudio}

QStudio доступен по адресу https://www.timestored.com/qstudio/download/

## 3. Добавьте базу данных {#3-add-a-database}

- Когда вы впервые откроете QStudio, нажмите на меню **Server->Add Server** или на кнопку добавления сервера на панели инструментов.
- Затем укажите данные:

<Image img={qstudio_add_connection} size="lg" border alt="Экран настройки подключения базы данных QStudio с настройками подключения к ClickHouse" />

1.   Тип сервера: Clickhouse.com
2.    Обратите внимание, что для хоста вы ДОЛЖНЫ включить https://
    Хост: https://abc.def.clickhouse.cloud
    Порт: 8443
3.  Имя пользователя: default
    Пароль: `XXXXXXXXXXX`
 4. Нажмите Добавить

Если QStudio обнаружит, что у вас не установлен драйвер JDBC для ClickHouse, он предложит загрузить его для вас:

## 4. Выполнение запросов к ClickHouse {#4-query-clickhouse}

- Откройте редактор запросов и выполните запрос. Вы можете выполнять запросы с помощью
- Ctrl + e - Запускает выделенный текст
- Ctrl + Enter - Запускает текущую строку

- Пример запроса:

<Image img={qstudio_running_query} size="lg" border alt="Интерфейс QStudio, показывающий выполнение примерного SQL-запроса к базе данных ClickHouse" />

## Следующие шаги {#next-steps}

Посетите [QStudio](https://www.timestored.com/qstudio), чтобы узнать о возможностях QStudio, и [документацию ClickHouse](https://clickhouse.com/docs), чтобы узнать о возможностях ClickHouse.
