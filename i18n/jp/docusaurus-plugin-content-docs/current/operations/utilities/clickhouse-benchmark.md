---
slug: /operations/utilities/clickhouse-benchmark
sidebar_position: 61
sidebar_label: clickhouse-benchmark
---


# clickhouse-benchmark 

ClickHouseサーバーに接続し、指定されたクエリを繰り返し送信します。

**構文**

``` bash
$ clickhouse-benchmark --query ["single query"] [keys]
```

または

``` bash
$ echo "single query" | clickhouse-benchmark [keys]
```

または

``` bash
$ clickhouse-benchmark [keys] <<< "single query"
```

クエリのセットを送信したい場合は、テキストファイルを作成し、このファイルの各行に個別のクエリを配置します。例えば：

``` sql
SELECT * FROM system.numbers LIMIT 10000000;
SELECT 1;
```

その後、このファイルを `clickhouse-benchmark` の標準入力に渡します：

``` bash
clickhouse-benchmark [keys] < queries_file;
```

## キー {#clickhouse-benchmark-keys}

- `--query=QUERY` — 実行するクエリ。 このパラメータが指定されていない場合、 `clickhouse-benchmark` は標準入力からクエリを読み込みます。
- `-c N`, `--concurrency=N` — `clickhouse-benchmark` が同時に送信するクエリの数。 デフォルト値：1。
- `-d N`, `--delay=N` — 中間レポート間の秒数間隔（レポートを無効にするには0を設定）。 デフォルト値：1。
- `-h HOST`, `--host=HOST` — サーバーホスト。 デフォルト値： `localhost`。 [比較モード](#clickhouse-benchmark-comparison-mode) では複数の `-h` キーを使用できます。
- `-i N`, `--iterations=N` — クエリの総数。 デフォルト値：0（無限に繰り返す）。
- `-r`, `--randomize` — 入力クエリが複数ある場合のクエリ実行のランダムオーダー。
- `-s`, `--secure` — `TLS` 接続を使用。
- `-t N`, `--timelimit=N` — 秒単位の時間制限。 `clickhouse-benchmark` は指定された時間制限に達するとクエリの送信を停止します。 デフォルト値：0（時間制限無効）。
- `--port=N` — サーバーポート。 デフォルト値：9000。 [比較モード](#clickhouse-benchmark-comparison-mode) では複数の `--port` キーを使用できます。
- `--confidence=N` — T検定の信頼度レベル。 可能な値：0（80％）、1（90％）、2（95％）、3（98％）、4（99％）、5（99.5％）。 デフォルト値：5。 [比較モード](#clickhouse-benchmark-comparison-mode) では `clickhouse-benchmark` が選択された信頼度レベルで二つの分布が異ならないかどうかを判断する [独立二標本t検定](https://en.wikipedia.org/wiki/Student%27s_t-test#Independent_two-sample_t-test) を実施します。
- `--cumulative` — 各インターバルごとのデータではなく累積データを印刷します。
- `--database=DATABASE_NAME` — ClickHouseデータベース名。 デフォルト値： `default`。
- `--user=USERNAME` — ClickHouseユーザー名。 デフォルト値： `default`。
- `--password=PSWD` — ClickHouseユーザーパスワード。 デフォルト値：空文字列。
- `--stacktrace` — スタックトレースを出力します。このキーを設定すると、 `clickhouse-benchmark` は例外のスタックトレースを出力します。
- `--stage=WORD` — サーバーでのクエリプロセッシングのステージ。 ClickHouseは指定されたステージでクエリ処理を停止し、 `clickhouse-benchmark` に応答を返します。 可能な値： `complete`, `fetch_columns`, `with_mergeable_state`。 デフォルト値： `complete`。
- `--help` — ヘルプメッセージを表示します。

クエリに対して [設定](/operations/settings/overview) を適用したい場合は、キー `--<session setting name>= SETTING_VALUE` として渡します。 例えば、 `--max_memory_usage=1048576`。

## 出力 {#clickhouse-benchmark-output}

デフォルトでは、 `clickhouse-benchmark` は各 `--delay` インターバルごとにレポートを行います。

レポートの例：

``` text
実行されたクエリ数: 10.

localhost:9000, クエリ 10, QPS: 6.772, RPS: 67904487.440, MiB/s: 518.070, 結果 RPS: 67721584.984, 結果 MiB/s: 516.675.

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

レポートには以下の情報があります：

- `実行されたクエリ数:` フィールドにあります。

- ステータス文字列には以下が含まれます（順番に）：

    - ClickHouseサーバーのエンドポイント。
    - 処理されたクエリの数。
    - QPS: `--delay` 引数で指定された期間中にサーバーが毎秒実行したクエリの数。
    - RPS: `--delay` 引数で指定された期間中にサーバーが毎秒読み取った行の数。
    - MiB/s: `--delay` 引数で指定された期間中にサーバーが毎秒読み取ったメビバイト数。
    - 結果 RPS: `--delay` 引数で指定された期間中にサーバーがクエリの結果に毎秒配置した行の数。
    - 結果 MiB/s: `--delay` 引数で指定された期間中にサーバーがクエリの結果に毎秒配置したメビバイト数。

- クエリ実行時間のパーセンタイル。

## 比較モード {#clickhouse-benchmark-comparison-mode}

`clickhouse-benchmark` は二つの稼働中のClickHouseサーバーの性能を比較できます。

比較モードを使用するには、二つのサーバーのそれぞれのエンドポイントを `--host` と `--port` の二つのペアで指定します。 キーは引数リスト内の位置によって一致し、最初の `--host` は最初の `--port` に一致します。 `clickhouse-benchmark` は両方のサーバーに接続を確立し、その後クエリを送信します。 各クエリはランダムに選択されたサーバーに宛てられます。 結果はテーブルで表示されます。

## 例 {#clickhouse-benchmark-example}

``` bash
$ echo "SELECT * FROM system.numbers LIMIT 10000000 OFFSET 10000000" | clickhouse-benchmark --host=localhost --port=9001 --host=localhost --port=9000 -i 10
```

``` text
1つのクエリを読み込みました。

実行されたクエリ数: 5.

localhost:9001, クエリ 2, QPS: 3.764, RPS: 75446929.370, MiB/s: 575.614, 結果 RPS: 37639659.982, 結果 MiB/s: 287.168.
localhost:9000, クエリ 3, QPS: 3.815, RPS: 76466659.385, MiB/s: 583.394, 結果 RPS: 38148392.297, 結果 MiB/s: 291.049.

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

99.5%の信頼度で差は確認できません
```
