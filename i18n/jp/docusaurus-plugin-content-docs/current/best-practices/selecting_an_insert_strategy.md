---
slug: /best-practices/selecting-an-insert-strategy
sidebar_position: 10
sidebar_label: 'INSERT 戦略の選択'
title: 'INSERT 戦略の選択'
description: 'ClickHouse で最適な INSERT 戦略を選択する方法を説明するページ'
keywords: ['INSERT', 'asynchronous inserts', 'compression', 'batch inserts']
show_related_blogs: true
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insert_process from '@site/static/images/bestpractices/insert_process.png';
import async_inserts from '@site/static/images/bestpractices/async_inserts.png';
import AsyncInserts from '@site/docs/best-practices/_snippets/_async_inserts.md';
import BulkInserts from '@site/docs/best-practices/_snippets/_bulk_inserts.md';

効率的なデータ取り込みは、高パフォーマンスな ClickHouse デプロイメントの基盤となります。適切な挿入戦略を選択することで、スループット、コスト、信頼性に大きな影響を与えられます。このセクションでは、ワークロードに対して最適な判断を行うためのベストプラクティス、トレードオフ、および設定オプションを説明します。

:::note
以下は、クライアント経由で ClickHouse にデータをプッシュすることを前提としています。ClickHouse 側でデータをプルする場合、たとえば [s3](/sql-reference/table-functions/s3) や [gcs](/sql-reference/table-functions/gcs) などのビルトインテーブル関数を使用する場合は、「[S3 への挿入と読み取りパフォーマンスの最適化](/integrations/s3/performance)」ガイドを参照することを推奨します。
:::


## デフォルトの同期挿入 {#synchronous-inserts-by-default}

デフォルトでは、ClickHouseへの挿入は同期的に行われます。各挿入クエリは、メタデータとインデックスを含むストレージパートをディスク上に即座に作成します。

:::note クライアント側でデータをバッチ処理できる場合は同期挿入を使用してください
できない場合は、以下の[非同期挿入](#asynchronous-inserts)を参照してください。
:::

以下では、ClickHouseのMergeTree挿入メカニズムを簡単に説明します：

<Image
  img={insert_process}
  size='lg'
  alt='挿入プロセス'
  background='black'
/>

#### クライアント側のステップ {#client-side-steps}

最適なパフォーマンスを得るには、データを①[バッチ処理](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse#data-needs-to-be-batched-for-optimal-performance)する必要があり、バッチサイズが**最初の決定事項**となります。

ClickHouseは挿入されたデータをディスク上に、テーブルのプライマリキー列で[順序付けて](/guides/best-practices/sparse-primary-indexes#data-is-stored-on-disk-ordered-by-primary-key-columns)保存します。**2番目の決定事項**は、サーバーへの送信前にデータを②事前ソートするかどうかです。バッチがプライマリキー列で事前ソート済みの状態で到着すると、ClickHouseは⑩ソートステップを[スキップ](https://github.com/ClickHouse/ClickHouse/blob/94ce8e95404e991521a5608cd9d636ff7269743d/src/Storages/MergeTree/MergeTreeDataWriter.cpp#L595)でき、取り込みを高速化できます。

取り込むデータに事前定義されたフォーマットがない場合、**重要な決定事項**はフォーマットの選択です。ClickHouseは[70種類以上のフォーマット](/interfaces/formats)でのデータ挿入をサポートしています。ただし、ClickHouseコマンドラインクライアントやプログラミング言語クライアントを使用する場合、この選択は自動的に処理されることが多いです。必要に応じて、この自動選択を明示的に上書きすることもできます。

次の**主要な決定事項**は、ClickHouseサーバーへの送信前にデータを④圧縮するかどうかです。圧縮により転送サイズが削減され、ネットワーク効率が向上し、特に大規模なデータセットにおいて、データ転送の高速化と帯域幅使用量の削減につながります。

データは⑤ClickHouseのネットワークインターフェース（[ネイティブ](/interfaces/tcp)または[HTTP](/interfaces/http)インターフェース）に送信されます（これらについては、この記事の後半で[比較](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient#clickhouse-client-defaults)します）。

#### サーバー側のステップ {#server-side-steps}

データを⑥受信した後、ClickHouseは圧縮が使用されていた場合は⑦解凍し、その後、元の送信フォーマットから⑧パースします。

そのフォーマット済みデータの値とターゲットテーブルの[DDL](/sql-reference/statements/create/table)文を使用して、ClickHouseは⑨MergeTreeフォーマットでメモリ内[ブロック](/development/architecture#block)を構築し、事前ソートされていない場合はプライマリキー列で行を⑩[ソート](/parts#what-are-table-parts-in-clickhouse)し、⑪[スパースプライマリインデックス](/guides/best-practices/sparse-primary-indexes)を作成し、⑫[列ごとの圧縮](/parts#what-are-table-parts-in-clickhouse)を適用し、⑬新しい⑭[データパート](/parts)としてディスクに書き込みます。

### 同期の場合はバッチ挿入を使用 {#batch-inserts-if-synchronous}

<BulkInserts />

### 冪等性のあるリトライを確保 {#ensure-idempotent-retries}

同期挿入は**冪等性**も備えています。MergeTreeエンジンを使用する場合、ClickHouseはデフォルトで挿入の重複を排除します。これにより、次のような曖昧な失敗ケースから保護されます：

- 挿入は成功したが、ネットワーク中断により確認応答をクライアントが受信できなかった場合
- 挿入がサーバー側で失敗し、タイムアウトした場合

どちらの場合も、バッチの内容と順序が同一である限り、**挿入を再試行**しても安全です。このため、クライアントがデータを変更または並べ替えることなく、一貫して再試行することが重要です。

### 適切な挿入ターゲットを選択 {#choose-the-right-insert-target}

シャード化されたクラスターの場合、2つのオプションがあります：

- **MergeTree**または**ReplicatedMergeTree**テーブルに直接挿入する。クライアントがシャード間で負荷分散を実行できる場合、これが最も効率的なオプションです。`internal_replication = true`を設定すると、ClickHouseがレプリケーションを透過的に処理します。
- [Distributedテーブル](/engines/table-engines/special/distributed)に挿入する。これにより、クライアントは任意のノードにデータを送信でき、ClickHouseが正しいシャードに転送します。これはよりシンプルですが、追加の転送ステップがあるため、わずかにパフォーマンスが低下します。それでも`internal_replication = true`の使用が推奨されます。


**ClickHouse Cloudでは、すべてのノードが同一の単一シャードに対して読み書きを行います。挿入は自動的にノード間でバランシングされます。ユーザーは公開されたエンドポイントに挿入を送信するだけで済みます。**

### 適切なフォーマットの選択 {#choose-the-right-format}

ClickHouseで効率的にデータを取り込むには、適切な入力フォーマットの選択が重要です。70種類以上のフォーマットがサポートされており、最もパフォーマンスの高いオプションを選択することで、挿入速度、CPUおよびメモリ使用量、そしてシステム全体の効率に大きな影響を与えることができます。

柔軟性はデータエンジニアリングやファイルベースのインポートにおいて有用ですが、**アプリケーションではパフォーマンス重視のフォーマットを優先すべきです**:

- **Nativeフォーマット**（推奨）:最も効率的です。カラム指向で、サーバー側での解析が最小限で済みます。GoおよびPythonクライアントでデフォルトで使用されます。
- **RowBinary**:効率的な行ベースのフォーマットで、クライアント側でのカラム変換が困難な場合に最適です。Javaクライアントで使用されます。
- **JSONEachRow**:使いやすいですが、解析コストが高くなります。低ボリュームのユースケースや迅速な統合に適しています。

### 圧縮の使用 {#use-compression}

圧縮は、ClickHouseにおいてネットワークオーバーヘッドの削減、挿入の高速化、ストレージコストの低減において重要な役割を果たします。効果的に使用することで、データフォーマットやスキーマの変更を必要とせずに取り込みパフォーマンスを向上させることができます。

挿入データを圧縮することで、ネットワーク経由で送信されるペイロードのサイズが削減され、帯域幅の使用量が最小化され、転送が高速化されます。

挿入において、圧縮はClickHouseの内部カラムストレージモデルと既に一致しているNativeフォーマットと組み合わせて使用する場合に特に効果的です。この構成では、サーバーは効率的にデータを解凍し、最小限の変換で直接保存することができます。

#### 速度にはLZ4、圧縮率にはZSTDを使用 {#use-lz4-for-speed-zstd-for-compression-ratio}

ClickHouseは、データ転送中にいくつかの圧縮コーデックをサポートしています。一般的な2つのオプションは次のとおりです:

- **LZ4**:高速で軽量です。最小限のCPUオーバーヘッドでデータサイズを大幅に削減し、高スループットの挿入に最適で、ほとんどのClickHouseクライアントでデフォルトとなっています。
- **ZSTD**:より高い圧縮率ですが、CPUへの負荷が大きくなります。リージョン間転送やクラウドプロバイダー間のシナリオなど、ネットワーク転送コストが高い場合に有用ですが、クライアント側の計算とサーバー側の解凍時間がわずかに増加します。

ベストプラクティス:帯域幅が制約されている場合やデータ送信コストが発生する場合を除き、LZ4を使用してください。その場合はZSTDを検討してください。

:::note
[FastFormatsベンチマーク](https://clickhouse.com/blog/clickhouse-input-format-matchup-which-is-fastest-most-efficient)のテストでは、LZ4圧縮されたNative挿入により、データサイズが50%以上削減され、5.6 GiBのデータセットの取り込み時間が150秒から131秒に短縮されました。ZSTDに切り替えると、同じデータセットが1.69 GiBまで圧縮されましたが、サーバー側の処理時間がわずかに増加しました。
:::

#### 圧縮によるリソース使用量の削減 {#compression-reduces-resource-usage}

圧縮はネットワークトラフィックを削減するだけでなく、サーバー上のCPUおよびメモリ効率も向上させます。圧縮されたデータにより、ClickHouseは受信するバイト数が少なくなり、大きな入力の解析に費やす時間が短縮されます。この利点は、可観測性シナリオなど、複数の同時クライアントから取り込む場合に特に重要です。

圧縮がCPUおよびメモリに与える影響は、LZ4では控えめで、ZSTDでは中程度です。負荷がかかっている状況でも、データ量の削減によりサーバー側の効率が向上します。

**圧縮をバッチ処理および効率的な入力フォーマット(Nativeなど)と組み合わせることで、最高の取り込みパフォーマンスが得られます。**

ネイティブインターフェース(例:[clickhouse-client](/interfaces/cli))を使用する場合、LZ4圧縮がデフォルトで有効になっています。設定によりオプションでZSTDに切り替えることができます。

[HTTPインターフェース](/interfaces/http)では、Content-Encodingヘッダーを使用して圧縮を適用します(例:Content-Encoding: lz4)。送信前にペイロード全体を圧縮する必要があります。

### コストが低い場合は事前ソート {#pre-sort-if-low-cost}

挿入前にプライマリキーでデータを事前ソートすることで、特に大規模なバッチにおいて、ClickHouseの取り込み効率を向上させることができます。

データが事前ソートされた状態で到着すると、ClickHouseはパート作成時の内部ソートステップをスキップまたは簡略化でき、CPU使用量を削減し、挿入プロセスを高速化できます。事前ソートは圧縮効率も向上させます。類似した値がグループ化されるため、LZ4やZSTDなどのコーデックがより良い圧縮率を達成できるようになります。これは、大規模なバッチ挿入と圧縮を組み合わせた場合に特に有益で、処理オーバーヘッドと転送されるデータ量の両方が削減されます。

**ただし、事前ソートはオプションの最適化であり、必須ではありません。**ClickHouseは並列処理を使用してデータを非常に効率的にソートするため、多くの場合、サーバー側でのソートの方がクライアント側での事前ソートよりも高速または便利です。


**事前ソートは、データがすでにほぼ並び替え済みである場合、またはクライアント側リソース（CPU、メモリ）が十分にあり、かつ余裕がある場合にのみ推奨されます。** 観測基盤など、レイテンシに敏感またはスループットが高いユースケースで、データが順不同で到着したり、多数のエージェントから集まるような場合には、事前ソートは行わず、ClickHouse の組み込みパフォーマンスに任せた方がよいことが多くあります。



## 非同期インサート {#asynchronous-inserts}

<AsyncInserts />


## インターフェースの選択—HTTPまたはネイティブ {#choose-an-interface}

### ネイティブ {#choose-an-interface-native}

ClickHouseはデータ取り込みのための2つの主要なインターフェースを提供しています。**ネイティブインターフェース**と**HTTPインターフェース**です。それぞれパフォーマンスと柔軟性の間でトレードオフがあります。ネイティブインターフェースは、[clickhouse-client](/interfaces/cli)やGoやC++などの特定の言語クライアントで使用され、パフォーマンスを重視して設計されています。常にClickHouseの高効率なネイティブ形式でデータを転送し、LZ4またはZSTDによるブロック単位の圧縮をサポートし、解析や形式変換などの処理をクライアント側にオフロードすることでサーバー側の処理を最小限に抑えます。

さらに、MATERIALIZEDおよびDEFAULTカラム値のクライアント側計算を可能にし、サーバーがこれらの処理を完全にスキップできるようにします。これにより、ネイティブインターフェースは効率性が重要な高スループットの取り込みシナリオに最適です。

### HTTP {#choose-an-interface-http}

多くの従来のデータベースとは異なり、ClickHouseはHTTPインターフェースもサポートしています。**これは対照的に、互換性と柔軟性を優先します。**JSON、CSV、Parquetなどを含む[サポートされている任意の形式](/integrations/data-formats)でデータを送信でき、Python、Java、JavaScript、Rustを含むほとんどのClickHouseクライアントで広くサポートされています。

これは、ロードバランサーでトラフィックを簡単に切り替えられるため、ClickHouseのネイティブプロトコルよりも好まれることが多いです。ネイティブプロトコルとの挿入パフォーマンスの差は小さく、ネイティブプロトコルの方がわずかにオーバーヘッドが少なくなります。

ただし、ネイティブプロトコルのような深い統合が欠けており、マテリアライズド値の計算やネイティブ形式への自動変換などのクライアント側最適化を実行できません。HTTP挿入は標準HTTPヘッダー（例：`Content-Encoding: lz4`）を使用して圧縮できますが、圧縮は個々のデータブロックではなくペイロード全体に適用されます。このインターフェースは、プロトコルのシンプルさ、ロードバランシング、または幅広い形式の互換性が純粋なパフォーマンスよりも重要な環境で好まれることが多いです。

これらのインターフェースの詳細な説明については、[こちら](/interfaces/overview)を参照してください。
