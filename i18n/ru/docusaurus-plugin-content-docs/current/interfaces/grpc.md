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
- параллельные запросы через один канал;
- отмену запросов;
- получение информации о прогрессе выполнения и логов;
- внешние таблицы.

Спецификация интерфейса описана в файле [clickhouse_grpc.proto](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).


## Конфигурация gRPC {#grpc-interface-configuration}

Для использования интерфейса gRPC задайте параметр `grpc_port` в основном [конфигурационном файле сервера](../operations/configuration-files.md). Другие параметры конфигурации приведены в следующем примере:

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

        <!-- Алгоритм сжатия по умолчанию (применяется, если клиент не указывает другой алгоритм, см. result_compression в QueryInfo).
             Поддерживаемые алгоритмы: none, deflate, gzip, stream_gzip -->
        <compression>deflate</compression>

        <!-- Уровень сжатия по умолчанию (применяется, если клиент не указывает другой уровень, см. result_compression в QueryInfo).
             Поддерживаемые уровни: none, low, medium, high -->
        <compression_level>medium</compression_level>

        <!-- Ограничения размера отправляемых/получаемых сообщений в байтах. -1 означает отсутствие ограничений -->
        <max_send_message_size>-1</max_send_message_size>
        <max_receive_message_size>-1</max_receive_message_size>

        <!-- Включите, если требуется получать подробные логи -->
        <verbose_logs>false</verbose_logs>
    </grpc>
```


## Встроенный клиент {#grpc-client}

Вы можете написать клиент на любом из языков программирования, поддерживаемых gRPC, используя предоставленную [спецификацию](https://github.com/ClickHouse/ClickHouse/blob/master/src/Server/grpc_protos/clickhouse_grpc.proto).
Также можно использовать встроенный клиент на Python. Он расположен в файле [utils/grpc-client/clickhouse-grpc-client.py](https://github.com/ClickHouse/ClickHouse/blob/master/utils/grpc-client/clickhouse-grpc-client.py) в репозитории. Для работы встроенного клиента требуются модули Python [grpcio и grpcio-tools](https://grpc.io/docs/languages/python/quickstart).

Клиент поддерживает следующие аргументы:

- `--help` – Выводит справочное сообщение и завершает работу.
- `--host HOST, -h HOST` – Имя сервера. Значение по умолчанию: `localhost`. Также можно использовать адреса IPv4 или IPv6.
- `--port PORT` – Порт для подключения. Этот порт должен быть включен в конфигурации сервера ClickHouse (см. `grpc_port`). Значение по умолчанию: `9100`.
- `--user USER_NAME, -u USER_NAME` – Имя пользователя. Значение по умолчанию: `default`.
- `--password PASSWORD` – Пароль. Значение по умолчанию: пустая строка.
- `--query QUERY, -q QUERY` – Запрос для выполнения в неинтерактивном режиме.
- `--database DATABASE, -d DATABASE` – База данных по умолчанию. Если не указана, используется текущая база данных из настроек сервера (по умолчанию `default`).
- `--format OUTPUT_FORMAT, -f OUTPUT_FORMAT` – [Формат](formats.md) вывода результата. Значение по умолчанию для интерактивного режима: `PrettyCompact`.
- `--debug` – Включает вывод отладочной информации.

Для запуска клиента в интерактивном режиме вызовите его без аргумента `--query`.

В пакетном режиме данные запроса можно передать через `stdin`.

**Пример использования клиента**

В следующем примере создается таблица и загружаются данные из CSV-файла. Затем выполняется запрос содержимого таблицы.

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
