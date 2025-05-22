---
'description': '缓存机制，允许在进程内存中缓存数据，而不依赖于操作系统页面缓存。'
'sidebar_label': '用户空间页面缓存'
'sidebar_position': 65
'slug': '/operations/userspace-page-cache'
'title': '用户空间页面缓存'
---


# 用户空间页缓存

## 概述 {#overview}

> 用户空间页缓存是一种新的缓存机制，允许在进程内存中缓存数据，而不是依赖操作系统的页缓存。

ClickHouse 已经提供了 [文件系统缓存](/docs/operations/storing-data) 作为在 Amazon S3、Google Cloud Storage (GCS) 或 Azure Blob Storage 等远程对象存储之上的缓存方式。用户空间页缓存的设计旨在加速远程数据的访问，当正常的操作系统缓存无法满足需求时使用。

它与文件系统缓存有以下不同之处：

| 文件系统缓存                                         | 用户空间页缓存                           |
|-----------------------------------------------------|------------------------------------------|
| 将数据写入本地文件系统                              | 仅存在于内存中                           |
| 占用磁盘空间（也可以在 tmpfs 上配置）              | 不依赖于文件系统                         |
| 能够在服务器重启后存活                             | 在服务器重启后无法存活                 |
| 不会显示在服务器的内存使用中                       | 会显示在服务器的内存使用中              |
| 适合本地磁盘和内存（操作系统页缓存）               | **适合无磁盘服务器**                     |

## 配置设置和使用 {#configuration-settings-and-usage}

### 使用 {#usage}

要启用用户空间页缓存，首先需要在服务器上进行配置：

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
用户空间页缓存将使用指定量的内存，但这部分内存并不是保留的。当服务器需要其他内存时，这部分内存会被逐出。
:::

接下来，启用查询级别的使用：

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 设置 {#settings}

| 设置                                                      | 描述                                                                                                                                                                                                                                                                                                                  | 默认值       |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `use_page_cache_for_disks_without_file_cache`             | 对于未启用文件系统缓存的远程磁盘使用用户空间页缓存。                                                                                                                                                                                                                                                               | `0`          |
| `use_page_cache_with_distributed_cache`                   | 当使用分布式缓存时使用用户空间页缓存。                                                                                                                                                                                                                                                                              | `0`          |
| `read_from_page_cache_if_exists_otherwise_bypass_cache`   | 在被动模式下使用用户空间页缓存，类似于 [`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache)。                                                                                                      | `0`          |
| `page_cache_inject_eviction`                              | 用户空间页缓存将随机无效化一些页面。用于测试。                                                                                                                                                                                                                                                                     | `0`          |
| `page_cache_block_size`                                   | 存储在用户空间页缓存中的文件块大小，以字节为单位。所有通过缓存的读取将四舍五入到此大小的倍数。                                                                                                                                                                                                                  | `1048576`    |
| `page_cache_history_window_ms`                            | 释放的内存在被用户空间页缓存使用前的延迟时间。                                                                                                                                                                                                                                                                     | `1000`       |
| `page_cache_policy`                                       | 用户空间页缓存策略名称。                                                                                                                                                                                                                                                                                             | `SLRU`       |
| `page_cache_size_ratio`                                   | 用户空间页缓存中受保护队列的大小相对于缓存总大小的比例。                                                                                                                                                                                                                                                            | `0.5`        |
| `page_cache_min_size`                                     | 用户空间页缓存的最小大小。                                                                                                                                                                                                                                                                                           | `104857600`  |
| `page_cache_max_size`                                     | 用户空间页缓存的最大大小。设置为0以禁用缓存。如果大于 page_cache_min_size，该缓存大小将持续在此范围内调整，以使用大多数可用内存，同时保持总内存使用低于限制（`max_server_memory_usage`\[`_to_ram_ratio`\]）。                                      | `0`          |
| `page_cache_free_memory_ratio`                            | 从用户空间页缓存中保持空闲的内存限制的比例。类似于 Linux min_free_kbytes 设置。                                                                                                                                                                                                                                  | `0.15`       |
| `page_cache_lookahead_blocks`                             | 在用户空间页缓存未命中时，从底层存储中一次读取多达这一数量的连续块，如果这些块也不在缓存中。每个块大小为 page_cache_block_size 字节。                                                                                                                                                                                  | `16`         |
| `page_cache_shards`                                       | 在这一数量的分片上划分用户空间页缓存，以减少互斥锁争用。实验性，可能不会提高性能。                                                                                                                                                                                                                                  | `4`          |

## 相关内容 {#related-content}
- [文件系统缓存](/docs/operations/storing-data)
- [ClickHouse v25.3 发布网络研讨会](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
