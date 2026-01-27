---
description: 'Документация по интерфейсу gRPC в ClickHouse'
sidebar_label: 'Интерфейс gRPC'
sidebar_position: 25
slug: /interfaces/grpc
title: 'Интерфейс gRPC'
doc_type: 'reference'
---

# Интерфейс gRPC \{#grpc-interface\}

## Введение \{#grpc-interface-introduction\}

ClickHouse поддерживает интерфейс [gRPC](https://grpc.io/). Это система удалённых вызовов процедур с открытым исходным кодом, которая использует HTTP/2 и [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers). Реализация gRPC в ClickHouse поддерживает:

- SSL;
- аутентификацию;
- сеансы;
- сжатие;
- параллельные запросы по одному и тому же каналу;
- отмену запросов;
- получение информации о прогрессе выполнения и логов;
- внешние таблицы.

Спецификация интерфейса приведена в [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).

## Конфигурация gRPC \{#grpc-interface-configuration\}

Чтобы использовать интерфейс gRPC, задайте `grpc_port` в основном файле [конфигурации сервера](../../operations/configuration-files.md). Другие параметры конфигурации см. в следующем примере:

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


## Встроенный клиент \{#grpc-client\}

Вы можете написать клиент на любом из языков программирования, поддерживаемых gRPC, используя предоставленную [спецификацию](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).
Либо вы можете использовать встроенный клиент на Python. Он находится в репозитории по пути [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py). Для встроенного клиента требуются модули Python [grpcio и grpcio-tools](https://grpc.io/docs/languages/python/quickstart).

Клиент поддерживает следующие аргументы:

* `--help` – Показывает справочное сообщение и завершает работу.
* `--host HOST, -h HOST` – Имя сервера. Значение по умолчанию: `localhost`. Можно также использовать IPv4- или IPv6-адреса.
* `--port PORT` – Порт для подключения. Этот порт должен быть разрешён в конфигурации сервера ClickHouse (см. `grpc_port`). Значение по умолчанию: `9100`.
* `--user USER_NAME, -u USER_NAME` – Имя пользователя. Значение по умолчанию: `default`.
* `--password PASSWORD` – Пароль. Значение по умолчанию: пустая строка.
* `--query QUERY, -q QUERY` – Запрос, который выполняется в неинтерактивном режиме.
* `--database DATABASE, -d DATABASE` – База данных по умолчанию. Если не указана, используется текущая база данных, заданная в настройках сервера (`default` по умолчанию).
* `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – [Формат](../../interfaces/formats.md) вывода результата. Значение по умолчанию для интерактивного режима: `PrettyCompact`.
* `--debug` – Включает вывод отладочной информации.

Чтобы запустить клиент в интерактивном режиме, запустите его без аргумента `--query`.

В пакетном режиме данные запроса могут быть переданы через `stdin`.

**Пример использования клиента**

В следующем примере создаётся таблица и заполняется данными из CSV-файла. Затем выполняется запрос к содержимому таблицы.

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
