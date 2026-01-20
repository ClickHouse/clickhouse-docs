---
description: 'Обзор сетевых интерфейсов, драйверов и инструментов подключения к
  ClickHouse'
keywords: ['clickhouse', 'network', 'interfaces', 'http', 'tcp', 'grpc', 'command-line',
  'client', 'jdbc', 'odbc', 'driver']
sidebar_label: 'Обзор'
slug: /interfaces/overview
title: 'Драйверы и интерфейсы'
doc_type: 'reference'
---

# Драйверы и интерфейсы \{#drivers-and-interfaces\}

ClickHouse предоставляет два сетевых интерфейса (их при необходимости можно защитить с помощью TLS для повышения безопасности):

* [HTTP](http.md), который хорошо задокументирован и прост для прямого использования.
* [Нативный TCP](../interfaces/tcp.md), который имеет меньшие накладные расходы.

В большинстве случаев рекомендуется использовать подходящий инструмент или библиотеку вместо прямого обращения к этим интерфейсам. ClickHouse официально поддерживает следующие варианты:

* [Клиент командной строки](/interfaces/cli)
* [JDBC-драйвер](/interfaces/jdbc)
* [ODBC-драйвер](/interfaces/odbc)
* [Клиентская библиотека C++](/interfaces/cpp)

ClickHouse также поддерживает два RPC-протокола:

* [Протокол gRPC](grpc.md), специально разработанный для ClickHouse.
* [Apache Arrow Flight](arrowflight.md).

Сервер ClickHouse предоставляет встроенные визуальные интерфейсы для опытных пользователей:

* Play UI: откройте `/play` в браузере;
* Advanced Dashboard: откройте `/dashboard` в браузере;
* Просмотрщик бинарных символов для инженеров ClickHouse: откройте `/binary` в браузере;

Также существует широкий набор сторонних библиотек для работы с ClickHouse:

* [Клиентские библиотеки](../../interfaces/third-party/client-libraries.md)
* [Интеграции](../../interfaces/third-party/integrations.md)
* [Визуальные интерфейсы](../../interfaces/third-party/gui.md)