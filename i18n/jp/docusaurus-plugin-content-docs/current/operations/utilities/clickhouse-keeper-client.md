---
description: 'ClickHouse Keeperクライアントユーティリティのドキュメンテーション'
sidebar_label: 'clickhouse-keeper-client'
slug: '/operations/utilities/clickhouse-keeper-client'
title: 'ClickHouse Keeperクライアントユーティリティ'
---




# clickhouse-keeper-client ユーティリティ

clickhouse-keeper のネイティブプロトコルで対話するためのクライアントアプリケーションです。

## キー {#clickhouse-keeper-client}

-   `-q QUERY`, `--query=QUERY` — 実行するクエリ。 このパラメータが渡されない場合、`clickhouse-keeper-client` はインタラクティブモードで起動します。
-   `-h HOST`, `--host=HOST` — サーバーホスト。 デフォルト値: `localhost`。
-   `-p N`, `--port=N` — サーバーポート。 デフォルト値: 9181
-   `-c FILE_PATH`, `--config-file=FILE_PATH` — 接続文字列を取得するための設定ファイルのパスを指定します。 デフォルト値: `config.xml`。
-   `--connection-timeout=TIMEOUT` — 接続タイムアウトを秒数で指定します。 デフォルト値: 10s。
-   `--session-timeout=TIMEOUT` — セッションタイムアウトを秒数で指定します。 デフォルト値: 10s。
-   `--operation-timeout=TIMEOUT` — 操作タイムアウトを秒数で指定します。 デフォルト値: 10s。
-   `--history-file=FILE_PATH` — 歴史ファイルのパスを指定します。 デフォルト値: `~/.keeper-client-history`。
-   `--log-level=LEVEL` — ログレベルを設定します。 デフォルト値: `information`。
-   `--no-confirmation` — 設定されている場合、いくつかのコマンドで確認を必要としません。 デフォルト値は、インタラクティブモードで `false`、クエリで `true` です。
-   `--help` — ヘルプメッセージを表示します。

## 例 {#clickhouse-keeper-client-example}

```bash
./clickhouse-keeper-client -h localhost -p 9181 --connection-timeout 30 --session-timeout 30 --operation-timeout 30
ZooKeeper に接続: [::1]:9181, session_id 137
/ :) ls
keeper foo bar
/ :) cd 'keeper'
/keeper :) ls
api_version
/keeper :) cd 'api_version'
/keeper/api_version :) ls

/keeper/api_version :) cd 'xyz'
パス /keeper/api_version/xyz は存在しません
/keeper/api_version :) cd ../../
/ :) ls
keeper foo bar
/ :) get 'keeper/api_version'
2
```

## コマンド {#clickhouse-keeper-client-commands}

-   `ls '[path]'` -- 指定したパスのノードをリストします（デフォルト: 現在の作業ディレクトリ）
-   `cd '[path]'` -- 作業パスを変更します（デフォルト `.`）
-   `cp '<src>' '<dest>'`  -- 'src' ノードを 'dest' パスにコピーします
-   `mv '<src>' '<dest>'`  -- 'src' ノードを 'dest' パスに移動します
-   `exists '<path>'` -- ノードが存在する場合は `1` を返し、そうでない場合は `0` を返します
-   `set '<path>' <value> [version]` -- ノードの値を更新します。 バージョンが一致する場合のみ更新します（デフォルト: -1）
-   `create '<path>' <value> [mode]` -- 指定された値で新しいノードを作成します
-   `touch '<path>'` -- 値として空の文字列を持つ新しいノードを作成します。 ノードが既に存在する場合でも例外は発生しません
-   `get '<path>'` -- ノードの値を返します
-   `rm '<path>' [version]` -- バージョンが一致する場合のみノードを削除します（デフォルト: -1）
-   `rmr '<path>' [limit]` -- サブツリーのサイズが制限よりも小さい場合、パスを再帰的に削除します。 確認が必要です（デフォルトの制限 = 100）
-   `flwc <command>` -- 四文字コマンドを実行します
-   `help` -- このメッセージを表示します
-   `get_direct_children_number '[path]'` -- 特定のパスの下にある直接の子ノードの数を取得します
-   `get_all_children_number '[path]'` -- 特定のパスの下にある全ての子ノードの数を取得します
-   `get_stat '[path]'` -- ノードのステータスを返します（デフォルト `.`）
-   `find_super_nodes <threshold> '[path]'` -- 指定されたパス内で子ノードの数が閾値を超えるノードを見つけます（デフォルト `.`）
-   `delete_stale_backups` -- 現在非アクティブなバックアップのために使用されている ClickHouse ノードを削除します
-   `find_big_family [path] [n]` -- サブツリー内で最大のファミリーを持つトップ n ノードを返します（デフォルトのパス = `.` と n = 10）
-   `sync '<path>'` -- プロセス間およびリーダー間でノードを同期します
-   `reconfig <add|remove|set> "<arg>" [version]` -- Keeper クラスターを再構成します。 /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration を参照してください。
