---
description: 'Документация по интерфейсу Apache Arrow Flight в ClickHouse, который позволяет клиентам Flight SQL подключаться к ClickHouse'
sidebar_label: 'Интерфейс Arrow Flight'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Интерфейс Arrow Flight'
doc_type: 'reference'
---

# Интерфейс Apache Arrow Flight {#apache-arrow-flight-interface}

ClickHouse поддерживает интеграцию с протоколом [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) — высокопроизводительным RPC‑фреймворком, предназначенным для эффективной передачи колоночных данных с использованием формата Arrow IPC поверх gRPC.

Этот интерфейс позволяет клиентам Flight SQL выполнять запросы к ClickHouse и получать результаты в формате Arrow, обеспечивая высокую пропускную способность и низкую задержку для аналитических нагрузок.

## Возможности {#features}

* Выполнять SQL‑запросы по протоколу Arrow Flight SQL
* Передавать результаты запросов в потоковом режиме в формате Apache Arrow
* Интегрироваться с BI‑инструментами и прикладными решениями для работы с данными, поддерживающими Arrow Flight
* Обеспечивать легковесный и высокопроизводительный обмен данными по gRPC

## Ограничения {#limitations}

Интерфейс Arrow Flight в данный момент является экспериментальным и активно дорабатывается. Известные ограничения:

* Ограниченная поддержка сложных SQL-возможностей, специфичных для ClickHouse
* Еще не реализованы все операции с метаданными Arrow Flight SQL
* В эталонной реализации отсутствуют встроенная аутентификация и настройка TLS

Если вы столкнетесь с проблемами совместимости или хотите внести вклад, пожалуйста, [создайте issue](https://github.com/ClickHouse/ClickHouse/issues) в репозитории ClickHouse.

## Запуск сервера Arrow Flight {#running-server}

Чтобы включить сервер Arrow Flight в самоуправляемом экземпляре ClickHouse, добавьте следующую конфигурацию в конфигурационный файл сервера:

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

Перезапустите сервер ClickHouse. После успешного запуска вы должны увидеть в логах сообщение, похожее на следующее:

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```

## Подключение к ClickHouse через Arrow Flight SQL {#connecting-to-clickhouse}

Вы можете использовать любой клиент, который поддерживает Arrow Flight SQL. Например, с помощью `pyarrow`:

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```

## Совместимость {#compatibility}

Интерфейс Arrow Flight совместим с инструментами, которые поддерживают Arrow Flight SQL, включая собственные приложения, реализованные на:

* Python (`pyarrow`)
* Java (`arrow-flight`)
* C++ и других языках, совместимых с gRPC

Если для вашего инструмента доступен нативный коннектор ClickHouse (например, JDBC, ODBC), предпочтительнее использовать именно его, если только Arrow Flight не требуется специально для достижения нужной производительности или совместимости форматов.

## Отмена запросов {#query-cancellation}

Долго выполняющиеся запросы можно отменить, закрыв gRPC-соединение на стороне клиента. Поддержка более продвинутых возможностей отмены запланирована.

---

Для получения дополнительной информации см.:

* [Спецификацию Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [Задачу ClickHouse на GitHub №7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
