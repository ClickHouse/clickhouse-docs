---
description: 'Обзор сетевых интерфейсов, драйверов и инструментов для подключения к
  ClickHouse'
keywords: ['clickhouse', 'network', 'interfaces', 'http', 'tcp', 'grpc', 'command-line',
  'client', 'jdbc', 'odbc', 'driver']
sidebar_label: 'Обзор'
slug: /interfaces/overview
title: 'Драйверы и интерфейсы'
doc_type: 'reference'
---

# Драйверы и интерфейсы

ClickHouse предоставляет два сетевых интерфейса (их при необходимости можно использовать поверх TLS для дополнительной безопасности):

- [HTTP](http.md), который хорошо документирован и прост для прямого использования.
- [Нативный TCP](../interfaces/tcp.md), который имеет меньшие накладные расходы.

В большинстве случаев рекомендуется использовать соответствующий инструмент или библиотеку вместо прямого взаимодействия с этими интерфейсами. В ClickHouse официально поддерживаются следующие инструменты:

- [Клиент командной строки](../interfaces/cli.md)
- [JDBC-драйвер](../interfaces/jdbc.md)
- [ODBC-драйвер](../interfaces/odbc.md)
- [Клиентская библиотека C++](../interfaces/cpp.md)

ClickHouse также поддерживает два RPC-протокола:

- [Протокол gRPC](grpc.md), специально разработанный для ClickHouse.
- [Apache Arrow Flight](arrowflight.md).

Сервер ClickHouse предоставляет встроенные визуальные интерфейсы для опытных пользователей:

- Play UI: откройте `/play` в браузере;
- Advanced Dashboard: откройте `/dashboard` в браузере;
- Просмотрщик бинарных символов для инженеров ClickHouse: откройте `/binary` в браузере;

Существует также широкий спектр сторонних библиотек для работы с ClickHouse:

- [Клиентские библиотеки](../interfaces/third-party/client-libraries.md)
- [Интеграции](../interfaces/third-party/integrations.md)
- [Визуальные интерфейсы](../interfaces/third-party/gui.md)