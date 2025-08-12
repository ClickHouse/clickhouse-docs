---
title: 'C および C++ 用の chDB のインストール'
sidebar_label: 'C および C++'
slug: '/chdb/install/c'
description: 'C および C++ 用の chDB のインストール方法'
keywords:
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'install'
---




# chDBのCおよびC++へのインストール

## 要件 {#requirements}

[libchdb](https://github.com/chdb-io/chdb) をインストールします:

```bash
curl -sL https://lib.chdb.io | bash
```

## 使用法 {#usage}

[libchdb](https://github.com/chdb-io/chdb/blob/main/bindings.md) の手順に従って始めてください。

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
