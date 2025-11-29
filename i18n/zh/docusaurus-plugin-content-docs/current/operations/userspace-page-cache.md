---
description: '一种缓存机制，可将数据缓存在进程内存中，而无需依赖操作系统的页面缓存。'
sidebar_label: '用户态页面缓存'
sidebar_position: 65
slug: /operations/userspace-page-cache
title: '用户态页面缓存'
doc_type: 'reference'
---



# 用户态页缓存 {#userspace-page-cache}



## 概览 {#overview}

> 用户态页缓存是一种新的缓存机制，它允许将数据缓存到进程内存中，而不是依赖操作系统的页缓存。

ClickHouse 已经提供了 [Filesystem cache](/docs/operations/storing-data)，
可用于在 Amazon S3、Google Cloud Storage (GCS) 或 Azure Blob Storage 等远程对象存储之上进行缓存。用户态页缓存旨在当常规操作系统缓存效果不佳时，加速对远程数据的访问。

它与文件系统缓存的不同之处在于：

| Filesystem cache                                        | 用户态页缓存                          |
|---------------------------------------------------------|---------------------------------------|
| 将数据写入本地文件系统                                   | 仅存在于内存中                        |
| 占用磁盘空间（也可在 tmpfs 上配置）                     | 独立于文件系统                        |
| 在服务器重启后仍然存在                                 | 在服务器重启后不会保留                |
| 不会体现在服务器的内存使用中                           | 会体现在服务器的内存使用中            |
| 适用于基于磁盘和基于内存（操作系统页缓存）的场景        | **适用于无磁盘服务器**                |



## 配置与使用 {#configuration-settings-and-usage}

### 用法 {#usage}

要启用用户态页缓存，首先需要在服务器上完成相应配置：

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
用户态页缓存最多会使用指定数量的内存，但
这部分内存并不会被预留。当服务器中其他组件需要内存时，
这些内存会被回收。
:::

接下来，在查询级别启用它：

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 设置 {#settings}

| Setting                                                 | Description                                                                                                                                                                          | Default     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `use_page_cache_for_disks_without_file_cache`           | 对未启用文件系统缓存的远程磁盘使用用户态页缓存。                                                                                                                                                             | `0`         |
| `use_page_cache_with_distributed_cache`                 | 在使用分布式缓存时使用用户态页缓存。                                                                                                                                                                   | `0`         |
| `read_from_page_cache_if_exists_otherwise_bypass_cache` | 以被动模式使用用户态页缓存，行为类似于 [`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache)。 | `0`         |
| `page_cache_inject_eviction`                            | 用户态页缓存会随机使部分页失效。用于测试目的。                                                                                                                                                              | `0`         |
| `page_cache_block_size`                                 | 在用户态页缓存中存储的文件块大小（字节）。所有经过缓存的读取都会向上取整为该大小的倍数。                                                                                                                                         | `1048576`   |
| `page_cache_history_window_ms`                          | 释放的内存在可被用户态页缓存重新使用前的延迟时间。                                                                                                                                                            | `1000`      |
| `page_cache_policy`                                     | 用户态页缓存策略名称。                                                                                                                                                                          | `SLRU`      |
| `page_cache_size_ratio`                                 | 用户态页缓存中受保护队列相对于缓存总大小的比例。                                                                                                                                                             | `0.5`       |
| `page_cache_min_size`                                   | 用户态页缓存的最小大小。                                                                                                                                                                         | `104857600` |
| `page_cache_max_size`                                   | 用户态页缓存的最大大小。设置为 0 时禁用缓存。如果该值大于 `page_cache_min_size`，则缓存大小会在此区间内持续调整，以在保持总内存使用低于限制（`max_server_memory_usage`[`_to_ram_ratio`]）的前提下尽可能利用可用内存。                                         | `0`         |
| `page_cache_free_memory_ratio`                          | 在用户态页缓存中需要保持空闲的内存限额比例。类似于 Linux 的 `min_free_kbytes` 设置。                                                                                                                              | `0.15`      |
| `page_cache_lookahead_blocks`                           | 当用户态页缓存未命中时，如果后续连续块也不在缓存中，则一次性从底层存储中预读最多这么多连续块。每个块的大小为 `page_cache_block_size` 字节。                                                                                                   | `16`        |
| `page_cache_shards`                                     | 将用户态页缓存划分为相应数量的分片（shard），以减少互斥锁竞争。为实验性功能，不太可能提升性能。                                                                                                                                   | `4`         |


## 相关内容 {#related-content}
- [文件系统缓存](/docs/operations/storing-data)
- [ClickHouse v25.3 版本发布网络研讨会](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
