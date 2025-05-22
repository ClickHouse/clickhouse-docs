---
'description': '一种缓存机制，允许在进程内存中缓存数据，而不依赖于操作系统页面缓存。'
'sidebar_label': '用户空间页面缓存'
'sidebar_position': 65
'slug': '/operations/userspace-page-cache'
'title': '用户空间页面缓存'
---


# 用户空间页面缓存

## 概述 {#overview}

> 用户空间页面缓存是一种新的缓存机制，它允许在进程内存中缓存数据，而不是依赖于操作系统页面缓存。

ClickHouse 已经提供了 [文件系统缓存](/docs/operations/storing-data) 作为在远程对象存储（如 Amazon S3、Google Cloud Storage (GCS) 或 Azure Blob Storage）之上的缓存方式。用户空间页面缓存旨在加速对远程数据的访问，当正常的操作系统缓存无法有效工作时，它可以发挥作用。

它与文件系统缓存的不同之处在于：

| 文件系统缓存                                            | 用户空间页面缓存                          |
|---------------------------------------------------------|-------------------------------------------|
| 将数据写入本地文件系统                                  | 仅存在于内存中                            |
| 占用磁盘空间（也可在 tmpfs 上配置）                     | 独立于文件系统                            |
| 在服务器重启时仍然存在                                 | 在服务器重启时不会存在                   |
| 不显示在服务器的内存使用中                             | 显示在服务器的内存使用中                 |
| 适用于磁盘和内存（操作系统页面缓存）                     | **适合无磁盘服务器**                       |

## 配置设置和使用 {#configuration-settings-and-usage}

### 使用 {#usage}

要启用用户空间页面缓存，首先在服务器上进行配置：

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
用户空间页面缓存将使用最多指定的内存量，但该内存量不是保留的。当需要其他服务器需求时，该内存将被驱逐。
:::

接下来，在查询级别启用其使用：

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 设置 {#settings}

| 设置                                                      | 描述                                                                                                                                                                                                                                                                                                                 | 默认值       |
|----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `use_page_cache_for_disks_without_file_cache`            | 对没有启用文件系统缓存的远程磁盘使用用户空间页面缓存。                                                                                                                                                                                                                                                            | `0`         |
| `use_page_cache_with_distributed_cache`                  | 当使用分布式缓存时，使用用户空间页面缓存。                                                                                                                                                                                                                                                                       | `0`         |
| `read_from_page_cache_if_exists_otherwise_bypass_cache`  | 在被动模式下使用用户空间页面缓存，类似于 [`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache)。                                                                                                      | `0`         |
| `page_cache_inject_eviction`                             | 用户空间页面缓存有时会随机使某些页面失效。用于测试。                                                                                                                                                                                                                                                              | `0`         |
| `page_cache_block_size`                                  | 存储在用户空间页面缓存中的文件块大小，以字节为单位。通过缓存的所有读取都将向上舍入到此大小的倍数。                                                                                                                                                                                                             | `1048576`   |
| `page_cache_history_window_ms`                           | 释放的内存可以被用户空间页面缓存使用之前的延迟。                                                                                                                                                                                                                                                                 | `1000`      |
| `page_cache_policy`                                      | 用户空间页面缓存策略名称。                                                                                                                                                                                                                                                                                          | `SLRU`      |
| `page_cache_size_ratio`                                  | 用户空间页面缓存中受保护队列的大小占缓存总大小的比例。                                                                                                                                                                                                                                                              | `0.5`       |
| `page_cache_min_size`                                    | 用户空间页面缓存的最小大小。                                                                                                                                                                                                                                                                                        | `104857600` |
| `page_cache_max_size`                                    | 用户空间页面缓存的最大大小。设置为 0 以禁用缓存。如果大于 page_cache_min_size，缓存大小将在此范围内持续调整，以使用大部分可用内存，同时保持总内存使用量低于限制（`max_server_memory_usage`\[`_to_ram_ratio`\]）。                   | `0`         |
| `page_cache_free_memory_ratio`                           | 用户空间页面缓存中保持空闲的内存限制的比例。类似于 Linux 的 min_free_kbytes 设置。                                                                                                                                                                                                                              | `0.15`      |
| `page_cache_lookahead_blocks`                            | 在用户空间页面缓存未命中的情况下，从底层存储中一次读取最多如此多的连续块，如果它们也不在缓存中。每个块的大小为 page_cache_block_size 字节。                                                                                                                                                                     | `16`        |
| `page_cache_shards`                                      | 在如此多的分片上划分用户空间页面缓存，以减少互斥锁争用。实验性的，不太可能提高性能。                                                                                                                                                                                                                                        | `4`         |

## 相关内容 {#related-content}
- [文件系统缓存](/docs/operations/storing-data)
- [ClickHouse v25.3 发布网络研讨会](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
