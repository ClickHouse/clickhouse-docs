---
title: 'Установка chDB для C и C++'
sidebar_label: 'C и C++'
slug: /chdb/install/c
description: 'Как установить chDB для C и C++'
keywords: ['chdb', 'встраиваемый', 'clickhouse-lite', 'установка']
---


# Установка chDB для C и C++

## Требования {#requirements}

Установите [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```


## Использование {#usage}

Следуйте инструкциям для [libchdb](https://github.com/chdb-io/chdb/blob/main/bindings.md), чтобы начать.

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
    void * _vec; // std::vector<char> *, для освобождения
    double elapsed;
    uint64_t rows_read;
    uint64_t bytes_read;
};

local_result * query_stable(int argc, char ** argv);
void free_result(local_result * result);
}
```
