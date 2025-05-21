---
title: 'ClickHouseデータの挿入'
description: 'ClickHouseにデータを挿入する方法'
keywords: ['insert', 'insert data', 'insert into table']
sidebar_label: 'ClickHouseデータの挿入'
slug: /guides/inserting-data
---

import postgres_inserts from '@site/static/images/guides/postgres-inserts.png';
import Image from '@theme/IdealImage';

## 基本例 {#basic-example}

ClickHouseでは、馴染みのある `INSERT INTO TABLE` コマンドを使用できます。まず、["ClickHouseでのテーブル作成"](./creating-tables) ガイドで作成したテーブルにいくつかのデータを挿入してみましょう。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

これがうまくいったか確認するために、次の `SELECT` クエリを実行します。

```sql
SELECT * FROM helloworld.my_first_table
```

結果は次のとおりです。

```response
user_id message                                             timestamp           metric
101         Hello, ClickHouse!                                  2024-11-13 20:01:22     -1
101         Granules are the smallest chunks of data read           2024-11-13 20:01:27 3.14159
102         Insert a lot of rows per batch                          2024-11-12 00:00:00 1.41421
102         Sort your data based on your commonly-used queries  2024-11-13 00:00:00     2.718
```

## ClickHouseへの挿入とOLTPデータベースの比較 {#inserting-into-clickhouse-vs-oltp-databases}

OLAP（Online Analytical Processing）データベースとして、ClickHouseは高パフォーマンスとスケーラビリティのために最適化されており、1秒あたり数百万行の挿入を可能にします。
これは、高度に並行化されたアーキテクチャと効率的な列指向圧縮の組み合わせによって実現されますが、即時の整合性に関しては妥協があります。
特に、ClickHouseは追加のみの操作に最適化されており、最終的な整合性保証のみを提供します。

対照的に、PostgresのようなOLTPデータベースは、完全なACID準拠のもとでのトランザクション挿入に特化して最適化されており、強い整合性と信頼性の保証を確保します。
PostgreSQLはMVCC（Multi-Version Concurrency Control）を使用して同時トランザクションを処理し、データの複数のバージョンを保持する必要があります。
これらのトランザクションは、一度に少数の行を含む可能性があり、挿入パフォーマンスを制限する信頼性の保証により、かなりのオーバーヘッドが発生します。

高い挿入パフォーマンスを実現しながら強い整合性保証を維持するために、ユーザーはClickHouseにデータを挿入する際に以下の簡単なルールを遵守すべきです。これらのルールに従うことで、ClickHouseを初めて使用する際に一般的に遭遇する問題を避けることができ、OLTPデータベースで機能する挿入戦略を再現しようとする際に助けになるでしょう。

## 挿入のベストプラクティス {#best-practices-for-inserts}

### 大きなバッチサイズで挿入する {#insert-in-large-batch-sizes}

デフォルトでは、ClickHouseに送信される各挿入は、挿入からのデータと他のメタデータを含むストレージのパーツを直ちに作成させます。
したがって、より多くのデータを含む少量の挿入を送信することは、少ないデータを含む多数の挿入を送信することと比較して、必要な書き込みの数を減らします。
一般的に、1回の挿入で少なくとも1,000行のかなり大きなバッチでデータを挿入することをお勧めします。理想的には10,000行から100,000行の間です。
（さらなる詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)をご覧ください）。

大きなバッチが不可能な場合は、以下で説明する非同期挿入を使用してください。

### 冪等性のための一貫したバッチを確保する {#ensure-consistent-batches-for-idempotent-retries}

デフォルトでは、ClickHouseへの挿入は同期的であり、冪等性を持ちます（つまり、同じ挿入操作を複数回実行しても、一度実行したのと同じ効果があります）。
MergeTreeエンジンファミリーのテーブルの場合、ClickHouseはデフォルトで自動的に[挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。

これは、以下のケースで挿入が堅牢であることを意味します。

- 1. データを受信するノードに問題がある場合、挿入クエリはタイムアウト（またはより具体的なエラーを返す）し、確認が得られません。
- 2. データがノードに書き込まれたが、ネットワークの中断のためにクエリの送信者に確認を返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

クライアントの観点から見ると、(i)と(ii)は区別が難しい場合があります。しかし、どちらの場合でも、確認されていない挿入は直ちに再試行できます。
再試行された挿入クエリが同じデータを同じ順序で含む限り、ClickHouseは（確認されていない）元の挿入が成功した場合、再試行された挿入を自動的に無視します。

### MergeTreeテーブルまたは分散テーブルに挿入する {#insert-to-a-mergetree-table-or-a-distributed-table}

データがシャードされている場合は、リクエストをノードのセットに均等に分散し、 `internal_replication=true` を設定して、MergeTree（またはReplicatedテーブル）に直接挿入することをお勧めします。
これにより、ClickHouseがデータを利用可能なレプリカシャードにレプリケートし、データが最終的に整合することが保証されます。

このクライアント側の負荷分散が不便な場合、ユーザーは[分散テーブル](/engines/table-engines/special/distributed)を介して挿入することができ、書き込みがノード間で分散されます。再度、 `internal_replication=true` を設定することが推奨されます。
ただし、このアプローチは、分散テーブルを持つノード上で書き込みがローカルに行われ、シャードに送信される必要があるため、パフォーマンスが若干低下することに注意が必要です。

### 小規模バッチ用に非同期挿入を使用する {#use-asynchronous-inserts-for-small-batches}

クライアント側でのバッチ処理が実現できないシナリオもあります。例えば、100sや1000sの単一目的のエージェントがログ、メトリクス、トレースなどを送信する可観測性のユースケースです。
このシナリオでは、データのリアルタイム輸送が問題や異常をできるだけ早く検出するための鍵となります。
さらに、観測されたシステムでイベントスパイクのリスクがあり、可観測性データをクライアント側でバッファリングしようとすると、大きなメモリスパイクやそれに関連する問題が発生する可能性があります。
大きなバッチを挿入できない場合、ユーザーは[非同期挿入](/best-practices/selecting-an-insert-strategy#asynchronous-inserts)を使用してClickHouseにバッチ処理を委任できます。

非同期挿入を使用すると、データは最初にバッファに挿入され、その後、データベースストレージに3つのステップで書き込まれます。次の図で示すように。

<Image img={postgres_inserts} size="md" alt="Postgres inserts"/>

非同期挿入が有効な場合、ClickHouseは次のように処理します。

(1) 挿入クエリを非同期的に受信する。
(2) クエリのデータを最初にメモリ内のバッファに書き込む。
(3) 次のバッファフラッシュが行われたときに、データを整理してデータベースストレージのパーツとして書き込む。

バッファがフラッシュされる前に、同じクライアントまたは他のクライアントからの他の非同期挿入クエリのデータがバッファに収集される可能性があります。
バッファフラッシュから作成されたパーツには、複数の非同期挿入クエリからのデータが含まれる可能性があります。
一般的に、これらのメカニズムは、データのバッチ処理をクライアント側からサーバー側（ClickHouseインスタンス）に移行します。

:::note
データはデータベースストレージにフラッシュされるまでクエリで検索できないこと、およびバッファフラッシュが構成可能であることに注意してください。

非同期挿入の構成に関する完全な詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)で確認できます。また、深く掘り下げた内容は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)にあります。
:::

### 公式のClickHouseクライアントを使用する {#use-official-clickhouse-clients}

ClickHouseは、最も人気のあるプログラミング言語でクライアントを提供しています。
これらは、挿入が正しく行われることを保証し、例えば[e.g. the Go client](/integrations/go#async-insert)のように、クエリ、ユーザー、接続レベル設定で有効にされた場合に直接非同期挿入をサポートします。

使用可能なClickHouseクライアントとドライバの完全なリストについては、[Clients and Drivers](/interfaces/cli)をご覧ください。

### ネイティブフォーマットを優先する {#prefer-the-native-format}

ClickHouseは、挿入（およびクエリ）時に多くの[入力フォーマット](/interfaces/formats)をサポートしています。
これは、OLTPデータベースとの重要な違いであり、特に[テーブル関数](/sql-reference/table-functions)やディスク上のファイルからデータをロードする能力と組み合わせると、外部ソースからのデータの読み込みがはるかに簡単になります。
これらのフォーマットは、アドホックデータロードやデータエンジニアリングタスクに最適です。

最適な挿入パフォーマンスを達成しようとするアプリケーションでは、[Native](/interfaces/formats/Native)フォーマットを使用して挿入することをお勧めします。
これはほとんどのクライアント（GoやPythonなど）でサポートされており、サーバーが最小限の作業を行うことを保証します。このフォーマットはすでに列指向です。
そうすることで、データを列指向フォーマットに変換する責任がクライアント側に置かれます。これは、効率的に挿入をスケールさせるために重要です。

代わりに、行フォーマットが好まれる場合は、[RowBinary format](/interfaces/formats/RowBinary)（Javaクライアントが使用）を利用できます。これは通常、ネイティブフォーマットよりも書きやすいです。
これは、圧縮、ネットワークオーバーヘッド、サーバー上の処理に関して、[JSON](/interfaces/formats/JSON)などの代替行フォーマットよりも効率的です。
[JSONEachRow](/interfaces/formats/JSONEachRow)フォーマットは、迅速に統合を希望する低書き込みスループットのユーザーに考慮される可能性があります。ユーザーは、このフォーマットがClickHouseでの解析のためにCPUオーバーヘッドを引き起こすことに注意する必要があります。

### HTTPインターフェースを使用する {#use-the-http-interface}

多くの従来のデータベースとは異なり、ClickHouseはHTTPインターフェースをサポートしています。
ユーザーは、上記のフォーマットのいずれかを使用してデータの挿入とクエリの両方にこれを使用できます。
これは、トラフィックをロードバランサーで簡単に切り替えることができるため、ClickHouseのネイティブプロトコルよりも好まれることがよくあります。
ネイティブプロトコルでは、小さな挿入のパフォーマンスの違いが期待されますが、オーバーヘッドが少し少なくなります。
既存のクライアントは、これらのプロトコルのいずれか（場合によっては両方、例えばGoクライアント）を使用します。
ネイティブプロトコルは、クエリの進捗を簡単に追跡できるという利点があります。

さらなる詳細については、[HTTP Interface](/interfaces/http)をご覧ください。

## Postgresからのデータのロード {#loading-data-from-postgres}

Postgresからデータをロードするために、ユーザーは次を使用できます。

- `PeerDB by ClickHouse`、PostgreSQLデータベースレプリケーションのために特別に設計されたETLツール。これは次の2つで利用可能です。
  - ClickHouse Cloud - 私たちの[新しいコネクタ](/integrations/clickpipes/postgres)（プライベートプレビュー）を介して提供されるClickPipes、私たちの管理された取り込みサービス。興味のあるユーザーは[こちらにサインアップ](https://clickpipes.peerdb.io/)できます。
  - セルフマネージド - [オープンソースプロジェクト](https://github.com/PeerDB-io/peerdb)を介して。
- 以前の例に示したように、データを直接読み取るための[PostgreSQLテーブルエンジン](/integrations/postgresql#using-the-postgresql-table-engine)。通常は、既知のウォーターマーク（例：タイムスタンプ）に基づいたバッチレプリケーションが十分な場合や、一度限りの移行の場合に適しています。このアプローチは1000万行にスケールできます。より大きなデータセットを移行することを考えているユーザーは、データのチャンクを処理する各リクエストを考慮するべきです。ステージングテーブルを使用し、各チャンクのパーティションを最終テーブルに移動する前に使用することができます。これにより、失敗したリクエストを再試行できます。このバルクローディング戦略のさらなる詳細については、こちらを参照してください。
- データはCSVフォーマットでPostgreSQLからエクスポートできます。これをClickHouseに挿入するために、ローカルファイルまたはオブジェクトストレージを介して使用できるテーブル関数を使用できます。

:::note 大規模データセットの挿入に関して助けが必要ですか？
大規模データセットの挿入に関して助けが必要な場合や、ClickHouse Cloudへのデータのインポート中にエラーに遭遇した場合は、support@clickhouse.com までご連絡ください。お手伝いします。
:::
