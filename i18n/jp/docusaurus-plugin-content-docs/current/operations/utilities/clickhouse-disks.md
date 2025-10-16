---
'description': 'Clickhouse-disksのDocumentation'
'sidebar_label': 'clickhouse-disks'
'sidebar_position': 59
'slug': '/operations/utilities/clickhouse-disks'
'title': 'Clickhouse-disks'
'doc_type': 'reference'
---


# Clickhouse-disks

ClickHouse ディスクに対するファイルシステムのような操作を提供するユーティリティです。インタラクティブモードと非インタラクティブモードの両方で動作します。

## Program-wide options {#program-wide-options}

* `--config-file, -C` -- ClickHouse 設定ファイルへのパス。デフォルトは `/etc/clickhouse-server/config.xml` です。
* `--save-logs` -- 呼び出されたコマンドの進行状況を `/var/log/clickhouse-server/clickhouse-disks.log` に記録します。
* `--log-level` -- ログに記録するイベントの [タイプ](../server-configuration-parameters/settings#logger)、デフォルトは `none` です。
* `--disk` -- `mkdir, move, read, write, remove` コマンドに使用するディスク。デフォルトは `default` です。
* `--query, -q` -- インタラクティブモードを起動せずに実行できる単一のクエリ
* `--help, -h` -- すべてのオプションとコマンドの説明を表示します。

## Lazy initialization {#lazy-initialization}
設定で利用可能なすべてのディスクは遅延初期化されます。これは、ディスクがコマンドで使用されるときのみ、ディスクに対応するオブジェクトが初期化されることを意味します。これは、ユーティリティをより堅牢にし、設定で記述されているがユーザーによって使用されず、初期化中に失敗する可能性のあるディスクを触らないようにするために行われます。ただし、clickhouse-disks の起動時には初期化されるディスクが必要です。このディスクはコマンドライン経由で `--disk` パラメータを使用して指定します（デフォルト値は `default` です）。

## Default Disks {#default-disks}
起動後、設定に明記されていないが初期化可能なディスクが2つあります。

1. **`local` Disk**: このディスクは `clickhouse-disks` ユーティリティが起動されたローカルファイルシステムを模倣するために設計されています。その初期パスは `clickhouse-disks` が起動されたディレクトリで、ファイルシステムのルートディレクトリにマウントされています。

2. **`default` Disk**: このディスクは設定内の `clickhouse/path` パラメータで指定されたディレクトリにローカルファイルシステムにマウントされます（デフォルト値は `/var/lib/clickhouse` です）。その初期パスは `/` に設定されています。

## Clickhouse-disks state {#clickhouse-disks-state}
追加された各ディスクに対して、ユーティリティは現在のディレクトリを保存します（通常のファイルシステムのように）。ユーザーは現在のディレクトリを変更し、ディスク間を切り替えることができます。

状態はプロンプト "`disk_name`:`path_name`" に反映されます。

## Commands {#commands}

このドキュメント内では、すべての必須位置引数は `<parameter>` と示され、名前付き引数は `[--parameter value]` と示されます。すべての位置パラメータは、対応する名前付きパラメータとして言及できます。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  ディスク `disk` のパス `path` にディレクトリを変更します（デフォルト値は現在のディスクです）。ディスクの切り替えは行われません。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  ディスク `disk_1` の `path-from` から（デフォルト値は現在のディスク (引数 `disk` の非インタラクティブモード)） ディスク `disk_2` の `path-to` にデータを再帰的にコピーします（デフォルト値は現在のディスク (引数 `disk` の非インタラクティブモード)）。
* `current_disk_with_path (current, current_disk, current_path)`
  状態を次のフォーマットで表示します:
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  コマンド `command` に関するヘルプメッセージを表示します。 `command` が指定されていない場合は、すべてのコマンドに関する情報を出力します。
* `move (mv) <path-from> <path-to>`.
  現在のディスク内で `path-from` から `path-to` にファイルまたはディレクトリを移動します。
* `remove (rm, delete) <path>`.
  現在のディスク上で `path` を再帰的に削除します。
* `link (ln) <path-from> <path-to>`.
  現在のディスク上で `path-from` から `path-to` へのハードリンクを作成します。
* `list (ls) [--recursive] <path>`
  現在のディスク上の `path` 内のファイルをリストします。デフォルトでは再帰的ではありません。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  ディスク名をリストします。
* `mkdir [--recursive] <path>` 現在のディスク上で。
  ディレクトリを作成します。デフォルトでは再帰的ではありません。
* `read (r) <path-from> [--path-to path]`
  `path-from` から `path` へファイルを読み込みます（指定がない場合は `stdout` に出力されます）。
* `switch-disk [--path path] <disk>`
  `path` 上のディスク `disk` に切り替えます（`path` が指定されていない場合、デフォルト値はディスク `disk` 上の前のパスになります）。
* `write (w) [--path-from path] <path-to>`.
  `path` から（指定がない場合は `stdin` から、入力は Ctrl+D で終了する必要があります） `path-to` にファイルを書き込みます。
