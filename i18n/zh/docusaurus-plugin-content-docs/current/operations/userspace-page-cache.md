---
'description': '缓存机制，允许在进程内存中缓存数据，而不是依赖于操作系统的页面缓存。'
'sidebar_label': '用户空间页缓存'
'sidebar_position': 65
'slug': '/operations/userspace-page-cache'
'title': 'Userspace page cache'
---




# 用户空间页面缓存

## 概述 {#overview}

> 用户空间页面缓存是一种新的缓存机制，它允许在进程内内存中缓存数据，而不是依赖操作系统页面缓存。

ClickHouse已经提供了 [文件系统缓存](/docs/operations/storing-data) 作为在 Amazon S3、Google Cloud Storage (GCS) 或 Azure Blob Storage 等远程对象存储上进行缓存的一种方式。用户空间页面缓存的设计是为了加速访问远程数据，以便在正常的操作系统缓存表现不佳时能提供更好的性能。

它与文件系统缓存的不同之处在于：

| 文件系统缓存                                            | 用户空间页面缓存                          |
|---------------------------------------------------------|---------------------------------------------|
| 将数据写入本地文件系统                                 | 仅存在于内存中                            |
| 占用磁盘空间（在tmpfs上也是可配置的）                  | 与文件系统独立                           |
| 能够在服务器重启后存活                                | 不会在服务器重启后存活                  |
| 不会显示在服务器的内存使用中                           | 会显示在服务器的内存使用中              |
| 适合于磁盘存储和内存（操作系统页面缓存）              | **适合无磁盘服务器**                      |

## 配置设置和使用 {#configuration-settings-and-usage}

### 使用 {#usage}

要启用用户空间页面缓存，请首先在服务器上进行配置：

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
用户空间页面缓存将使用最多指定的内存量，但该内存量并不是保留的。当需要用于其他服务器需求时，该内存将被逐出。
:::

接下来，在查询级别上启用其使用：

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 设置 {#settings}

| 设置                                                      | 描述                                                                                                                                                                                                                                                                                                                | 默认值       |
|----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `use_page_cache_for_disks_without_file_cache`            | 对于未启用文件系统缓存的远程磁盘，使用用户空间页面缓存。                                                                                                                                                                                                                                                             | `0`           |
| `use_page_cache_with_distributed_cache`                  | 当使用分布式缓存时，使用用户空间页面缓存。                                                                                                                                                                                                                                                                          | `0`           |
| `read_from_page_cache_if_exists_otherwise_bypass_cache`  | 在被动模式下使用用户空间页面缓存，类似于 [`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache)。                                                                                                                            | `0`           |
| `page_cache_inject_eviction`                             | 用户空间页面缓存将随机使某些页面无效。用于测试目的。                                                                                                                                                                                                                                                                 | `0`           |
| `page_cache_block_size`                                  | 用户空间页面缓存中存储的文件块大小，单位为字节。所有通过缓存的读取都将四舍五入到该大小的倍数。                                                                                                                                                                                                                         | `1048576`     |
| `page_cache_history_window_ms`                           | 释放的内存在可被用户空间页面缓存使用的延迟。                                                                                                                                                                                                                                                                         | `1000`        |
| `page_cache_policy`                                      | 用户空间页面缓存策略名称。                                                                                                                                                                                                                                                                                          | `SLRU`        |
| `page_cache_size_ratio`                                  | 用户空间页面缓存中保护队列的大小相对于缓存的总大小。                                                                                                                                                                                                                                                                 | `0.5`         |
| `page_cache_min_size`                                    | 用户空间页面缓存的最小大小。                                                                                                                                                                                                                                                                                        | `104857600`   |
| `page_cache_max_size`                                    | 用户空间页面缓存的最大大小。设置为 0 以禁用缓存。如果大于 page_cache_min_size，缓存大小将不断在此范围内调整，以尽可能使用大部分可用内存，同时保持总内存使用低于限制 (`max_server_memory_usage`\[`_to_ram_ratio`\])。 | `0`           |
| `page_cache_free_memory_ratio`                           | 从用户空间页面缓存中保持空闲的内存比例。类似于 Linux 的 min_free_kbytes 设置。                                                                                                                                                                                                                                      | `0.15`        |
| `page_cache_lookahead_blocks`                            | 在用户空间页面缓存未命中的情况下，从底层存储一次读取多个连续块，如果它们也不在缓存中。每个块的大小为 page_cache_block_size 字节。                                                                                                                                                                                   | `16`          |
| `page_cache_shards`                                      | 将用户空间页面缓存分条到多个分片，以减少互斥锁争用。这是实验性的，可能不会提高性能。                                                                                                                                                                                                                                  | `4`           |

## 相关内容 {#related-content}
- [文件系统缓存](/docs/operations/storing-data)
- [ClickHouse v25.3 发布网络研讨会](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
