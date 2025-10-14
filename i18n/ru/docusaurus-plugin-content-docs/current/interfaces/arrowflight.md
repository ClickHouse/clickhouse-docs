---
'description': 'Документация для интерфейса Apache Arrow Flight в ClickHouse, позволяющего
  клиентам Flight SQL подключаться к ClickHouse'
'sidebar_label': 'Arrow Flight Interface'
'sidebar_position': 26
'slug': '/interfaces/arrowflight'
'title': 'Arrow Flight Interface'
'doc_type': 'reference'
---
# Интерфейс Apache Arrow Flight

ClickHouse поддерживает интеграцию с протоколом [Apache Arrow Flight](https://arrow.apache.org/docs/format/Flight.html) — высокопроизводительным RPC-фреймворком, разработанным для эффективной передачи столбцовых данных с использованием формата Arrow IPC через gRPC.

Этот интерфейс позволяет клиентам Flight SQL выполнять запросы к ClickHouse и получать результаты в формате Arrow, обеспечивая высокую пропускную способность и низкую задержку для аналитических рабочих нагрузок.

## Возможности {#features}

* Выполнение SQL-запросов через протокол Arrow Flight SQL
* Передача результатов запросов в формате Apache Arrow
* Интеграция с BI-инструментами и пользовательскими приложениями, поддерживающими Arrow Flight
* Легковесная и эффективная связь через gRPC

## Ограничения {#limitations}

Интерфейс Arrow Flight в настоящее время является экспериментальным и находится в активной разработке. Известные ограничения включают:

* Ограниченная поддержка сложных специфичных для ClickHouse SQL-функций
* Не все операции метаданных Arrow Flight SQL еще реализованы
* Нет встроенной аутентификации или конфигурации TLS в эталонной реализации

Если вы столкнулись с проблемами совместимости или хотите внести вклад, пожалуйста, [создайте issue](https://github.com/ClickHouse/ClickHouse/issues) в репозитории ClickHouse.

## Запуск сервера Arrow Flight {#running-server}

Чтобы включить сервер Arrow Flight в самоуправляемом экземпляре ClickHouse, добавьте следующую конфигурацию в файл конфигурации сервера:

```xml
<clickhouse>
    <arrowflight_port>9005</arrowflight_port>
</clickhouse>
```

Перезапустите сервер ClickHouse. При успешном запуске вы должны увидеть сообщение в журнале, похожее на:

```bash
{} <Information> Application: Arrow Flight compatibility protocol: 0.0.0.0:9005
```

## Подключение к ClickHouse через Arrow Flight SQL {#connecting-to-clickhouse}

Вы можете использовать любой клиент, поддерживающий Arrow Flight SQL. Например, с использованием `pyarrow`:

```python
import pyarrow.flight

client = pyarrow.flight.FlightClient("grpc://localhost:9005")
ticket = pyarrow.flight.Ticket(b"SELECT number FROM system.numbers LIMIT 10")
reader = client.do_get(ticket)

for batch in reader:
    print(batch.to_pandas())
```

## Совместимость {#compatibility}

Интерфейс Arrow Flight совместим с инструментами, поддерживающими Arrow Flight SQL, включая пользовательские приложения, созданные с помощью:

* Python (`pyarrow`)
* Java (`arrow-flight`)
* C++ и других языков, совместимых с gRPC

Если для вашего инструмента доступен родной коннектор ClickHouse (например, JDBC, ODBC), предпочтительно использовать его, если только Arrow Flight не требуется специально для производительности или совместимости формата.

## Отмена запросов {#query-cancellation}

Долгосрочные запросы могут быть отменены путем закрытия gRPC-соединения со стороны клиента. Поддержка более продвинутых функций отмены запланирована.

---

Для получения дополнительных сведений смотрите:

* [Спецификация Apache Arrow Flight SQL](https://arrow.apache.org/docs/format/FlightSql.html)
* [Issue ClickHouse на GitHub #7554](https://github.com/ClickHouse/ClickHouse/issues/7554)