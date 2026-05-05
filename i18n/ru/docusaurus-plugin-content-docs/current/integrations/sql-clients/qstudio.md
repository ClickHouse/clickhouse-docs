---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio — это бесплатный SQL-клиент.'
title: 'Подключение QStudio к ClickHouse'
doc_type: 'guide'
keywords: ['qstudio', 'sql-клиент', 'инструмент для работы с базой данных', 'инструмент для выполнения запросов', 'ide']
integration:
  - support_level: 'community'
  - category: 'sql_client'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение QStudio к ClickHouse \{#connect-qstudio-to-clickhouse\}

<CommunityMaintainedBadge/>

QStudio — это бесплатный графический интерфейс SQL-клиента, который позволяет запускать SQL-скрипты, легко просматривать таблицы, строить графики и экспортировать результаты. Он работает на всех операционных системах и с любой базой данных.

QStudio подключается к ClickHouse по JDBC.

## 1. Соберите сведения о вашем ClickHouse \{#1-gather-your-clickhouse-details\}

QStudio использует JDBC поверх HTTP(S) для подключения к ClickHouse. Для этого вам понадобятся:

- endpoint
- номер порта
- имя пользователя
- пароль

<ConnectionDetails />

## 2. Скачайте QStudio \{#2-download-qstudio\}

QStudio доступен по адресу https://www.timestored.com/qstudio/download/

## 3. Добавление базы данных \{#3-add-a-database\}

- Когда вы впервые откроете QStudio, выберите в меню **Server->Add Server** или нажмите кнопку добавления сервера на панели инструментов.
- Затем укажите параметры:

<Image img={qstudio_add_connection} size="lg" border alt="Окно настройки подключения к базе данных QStudio с параметрами подключения к ClickHouse" />

1.   Server Type: Clickhouse.com
2.    Обратите внимание: в Host ОБЯЗАТЕЛЬНО должен быть указан протокол https://
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.  Username: default
    Password: `XXXXXXXXXXX`
 4. Нажмите Add

Если QStudio обнаружит, что у вас не установлен драйвер ClickHouse JDBC, он предложит скачать их для вас:

## 4. Выполнение запросов к ClickHouse \{#4-query-clickhouse\}

- Откройте редактор запросов и выполните запрос. Вы можете запускать запросы с помощью:
- Ctrl + E — выполняет выделенный текст
- Ctrl + Enter — выполняет текущую строку

- Пример запроса:

<Image img={qstudio_running_query} size="lg" border alt="Интерфейс QStudio, демонстрирующий выполнение примерного SQL-запроса в базе данных ClickHouse" />

## Дальнейшие шаги \{#next-steps\}

Подробнее о возможностях QStudio см. на странице [QStudio](https://www.timestored.com/qstudio), а о возможностях ClickHouse — в [документации ClickHouse](https://clickhouse.com/docs).