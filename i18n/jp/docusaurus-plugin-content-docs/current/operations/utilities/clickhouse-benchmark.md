---
description: 'clickhouse-benchmark に関するドキュメント'
sidebar_label: 'clickhouse-benchmark'
sidebar_position: 61
slug: /operations/utilities/clickhouse-benchmark
title: 'clickhouse-benchmark'
---


# clickhouse-benchmark 

ClickHouse サーバーに接続し、指定されたクエリを繰り返し送信します。

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

複数のクエリを送信したい場合は、テキストファイルを作成し、そのファイルに各クエリを個別の文字列として配置します。例えば：

```sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

次に、このファイルを `clickhouse-benchmark` の標準入力に渡します：

```bash
clickhouse-benchmark [keys] < queries_file;
```

## キー {#clickhouse-benchmark-keys}

- `--query=QUERY` — 実行するクエリ。 このパラメータが指定されていない場合、`clickhouse-benchmark` は標準入力からクエリを読み取ります。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark` が同時に送信するクエリの数。 デフォルト値: 1。
- `-d N`, `--delay=N` — 中間レポートの間隔（レポートを無効にするには 0 を設定）。 デフォルト値: 1。
- `-h HOST`, `--host=HOST` — サーバーホスト。 デフォルト値: `localhost`。 [比較モード](#clickhouse-benchmark-comparison-mode)では複数の `-h` キーを使用できます。
- `-i N`, `--iterations=N` — クエリの総数。 デフォルト値: 0（無限に繰り返し）。
- `-r`, `--randomize` — 複数の入力クエリがある場合にクエリの実行順序をランダム化します。
- `-s`, `--secure` — `TLS` 接続を使用します。
- `-t N`, `--timelimit=N` — 時間制限（秒単位）。 指定された時間制限に達すると `clickhouse-benchmark` はクエリの送信を停止します。 デフォルト値: 0（時間制限無効）。
- `--port=N` — サーバーポート。 デフォルト値: 9000。 [比較モード](#clickhouse-benchmark-comparison-mode)では複数の `--port` キーを使用できます。
- `--confidence=N` — T検定の信頼レベル。 可能な値: 0 (80%), 1 (90%), 2 (95%), 3 (98%), 4 (99%), 5 (99.5%)。 デフォルト値: 5。 [比較モード](#clickhouse-benchmark-comparison-mode)では、`clickhouse-benchmark` は選択した信頼レベルで二つの分布が異ならないかを調べるために [独立二標本のスチューデントのt検定](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test) を実行します。
- `--cumulative` — インターバルごとのデータの代わりに累積データを出力します。
- `--database=DATABASE_NAME` — ClickHouse データベース名。 デフォルト値: `default`。
- `--user=USERNAME` — ClickHouse ユーザー名。 デフォルト値: `default`。
- `--password=PSWD` — ClickHouse ユーザーパスワード。 デフォルト値: 空文字列。
- `--stacktrace` — スタックトレースの出力。 キーが設定されると、`clickhouse-benchmark` は例外のスタックトレースを出力します。
- `--stage=WORD` — サーバーでのクエリ処理段階。 ClickHouse は指定された段階でクエリ処理を停止し、`clickhouse-benchmark` に回答を返します。 可能な値: `complete`, `fetch_columns`, `with_mergeable_state`。 デフォルト値: `complete`。
- `--reconnect=N` — 再接続の動作を制御します。 可能な値 0（再接続しない）、1（各クエリごとに再接続）、または N（N クエリごとに再接続）。 デフォルト値: 1。
- `--help` — ヘルプメッセージを表示します。

クエリに対して [設定](/operations/settings/overview) を適用したい場合は、キー `--<session setting name>= SETTING_VALUE` として渡します。 例えば、`--max_memory_usage=1048576`。

## 出力 {#clickhouse-benchmark-output}

デフォルトでは、`clickhouse-benchmark` は各 `--delay` インターバルごとにレポートを出力します。

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
99.000%     0.150 sec。
99.900%     0.150 sec。
99.990%     0.150 sec.
```

レポートには以下の情報が含まれます：

- `Queries executed:` フィールドにおけるクエリの数。

- ステータス文字列（順序通りに含まれる）：

    - ClickHouse サーバーのエンドポイント。
    - 処理されたクエリの数。
    - QPS: `--delay` 引数で指定された期間中にサーバーがどれだけクエリを実行したか（クエリ毎秒）。
    - RPS: `--delay` 引数で指定された期間中にサーバーがどれだけ行を読み取ったか（行毎秒）。
    - MiB/s: `--delay` 引数で指定された期間中にサーバーがどれだけメビバイトを読み取ったか（メビバイト毎秒）。
    - result RPS: `--delay` 引数で指定された期間中にサーバーがクエリの結果として出力した行数（行毎秒）。
    - result MiB/s: `--delay` 引数で指定された期間中にサーバーがクエリの結果として出力したメビバイト数（メビバイト毎秒）。

- クエリ実行時間のパーセンタイル。

## 比較モード {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark` は、二つの稼働中の ClickHouse サーバー間のパフォーマンスを比較できます。

比較モードを使用するには、二つのサーバーのエンドポイントを `--host` と `--port` の二つのペアで指定します。 キーは引数リスト内の位置で一致し、最初の `--host` は最初の `--port` と一致します。 `clickhouse-benchmark` は二つのサーバーに接続した後、クエリを送信します。 各クエリはランダムに選択されたサーバーに送られ、結果はテーブル形式で表示されます。

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
