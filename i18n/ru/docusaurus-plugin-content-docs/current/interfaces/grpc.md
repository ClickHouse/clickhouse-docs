---
description: 'Документация для интерфейса gRPC в ClickHouse'
sidebar_label: 'Интерфейс gRPC'
sidebar_position: 25
slug: /interfaces/grpc
title: 'Интерфейс gRPC'
---


# Интеллект gRPC

## Введение {#grpc-interface-introduction}

ClickHouse поддерживает [gRPC](https://grpc.io/) интерфейс. Это система удаленных вызовов процедур с открытым исходным кодом, которая использует HTTP/2 и [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers). Реализация gRPC в ClickHouse поддерживает:

- SSL;
- аутентификацию;
- сессии;
- сжатие;
- параллельные запросы через один и тот же канал;
- отмену запросов;
- получение прогресса и журналов;
- внешние таблицы.

Спецификация интерфейса описана в [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).

## Настройка gRPC {#grpc-interface-configuration}

Чтобы использовать интерфейс gRPC, установите `grpc_port` в основном [конфигурационном файле сервера](../operations/configuration-files.md). Другие параметры конфигурации смотрите в следующем примере:

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- Следующие два файла используются только в случае включенного SSL -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- Указывает, требует ли сервер сертификат клиента -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- Следующий файл используется только в случае ssl_require_client_auth=true -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- Алгоритм сжатия по умолчанию (применяется, если клиент не указывает другой алгоритм, смотрите result_compression в QueryInfo).
             Поддерживаемые алгоритмы: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Уровень сжатия по умолчанию (применяется, если клиент не указывает другой уровень, смотрите result_compression в QueryInfo).
             Поддерживаемые уровни: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Ограничения на размер отправляемых/принимаемых сообщений в байтах. -1 означает без ограничений -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Включите, если хотите получать подробные журналы -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```

## Встроенный клиент {#grpc-client}

Вы можете написать клиента на любом из языков программирования, поддерживаемых gRPC, используя предоставленную [спецификацию](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).
Или вы можете использовать встроенный клиент на Python. Он находится в [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py) в репозитории. Встроенный клиент требует модули [grpcio и grpcio-tools](https://grpc.io/docs/languages/python/quickstart) Python.

Клиент поддерживает следующие аргументы:

- `--help` – Показывает сообщение справки и завершает работу.
- `--host HOST, -h HOST` – Имя сервера. Значение по умолчанию: `localhost`. Вы также можете использовать адреса IPv4 или IPv6.
- `--port PORT` – Порт для подключения. Этот порт должен быть включен в конфигурацию сервера ClickHouse (см. `grpc_port`). Значение по умолчанию: `9100`.
- `--user USER_NAME, -u USER_NAME` – Имя пользователя. Значение по умолчанию: `default`.
- `--password PASSWORD` – Пароль. Значение по умолчанию: пустая строка.
- `--query QUERY, -q QUERY` – Запрос для обработки при использовании неинтерактивного режима.
- `--database DATABASE, -d DATABASE` – База данных по умолчанию. Если не указано, используется текущая база данных, установленная в настройках сервера (по умолчанию `default`).
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – Формат вывода результата [формат](formats.md). Значение по умолчанию для интерактивного режима: `PrettyCompact`.
- `--debug` – Включает отображение отладочной информации.

Чтобы запустить клиента в интерактивном режиме, вызовите его без аргумента `--query`.

В пакетном режиме данные можно передавать через `stdin`.

**Пример использования клиента**

В следующем примере создается таблица и загружается с данными из файла CSV. Затем содержимое таблицы запрашивается.

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
