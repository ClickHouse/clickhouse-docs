---
'description': 'Documentation for Clickhouse-disks'
'sidebar_label': 'clickhouse-disks'
'sidebar_position': 59
'slug': '/operations/utilities/clickhouse-disks'
'title': 'Clickhouse-disks'
---




# Clickhouse-disks

ClickHouseディスクに対するファイルシステムのような操作を提供するユーティリティです。インタラクティブおよび非インタラクティブモードの両方で動作できます。

## Program-wide options {#program-wide-options}

* `--config-file, -C` -- ClickHouseの設定ファイルへのパスで、デフォルトは`/etc/clickhouse-server/config.xml`です。
* `--save-logs` -- 実行されたコマンドの進行状況を`/var/log/clickhouse-server/clickhouse-disks.log`に記録します。
* `--log-level` -- ログに記録する[イベントのタイプ](../server-configuration-parameters/settings#logger)で、デフォルトは`none`です。
* `--disk` -- `mkdir, move, read, write, remove`コマンドに使用するディスクで、デフォルトは`default`です。
* `--query, -q` -- インタラクティブモードを起動せずに実行可能な単一クエリ
* `--help, -h` -- すべてのオプションとコマンドの説明を印刷します。

## Lazy initialization {#lazy-initialization}
設定にあるすべてのディスクは遅延初期化されます。これは、コマンドで使用されるときにのみ、ディスクに対応するオブジェクトが初期化されることを意味します。このプロセスはユーティリティをより頑健にし、設定に記載されているがユーザーによって使用されないディスクに触れることを避けるために行われます。ただし、clickhouse-disksの起動時には初期化されるべきディスクが必要です。このディスクはコマンドラインのパラメータ`--disk`で指定されます（デフォルト値は`default`です）。

## Default Disks {#default-disks}
起動後、構成ファイルには指定されていない2つのディスクが初期化可能です。

1. **`local` ディスク**: このディスクは、`clickhouse-disks`ユーティリティが起動されたローカルファイルシステムを模倣するために設計されています。その初期パスは、`clickhouse-disks`が開始されたディレクトリで、ファイルシステムのルートディレクトリにマウントされます。

2. **`default` ディスク**: このディスクは、設定で指定された`clickhouse/path`パラメータのディレクトリにローカルファイルシステムにマウントされます（デフォルト値は`/var/lib/clickhouse`です）。その初期パスは`/`に設定されています。

## Clickhouse-disks state {#clickhouse-disks-state}
追加された各ディスクに対して、ユーティリティは現在のディレクトリ（通常のファイルシステムのように）を保存します。ユーザーは現在のディレクトリを変更し、ディスク間を切り替えることができます。

状態はプロンプト`disk_name:`path_name``に反映されます。

## Commands {#commands}

このドキュメントファイルでは、すべての必須位置引数は`<parameter>`として参照され、名前付き引数は`[--parameter value]`として参照されます。すべての位置パラメータは、対応する名前を使用して名前付きパラメータとして言及されることがあります。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  ディスク`disk`のパス`path`にディレクトリを変更します（デフォルト値は現在のディスクです）。ディスクの切り替えは行われません。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  ディスク`disk_1`の`path-from`からデータを再帰的にコピーします（デフォルト値は現在のディスク（非インタラクティブモードの`disk`パラメータ））。
  ディスク`disk_2`の`path-to`にコピーします（デフォルト値は現在のディスク（非インタラクティブモードの`disk`パラメータ））。
* `current_disk_with_path (current, current_disk, current_path)`
  現在の状態を次の形式で出力します：
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  コマンド`command`に関するヘルプメッセージを印刷します。`command`が指定されていない場合は、すべてのコマンドに関する情報を表示します。
* `move (mv) <path-from> <path-to>`.
  現在のディスク内で`path-from`から`path-to`にファイルまたはディレクトリを移動します。
* `remove (rm, delete) <path>`.
  現在のディスク上で`path`を再帰的に削除します。
* `link (ln) <path-from> <path-to>`.
  現在のディスク上で`path-from`から`path-to`へのハードリンクを作成します。
* `list (ls) [--recursive] <path>`
  現在のディスク上の`path`にファイルをリストします。デフォルトは非再帰的です。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  ディスクの名前をリストします。
* `mkdir [--recursive] <path>` 現在のディスク上で。
  ディレクトリを作成します。デフォルトは非再帰的です。
* `read (r) <path-from> [--path-to path]`
  `path-from`から`path`にファイルを読み込みます（指定しない場合は`stdout`）。
* `switch-disk [--path path] <disk>`
  パス`path`でディスク`disk`に切り替えます（`path`が指定されていない場合、デフォルト値はディスク`disk`の前のパスになります）。
* `write (w) [--path-from path] <path-to>`.
  ファイルを`path`から（指定しない場合は`stdin`、入力はCtrl+Dで終了する必要があります）`path-to`に書き込みます。
