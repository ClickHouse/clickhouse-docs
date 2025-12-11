---
description: 'clickhouse-benchmark のドキュメント'
sidebar_label: 'clickhouse-benchmark'
sidebar_position: 61
slug: /operations/utilities/clickhouse-benchmark
title: 'clickhouse-benchmark'
doc_type: 'reference'
---

# clickhouse-benchmark {#clickhouse-benchmark}

ClickHouse サーバーに接続し、指定したクエリを繰り返し送信します。

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

クエリのセットを送信したい場合は、テキストファイルを作成し、このファイル内の各行に個々のクエリを1つずつ記述します。例:

```sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

次に、このファイルを `clickhouse-benchmark` の標準入力に渡します。

```bash
clickhouse-benchmark [keys] < queries_file;
```

## コマンドラインオプション {#clickhouse-benchmark-command-line-options}

- `--query=QUERY` — 実行するクエリ。このパラメータが渡されない場合、`clickhouse-benchmark` は標準入力からクエリを読み込みます。
- `--query_id=ID` — クエリ ID。
- `--query_id_prefix=ID_PREFIX` — クエリ ID のプレフィックス。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark` が同時に送信するクエリ数。デフォルト値: 1。
- `-C N`, `--max_concurrency=N` — 並列クエリ数を指定した値まで段階的に増やし、各並列度ごとにレポートを 1 つ作成します。
- `--precise` — 重み付きメトリクスを用いた、インターバルごとの精密なレポートを有効にします。
- `-d N`, `--delay=N` — 中間レポート間の間隔（秒）（レポートを無効にするには 0 を指定）。デフォルト値: 1。
- `-h HOST`, `--host=HOST` — サーバーホスト。デフォルト値: `localhost`。[比較モード](#clickhouse-benchmark-comparison-mode) では複数の `-h` オプションを使用できます。
- `-i N`, `--iterations=N` — クエリの総数。デフォルト値: 0（無限に繰り返す）。
- `-r`, `--randomize` — 複数の入力クエリがある場合、クエリ実行順序をランダムにします。
- `-s`, `--secure` — `TLS` 接続を使用します。
- `-t N`, `--timelimit=N` — 時間制限（秒）。指定した時間制限に達すると、`clickhouse-benchmark` はクエリ送信を停止します。デフォルト値: 0（時間制限なし）。
- `--port=N` — サーバーポート。デフォルト値: 9000。[比較モード](#clickhouse-benchmark-comparison-mode) では複数の `--port` オプションを使用できます。
- `--confidence=N` — t 検定の信頼水準。指定可能な値: 0 (80%), 1 (90%), 2 (95%), 3 (98%), 4 (99%), 5 (99.5%)。デフォルト値: 5。[比較モード](#clickhouse-benchmark-comparison-mode) では、`clickhouse-benchmark` は選択された信頼水準で 2 つの分布に差がないかを判定するために [独立 2 標本スチューデントの t 検定](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test) を実行します。
- `--cumulative` — インターバルごとのデータではなく累積データを出力します。
- `--database=DATABASE_NAME` — ClickHouse データベース名。デフォルト値: `default`。
- `--user=USERNAME` — ClickHouse ユーザー名。デフォルト値: `default`。
- `--password=PSWD` — ClickHouse ユーザーパスワード。デフォルト値: 空文字列。
- `--stacktrace` — スタックトレースを出力します。このオプションが指定されている場合、`clickhouse-bencmark` は例外のスタックトレースを出力します。
- `--stage=WORD` — サーバー側でのクエリ処理ステージ。ClickHouse は指定されたステージでクエリ処理を停止し、その時点の結果を `clickhouse-benchmark` に返します。指定可能な値: `complete`, `fetch_columns`, `with_mergeable_state`。デフォルト値: `complete`。
- `--roundrobin` — 複数の `--host`/`--port` を比較する代わりに、クエリごとにランダムに 1 つの `--host`/`--port` を選択して、そのホストにクエリを送信します。
- `--reconnect=N` — 再接続の動作を制御します。指定可能な値: 0（再接続しない）、1（クエリごとに再接続）、N（N クエリごとに再接続）。デフォルト値: 0。
- `--max-consecutive-errors=N` — 許容される連続エラー数。デフォルト値: 0。
- `--ignore-error`,`--continue_on_errors` — クエリが失敗してもテストを継続します。
- `--client-side-time` — サーバー側の時間ではなく、ネットワーク通信を含むクライアント側の時間を表示します。サーバーバージョン 22.8 より前では、常にクライアント側の時間が表示される点に注意してください。
- `--proto-caps` — データ転送時のチャンク化を有効/無効にします。指定可能な値（カンマ区切りで複数指定可）: `chunked_optional`, `notchunked`, `notchunked_optional`, `send_chunked`, `send_chunked_optional`, `send_notchunked`, `send_notchunked_optional`, `recv_chunked`, `recv_chunked_optional`, `recv_notchunked`, `recv_notchunked_optional`。デフォルト値: `notchunked`。
- `--help` — ヘルプメッセージを表示します。
- `--verbose` — ヘルプメッセージの詳細度を上げます。

クエリに対していくつかの[設定](/operations/settings/overview)を適用したい場合は、`--<session setting name>= SETTING_VALUE` というオプションとして渡します。たとえば、`--max_memory_usage=1048576` のようになります。

## 環境変数オプション {#clickhouse-benchmark-environment-variable-options}

ユーザー名、パスワード、およびホストは、環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` を使って設定できます。  
コマンドライン引数 `--user`、`--password`、`--host` が、環境変数よりも優先されます。

## 出力 {#clickhouse-benchmark-output}

デフォルトでは、`clickhouse-benchmark` は各 `--delay` 間隔ごとにレポートを出力します。

レポート例:

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

レポートでは次の情報を確認できます:

* `Queries executed:` フィールドにおけるクエリ数。

* 次の内容をこの順序で含むステータス文字列:

  * ClickHouse サーバーのエンドポイント。
  * 処理されたクエリ数。
  * QPS: `--delay` 引数で指定された期間中に、サーバーが 1 秒あたりに実行したクエリ数。
  * RPS: `--delay` 引数で指定された期間中に、サーバーが 1 秒あたりに読み取った行数。
  * MiB/s: `--delay` 引数で指定された期間中に、サーバーが 1 秒あたりに読み取ったメビバイト数 (MiB)。
  * result RPS: `--delay` 引数で指定された期間中に、サーバーがクエリ結果に 1 秒あたりに出力した行数。
  * result MiB/s: `--delay` 引数で指定された期間中に、サーバーがクエリ結果に 1 秒あたりに出力したメビバイト数 (MiB)。

* クエリ実行時間のパーセンタイル値。

## 比較モード {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark` は、稼働中の 2 つの ClickHouse サーバーのパフォーマンスを比較できます。

比較モードを使用するには、両方のサーバーのエンドポイントを、2 組の `--host` と `--port` キーを使って指定します。キーは引数リスト内での位置によって対応付けられ、最初の `--host` は最初の `--port` に対応し、以降も同様です。`clickhouse-benchmark` は両方のサーバーへの接続を確立した後、クエリを送信します。各クエリはランダムに選択されたどちらかのサーバーに送られます。結果はテーブル形式で表示されます。

## 例 {#clickhouse-benchmark-example}

```bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

```text
1件のクエリを読み込みました。

実行されたクエリ: 5件

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

99.5%信頼水準で有意差なし
```
