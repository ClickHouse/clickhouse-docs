---
'description': 'clickhouse-benchmark に関するドキュメント'
'sidebar_label': 'clickhouse-benchmark'
'sidebar_position': 61
'slug': '/operations/utilities/clickhouse-benchmark'
'title': 'clickhouse-benchmark'
'doc_type': 'reference'
---


# clickhouse-benchmark 

ClickHouseサーバーに接続し、指定されたクエリを繰り返し送信します。

**構文**

```bash
$ clickhouse-benchmark --query ["single query"] [keys]
```

または

```bash
$ echo "single query" | clickhouse-benchmark [keys]
```

または

```bash
$ clickhouse-benchmark [keys] <<< "single query"
```

クエリのセットを送信したい場合は、テキストファイルを作成し、このファイルの各行に個別のクエリを配置します。例えば：

```sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

その後、このファイルを `clickhouse-benchmark` の標準入力に渡します：

```bash
clickhouse-benchmark [keys] < queries_file;
```

## コマンドラインオプション {#clickhouse-benchmark-command-line-options}

- `--query=QUERY` — 実行するクエリ。 このパラメータが渡されない場合、`clickhouse-benchmark` は標準入力からクエリを読み込みます。
- `--query_id=ID` — クエリID。
- `--query_id_prefix=ID_PREFIX` — クエリIDプレフィックス。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark` が同時に送信するクエリの数。 デフォルト値：1。
- `-C N`, `--max_concurrency=N` — 指定された値まで並行クエリの数を段階的に増加させ、各同時実行レベルごとにレポートを作成します。
- `--precise` — 重み付きメトリックを用いた、正確なインターバルごとのレポーティングを有効にします。
- `-d N`, `--delay=N` — 中間レポート間の秒数のインターバル（レポートを無効にするには0を設定）。 デフォルト値：1。
- `-h HOST`, `--host=HOST` — サーバーホスト。 デフォルト値：`localhost`。 [比較モード](#clickhouse-benchmark-comparison-mode)では、複数の `-h` キーを使用できます。
- `-i N`, `--iterations=N` — クエリの総数。 デフォルト値：0（無限に繰り返す）。
- `-r`, `--randomize` — 入力クエリが1つ以上ある場合のクエリ実行のランダム順序。
- `-s`, `--secure` — `TLS`接続を使用。
- `-t N`, `--timelimit=N` — 時間制限（秒）。 指定された時間制限に達すると `clickhouse-benchmark` はクエリの送信を停止します。 デフォルト値：0（時間制限無効）。
- `--port=N` — サーバーポート。 デフォルト値：9000。 [比較モード](#clickhouse-benchmark-comparison-mode)では、複数の `--port` キーを使用できます。
- `--confidence=N` — T検定の信頼レベル。 可能な値：0（80%）、1（90%）、2（95%）、3（98%）、4（99%）、5（99.5%）。 デフォルト値：5。 [比較モード](#clickhouse-benchmark-comparison-mode)で、`clickhouse-benchmark` は選択された信頼レベルで2つの分布が異ならないかを判断するために [独立二標本t検定](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test) を実行します。
- `--cumulative` — インターバルごとのデータではなく、累積データを印刷します。
- `--database=DATABASE_NAME` — ClickHouseデータベース名。 デフォルト値：`default`。
- `--user=USERNAME` — ClickHouseユーザー名。 デフォルト値：`default`。
- `--password=PSWD` — ClickHouseユーザーのパスワード。 デフォルト値：空文字列。
- `--stacktrace` — スタックトレースの出力。キーが設定されている際、`clickhouse-benchmark` は例外のスタックトレースを出力します。
- `--stage=WORD` — サーバーでのクエリ処理ステージ。 ClickHouseは指定されたステージでクエリ処理を停止し、`clickhouse-benchmark`に回答を返します。 可能な値：`complete`、`fetch_columns`、`with_mergeable_state`。 デフォルト値：`complete`。
- `--roundrobin` — 異なる `--host`/`--port` でクエリを比較するのではなく、ランダムに `--host`/`--port` の1つを選び、各クエリに送信します。
- `--reconnect=N` - 再接続の動作を制御します。 可能な値：0（再接続しない）、1（各クエリごとに再接続）、またはN（Nクエリごとに再接続）。 デフォルト値：0。
- `--max-consecutive-errors=N` — 許可される連続エラーの数。 デフォルト値：0。
- `--ignore-error`,`--continue_on_errors` — クエリが失敗してもテストを続行します。
- `--client-side-time` — サーバーサイドの時間ではなく、ネットワーク通信を含む時間を表示します。サーバーバージョン22.8以前では、クライアントサイドの時間を常に表示します。
- `--help` — ヘルプメッセージを表示します。
- `--verbose` — ヘルプメッセージの詳細度を増加させます。

クエリに対して何らかの [設定](/operations/settings/overview) を適用したい場合は、キー `--<セッション設定名>= SETTING_VALUE` として渡します。 例えば、`--max_memory_usage=1048576`。

## 環境変数オプション {#clickhouse-benchmark-environment-variable-options}

ユーザー名、パスワード、ホストは環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` を通じて設定できます。  
コマンドライン引数 `--user`、`--password` または `--host` が環境変数より優先されます。

## 出力 {#clickhouse-benchmark-output}

デフォルトで、`clickhouse-benchmark` は各 `--delay` インターバルに対してレポートを行います。

レポートの例：

```text
Queries executed: 10.

localhost:9000, queries 10, QPS: 6.772, RPS: 67904487.440, MiB/s: 518.070, result RPS: 67721584.984, result MiB/s: 516.675.

0.000%      0.145 sec.
10.000%     0.146 sec.
20.000%     0.146 sec.
30.000%     0.146 sec.
40.000%     0.147 sec.
50.000%     0.148 sec.
60.000%     0.148 sec.
70.000%     0.148 sec.
80.000%     0.149 sec.
90.000%     0.150 sec.
95.000%     0.150 sec.
99.000%     0.150 sec.
99.900%     0.150 sec.
99.990%     0.150 sec.
```

レポートには以下の内容が含まれます：

- `Queries executed:` フィールドにおけるクエリの数。
  
- ステータス文字列（順不同）：

  - ClickHouseサーバーのエンドポイント。
  - 処理されたクエリの数。
  - QPS: 指定された`--delay`引数の期間中にサーバーが実行したクエリの数。
  - RPS: 指定された`--delay`引数の期間中にサーバーが読み込んだ行の数。
  - MiB/s: 指定された`--delay`引数の期間中にサーバーが読み込んだメビバイトの数。
  - 結果RPS: 指定された`--delay`引数の期間中にサーバーがクエリ結果に配置した行の数。
  - 結果MiB/s: 指定された`--delay`引数の期間中にサーバーがクエリ結果に配置したメビバイトの数。

- クエリ実行時間のパーセンタイル。

## 比較モード {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark` は2つの稼働中のClickHouseサーバーのパフォーマンスを比較できます。

比較モードを使用するには、2つのサーバーのエンドポイントを `--host`、 `--port` の2対のキーで指定します。 引数リストの位置でキーが一致し、最初の `--host` が最初の `--port` と一致します。 `clickhouse-benchmark` は両方のサーバーへの接続を確立し、その後クエリを送信します。 各クエリはランダムに選択されたサーバーに宛てられます。 結果はテーブル形式で表示されます。

## 例 {#clickhouse-benchmark-example}

```bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

```text
Loaded 1 queries.

Queries executed: 5.

localhost:9001, queries 2, QPS: 3.764, RPS: 75446929.370, MiB/s: 575.614, result RPS: 37639659.982, result MiB/s: 287.168.
localhost:9000, queries 3, QPS: 3.815, RPS: 76466659.385, MiB/s: 583.394, result RPS: 38148392.297, result MiB/s: 291.049.

0.000%          0.258 sec.      0.250 sec.
10.000%         0.258 sec.      0.250 sec.
20.000%         0.258 sec.      0.250 sec.
30.000%         0.258 sec.      0.267 sec.
40.000%         0.258 sec.      0.267 sec.
50.000%         0.273 sec.      0.267 sec.
60.000%         0.273 sec.      0.267 sec.
70.000%         0.273 sec.      0.267 sec.
80.000%         0.273 sec.      0.269 sec.
90.000%         0.273 sec.      0.269 sec.
95.000%         0.273 sec.      0.269 sec.
99.000%         0.273 sec.      0.269 sec.
99.900%         0.273 sec.      0.269 sec.
99.990%         0.273 sec.      0.269 sec.

No difference proven at 99.5% confidence
```
