---
description: 'ClickHouse-disks のドキュメント'
sidebar_label: 'ClickHouse-disks'
sidebar_position: 59
slug: /operations/utilities/clickhouse-disks
title: 'ClickHouse-disks'
doc_type: 'reference'
---



# Clickhouse-disks

ClickHouse のディスクに対して、ファイルシステムのような操作を行うユーティリティです。インタラクティブモードと非インタラクティブモードの両方で動作します。



## プログラム全体のオプション {#program-wide-options}

- `--config-file, -C` -- ClickHouse設定ファイルへのパス。デフォルトは `/etc/clickhouse-server/config.xml`。
- `--save-logs` -- 実行されたコマンドの進行状況を `/var/log/clickhouse-server/clickhouse-disks.log` に記録します。
- `--log-level` -- 記録するイベントの[種類](../server-configuration-parameters/settings#logger)。デフォルトは `none`。
- `--disk` -- `mkdir, move, read, write, remove` コマンドで使用するディスク。デフォルトは `default`。
- `--query, -q` -- 対話モードを起動せずに実行できる単一のクエリ。
- `--help, -h` -- すべてのオプションとコマンドを説明付きで表示します。


## 遅延初期化 {#lazy-initialization}

設定ファイルで利用可能なすべてのディスクは遅延初期化されます。これは、ディスクに対応するオブジェクトが、そのディスクが何らかのコマンドで使用される際にのみ初期化されることを意味します。これにより、ユーティリティの堅牢性が向上し、設定ファイルに記述されているもののユーザーが使用せず、初期化時に失敗する可能性のあるディスクへのアクセスを回避できます。ただし、clickhouse-disksの起動時に初期化されるディスクが少なくとも1つ必要です。このディスクは、コマンドラインパラメータ`--disk`で指定します(デフォルト値は`default`)。


## デフォルトディスク {#default-disks}

起動後、設定ファイルには指定されていませんが、初期化に使用可能な2つのディスクが存在します。

1. **`local` ディスク**: このディスクは、`clickhouse-disks` ユーティリティが起動されたローカルファイルシステムを模倣するように設計されています。初期パスは `clickhouse-disks` が起動されたディレクトリであり、ファイルシステムのルートディレクトリにマウントされます。

2. **`default` ディスク**: このディスクは、設定ファイルの `clickhouse/path` パラメータで指定されたディレクトリ(デフォルト値は `/var/lib/clickhouse`)内のローカルファイルシステムにマウントされます。初期パスは `/` に設定されます。


## Clickhouse-disks の状態 {#clickhouse-disks-state}

追加された各ディスクについて、ユーティリティは現在のディレクトリを保持します（通常のファイルシステムと同様）。ユーザーは現在のディレクトリを変更したり、ディスク間を切り替えたりすることができます。

状態はプロンプト "`disk_name`:`path_name`" に反映されます


## コマンド {#commands}

このドキュメントでは、すべての必須位置引数は `<parameter>` として、名前付き引数は `[--parameter value]` として表記されます。すべての位置パラメータは、対応する名前を持つ名前付きパラメータとして指定することもできます。

- `cd (change-dir, change_dir) [--disk disk] <path>`
  ディスク `disk` 上のパス `path` にディレクトリを変更します(デフォルト値は現在のディスク)。ディスクの切り替えは行われません。
- `copy (cp) [--disk-from disk_1] [--disk-to disk_2] <path-from> <path-to>`.
  ディスク `disk_1` の `path-from` からディスク `disk_2` の `path-to` へデータを再帰的にコピーします(デフォルト値は現在のディスク(非対話モードでは `disk` パラメータ))。
- `current_disk_with_path (current, current_disk, current_path)`
  現在の状態を次の形式で出力します:
  `Disk: "current_disk" Path: "current path on current disk"`
- `help [<command>]`
  コマンド `command` に関するヘルプメッセージを出力します。`command` が指定されていない場合は、すべてのコマンドに関する情報を出力します。
- `move (mv) <path-from> <path-to>`.
  現在のディスク内で、ファイルまたはディレクトリを `path-from` から `path-to` へ移動します。
- `remove (rm, delete) <path>`.
  現在のディスク上の `path` を再帰的に削除します。
- `link (ln) <path-from> <path-to>`.
  現在のディスク上で `path-from` から `path-to` へハードリンクを作成します。
- `list (ls) [--recursive] <path>`
  現在のディスク上の `path` にあるファイルを一覧表示します。デフォルトでは非再帰的です。
- `list-disks (list_disks, ls-disks, ls_disks)`.
  ディスク名を一覧表示します。
- `mkdir [--recursive] <path>` on a current disk.
  現在のディスク上にディレクトリを作成します。デフォルトでは非再帰的です。
- `read (r) <path-from> [--path-to path]`
  `path-from` からファイルを読み取り、`path` へ出力します(指定されていない場合は `stdout`)。
- `switch-disk [--path path] <disk>`
  パス `path` でディスク `disk` に切り替えます(`path` が指定されていない場合、デフォルト値はディスク `disk` 上の以前のパス)。
- `write (w) [--path-from path] <path-to>`.
  `path` からファイルを書き込み、`path-to` へ出力します(`path` が指定されていない場合は `stdin`、入力はCtrl+Dで終了する必要があります)。
