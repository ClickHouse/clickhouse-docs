---
description: 'Документация по интерфейсу Apache Arrow Flight в ClickHouse, который позволяет клиентам Flight SQL подключаться к ClickHouse'
sidebar_label: 'Интерфейс Arrow Flight'
sidebar_position: 26
slug: /interfaces/arrowflight
title: 'Интерфейс Arrow Flight'
doc_type: 'reference'
---



# Интерфейс Apache Arrow Flight

ClickHouse поддерживает интеграцию с протоколом [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) — высокопроизводительным RPC-фреймворком, разработанным для эффективной передачи данных в колоночном формате с использованием формата Arrow IPC поверх gRPC.

Этот интерфейс позволяет клиентам Flight SQL выполнять запросы к ClickHouse и получать результаты в формате Arrow, обеспечивая высокую пропускную способность и низкую задержку для аналитических нагрузок.



## Возможности {#features}

- Выполнение SQL-запросов по протоколу Arrow Flight SQL
- Потоковая передача результатов запросов в формате Apache Arrow
- Интеграция с BI-инструментами и пользовательскими приложениями для работы с данными, поддерживающими Arrow Flight
- Легковесное и высокопроизводительное взаимодействие по gRPC


## Ограничения {#limitations}

Интерфейс Arrow Flight в настоящее время является экспериментальным и находится в активной разработке. Известные ограничения:

- Ограниченная поддержка сложных SQL-возможностей, специфичных для ClickHouse
- Не все операции с метаданными Arrow Flight SQL реализованы
- В эталонной реализации отсутствует встроенная аутентификация и конфигурация TLS

Если вы столкнулись с проблемами совместимости или хотите внести свой вклад, пожалуйста, [создайте issue](https://github.com/ClickHouse/ClickHouse/issues) в репозитории ClickHouse.


## Запуск сервера Arrow Flight {#running-server}

Чтобы включить сервер Arrow Flight в самостоятельно управляемом экземпляре ClickHouse, добавьте следующую конфигурацию в конфигурационный файл сервера:

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

Перезапустите сервер ClickHouse. При успешном запуске в логе должно появиться сообщение следующего вида:

```bash
{} <Information> Application: Протокол совместимости Arrow Flight: 0.0.0.0:9005
```


## Подключение к ClickHouse через Arrow Flight SQL {#connecting-to-clickhouse}

Можно использовать любой клиент с поддержкой Arrow Flight SQL. Например, используя `pyarrow`:

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```


## Совместимость {#compatibility}

Интерфейс Arrow Flight совместим с инструментами, поддерживающими Arrow Flight SQL, включая пользовательские приложения, разработанные с использованием:

- Python (`pyarrow`)
- Java (`arrow-flight`)
- C++ и других языков, совместимых с gRPC

Если для вашего инструмента доступен нативный коннектор ClickHouse (например, JDBC, ODBC), предпочтительнее использовать его, за исключением случаев, когда Arrow Flight необходим для обеспечения производительности или совместимости форматов.


## Отмена запросов {#query-cancellation}

Длительные запросы могут быть отменены путём закрытия gRPC-соединения со стороны клиента. Планируется поддержка более расширенных возможностей отмены.

---

Для получения дополнительной информации см.:

- [Спецификация Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
- [ClickHouse GitHub Issue #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)
