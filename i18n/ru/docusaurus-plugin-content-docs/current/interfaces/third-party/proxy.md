---
slug: '/interfaces/third-party/proxy'
sidebar_label: Прокси
sidebar_position: 29
description: 'Описание доступных сторонних решений прокси для ClickHouse'
title: 'Прокси-серверы от сторонних разработчиков'
doc_type: reference
---
# Прокси-серверы от сторонних разработчиков

## chproxy {#chproxy}

[chproxy](https://github.com/Vertamedia/chproxy) — это HTTP-прокси и балансировщик нагрузки для базы данных ClickHouse.

Особенности:

- Маршрутизация по пользователю и кэширование ответов.
- Гибкие лимиты.
- Автоматическое обновление SSL-сертификатов.

Реализован на Go.

## KittenHouse {#kittenhouse}

[KittenHouse](https://github.com/VKCOM/kittenhouse) предназначен для локального прокси между ClickHouse и сервером приложений в случае, если невозможно или неудобно буферизовать данные INSERT на стороне вашего приложения.

Особенности:

- Буферизация данных в памяти и на диске.
- Маршрутизация по таблицам.
- Балансировка нагрузки и проверка состояния.

Реализован на Go.

## ClickHouse-Bulk {#clickhouse-bulk}

[ClickHouse-Bulk](https://github.com/nikepan/clickhouse-bulk) — это простой коллектор вставок для ClickHouse.

Особенности:

- Группировка запросов и отправка по порогу или интервалу.
- Несколько удаленных серверов.
- Основная аутентификация.

Реализован на Go.