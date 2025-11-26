---
description: 'Документация по интерфейсу gRPC в ClickHouse'
sidebar_label: 'Интерфейс gRPC'
sidebar_position: 25
slug: /interfaces/grpc
title: 'Интерфейс gRPC'
doc_type: 'reference'
---



# Интерфейс gRPC



## Введение {#grpc-interface-introduction}

ClickHouse поддерживает интерфейс [gRPC](https://grpc.io/). Это система удалённого вызова процедур с открытым исходным кодом, использующая HTTP/2 и [Protocol Buffers](https://en.wikipedia.org/wiki/Protocol_Buffers). Реализация gRPC в ClickHouse поддерживает:

- SSL;
- аутентификацию;
- сессии;
- сжатие;
- параллельные запросы по одному и тому же каналу;
- отмену запросов;
- получение информации о прогрессе и логов;
- внешние таблицы.

Спецификация интерфейса приведена в файле [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).



## Настройка gRPC

Чтобы использовать интерфейс gRPC, задайте `grpc_port` в основном [конфигурационном файле сервера](../operations/configuration-files.md). Дополнительные параметры конфигурации приведены в следующем примере:

```xml
<grpc_port>9100</grpc_port>
    <grpc>
        <enable_ssl>false</enable_ssl>

        <!-- Следующие два файла используются только при включённом SSL -->
        <ssl_cert_file>/path/to/ssl_cert_file</ssl_cert_file>
        <ssl_key_file>/path/to/ssl_key_file</ssl_key_file>

        <!-- Запрашивает ли сервер у клиента сертификат -->
        <ssl_require_client_auth>false</ssl_require_client_auth>

        <!-- Следующий файл используется только при ssl_require_client_auth=true -->
        <ssl_ca_cert_file>/path/to/ssl_ca_cert_file</ssl_ca_cert_file>

        <!-- Алгоритм сжатия по умолчанию (применяется, если клиент не указывает другой алгоритм; см. result_compression в QueryInfo).
             Поддерживаемые алгоритмы: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Уровень сжатия по умолчанию (применяется, если клиент не указывает другой уровень; см. result_compression в QueryInfo).
             Поддерживаемые уровни: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Ограничения размера отправляемых и получаемых сообщений в байтах. -1 означает отсутствие ограничений -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Включите для получения подробных логов -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```


## Встроенный клиент

Вы можете написать клиент на любом из языков программирования, поддерживаемых gRPC, используя предоставленную [спецификацию](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).
Либо вы можете использовать встроенный клиент на Python. Он находится в репозитории по пути [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py). Для встроенного клиента требуются Python‑модули [grpcio и grpcio-tools](https://grpc.io/docs/languages/python/quickstart).

Клиент поддерживает следующие аргументы:

* `--help` – Показывает справочное сообщение и завершает работу.
* `--host HOST, -h HOST` – Имя сервера. Значение по умолчанию: `localhost`. Можно также использовать адреса IPv4 или IPv6.
* `--port PORT` – Порт для подключения. Этот порт должен быть разрешён в конфигурации сервера ClickHouse (см. `grpc_port`). Значение по умолчанию: `9100`.
* `--user USER_NAME, -u USER_NAME` – Имя пользователя. Значение по умолчанию: `default`.
* `--password PASSWORD` – Пароль. Значение по умолчанию: пустая строка.
* `--query QUERY, -q QUERY` – Запрос для выполнения в неинтерактивном режиме.
* `--database DATABASE, -d DATABASE` – База данных по умолчанию. Если не указано, используется текущая база данных, заданная в настройках сервера (`default` по умолчанию).
* `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – [Формат](formats.md) вывода результата. Значение по умолчанию для интерактивного режима: `PrettyCompact`.
* `--debug` – Включает вывод отладочной информации.

Чтобы запустить клиент в интерактивном режиме, вызовите его без аргумента `--query`.

В пакетном режиме данные запроса могут быть переданы через `stdin`.

**Пример использования клиента**

В следующем примере создаётся таблица и загружается данными из CSV‑файла. Затем выполняется запрос содержимого таблицы.

```bash
./clickhouse-grpc-client.py -q "CREATE TABLE grpc_example_table (id UInt32, text String) ENGINE = MergeTree() ORDER BY id;"
echo -e "0,Входные данные для\n1,примера протокола gRPC" > a.csv
cat a.csv | ./clickhouse-grpc-client.py -q "INSERT INTO grpc_example_table FORMAT CSV"

./clickhouse-grpc-client.py --format PrettyCompact -q "SELECT * FROM grpc_example_table;"
```

Результат:

```text
┌─id─┬─text──────────────────┐
│  0 │ Входные данные для    │
│  1 │ примера протокола gRPC│
└────┴───────────────────────┘
```
