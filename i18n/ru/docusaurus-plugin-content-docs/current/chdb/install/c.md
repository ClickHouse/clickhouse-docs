---
title: 'chDB для C и C++'
sidebar_label: 'C и C++'
slug: /chdb/install/c
description: 'Как установить и использовать chDB на C и C++'
keywords: ['chdb', 'c', 'cpp', 'embedded', 'clickhouse', 'sql', 'olap', 'api']
doc_type: 'guide'
---



# chDB для C и C++

chDB предоставляет родной C/C++ API для встраивания функциональности ClickHouse непосредственно в ваши приложения. API поддерживает как простые запросы, так и расширенные возможности, такие как постоянные соединения и потоковая передача результатов запросов.



## Установка

### Шаг 1: Установите libchdb

Установите библиотеку chDB в систему:

```bash
curl -sL https://lib.chdb.io | bash
```

### Шаг 2: Подключите заголовочный файл

Подключите заголовочный файл chDB в своём проекте:

```c
#include <chdb.h>
```

### Шаг 3: Подключение библиотеки

Скомпилируйте и скомпонуйте ваше приложение с chDB:


```bash
# Компиляция на C
gcc -o myapp myapp.c -lchdb
```


# Компиляция на C++

g++ -o myapp myapp.cpp -lchdb

```
```


## Примеры на C

### Базовое подключение и выполнение запросов

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    // Создать параметры подключения
    char* args[] = {"chdb", "--path", "/tmp/chdb-data"};
    int argc = 3;
    
    // Подключиться к chDB
    chdb_connection* conn = chdb_connect(argc, args);
    if (!conn) {
        printf("Не удалось подключиться к chDB\n");
        return 1;
    }
    
    // Выполнить запрос
    chdb_result* result = chdb_query(*conn, "SELECT version()", "CSV");
    if (!result) {
        printf("Не удалось выполнить запрос\n");
        chdb_close_conn(conn);
        return 1;
    }
    
    // Проверить наличие ошибок
    const char* error = chdb_result_error(result);
    if (error) {
        printf("Ошибка запроса: %s\n", error);
    } else {
        // Получить данные результата запроса
        char* data = chdb_result_buffer(result);
        size_t length = chdb_result_length(result);
        double elapsed = chdb_result_elapsed(result);
        uint64_t rows = chdb_result_rows_read(result);
        
        printf("Результат: %.*s\n", (int)length, data);
        printf("Время выполнения: %.3f секунд\n", elapsed);
        printf("Строк: %llu\n", rows);
    }
    
    // Освобождение ресурсов
    chdb_destroy_query_result(result);
    chdb_close_conn(conn);
    return 0;
}
```

### Стриминговые запросы

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    char* args[] = {"chdb", "--path", "/tmp/chdb-stream"};
    chdb_connection* conn = chdb_connect(3, args);
    
    if (!conn) {
        printf("Не удалось установить соединение\n");
        return 1;
    }
    
    // Запуск потокового запроса
    chdb_result* stream_result = chdb_stream_query(*conn, 
        "SELECT number FROM system.numbers LIMIT 1000000", "CSV");
    
    if (!stream_result) {
        printf("Не удалось запустить потоковый запрос\n");
        chdb_close_conn(conn);
        return 1;
    }
    
    uint64_t total_rows = 0;
    
    // Обработка блоков
    while (true) {
        chdb_result* chunk = chdb_stream_fetch_result(*conn, stream_result);
        if (!chunk) break;
        
        // Проверка наличия данных в этом блоке
        size_t chunk_length = chdb_result_length(chunk);
        if (chunk_length == 0) {
            chdb_destroy_query_result(chunk);
            break; // End of stream
        }
        
        uint64_t chunk_rows = chdb_result_rows_read(chunk);
        total_rows += chunk_rows;
        
        printf("Обработан блок: %llu строк, %zu байт\n", chunk_rows, chunk_length);
        
        // Здесь можно обрабатывать данные блока
        // char* data = chdb_result_buffer(chunk);
        
        chdb_destroy_query_result(chunk);
        
        // Отчет о ходе выполнения
        if (total_rows % 100000 == 0) {
            printf("Ход выполнения: обработано %llu строк\n", total_rows);
        }
    }
    
    printf("Потоковый запрос завершен. Всего строк: %llu\n", total_rows);
    
    // Освобождение ресурсов потокового запроса
    chdb_destroy_query_result(stream_result);
    chdb_close_conn(conn);
    return 0;
}
```

### Работа с разными форматами данных

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    char* args[] = {"chdb"};
    chdb_connection* conn = chdb_connect(1, args);
    
    const char* query = "SELECT number, toString(number) as str FROM system.numbers LIMIT 3";
    
    // Формат CSV
    chdb_result* csv_result = chdb_query(*conn, query, "CSV");
    printf("Результат в формате CSV:\n%.*s\n\n", 
           (int)chdb_result_length(csv_result), 
           chdb_result_buffer(csv_result));
    chdb_destroy_query_result(csv_result);
    
    // Формат JSON
    chdb_result* json_result = chdb_query(*conn, query, "JSON");
    printf("Результат в формате JSON:\n%.*s\n\n", 
           (int)chdb_result_length(json_result), 
           chdb_result_buffer(json_result));
    chdb_destroy_query_result(json_result);
```


// Форматированный вывод
chdb&#95;result* pretty&#95;result = chdb&#95;query(*conn, query, &quot;Pretty&quot;);
printf(&quot;Pretty Result:\n%.*s\n\n&quot;,
(int)chdb&#95;result&#95;length(pretty&#95;result),
chdb&#95;result&#95;buffer(pretty&#95;result));
chdb&#95;destroy&#95;query&#95;result(pretty&#95;result);

chdb&#95;close&#95;conn(conn);
return 0;
&#125;

```
```


## Пример на C++

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
        // Преобразуем вектор строк в массив указателей char*
        std::vector<char*> argv;
        for (const auto& arg : args) {
            argv.push_back(const_cast<char*>(arg.c_str()));
        }
        
        conn = chdb_connect(argv.size(), argv.data());
        if (!conn) {
            throw std::runtime_error("Не удалось подключиться к chDB");
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
            throw std::runtime_error("Не удалось выполнить запрос");
        }
        
        const char* error = chdb_result_error(result);
        if (error) {
            std::string error_msg(error);
            chdb_destroy_query_result(result);
            throw std::runtime_error("Ошибка запроса: " + error_msg);
        }
        
        std::string data(chdb_result_buffer(result), chdb_result_length(result));
        
        // Получение статистики запроса
        std::cout << "Статистика запроса:\n";
        std::cout << "  Время выполнения: " << chdb_result_elapsed(result) << " секунд\n";
        std::cout << "  Прочитано строк: " << chdb_result_rows_read(result) << "\n";
        std::cout << "  Прочитано байт: " << chdb_result_bytes_read(result) << "\n";
        
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
        
        // Запросы в разных форматах
        std::cout << "Результаты в формате CSV:\n" << db.query("SELECT * FROM test", "CSV") << "\n";
        std::cout << "Результаты в формате JSON:\n" << db.query("SELECT * FROM test", "JSON") << "\n";
        
        // Агрегирующий запрос
        std::cout << "Количество: " << db.query("SELECT COUNT(*) FROM test") << "\n";
        
    } catch (const std::exception& e) {
        std::cerr << "Ошибка: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```


## Лучшие практики обработки ошибок

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
        printf("Не удалось установить подключение\n");
        return 1;
    }
    
    // Выполнение запроса
    result = chdb_query(*conn, "SELECT invalid_syntax", "CSV");
    if (!result) {
        printf("Ошибка при выполнении запроса\n");
        return_code = 1;
        goto cleanup;
    }
    
    // Проверка ошибок в запросе
    const char* error = chdb_result_error(result);
    if (error) {
        printf("Ошибка запроса: %s\n", error);
        return_code = 1;
        goto cleanup;
    }
    
    // Обработка успешного результата
    printf("Результат: %.*s\n", 
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
- **Проблемы и поддержка**: сообщайте о проблемах в [репозитории GitHub](https://github.com/chdb-io/chdb/issues)
- **Документация по C API**: [документация по биндингам](https://github.com/chdb-io/chdb/blob/main/bindings.md)
