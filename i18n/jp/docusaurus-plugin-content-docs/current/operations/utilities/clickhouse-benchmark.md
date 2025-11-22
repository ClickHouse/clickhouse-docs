---
description: 'clickhouse-benchmark のドキュメント'
sidebar_label: 'clickhouse-benchmark'
sidebar_position: 61
slug: /operations/utilities/clickhouse-benchmark
title: 'clickhouse-benchmark'
doc_type: 'reference'
---



# clickhouse-benchmark

ClickHouseサーバに接続し、指定したクエリを繰り返し送信します。

**構文**

```bash
$ clickhouse-benchmark --query ["単一クエリ"] [キー]
```

または

```bash
$ echo "single query" | clickhouse-benchmark [keys]
```

または

```bash
$ clickhouse-benchmark [keys] <<< "single query"
```

クエリを複数送信したい場合は、テキストファイルを作成し、このファイル内で各クエリを1行ずつ記述します。例:

```sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

次に、このファイルを `clickhouse-benchmark` の標準入力に渡してください：

```bash
clickhouse-benchmark [keys] < queries_file;
```


## コマンドラインオプション {#clickhouse-benchmark-command-line-options}

- `--query=QUERY` — 実行するクエリ。このパラメータが指定されていない場合、`clickhouse-benchmark`は標準入力からクエリを読み取ります。
- `--query_id=ID` — クエリID。
- `--query_id_prefix=ID_PREFIX` — クエリIDプレフィックス。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark`が同時に送信するクエリの数。デフォルト値: 1。
- `-C N`, `--max_concurrency=N` — 並列クエリの数を指定された値まで段階的に増加させ、各並行レベルごとに1つのレポートを作成します。
- `--precise` — 重み付けされたメトリクスを使用した正確なインターバルごとのレポートを有効にします。
- `-d N`, `--delay=N` — 中間レポート間の秒単位のインターバル(レポートを無効にするには0を設定)。デフォルト値: 1。
- `-h HOST`, `--host=HOST` — サーバーホスト。デフォルト値: `localhost`。[比較モード](#clickhouse-benchmark-comparison-mode)では、複数の`-h`キーを使用できます。
- `-i N`, `--iterations=N` — クエリの総数。デフォルト値: 0(無限に繰り返す)。
- `-r`, `--randomize` — 複数の入力クエリがある場合、クエリ実行の順序をランダムにします。
- `-s`, `--secure` — `TLS`接続を使用します。
- `-t N`, `--timelimit=N` — 秒単位の時間制限。指定された時間制限に達すると、`clickhouse-benchmark`はクエリの送信を停止します。デフォルト値: 0(時間制限無効)。
- `--port=N` — サーバーポート。デフォルト値: 9000。[比較モード](#clickhouse-benchmark-comparison-mode)では、複数の`--port`キーを使用できます。
- `--confidence=N` — T検定の信頼水準。指定可能な値: 0 (80%), 1 (90%), 2 (95%), 3 (98%), 4 (99%), 5 (99.5%)。デフォルト値: 5。[比較モード](#clickhouse-benchmark-comparison-mode)では、`clickhouse-benchmark`は[独立二標本スチューデントのt検定](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test)を実行し、選択された信頼水準で2つの分布が異ならないかどうかを判定します。
- `--cumulative` — インターバルごとのデータではなく、累積データを出力します。
- `--database=DATABASE_NAME` — ClickHouseデータベース名。デフォルト値: `default`。
- `--user=USERNAME` — ClickHouseユーザー名。デフォルト値: `default`。
- `--password=PSWD` — ClickHouseユーザーパスワード。デフォルト値: 空文字列。
- `--stacktrace` — スタックトレースの出力。このキーが設定されている場合、`clickhouse-benchmark`は例外のスタックトレースを出力します。
- `--stage=WORD` — サーバーでのクエリ処理ステージ。ClickHouseは指定されたステージでクエリ処理を停止し、`clickhouse-benchmark`に応答を返します。指定可能な値: `complete`, `fetch_columns`, `with_mergeable_state`。デフォルト値: `complete`。
- `--roundrobin` — 異なる`--host`/`--port`のクエリを比較する代わりに、各クエリごとにランダムに1つの`--host`/`--port`を選択し、そこにクエリを送信します。
- `--reconnect=N` — 再接続動作を制御します。指定可能な値: 0(再接続しない), 1(クエリごとに再接続), またはN(N個のクエリごとに再接続)。デフォルト値: 0。
- `--max-consecutive-errors=N` — 許容される連続エラーの数。デフォルト値: 0。
- `--ignore-error`,`--continue_on_errors` — クエリが失敗してもテストを継続します。
- `--client-side-time` — サーバー側の時間ではなく、ネットワーク通信を含む時間を表示します。注: サーババージョン22.8より前では、常にクライアント側の時間を表示します。
- `--proto-caps` — データ転送におけるチャンク化を有効/無効にします。選択肢(カンマ区切り可): `chunked_optional`, `notchunked`, `notchunked_optional`, `send_chunked`, `send_chunked_optional`, `send_notchunked`, `send_notchunked_optional`, `recv_chunked`, `recv_chunked_optional`, `recv_notchunked`, `recv_notchunked_optional`。デフォルト値: `notchunked`。
- `--help` — ヘルプメッセージを表示します。
- `--verbose` — ヘルプメッセージの詳細度を上げます。

クエリに[設定](/operations/settings/overview)を適用する場合は、`--<セッション設定名>=SETTING_VALUE`というキーとして渡します。例: `--max_memory_usage=1048576`。


## 環境変数オプション {#clickhouse-benchmark-environment-variable-options}

ユーザー名、パスワード、ホストは環境変数 `CLICKHOUSE_USER`、`CLICKHOUSE_PASSWORD`、`CLICKHOUSE_HOST` で設定できます。  
コマンドライン引数 `--user`、`--password`、`--host` は環境変数よりも優先されます。


## 出力 {#clickhouse-benchmark-output}

デフォルトでは、`clickhouse-benchmark`は各`--delay`間隔ごとにレポートを出力します。

レポートの例:

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

レポートには以下の情報が含まれます:

- `Queries executed:`フィールドに表示されるクエリ数。

- 以下の情報を含むステータス文字列(順序通り):
  - ClickHouseサーバーのエンドポイント。
  - 処理されたクエリ数。
  - QPS: `--delay`引数で指定された期間中にサーバーが1秒あたりに実行したクエリ数。
  - RPS: `--delay`引数で指定された期間中にサーバーが1秒あたりに読み取った行数。
  - MiB/s: `--delay`引数で指定された期間中にサーバーが1秒あたりに読み取ったメビバイト数。
  - result RPS: `--delay`引数で指定された期間中にサーバーがクエリ結果に1秒あたりに出力した行数。
  - result MiB/s: `--delay`引数で指定された期間中にサーバーがクエリ結果に1秒あたりに出力したメビバイト数。

- クエリ実行時間のパーセンタイル値。


## 比較モード {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark`は、実行中の2つのClickHouseサーバーのパフォーマンスを比較できます。

比較モードを使用するには、`--host`と`--port`のキーのペアを2組指定して、両方のサーバーのエンドポイントを指定します。キーは引数リスト内の位置によって対応付けられ、最初の`--host`は最初の`--port`に対応し、以降も同様です。`clickhouse-benchmark`は両方のサーバーへの接続を確立した後、クエリを送信します。各クエリはランダムに選択されたサーバーに送信されます。結果は表形式で表示されます。


## 例 {#clickhouse-benchmark-example}

```bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

```text
1件のクエリを読み込みました。

実行されたクエリ: 5件。

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
