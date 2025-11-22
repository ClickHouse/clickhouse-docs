---
description: 'ClickHouse-disks 文档'
sidebar_label: 'clickhouse-disks'
sidebar_position: 59
slug: /operations/utilities/clickhouse-disks
title: 'Clickhouse-disks'
doc_type: 'reference'
---



# Clickhouse-disks

一个为 ClickHouse 磁盘提供类文件系统操作的实用程序。它既可以在交互模式下运行，也可以在非交互模式下运行。



## 全局选项 {#program-wide-options}

- `--config-file, -C` -- ClickHouse 配置文件路径,默认为 `/etc/clickhouse-server/config.xml`。
- `--save-logs` -- 将调用命令的执行进度日志记录到 `/var/log/clickhouse-server/clickhouse-disks.log`。
- `--log-level` -- 指定要记录的事件[类型](../server-configuration-parameters/settings#logger),默认为 `none`。
- `--disk` -- 指定用于 `mkdir, move, read, write, remove` 命令的磁盘。默认为 `default`。
- `--query, -q` -- 无需启动交互模式即可执行的单条查询
- `--help, -h` -- 打印所有选项和命令及其说明


## 延迟初始化 {#lazy-initialization}

配置中所有可用的磁盘均采用延迟初始化。这意味着磁盘对应的对象仅在某个命令使用该磁盘时才会初始化。这样做可以提高工具的健壮性,避免访问配置中已描述但用户未使用的磁盘(这些磁盘可能在初始化时失败)。但是,clickhouse-disks 启动时必须初始化一个磁盘。该磁盘通过命令行参数 `--disk` 指定(默认值为 `default`)。


## 默认磁盘 {#default-disks}

启动后,有两个磁盘虽未在配置中指定,但可供初始化使用。

1. **`local` 磁盘**:该磁盘用于模拟启动 `clickhouse-disks` 工具时所在的本地文件系统。其初始路径为 `clickhouse-disks` 的启动目录,挂载点为文件系统的根目录。

2. **`default` 磁盘**:该磁盘挂载到配置中 `clickhouse/path` 参数所指定的本地文件系统目录(默认值为 `/var/lib/clickhouse`)。其初始路径设置为 `/`。


## Clickhouse-disks 状态 {#clickhouse-disks-state}

对于每个添加的磁盘,该工具会存储当前目录(与普通文件系统相同)。用户可以更改当前目录并在磁盘之间切换。

状态会显示在提示符 "`disk_name`:`path_name`" 中


## 命令 {#commands}

在本文档中,所有必需的位置参数表示为 `<parameter>`,命名参数表示为 `[--parameter value]`。所有位置参数都可以作为具有相应名称的命名参数来使用。

- `cd (change-dir, change_dir) [--disk disk] <path>`
  将当前目录切换到磁盘 `disk` 上的路径 `path`(默认为当前磁盘)。不会切换磁盘。
- `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  递归复制数据,从磁盘 `disk_1` 上的 `path-from`(默认为当前磁盘(非交互模式下的参数 `disk`))
  到磁盘 `disk_2` 上的 `path-to`(默认为当前磁盘(非交互模式下的参数 `disk`))。
- `current_disk_with_path (current, current_disk, current_path)`
  按以下格式打印当前状态:
  `Disk: "current_disk" Path: "current path on current disk"`
- `help [<command>]`
  打印命令 `command` 的帮助信息。如果未指定 `command`,则打印所有命令的信息。
- `move (mv) <path-from> <path-to>`.
  在当前磁盘内将文件或目录从 `path-from` 移动到 `path-to`。
- `remove (rm, delete) <path>`.
  在当前磁盘上递归删除 `path`。
- `link (ln) <path-from> <path-to>`.
  在当前磁盘上创建从 `path-from` 到 `path-to` 的硬链接。
- `list (ls) [--recursive] <path>`
  列出当前磁盘上 `path` 中的文件。默认为非递归模式。
- `list-disks (list_disks, ls-disks, ls_disks)`.
  列出磁盘名称。
- `mkdir [--recursive] <path>` on a current disk.
  创建目录。默认为非递归模式。
- `read (r) <path-from> [--path-to path]`
  从 `path-from` 读取文件到 `path`(如果未提供则输出到 `stdout`)。
- `switch-disk [--path path] <disk>`
  切换到磁盘 `disk` 的路径 `path`(如果未指定 `path`,默认值为磁盘 `disk` 上的上一个路径)。
- `write (w) [--path-from path] <path-to>`.
  将文件从 `path` 写入到 `path-to`(如果未提供 `path` 则从 `stdin` 读取,输入必须以 Ctrl+D 结束)。
