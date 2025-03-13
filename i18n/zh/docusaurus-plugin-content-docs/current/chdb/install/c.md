---
title: 安装 chDB 以用于 C 和 C++
sidebar_label: C 和 C++
slug: /chdb/install/c
description: 如何安装 chDB 以用于 C 和 C++
keywords: [chdb, 嵌入式, clickhouse-lite, 安装]
---


# 安装 chDB 以用于 C 和 C++

## 需求 {#requirements}

安装 [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```

## 使用 {#usage}

按照 [libchdb](https://github.com/chdb-io/chdb/blob/main/bindings.md) 的说明开始使用。

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
    void * _vec; // std::vector<char> *, 用于释放
    double elapsed;
    uint64_t rows_read;
    uint64_t bytes_read;
};

local_result * query_stable(int argc, char ** argv);
void free_result(local_result * result);
}
```
