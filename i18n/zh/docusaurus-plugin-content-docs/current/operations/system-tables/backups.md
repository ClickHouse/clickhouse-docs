---
description: '包含 `BACKUP` 和 `RESTORE` 操作相关日志记录的系统表。'
keywords: ['system table', 'backups']
slug: /operations/system-tables/backups
title: 'system.backups'
doc_type: 'reference'
---

# system.backups

包含所有 `BACKUP` 或 `RESTORE` 操作及其当前状态和其他属性的列表。注意，该表不是持久化的，只显示上次服务器重启之后执行的操作。

下面是包含名称和说明列的 markdown 表格：

| Column              | Description                                                                                                          |
|---------------------|----------------------------------------------------------------------------------------------------------------------|
| `id`                | 操作 ID，可以通过 SETTINGS id=... 传入，也可以是随机生成的 UUID。                                                     |
| `name`              | 操作名称，类似 `Disk('backups', 'my_backup')` 的字符串。                                                              |
| `base_backup_name`  | 基础备份操作名称，类似 `Disk('backups', 'my_base_backup')` 的字符串。                                                 |
| `query_id`          | 启动该备份的查询的 Query ID。                                                                                        |
| `status`            | 备份或恢复操作的状态。                                                                                               |
| `error`             | 错误信息（如果有）。                                                                                                 |
| `start_time`        | 操作开始的时间。                                                                                                     |
| `end_time`          | 操作结束的时间。                                                                                                     |
| `num_files`         | 备份中存储的文件数量。                                                                                               |
| `total_size`        | 备份中存储的文件总大小。                                                                                             |
| `num_entries`       | 备份中的条目数量；如果备份以文件夹形式存储，则为该文件夹中的文件数量。                                              |
| `uncompressed_size` | 备份的未压缩大小。                                                                                                   |
| `compressed_size`   | 备份的压缩大小。                                                                                                     |
| `files_read`        | 从该备份执行 RESTORE 时读取的文件数量。                                                                              |
| `bytes_read`        | 从该备份执行 RESTORE 时读取的文件总大小。                                                                            |
| `ProfileEvents`     | 此操作期间捕获的所有 ProfileEvents 事件。                                                                            |