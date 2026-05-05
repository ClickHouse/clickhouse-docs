---
slug: /sql-reference/statements/create/dictionary/sources/executable-file
title: '実行ファイル Dictionary ソース'
sidebar_position: 3
sidebar_label: '実行ファイル'
description: 'ClickHouse で実行ファイルを Dictionary ソースとして設定します。'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

実行可能ファイルの扱い方は、[Dictionary がメモリ上にどのように保存されているか](../layouts/)によって異なります。Dictionary が `cache` および `complex_key_cache` を使って保存されている場合、ClickHouse は必要なキーを取得するために、実行可能ファイルの STDIN にリクエストを送信します。そうでない場合、ClickHouse は実行可能ファイルを起動し、その出力を Dictionary データとして扱います。

設定の例:

<Tabs>
  <TabItem value="ddl" label="DDL" default>
    ```sql
    SOURCE(EXECUTABLE(
        command 'cat /opt/dictionaries/os.tsv'
        format 'TabSeparated'
        implicit_key false
    ))
    ```
  </TabItem>

  <TabItem value="xml" label="Configuration file">
    ```xml
    <source>
        <executable>
            <command>cat /opt/dictionaries/os.tsv</command>
            <format>TabSeparated</format>
            <implicit_key>false</implicit_key>
        </executable>
    </source>
    ```
  </TabItem>
</Tabs>

Setting のフィールド:

| Setting                       | Description                                                                                                                                                                                                                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`                     | 実行可能ファイルへの絶対パス、またはファイル名（コマンドのディレクトリが `PATH` に含まれている場合）。                                                                                                                                                                                                                                                                 |
| `format`                      | ファイル形式。[Formats](/sql-reference/formats) で説明されているすべてのフォーマットがサポートされます。                                                                                                                                                                                                                                                   |
| `command_termination_timeout` | 実行可能スクリプトにはメインの読み書きループを含める必要があります。Dictionary が破棄されるとパイプはクローズされ、実行可能ファイルは ClickHouse が子プロセスに SIGTERM シグナルを送信する前に、`command_termination_timeout` 秒以内にシャットダウンする必要があります。単位は秒です。デフォルト値は `10`。省略可能。                                                                                                                            |
| `command_read_timeout`        | コマンドの stdout からデータを読み取る際のタイムアウト（ミリ秒）。デフォルト値は `10000`。省略可能。                                                                                                                                                                                                                                                              |
| `command_write_timeout`       | コマンドの stdin へデータを書き込む際のタイムアウト（ミリ秒）。デフォルト値は `10000`。省略可能。                                                                                                                                                                                                                                                                |
| `implicit_key`                | 実行可能ファイルをソースとする場合、値のみを返すことができ、要求されたキーとの対応関係は結果の行の順序によって暗黙的に決定されます。デフォルト値は `false`。                                                                                                                                                                                                                                      |
| `execute_direct`              | `execute_direct` = `1` の場合、`command` は [user&#95;scripts&#95;path](/operations/server-configuration-parameters/settings#user_scripts_path) で指定された user&#95;scripts ディレクトリ内で検索されます。追加のスクリプト引数は空白区切りで指定できます（例: `script_name arg1 arg2`）。`execute_direct` = `0` の場合、`command` は `bin/sh -c` への引数として渡されます。デフォルト値は `0`。省略可能。 |
| `send_chunk_header`           | 処理対象となるデータの chunk を送信する前に、行数を送信するかどうかを制御します。デフォルト値は `false`。省略可能。                                                                                                                                                                                                                                                       |

この Dictionary のソースは XML 設定によってのみ構成できます。DDL による、実行可能ファイルをソースとする Dictionary の作成は無効化されています。そうでない場合、DB USER が ClickHouse ノード上で任意のバイナリを実行できてしまいます。
