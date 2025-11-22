---
description: '包含 `BACKUP` 和 `RESTORE` 操作相关日志记录的系统表。'
keywords: ['系统表', '备份']
slug: /operations/system-tables/backups
title: 'system.backups'
doc_type: 'reference'
---

# system.backups

包含所有 `BACKUP` 或 `RESTORE` 操作的列表，以及它们当前的状态和其他属性。注意，此表不是持久化的，只显示上次服务器重启之后执行的操作。

下面是包含名称和注释列的 markdown 表：

| Column              | Description                                                                                                          |
|---------------------|----------------------------------------------------------------------------------------------------------------------|
| `id`                | 操作 ID，可以通过 SETTINGS id=... 显式传入，也可以是随机生成的 UUID。                                                |
| `name`              | 操作名称，类似 `Disk('backups', 'my_backup')` 的字符串                                                               |
| `base_backup_name`  | 基础备份操作名称，类似 `Disk('backups', 'my_base_backup')` 的字符串                                                  |
| `query_id`          | 启动该备份的查询的查询 ID。                                                                                          |
| `status`            | 备份或恢复操作的状态。                                                                                               |
| `error`             | 错误信息（如果有）。                                                                                                 |
| `start_time`        | 操作开始的时间。                                                                                                     |
| `end_time`          | 操作结束的时间。                                                                                                     |
| `num_files`         | 备份中存储的文件数量。                                                                                               |
| `total_size`        | 备份中存储的文件总大小。                                                                                             |
| `num_entries`       | 备份中的条目数，即当备份以文件夹形式存储时，该文件夹中的文件数量。                                                 |
| `uncompressed_size` | 备份未压缩时的大小。                                                                                                 |
| `compressed_size`   | 备份压缩后的大小。                                                                                                   |
| `files_read`        | 从该备份执行 RESTORE 时读取的文件数量。                                                                              |
| `bytes_read`        | 从该备份执行 RESTORE 时读取的文件总大小。                                                                           |
| `ProfileEvents`     | 在该操作期间捕获到的所有 ProfileEvents 事件。                                                                       |