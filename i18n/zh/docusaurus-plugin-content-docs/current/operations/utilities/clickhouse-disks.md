---
'description': 'Clickhouse-disks的文档'
'sidebar_label': 'clickhouse-disks'
'sidebar_position': 59
'slug': '/operations/utilities/clickhouse-disks'
'title': 'Clickhouse-disks'
---


# Clickhouse-disks

一个为 ClickHouse 磁盘提供类文件系统操作的实用程序。它可以在交互模式和非交互模式下工作。

## Program-wide options {#program-wide-options}

* `--config-file, -C` -- ClickHouse 配置文件的路径，默认为 `/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 记录调用命令的进度到 `/var/log/clickhouse-server/clickhouse-disks.log`。
* `--log-level` -- 记录事件的 [类型](../server-configuration-parameters/settings#logger)，默认为 `none`。
* `--disk` -- 用于 `mkdir, move, read, write, remove` 命令的磁盘。默认为 `default`。
* `--query, -q` -- 可以在不启动交互模式的情况下执行的单个查询
* `--help, -h` -- 打印所有选项和命令及其描述

## Lazy initialization {#lazy-initialization}
在配置中可用的所有磁盘都是懒加载的。这意味着只有在某个命令中使用了相应的磁盘时，才会初始化对应的磁盘对象。这是为了使实用程序更加健壮，并避免访问配置中描述但用户未使用且在初始化过程中可能失败的磁盘。然而，在启动 clickhouse-disks 时应该有一个磁盘被初始化。这个磁盘通过命令行参数 `--disk` 指定（默认值为 `default`）。

## Default Disks {#default-disks}
启动后，有两个未在配置中指定但可用于初始化的磁盘。

1. **`local` 磁盘**: 这个磁盘旨在模拟从中启动 `clickhouse-disks` 实用程序的本地文件系统。其初始路径是启动 `clickhouse-disks` 的目录，并且它挂载在文件系统的根目录下。

2. **`default` 磁盘**: 这个磁盘挂载到本地文件系统，位于配置中由 `clickhouse/path` 参数指定的目录（默认值为 `/var/lib/clickhouse`）。其初始路径设置为 `/`。

## Clickhouse-disks state {#clickhouse-disks-state}
对于每个已添加的磁盘，实用程序存储当前目录（如同在通常的文件系统中）。用户可以更改当前目录并在磁盘之间切换。

状态通过提示 "`disk_name`:`path_name`" 反映。

## Commands {#commands}

在这些文档文件中，所有强制的位置参数称为 `<parameter>`，命名参数称为 `[--parameter value]`。所有位置参数都可以作为具有相应名称的命名参数提及。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  将目录更改为磁盘 `disk` 上的路径 `path`（默认值为当前磁盘）。不会发生磁盘切换。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`。
  递归复制 `disk_1` 上的 `path-from`（默认值为当前磁盘（非交互模式下的 `disk` 参数））的数据到 `disk_2` 上的 `path-to`（默认值为当前磁盘（非交互模式下的 `disk` 参数））。
* `current_disk_with_path (current, current_disk, current_path)`
  以以下格式打印当前状态：
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  打印关于命令 `command` 的帮助信息。如果未指定 `command`，则打印所有命令的信息。
* `move (mv) <path-from> <path-to>`。
  将文件或目录从 `path-from` 移动到当前磁盘的 `path-to`。
* `remove (rm, delete) <path>`。
  在当前磁盘上递归删除 `path`。
* `link (ln) <path-from> <path-to>`。
  在当前磁盘上创建从 `path-from` 到 `path-to` 的硬链接。
* `list (ls) [--recursive] <path>`
  列出当前磁盘上 `path` 的文件。默认为非递归。
* `list-disks (list_disks, ls-disks, ls_disks)`。
  列出磁盘名称。
* `mkdir [--recursive] <path>` 在当前磁盘上。
  创建一个目录。默认为非递归。
* `read (r) <path-from> [--path-to path]`
  从 `path-from` 读取文件到 `path`（如果未提供则为 `stdout`）。
* `switch-disk [--path path] <disk>`
  切换到磁盘 `disk` 上的路径 `path`（如果未指定 `path`，默认值为磁盘 `disk` 上的上一个路径）。
* `write (w) [--path-from path] <path-to>`。
  从 `path`（如果未提供则为 `stdin`，输入必须以 Ctrl+D 结束）写入文件到 `path-to`。
