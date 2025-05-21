description: 'Clickhouse-disks に関するドキュメント'
sidebar_label: 'clickhouse-disks'
sidebar_position: 59
slug: /operations/utilities/clickhouse-disks
title: 'Clickhouse-disks'
```


# Clickhouse-disks

ClickHouse のディスクにファイルシステムのような操作を提供するユーティリティです。インタラクティブモードと非インタラクティブモードの両方で動作します。

## プログラム全体のオプション {#program-wide-options}

* `--config-file, -C` -- ClickHouse の構成ファイルへのパス。デフォルトは `/etc/clickhouse-server/config.xml` です。
* `--save-logs` -- 呼び出されたコマンドの進行状況を `/var/log/clickhouse-server/clickhouse-disks.log` にログします。
* `--log-level` -- ログするイベントの[タイプ](../server-configuration-parameters/settings#logger)。デフォルトは `none` です。
* `--disk` -- `mkdir, move, read, write, remove` コマンドに使用するディスク。デフォルトは `default` です。
* `--query, -q` -- インタラクティブモードを起動せずに実行できる単一クエリ。
* `--help, -h` -- すべてのオプションとコマンドの説明を表示します。

## レイジー初期化 {#lazy-initialization}
構成に利用可能なすべてのディスクはレイジーに初期化されます。これは、コマンドで使用されるまで対応するディスクのオブジェクトが初期化されないことを意味します。これにより、より堅牢なユーティリティが実現され、構成に記述されているがユーザーによって使用されず、初期化時に失敗する可能性のあるディスクには触れないようにされています。ただし、clickhouse-disks の起動時には初期化されるディスクが必要です。このディスクは、コマンドラインを通じて `--disk` パラメータで指定されます（デフォルト値は `default` です）。

## デフォルトディスク {#default-disks}
起動後、構成で指定されていないが初期化可能な2つのディスクがあります。

1. **`local` ディスク**: このディスクは、`clickhouse-disks` ユーティリティが起動されたローカルファイルシステムを模倣するように設計されています。その初期パスは、`clickhouse-disks` が開始されたディレクトリで、ファイルシステムのルートディレクトリにマウントされます。

2. **`default` ディスク**: このディスクは、構成の `clickhouse/path` パラメータで指定されたディレクトリにローカルファイルシステムにマウントされます（デフォルト値は `/var/lib/clickhouse` です）。その初期パスは `/` に設定されています。

## Clickhouse-disks の状態 {#clickhouse-disks-state}
追加された各ディスクについて、ユーティリティは現在のディレクトリ（通常のファイルシステムのように）を保存します。ユーザーは現在のディレクトリを変更し、ディスク間を切り替えることができます。

状態はプロンプト "`disk_name`:`path_name`" に反映されます。

## コマンド {#commands}

このドキュメントファイルでは、すべての必須位置引数は `<parameter>` として、名前付き引数は `[--parameter value]` として言及されます。すべての位置引数は、対応する名前を持つ名前付き引数として言及できます。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  ディスク `disk` のパス `path` にディレクトリを変更します（デフォルト値は現在のディスク）。ディスク切り替えは発生しません。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  ディスク `disk_1` の `path-from` から（デフォルト値は現在のディスク（非インタラクティブモードでの `disk` パラメータ））、`disk_2` の `path-to` にデータを再帰的にコピーします（デフォルト値は現在のディスク（非インタラクティブモードでの `disk` パラメータ））。
* `current_disk_with_path (current, current_disk, current_path)`
  現在の状態を次の形式で表示します：
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  コマンド `command` に関するヘルプメッセージを表示します。`command` が指定されていない場合は、すべてのコマンドに関する情報を表示します。
* `move (mv) <path-from> <path-to>`.
  現在のディスク内で `path-from` から `path-to` へファイルまたはディレクトリを移動します。
* `remove (rm, delete) <path>`.
  現在のディスク上で `path` を再帰的に削除します。
* `link (ln) <path-from> <path-to>`.
  現在のディスク上で `path-from` から `path-to` へのハードリンクを作成します。
* `list (ls) [--recursive] <path>`
  現在のディスクの `path` にあるファイルをリストします。デフォルトは非再帰的です。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  ディスクの名前をリストします。
* `mkdir [--recursive] <path>` 現在のディスクで。
  ディレクトリを作成します。デフォルトは非再帰的です。
* `read (r) <path-from> [--path-to path]`
  `path-from` からファイルを読み取り、`path` へ書き込みます（指定されていない場合は `stdout` に書き込みます）。
* `switch-disk [--path path] <disk>`
  ディスク `disk` にパス `path` で切り替えます（`path` が指定されていない場合、デフォルト値はディスク `disk` の前のパスです）。
* `write (w) [--path-from path] <path-to>`.
  `path` からファイルを (`path` が指定されていない場合は `stdin` から、入力は Ctrl+D で終了する必要があります) `path-to` に書き込みます。
