---
slug: /integrations/qstudio
sidebar_label: 'QStudio'
description: 'QStudio — это бесплатный SQL-инструмент.'
title: 'Подключите QStudio к ClickHouse'
doc_type: 'guide'
keywords: ['qstudio', 'sql-клиент', 'инструмент для работы с базами данных', 'инструмент для выполнения запросов', 'ide']
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import qstudio_add_connection from '@site/static/images/integrations/sql-clients/qstudio-add-connection.png';
import qstudio_running_query from '@site/static/images/integrations/sql-clients/qstudio-running-query.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение QStudio к ClickHouse

<CommunityMaintainedBadge/>

QStudio — это бесплатный SQL GUI, который позволяет запускать SQL-скрипты, удобно просматривать таблицы, строить графики и экспортировать результаты. Он работает на всех операционных системах с любой СУБД.

QStudio подключается к ClickHouse через JDBC.



## 1. Соберите параметры подключения к ClickHouse {#1-gather-your-clickhouse-details}

QStudio использует JDBC поверх HTTP(S) для подключения к ClickHouse; вам потребуются:

- endpoint
- номер порта
- имя пользователя
- пароль

<ConnectionDetails />



## 2. Скачайте QStudio {#2-download-qstudio}

QStudio доступен для скачивания по адресу https://www.timestored.com/qstudio/download/



## 3. Добавьте базу данных {#3-add-a-database}

- Когда вы впервые откроете QStudio, нажмите пункт меню **Server -> Add Server** или кнопку добавления сервера на панели инструментов.
- Затем задайте следующие параметры:

<Image img={qstudio_add_connection} size="lg" border alt="Экран настройки подключения базы данных QStudio с параметрами подключения к ClickHouse" />

1.   Server Type: Clickhouse.com  
2.   Обратите внимание: в поле Host ОБЯЗАТЕЛЬНО указывайте `https://`  
     Host: https://abc.def.clickhouse.cloud  
     Port: 8443  
3.   Username: default  
     Password: `XXXXXXXXXXX`  
4.   Нажмите Add

Если QStudio обнаружит, что у вас не установлен JDBC‑драйвер ClickHouse, он предложит загрузить его для вас:



## 4. Запрос к ClickHouse {#4-query-clickhouse}

- Откройте редактор запросов и выполните запрос. Вы можете запускать запросы с помощью:
- Ctrl + E — выполняет выделенный текст
- Ctrl + Enter — выполняет текущую строку

- Пример запроса:

<Image img={qstudio_running_query} size="lg" border alt="Интерфейс QStudio, показывающий выполнение примерного SQL-запроса к базе данных ClickHouse" />



## Следующие шаги {#next-steps}

Ознакомьтесь с [QStudio](https://www.timestored.com/qstudio), чтобы узнать о возможностях QStudio, и с [документацией ClickHouse](https://clickhouse.com/docs), чтобы узнать о возможностях ClickHouse.
