---
description: 'Документация по интерфейсу Apache Arrow Flight в ClickHouse, который позволяет клиентам Flight SQL подключаться к ClickHouse'
sidebar_label: 'Интерфейс Arrow Flight'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Интерфейс Arrow Flight'
doc_type: 'reference'
---

# Интерфейс Apache Arrow Flight \{#apache-arrow-flight-interface\}

ClickHouse поддерживает интеграцию с протоколом [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) — высокопроизводительным RPC‑фреймворком, разработанным для эффективной передачи столбцовых данных в формате Arrow IPC по gRPC.

Этот интерфейс позволяет клиентам Flight SQL выполнять запросы к ClickHouse и получать результаты в формате Arrow, обеспечивая высокую пропускную способность и низкие задержки для аналитических нагрузок.

## Возможности \{#features\}

* Выполнение SQL-запросов через протокол Arrow Flight SQL
* Потоковая передача результатов запросов в формате Apache Arrow
* Интеграция с BI-инструментами и пользовательскими приложениями для работы с данными, поддерживающими Arrow Flight
* Легковесное и высокопроизводительное взаимодействие по gRPC

## Ограничения \{#limitations\}

Интерфейс Arrow Flight в настоящее время является экспериментальным и находится в активной разработке. Известные ограничения включают:

* Ограниченную поддержку сложных возможностей SQL, специфичных для ClickHouse
* Не все операции Arrow Flight SQL по работе с метаданными ещё реализованы
* Отсутствие встроенной аутентификации или настройки TLS в эталонной реализации

Если вы столкнётесь с проблемами совместимости или хотите внести свой вклад, пожалуйста, [создайте issue](https://github.com/ClickHouse/ClickHouse/issues) в репозитории ClickHouse.

## Запуск сервера Arrow Flight \{#running-server\}

Чтобы включить сервер Arrow Flight в самоуправляемом экземпляре ClickHouse, добавьте в конфигурационный файл сервера следующую конфигурацию:

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

Перезапустите сервер ClickHouse. После успешного запуска в журнале должно появиться сообщение, похожее на следующее:

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```


## Подключение к ClickHouse через Arrow Flight SQL \{#connecting-to-clickhouse\}

Вы можете использовать любой клиент, который поддерживает Arrow Flight SQL. Например, с помощью `pyarrow`:

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```


## Совместимость \{#compatibility\}

Интерфейс Arrow Flight совместим с инструментами, поддерживающими Arrow Flight SQL, включая приложения, разработанные с использованием:

* Python (`pyarrow`)
* Java (`arrow-flight`)
* C++ и других языков, совместимых с gRPC

Если для вашего инструмента доступен нативный коннектор ClickHouse (например, JDBC, ODBC), предпочтительнее использовать его, если только Arrow Flight не требуется именно для повышения производительности или обеспечения совместимости форматов.

## Отмена запросов \{#query-cancellation\}

Длительные запросы можно отменить, закрыв соединение gRPC со стороны клиента. Поддержка более совершенных механизмов отмены запланирована.

---

Дополнительные сведения см. по следующим ссылкам:

* [Спецификация Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)