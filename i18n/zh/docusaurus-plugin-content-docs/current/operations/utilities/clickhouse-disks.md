---
'description': 'Clickhouse-disks 的文档'
'sidebar_label': 'clickhouse-disks'
'sidebar_position': 59
'slug': '/operations/utilities/clickhouse-disks'
'title': 'Clickhouse-disks'
'doc_type': 'reference'
---


# Clickhouse-disks

一个为ClickHouse磁盘提供文件系统类操作的工具。它可以在交互模式和非交互模式下运行。

## Program-wide options {#program-wide-options}

* `--config-file, -C` -- ClickHouse配置文件的路径，默认为`/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 将调用命令的进度记录到`/var/log/clickhouse-server/clickhouse-disks.log`。
* `--log-level` -- 记录何种[类型](../server-configuration-parameters/settings#logger)的事件，默认为`none`。
* `--disk` -- 用于`mkdir, move, read, write, remove`命令的磁盘。默认为`default`。
* `--query, -q` -- 可以在不启动交互模式的情况下执行的单个查询
* `--help, -h` -- 打印所有选项和命令及其说明

## Lazy initialization {#lazy-initialization}
所有在配置中可用的磁盘都是延迟初始化的。这意味着只有在某个命令中使用时，才会初始化相应磁盘的对象。这是为了使工具更加健壮，避免处理在配置中描述但未被用户使用的磁盘，因其在初始化时可能会失败。然而，在clickhouse-disks启动时应有一个被初始化的磁盘。这个磁盘通过命令行的参数`--disk`指定（默认值为`default`）。

## Default Disks {#default-disks}
启动后，有两个未在配置中指定但可用于初始化的磁盘。

1. **`local` Disk**: 该磁盘旨在模仿启动`clickhouse-disks`工具的本地文件系统。其初始路径为启动`clickhouse-disks`的目录，并挂载在文件系统的根目录上。

2. **`default` Disk**: 该磁盘挂载到本地文件系统中，由配置中的`clickhouse/path`参数指定的目录（默认值为`/var/lib/clickhouse`）。其初始路径设置为`/`。

## Clickhouse-disks state {#clickhouse-disks-state}
对于每一个添加的磁盘，工具会存储当前目录（如同一个普通文件系统）。用户可以更改当前目录并在磁盘之间切换。

状态通过提示符"`disk_name`:`path_name`"反映。

## Commands {#commands}

在这份文档中，所有必需的位置参数称为`<parameter>`，命名参数称为`[--parameter value]`。所有位置参数也可以以相应名称作为命名参数提及。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  切换到磁盘`disk`上的路径`path`（默认值为当前磁盘）。不会发生磁盘切换。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  递归地从磁盘`disk_1`上的`path-from`（默认值为当前磁盘（在非交互模式下参数`disk`））复制数据到磁盘`disk_2`上的`path-to`（默认值为当前磁盘（在非交互模式下参数`disk`））。
* `current_disk_with_path (current, current_disk, current_path)`
  打印当前状态，格式为：
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  打印关于命令`command`的帮助信息。如果未指定`command`，则打印所有命令的信息。
* `move (mv) <path-from> <path-to>`.
  在当前磁盘上将文件或目录从`path-from`移动到`path-to`。
* `remove (rm, delete) <path>`.
  在当前磁盘上递归移除`path`。
* `link (ln) <path-from> <path-to>`.
  在当前磁盘上从`path-from`创建到`path-to`的硬链接。
* `list (ls) [--recursive] <path>`
  列出当前磁盘上`path`的文件。默认不递归。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  列出磁盘名称。
* `mkdir [--recursive] <path>` 在当前磁盘上。
  创建一个目录。默认不递归。
* `read (r) <path-from> [--path-to path]`
  从`path-from`读取一个文件到`path`（如果未提供则为`stdout`）。
* `switch-disk [--path path] <disk>`
  切换到磁盘`disk`上的路径`path`（如果未指定`path`，默认值为磁盘`disk`上的前一个路径）。
* `write (w) [--path-from path] <path-to>`.
  从`path`（如果未提供则为`stdin`，输入必须以Ctrl+D结束）写入文件到`path-to`。
