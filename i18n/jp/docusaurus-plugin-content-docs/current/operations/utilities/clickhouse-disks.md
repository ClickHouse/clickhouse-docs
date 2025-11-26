---
description: 'ClickHouse-disks のリファレンス'
sidebar_label: 'clickhouse-disks'
sidebar_position: 59
slug: /operations/utilities/clickhouse-disks
title: 'ClickHouse-disks'
doc_type: 'reference'
---



# Clickhouse-disks

ClickHouse ディスクに対して、ファイルシステムのような操作を提供するユーティリティです。インタラクティブおよび非インタラクティブの両モードで動作します。



## プログラム全体のオプション {#program-wide-options}

* `--config-file, -C` -- 使用する ClickHouse の設定ファイルへのパス。既定値は `/etc/clickhouse-server/config.xml`。
* `--save-logs` -- 実行したコマンドの進行状況を `/var/log/clickhouse-server/clickhouse-disks.log` にログ出力します。
* `--log-level` -- ログ出力するイベントの[種類](../server-configuration-parameters/settings#logger)。既定値は `none`。
* `--disk` -- `mkdir, move, read, write, remove` コマンドで使用するディスク。既定値は `default`。
* `--query, -q` -- 対話モードを起動せずに実行できる単一のクエリ。
* `--help, -h` -- すべてのオプションとコマンド、およびその説明を表示します。



## 遅延初期化 {#lazy-initialization}
設定に記載されているすべてのディスクは、遅延初期化されます。つまり、あるディスクに対応するオブジェクトは、そのディスクが何らかのコマンドで実際に使用されたときにのみ初期化されます。これは、ユーティリティをより堅牢にし、設定には記述されているもののユーザーが使用しておらず、初期化時に失敗する可能性のあるディスクに触れないようにするためです。ただし、`clickhouse-disks` の起動時に初期化されるディスクが 1 つ存在している必要があります。このディスクは、コマンドラインからパラメータ `--disk` を使用して指定します（デフォルト値は `default` です）。



## デフォルトディスク {#default-disks}
起動後、設定には明示されていませんが、初期化に利用可能なディスクが 2 つあります。

1. **`local` ディスク**: このディスクは、`clickhouse-disks` ユーティリティが起動された元のローカルファイルシステムを模倣するように設計されています。初期パスは `clickhouse-disks` が開始されたディレクトリであり、ファイルシステムのルートディレクトリにマウントされます。

2. **`default` ディスク**: このディスクは、設定内の `clickhouse/path` パラメータで指定されたディレクトリ（デフォルト値は `/var/lib/clickhouse`）に、ローカルファイルシステム上のディレクトリとしてマウントされます。初期パスは `/` に設定されています。



## Clickhouse-disks の状態 {#clickhouse-disks-state}
追加された各ディスクについて、このユーティリティは現在のディレクトリ（通常のファイルシステムと同様）を記録します。ユーザーは現在のディレクトリを変更したり、ディスク間を切り替えたりできます。

状態はプロンプト "`disk_name`:`path_name`" に反映されます。



## コマンド {#commands}

このドキュメントでは、必須の位置引数は `<parameter>`、名前付き引数は `[--parameter value]` の形式で表記します。すべての位置引数は、対応する名前を用いた名前付き引数として指定することもできます。

* `cd (change-dir, change_dir) [--disk disk] <path>`
  ディスク `disk` 上のパス `path` をカレントディレクトリに変更します（デフォルト値は現在のディスク）。ディスクの切り替えは行われません。
* `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  ディスク `disk_1` 上の `path-from` からデータを再帰的にコピーし（デフォルト値は現在のディスク（非対話モードではパラメータ `disk`））、
  ディスク `disk_2` 上の `path-to` にコピーします（デフォルト値は現在のディスク（非対話モードではパラメータ `disk`））。
* `current_disk_with_path (current, current_disk, current_path)`
  現在の状態を次の形式で出力します:
    `Disk: "current_disk" Path: "current path on current disk"`
* `help [<command>]`
  コマンド `command` に関するヘルプメッセージを出力します。`command` が指定されていない場合は、すべてのコマンドに関する情報を出力します。
* `move (mv) <path-from> <path-to>`.
  現在のディスク内で、`path-from` から `path-to` へファイルまたはディレクトリを移動します。
* `remove (rm, delete) <path>`.
  現在のディスク上で `path` を再帰的に削除します。
* `link (ln) <path-from> <path-to>`.
  現在のディスク上で、`path-from` から `path-to` へのハードリンクを作成します。
* `list (ls) [--recursive] <path>`
  現在のディスク上の `path` にあるファイルを一覧表示します。デフォルトでは再帰的に一覧表示しません。
* `list-disks (list_disks, ls-disks, ls_disks)`.
  ディスク名を一覧表示します。
* `mkdir [--recursive] <path>` 現在のディスク上で実行。
  ディレクトリを作成します。デフォルトでは再帰的に作成しません。
* `read (r) <path-from> [--path-to path]`
  `path-from` からファイルを読み取り、`path` に出力します（指定されていない場合は `stdout` に出力します）。
* `switch-disk [--path path] <disk>`
  パス `path` 上のディスク `disk` に切り替えます（`path` が指定されていない場合のデフォルト値は、ディスク `disk` 上の直前のパスです）。
* `write (w) [--path-from path] <path-to>`.
  `path` からファイルを書き込み、`path-to` に出力します（`path` が指定されていない場合は `stdin` を使用し、入力は Ctrl+D で終了する必要があります）。
