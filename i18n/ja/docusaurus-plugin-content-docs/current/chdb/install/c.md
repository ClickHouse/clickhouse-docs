---
title: CおよびC++向けのchDBのインストール
sidebar_label: CおよびC++
slug: /chdb/install/c
description: CおよびC++向けのchDBのインストール方法
keywords: [chdb, 組み込み, clickhouse-lite, インストール]
---

# CおよびC++向けのchDBのインストール

## 要件 {#requirements}

[libchdb](https://github.com/chdb-io/chdb) をインストールします：

```bash
curl -sL https://lib.chdb.io | bash
```

## 使い方 {#usage}

始めるために[libchdb](https://github.com/chdb-io/chdb/blob/main/bindings.md)の指示に従ってください。

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
