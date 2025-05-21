---
'description': 'Documentation for Clickhouse-disks'
'sidebar_label': 'clickhouse-disks'
'sidebar_position': 59
'slug': '/operations/utilities/clickhouse-disks'
'title': 'Clickhouse-disks'
---




# Clickhouse-disks

一个提供类似于文件系统操作的 ClickHouse 磁盘的实用工具。它可以在交互模式和非交互模式下工作。

## 程序级选项 {#program-wide-options}

* `--config-file, -C` -- ClickHouse 配置文件的路径，默认为 `/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 将调用命令的进度日志记录到 `/var/log/clickhouse-server/clickhouse-disks.log`。
* `--log-level` -- 要记录的事件[类型](../server-configuration-parameters/settings#logger)，默认为 `none`。
* `--disk` -- 用于 `mkdir, move, read, write, remove` 命令的磁盘。默认为 `default`。
* `--query, -q` -- 可以在不启动交互模式的情况下执行的单个查询。
* `--help, -h` -- 打印所有选项和命令及其描述。

## 懒惰初始化 {#lazy-initialization}
配置中可用的所有磁盘都是懒惰初始化的。这意味着只有在某个命令中使用对应的磁盘时，才会初始化该磁盘的相应对象。这是为了使实用程序更加健壮，避免触及那些在配置中描述但未被用户使用的磁盘，这些磁盘在初始化时可能会失败。然而，在 clickhouse-disks 启动时，应该有一个磁盘被初始化。此磁盘是通过命令行的 `--disk` 参数指定的（默认值为 `default`）。

## 默认磁盘 {#default-disks}
启动后，有两个未在配置中指定但可用于初始化的磁盘。

1. **`local` 磁盘**：该磁盘旨在模拟启动 `clickhouse-disks` 实用工具的本地文件系统。其初始路径是启动 `clickhouse-disks` 的目录，并且挂载在文件系统的根目录上。

2. **`default` 磁盘**：该磁盘挂载到本地文件系统中，由配置中的 `clickhouse/path` 参数指定的目录（默认值为 `/var/lib/clickhouse`）。其初始路径设置为 `/`。

## Clickhouse-disks 状态 {#clickhouse-disks-state}
对于每个添加的磁盘，实用程序存储当前目录（如同在通常的文件系统中）。用户可以更改当前目录并在磁盘之间切换。

状态以提示符 "`disk_name`:`path_name`" 显示。

## 命令 {#commands}

在该文档文件中，所有必需的位置参数被称为 `<parameter>`，命名参数被称为 `[--parameter value]`。所有位置参数可以作为相应名称的命名参数提及。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  将目录更改为磁盘 `disk` 上的路径 `path`（默认值为当前磁盘）。不会发生磁盘切换。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`。
  递归地从磁盘 `disk_1` 上的 `path-from` （默认值为当前磁盘（在非交互模式下的参数 `disk`））复制数据到磁盘 `disk_2` 上的 `path-to` （默认值为当前磁盘（在非交互模式下的参数 `disk`））。
* `current_disk_with_path (current, current_disk, current_path)`
  以以下格式打印当前状态：
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  打印有关命令 `command` 的帮助信息。如果未指定 `command`，则打印所有命令的信息。
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
  从 `path-from` 读取文件到 `path`（如果未提供，则为 `stdout`）。
* `switch-disk [--path path] <disk>`
  切换到在路径 `path` 上的磁盘 `disk`（如果未指定 `path`，默认值为在磁盘 `disk` 上的之前路径）。
* `write (w) [--path-from path] <path-to>`。
  将文件从 `path`（如果未提供 `path` 则为 `stdin`，输入必须以 Ctrl+D 结束）写入到 `path-to`。
