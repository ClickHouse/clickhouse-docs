---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio — бесплатный инструмент для работы с SQL.'
title: 'Подключение QStudio к ClickHouse'
doc_type: 'guide'
keywords: ['qstudio', 'sql client', 'database tool', 'query tool', 'ide']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение QStudio к ClickHouse

<CommunityMaintainedBadge/>

QStudio — это бесплатный графический интерфейс для работы с SQL, который позволяет выполнять SQL-скрипты, удобно просматривать таблицы, строить графики и экспортировать результаты. Работает на любой операционной системе и с любой базой данных.

QStudio подключается к ClickHouse с помощью JDBC.



## 1. Соберите данные для подключения к ClickHouse {#1-gather-your-clickhouse-details}

QStudio использует JDBC через HTTP(S) для подключения к ClickHouse; вам потребуются:

- адрес сервера (endpoint)
- номер порта
- имя пользователя
- пароль

<ConnectionDetails />


## 2. Загрузка QStudio {#2-download-qstudio}

QStudio можно скачать по адресу https://www.timestored.com/qstudio/download/


## 3. Добавление базы данных {#3-add-a-database}

- При первом запуске QStudio выберите в меню **Server->Add Server** или нажмите кнопку добавления сервера на панели инструментов.
- Затем укажите параметры подключения:

<Image
  img={qstudio_add_connection}
  size='lg'
  border
  alt='Экран настройки подключения к базе данных в QStudio с параметрами подключения к ClickHouse'
/>

1.  Server Type: Clickhouse.com
2.  Важно: в поле Host ОБЯЗАТЕЛЬНО указывайте https://
    Host: https://abc.def.clickhouse.cloud
    Port: 8443
3.  Username: default
    Password: `XXXXXXXXXXX`
4.  Нажмите Add

Если QStudio обнаружит, что драйвер ClickHouse JDBC не установлен, будет предложено загрузить его автоматически:


## 4. Запросы к ClickHouse {#4-query-clickhouse}

- Откройте редактор запросов и выполните запрос. Запросы можно выполнять следующими способами:
- Ctrl + e — выполняет выделенный текст
- Ctrl + Enter — выполняет текущую строку

- Пример запроса:

<Image
  img={qstudio_running_query}
  size='lg'
  border
  alt='Интерфейс QStudio с примером выполнения SQL-запроса к базе данных ClickHouse'
/>


## Следующие шаги {#next-steps}

Изучите [QStudio](https://www.timestored.com/qstudio), чтобы узнать о возможностях QStudio, и [документацию ClickHouse](https://clickhouse.com/docs), чтобы узнать о возможностях ClickHouse.
