---
'description': 'Clickhouse-disks 的文档'
'sidebar_label': 'clickhouse-disks'
'sidebar_position': 59
'slug': '/operations/utilities/clickhouse-disks'
'title': 'Clickhouse-disks'
---


# Clickhouse-disks

一个为ClickHouse磁盘提供类似于文件系统操作的实用工具。它可以在交互模式和非交互模式下工作。

## Program-wide options {#program-wide-options}

* `--config-file, -C` -- ClickHouse配置的路径，默认值为`/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 将调用命令的进度记录到`/var/log/clickhouse-server/clickhouse-disks.log`。
* `--log-level` -- 日志记录的事件类型，默认值为`none`，详细内容参见 [type](../server-configuration-parameters/settings#logger)。
* `--disk` -- 用于`mkdir, move, read, write, remove`命令的磁盘。默认值为`default`。
* `--query, -q` -- 可以在不启动交互模式的情况下执行的单个查询。
* `--help, -h` -- 打印所有选项和命令及其描述。

## Lazy initialization {#lazy-initialization}
在配置中可用的所有磁盘都是懒初始化的。这意味着只有在某个命令中使用对应磁盘时，才会初始化该磁盘的对应对象。这是为了增强工具的健壮性，避免对配置中描述但未被用户使用的磁盘进行操作，这些磁盘可能在初始化时会失败。然而，启动clickhouse-disks时必须有一个磁盘被初始化。该磁盘通过命令行参数`--disk`指定（默认值为`default`）。

## Default Disks {#default-disks}
启动后，有两个未在配置中指定但可供初始化的磁盘。

1. **`local` 磁盘**：该磁盘旨在模拟启动`clickhouse-disks`实用工具的本地文件系统。其初始路径是从`clickhouse-disks`启动的目录，并且在文件系统的根目录下挂载。

2. **`default` 磁盘**：该磁盘挂载到配置中`clickhouse/path`参数指定的本地文件系统目录（默认值为`/var/lib/clickhouse`）。其初始路径设置为`/`。

## Clickhouse-disks state {#clickhouse-disks-state}
对于每个添加的磁盘，实用工具存储当前目录（与常规文件系统一样）。用户可以更改当前目录并在磁盘之间切换。

状态反映在提示中 "`disk_name`:`path_name`"

## Commands {#commands}

在本文件中，所有必需的位置参数称为 `<parameter>`，命名参数称为 `[--parameter value]`。所有位置参数都可以作为具有相应名称的命名参数提及。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  更改当前磁盘上`disk`的目录为`path`（默认值为当前磁盘）。不进行磁盘切换。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  递归复制数据，从磁盘`disk_1`上的`path-from`（默认值为当前磁盘（非交互模式下的`disk`参数））到磁盘`disk_2`上的`path-to`（默认值为当前磁盘（非交互模式下的`disk`参数））。
* `current_disk_with_path (current, current_disk, current_path)`
  打印当前状态，格式为：
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  打印有关命令`command`的帮助信息。如果未指定`command`，则打印有关所有命令的信息。
* `move (mv) <path-from> <path-to>`.
  在当前磁盘中将文件或目录从`path-from`移动到`path-to`。
* `remove (rm, delete) <path>`.
  在当前磁盘上递归删除`path`。
* `link (ln) <path-from> <path-to>`.
  在当前磁盘上从`path-from`创建到`path-to`的硬链接。
* `list (ls) [--recursive] <path>`
  列出当前磁盘上`path`的文件。默认情况下为非递归。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  列出磁盘名称。
* `mkdir [--recursive] <path>` 在当前磁盘上。
  创建一个目录。默认情况下为非递归。
* `read (r) <path-from> [--path-to path]`
  从`path-from`读取文件到`path`（如果未提供，则为`stdout`）。
* `switch-disk [--path path] <disk>`
  切换到磁盘`disk`，路径为`path`（如果未指定`path`，则默认值为磁盘`disk`上的上一个路径）。
* `write (w) [--path-from path] <path-to>`.
  将文件从`path`（如果未提供则为`stdin`，输入必须以 Ctrl+D 结束）写入到 `path-to`。
