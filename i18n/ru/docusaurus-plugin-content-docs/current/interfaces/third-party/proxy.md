---
description: 'Описывает доступные сторонние прокси-решения для ClickHouse'
sidebar_label: 'Прокси'
sidebar_position: 29
slug: /interfaces/third-party/proxy
title: 'Прокси-серверы от сторонних разработчиков'
doc_type: 'reference'
---



# Прокси-серверы сторонних разработчиков {#proxy-servers-from-third-party-developers}



## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) — это HTTP‑прокси и балансировщик нагрузки для базы данных ClickHouse.

Возможности:

- Маршрутизация по пользователям и кэширование ответов.
- Гибкая система ограничений.
- Автоматическое обновление SSL‑сертификатов.

Реализован на Go.



## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) предназначен для использования в качестве локального прокси между ClickHouse и сервером приложения в тех случаях, когда буферизация данных INSERT на стороне приложения невозможна или неудобна.

Возможности:

- Буферизация данных в памяти и на диске.
- Маршрутизация по таблицам.
- Балансировка нагрузки и проверка состояния.

Реализован на Go.



## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) — это простой коллектор для вставки данных в ClickHouse.

Возможности:

- Группирует запросы и отправляет их при достижении порога или через заданные интервалы.
- Поддержка нескольких удалённых серверов.
- Базовая аутентификация.

Написан на Go.
