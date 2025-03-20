---
slug: /interfaces/grpc
sidebar_position: 19
sidebar_label: gRPC Интерфейс
---


# gRPC Интерфейс

## Введение {#grpc-interface-introduction}

ClickHouse поддерживает [gRPC](https://grpc.io/) интерфейс. Это система удаленных вызовов процедур с открытым исходным кодом, которая использует HTTP/2 и [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers). Реализация gRPC в ClickHouse поддерживает:

- SSL;
- аутентификацию;
- сессии;
- сжатие;
- параллельные запросы через один и тот же канал;
- отмену запросов;
- получение прогресса и логов;
- внешние таблицы.

Спецификация интерфейса описана в [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).

## Настройка gRPC {#grpc-interface-configuration}

Для использования gRPC интерфейса необходимо установить `grpc_port` в основной [конфигурации сервера](../operations/configuration-files.md). Другие параметры конфигурации смотрите в следующем примере:

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- Следующие два файла используются только если SSL включен -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- Требует ли сервер от клиента сертификат -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- Следующий файл используется только если ssl_require_client_auth=true -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- Алгоритм сжатия по умолчанию (применяется, если клиент не указывает другой алгоритм, см. result_compression в QueryInfo).
             Поддерживаемые алгоритмы: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Уровень сжатия по умолчанию (применяется, если клиент не указывает другой уровень, см. result_compression в QueryInfo).
             Поддерживаемые уровни: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Ограничения на размер отправляемых/принимаемых сообщений в байтах. -1 означает без ограничений -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Включите, если хотите получить детализированные логи -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```

## Встроенный клиент {#grpc-client}

Вы можете написать клиент на любом из языков программирования, поддерживаемых gRPC, используя предоставленную [спецификацию](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).
Или вы можете использовать встроенный Python клиент. Он находится в [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py) в репозитории. Встроенный клиент требует модули Python [grpcio и grpcio-tools](https://grpc.io/docs/languages/python/quickstart).

Клиент поддерживает следующие аргументы:

- `--help` – Показывает помощь и выходит.
- `--host HOST, -h HOST` – Имя сервера. Значение по умолчанию: `localhost`. Вы также можете использовать адреса IPv4 или IPv6.
- `--port PORT` – Порт для подключения. Этот порт должен быть включен в конфигурацию сервера ClickHouse (см. `grpc_port`). Значение по умолчанию: `9100`.
- `--user USER_NAME, -u USER_NAME` – Имя пользователя. Значение по умолчанию: `default`.
- `--password PASSWORD` – Пароль. Значение по умолчанию: пустая строка.
- `--query QUERY, -q QUERY` – Запрос для обработки в неинтерактивном режиме.
- `--database DATABASE, -d DATABASE` – База данных по умолчанию. Если не указано, используется текущая база данных, установленная в настройках сервера (по умолчанию `default`).
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – Формат [вывода результата](formats.md). Значение по умолчанию для интерактивного режима: `PrettyCompact`.
- `--debug` – Включает отображение отладочной информации.

Чтобы запустить клиент в интерактивном режиме, вызовите его без аргумента `--query`.

В режиме пакетной обработки запрос данных можно передать через `stdin`.

**Пример использования клиента**

В следующем примере создается таблица и загружается с данными из CSV файла. Затем содержимое таблицы запрашивается.

``` bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Input data for\n1,gRPC protocol example" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

Результат:

``` text
┌─id─┬─text──────────────────┐
│  0 │ Input data for        │
│  1 │ gRPC protocol example │
└────┴───────────────────────┘
```
