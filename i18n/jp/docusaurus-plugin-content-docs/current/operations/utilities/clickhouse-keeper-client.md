---
description: 'ClickHouse Keeper クライアントユーティリティのドキュメント'
sidebar_label: 'clickhouse-keeper-client'
slug: /operations/utilities/clickhouse-keeper-client
title: 'clickhouse-keeper-client ユーティリティ'
---


# clickhouse-keeper-client ユーティリティ

clickhouse-keeperとそのネイティブプロトコルを介して対話するためのクライアントアプリケーションです。

## キー {#clickhouse-keeper-client}

-   `-q QUERY`, `--query=QUERY` — 実行するクエリ。 このパラメータが渡されない場合、 `clickhouse-keeper-client` はインタラクティブモードで起動します。
-   `-h HOST`, `--host=HOST` — サーバーホスト。 デフォルト値: `localhost`。
-   `-p N`, `--port=N` — サーバーポート。 デフォルト値: 9181
-   `-c FILE_PATH`, `--config-file=FILE_PATH` — 接続文字列を取得するための設定ファイルのパスを設定します。 デフォルト値: `config.xml`。
-   `--connection-timeout=TIMEOUT` — 接続タイムアウトを秒で設定します。 デフォルト値: 10s。
-   `--session-timeout=TIMEOUT` — セッションタイムアウトを秒で設定します。 デフォルト値: 10s。
-   `--operation-timeout=TIMEOUT` — 操作タイムアウトを秒で設定します。 デフォルト値: 10s。
-   `--history-file=FILE_PATH` — 履歴ファイルのパスを設定します。 デフォルト値: `~/.keeper-client-history`。
-   `--log-level=LEVEL` — ログレベルを設定します。 デフォルト値: `information`。
-   `--no-confirmation` — 設定すると、いくつかのコマンドで確認が不要になります。 デフォルト値はインタラクティブ時の `false` とクエリ時の `true` です。
-   `--help` — ヘルプメッセージを表示します。

## 例 {#clickhouse-keeper-client-example}

```bash
./clickhouse-keeper-client -h localhost -p 9181 --connection-timeout 30 --session-timeout 30 --operation-timeout 30
Connected to ZooKeeper at [::1]:9181 with session_id 137
/ :) ls
keeper foo bar
/ :) cd 'keeper'
/keeper :) ls
api_version
/keeper :) cd 'api_version'
/keeper/api_version :) ls

/keeper/api_version :) cd 'xyz'
Path /keeper/api_version/xyz does not exist
/keeper/api_version :) cd ../../
/ :) ls
keeper foo bar
/ :) get 'keeper/api_version'
2
```

## コマンド {#clickhouse-keeper-client-commands}

-   `ls '[path]'` -- 指定されたパスのノードをリストします（デフォルト: cwd）
-   `cd '[path]'` -- 作業パスを変更します（デフォルト `.`）
-   `cp '<src>' '<dest>'`  -- 'src' ノードを 'dest' パスにコピーします
-   `mv '<src>' '<dest>'`  -- 'src' ノードを 'dest' パスに移動します
-   `exists '<path>'` -- ノードが存在する場合は `1` を、そうでない場合は `0` を返します
-   `set '<path>' <value> [version]` -- ノードの値を更新します。バージョンが一致する場合のみ更新されます（デフォルト: -1）
-   `create '<path>' <value> [mode]` -- 指定した値で新しいノードを作成します
-   `touch '<path>'` -- 値を空の文字列として新しいノードを作成します。 ノードが既に存在する場合、例外はスローされません
-   `get '<path>'` -- ノードの値を返します
-   `rm '<path>' [version]` -- バージョンが一致する場合のみノードを削除します（デフォルト: -1）
-   `rmr '<path>' [limit]` -- サブツリーのサイズが制限より小さい場合、パスを再帰的に削除します。 確認が必要です（デフォルトの制限 = 100）
-   `flwc <command>` -- 四文字命令を実行します
-   `help` -- このメッセージを印刷します
-   `get_direct_children_number '[path]'` -- 特定のパスの直下の子ノードの数を取得します
-   `get_all_children_number '[path]'` -- 特定のパスのすべての子ノードの数を取得します
-   `get_stat '[path]'` -- ノードのステータスを返します（デフォルト `.`）
-   `find_super_nodes <threshold> '[path]'` -- 指定されたパスの子ノードの数が閾値を超えるノードを見つけます（デフォルト `.`）
-   `delete_stale_backups` -- 現在非アクティブなバックアップに使用される ClickHouse ノードを削除します
-   `find_big_family [path] [n]` -- サブツリー内で最大のファミリーを持つ上位 n ノードを返します（デフォルトのパス = `.` および n = 10）
-   `sync '<path>'` -- プロセス間およびリーダー間でノードを同期します
-   `reconfig <add|remove|set> "<arg>" [version]` -- Keeper クラスターを再構成します。詳しくは /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration を参照してください
