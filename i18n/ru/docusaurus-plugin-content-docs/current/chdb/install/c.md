---
title: 'chDB для C и C++'
sidebar_label: 'C и C++'
slug: /chdb/install/c
description: 'Как установить и использовать chDB на C и C++'
keywords: ['chdb', 'c', 'cpp', 'embedded', 'clickhouse', 'sql', 'olap', 'api']
doc_type: 'guide'
---

# chDB для C и C++ {#chdb-for-c-and-c}

chDB предоставляет нативный C/C++ API для встраивания функциональности ClickHouse непосредственно в ваши приложения. API поддерживает как простые запросы, так и расширенные функции, такие как постоянные соединения и потоковые результаты запросов.

## Установка {#installation}

### Шаг 1: Установка libchdb {#install-libchdb}

Установите библиотеку chDB в вашу систему:

```bash
curl -sL https://lib.chdb.io | bash
```

### Шаг 2: Подключение заголовков {#include-headers}

Подключите заголовок chDB в ваш проект:

```c
#include <chdb.h>
```

### Шаг 3: Линковка библиотеки {#link-library}

Скомпилируйте и слинкуйте ваше приложение с chDB:

```bash
# Компиляция C
gcc -o myapp myapp.c -lchdb

# Компиляция C++
g++ -o myapp myapp.cpp -lchdb
```

## Примеры на C {#c-examples}

### Базовое подключение и запросы {#basic-connection-queries}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    // Создание аргументов подключения
    char* args[] = {"chdb", "--path", "/tmp/chdb-data"};
    int argc = 3;

    // Подключение к chDB
    chdb_connection* conn = chdb_connect(argc, args);
    if (!conn) {
        printf("Failed to connect to chDB\n");
        return 1;
    }

    // Выполнение запроса
    chdb_result* result = chdb_query(*conn, "SELECT version()", "CSV");
    if (!result) {
        printf("Query execution failed\n");
        chdb_close_conn(conn);
        return 1;
    }

    // Проверка на ошибки
    const char* error = chdb_result_error(result);
    if (error) {
        printf("Query error: %s\n", error);
    } else {
        // Получение данных результата
        char* data = chdb_result_buffer(result);
        size_t length = chdb_result_length(result);
        double elapsed = chdb_result_elapsed(result);
        uint64_t rows = chdb_result_rows_read(result);

        printf("Result: %.*s\n", (int)length, data);
        printf("Elapsed: %.3f seconds\n", elapsed);
        printf("Rows: %llu\n", rows);
    }

    // Очистка
    chdb_destroy_query_result(result);
    chdb_close_conn(conn);
    return 0;
}
```

### Потоковые запросы {#streaming-queries}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    char* args[] = {"chdb", "--path", "/tmp/chdb-stream"};
    chdb_connection* conn = chdb_connect(3, args);

    if (!conn) {
        printf("Failed to connect\n");
        return 1;
    }

    // Запуск потокового запроса
    chdb_result* stream_result = chdb_stream_query(*conn,
        "SELECT number FROM system.numbers LIMIT 1000000", "CSV");

    if (!stream_result) {
        printf("Failed to start streaming query\n");
        chdb_close_conn(conn);
        return 1;
    }

    uint64_t total_rows = 0;

    // Обработка фрагментов
    while (true) {
        chdb_result* chunk = chdb_stream_fetch_result(*conn, stream_result);
        if (!chunk) break;

        // Проверка наличия данных в этом фрагменте
        size_t chunk_length = chdb_result_length(chunk);
        if (chunk_length == 0) {
            chdb_destroy_query_result(chunk);
            break; // Конец потока
        }

        uint64_t chunk_rows = chdb_result_rows_read(chunk);
        total_rows += chunk_rows;

        printf("Processed chunk: %llu rows, %zu bytes\n", chunk_rows, chunk_length);

        // Обработка данных фрагмента здесь
        // char* data = chdb_result_buffer(chunk);

        chdb_destroy_query_result(chunk);

        // Отчет о прогрессе
        if (total_rows % 100000 == 0) {
            printf("Progress: %llu rows processed\n", total_rows);
        }
    }

    printf("Streaming complete. Total rows: %llu\n", total_rows);

    // Очистка потокового запроса
    chdb_destroy_query_result(stream_result);
    chdb_close_conn(conn);
    return 0;
}
```

### Работа с различными форматами данных {#data-formats}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    char* args[] = {"chdb"};
    chdb_connection* conn = chdb_connect(1, args);

    const char* query = "SELECT number, toString(number) as str FROM system.numbers LIMIT 3";

    // Формат CSV
    chdb_result* csv_result = chdb_query(*conn, query, "CSV");
    printf("CSV Result:\n%.*s\n\n",
           (int)chdb_result_length(csv_result),
           chdb_result_buffer(csv_result));
    chdb_destroy_query_result(csv_result);

    // Формат JSON
    chdb_result* json_result = chdb_query(*conn, query, "JSON");
    printf("JSON Result:\n%.*s\n\n",
           (int)chdb_result_length(json_result),
           chdb_result_buffer(json_result));
    chdb_destroy_query_result(json_result);

    // Формат Pretty
    chdb_result* pretty_result = chdb_query(*conn, query, "Pretty");
    printf("Pretty Result:\n%.*s\n\n",
           (int)chdb_result_length(pretty_result),
           chdb_result_buffer(pretty_result));
    chdb_destroy_query_result(pretty_result);

    chdb_close_conn(conn);
    return 0;
}
```

## Пример на C++ {#cpp-example}

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <chdb.h>

class ChDBConnection {
private:
    chdb_connection* conn;

public:
    ChDBConnection(const std::vector<std::string>& args) {
        // Преобразование вектора строк в массив char*
        std::vector<char*> argv;
        for (const auto& arg : args) {
            argv.push_back(const_cast<char*>(arg.c_str()));
        }

        conn = chdb_connect(argv.size(), argv.data());
        if (!conn) {
            throw std::runtime_error("Failed to connect to chDB");
        }
    }

    ~ChDBConnection() {
        if (conn) {
            chdb_close_conn(conn);
        }
    }

    std::string query(const std::string& sql, const std::string& format = "CSV") {
        chdb_result* result = chdb_query(*conn, sql.c_str(), format.c_str());
        if (!result) {
            throw std::runtime_error("Query execution failed");
        }

        const char* error = chdb_result_error(result);
        if (error) {
            std::string error_msg(error);
            chdb_destroy_query_result(result);
            throw std::runtime_error("Query error: " + error_msg);
        }

        std::string data(chdb_result_buffer(result), chdb_result_length(result));

        // Получение статистики запроса
        std::cout << "Query statistics:\n";
        std::cout << "  Elapsed: " << chdb_result_elapsed(result) << " seconds\n";
        std::cout << "  Rows read: " << chdb_result_rows_read(result) << "\n";
        std::cout << "  Bytes read: " << chdb_result_bytes_read(result) << "\n";

        chdb_destroy_query_result(result);
        return data;
    }
};

int main() {
    try {
        // Создание подключения
        ChDBConnection db({{"chdb", "--path", "/tmp/chdb-cpp"}});

        // Создание и заполнение таблицы
        db.query("CREATE TABLE test (id UInt32, value String) ENGINE = MergeTree() ORDER BY id");
        db.query("INSERT INTO test VALUES (1, 'hello'), (2, 'world'), (3, 'chdb')");

        // Запросы с различными форматами
        std::cout << "CSV Results:\n" << db.query("SELECT * FROM test", "CSV") << "\n";
        std::cout << "JSON Results:\n" << db.query("SELECT * FROM test", "JSON") << "\n";

        // Агрегационный запрос
        std::cout << "Count: " << db.query("SELECT COUNT(*) FROM test") << "\n";

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
```

## Лучшие практики обработки ошибок {#error-handling}

```c
#include <stdio.h>
#include <chdb.h>

int safe_query_example() {
    chdb_connection* conn = NULL;
    chdb_result* result = NULL;
    int return_code = 0;

    // Создание подключения
    char* args[] = {"chdb"};
    conn = chdb_connect(1, args);
    if (!conn) {
        printf("Failed to create connection\n");
        return 1;
    }

    // Выполнение запроса
    result = chdb_query(*conn, "SELECT invalid_syntax", "CSV");
    if (!result) {
        printf("Query execution failed\n");
        return_code = 1;
        goto cleanup;
    }

    // Проверка ошибок запроса
    const char* error = chdb_result_error(result);
    if (error) {
        printf("Query error: %s\n", error);
        return_code = 1;
        goto cleanup;
    }

    // Обработка успешного результата
    printf("Result: %.*s\n",
           (int)chdb_result_length(result),
           chdb_result_buffer(result));

cleanup:
    if (result) chdb_destroy_query_result(result);
    if (conn) chdb_close_conn(conn);
    return return_code;
}
```

## Репозиторий GitHub {#github-repository}

- **Основной репозиторий**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **Проблемы и поддержка**: Сообщайте о проблемах в [репозитории GitHub](https://github.com/chdb-io/chdb/issues)
- **Документация C API**: [Документация привязок](https://github.com/chdb-io/chdb/blob/main/bindings.md)
