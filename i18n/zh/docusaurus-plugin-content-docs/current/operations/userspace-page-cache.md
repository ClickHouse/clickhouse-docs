---
description: '一种缓存机制，可将数据缓存在进程内存中，而不是依赖操作系统的页缓存。'
sidebar_label: '用户空间页缓存'
sidebar_position: 65
slug: /operations/userspace-page-cache
title: '用户空间页缓存'
doc_type: 'reference'
---



# 用户态页缓存



## 概述 {#overview}

> 用户空间页缓存是一种新的缓存机制,允许在进程内存中缓存数据,而非依赖操作系统页缓存。

ClickHouse 已经提供了[文件系统缓存](/docs/operations/storing-data)作为在远程对象存储(如 Amazon S3、Google Cloud Storage (GCS) 或 Azure Blob Storage)之上进行缓存的方式。用户空间页缓存旨在当常规操作系统缓存性能不足时,加速对远程数据的访问。

它与文件系统缓存的区别如下:

| 文件系统缓存                                        | 用户空间页缓存                  |
| ------------------------------------------------------- | ------------------------------------- |
| 将数据写入本地文件系统                     | 仅存在于内存中                |
| 占用磁盘空间(也可配置在 tmpfs 上)        | 独立于文件系统             |
| 服务器重启后保留                                | 服务器重启后不保留      |
| 不计入服务器的内存使用量           | 计入服务器的内存使用量 |
| 适用于磁盘存储和内存存储(操作系统页缓存) | **适合无磁盘服务器**        |


## 配置设置和使用 {#configuration-settings-and-usage}

### 使用 {#usage}

要启用用户空间页面缓存,首先在服务器上进行配置:

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
用户空间页面缓存最多使用指定数量的内存,但此内存量不会被预留。当服务器有其他需求时,该内存将被回收。
:::

接下来,在查询级别启用其使用:

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 设置 {#settings}

| 设置                                                 | 描述                                                                                                                                                                                                                                                                                                            | 默认值     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `use_page_cache_for_disks_without_file_cache`           | 对未启用文件系统缓存的远程磁盘使用用户空间页面缓存。                                                                                                                                                                                                                                    | `0`         |
| `use_page_cache_with_distributed_cache`                 | 使用分布式缓存时启用用户空间页面缓存。                                                                                                                                                                                                                                                               | `0`         |
| `read_from_page_cache_if_exists_otherwise_bypass_cache` | 以被动模式使用用户空间页面缓存,类似于 [`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache)。                                                                                                  | `0`         |
| `page_cache_inject_eviction`                            | 用户空间页面缓存会随机使某些页面失效。用于测试目的。                                                                                                                                                                                                                             | `0`         |
| `page_cache_block_size`                                 | 存储在用户空间页面缓存中的文件块大小,以字节为单位。所有通过缓存的读取操作都将向上舍入为此大小的倍数。                                                                                                                                                                                 | `1048576`   |
| `page_cache_history_window_ms`                          | 释放的内存可被用户空间页面缓存使用之前的延迟时间。                                                                                                                                                                                                                                                         | `1000`      |
| `page_cache_policy`                                     | 用户空间页面缓存策略名称。                                                                                                                                                                                                                                                                                      | `SLRU`      |
| `page_cache_size_ratio`                                 | 用户空间页面缓存中受保护队列相对于缓存总大小的比例。                                                                                                                                                                                                                       | `0.5`       |
| `page_cache_min_size`                                   | 用户空间页面缓存的最小大小。                                                                                                                                                                                                                                                                              | `104857600` |
| `page_cache_max_size`                                   | 用户空间页面缓存的最大大小。设置为 0 可禁用缓存。如果大于 page_cache_min_size,缓存大小将在此范围内持续调整,以使用大部分可用内存,同时保持总内存使用量低于限制 (`max_server_memory_usage`\[`_to_ram_ratio`\])。 | `0`         |
| `page_cache_free_memory_ratio`                          | 用户空间页面缓存保持空闲的内存限制比例。类似于 Linux 的 min_free_kbytes 设置。                                                                                                                                                                                                   | `0.15`      |
| `page_cache_lookahead_blocks`                           | 当用户空间页面缓存未命中时,如果底层存储中的连续块也不在缓存中,则一次最多从底层存储读取这么多连续块。每个块为 page_cache_block_size 字节。                                                                                                                               | `16`        |
| `page_cache_shards`                                     | 将用户空间页面缓存分片到这么多分片以减少互斥锁竞争。实验性功能,不太可能提高性能。                                                                                                                                                                                         | `4`         |


## 相关内容 {#related-content}

- [文件系统缓存](/docs/operations/storing-data)
- [ClickHouse v25.3 发布网络研讨会](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
