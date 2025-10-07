---
'title': 'chDB for C と C++'
'sidebar_label': 'C と C++'
'slug': '/chdb/install/c'
'description': 'C と C++ で chDB をインストールし、使用する方法'
'keywords':
- 'chdb'
- 'c'
- 'cpp'
- 'embedded'
- 'clickhouse'
- 'sql'
- 'olap'
- 'api'
'doc_type': 'guide'
---


# chDB for C and C++

chDBは、ClickHouseの機能を直接アプリケーションに組み込むためのネイティブC/C++ APIを提供します。このAPIは、シンプルなクエリや持続的接続、ストリーミングクエリ結果などの高度な機能の両方をサポートしています。

## インストール {#installation}

### ステップ1: libchdbをインストール {#install-libchdb}

システムにchDBライブラリをインストールしてください。

```bash
curl -sL https://lib.chdb.io | bash
```

### ステップ2: ヘッダーを含める {#include-headers}

プロジェクトにchDBヘッダーを含めてください。

```c
#include <chdb.h>
```

### ステップ3: ライブラリをリンク {#link-library}

chDBでアプリケーションをコンパイルしリンクしてください。

```bash

# C compilation
gcc -o myapp myapp.c -lchdb


# C++ compilation  
g++ -o myapp myapp.cpp -lchdb
```

## Cの例 {#c-examples}

### 基本的な接続とクエリ {#basic-connection-queries}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    // Create connection arguments
    char* args[] = {"chdb", "--path", "/tmp/chdb-data"};
    int argc = 3;

    // Connect to chDB
    chdb_connection* conn = chdb_connect(argc, args);
    if (!conn) {
        printf("Failed to connect to chDB\n");
        return 1;
    }

    // Execute a query
    chdb_result* result = chdb_query(*conn, "SELECT version()", "CSV");
    if (!result) {
        printf("Query execution failed\n");
        chdb_close_conn(conn);
        return 1;
    }

    // Check for errors
    const char* error = chdb_result_error(result);
    if (error) {
        printf("Query error: %s\n", error);
    } else {
        // Get result data
        char* data = chdb_result_buffer(result);
        size_t length = chdb_result_length(result);
        double elapsed = chdb_result_elapsed(result);
        uint64_t rows = chdb_result_rows_read(result);

        printf("Result: %.*s\n", (int)length, data);
        printf("Elapsed: %.3f seconds\n", elapsed);
        printf("Rows: %llu\n", rows);
    }

    // Cleanup
    chdb_destroy_query_result(result);
    chdb_close_conn(conn);
    return 0;
}
```

### ストリーミングクエリ {#streaming-queries}

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

    // Start streaming query
    chdb_result* stream_result = chdb_stream_query(*conn, 
        "SELECT number FROM system.numbers LIMIT 1000000", "CSV");

    if (!stream_result) {
        printf("Failed to start streaming query\n");
        chdb_close_conn(conn);
        return 1;
    }

    uint64_t total_rows = 0;

    // Process chunks
    while (true) {
        chdb_result* chunk = chdb_stream_fetch_result(*conn, stream_result);
        if (!chunk) break;

        // Check if we have data in this chunk
        size_t chunk_length = chdb_result_length(chunk);
        if (chunk_length == 0) {
            chdb_destroy_query_result(chunk);
            break; // End of stream
        }

        uint64_t chunk_rows = chdb_result_rows_read(chunk);
        total_rows += chunk_rows;

        printf("Processed chunk: %llu rows, %zu bytes\n", chunk_rows, chunk_length);

        // Process the chunk data here
        // char* data = chdb_result_buffer(chunk);

        chdb_destroy_query_result(chunk);

        // Progress reporting
        if (total_rows % 100000 == 0) {
            printf("Progress: %llu rows processed\n", total_rows);
        }
    }

    printf("Streaming complete. Total rows: %llu\n", total_rows);

    // Cleanup streaming query
    chdb_destroy_query_result(stream_result);
    chdb_close_conn(conn);
    return 0;
}
```

### 異なるデータフォーマットでの作業 {#data-formats}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    char* args[] = {"chdb"};
    chdb_connection* conn = chdb_connect(1, args);

    const char* query = "SELECT number, toString(number) as str FROM system.numbers LIMIT 3";

    // CSV format
    chdb_result* csv_result = chdb_query(*conn, query, "CSV");
    printf("CSV Result:\n%.*s\n\n", 
           (int)chdb_result_length(csv_result), 
           chdb_result_buffer(csv_result));
    chdb_destroy_query_result(csv_result);

    // JSON format
    chdb_result* json_result = chdb_query(*conn, query, "JSON");
    printf("JSON Result:\n%.*s\n\n", 
           (int)chdb_result_length(json_result), 
           chdb_result_buffer(json_result));
    chdb_destroy_query_result(json_result);

    // Pretty format
    chdb_result* pretty_result = chdb_query(*conn, query, "Pretty");
    printf("Pretty Result:\n%.*s\n\n", 
           (int)chdb_result_length(pretty_result), 
           chdb_result_buffer(pretty_result));
    chdb_destroy_query_result(pretty_result);

    chdb_close_conn(conn);
    return 0;
}
```

## C++の例 {#cpp-example}

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
        // Convert string vector to char* array
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

        // Get query statistics
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
        // Create connection
        ChDBConnection db({{"chdb", "--path", "/tmp/chdb-cpp"}});

        // Create and populate table
        db.query("CREATE TABLE test (id UInt32, value String) ENGINE = MergeTree() ORDER BY id");
        db.query("INSERT INTO test VALUES (1, 'hello'), (2, 'world'), (3, 'chdb')");

        // Query with different formats
        std::cout << "CSV Results:\n" << db.query("SELECT * FROM test", "CSV") << "\n";
        std::cout << "JSON Results:\n" << db.query("SELECT * FROM test", "JSON") << "\n";

        // Aggregation query
        std::cout << "Count: " << db.query("SELECT COUNT(*) FROM test") << "\n";

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
```

## エラーハンドリングのベストプラクティス {#error-handling}

```c
#include <stdio.h>
#include <chdb.h>

int safe_query_example() {
    chdb_connection* conn = NULL;
    chdb_result* result = NULL;
    int return_code = 0;

    // Create connection
    char* args[] = {"chdb"};
    conn = chdb_connect(1, args);
    if (!conn) {
        printf("Failed to create connection\n");
        return 1;
    }

    // Execute query
    result = chdb_query(*conn, "SELECT invalid_syntax", "CSV");
    if (!result) {
        printf("Query execution failed\n");
        return_code = 1;
        goto cleanup;
    }

    // Check for query errors
    const char* error = chdb_result_error(result);
    if (error) {
        printf("Query error: %s\n", error);
        return_code = 1;
        goto cleanup;
    }

    // Process successful result
    printf("Result: %.*s\n", 
           (int)chdb_result_length(result), 
           chdb_result_buffer(result));

cleanup:
    if (result) chdb_destroy_query_result(result);
    if (conn) chdb_close_conn(conn);
    return return_code;
}
```

## GitHubリポジトリ {#github-repository}

- **メインリポジトリ**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **問題とサポート**: [GitHubリポジトリ](https://github.com/chdb-io/chdb/issues)で問題を報告
- **C APIドキュメント**: [バインディングドキュメント](https://github.com/chdb-io/chdb/blob/main/bindings.md)
