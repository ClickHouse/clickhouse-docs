---
'description': '缓存机制，允许在进程内存中缓存数据，而不是依赖于操作系统页面缓存。'
'sidebar_label': '用户空间页面缓存'
'sidebar_position': 65
'slug': '/operations/userspace-page-cache'
'title': '用户空间页面缓存'
'doc_type': 'reference'
---


# 用户空间页面缓存

## 概述 {#overview}

> 用户空间页面缓存是一种新的缓存机制，允许在进程内存中缓存数据，而不是依赖操作系统页面缓存。

ClickHouse已经提供了[文件系统缓存](/docs/operations/storing-data)，作为在远程对象存储（例如Amazon S3、Google Cloud Storage (GCS)或Azure Blob Storage）上进行缓存的方式。用户空间页面缓存旨在加快对远程数据的访问，当正常的操作系统缓存没有提供足够的性能时。

它与文件系统缓存的不同之处在于：

| 文件系统缓存                                               | 用户空间页面缓存                           |
|---------------------------------------------------------|---------------------------------------|
| 将数据写入本地文件系统                                   | 仅存在于内存中                           |
| 占用磁盘空间（在tmpfs上也可以配置）                      | 独立于文件系统                          |
| 在服务器重启后仍然有效                                  | 在服务器重启后不会保留                |
| 不会在服务器的内存使用中显示                            | 在服务器的内存使用中显示               |
| 适用于磁盘和内存（操作系统页面缓存）                     | **适用于无磁盘服务器**                  |

## 配置设置和使用 {#configuration-settings-and-usage}

### 使用 {#usage}

要启用用户空间页面缓存，首先在服务器上进行配置：

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
用户空间页面缓存将使用最多指定的内存量，但该内存量并不是保留的。当需要用于其他服务器需求时，这部分内存会被驱逐。
:::

接下来，在查询级别启用其使用：

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 设置 {#settings}

| 设置                                                    | 描述                                                                                                                                                                                                                                                                                                            | 默认值       |
|----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `use_page_cache_for_disks_without_file_cache`            | 为未启用文件系统缓存的远程磁盘使用用户空间页面缓存。                                                                                                                                                                                                                                    | `0`         |
| `use_page_cache_with_distributed_cache`                  | 当使用分布式缓存时使用用户空间页面缓存。                                                                                                                                                                                                                                                               | `0`         |
| `read_from_page_cache_if_exists_otherwise_bypass_cache`  | 以被动模式使用用户空间页面缓存，类似于[`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache)。                                                                                                  | `0`         |
| `page_cache_inject_eviction`                             | 用户空间页面缓存有时会随机使某些页面失效。用于测试。                                                                                                                                                                                                                             | `0`         |
| `page_cache_block_size`                                  | 存储在用户空间页面缓存中的文件块大小，以字节为单位。所有通过缓存的读取将四舍五入到这个大小的倍数。                                                                                                                                                                 | `1048576`   |
| `page_cache_history_window_ms`                           | 释放的内存可以被用户空间页面缓存使用的延迟时间。                                                                                                                                                                                                                                                         | `1000`      |
| `page_cache_policy`                                      | 用户空间页面缓存策略名称。                                                                                                                                                                                                                                                                                      | `SLRU`      |
| `page_cache_size_ratio`                                  | 用户空间页面缓存中受保护队列的大小相对于缓存的总大小。                                                                                                                                                                                                                       | `0.5`       |
| `page_cache_min_size`                                    | 用户空间页面缓存的最小大小。                                                                                                                                                                                                                                                                              | `104857600` |
| `page_cache_max_size`                                    | 用户空间页面缓存的最大大小。设置为0以禁用缓存。如果大于page_cache_min_size，缓存大小将在此范围内持续调整，以使用大部分可用内存，同时保持总内存使用低于限制（`max_server_memory_usage`\[`_to_ram_ratio`\]）。 | `0`         |
| `page_cache_free_memory_ratio`                           | 从用户空间页面缓存中保持空闲内存的比例。类似于Linux的min_free_kbytes设置。                                                                                                                                                                                                   | `0.15`      |
| `page_cache_lookahead_blocks`                            | 在用户空间页面缓存未命中时，从底层存储中一次读取最多这一数量的连续块，如果它们也不在缓存中。每个块大小为page_cache_block_size字节。                                                                                                                               | `16`        |
| `page_cache_shards`                                      | 在此数量的分片上划分用户空间页面缓存，以减少互斥量争用。实验性，可能不会提高性能。                                                                                                                                                                                         | `4`         |

## 相关内容 {#related-content}
- [文件系统缓存](/docs/operations/storing-data)
- [ClickHouse v25.3 发布网络研讨会](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
