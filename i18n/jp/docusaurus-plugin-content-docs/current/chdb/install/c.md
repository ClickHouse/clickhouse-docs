---
title: 'chDB for C and C++'
sidebar_label: 'C and C++'
slug: /chdb/install/c
description: 'How to install and use chDB with C and C++'
keywords: ['chdb', 'c', 'cpp', 'embedded', 'clickhouse', 'sql', 'olap', 'api']
doc_type: 'guide'
---

# C および C++ 用 chDB \{#chdb-for-c-and-c\}

chDB は、ClickHouse の機能をアプリケーションに直接組み込むためのネイティブ C/C++ API を提供します。この API は、シンプルなクエリと、永続的な接続やストリーミングクエリ結果などの高度な機能の両方をサポートしています。

## インストール \\{#installation\\}

### ステップ 1: libchdb をインストール \\{#install-libchdb\\}

システムに chDB ライブラリをインストールします:

```bash
curl -sL https://lib.chdb.io | bash
```

### ステップ 2: ヘッダーをインクルード \\{#include-headers\\}

プロジェクトに chDB ヘッダーをインクルードします:

```c
#include <chdb.h>
```

### ステップ 3: ライブラリをリンク \\{#link-library\\}

chDB を使用してアプリケーションをコンパイルおよびリンクします:

```bash
# C コンパイル
gcc -o myapp myapp.c -lchdb

# C++ コンパイル
g++ -o myapp myapp.cpp -lchdb
```

## C の例 \\{#c-examples\\}

### 基本的な接続とクエリ \\{#basic-connection-queries\\}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    // 接続引数を作成
    char* args[] = {"chdb", "--path", "/tmp/chdb-data"};
    int argc = 3;

    // chDB に接続
    chdb_connection* conn = chdb_connect(argc, args);
    if (!conn) {
        printf("Failed to connect to chDB\n");
        return 1;
    }

    // クエリを実行
    chdb_result* result = chdb_query(*conn, "SELECT version()", "CSV");
    if (!result) {
        printf("Query execution failed\n");
        chdb_close_conn(conn);
        return 1;
    }

    // エラーをチェック
    const char* error = chdb_result_error(result);
    if (error) {
        printf("Query error: %s\n", error);
    } else {
        // 結果データを取得
        char* data = chdb_result_buffer(result);
        size_t length = chdb_result_length(result);
        double elapsed = chdb_result_elapsed(result);
        uint64_t rows = chdb_result_rows_read(result);

        printf("Result: %.*s\n", (int)length, data);
        printf("Elapsed: %.3f seconds\n", elapsed);
        printf("Rows: %llu\n", rows);
    }

    // クリーンアップ
    chdb_destroy_query_result(result);
    chdb_close_conn(conn);
    return 0;
}
```

### ストリーミングクエリ \\{#streaming-queries\\}

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

    // ストリーミングクエリを開始
    chdb_result* stream_result = chdb_stream_query(*conn,
        "SELECT number FROM system.numbers LIMIT 1000000", "CSV");

    if (!stream_result) {
        printf("Failed to start streaming query\n");
        chdb_close_conn(conn);
        return 1;
    }

    uint64_t total_rows = 0;

    // チャンクを処理
    while (true) {
        chdb_result* chunk = chdb_stream_fetch_result(*conn, stream_result);
        if (!chunk) break;

        // このチャンクにデータがあるかチェック
        size_t chunk_length = chdb_result_length(chunk);
        if (chunk_length == 0) {
            chdb_destroy_query_result(chunk);
            break; // ストリームの終了
        }

        uint64_t chunk_rows = chdb_result_rows_read(chunk);
        total_rows += chunk_rows;

        printf("Processed chunk: %llu rows, %zu bytes\n", chunk_rows, chunk_length);

        // ここでチャンクデータを処理
        // char* data = chdb_result_buffer(chunk);

        chdb_destroy_query_result(chunk);

        // 進捗レポート
        if (total_rows % 100000 == 0) {
            printf("Progress: %llu rows processed\n", total_rows);
        }
    }

    printf("Streaming complete. Total rows: %llu\n", total_rows);

    // ストリーミングクエリのクリーンアップ
    chdb_destroy_query_result(stream_result);
    chdb_close_conn(conn);
    return 0;
}
```

### 異なるデータフォーマットでの作業 \\{#data-formats\\}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    char* args[] = {"chdb"};
    chdb_connection* conn = chdb_connect(1, args);

    const char* query = "SELECT number, toString(number) as str FROM system.numbers LIMIT 3";

    // CSV フォーマット
    chdb_result* csv_result = chdb_query(*conn, query, "CSV");
    printf("CSV Result:\n%.*s\n\n",
           (int)chdb_result_length(csv_result),
           chdb_result_buffer(csv_result));
    chdb_destroy_query_result(csv_result);

    // JSON フォーマット
    chdb_result* json_result = chdb_query(*conn, query, "JSON");
    printf("JSON Result:\n%.*s\n\n",
           (int)chdb_result_length(json_result),
           chdb_result_buffer(json_result));
    chdb_destroy_query_result(json_result);

    // Pretty フォーマット
    chdb_result* pretty_result = chdb_query(*conn, query, "Pretty");
    printf("Pretty Result:\n%.*s\n\n",
           (int)chdb_result_length(pretty_result),
           chdb_result_buffer(pretty_result));
    chdb_destroy_query_result(pretty_result);

    chdb_close_conn(conn);
    return 0;
}
```

## C++ の例 \\{#cpp-example\\}

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
        // string vector を char* 配列に変換
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

        // クエリ統計を取得
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
        // 接続を作成
        ChDBConnection db({{"chdb", "--path", "/tmp/chdb-cpp"}});

        // テーブルを作成してデータを投入
        db.query("CREATE TABLE test (id UInt32, value String) ENGINE = MergeTree() ORDER BY id");
        db.query("INSERT INTO test VALUES (1, 'hello'), (2, 'world'), (3, 'chdb')");

        // 異なるフォーマットでクエリ
        std::cout << "CSV Results:\n" << db.query("SELECT * FROM test", "CSV") << "\n";
        std::cout << "JSON Results:\n" << db.query("SELECT * FROM test", "JSON") << "\n";

        // 集計クエリ
        std::cout << "Count: " << db.query("SELECT COUNT(*) FROM test") << "\n";

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
```

## エラーハンドリングのベストプラクティス \\{#error-handling\\}

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
        printf("Failed to create connection\n");
        return 1;
    }

    // クエリを実行
    result = chdb_query(*conn, "SELECT invalid_syntax", "CSV");
    if (!result) {
        printf("Query execution failed\n");
        return_code = 1;
        goto cleanup;
    }

    // クエリエラーをチェック
    const char* error = chdb_result_error(result);
    if (error) {
        printf("Query error: %s\n", error);
        return_code = 1;
        goto cleanup;
    }

    // 成功した結果を処理
    printf("Result: %.*s\n",
           (int)chdb_result_length(result),
           chdb_result_buffer(result));

cleanup:
    if (result) chdb_destroy_query_result(result);
    if (conn) chdb_close_conn(conn);
    return return_code;
}
```

## GitHub リポジトリ \\{#github-repository\\}

- **メインリポジトリ**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **イシューとサポート**: [GitHub リポジトリ](https://github.com/chdb-io/chdb/issues)で問題を報告してください
- **C API ドキュメント**: [バインディングドキュメント](https://github.com/chdb-io/chdb/blob/main/bindings.md)
