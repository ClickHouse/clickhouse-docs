---
'title': 'ClickHouse データの挿入'
'description': 'ClickHouse にデータを挿入する方法'
'keywords':
- 'INSERT'
- 'Batch Insert'
'sidebar_label': 'ClickHouse データの挿入'
'slug': '/guides/inserting-data'
'show_related_blogs': true
'doc_type': 'guide'
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';

## 基本的な例 {#basic-example}

ClickHouseでは、慣れ親しんだ `INSERT INTO TABLE` コマンドを使用できます。最初のガイド「[ClickHouseでのテーブルの作成](./creating-tables)」で作成したテーブルにデータを挿入しましょう。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

これが機能したかを確認するために、次の `SELECT` クエリを実行します。

```sql
SELECT * FROM helloworld.my_first_table
```

これにより次の結果が返されます：

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```

## ClickHouseとOLTPデータベースへの挿入の違い {#inserting-into-clickhouse-vs-oltp-databases}

OLAP（オンライン分析処理）データベースとして、ClickHouseは高性能とスケーラビリティのために最適化されており、毎秒に数百万行の挿入が可能です。
これは、高度に並列化されたアーキテクチャと効率的な列指向圧縮の組み合わせによって実現されていますが、即時の整合性が犠牲になっています。
具体的には、ClickHouseは追加のみの操作に最適化されており、最終的な整合性保証のみを提供します。

対照的に、PostgresのようなOLTPデータベースは、完全なACIDコンプライアンスを持つトランザクション挿入に特化して最適化されており、強い整合性と信頼性の保証を確保しています。
PostgreSQLはMVCC（マルチバージョン同時実行制御）を使用して同時トランザクションを処理しており、データの複数のバージョンを維持します。
これらのトランザクションは、通常、少数の行を同時に処理し、挿入パフォーマンスを制限する信頼性の保証による相当のオーバーヘッドを伴います。

高い挿入パフォーマンスを達成しながら強い整合性保証を維持するために、ユーザーはClickHouseにデータを挿入する際に以下で説明するシンプルなルールに従う必要があります。
これらのルールに従うことで、ClickHouseを初めて使用する際によく発生する問題を回避し、OLTPデータベースで機能する挿入戦略を模倣しようとすることができます。

## 挿入のためのベストプラクティス {#best-practices-for-inserts}

### 大きなバッチサイズで挿入する {#insert-in-large-batch-sizes}

デフォルトでは、ClickHouseに送信される各挿入は、挿入からのデータと、保存する必要があるその他のメタデータを含むストレージのパートを即座に作成させます。
そのため、より多くのデータを含む少数の挿入を送信する方が、より少ないデータを含む多数の挿入を送信するよりも、必要な書き込み回数を減らします。
一般的に、データを非常に大きなバッチで、一度に少なくとも1,000行、理想的には10,000行から100,000行の範囲で挿入することを推奨します。
（さらなる詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)）。

大きなバッチが不可能な場合は、以下に示す非同期挿入を使用してください。

### 冪等性を持つ再試行のために一貫したバッチを保証する {#ensure-consistent-batches-for-idempotent-retries}

デフォルトでは、ClickHouseへの挿入は同期的で冪等であり（すなわち、同じ挿入操作を複数回実行することは、一度実行することと同じ効果を持ちます）、MergeTreeエンジンファミリーのテーブルの場合、ClickHouseはデフォルトで挿入を自動的に[重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)します。

これは、以下のケースで挿入が耐障害性を保つことを意味します：

- 1. データを受け取るノードに問題がある場合、挿入クエリはタイムアウト（またはより具体的なエラー）し、確認が返されない。
- 2. データがノードによって書き込まれたが、ネットワークの中断により、確認がクエリの送信者に返されない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

クライアントの視点から見ると、(i) と (ii) は区別が難しい場合があります。しかし、どちらのケースでも、未確認の挿入を直ちに再試行できます。
再試行された挿入クエリが同じ順序で同じデータを含む限り、ClickHouseは（未確認の）元の挿入が成功した場合、再試行された挿入を自動的に無視します。

### MergeTreeテーブルまたは分散テーブルに挿入する {#insert-to-a-mergetree-table-or-a-distributed-table}

MergeTree（またはレプリケートされたテーブル）に直接挿入し、データがシャードされている場合にはノードのセットにリクエストをバランスさせ、`internal_replication=true`を設定することを推奨します。
これにより、ClickHouseがデータを利用可能なレプリカシャードにレプリケートし、データが最終的に一貫していることを保証します。

クライアント側での負荷分散が不便な場合は、[分散テーブル](/engines/table-engines/special/distributed)を介して挿入し、これによりノード全体に書き込みが分散されます。再度、`internal_replication=true`を設定することが推奨されます。
ただし、このアプローチはパフォーマンスが若干低下することに注意する必要があります。書き込みは分散テーブルを持つノード上でローカルに行われ、その後シャードに送信される必要があります。

### 小さなバッチのために非同期挿入を使用する {#use-asynchronous-inserts-for-small-batches}

クライアント側のバッチ処理が実現できないシナリオ（例えば、ログ、メトリック、トレースなどを送信する100sまたは1000sの単目的エージェントを含む観測性のユースケース）があります。
このシナリオでは、データのリアルタイム輸送が重要で、問題や異常を可能な限り迅速に検出する必要があります。
さらに、観測されるシステムでイベントスパイクのリスクがあるため、観測データのクライアント側バッファリングを試みる際に、大規模なメモリスパイクやそれに関連する問題が発生する可能性があります。
大きなバッチが挿入できない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してClickHouseにバッチ処理を委任できます。

非同期挿入を使用すると、データは最初にバッファに挿入され、その後、次のバッファフラッシュが行われるまでに3つのステップでデータベースストレージに書き込まれます。以下の図に示されています：

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

非同期挿入が有効な場合、ClickHouseは以下を行います：

(1) 非同期に挿入クエリを受け取ります。  
(2) クエリのデータを最初にメモリ内バッファに書き込みます。  
(3) バッファがフラッシュされる際に、データをソートしてデータベースストレージのパートとして書き込みます。

バッファがフラッシュされる前に、同じクライアントまたは他のクライアントからの他の非同期挿入クエリのデータがバッファに集められる場合があります。
バッファフラッシュから作成されたパートは、いくつかの非同期挿入クエリのデータを含む可能性があります。
一般的に、これらのメカニズムはデータのバッチ処理をクライアント側からサーバー側（ClickHouseインスタンス）に移します。

:::note
データはデータベースストレージにフラッシュされる前はクエリによって検索できず、バッファフラッシュは設定可能であることに注意してください。

非同期挿入の設定に関する詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)で、深堀り情報は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)をご覧ください。
:::

### 公式のClickHouseクライアントを使用する {#use-official-clickhouse-clients}

ClickHouseは、最も人気のあるプログラミング言語でクライアントを提供しています。
これらは挿入が正しく実行されることを保証するために最適化されており、上記のフォーマットをクエリ、ユーザー、または接続レベルの設定で有効にすると、直接あるいは間接的に非同期挿入をサポートしています。

利用可能なClickHouseクライアントとドライバの完全なリストは[クライアントとドライバ](/interfaces/cli)をご覧ください。

### ネイティブフォーマットを優先する {#prefer-the-native-format}

ClickHouseは、挿入（およびクエリ）時に多くの[入力フォーマット](/interfaces/formats)をサポートしています。
これはOLTPデータベースと大きく異なり、外部ソースからデータを読み込むのをはるかに容易にします - 特に[テーブル関数](/sql-reference/table-functions)とディスク上のファイルからデータをロードする能力と組み合わせるときに。
これらのフォーマットは、その場のデータ読み込みやデータエンジニアリング作業に理想的です。

最適な挿入パフォーマンスを目指すアプリケーションの場合、ユーザーは[ネイティブ](/interfaces/formats/Native)フォーマットを使用して挿入するべきです。
これは、ほとんどのクライアント（GoやPythonなど）によってサポートされており、このフォーマットは既に列指向のため、サーバーが行う作業量を最小限に抑えます。
これにより、データを列指向形式に変換する責任がクライアント側に置かれます。これは、挿入を効率的にスケーリングするために重要です。

また、行形式を好む場合には、[RowBinaryフォーマット](/interfaces/formats/RowBinary)（Javaクライアントによって使用されるもの）を使用することができます。これは一般的にネイティブフォーマットよりも書きやすいです。
これは、[JSON](/interfaces/formats/JSON)のような代替の行形式に比べ、圧縮、ネットワークオーバーヘッド、サーバー処理の面で効率的です。
[JSONEachRow](/interfaces/formats/JSONEachRow)フォーマットは、より低い書き込みスループットを持つユーザーが迅速に統合を求める際に考慮されることがあります。ユーザーは、このフォーマットがClickHouseでのパースにCPUオーバーヘッドを伴うことを認識しておくべきです。

### HTTPインターフェースを使用する {#use-the-http-interface}

多くの従来のデータベースとは異なり、ClickHouseはHTTPインターフェースをサポートしています。
ユーザーは、上記のフォーマットのいずれかを使用してデータを挿入およびクエリするためにこれを使用できます。
これは、トラフィックをロードバランサで簡単に切り替えることができるため、ClickHouseのネイティブプロトコルよりも好まれることがあります。
ネイティブプロトコルとの挿入パフォーマンスの小さな違いが期待され、これは若干のオーバーヘッドがかかります。
既存のクライアントは、これらのプロトコルのいずれか（場合によっては両方、例えばGoクライアント）を使用します。
ネイティブプロトコルにより、クエリの進行状況を簡単に追跡できます。

詳細については[HTTPインターフェース](/interfaces/http)をご覧ください。

## Postgresからデータを読み込む {#loading-data-from-postgres}

Postgresからデータを読み込むために、ユーザーは以下を使用できます：

- PostgreSQLデータベースレプリケーション用に特別に設計されたETLツール「`PeerDB by ClickHouse`」。これは、以下の両方で利用可能です：
  - ClickHouse Cloud - 管理された取り込みサービスであるClickPipesの[新しいコネクタ](/integrations/clickpipes/postgres)を通じて入手可能です。
  - セルフマネージド - [オープンソースプロジェクト](https://github.com/PeerDB-io/peerdb)を介して。
- データを直接読み取るための[PostgreSQLテーブルエンジン](/integrations/postgresql#using-the-postgresql-table-engine)。これは、既知のウォーターマーク（例えば、タイムスタンプ）に基づくバッチレプリケーションが十分な場合や、一度限りの移行である場合に通常適切です。このアプローチは、数千万行にスケール可能です。より大きなデータセットを移行しようとするユーザーは、各リクエストがデータのチャンクを扱うようにすることを検討するべきです。最終テーブルにパーティションが移動される前に、各チャンクのためのステージングテーブルが使用されます。これにより、失敗したリクエストを再試行できます。このバルクローディング戦略に関するさらなる詳細は、こちらをご覧ください。
- データはCSV形式でPostgreSQLからエクスポートできます。これをClickHouseにローカルファイルまたはテーブル関数を使用してオブジェクトストレージ経由で挿入できます。

:::note 大規模なデータセットの挿入に関してサポートが必要ですか？
大規模なデータセットの挿入に関してサポートが必要な場合、またはClickHouse Cloudへのデータインポート中にエラーが発生した場合は、support@clickhouse.comまでご連絡ください。お手伝いさせていただきます。
:::
