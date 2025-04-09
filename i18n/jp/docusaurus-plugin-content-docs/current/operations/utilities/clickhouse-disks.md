---
slug: /operations/utilities/clickhouse-disks
sidebar_position: 59
sidebar_label: clickhouse-disks
---


# Clickhouse-disks

ClickHouse のディスクに対するファイルシステムのような操作を提供するユーティリティです。インタラクティブモードと非インタラクティブモードの両方で動作可能です。

## プログラム全体のオプション {#program-wide-options}

* `--config-file, -C` -- ClickHouse 設定へのパス、デフォルトは `/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 呼び出したコマンドの進行状況を `/var/log/clickhouse-server/clickhouse-disks.log` に記録します。
* `--log-level` -- 記録するイベントの [タイプ](../server-configuration-parameters/settings#logger)、デフォルトは `none`。
* `--disk` -- `mkdir, move, read, write, remove` コマンドで使用するディスク。デフォルトは `default`。
* `--query, -q` -- インタラクティブモードを起動せずに実行可能な単一のクエリ。
* `--help, -h` -- 全てのオプションとコマンドの説明を表示。

## レイジー初期化 {#lazy-initialization}
設定に利用可能なすべてのディスクはレイジーに初期化されます。これは、対応するディスクがコマンドで使用される時にのみディスクのオブジェクトが初期化されることを意味します。これにより、設定で説明されているがユーザーによって使用されず、初期化中に失敗する可能性のあるディスクに触れることを避け、ユーティリティをより堅牢にします。ただし、clickhouse-disks を起動する際には、初期化される必要があるディスクがあります。このディスクはコマンドラインのパラメータ `--disk` で指定されます（デフォルト値は `default`）。

## デフォルトディスク {#default-disks}
起動後、設定に指定されていないが初期化可能な2つのディスクがあります。

1. **`local` ディスク**: このディスクは、`clickhouse-disks` ユーティリティが起動されたローカルファイルシステムを模倣するように設計されています。その初期パスは、`clickhouse-disks` が起動されたディレクトリであり、ファイルシステムのルートディレクトリにマウントされます。

2. **`default` ディスク**: このディスクは、設定の `clickhouse/path` パラメータによって指定されたディレクトリにローカルファイルシステムにマウントされます（デフォルト値は `/var/lib/clickhouse`）。その初期パスは `/` に設定されています。

## Clickhouse-disks 状態 {#clickhouse-disks-state}
追加された各ディスクについて、ユーティリティは現在のディレクトリを（通常のファイルシステムのように）保存します。ユーザーは現在のディレクトリを変更し、ディスク間を切り替えることができます。

状態はプロンプト "`disk_name`:`path_name`" に反映されます。

## コマンド {#commands}

このドキュメントファイルでは、すべての必須位置引数は `<parameter>` として言及され、名前付き引数は `[--parameter value]` として言及されます。すべての位置引数は、対応する名前で名前付き引数として言及することができます。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  ディスク `disk`（デフォルト値は現在のディスク）においてパス `path` にディレクトリを変更します。ディスクの切り替えは行われません。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  ディスク `disk_1` の `path-from` からデータを再帰的にコピーします（デフォルト値は現在のディスク（非インタラクティブモードのパラメータ `disk`））
  ディスク `disk_2` の `path-to` へ（デフォルト値は現在のディスク（非インタラクティブモードのパラメータ `disk`））。
* `current_disk_with_path (current, current_disk, current_path)`
  現在の状態を次の形式で表示します：
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  コマンド `command` に関するヘルプメッセージを表示します。`command` が指定されていない場合は、すべてのコマンドに関する情報を表示します。
* `move (mv) <path-from> <path-to>`.
  現在のディスク内で、`path-from` から `path-to` へファイルまたはディレクトリを移動します。
* `remove (rm, delete) <path>`
  現在のディスクで `path` を再帰的に削除します。
* `link (ln) <path-from> <path-to>`
  現在のディスクで `path-from` から `path-to` へハードリンクを作成します。
* `list (ls) [--recursive] <path>`
  現在のディスクの `path` にあるファイルをリスト表示します。デフォルトでは非再帰的です。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  ディスク名をリスト表示します。
* `mkdir [--recursive] <path>` 現在のディスクで。
  ディレクトリを作成します。デフォルトでは非再帰的です。
* `read (r) <path-from> [--path-to path]`
  `path-from` から `path` へファイルを読み取ります（指定がない場合は `stdout`）。
* `switch-disk [--path path] <disk>`
  パス `path` でディスク `disk` に切り替えます（`path` が指定されていない場合、デフォルト値はディスク `disk` の前のパスです）。
* `write (w) [--path-from path] <path-to>`.
  `path` からファイルを（指定がない場合は `stdin`、入力は Ctrl+D で終了する必要があります） `path-to` へ書き込みます。
