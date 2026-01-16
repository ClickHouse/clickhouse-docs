---
description: 'ClickHouse-disks 文档'
sidebar_label: 'clickhouse-disks'
sidebar_position: 59
slug: /operations/utilities/clickhouse-disks
title: 'Clickhouse-disks'
doc_type: 'reference'
---

# Clickhouse-disks \\{#clickhouse-disks\\}

一个为 ClickHouse 磁盘提供类文件系统操作的实用工具。它同时支持交互式和非交互式模式。

## 程序级通用选项 \\{#program-wide-options\\}

* `--config-file, -C` -- ClickHouse 配置文件路径，默认为 `/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 将已执行命令的进度记录到 `/var/log/clickhouse-server/clickhouse-disks.log`。
* `--log-level` -- 要记录的事件[类型](../server-configuration-parameters/settings#logger)，默认为 `none`。
* `--disk` -- 用于 `mkdir, move, read, write, remove` 命令的磁盘，默认为 `default`。
* `--query, -q` -- 可在不启动交互模式的情况下执行的一条查询。
* `--help, -h` -- 显示所有选项和命令及其说明。

## 延迟初始化 \\{#lazy-initialization\\}
配置中可用的所有磁盘都会采用延迟初始化方式。也就是说，只有在某个命令实际使用到某个磁盘时，才会为该磁盘初始化对应的对象。这样做是为了提高工具的健壮性，并避免去操作那些虽然在配置中声明、但用户并未使用、且可能在初始化过程中失败的磁盘。不过，在启动 clickhouse-disks 时，必须有一个磁盘会被立即初始化。该磁盘通过命令行参数 `--disk` 指定（默认值为 `default`）。

## 默认磁盘 \\{#default-disks\\}
启动后，会有两个未在配置中显式指定但可用于初始化的磁盘。

1. **`local` 磁盘**：该磁盘用于模拟启动 `clickhouse-disks` 工具时所在的本地文件系统。它的初始路径为启动 `clickhouse-disks` 时所在的目录，并挂载在文件系统根目录。

2. **`default` 磁盘**：该磁盘挂载到本地文件系统中由配置参数 `clickhouse/path` 指定的目录（默认值为 `/var/lib/clickhouse`）。它的初始路径被设置为 `/`。

## Clickhouse-disks 状态 \\{#clickhouse-disks-state\\}
对于添加的每个磁盘，该工具都会存储当前目录（类似于普通文件系统）。用户可以更改当前目录并在各个磁盘之间切换。

状态会显示在提示符中 "`disk_name`:`path_name`"

## 命令 \\{#commands\\}

在本说明文档中，所有必需的位置参数记作 `<parameter>`，具名参数记作 `[--parameter value]`。所有位置参数都可以使用对应名称作为具名参数来指定。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  将当前目录切换到磁盘 `disk` 上的路径 `path`（默认值为当前磁盘）。不会发生磁盘切换。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  递归地将磁盘 `disk_1` 上路径 `path-from` 的数据（默认值为当前磁盘（在非交互模式下为参数 `disk` 的值））
  复制到磁盘 `disk_2` 上的路径 `path-to`（默认值为当前磁盘（在非交互模式下为参数 `disk` 的值））。
* `current_disk_with_path (current, current_disk, current_path)`
  以如下格式打印当前状态：
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  打印关于命令 `command` 的帮助信息。如果未指定 `command`，则打印所有命令的相关信息。
* `move (mv) <path-from> <path-to>`.
  在当前磁盘内将文件或目录从 `path-from` 移动到 `path-to`。
* `remove (rm, delete) <path>`.
  在当前磁盘上递归删除 `path`。
* `link (ln) <path-from> <path-to>`.
  在当前磁盘上从 `path-from` 到 `path-to` 创建一个硬链接。
* `list (ls) [--recursive] <path>`
  列出当前磁盘上路径 `path` 下的文件。默认非递归。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  列出磁盘名称。
* `mkdir [--recursive] <path>` 在当前磁盘上。
  创建目录。默认非递归。
* `read (r) <path-from> [--path-to path]`
  将文件从 `path-from` 读取到 `path`（如果未提供则输出到 `stdout`）。
* `switch-disk [--path path] <disk>`
  在路径 `path` 上切换到磁盘 `disk`（如果未指定 `path`，默认值为之前在磁盘 `disk` 上的路径）。
* `write (w) [--path-from path] <path-to>`.
  将文件从 `path`（如果未提供 `path` 则从 `stdin` 读取，输入必须以 Ctrl+D 结束）写入到 `path-to`。
