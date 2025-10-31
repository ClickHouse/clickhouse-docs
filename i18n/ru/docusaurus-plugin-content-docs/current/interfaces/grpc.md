---
slug: '/interfaces/grpc'
sidebar_label: 'Интерфейс gRPC'
sidebar_position: 25
description: 'Документация для gRPC интерфейса в ClickHouse'
title: 'Интерфейс gRPC'
doc_type: reference
---
# gRPC интерфейс

## Введение {#grpc-interface-introduction}

ClickHouse поддерживает [gRPC](https://grpc.io/) интерфейс. Это система удалённых вызовов процедур с открытым исходным кодом, использующая HTTP/2 и [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers). Реализация gRPC в ClickHouse поддерживает:

- SSL;
- аутентификацию;
- сессии;
- сжатие;
- параллельные запросы через один и тот же канал;
- отмену запросов;
- получение прогресса и логов;
- внешние таблицы.

Спецификация интерфейса описана в [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).

## Конфигурация gRPC {#grpc-interface-configuration}

Чтобы использовать gRPC интерфейс, установите `grpc_port` в главном [файле конфигурации сервера](../operations/configuration-files.md). Другие параметры конфигурации смотрите в следующем примере:

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- The following two files are used only if SSL is enabled -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- Whether server requests client for a certificate -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- The following file is used only if ssl_require_client_auth=true -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- Default compression algorithm (applied if client doesn't specify another algorithm, see result_compression in QueryInfo).
             Supported algorithms: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Default compression level (applied if client doesn't specify another level, see result_compression in QueryInfo).
             Supported levels: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Send/receive message size limits in bytes. -1 means unlimited -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Enable if you want to get detailed logs -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```

## Встроенный клиент {#grpc-client}

Вы можете написать клиент на любом из языков программирования, поддерживаемых gRPC, используя предоставленную [спецификацию](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto). Или вы можете воспользоваться встроенным клиентом на Python. Он размещен в [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py) в репозитории. Встроенный клиент требует модули Python [grpcio и grpcio-tools](https://grpc.io/docs/languages/python/quickstart).

Клиент поддерживает следующие аргументы:

- `--help` – Показывает сообщение помощи и выходит.
- `--host HOST, -h HOST` – Имя сервера. Значение по умолчанию: `localhost`. Также можно использовать IPv4 или IPv6 адреса.
- `--port PORT` – Порт для подключения. Этот порт должен быть включен в конфигурации сервера ClickHouse (см. `grpc_port`). Значение по умолчанию: `9100`.
- `--user USER_NAME, -u USER_NAME` – Имя пользователя. Значение по умолчанию: `default`.
- `--password PASSWORD` – Пароль. Значение по умолчанию: пустая строка.
- `--query QUERY, -q QUERY` – Запрос для обработки в режиме неинтерактивного взаимодействия.
- `--database DATABASE, -d DATABASE` – База данных по умолчанию. Если не указана, используется текущая база данных, установленная в настройках сервера (по умолчанию `default`).
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – Формат вывода результата [формат](formats.md). Значение по умолчанию для интерактивного режима: `PrettyCompact`.
- `--debug` – Включает отображение отладочной информации.

Чтобы запустить клиент в интерактивном режиме, вызовите его без аргумента `--query`.

В пакетном режиме данные запроса могут быть переданы через `stdin`.

**Пример использования клиента**

В следующем примере создается таблица и загружается с данными из CSV файла. Затем выполняется запрос к содержимому таблицы.

```bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Input data for\n1,gRPC protocol example" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

Результат:

```text
┌─id─┬─text──────────────────┐
│  0 │ Input data for        │
│  1 │ gRPC protocol example │
└────┴───────────────────────┘
```