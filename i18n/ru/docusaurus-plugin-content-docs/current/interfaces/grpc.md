---
description: 'Документация для интерфейса gRPC в ClickHouse'
sidebar_label: 'Интерфейс gRPC'
sidebar_position: 25
slug: /interfaces/grpc
title: 'Интерфейс gRPC'
---


# Интерфейс gRPC

## Введение {#grpc-interface-introduction}

ClickHouse поддерживает [gRPC](https://grpc.io/) интерфейс. Это система удалённых вызовов процедур с открытым исходным кодом, использующая HTTP/2 и [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers). Реализация gRPC в ClickHouse поддерживает:

- SSL;
- аутентификацию;
- сеансы;
- сжатие;
- параллельные запросы через один канал;
- отмену запросов;
- получение прогресса и логов;
- внешние таблицы.

Спецификация интерфейса описана в [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).

## Конфигурация gRPC {#grpc-interface-configuration}

Для использования gRPC интерфейса задайте `grpc_port` в главном [конфигурационном файле сервера](../operations/configuration-files.md). Другие параметры конфигурации приведены в следующем примере:

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- Следующие два файла используются только в случае включения SSL -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- Требует ли сервер от клиента сертификат -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- Следующий файл используется только в случае, если ssl_require_client_auth=true -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- Алгоритм сжатия по умолчанию (применяется, если клиент не указывает другой алгоритм, см. result_compression в QueryInfo).
             Поддерживаемые алгоритмы: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Уровень сжатия по умолчанию (применяется, если клиент не указывает другой уровень, см. result_compression в QueryInfo).
             Поддерживаемые уровни: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Ограничения на размер сообщений для отправки и получения в байтах. -1 означает неограниченный -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Включите, если хотите получить подробные логи -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```

## Встроенный клиент {#grpc-client}

Вы можете написать клиент на любом из языков программирования, поддерживаемых gRPC, используя предоставленную [спецификацию](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).
Или вы можете использовать встроенный клиент на Python. Он находится в [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py) в репозитории. Встроенный клиент требует Python модули [grpcio и grpcio-tools](https://grpc.io/docs/languages/python/quickstart).

Клиент поддерживает следующие аргументы:

- `--help` – Показывает сообщение помощи и завершает работу.
- `--host HOST, -h HOST` – Имя сервера. Значение по умолчанию: `localhost`. Вы также можете использовать адреса IPv4 или IPv6.
- `--port PORT` – Порт для подключения. Этот порт должен быть включен в конфигурации сервера ClickHouse (см. `grpc_port`). Значение по умолчанию: `9100`.
- `--user USER_NAME, -u USER_NAME` – Имя пользователя. Значение по умолчанию: `default`.
- `--password PASSWORD` – Пароль. Значение по умолчанию: пустая строка.
- `--query QUERY, -q QUERY` – Запрос, который нужно обработать в неинтерактивном режиме.
- `--database DATABASE, -d DATABASE` – База данных по умолчанию. Если не указана, используется текущая база данных, установленная в настройках сервера (по умолчанию `default`).
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – Формат вывода результата [format](formats.md). Значение по умолчанию для интерактивного режима: `PrettyCompact`.
- `--debug` – Включает отображение отладочной информации.

Чтобы запустить клиент в интерактивном режиме, вызовите его без аргумента `--query`.

В пакетном режиме данные запроса могут передаваться через `stdin`.

**Пример использования клиента**

В следующем примере создаётся таблица и загружается данные из CSV файла. Затем запрашивается содержимое таблицы.

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
