---
title: ClickHouse データの挿入
description: ClickHouse にデータを挿入する方法
keywords: [挿入, データを挿入, テーブルに挿入]
sidebar_label: ClickHouse データの挿入
---

## 基本的な例 {#basic-example}

ClickHouse では、馴染みのある `INSERT INTO TABLE` コマンドを使用できます。最初のガイド ["ClickHouse におけるテーブルの作成"](./creating-tables) で作成したテーブルにデータを挿入してみましょう。

```sql
INSERT INTO helloworld.my_first_table (user_id, message, timestamp, metric) VALUES
    (101, 'Hello, ClickHouse!',                                 now(),       -1.0    ),
    (102, 'Insert a lot of rows per batch',                     yesterday(), 1.41421 ),
    (102, 'Sort your data based on your commonly-used queries', today(),     2.718   ),
    (101, 'Granules are the smallest chunks of data read',      now() + 5,   3.14159 )
```

これが成功したかどうかを確認するために、次の `SELECT` クエリを実行します：  

```sql
SELECT * FROM helloworld.my_first_table
```

結果は次のようになります：

```response
user_id message                                             timestamp           metric
101	    Hello, ClickHouse!	                                2024-11-13 20:01:22	-1
101	    Granules are the smallest chunks of data read	    2024-11-13 20:01:27	3.14159
102	    Insert a lot of rows per batch	                    2024-11-12 00:00:00	1.41421
102	    Sort your data based on your commonly-used queries	2024-11-13 00:00:00	2.718
```

## ClickHouse への挿入と OLTP データベースとの比較 {#inserting-into-clickhouse-vs-oltp-databases}

OLAP（オンライン分析処理）データベースとして、ClickHouse は高パフォーマンスとスケーラビリティのために最適化されており、1 秒あたり数百万行を挿入できる可能性があります。 
これは、高度に並列化されたアーキテクチャと効率的な列指向圧縮の組み合わせによって実現されていますが、即時の整合性が妥協されています。 
具体的には、ClickHouse は追加専用オペレーションに最適化されており、最終的な整合性の保証のみを提供します。

対照的に、Postgres のような OLTP データベースは、強い整合性と信頼性の保証を確保するために、トランザクション挿入に特化して最適化されています。 
PostgreSQL は MVCC（マルチバージョン・同時実行制御）を使用して同時トランザクションを処理し、データの複数バージョンを維持します。 
これらのトランザクションは、同時に少数の行を含むことがあり、挿入パフォーマンスを制限する信頼性の保証により、かなりのオーバーヘッドが生じます。

強い整合性の保証を維持しながら高い挿入パフォーマンスを実現するために、ユーザーは ClickHouse にデータを挿入する際に以下の簡単なルールを守るべきです。 
これらのルールに従うことで、ユーザーが初めて ClickHouse を使用する際に一般的に遭遇する問題を避け、OLTP データベースで機能する挿入戦略を再現しようとするのを助けます。

## 挿入のベストプラクティス {#best-practices-for-inserts}

### 大きなバッチサイズで挿入する {#insert-in-large-batch-sizes}

デフォルトでは、ClickHouse に送信された各挿入は、挿入からのデータと保存する必要のある他のメタデータを含むストレージのパートを即座に作成します。 
したがって、少量の挿入を送信し、それぞれにより多くのデータを含める方が、より多くの挿入を送信し、それぞれに少量のデータを含めるよりも、必要な書き込みの回数が減ります。 
一般的に、データは1回につき1,000行以上のかなり大きなバッチで挿入することをお勧めし、理想的には10,000行から100,000行の間で行うことを推奨します。
（詳細は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)をご覧ください）。 

大きなバッチが不可能な場合は、以下に説明する非同期挿入を使用してください。

### 冪等性のある再試行のための一貫したバッチを確保する {#ensure-consistent-batches-for-idempotent-retries}

デフォルトでは、ClickHouse への挿入は同期的で冪等です（つまり、同じ挿入操作を複数回実行しても、一度実行するのと同じ効果があります）。 
MergeTree エンジンファミリーのテーブルについて、ClickHouse はデフォルトで自動的に [挿入の重複排除](https://clickhouse.com/blog/common-getting-started-issues-with-clickhouse#5-deduplication-at-insert-time)を行います。 

これは、挿入が以下のケースで堅牢であることを意味します：

- 1. データを受信するノードに問題がある場合、挿入クエリはタイムアウトし（またはより具体的なエラーが返され）、確認応答を受け取ることはありません。
- 2. データがノードによって書き込まれたが、ネットワークの中断によりクエリの送信者に確認応答を返せない場合、送信者はタイムアウトまたはネットワークエラーを受け取ります。

クライアントの視点から見ると、(i) および (ii) は区別が難しい場合があります。しかし、どちらの場合でも、確認応答のない挿入はそのまま再試行できます。 
再試行された挿入クエリが同じデータを同じ順序で含む限り、ClickHouse は元の（確認されない）挿入が成功した場合、再試行された挿入を自動的に無視します。

### MergeTree テーブルまたは分散テーブルに挿入する {#insert-to-a-mergetree-table-or-a-distributed-table}

データがシャーディングされている場合は、リクエストをノードのセット間でバランスさせ、`internal_replication=true` を設定して、MergeTree（または複製テーブル）に直接挿入することをお勧めします。 
これにより、ClickHouse はデータを利用可能なレプリカのシャードに複製し、データが最終的に一貫性があることを保証します。 

このクライアント側の負荷分散が不便な場合は、[分散テーブル](/engines/table-engines/special/distributed) を介して挿入することができ、これによりノード間で書き込みが分散されます。同様に、`internal_replication=true` を設定することが推奨されます。 
ただし、このアプローチは、書き込みが分散テーブルを持つノードでローカルに行われ、その後シャードに送信されるため、パフォーマンスが若干劣ります。

### 小さなバッチのために非同期挿入を使用する {#use-asynchronous-inserts-for-small-batches}

クライアント側のバッチ処理が実行不可能なシナリオ（例：100件や1000件の単目的エージェントがログ、メトリック、トレースなどを送信する観測用途など）が存在します。 
このシナリオでは、そのデータのリアルタイム輸送が、問題や異常をできるだけ早く検出するために重要です。 
さらに、観測システムにおいてイベントのスパイクのリスクがあり、クライアント側で観測データをバッファリングしようとすると、大きなメモリスパイクや関連する問題を引き起こす可能性があります。 
大きなバッチを挿入できない場合は、[非同期挿入](/cloud/bestpractices/asynchronous-inserts)を使用して ClickHouse にバッチ処理を委任することができます。

非同期挿入を使用すると、データはまずバッファに挿入され、次に3つのステップでデータベースストレージに書き込まれます。以下の図に示すように：

<br />

<img src={require('./images/postgres-inserts.png').default}    
     className="image"
     alt="NEEDS ALT"
     style={{width: '600px'}} 
/>

<br />

非同期挿入が有効になっていると、ClickHouse は：  

(1) 非同期で挿入クエリを受信します。  
(2) 最初にクエリのデータをメモリ内のバッファに書き込みます。  
(3) 次のバッファフラッシュが行われる時に、データをソートしてデータベースストレージのパートとして書き込みます。  

バッファがフラッシュされる前に、同じクライアントまたは他のクライアントからの他の非同期挿入クエリのデータがバッファに集められる可能性があります。 
バッファフラッシュから作成されるパートには、複数の非同期挿入クエリのデータが含まれる可能性があります。 
一般的に、これらのメカニズムは、データのバッチ処理をクライアント側からサーバー側（ClickHouse インスタンス）に移行します。

:::note
データはデータベースストレージにフラッシュされるまでクエリによって検索できず、バッファフラッシュは設定可能です。  

非同期挿入の設定に関する詳細は[こちら](/optimize/asynchronous-inserts#enabling-asynchronous-inserts)に、さらに掘り下げた内容は[こちら](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse)にあります。
:::

### 公式の ClickHouse クライアントを使用する {#use-official-clickhouse-clients}

ClickHouse には、最も人気のあるプログラミング言語でクライアントがあります。 
これらは、挿入が正しく行われることを保証するように最適化されており、[Go クライアント](/integrations/go#async-insert)のように直接非同期挿入をサポートしています。あるいは、クエリ、ユーザー、接続レベルの設定で有効にすることができます。

[クライアントとドライバ](/interfaces/cli)で、利用可能な ClickHouse クライアントとドライバの完全なリストを確認してください。

### ネイティブフォーマットを優先する {#prefer-the-native-format}

ClickHouse は、挿入（およびクエリ）の際に多くの [入力形式](/interfaces/formats) をサポートしています。 
これは OLTP データベースとの大きな違いであり、外部ソースからデータをロードするのをはるかに簡単にします - 特に、[テーブル関数](/sql-reference/table-functions) とファイルからのデータをロードする機能と組み合わせると、さらに便利です。 
これらの形式は、アドホックなデータローディングやデータエンジニアリングタスクに最適です。 

最適な挿入パフォーマンスを達成したいアプリケーションのために、ユーザーは [Native](/interfaces/formats#native) フォーマットを使用して挿入するべきです。 
これは、ほとんどのクライアント（Go や Python など）にサポートされており、この形式はすでに列指向であるため、サーバーが行わなければならない作業量を最小限に抑えます。 
このようにすることで、データを列指向フォーマットに変換する責任がクライアント側に委ねられます。これは、挿入を効率的にスケーリングするために重要です。

代わりに、行フォーマットが好ましい場合は [RowBinary フォーマット](/interfaces/formats#rowbinary)（Java クライアントで使用される）を使用できます - これは通常、ネイティブフォーマットよりも書きやすいです。 
これは、圧縮、ネットワークオーバーヘッド、およびサーバーでの処理の点で、[JSON](/integrations/data-formats/json/overview) などの他の行形式よりも効率的です。 
[JSONEachRow](../../sql-reference/formats#jsoneachrow) 形式は、早急に統合したいが書き込みスループットが低いユーザーにとって考慮すべき選択肢です。ただし、この形式では ClickHouse でのパースに CPU オーバーヘッドが発生することに注意してください。

### HTTP インターフェースを使用する {#use-the-http-interface}

多くの従来のデータベースとは異なり、ClickHouse は HTTP インターフェースをサポートしています。 
ユーザーは、上記の形式を使用してデータを挿入し、クエリを実行するためにこれを使用できます。 
通常、これはトラフィックをロードバランサーで簡単に切り替えることができるため、ClickHouse のネイティブプロトコルよりも好まれます。 
ネイティブプロトコルでは、挿入パフォーマンスに小さな違いがあり、オーバーヘッドが若干少ないことが見込まれます。 
既存のクライアントは、これらのプロトコルのいずれか（場合によっては両方、例：Go クライアント）を使用しています。 
ネイティブプロトコルは、クエリの進捗を簡単に追跡することができます。

詳細については [HTTP インターフェース](/interfaces/http) をご覧ください。

## Postgres からデータをロードする {#loading-data-from-postgres}

Postgres からデータをロードするために、ユーザーは以下を使用できます：

- `PeerDB by ClickHouse`、PostgreSQL データベース複製のために特別に設計された ETL ツール。これは以下の両方で入手可能です：
  - ClickHouse Cloud - 我々の [新しいコネクタ](/integrations/clickpipes/postgres)（プライベートプレビュー）を通じて提供される、管理対象の取り込みサービス ClickPipes で利用可能。関心のあるユーザーは [こちら](https://clickpipes.peerdb.io/) でサインアップできます。
  - セルフマネージド - [オープンソースプロジェクト](https://github.com/PeerDB-io/peerdb)を介して。
- 以前の例で示したように、データを直接読み取るための[PostgreSQL テーブルエンジン](/integrations/postgresql#using-the-postgresql-table-engine)。これは、タイムスタンプなどの既知のウォーターマークに基づくバッチ複製が十分である場合や、1回限りの移行である場合に通常適切です。このアプローチは、1000万行までスケールできます。ユーザーは、より大きなデータセットを移行しようとする場合、各データチャンクを処理するために複数のリクエストを検討する必要があります。最終テーブルに移動する前に、各チャンクのステージングテーブルを使用できます。これにより、失敗したリクエストを再試行できます。このバルクローディング戦略に関する詳細は、こちらでご覧ください。
- データを CSV 形式で PostgreSQL からエクスポートすることができます。これを元にして、ローカルファイルまたはオブジェクトストレージを介して ClickHouse に挿入できます。

:::note 大きなデータセットの挿入に困っていますか？
大きなデータセットの挿入に関して助けが必要な場合、または ClickHouse Cloud へのデータのインポート時にエラーが発生した場合は、support@clickhouse.com までご連絡いただければ、サポートいたします。
:::
