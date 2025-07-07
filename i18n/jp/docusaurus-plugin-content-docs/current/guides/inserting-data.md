---
'title': 'ClickHouseデータの挿入'
'description': 'ClickHouseにデータを挿入する方法'
'keywords':
- 'insert'
- 'insert data'
- 'insert into table'
'sidebar_label': 'ClickHouseデータの挿入'
'slug': '/guides/inserting-data'
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';

## 基本的な例 {#basic-example}

ClickHouseでは、馴染みのある `INSERT INTO TABLE` コマンドを使用できます。最初のガイドで作成したテーブルにデータを挿入してみましょう ["ClickHouseでのテーブル作成"](./creating-tables)。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

これが成功したか確認するために、次の `SELECT` クエリを実行します。

```sql
SELECT * FROM helloworld.my_first_table
```

これにより、次の結果が返されます。

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```

## ClickHouseにデータを挿入することとOLTPデータベース {#inserting-into-clickhouse-vs-oltp-databases}

ClickHouseはOLAP（オンライン分析処理）データベースとして、高いパフォーマンスとスケーラビリティに最適化されており、秒間に数百万行を挿入できる可能性があります。
これは、高度に並列化されたアーキテクチャと効率的な列指向圧縮の組み合わせによって実現されていますが、即時の整合性には妥協があります。
具体的には、ClickHouseは追加のみの操作に最適化されており、最終的な整合性のみの保証を提供します。

対照的に、PostgresなどのOLTPデータベースは、完全なACID準拠でトランザクション挿入に特化して最適化されており、強い整合性と信頼性の保証を確保しています。
PostgreSQLはMVCC（マルチバージョン同時実行制御）を使用して同時トランザクションを処理し、データの複数のバージョンを維持します。
これらのトランザクションは、通常少数の行を対象とし、信頼性の保証により挿入パフォーマンスにかなりのオーバーヘッドが発生します。

高い挿入パフォーマンスを維持しつつ強い整合性の保証を確保するために、ユーザーはClickHouseにデータを挿入する際に以下の単純なルールを守るべきです。
これらのルールに従うことで、ユーザーがClickHouseを初めて使用する際に一般的に直面する問題を避けることができ、OLTPデータベースに対して機能する挿入戦略を模倣することができます。

## 挿入のベストプラクティス {#best-practices-for-inserts}

### 大規模なバッチサイズで挿入する {#insert-in-large-batch-sizes}

デフォルトでは、ClickHouseに送信された各挿入により、ClickHouseはすぐに挿入からのデータを含むストレージの一部を作成し、保存する必要のある他のメタデータも含まれます。
したがって、より多くのデータを含む少量の挿入を送信することに比べ、より少ないデータを含む大量の挿入を送信することは、必要な書き込みの数を減少させます。
一般的には、一度に少なくとも1,000行のかなり大きなバッチでデータを挿入することをお勧めします。理想的には10,000行から100,000行の間です。
（さらなる詳細は [ここ](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

大規模なバッチが不可能な場合は、以下の非同期挿入を使用してください。

### 再試行を無駄なくするために一貫したバッチを確保する {#ensure-consistent-batches-for-idempotent-retries}

デフォルトでは、ClickHouseへの挿入は同期的であり、冪等性があります（同じ挿入操作を複数回実行しても、一度だけ実行した場合と同じ効果があります）。
MergeTreeエンジンファミリーのテーブルの場合、ClickHouseはデフォルトで挿入の[重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を自動的に行います。

これは、次のような場合に挿入が頑強であることを意味します：

- 1. データを受信するノードに問題がある場合、挿入クエリはタイムアウトまたはより具体的なエラーを返し、確認応答が得られません。
- 2. データがノードに書き込まれたが、ネットワークの中断により確認応答を送信者に返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

クライアントの視点では、(i) と (ii) は区別が難しいかもしれません。しかし、どちらの場合でも、確認応答を受け取っていない挿入はすぐに再試行できます。
再試行した挿入クエリが、元の（確認応答を受け取っていない）挿入と同じデータを同じ順序で含んでいる限り、ClickHouseは自動的に再試行した挿入を無視します。

### MergeTreeテーブルまたは分散テーブルに挿入する {#insert-to-a-mergetree-table-or-a-distributed-table}

MergeTree（またはレプリカテーブル）に直接挿入し、データがシャードされている場合はノードのセット間でリクエストのバランスを取り、`internal_replication=true`を設定することをお勧めします。
これにより、ClickHouseはデータを利用可能なレプリカシャードにレプリケートし、データが最終的に整合性を持つことが保証されます。

クライアント側の負荷分散が不便な場合、ユーザーは[分散テーブル](/engines/table-engines/special/distributed)を介して挿入することができ、これによりノード間で書き込みが分散されます。再度、`internal_replication=true`を設定することをお勧めします。
ただし、このアプローチは、分散テーブルを持っているノードにローカルに書き込みを行い、その後シャードに送信する必要があるため、パフォーマンスがやや低下することに注意が必要です。

### 小さなバッチの非同期挿入を使用する {#use-asynchronous-inserts-for-small-batches}

クライアント側のバッチ処理が非現実的なシナリオがあります。例として、ログ、メトリックス、トレースなどを送信する100台または1000台の単一目的エージェントを持つ可観測性のユースケースがあります。
このシナリオでは、データのリアルタイム輸送が重要であり、迅速に問題や異常を検出するために重要です。
さらに、観測システムでのイベントスパイクのリスクがあり、これが原因でクライアント側で可観測データをバッファリングしようとした場合に大きなメモリスパイクや関連する問題を引き起こす可能性があります。
大規模なバッチを挿入できない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してClickHouseにバッチ処理を委任できます。

非同期挿入では、データは最初にバッファに挿入され、その後、以下の3つのステップでデータベースストレージに書き込まれます。

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

非同期挿入が有効になっている場合、ClickHouseは：

(1) 非同期的に挿入クエリを受け取ります。
(2) クエリのデータを最初にメモリ内のバッファに書き込みます。
(3) 次のバッファフラッシュが行われるときに、データをデータベースストレージの一部としてソートして書き込みます。

バッファがフラッシュされる前に、同じクライアントまたは他のクライアントからの他の非同期挿入クエリのデータがバッファに収集される可能性があります。
バッファフラッシュから作成された部分には、複数の非同期挿入クエリのデータが含まれる可能性があります。
一般的に、これらのメカニズムはデータのバッチ処理をクライアント側からサーバー側（ClickHouseインスタンス）に移行します。

:::note
データは、データベースストレージにフラッシュされる前はクエリによって検索できないことに注意してください。また、バッファフラッシュは構成可能です。

非同期挿入を構成するための詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)で、深く掘り下げた情報は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。
:::

### 公式のClickHouseクライアントを使用する {#use-official-clickhouse-clients}

ClickHouseには、最も人気のあるプログラミング言語でのクライアントが用意されています。
これらは、挿入が正しく行われることを保証し、例えば[Goクライアント](/integrations/go#async-insert)のように直接、またはクエリ、ユーザー、接続レベルの設定で有効にした場合には非同期挿入をネイティブにサポートするように最適化されています。

使用可能なClickHouseクライアントおよびドライバの完全なリストは、[クライアントとドライバ](/interfaces/cli)を参照してください。

### ネイティブ形式を優先する {#prefer-the-native-format}

ClickHouseは、多くの[入力形式](/interfaces/formats)を挿入（およびクエリ）時にサポートしています。
これはOLTPデータベースとの大きな違いであり、外部ソースからのデータの読み込みを大幅に容易にします。特に、[テーブル関数](/sql-reference/table-functions)やディスク上のファイルからのデータ読み込み機能と組み合わせると便利です。
これらの形式は、アドホックデータロードやデータエンジニアリングタスクに理想的です。

最適な挿入パフォーマンスを実現したいアプリケーションでは、[ネイティブ](/interfaces/formats/Native)形式を使用して挿入することをお勧めします。
これはほとんどのクライアント（GoやPythonなど）でサポートされており、列指向のフォーマットであるため、サーバーが最小限の作業を行えば済みます。
これにより、データを列指向フォーマットに変換する責任がクライアント側に置かれます。これは、効率的に挿入をスケールさせるために重要です。

また、行形式が好ましい場合は、[RowBinary形式](/interfaces/formats/RowBinary)（Javaクライアントで使用）を使用することもできます。これは、ネイティブ形式よりも書き込みやすいことが一般的です。
これは[JSON](/interfaces/formats/JSON)のような他の行形式に比べて、圧縮、ネットワークオーバーヘッド、サーバー上の処理の面でより効率的です。
[JSONEachRow](/interfaces/formats/JSONEachRow)形式は、速やかに統合したいが書き込みスループットが低いユーザー向けに考慮されることがあります。この形式は、ClickHouse内での解析にCPUオーバーヘッドが発生することに注意してください。

### HTTPインターフェースを使用する {#use-the-http-interface}

多くの従来のデータベースとは異なり、ClickHouseはHTTPインターフェースをサポートしています。
ユーザーは、上記のいずれかの形式を使ってデータを挿入およびクエリするためにこれを使用できます。
これは、トラフィックをロードバランサーで簡単に切り替えることができるため、ClickHouseのネイティブプロトコルよりも好まれることがよくあります。
ネイティブプロトコルでは小さな違いが挿入パフォーマンスにあると予想され、オーバーヘッドが少し低くなります。
既存のクライアントは、これらのプロトコルのいずれか（場合によっては両方、例えばGoクライアント）を使用しています。
ネイティブプロトコルでは、クエリの進捗を簡単に追跡できます。

詳細については[HTTPインターフェース](/interfaces/http)を参照してください。

## Postgresからデータをロードする {#loading-data-from-postgres}

Postgresからデータをロードするために、ユーザーは次のものを使用できます：

- `PeerDB by ClickHouse`、PostgreSQLデータベースのレプリケーションのために特別に設計されたETLツール。これは次の両方で利用可能です：
  - ClickHouse Cloud - 当社の[新しいコネクタ](/integrations/clickpipes/postgres)（プライベートプレビュー）を通じたClickPipes、マネージドインジェストサービスの中で利用可能。興味のあるユーザーは[こちらからサインアップ](https://clickpipes.peerdb.io/)できます。
  - セルフマネージド - [オープンソースプロジェクト](https://github.com/PeerDB-io/peerdb)を通じて利用可能。
- 以前の例で示されたように、データを直接読み込むための[PostgreSQLテーブルエンジン](/integrations/postgresql#using-the-postgresql-table-engine)。既知のウォーターマーク（例：タイムスタンプ）に基づいたバッチレプリケーションが十分な場合や、単発の移行が適している場合があります。このアプローチは1,000万行のスケールに対応できます。より大きなデータセットの移行を考えているユーザーは、各データのチャンクを扱う複数のリクエストを考慮する必要があります。各チャンクのパーティションを移動する前にステージングテーブルを使用できます。これにより、失敗したリクエストを再試行できます。このバルクローディング戦略に関する詳細は、こちらをご覧ください。
- データはCSV形式でPostgreSQLからエクスポートできます。これをClickHouseに挿入することができ、ローカルファイルまたはオブジェクトストレージを介して、テーブル関数を使用して行います。

:::note 大きなデータセットの挿入に関するヘルプが必要ですか？
大きなデータセットの挿入や、ClickHouse Cloudへのデータインポート中にエラーが発生した場合は、support@clickhouse.comまでご連絡いただければ、サポートいたします。
:::
