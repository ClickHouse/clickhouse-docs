
# Installing chDB for C and C++

## Requirements 

Install [libchdb](https://github.com/chdb-io/chdb):

```bash
curl -sL https://lib.chdb.io | bash
```


## Usage 

Follow the instructions for [libchdb](https://github.com/chdb-io/chdb/blob/main/bindings.md) to get started.

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
