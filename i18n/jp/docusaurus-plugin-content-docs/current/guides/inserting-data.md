---
title: ClickHouseデータの挿入
description: ClickHouseにデータを挿入する方法
keywords: [挿入, データ挿入, テーブルへの挿入]
sidebar_label: ClickHouseデータの挿入
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';

## 基本的な例 {#basic-example}

ClickHouseでは、馴染みのある `INSERT INTO TABLE` コマンドを使用できます。最初のガイド ["Creating Tables in ClickHouse"](./creating-tables) で作成したテーブルにデータを挿入してみましょう。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

これが機能したかどうかを確認するために、次の `SELECT` クエリを実行します。

```sql
SELECT * FROM helloworld.my_first_table
```

返される結果は次の通りです。

```response
user_id message                                             timestamp           metric
101	    Hello, ClickHouse!	                                2024-11-13 20:01:22	-1
101	    Granules are the smallest chunks of data read	    2024-11-13 20:01:27	3.14159
102	    Insert a lot of rows per batch	                    2024-11-12 00:00:00	1.41421
102	    Sort your data based on your commonly-used queries	2024-11-13 00:00:00	2.718
```

## ClickHouseへの挿入とOLTPデータベース {#inserting-into-clickhouse-vs-oltp-databases}

OLAP（オンライン分析処理）データベースとして、ClickHouseは高パフォーマンスとスケーラビリティに最適化されており、秒間に数百万行を挿入することが可能です。
これは、高度に並列化されたアーキテクチャと効率的な列指向圧縮の組み合わせによって実現されていますが、即時の整合性には妥協があります。
具体的には、ClickHouseは追加専用操作に最適化されており、最終的な整合性の保証のみを提供します。

対照的に、PostgresのようなOLTPデータベースは、完全なACID準拠でトランザクション挿入に特化して最適化されており、強い整合性と信頼性の保証を提供します。
PostgreSQLは、MVCC（マルチバージョン同時実行制御）を使用して並行トランザクションを処理します。これにはデータの複数のバージョンを維持することが含まれます。
これらのトランザクションは、同時に小数の行を関与させる可能性があり、信頼性の保証が挿入パフォーマンスに影響を与えるため、相当なオーバーヘッドが発生します。

強い整合性の保証を維持しながら高い挿入パフォーマンスを達成するために、ユーザーはClickHouseにデータを挿入する際に以下の簡単なルールに従う必要があります。
これらのルールに従うことで、ClickHouseを初めて使用する際によく発生する問題を避け、OLTPデータベースに適した挿入戦略を再現しようとすることができます。

## 挿入のベストプラクティス {#best-practices-for-inserts}

### 大きなバッチサイズで挿入する {#insert-in-large-batch-sizes}

デフォルトでは、ClickHouseに送信された各挿入は、挿入からデータを含むストレージのパートを即座に作成させます。これは、保存する必要のある他のメタデータと共に行われます。
したがって、それぞれ少ないデータを包含するよりも多くのデータを含む小さな数の挿入を送信することで、必要な書き込みの回数を減らすことができます。
一般的には、一度に1,000行以上のかなり大きなバッチでデータを挿入することを推奨しており、理想的には10,000行から100,000行の間です。
（さらなる詳細は [こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance) にあります）。

大きなバッチが不可能な場合は、以下に説明する非同期挿入を使用してください。

### 冪等性リトライ用に一貫したバッチを確保する {#ensure-consistent-batches-for-idempotent-retries}

デフォルトでは、ClickHouseへの挿入は同期的で冪等です（つまり、同じ挿入操作を複数回実行しても、1回だけ実行したのと同じ効果があります）。
MergeTreeエンジンファミリーのテーブルの場合、ClickHouseはデフォルトで自動的に [挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time) を行います。

これにより、次のような場合でも挿入が耐障害性を保持します。

- 1. データを受信するノードに問題が発生した場合、挿入クエリはタイムアウト（もしくはより具体的なエラーを表示）し、確認応答を受け取ることはありません。
- 2. ノードによってデータが書き込まれたが、ネットワークの中断によりクエリの送信者に確認応答を戻せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

クライアントの観点からは、(i) と (ii) を区別するのは難しい場合があります。しかし、いずれのケースでも、未確認の挿入はすぐにリトライできます。
再試行された挿入クエリが同じ順序で同じデータを含んでいる限り、ClickHouseは元の（未確認の）挿入が成功した場合、再試行された挿入を自動的に無視します。

### MergeTreeテーブルまたは分散テーブルに挿入する {#insert-to-a-mergetree-table-or-a-distributed-table}

データがシャーディングされている場合、リクエストを一連のノードに分散させ、`internal_replication=true` を設定することで、MergeTree（またはレプリケートテーブル）に直接挿入することを推奨します。
これにより、ClickHouseが任意の利用可能なレプリカシャードにデータをレプリケートし、データが最終的に整合性を保証されることが確保されます。

このクライアント側の負荷分散が不便な場合、[分散テーブル](/engines/table-engines/special/distributed) を介して挿入し、ノード間で書き込みを分散させることができます。この場合も、`internal_replication=true` を設定することをお勧めします。
ただし、このアプローチは、分散テーブルを持つノードにローカルで書き込みを行い、その後シャードに送信する必要があるため、パフォーマンスはやや低下します。

### 小さなバッチ用に非同期挿入を使用する {#use-asynchronous-inserts-for-small-batches}

クライアント側でのバッチ処理が実行できない状況（100個または1000個の単目的エージェントがログ、メトリクス、トレースなどを送信する可観測性のユースケースなど）があります。
このシナリオでは、そのデータのリアルタイム輸送が重要であり、問題や異常を迅速に検出することが求められます。
さらに、観察されたシステムでイベントスパイクのリスクがあり、これがメモリスパイクや関連する問題を引き起こす可能性があります。
大きなバッチを挿入できない場合、ユーザーは [非同期挿入](/cloud/bestpractices/asynchronous-inserts) によってClickHouseにバッチ処理を委任できます。

非同期挿入を使用すると、データは最初にバッファに挿入され、その後、以下の3つのステップでデータベースストレージに書き込まれます。以下の図で示されたように：

<br />

<img src={postgres_inserts}
     className="image"
     alt="NEEDS ALT"
     style={{width: '600px'}}
/>

<br />

非同期挿入が有効になっている場合、ClickHouseは：

(1) 非同期で挿入クエリを受信します。
(2) クエリのデータを最初にメモリ内のバッファに書き込みます。
(3) 次のバッファフラッシュが行われる際に、データをデータベースストレージの一部としてソートして書き込みます。

バッファがフラッシュされる前に、同じクライアントまたは他のクライアントからの他の非同期挿入クエリのデータもバッファに集められます。
バッファフラッシュから作成されたパートは、複数の非同期挿入クエリのデータを含む可能性があります。
一般的に、これらのメカニズムはデータのバッチ処理をクライアント側からサーバー側（ClickHouseインスタンス）に移します。

:::note
データはデータベースストレージにフラッシュされるまでクエリによって検索できず、バッファフラッシュは設定可能であることに注意してください。

非同期挿入の設定に関する完全な詳細は [こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts) にあり、深く掘り下げた詳細は [こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) にあります。
:::


### 公式のClickHouseクライアントを使用する {#use-official-clickhouse-clients}

ClickHouseは、最も人気のあるプログラミング言語でクライアントを提供しています。
これらは、挿入が正しく行われ、必要に応じて非同期挿入をサポートするよう最適化されています。たとえば、[Goクライアント](/integrations/go#async-insert) のように、クエリやユーザー、接続レベルの設定で有効にすることで間接的に利用できます。

使用可能な全てのClickHouseクライアントとドライバのリストは [Clients and Drivers](/interfaces/cli) をご覧ください。

### ネイティブ形式を優先する {#prefer-the-native-format}

ClickHouseは、挿入（およびクエリ）時に多くの [入力形式](/interfaces/formats) をサポートしています。
これはOLTPデータベースとの大きな違いであり、外部ソースからのデータの読み込みを非常に容易にします - 特に、[テーブル関数](/sql-reference/table-functions) との組み合わせやディスクに保存されたファイルからデータを読み込む能力においてです。
これらの形式は、アドホックなデータ読み込みやデータエンジニアリングタスクには理想的です。

最適な挿入パフォーマンスを達成しようとするアプリケーションでは、[ネイティブ](/interfaces/formats/Native)形式を使用して挿入することを推奨します。
これは、ほとんどのクライアント（GoやPythonなど）にサポートされており、この形式はすでに列指向であるため、サーバーが行う必要がある作業が最小限に抑えられます。
これにより、データを列指向形式に変換する責任がクライアント側に移ります。これは、効率的に挿入をスケールさせるために重要です。

あるいは、行形式を好む場合は[RowBinary形式](/interfaces/formats/RowBinary)を使用できます（Javaクライアントが使用しています） - これは典型的にはネイティブ形式よりも書きやすいです。
これは、圧縮、ネットワークオーバーヘッド、サーバー上での処理に関して、[JSON](/interfaces/formats/JSON)のような代替の行形式よりも効率的です。
[JSONEachRow](/interfaces/formats/JSONEachRow)形式は、低い書き込みスループットで迅速に統合したいユーザーにとって検討すべき形式です。この形式はClickHouseでの解析にCPUオーバーヘッドがかかることに注意してください。

### HTTPインターフェースを使用する {#use-the-http-interface}

多くの従来のデータベースとは異なり、ClickHouseはHTTPインターフェースをサポートしています。
ユーザーは、上記の形式を使用してデータの挿入とクエリにこれを利用できます。
これは、トラフィックをロードバランサーで簡単に切り替えられるため、ClickHouseのネイティブプロトコルに対してしばしば好まれます。
挿入パフォーマンスはネイティブプロトコルでわずかに違いがあると予想され、わずかにオーバーヘッドが少なくなります。
既存のクライアントは、これらのプロトコルのいずれか（場合によっては両方、例えばGoクライアント）を使用します。
ネイティブプロトコルでは、クエリの進捗状況を簡単に追跡できます。

詳細については [HTTP Interface](/interfaces/http) をご覧ください。

## Postgresからデータを読み込む {#loading-data-from-postgres}

Postgresからデータを読み込むには、ユーザーは以下を使用できます。

- `PeerDB by ClickHouse`、PostgreSQLデータベースのレプリケーションに特化したETLツールです。これは次の両方で利用可能です：
  - ClickHouse Cloud - [新しいコネクタ](/integrations/clickpipes/postgres) を介して利用可能です（プライベートプレビュー）。興味のあるユーザーは [こちら](https://clickpipes.peerdb.io/) にサインアップしてください。
  - セルフマネージド - [オープンソースプロジェクト](https://github.com/PeerDB-io/peerdb) を介して。
- [PostgreSQLテーブルエンジン](/integrations/postgresql#using-the-postgresql-table-engine)を使用して、前例で示した通りにデータを直接読み取ることができます。通常は、既知のウォーターマーク（例えば、タイムスタンプ）に基づいたバッチレプリケーションが十分である場合や、一回限りの移行の場合に適しています。このアプローチは、数千万行にスケールさせることができます。より大きなデータセットを移行しようとしているユーザーは、データのチャンクを処理する各リクエストを検討する必要があります。最終的なテーブルにパーティションが移動される前に、各チャンクについてステージングテーブルを使用できます。これにより、失敗したリクエストを再試行することが可能です。このバルクロード戦略に関するさらに詳細はここを参照してください。
- データはCSV形式でPostgreSQLからエクスポートできます。これをローカルファイルまたはオブジェクトストレージを介してテーブル関数を使用してClickHouseに挿入できます。

:::note 大規模データセットの挿入に関するヘルプが必要ですか？
大規模データセットの挿入や、ClickHouse Cloudへのデータインポート時にエラーが発生した場合は、support@clickhouse.comにご連絡いただければ、サポートいたします。
:::
