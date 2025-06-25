---
'title': '安装 chDB 适用于 C 和 C++'
'sidebar_label': 'C 和 C++'
'slug': '/chdb/install/c'
'description': '如何安装 chDB 适用于 C 和 C++'
'keywords':
- 'chdb'
- 'embedded'
- 'clickhouse-lite'
- 'install'
---


# Installing chDB for C and C++

## Requirements {#requirements}

安装 [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```


## Usage {#usage}

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
    void * _vec; // std::vector<char> *, for freeing
    double elapsed;
    uint64_t rows_read;
    uint64_t bytes_read;
};

local_result * query_stable(int argc, char ** argv);
void free_result(local_result * result);
}
```
