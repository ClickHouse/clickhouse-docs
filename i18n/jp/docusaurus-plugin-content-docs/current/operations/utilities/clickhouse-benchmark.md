---
description: 'Documentation for clickhouse-benchmark'
sidebar_label: 'clickhouse-benchmark'
sidebar_position: 61
slug: '/operations/utilities/clickhouse-benchmark'
title: 'clickhouse-benchmark'
---





# clickhouse-benchmark 

ClickHouseサーバーに接続し、指定されたクエリを繰り返し送信します。

**構文**

```bash
$ clickhouse-benchmark --query ["単一クエリ"] [keys]
```

または

```bash
$ echo "単一クエリ" | clickhouse-benchmark [keys]
```

または

```bash
$ clickhouse-benchmark [keys] <<< "単一クエリ"
```

複数のクエリを送信したい場合は、テキストファイルを作成し、このファイル内の各クエリを個別の文字列として配置します。例えば：

```sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

その後、このファイルを`clickhouse-benchmark`の標準入力に渡します：

```bash
clickhouse-benchmark [keys] < queries_file;
```

## キー {#clickhouse-benchmark-keys}

- `--query=QUERY` — 実行するクエリ。このパラメータが指定されない場合、`clickhouse-benchmark`は標準入力からクエリを読み取ります。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark`が同時に送信するクエリの数。デフォルト値: 1。
- `-d N`, `--delay=N` — 中間レポートの間隔（レポートを無効にするには0を設定）。デフォルト値: 1。
- `-h HOST`, `--host=HOST` — サーバーホスト。デフォルト値: `localhost`。 [比較モード](#clickhouse-benchmark-comparison-mode) では複数の `-h` キーを使用できます。
- `-i N`, `--iterations=N` — クエリの総数。デフォルト値: 0（無限に繰り返す）。
- `-r`, `--randomize` — 入力クエリが1つ以上ある場合のクエリ実行のランダム順序。
- `-s`, `--secure` — `TLS`接続を使用します。
- `-t N`, `--timelimit=N` — 時間制限（秒）。指定された時間制限に達した場合、`clickhouse-benchmark`はクエリの送信を停止します。デフォルト値: 0（時間制限無効）。
- `--port=N` — サーバーポート。デフォルト値: 9000。 [比較モード](#clickhouse-benchmark-comparison-mode) では複数の `--port` キーを使用できます。
- `--confidence=N` — T検定の信頼レベル。可能な値: 0 (80%), 1 (90%), 2 (95%), 3 (98%), 4 (99%), 5 (99.5%)。デフォルト値: 5。 [比較モード](#clickhouse-benchmark-comparison-mode) では、`clickhouse-benchmark`が[独立二標本のスチューデントのt検定](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test)を実行し、選択した信頼レベルで2つの分布が異ならないかを判断します。
- `--cumulative` — インターバルごとのデータではなく、累積データを印刷します。
- `--database=DATABASE_NAME` — ClickHouseデータベース名。デフォルト値: `default`。
- `--user=USERNAME` — ClickHouseユーザー名。デフォルト値: `default`。
- `--password=PSWD` — ClickHouseユーザーのパスワード。デフォルト値: 空の文字列。
- `--stacktrace` — スタックトレースの出力。このキーが設定されると、`clickhouse-bencmark`は例外のスタックトレースを出力します。
- `--stage=WORD` — サーバーでのクエリ処理ステージ。ClickHouseは指定したステージでのクエリ処理を停止し、`clickhouse-benchmark`に応答を返します。可能な値: `complete`, `fetch_columns`, `with_mergeable_state`。デフォルト値: `complete`。
- `--reconnect=N` - 再接続の動作を制御します。可能な値は 0（再接続しない）、1（各クエリごとに再接続）、または N（Nクエリごとに再接続）です。デフォルト値: 1。
- `--help` — ヘルプメッセージを表示します。

クエリに対して[設定](/operations/settings/overview)を適用したい場合は、キー `--<セッション設定名>= SETTING_VALUE` として渡します。たとえば、`--max_memory_usage=1048576`。

## 出力 {#clickhouse-benchmark-output}

デフォルトでは、`clickhouse-benchmark`は各`--delay`インターバルでレポートします。

レポートの例：

```text
実行されたクエリの数: 10.

localhost:9000, クエリ 10, QPS: 6.772, RPS: 67904487.440, MiB/s: 518.070, 結果 RPS: 67721584.984, 結果 MiB/s: 516.675.

0.000%      0.145 秒.
10.000%     0.146 秒.
20.000%     0.146 秒.
30.000%     0.146 秒.
40.000%     0.147 秒.
50.000%     0.148 秒.
60.000%     0.148 秒.
70.000%     0.148 秒.
80.000%     0.149 秒.
90.000%     0.150 秒.
95.000%     0.150 秒.
99.000%     0.150 秒.
99.900%     0.150 秒.
99.990%     0.150 秒.
```

レポートには、以下の情報が含まれます：

- `実行されたクエリの数:` フィールドのクエリ数。

- ステータス文字列には以下が含まれます（順番に）：

    - ClickHouseサーバーのエンドポイント。
    - 処理されたクエリの数。
    - QPS: `--delay`引数で指定された期間中にサーバーが1秒あたりに実行したクエリの数。
    - RPS: `--delay`引数で指定された期間中にサーバーが1秒あたりに読み取った行の数。
    - MiB/s: `--delay`引数で指定された期間中にサーバーが1秒あたりに読み取ったメビバイト数。
    - 結果 RPS: `--delay`引数で指定された期間中にサーバーがクエリの結果に置いた行の数。
    - 結果 MiB/s: `--delay`引数で指定された期間中にサーバーがクエリの結果に置いたメビバイト数。

- クエリ実行時間のパーセンタイル。

## 比較モード {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark`は、2つの稼働中のClickHouseサーバーのパフォーマンスを比較できます。

比較モードを使用するには、2組の `--host`, `--port` キーを使用して両方のサーバーのエンドポイントを指定します。引数リストの位置に合わせてキーが一致し、最初の `--host` が最初の `--port` に一致します。`clickhouse-benchmark`は両方のサーバーへの接続を確立し、次にクエリを送信します。各クエリはランダムに選択されたサーバーに送信され、結果はテーブルで表示されます。

## 例 {#clickhouse-benchmark-example}

```bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

```text
1つのクエリを読み込みました。

実行されたクエリの数: 5.

localhost:9001, クエリ 2, QPS: 3.764, RPS: 75446929.370, MiB/s: 575.614, 結果 RPS: 37639659.982, 結果 MiB/s: 287.168.
localhost:9000, クエリ 3, QPS: 3.815, RPS: 76466659.385, MiB/s: 583.394, 結果 RPS: 38148392.297, 結果 MiB/s: 291.049.

0.000%          0.258 秒.      0.250 秒.
10.000%         0.258 秒.      0.250 秒.
20.000%         0.258 秒.      0.250 秒.
30.000%         0.258 秒.      0.267 秒.
40.000%         0.258 秒.      0.267 秒.
50.000%         0.273 秒.      0.267 秒.
60.000%         0.273 秒.      0.267 秒.
70.000%         0.273 秒.      0.267 秒.
80.000%         0.273 秒.      0.269 秒.
90.000%         0.273 秒.      0.269 秒.
95.000%         0.273 秒.      0.269 秒.
99.000%         0.273 秒.      0.269 秒.
99.900%         0.273 秒.      0.269 秒.
99.990%         0.273 秒.      0.269 秒。

99.5%の信頼度で差は証明されていません
```
