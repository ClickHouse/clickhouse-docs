---
title: '适用于 C 和 C++ 的 chDB'
sidebar_label: 'C 和 C++'
slug: /chdb/install/c
description: '如何在 C 和 C++ 中安装和使用 chDB'
keywords: ['chdb', 'c', 'cpp', 'embedded', 'clickhouse', 'sql', 'olap', 'api']
doc_type: 'guide'
---

# 适用于 C 和 C++ 的 chDB {#chdb-for-c-and-c}

chDB 提供原生的 C/C++ API，可将 ClickHouse 的功能直接嵌入到您的应用程序中。该 API 既支持简单查询,也支持高级特性,例如持久连接和查询结果的流式处理。

## 安装 {#installation}

### 步骤 1:安装 libchdb {#install-libchdb}

在你的系统上安装 chDB 库:

```bash
curl -sL https://lib.chdb.io | bash
```

### 步骤 2:添加头文件 {#include-headers}

将 chDB 头文件包含到你的项目中:

```c
#include <chdb.h>
```

### 步骤 3:链接库 {#link-library}

将你的应用程序与 chDB 一起编译并链接:

```bash
# 使用 C 编译
gcc -o myapp myapp.c -lchdb

# 使用 C++ 编译
g++ -o myapp myapp.cpp -lchdb
```

## C 语言示例 {#c-examples}

### 基本连接和查询 {#basic-connection-queries}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    // 创建连接参数
    char* args[] = {"chdb", "--path", "/tmp/chdb-data"};
    int argc = 3;
    
    // 连接 chDB
    chdb_connection* conn = chdb_connect(argc, args);
    if (!conn) {
        printf("无法连接到 chDB\n");
        return 1;
    }
    
    // 执行查询
    chdb_result* result = chdb_query(*conn, "SELECT version()", "CSV");
    if (!result) {
        printf("查询执行失败\n");
        chdb_close_conn(conn);
        return 1;
    }
    
    // 检查是否出错
    const char* error = chdb_result_error(result);
    if (error) {
        printf("查询出错:%s\n", error);
    } else {
        // 获取结果数据
        char* data = chdb_result_buffer(result);
        size_t length = chdb_result_length(result);
        double elapsed = chdb_result_elapsed(result);
        uint64_t rows = chdb_result_rows_read(result);
        
        printf("结果:%.*s\n", (int)length, data);
        printf("耗时:%.3f 秒\n", elapsed);
        printf("行数:%llu\n", rows);
    }
    
    // 清理资源
    chdb_destroy_query_result(result);
    chdb_close_conn(conn);
    return 0;
}
```

### 流式查询 {#streaming-queries}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    char* args[] = {"chdb", "--path", "/tmp/chdb-stream"};
    chdb_connection* conn = chdb_connect(3, args);
    
    if (!conn) {
        printf("连接失败\n");
        return 1;
    }
    
    // 启动流式查询
    chdb_result* stream_result = chdb_stream_query(*conn, 
        "SELECT number FROM system.numbers LIMIT 1000000", "CSV");
    
    if (!stream_result) {
        printf("启动流式查询失败\n");
        chdb_close_conn(conn);
        return 1;
    }
    
    uint64_t total_rows = 0;
    
    // 处理数据块
    while (true) {
        chdb_result* chunk = chdb_stream_fetch_result(*conn, stream_result);
        if (!chunk) break;
        
        // 检查当前数据块中是否有数据
        size_t chunk_length = chdb_result_length(chunk);
        if (chunk_length == 0) {
            chdb_destroy_query_result(chunk);
            break; // 流结束
        }
        
        uint64_t chunk_rows = chdb_result_rows_read(chunk);
        total_rows += chunk_rows;
        
        printf("已处理数据块:%llu 行,%zu 字节\n", chunk_rows, chunk_length);
        
        // 在此处理数据块内容
        // char* data = chdb_result_buffer(chunk);
        
        chdb_destroy_query_result(chunk);
        
        // 输出进度
        if (total_rows % 100000 == 0) {
            printf("进度:已处理 %llu 行\n", total_rows);
        }
    }
    
    printf("流式处理完成,总行数:%llu\n", total_rows);
    
    // 清理流式查询
    chdb_destroy_query_result(stream_result);
    chdb_close_conn(conn);
    return 0;
}
```

### 处理不同的数据格式 {#data-formats}

```c
#include <stdio.h>
#include <chdb.h>

int main() {
    char* args[] = {"chdb"};
    chdb_connection* conn = chdb_connect(1, args);
    
    const char* query = "SELECT number, toString(number) as str FROM system.numbers LIMIT 3";
    
    // CSV 格式
    chdb_result* csv_result = chdb_query(*conn, query, "CSV");
    printf("CSV 结果:\n%.*s\n\n", 
           (int)chdb_result_length(csv_result), 
           chdb_result_buffer(csv_result));
    chdb_destroy_query_result(csv_result);
    
    // JSON 格式
    chdb_result* json_result = chdb_query(*conn, query, "JSON");
    printf("JSON 结果:\n%.*s\n\n", 
           (int)chdb_result_length(json_result), 
           chdb_result_buffer(json_result));
    chdb_destroy_query_result(json_result);
    
    // 美化输出格式
    chdb_result* pretty_result = chdb_query(*conn, query, "Pretty");
    printf("Pretty 结果:\n%.*s\n\n",
           (int)chdb_result_length(pretty_result),
           chdb_result_buffer(pretty_result));
    chdb_destroy_query_result(pretty_result);
    
    chdb_close_conn(conn);
    return 0;
}
```

## C++ 示例 {#cpp-example}

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
        // 将字符串 vector 转换为 char* 数组
        std::vector<char*> argv;
        for (const auto& arg : args) {
            argv.push_back(const_cast<char*>(arg.c_str()));
        }
        
        conn = chdb_connect(argv.size(), argv.data());
        if (!conn) {
            throw std::runtime_error("连接 chDB 失败");
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
            throw std::runtime_error("查询执行失败");
        }
        
        const char* error = chdb_result_error(result);
        if (error) {
            std::string error_msg(error);
            chdb_destroy_query_result(result);
            throw std::runtime_error("查询出错:" + error_msg);
        }
        
        std::string data(chdb_result_buffer(result), chdb_result_length(result));
        
        // 获取查询统计信息
        std::cout << "查询统计信息:\n";
        std::cout << "  耗时:" << chdb_result_elapsed(result) << " 秒\n";
        std::cout << "  已读取行数:" << chdb_result_rows_read(result) << "\n";
        std::cout << "  已读取字节数:" << chdb_result_bytes_read(result) << "\n";
        
        chdb_destroy_query_result(result);
        return data;
    }
};

int main() {
    try {
        // 创建连接
        ChDBConnection db({"chdb", "--path", "/tmp/chdb-cpp"});
        
        // 创建并写入表数据
        db.query("CREATE TABLE test (id UInt32, value String) ENGINE = MergeTree() ORDER BY id");
        db.query("INSERT INTO test VALUES (1, 'hello'), (2, 'world'), (3, 'chdb')");
        
        // 使用不同格式进行查询
        std::cout << "CSV 结果:\n" << db.query("SELECT * FROM test", "CSV") << "\n";
        std::cout << "JSON 结果:\n" << db.query("SELECT * FROM test", "JSON") << "\n";
        
        // 聚合查询
        std::cout << "计数结果:" << db.query("SELECT COUNT(*) FROM test") << "\n";
        
    } catch (const std::exception& e) {
        std::cerr << "错误:" << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
```

## 错误处理最佳实践 {#error-handling}

```c
#include <stdio.h>
#include <chdb.h>

int safe_query_example() {
    chdb_connection* conn = NULL;
    chdb_result* result = NULL;
    int return_code = 0;
    
    // 创建连接
    char* args[] = {"chdb"};
    conn = chdb_connect(1, args);
    if (!conn) {
        printf("创建连接失败\n");
        return 1;
    }
    
    // 执行查询
    result = chdb_query(*conn, "SELECT invalid_syntax", "CSV");
    if (!result) {
        printf("查询执行失败\n");
        return_code = 1;
        goto cleanup;
    }
    
    // 检查查询是否出错
    const char* error = chdb_result_error(result);
    if (error) {
        printf("查询出错:%s\n", error);
        return_code = 1;
        goto cleanup;
    }
    
    // 处理成功返回的结果
    printf("结果:%.*s\n", 
           (int)chdb_result_length(result), 
           chdb_result_buffer(result));
    
cleanup:
    if (result) chdb_destroy_query_result(result);
    if (conn) chdb_close_conn(conn);
    return return_code;
}
```

## GitHub 仓库 {#github-repository}

- **主仓库**: [chdb-io/chdb](https://github.com/chdb-io/chdb)
- **问题与支持**:在 [GitHub 仓库](https://github.com/chdb-io/chdb/issues) 中提交 Issue
- **C API 文档**: [绑定文档](https://github.com/chdb-io/chdb/blob/main/bindings.md)