---
slug: /operations/utilities/clickhouse-disks
sidebar_position: 59
sidebar_label: clickhouse-disks
---


# Clickhouse-disks

一个为 ClickHouse 磁盘提供类文件系统操作的工具。它可以在交互模式和非交互模式下工作。

## Program-wide options {#program-wide-options}

* `--config-file, -C` -- ClickHouse 配置文件路径，默认为 `/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 将调用命令的进度日志记录到 `/var/log/clickhouse-server/clickhouse-disks.log`。
* `--log-level` -- 记录何种 [类型](../server-configuration-parameters/settings#logger) 的事件，默认为 `none`。
* `--disk` -- 用于 `mkdir, move, read, write, remove` 命令的磁盘。默认为 `default`。
* `--query, -q` -- 可以在不启动交互模式的情况下执行的单个查询。
* `--help, -h` -- 打印所有选项和命令及其描述。

## Lazy initialization {#lazy-initialization}
所有在配置中可用的磁盘都是惰性初始化的。这意味着只有在某个命令中使用对应磁盘时，磁盘的相应对象才会被初始化。这是为了使工具更加稳健，并避免访问那些在配置中描述但用户未使用的磁盘，这些磁盘在初始化时可能会失败。然而，在点击 `clickhouse-disks` 启动时，应该有一个磁盘被初始化。这个磁盘通过命令行参数 `--disk` 指定（默认值为 `default`）。

## Default Disks {#default-disks}
启动后，有两个未在配置中指定但可初始化的磁盘。

1. **`local` 磁盘**: 该磁盘旨在模拟启动 `clickhouse-disks` 工具的本地文件系统。其初始路径是启动 `clickhouse-disks` 的目录，并挂载在文件系统的根目录。

2. **`default` 磁盘**: 该磁盘挂载在配置中由 `clickhouse/path` 参数指定的本地文件系统目录中（默认为 `/var/lib/clickhouse`）。其初始路径设置为 `/`。

## Clickhouse-disks state {#clickhouse-disks-state}
对于每个添加的磁盘，工具存储当前目录（如同通常的文件系统）。用户可以更改当前目录并在磁盘之间切换。

状态在提示中反映为 "`disk_name`:`path_name`"

## Commands {#commands}

在本文件的文档中，所有强制性的位置参数被称为 `<parameter>`，命名参数被称为 `[--parameter value]`。所有位置参数也可以作为带有相应名称的命名参数提及。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  将目录更改为磁盘 `disk` 的路径 `path`（默认值为当前磁盘）。不进行磁盘切换。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`。
  递归复制来自磁盘 `disk_1` 的 `path-from` 的数据（默认值为当前磁盘（非交互模式中的参数 `disk`））
  到磁盘 `disk_2` 的 `path-to`（默认值为当前磁盘（非交互模式中的参数 `disk`））。
* `current_disk_with_path (current, current_disk, current_path)`
  以以下格式打印当前状态：
    `磁盘: "current_disk" 路径: "当前磁盘上的当前路径"`
* `help [<command>]`
  打印有关命令 `command` 的帮助信息。如果未指定 `command`，则打印所有命令的信息。
* `move (mv) <path-from> <path-to>`。
  在当前磁盘上将文件或目录从 `path-from` 移动到 `path-to`。
* `remove (rm, delete) <path>`。
  在当前磁盘上递归删除 `path`。
* `link (ln) <path-from> <path-to>`。
  在当前磁盘上从 `path-from` 创建到 `path-to` 的硬链接。
* `list (ls) [--recursive] <path>`
  列出当前磁盘上 `path` 的文件。默认情况下为非递归。
* `list-disks (list_disks, ls-disks, ls_disks)`。
  列出磁盘名称。
* `mkdir [--recursive] <path>` 在当前磁盘上。
  创建一个目录。默认情况下为非递归。
* `read (r) <path-from> [--path-to path]`
  从 `path-from` 读取文件到 `path`（如果未提供，则为 `stdout`）。
* `switch-disk [--path path] <disk>`
  切换到路径 `path` 的磁盘 `disk`（如果未指定 `path`，默认值为磁盘 `disk` 上的前一个路径）。
* `write (w) [--path-from path] <path-to>`。
  将文件从 `path`（如果未提供，则为 `stdin`，输入必须以 Ctrl+D 结束）写入 `path-to`。
