---
title: 'C および C++ 用 chDB'
sidebar_label: 'C および C++'
slug: /chdb/install/c
description: 'C および C++ で chDB をインストールして利用する方法'
keywords: ['chdb', 'c', 'cpp', 'embedded', 'clickhouse', 'sql', 'olap', 'api']
doc_type: 'guide'
---

# C および C++ 向け chDB {#chdb-for-c-and-c}

chDB は、ClickHouse の機能をアプリケーションに直接組み込むためのネイティブ C/C++ API を提供します。この API は、簡単なクエリから、永続的な接続やクエリ結果のストリーミングなどの高度な機能までサポートします。

## インストール {#installation}

### ステップ 1: libchdb をインストール {#install-libchdb}

お使いのシステムに chDB ライブラリをインストールします。

```bash
curl -sL https://lib.chdb.io | bash
```

### ステップ 2: ヘッダーをインクルードする {#include-headers}

プロジェクトに chDB のヘッダーファイルをインクルードします：

```c
#include <chdb.h>
```

### ステップ 3: ライブラリのリンク {#link-library}

chDB ライブラリを用いてアプリケーションをコンパイルおよびリンクします：

```bash
# C compilation
gcc -o myapp myapp.c -lchdb

# C++ compilation  
g++ -o myapp myapp.cpp -lchdb
```

# C++のコンパイル {#c-compilation}

g++ -o myapp myapp.cpp -lchdb

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

## C の例 {#c-examples}

### 基本的な接続とクエリ {#basic-connection-queries}

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

### ストリーミングクエリ {#streaming-queries}

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

### さまざまなデータ形式を扱う {#data-formats}

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

// 整形表示
chdb&#95;result* pretty&#95;result = chdb&#95;query(*conn, query, &quot;Pretty&quot;);
printf(&quot;Pretty Result:\n%.*s\n\n&quot;,
(int)chdb&#95;result&#95;length(pretty&#95;result),
chdb&#95;result&#95;buffer(pretty&#95;result));
chdb&#95;destroy&#95;query&#95;result(pretty&#95;result);

chdb&#95;close&#95;conn(conn);
return 0;
&#125;

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

## C++ の例 {#cpp-example}

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
        // 文字列ベクトルをchar*配列に変換
        std::vector<char*> argv;
        for (const auto& arg : args) {
            argv.push_back(const_cast<char*>(arg.c_str()));
        }
        
        conn = chdb_connect(argv.size(), argv.data());
        if (!conn) {
            throw std::runtime_error("chDBへの接続に失敗しました");
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
            throw std::runtime_error("クエリの実行に失敗しました");
        }
        
        const char* error = chdb_result_error(result);
        if (error) {
            std::string error_msg(error);
            chdb_destroy_query_result(result);
            throw std::runtime_error("クエリエラー: " + error_msg);
        }
        
        std::string data(chdb_result_buffer(result), chdb_result_length(result));
        
        // クエリ統計情報を取得
        std::cout << "クエリ統計情報:\n";
        std::cout << "  経過時間: " << chdb_result_elapsed(result) << " 秒\n";
        std::cout << "  読み取り行数: " << chdb_result_rows_read(result) << "\n";
        std::cout << "  読み取りバイト数: " << chdb_result_bytes_read(result) << "\n";
        
        chdb_destroy_query_result(result);
        return data;
    }
};

int main() {
    try {
        // 接続を作成
        ChDBConnection db({{"chdb", "--path", "/tmp/chdb-cpp"}});
        
        // テーブルを作成してデータを投入
        db.query("CREATE TABLE test (id UInt32, value String) ENGINE = MergeTree() ORDER BY id");
        db.query("INSERT INTO test VALUES (1, 'hello'), (2, 'world'), (3, 'chdb')");
        
        // 異なる形式でクエリを実行
        std::cout << "CSV結果:\n" << db.query("SELECT * FROM test", "CSV") << "\n";
        std::cout << "JSON結果:\n" << db.query("SELECT * FROM test", "JSON") << "\n";
        
        // 集計クエリ
        std::cout << "件数: " << db.query("SELECT COUNT(*) FROM test") << "\n";
        
    } catch (const std::exception& e) {
        std::cerr << "エラー: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## エラー処理のベストプラクティス {#error-handling}

```c
#include <stdio.h>
#include <chdb.h>

int safe_query_example() {
    chdb_connection* conn = NULL;
    chdb_result* result = NULL;
    int return_code = 0;
    
    // 接続を作成
    char* args[] = {"chdb"};
    conn = chdb_connect(1, args);
    if (!conn) {
        printf("接続の作成に失敗しました\n");
        return 1;
    }
    
    // クエリを実行
    result = chdb_query(*conn, "SELECT invalid_syntax", "CSV");
    if (!result) {
        printf("クエリの実行に失敗しました\n");
        return_code = 1;
        goto cleanup;
    }
    
    // クエリエラーを確認
    const char* error = chdb_result_error(result);
    if (error) {
        printf("クエリエラー: %s\n", error);
        return_code = 1;
        goto cleanup;
    }
    
    // 成功した結果を処理
    printf("結果: %.*s\n", 
           (int)chdb_result_length(result), 
           chdb_result_buffer(result));
    
cleanup:
    if (result) chdb_destroy_query_result(result);
    if (conn) chdb_close_conn(conn);
    return return_code;
}
```

## GitHub リポジトリ {#github-repository}

- **メインリポジトリ**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **Issue とサポート**: [GitHub リポジトリ](https://github.com/chdb-io/chdb/issues) で Issue を報告してください
- **C API ドキュメント**: [バインディングのドキュメント](https://github.com/chdb-io/chdb/blob/main/bindings.md)
