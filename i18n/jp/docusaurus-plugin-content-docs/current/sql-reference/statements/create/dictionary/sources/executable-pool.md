---
slug: /sql-reference/statements/create/dictionary/sources/executable-pool
title: 'Executable Pool Dictionary ソース'
sidebar_position: 4
sidebar_label: 'Executable Pool'
description: 'ClickHouse で Executable Pool を Dictionary ソースとして構成します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Executable pool はプロセスのプールからデータをロードできます。
このソースは、ソースからすべてのデータをロードする必要がある Dictionary レイアウトでは動作しません。

Executable pool は、Dictionary が次のいずれかのレイアウトを用いて[保存されている](../layouts/#storing-dictionaries-in-memory)場合に動作します:

* `cache`
* `complex_key_cache`
* `ssd_cache`
* `complex_key_ssd_cache`
* `direct`
* `complex_key_direct`

Executable pool は、指定されたコマンドでプロセスのプールを起動し、それらが終了するまで実行し続けます。プログラムは、利用可能な間は STDIN からデータを読み取り、結果を STDOUT に出力する必要があります。また、STDIN 上の次のブロックのデータを待つこともできます。ClickHouse はデータブロックを処理した後に STDIN をクローズせず、必要に応じて別の chunk のデータをパイプします。実行可能スクリプトはこの方式のデータ処理に対応している必要があり、STDIN をポーリングし、早めにデータを STDOUT にフラッシュしなければなりません。

設定例:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(EXECUTABLE_POOL(
        command 'while read key; do printf "$key\tData for key $key\n"; done'
        format 'TabSeparated'
        pool_size 10
        max_command_execution_time 10
        implicit_key false
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="構成ファイル">
    ```xml
    <source>
        <executable_pool>
            <command><command>while read key; do printf "$key\tData for key $key\n"; done</command</command>
            <format>TabSeparated</format>
            <pool_size>10</pool_size>
            <max_command_execution_time>10<max_command_execution_time>
            <implicit_key>false</implicit_key>
        </executable_pool>
    </source>
    ```
  </TabItem>
</Tabs>

設定項目:

| Setting                       | Description                                                                                                                                                                                                                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`                     | 実行可能ファイルへの絶対パス、または（プログラムディレクトリが `PATH` に指定されている場合は）ファイル名。                                                                                                                                                                                                                                                            |
| `format`                      | ファイルフォーマット。[Formats](/sql-reference/formats) で説明されているすべてのフォーマットがサポートされます。                                                                                                                                                                                                                                            |
| `pool_size`                   | プールのサイズ。`pool_size` として 0 が指定された場合、プールサイズに制限はありません。デフォルト値は `16` です。                                                                                                                                                                                                                                                  |
| `command_termination_timeout` | 実行可能スクリプトはメインの読み書きループを含んでいる必要があります。Dictionary が破棄されるとパイプがクローズされ、実行可能ファイルは、ClickHouse が子プロセスに SIGTERM シグナルを送信する前にシャットダウンするための `command_termination_timeout` 秒が与えられます。秒単位で指定します。デフォルト値は `10`。省略可能。                                                                                                                     |
| `max_command_execution_time`  | データブロックを処理するための、実行可能スクリプトのコマンドの最大実行時間。秒単位で指定します。デフォルト値は `10`。省略可能。                                                                                                                                                                                                                                                   |
| `command_read_timeout`        | コマンドの stdout からデータを読み取るタイムアウト（ミリ秒）。デフォルト値は `10000`。省略可能。                                                                                                                                                                                                                                                             |
| `command_write_timeout`       | コマンドの stdin にデータを書き込むタイムアウト（ミリ秒）。デフォルト値は `10000`。省略可能。                                                                                                                                                                                                                                                               |
| `implicit_key`                | 実行可能ソースファイルは値のみを返すことができ、要求されたキーとの対応関係は、結果内の行の順序によって暗黙的に決定されます。デフォルト値は `false`。省略可能。                                                                                                                                                                                                                                  |
| `execute_direct`              | `execute_direct` = `1` の場合、`command` は [user&#95;scripts&#95;path](/operations/server-configuration-parameters/settings#user_scripts_path) で指定された user&#95;scripts フォルダ内で検索されます。追加のスクリプト引数は空白区切りで指定できます（例: `script_name arg1 arg2`）。`execute_direct` = `0` の場合、`command` は `bin/sh -c` の引数として渡されます。デフォルト値は `1`。省略可能。 |
| `send_chunk_header`           | プロセスにデータの chunk を送信する前に行数を送信するかどうかを制御します。デフォルト値は `false`。省略可能。                                                                                                                                                                                                                                                       |

この Dictionary ソースは XML 構成のみで設定できます。DDL を使用して executable ソースを持つ Dictionary を作成することは無効化されています。そうしないと、DB ユーザーが ClickHouse ノード上で任意のバイナリを実行できてしまうためです。
