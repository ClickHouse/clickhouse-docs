---
title: 'CおよびC++用のchDBのインストール'
sidebar_label: 'CおよびC++'
slug: /chdb/install/c
description: 'CおよびC++用のchDBのインストール方法'
keywords: ['chdb', '埋め込み', 'clickhouse-lite', 'インストール']
---


# CおよびC++用のchDBのインストール

## 要件 {#requirements}

[libchdb](https://github.com/chdb-io/chdb)をインストールします：

```bash
curl -sL https://lib.chdb.io | bash
```


## 使用法 {#usage}

始めるための手順は、[libchdb](https://github.com/chdb-io/chdb/blob/main/bindings.md)の指示に従ってください。

`chdb.h`

```c
#pragma once
#include <cstdint>
#include <stddef.h>

extern "C" {
struct local_result
{
    char * buf;
    size_t len;
    void * _vec; // std::vector<char> *, 解放用
    double elapsed;
    uint64_t rows_read;
    uint64_t bytes_read;
};

local_result * query_stable(int argc, char ** argv);
void free_result(local_result * result);
}
```
