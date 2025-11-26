---
description: 'ClickHouse Keeper クライアント ユーティリティのドキュメント'
sidebar_label: 'clickhouse-keeper-client'
slug: /operations/utilities/clickhouse-keeper-client
title: 'clickhouse-keeper-client ユーティリティ'
doc_type: 'reference'
---



# clickhouse-keeper-client ユーティリティ

ネイティブプロトコルを使用して clickhouse-keeper と通信するためのクライアントアプリケーションです。



## オプション {#clickhouse-keeper-client}

-   `-q QUERY`, `--query=QUERY` — 実行するクエリ。 このパラメータが指定されない場合、`clickhouse-keeper-client` はインタラクティブモードで起動します。
-   `-h HOST`, `--host=HOST` — サーバーのホスト名。 デフォルト値: `localhost`。
-   `-p N`, `--port=N` — サーバーのポート番号。 デフォルト値: 9181。
-   `-c FILE_PATH`, `--config-file=FILE_PATH` — 接続文字列を取得するための設定ファイルのパスを指定します。 デフォルト値: `config.xml`。
-   `--connection-timeout=TIMEOUT` — 接続タイムアウトを秒単位で指定します。 デフォルト値: 10s。
-   `--session-timeout=TIMEOUT` — セッションタイムアウトを秒単位で指定します。 デフォルト値: 10s。
-   `--operation-timeout=TIMEOUT` — オペレーションタイムアウトを秒単位で指定します。 デフォルト値: 10s。
-   `--history-file=FILE_PATH` — 履歴ファイルのパスを指定します。 デフォルト値: `~/.keeper-client-history`。
-   `--log-level=LEVEL` — ログレベルを指定します。 デフォルト値: `information`。
-   `--no-confirmation` — 指定した場合、いくつかのコマンドで確認を求めません。 インタラクティブモードではデフォルト値は `false`、クエリでは `true` です。
-   `--help` — ヘルプメッセージを表示します。



## 例

```bash
./clickhouse-keeper-client -h localhost -p 9181 --connection-timeout 30 --session-timeout 30 --operation-timeout 30
ZooKeeperに接続しました [::1]:9181 session_id 137
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

-   `ls '[path]'` -- 指定されたパスのノードを一覧表示します（デフォルト: カレントディレクトリ）
-   `cd '[path]'` -- 作業パスを変更します（デフォルト: `.`）
-   `cp '<src>' '<dest>'`  -- `src` ノードを `dest` パスにコピーします
-   `cpr '<src>' '<dest>'`  -- `src` ノードのサブツリーを `dest` パスにコピーします
-   `mv '<src>' '<dest>'`  -- `src` ノードを `dest` パスに移動します
-   `mvr '<src>' '<dest>'`  -- `src` ノードのサブツリーを `dest` パスに移動します
-   `exists '<path>'` -- ノードが存在する場合は `1`、それ以外は `0` を返します
-   `set '<path>' <value> [version]` -- ノードの値を更新します。バージョンが一致する場合にのみ更新します（デフォルト: -1）
-   `create '<path>' <value> [mode]` -- 指定した値で新しいノードを作成します
-   `touch '<path>'` -- 値が空文字列の新しいノードを作成します。ノードがすでに存在している場合でも例外はスローされません
-   `get '<path>'` -- ノードの値を返します
-   `rm '<path>' [version]` -- バージョンが一致する場合にのみノードを削除します（デフォルト: -1）
-   `rmr '<path>' [limit]` -- サブツリーのサイズが上限より小さい場合に、パスを再帰的に削除します。確認が必要です（デフォルトの上限 = 100）
-   `flwc <command>` -- four-letter-word コマンドを実行します
-   `help` -- このヘルプメッセージを表示します
-   `get_direct_children_number '[path]'` -- 特定のパス直下の子ノード数を取得します
-   `get_all_children_number '[path]'` -- 特定のパス配下のすべての子ノード数を取得します
-   `get_stat '[path]'` -- ノードの stat を返します（デフォルト: `.`）
-   `find_super_nodes <threshold> '[path]'` -- 指定されたパスに対して、子ノード数がしきい値より大きいノードを検索します（デフォルト: `.`）
-   `delete_stale_backups` -- 現在は非アクティブなバックアップ用の ClickHouse ノードを削除します
-   `find_big_family [path] [n]` -- サブツリー内で子ノードが最も多い上位 n 個のノードを返します（デフォルト: path = `.`、n = 10）
-   `sync '<path>'` -- プロセスとリーダー間でノードを同期します
-   `reconfig <add|remove|set> "<arg>" [version]` -- Keeper クラスターを再構成します。/docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration を参照してください
