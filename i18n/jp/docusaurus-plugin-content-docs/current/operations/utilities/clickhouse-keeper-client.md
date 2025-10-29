---
'description': 'ClickHouse Keeper クライアントユーティリティのドキュメント'
'sidebar_label': 'clickhouse-keeper-client'
'slug': '/operations/utilities/clickhouse-keeper-client'
'title': 'clickhouse-keeper-client ユーティリティ'
'doc_type': 'reference'
---


# clickhouse-keeper-client ユーティリティ

clickhouse-keeperとそのネイティブプロトコルを介して対話するためのクライアントアプリケーションです。

## キー {#clickhouse-keeper-client}

-   `-q QUERY`, `--query=QUERY` — 実行するクエリ。 このパラメータが指定されていない場合、`clickhouse-keeper-client`はインタラクティブモードで起動します。
-   `-h HOST`, `--host=HOST` — サーバーホスト。 デフォルト値: `localhost`。
-   `-p N`, `--port=N` — サーバーポート。 デフォルト値: 9181。
-   `-c FILE_PATH`, `--config-file=FILE_PATH` — 接続文字列を取得するための設定ファイルのパスを設定します。 デフォルト値: `config.xml`。
-   `--connection-timeout=TIMEOUT` — 接続タイムアウトを秒単位で設定します。 デフォルト値: 10秒。
-   `--session-timeout=TIMEOUT` — セッションタイムアウトを秒単位で設定します。 デフォルト値: 10秒。
-   `--operation-timeout=TIMEOUT` — 操作タイムアウトを秒単位で設定します。 デフォルト値: 10秒。
-   `--history-file=FILE_PATH` — 履歴ファイルのパスを設定します。 デフォルト値: `~/.keeper-client-history`。
-   `--log-level=LEVEL` — ログレベルを設定します。 デフォルト値: `information`。
-   `--no-confirmation` — 設定されている場合、いくつかのコマンドに確認が不要になります。 デフォルト値はインタラクティブモードで`false`、クエリで`true`です。
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
-   `exists '<path>'` -- ノードが存在する場合は `1` を返し、存在しない場合は `0` を返します
-   `set '<path>' <value> [version]` -- ノードの値を更新します。 バージョンが一致する場合のみ更新されます（デフォルト: -1）
-   `create '<path>' <value> [mode]` -- 設定された値で新しいノードを作成します
-   `touch '<path>'` -- 値として空の文字列を持つ新しいノードを作成します。 ノードが既に存在する場合は例外を投げません
-   `get '<path>'` -- ノードの値を返します
-   `rm '<path>' [version]` -- バージョンが一致する場合のみノードを削除します（デフォルト: -1）
-   `rmr '<path>' [limit]` -- サブツリーのサイズが制限より小さい場合にパスを再帰的に削除します。 確認が必要です（デフォルトの制限 = 100）
-   `flwc <command>` -- 四文字コマンドを実行します
-   `help` -- このメッセージを表示します
-   `get_direct_children_number '[path]'` -- 特定のパスの下の直接の子ノードの数を取得します
-   `get_all_children_number '[path]'` -- 特定のパスの下のすべての子ノードの数を取得します
-   `get_stat '[path]'` -- ノードの統計情報を返します（デフォルト `.`）
-   `find_super_nodes <threshold> '[path]'` -- 指定されたパスの下で子ノードの数がしきい値を超えるノードを見つけます（デフォルト `.`）
-   `delete_stale_backups` -- 現在非アクティブなバックアップに使用されているClickHouseノードを削除します
-   `find_big_family [path] [n]` -- サブツリー内で最大のファミリーを持つ上位 n ノードを返します（デフォルトのパス = `.` および n = 10）
-   `sync '<path>'` -- プロセスとリーダーの間でノードを同期します
-   `reconfig <add|remove|set> "<arg>" [version]` -- Keeper クラスターを再構成します。 詳細は /docs/en/guides/sre/keeper/clickhouse-keeper#reconfiguration を参照してください。
