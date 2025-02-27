---
slug: /operations/utilities/clickhouse-disks
sidebar_position: 59
sidebar_label: clickhouse-disks
---

# Clickhouse-disks

ClickHouse のディスクに対するファイルシステムのような操作を提供するユーティリティです。インタラクティブモードと非インタラクティブモードの両方で動作可能です。

## プログラム全体のオプション {#program-wide-options}

* `--config-file, -C` -- ClickHouse の設定ファイルへのパス、デフォルトは `/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 実行されたコマンドの進行状況を `/var/log/clickhouse-server/clickhouse-disks.log` にログ保存します。
* `--log-level` -- ログに記録する [イベントの種類](../server-configuration-parameters/settings#logger)、デフォルトは `none`。
* `--disk` -- `mkdir, move, read, write, remove` コマンドに使用するディスク。デフォルトは `default`。
* `--query, -q` -- インタラクティブモードを起動せずに実行可能な単一のクエリ。
* `--help, -h` -- すべてのオプションとコマンドの説明を印刷します。

## レイジー初期化 {#lazy-initialization}
設定に利用可能なすべてのディスクはレイジーに初期化されます。これは、コマンドでディスクが使用されるときにのみ、対応するオブジェクトが初期化されることを意味します。これは、ユーティリティをより堅牢にし、設定に記述されているがユーザーによって使用されず、初期化中に失敗する可能性のあるディスクに触れるのを避けるために行われます。ただし、clickhouse-disks の起動時に初期化されるディスクが必要です。このディスクは、コマンドラインの引数 `--disk` で指定されます（デフォルト値は `default`）。

## デフォルトディスク {#default-disks}
起動後、設定に指定されていないが初期化可能なディスクが2つあります。

1. **`local` ディスク**: このディスクは、`clickhouse-disks` ユーティリティが起動されたローカルファイルシステムを模倣するように設計されています。初期パスは `clickhouse-disks` が起動されたディレクトリで、ファイルシステムのルートディレクトリにマウントされます。

2. **`default` ディスク**: このディスクは、設定内の `clickhouse/path` パラメータで指定されたディレクトリにローカルファイルシステムとしてマウントされます（デフォルト値は `/var/lib/clickhouse`）。初期パスは `/` に設定されています。

## Clickhouse-disks の状態 {#clickhouse-disks-state}
追加された各ディスクについて、ユーティリティは現在のディレクトリを保存します（通常のファイルシステムのように）。ユーザーは現在のディレクトリを変更し、ディスク間で切り替えることができます。

状態はプロンプト "`disk_name`:`path_name`" で反映されます。

## コマンド {#commands}

このドキュメントファイルでは、すべての必須位置引数は `<parameter>`、名前付き引数は `[--parameter value]` と表記されます。すべての位置引数は、対応する名前を持つ名前付きパラメータとして言及可能です。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  ディスク `disk`（デフォルト値は現在のディスク）上のパス `path` にディレクトリを変更します。ディスクの切り替えは行われません。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  ディスク `disk_1` の `path-from` からデータを再帰的にコピーし（デフォルト値は現在のディスク (非インタラクティブモードのパラメータ `disk`））、ディスク `disk_2` の `path-to` にコピーします（デフォルト値は現在のディスク (非インタラクティブモードのパラメータ `disk`））。
* `current_disk_with_path (current, current_disk, current_path)`
  現在の状態を次の形式で印刷します：
    `Disk: "current_disk" Path: "現在のディスク上の現在のパス"`
* `help [<command>]`
  コマンド `command` に関するヘルプメッセージを印刷します。`command` が指定されていない場合は、すべてのコマンドに関する情報を印刷します。
* `move (mv) <path-from> <path-to>`.
  現在のディスク内でファイルまたはディレクトリを `path-from` から `path-to` に移動します。
* `remove (rm, delete) <path>`.
  現在のディスク上で `path` を再帰的に削除します。
* `link (ln) <path-from> <path-to>`.
  現在のディスク上で `path-from` から `path-to` へのハードリンクを作成します。
* `list (ls) [--recursive] <path>`
  現在のディスク上の `path` のファイルをリストします。デフォルトは非再帰的です。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  ディスク名をリストします。
* `mkdir [--recursive] <path>` 現在のディスク上で。
  ディレクトリを作成します。デフォルトは非再帰的です。
* `read (r) <path-from> [--path-to path]`
  `path-from` から `path` にファイルを読み込みます（指定されない場合は `stdout` に出力）。
* `switch-disk [--path path] <disk>`
  パス `path` でディスク `disk` に切り替えます（`path` が指定されていない場合、デフォルト値はディスク `disk` 上の以前のパスです）。
* `write (w) [--path-from path] <path-to>`.
  `path` からファイルを（指定されない場合は `stdin` から、入力は Ctrl+D で終了）`path-to` に書き込みます。
