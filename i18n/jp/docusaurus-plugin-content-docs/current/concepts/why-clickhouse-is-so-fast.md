---
sidebar_position: 1
sidebar_label: ClickHouseがこれほど速い理由
description: "ClickHouseは高速であるように設計されています。クエリの実行性能は、開発プロセス中の優先事項の一つでしたが、ユーザーフレンドリーさ、スケーラビリティ、セキュリティといった他の重要な特性も考慮されており、ClickHouseは実際のプロダクションシステムとなることができました。"
---


# ClickHouseがこれほど速い理由 {#why-clickhouse-is-so-fast}

データベースのパフォーマンスには、[データの方向性](/intro#row-oriented-vs-column-oriented-storage)以外にも多くの要因が寄与しています。今後、ClickHouseが特に他の列指向データベースと比較して何が速さを実現しているのか、詳しく説明します。

アーキテクチャ的な観点から見ると、データベースは（少なくとも）ストレージレイヤーとクエリ処理レイヤーで構成されています。ストレージレイヤーはテーブルデータを保存、読み込み、維持する役割を担い、クエリ処理レイヤーはユーザーのクエリを実行します。他のデータベースと比較して、ClickHouseは両方のレイヤーで革新を提供し、非常に高速なインサートやSELECTクエリを実現しています。

## ストレージレイヤー: 同時インサートは互いに隔離されている {#storage-layer-concurrent-inserts-are-isolated-from-each-other}

<iframe width="768" height="432" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickHouseでは、各テーブルは複数の「テーブルパーツ」で構成されています。[パーツ](/parts)は、ユーザーがテーブルにデータを挿入するたび（INSERTステートメント）、作成されます。クエリは常に、クエリが開始された時点で存在するすべてのテーブルパーツに対して実行されます。

過剰なパーツが蓄積されるのを防ぐために、ClickHouseはバックグラウンドで[マージ](/merges)操作を実行し、複数の小さなパーツを継続的に1つの大きなパーツに統合します。

このアプローチにはいくつかの利点があります: すべてのデータ処理が[バックグラウンドでのパートマージにオフロード](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)され、データ書き込みは軽量で非常に効率的に保たれます。個々のインサートは「ローカル」であり、グローバルな、すなわちテーブルごとのデータ構造を更新する必要がないためです。その結果、複数の同時インサートは相互の同期や既存のテーブルデータとの同期を必要とせず、ディスクI/Oの速度にほぼ等しい速さで実行できます。

## ストレージレイヤー: 同時インサートとSELECTは隔離されている {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="768" height="432" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

インサートはSELECTクエリから完全に隔離されており、挿入されたデータパーツのマージはバックグラウンドで行われ、同時クエリに影響を与えません。

## ストレージレイヤー: マージ時間の計算 {#storage-layer-merge-time-computation}

<iframe width="768" height="432" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

他のデータベースとは異なり、ClickHouseはすべての追加データ変換を[マージ](/merges)のバックグラウンドプロセス中に実行することで、データ書き込みを軽量かつ効率的に保っています。以下はその例です：

- **Replacing merges**は、入力パーツ内の行の最も最近のバージョンのみを保持し、他の行のバージョンをすべて破棄します。Replacing mergesは、マージ時間のクリーンアップ操作と考えることができます。

- **Aggregating merges**は、入力パーツ内の中間的な集計状態を新しい集計状態に結合します。これは理解が難しいように思えますが、実際には増分集計を実装しているだけです。

- **TTL (time-to-live) merges**は、特定の時間ベースのルールに基づいて行を圧縮、移動、または削除します。

これらの変換の目的は、ユーザーのクエリが実行される時間からマージ時間に作業（計算）をシフトさせることです。これには二つの理由があります：

一つ目は、ユーザーのクエリは「変換された」データ、すなわち事前に集計されたデータを活用できる場合、量的にかなり速くなる可能性があり、時には1000倍以上になることもあります。

二つ目は、マージの実行時間の大部分は、入力パーツの読み込みと出力パーツの保存に費やされます。したがって、マージ中にデータを変換する追加の努力は、通常、マージの実行時間にあまり影響を与えません。これらすべての魔法は完全に透明であり、クエリの結果（パフォーマンス以外）には影響を与えません。

## ストレージレイヤー: データのプルーニング {#storage-layer-data-pruning}

<iframe width="768" height="432" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

実際には、多くのクエリは、周期的に変更せずまたはわずかな変更（例えば異なるパラメータ値）で実行される繰り返しのものです。同じまたは類似のクエリを繰り返し実行することで、インデックスを追加したり、データを整理して、頻繁にクエリがアクセスできるようにすることができます。このアプローチは「データのプルーニング」とも呼ばれ、ClickHouseはそれに対して三つの技術を提供しています：

1. [主キーインデックス](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)は、テーブルデータのソート順序を定義します。適切に選択された主キーは、上記のクエリでのWHERE句のようなフィルタを高速な二分探索を使用して評価することを可能にします。技術的に言うと、スキャンの実行時間はデータサイズに対して線形ではなく対数的になります。

2. [テーブルプロジェクション](/sql-reference/statements/alter/projection)は、テーブルの代替の内部バージョンで、同じデータを保持しますが、異なる主キーでソートされています。プロジェクションは、頻繁に使用されるフィルタ条件が複数ある場合に便利です。

3. [スキッピングインデックス](/optimize/skipping-indexes)は、カラムに追加データ統計を埋め込んでいます。例えば、最小および最大カラム値、一意の値のセットなどです。スキッピングインデックスは主キーやテーブルプロジェクションとは独立しており、カラム内のデータ分布に応じてフィルタの評価を大幅に加速することができます。

これら三つの技術は、フルカラム読み出し中に可能な限り多くの行をスキップすることを目指しています。データを読み取る最も速い方法は、全く読む必要がないことです。

## ストレージレイヤー: データ圧縮 {#storage-layer-data-compression}

<iframe width="768" height="432" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

その上、ClickHouseのストレージレイヤーは（オプションで）異なるコーデックを使用して生のテーブルデータを圧縮します。

列ストアは、同じタイプとデータ分布の値が一緒に配置されるため、圧縮に特に適しています。

ユーザーは、カラムがさまざまな一般的な圧縮アルゴリズム（ZSTDなど）や、浮動小数点値用のGorillaやFPC、整数値用のDeltaやGCD、さらにはAESとしての暗号化コーデックを使用して圧縮されることを[指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)できます。

データ圧縮は、データベーステーブルのストレージサイズを削減するだけでなく、多くの場合、ローカルディスクやネットワークI/Oのスループットが低い場合にクエリパフォーマンスも向上させます。

## 最先端のクエリ処理レイヤー {#state-of-the-art-query-processing-layer}

最後に、ClickHouseは、すべてのリソースを最大速度と効率に活用するために、クエリ実行をできる限り並列化するベクトル化クエリ処理レイヤーを使用しています。

「ベクトル化」とは、クエリプランオペレーターが中間結果の行を単一行ではなくバッチで渡すことを意味します。これにより、CPUキャッシュの利用が向上し、オペレーターはSIMD命令を適用して同時に複数の値を処理できます。実際、多くのオペレーターは、各SIMD命令セットの世代ごとに一つのバージョンで提供されます。ClickHouseは、自動的に実行中のハードウェアの能力に基づいて最新で最速のバージョンを選択します。

現代のシステムは数十のCPUコアを持っています。すべてのコアを活用するために、ClickHouseはクエリプランを複数のレーンに展開し、通常はコアごとに一つのレーンがあります。各レーンはテーブルデータの非重複の範囲を処理します。そのため、データベースのパフォーマンスは、利用可能なコアの数で「垂直」にスケールします。

単一のノードがテーブルデータを保持するには小さすぎる場合、さらなるノードを追加してクラスターを構成できます。テーブルは「シャーディング」され、ノード間で分散できます。ClickHouseは、テーブルデータを保持しているすべてのノードでクエリを実行し、利用可能なノードの数で「水平」にスケールします。

## 細心の注意を払った設計 {#meticulous-attention-to-detail}

> **「ClickHouseは異常なシステムです。あなたたちは20種類のハッシュテーブルを持っています。ほとんどのシステムは1つのハッシュテーブルを持っているのに対し、あなたたちは驚くべき性能を持っています。なぜなら、非常に特化したコンポーネントがたくさんあるからです」** [Andy Pavlo, CMUのデータベース教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouseを[際立たせる](https://www.youtube.com/watch?v=CAS2otEoerM)のは、低レベルの最適化に対する細心の注意です。ただ単に動作するデータベースを構築することは簡単ですが、多様なクエリタイプ、データ構造、分布、インデックス設定において速度を実現するように工学することこそが、「[異常なシステム](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)」の技が輝くところです。

**ハッシュテーブル。** ハッシュテーブルを例に取ります。ハッシュテーブルは、結合や集計で使用される中心的なデータ構造です。プログラマーは、これらの設計上の決定を考慮する必要があります。

* 選択するハッシュ関数  
* 衝突解決: [オープンアドレス法](https://en.wikipedia.org/wiki/Open_addressing)または[チェイン法](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)  
* メモリレイアウト: キーと値のための1つの配列か、それとも別々の配列か  
* フィルファクター: いつ、どうやってサイズを変更するのか？サイズ変更時に値をどのように移動するのか？  
* 削除: ハッシュテーブルはエントリの排除を許可すべきか？

サードパーティのライブラリによって提供される標準的なハッシュテーブルは、機能的には機能しますが、高速ではありません。優れたパフォーマンスには細心のベンチマーキングと実験が必要です。

ClickHouseの[ハッシュテーブル実装](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions)は、クエリとデータの特性に基づいて30種類以上の事前コンパイルされたハッシュテーブルのバリエーションの中から一つを選びます。

**アルゴリズム。** アルゴリズムについても同様です。例えば、ソートにおいて考慮すべきこと：

* 何をソートするか: 数値、タプル、文字列、または構造か？  
* データはRAMにあるか？  
* ソートは安定している必要があるか？  
* すべてのデータをソートする必要があるか、部分的なソートで十分か？

データ特性に依存するアルゴリズムは、一般的なアルゴリズムよりもよく機能します。データ特性が事前にわからない場合、システムはさまざまな実装を試み、実行時に最も適しているものを選択できます。たとえば、ClickHouseにおけるLZ4デコンプレッション実装に関する[記事](https://habr.com/en/company/yandex/blog/457612/)を参照してください。

## VLDB 2024の論文 {#vldb-2024-paper}

2024年8月、私たちは最初の研究論文がVLDBに受理され、出版されました。VLDBは非常に大型データベースに関する国際会議であり、データ管理の分野で最も権威のある会議の一つと広く見なされています。数百件の投稿の中で、VLDBの受理率は一般的に約20%です。

ClickHouseの最も興味深いアーキテクチャおよびシステム設計コンポーネントがなぜこれほど速いのかについて簡潔に説明した[PDF論文](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)を読むことができます。

我々のCTOでありClickHouseの創設者であるAlexey Milovidovが論文を発表しました（スライドは[こちら](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)）、その後Q&Aセッションが行われました（すぐに時間がなくなりました！）。プレゼンテーションの録画は以下で見ることができます：

<iframe width="768" height="432" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
