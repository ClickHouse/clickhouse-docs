---
title: 'ClickHouse へのデータ挿入'
description: 'ClickHouse へデータを挿入する方法'
keywords: ['INSERT', 'Batch Insert']
sidebar_label: 'ClickHouse へのデータ挿入'
slug: /guides/inserting-data
show_related_blogs: true
doc_type: 'guide'
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';


## ClickHouseへの挿入とOLTPデータベースの比較 {#inserting-into-clickhouse-vs-oltp-databases}

OLAP(オンライン分析処理)データベースとして、ClickHouseは高性能とスケーラビリティに最適化されており、1秒あたり数百万行の挿入が可能です。
これは、高度に並列化されたアーキテクチャと効率的なカラム指向圧縮の組み合わせによって実現されていますが、即時整合性についてはトレードオフがあります。
より具体的には、ClickHouseは追記専用操作に最適化されており、結果整合性の保証のみを提供します。

対照的に、PostgreSQLなどのOLTPデータベースは、完全なACID準拠のトランザクション挿入に特化して最適化されており、強力な整合性と信頼性の保証を実現します。
PostgreSQLは、同時トランザクションを処理するためにMVCC(多版型同時実行制御)を使用しており、これはデータの複数のバージョンを維持することを伴います。
これらのトランザクションは一度に少数の行を処理する可能性があり、信頼性保証により相当なオーバーヘッドが発生し、挿入性能が制限されます。

強力な整合性保証を維持しながら高い挿入性能を実現するために、ユーザーはClickHouseにデータを挿入する際、以下に説明するシンプルなルールに従う必要があります。
これらのルールに従うことで、ユーザーがClickHouseを初めて使用する際によく遭遇する問題を回避し、OLTPデータベースで有効な挿入戦略を再現しようとする際の問題を防ぐことができます。


## 挿入のベストプラクティス {#best-practices-for-inserts}

### 大きなバッチサイズでの挿入 {#insert-in-large-batch-sizes}

デフォルトでは、ClickHouseに送信される各挿入により、ClickHouseは挿入データと保存が必要なその他のメタデータを含むストレージのパートを即座に作成します。
したがって、各挿入に含まれるデータ量が少ない大量の挿入を送信するよりも、各挿入により多くのデータを含む少量の挿入を送信する方が、必要な書き込み回数を削減できます。
一般的に、一度に少なくとも1,000行、理想的には10,000行から100,000行の比較的大きなバッチでデータを挿入することを推奨します。
(詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)を参照してください)。

大きなバッチが不可能な場合は、以下で説明する非同期挿入を使用してください。

### 冪等性のあるリトライのための一貫したバッチの確保 {#ensure-consistent-batches-for-idempotent-retries}

デフォルトでは、ClickHouseへの挿入は同期的かつ冪等性があります(つまり、同じ挿入操作を複数回実行しても、一度実行した場合と同じ効果があります)。
MergeTreeエンジンファミリーのテーブルの場合、ClickHouseはデフォルトで自動的に[挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。

これは、以下の場合において挿入が回復力を維持することを意味します:

- 1. データを受信するノードに問題がある場合、挿入クエリはタイムアウトし(またはより具体的なエラーを返し)、確認応答を受け取りません。
- 2. データがノードによって書き込まれたが、ネットワークの中断により確認応答がクエリの送信者に返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

クライアントの観点からは、(i)と(ii)を区別することは困難です。しかし、どちらの場合でも、確認応答されなかった挿入は即座にリトライできます。
リトライされた挿入クエリが同じ順序で同じデータを含んでいる限り、(確認応答されなかった)元の挿入が成功していた場合、ClickHouseは自動的にリトライされた挿入を無視します。

### MergeTreeテーブルまたは分散テーブルへの挿入 {#insert-to-a-mergetree-table-or-a-distributed-table}

MergeTree(またはReplicatedテーブル)に直接挿入し、データがシャーディングされている場合は複数のノードにリクエストを分散し、`internal_replication=true`を設定することを推奨します。
これにより、ClickHouseが利用可能なレプリカシャードにデータを複製し、データの結果整合性を保証します。

このクライアント側の負荷分散が不便な場合、ユーザーは[分散テーブル](/engines/table-engines/special/distributed)経由で挿入することができ、これによりノード間で書き込みが分散されます。この場合も、`internal_replication=true`を設定することを推奨します。
ただし、このアプローチは、分散テーブルを持つノードでローカルに書き込みを行い、その後シャードに送信する必要があるため、パフォーマンスがやや低下することに注意してください。

### 小さなバッチには非同期挿入を使用 {#use-asynchronous-inserts-for-small-batches}

クライアント側でのバッチ処理が実現不可能なシナリオがあります。例えば、数百または数千の単一目的エージェントがログ、メトリクス、トレースなどを送信する可観測性のユースケースです。
このシナリオでは、問題や異常をできるだけ早く検出するために、データのリアルタイム転送が重要です。
さらに、観測対象システムでイベントのスパイクが発生するリスクがあり、クライアント側で可観測性データをバッファリングしようとすると、大きなメモリスパイクや関連する問題を引き起こす可能性があります。
大きなバッチを挿入できない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してバッチ処理をClickHouseに委任できます。

非同期挿入では、データはまずバッファに挿入され、その後3つのステップでデータベースストレージに書き込まれます。以下の図に示すとおりです:

<Image img={postgres_inserts} size='md' alt='Postgres inserts' />

非同期挿入を有効にすると、ClickHouseは以下を実行します:

(1) 挿入クエリを非同期で受信します。
(2) クエリのデータをまずインメモリバッファに書き込みます。
(3) 次のバッファフラッシュが発生したときにのみ、データをソートしてパートとしてデータベースストレージに書き込みます。

バッファがフラッシュされる前に、同じクライアントまたは他のクライアントからの他の非同期挿入クエリのデータをバッファに収集できます。
バッファフラッシュから作成されるパートには、複数の非同期挿入クエリのデータが含まれる可能性があります。
一般的に、これらのメカニズムは、データのバッチ処理をクライアント側からサーバー側(ClickHouseインスタンス)に移行します。

:::note
データベースストレージにフラッシュされる前は、データはクエリで検索できないこと、およびバッファフラッシュは設定可能であることに注意してください。
:::


非同期インサートの設定に関する詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)を、詳しい解説は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。
:::

### 公式ClickHouseクライアントを使用する {#use-official-clickhouse-clients}

ClickHouseは主要なプログラミング言語向けのクライアントを提供しています。
これらのクライアントはインサートが正しく実行されるように最適化されており、[Goクライアント](/integrations/go#async-insert)のように直接的に、またはクエリ、ユーザー、接続レベルの設定で有効化することで間接的に、非同期インサートをネイティブサポートしています。

利用可能なClickHouseクライアントとドライバーの完全なリストについては、[クライアントとドライバー](/interfaces/cli)をご覧ください。

### Nativeフォーマットを優先する {#prefer-the-native-format}

ClickHouseはインサート時(およびクエリ時)に多数の[入力フォーマット](/interfaces/formats)をサポートしています。
これはOLTPデータベースとの大きな違いであり、外部ソースからのデータ読み込みを大幅に容易にします。特に[テーブル関数](/sql-reference/table-functions)やディスク上のファイルからデータを読み込む機能と組み合わせた場合に効果的です。
これらのフォーマットは、アドホックなデータ読み込みやデータエンジニアリングタスクに最適です。

最適なインサートパフォーマンスを実現したいアプリケーションでは、[Native](/interfaces/formats/Native)フォーマットを使用してインサートを行うことを推奨します。
このフォーマットはほとんどのクライアント(GoやPythonなど)でサポートされており、既にカラム指向形式であるため、サーバー側の処理を最小限に抑えることができます。
これにより、データをカラム指向形式に変換する責任がクライアント側に移されます。これはインサートを効率的にスケールさせる上で重要です。

あるいは、行形式を希望する場合は[RowBinaryフォーマット](/interfaces/formats/RowBinary)(Javaクライアントで使用)を使用できます。これは通常、Nativeフォーマットよりも記述が容易です。
このフォーマットは、圧縮、ネットワークオーバーヘッド、サーバー側の処理の観点から、[JSON](/interfaces/formats/JSON)などの他の行形式よりも効率的です。
[JSONEachRow](/interfaces/formats/JSONEachRow)フォーマットは、書き込みスループットが低く、迅速な統合を求めるユーザーに適しています。ただし、このフォーマットは解析のためにClickHouseでCPUオーバーヘッドが発生することに注意してください。

### HTTPインターフェースを使用する {#use-the-http-interface}

多くの従来型データベースとは異なり、ClickHouseはHTTPインターフェースをサポートしています。
ユーザーは上記のいずれのフォーマットを使用しても、データのインサートとクエリの両方にこのインターフェースを利用できます。
これは、ロードバランサーでトラフィックを容易に切り替えられるため、ClickHouseのネイティブプロトコルよりも好ましい場合が多くあります。
ネイティブプロトコルとのインサートパフォーマンスの差は小さく、ネイティブプロトコルの方がわずかにオーバーヘッドが少なくなります。
既存のクライアントはこれらのプロトコルのいずれか(場合によっては両方、例えばGoクライアント)を使用しています。
ネイティブプロトコルでは、クエリの進行状況を容易に追跡できます。

詳細については[HTTPインターフェース](/interfaces/http)をご覧ください。


## 基本的な例 {#basic-example}

ClickHouseでは、おなじみの`INSERT INTO TABLE`コマンドを使用できます。スタートガイド["Creating Tables in ClickHouse"](./creating-tables)で作成したテーブルにデータを挿入してみましょう。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

正常に動作したことを確認するため、次の`SELECT`クエリを実行します:

```sql
SELECT * FROM helloworld.my_first_table
```

結果は次のようになります:

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```


## Postgresからのデータ読み込み {#loading-data-from-postgres}

Postgresからデータを読み込む場合、以下の方法を使用できます：

- `ClickPipes`：PostgreSQLデータベースレプリケーション専用に設計されたETLツール。以下の両方で利用可能です：
  - ClickHouse Cloud - ClickPipesの[マネージド取り込みサービス](/integrations/clickpipes/postgres)を通じて利用可能。
  - セルフマネージド - [PeerDBオープンソースプロジェクト](https://github.com/PeerDB-io/peerdb)経由で利用可能。
- [PostgreSQLテーブルエンジン](/integrations/postgresql#using-the-postgresql-table-engine)を使用して、前述の例のようにデータを直接読み取る方法。既知のウォーターマーク（タイムスタンプなど）に基づくバッチレプリケーションで十分な場合や、一度限りの移行の場合に適しています。この方法は数千万行規模まで対応可能です。より大規模なデータセットを移行する場合は、データをチャンクに分割して複数のリクエストで処理することを検討してください。各チャンクに対してステージングテーブルを使用し、そのパーティションを最終テーブルに移動する前に準備できます。これにより、失敗したリクエストを再試行できます。この一括読み込み戦略の詳細については、こちらを参照してください。
- PostgreSQLからCSV形式でデータをエクスポートする方法。その後、ローカルファイルから、またはテーブル関数を使用してオブジェクトストレージ経由でClickHouseに挿入できます。

:::note 大規模データセットの挿入にサポートが必要ですか？
大規模データセットの挿入にサポートが必要な場合、またはClickHouse Cloudへのデータインポート時にエラーが発生した場合は、support@clickhouse.comまでご連絡ください。サポートいたします。
:::


## コマンドラインからのデータ挿入 {#inserting-data-from-command-line}

**前提条件**

- ClickHouseを[インストール](/install)済みであること
- `clickhouse-server`が実行中であること
- `wget`、`zcat`、`curl`が使用可能なターミナルにアクセスできること

この例では、clickhouse-clientをバッチモードで使用して、コマンドラインからClickHouseにCSVファイルを挿入する方法を説明します。clickhouse-clientをバッチモードで使用したコマンドライン経由でのデータ挿入の詳細と例については、[「バッチモード」](/interfaces/cli#batch-mode)を参照してください。

この例では、2800万行のHacker Newsデータを含む[Hacker Newsデータセット](/getting-started/example-datasets/hacker-news)を使用します。

<VerticalStepper headerLevel="h3">
    
### CSVのダウンロード {#download-csv}

次のコマンドを実行して、公開S3バケットからデータセットのCSV版をダウンロードします:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

4.6GB、2800万行のこの圧縮ファイルは、ダウンロードに5〜10分かかります。

### テーブルの作成 {#create-table}

`clickhouse-server`が実行中の状態で、`clickhouse-client`をバッチモードで使用してコマンドラインから直接、次のスキーマで空のテーブルを作成できます:

```bash
clickhouse-client <<'_EOF'
CREATE TABLE hackernews(
    `id` UInt32,
    `deleted` UInt8,
    `type` Enum('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `text` String,
    `dead` UInt8,
    `parent` UInt32,
    `poll` UInt32,
    `kids` Array(UInt32),
    `url` String,
    `score` Int32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` Int32
)
ENGINE = MergeTree
ORDER BY id
_EOF
```

エラーがなければ、テーブルは正常に作成されています。上記のコマンドでは、ヒアドキュメント区切り文字（`_EOF`）の周りに単一引用符を使用して、変数展開を防いでいます。単一引用符がない場合、カラム名の周りのバッククォートをエスケープする必要があります。

### コマンドラインからのデータ挿入 {#insert-data-via-cmd}

次に、以下のコマンドを実行して、先ほどダウンロードしたファイルからテーブルにデータを挿入します:

```bash
zcat < hacknernews.csv.gz | ./clickhouse client --query "INSERT INTO hackernews FORMAT CSV"
```

データが圧縮されているため、まず`gzip`、`zcat`などのツールを使用してファイルを解凍し、次に解凍されたデータを適切な`INSERT`文と`FORMAT`を指定して`clickhouse-client`にパイプする必要があります。

:::note
clickhouse-clientを対話モードで使用してデータを挿入する場合、`COMPRESSION`句を使用して挿入時にClickHouseに解凍を処理させることができます。ClickHouseはファイル拡張子から圧縮タイプを自動的に検出できますが、明示的に指定することもできます。

その場合、挿入クエリは次のようになります:

```bash
clickhouse-client --query "INSERT INTO hackernews FROM INFILE 'hacknernews.csv.gz' COMPRESSION 'gzip' FORMAT CSV;"
```

:::

データの挿入が完了したら、次のコマンドを実行して`hackernews`テーブルの行数を確認できます:

```bash
clickhouse-client --query "SELECT formatReadableQuantity(count(*)) FROM hackernews"
28.74 million
```

### curlを使用したコマンドライン経由でのデータ挿入 {#insert-using-curl}

前の手順では、まず`wget`を使用してローカルマシンにcsvファイルをダウンロードしました。単一のコマンドを使用してリモートURLから直接データを挿入することも可能です。

次のコマンドを実行して`hackernews`テーブルからデータを削除し、ローカルマシンへのダウンロードという中間ステップなしで再度挿入できるようにします:

```bash
clickhouse-client --query "TRUNCATE hackernews"
```

次に実行します:

```bash
curl https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz | zcat | clickhouse-client --query "INSERT INTO hackernews FORMAT CSV"
```

データが再度挿入されたことを確認するために、前と同じコマンドを実行できます:

```bash
clickhouse-client --query "SELECT formatReadableQuantity(count(*)) FROM hackernews"
28.74 million
```

</VerticalStepper>
