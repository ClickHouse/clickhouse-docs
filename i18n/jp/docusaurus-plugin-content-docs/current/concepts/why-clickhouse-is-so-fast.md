---
'sidebar_position': 1
'sidebar_label': 'ClickHouse はなぜ高速なのか？'
'description': 'それは速さを目指して設計されました。クエリの実行パフォーマンスは常に開発プロセスの中で最優先事項でしたが、使いやすさ、拡張性、セキュリティなどの他の重要な特性も考慮され、ClickHouse
  が実際のプロダクションシステムになることができました。'
'title': 'ClickHouse はなぜ高速なのか？'
'slug': '/concepts/why-clickhouse-is-so-fast'
---




# Why is ClickHouse so fast? {#why-clickhouse-is-so-fast}

多くの他の要因が、データベースのパフォーマンスに寄与していますが、[そのデータの向き](/intro#row-oriented-vs-column-oriented-storage) もその一つです。次に、ClickHouseが特に他の列指向データベースと比較した場合に非常に速い理由について詳しく説明します。

アーキテクチャの観点から、データベースは（少なくとも）ストレージ層とクエリ処理層で構成されています。ストレージ層はテーブルデータの保存、読み込み、管理を担当し、クエリ処理層はユーザークエリを実行します。他のデータベースと比較して、ClickHouseは両方の層で革新を提供しており、非常に速い挿入とSELECTクエリを可能にしています。

## Storage Layer: Concurrent inserts are isolated from each other {#storage-layer-concurrent-inserts-are-isolated-from-each-other}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickHouseでは、各テーブルは複数の「テーブルパーツ」で構成されています。ユーザーがデータをテーブルに挿入するたびに（INSERT文）、[パート](/parts) が作成されます。クエリは常に、クエリが開始する時点で存在するすべてのテーブルパーツに対して実行されます。

あまり多くのパーツが蓄積しないように、ClickHouseはバックグラウンドで[マージ](/merges) 操作を実行し、複数の小さなパーツを単一の大きなパーツに継続的に結合します。

このアプローチにはいくつかの利点があります。すべてのデータ処理を[バックグラウンドパートマージにオフロード](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation) できるため、データの書き込みが軽量で非常に効率的になります。個々のインサートは、「ローカル」なものであり、グローバル、すなわちテーブルごとのデータ構造を更新する必要がありません。その結果、複数の同時挿入は相互同期や既存のテーブルデータとの同期を必要とせず、挿入はほぼディスクI/Oの速度で実行できます。

 VLDB論文の包括的なパフォーマンス最適化セクション。

🤿 これは、私たちのVLDB 2024論文のウェブ版の[ディスク上フォーマット](/academic_overview#3-1-on-disk-format)セクションで詳しく述べています。

## Storage Layer: Concurrent inserts and selects are isolated {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

挿入はSELECTクエリから完全に隔離されており、挿入されたデータパーツのマージは、同時クエリに影響を与えることなくバックグラウンドで行われます。

🤿 これは、私たちのVLDB 2024論文のウェブ版の[ストレージ層](/academic_overview#3-storage-layer)セクションで詳しく述べています。

## Storage Layer: Merge-time computation {#storage-layer-merge-time-computation}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickHouseは、他のデータベースとは異なり、すべての追加データ変換をバックグラウンドプロセスである[マージ](/merges)中に行うことで、データの書き込みを軽量で効率的に保ちます。これには以下の例が含まれます：

- **Replacing merges** は、入力パーツ内の行の最も最近のバージョンのみを保持し、他の行バージョンは破棄します。Replacing mergesは、マージ時のクリーニング操作と考えることができます。

- **Aggregating merges** は、入力部分の中間集計状態を新しい集計状態に結合します。これは理解するのが難しいように見えますが、実際には単に増分集計を実装しています。

- **TTL (time-to-live) merges** は、特定の時間ベースのルールに基づいて行を圧縮、移動、または削除します。

これらの変換の目的は、ユーザークエリが実行される時間からマージ時間へ作業（計算）を移すことです。これは次の2つの理由で重要です：

一方では、ユーザークエリが「変換された」データ、例えば事前集約されたデータを利用できる場合、クエリが大幅に速くなる可能性があります。時には1000倍以上です。

他方では、マージのランタイムの大部分が入力パーツの読み込みと出力パーツの保存に消費されます。マージ中のデータ変換のための追加の努力は、通常、マージのランタイムにあまり影響しません。これらすべてのマジックは完全に透明であり、クエリの結果に影響を与えることはありません（性能を除いて）。

🤿 これは、私たちのVLDB 2024論文のウェブ版の[マージ時間データ変換](/academic_overview#3-3-merge-time-data-transformation)セクションで詳しく述べています。

## Storage Layer: Data pruning {#storage-layer-data-pruning}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

実際には、多くのクエリが反復的であり、すなわち、変わらないか、わずかに変更して（例えば、異なるパラメータ値で）定期的に実行されます。同じまたは類似のクエリを何度も実行することで、インデックスを追加したり、頻繁なクエリがより速くアクセスできるようにデータを再整理したりできます。このアプローチは「データプルーニング」としても知られ、ClickHouseは以下の3つの技術を提供します：

1. [主キーインデックス](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design) は、テーブルデータのソート順を定義します。適切に選択された主キーは、上記のクエリのWHERE文のようなフィルタを、フルカラムスキャンの代わりに高速なバイナリサーチを使用して評価できます。より技術的な用語で言えば、スキャンのランタイムはデータサイズに対して線形ではなく対数になります。

2. [テーブルプロジェクション](/sql-reference/statements/alter/projection) は、異なる主キーでソートされた同じデータを保存するテーブルの内部バージョンとしての代替です。プロジェクションは、頻繁なフィルタ条件が1つ以上ある場合に便利です。

3. [スキッピングインデックス](/optimize/skipping-indexes) は、カラム内に追加のデータ統計を埋め込むもので、例えば最小および最大のカラム値、一意な値のセットなどがあります。スキッピングインデックスは主キーおよびテーブルプロジェクションとは直交しており、カラム内のデータ分布によっては、フィルタの評価を大幅に高速化できます。

これら3つの技術の目的は、フルカラムリード中にできるだけ多くの行をスキップすることであり、データを読み込む最も速い方法は、データをまったく読み込まないことです。

🤿 これは、私たちのVLDB 2024論文のウェブ版の[データプルーニング](/academic_overview#3-2-data-pruning)セクションで詳しく述べています。

## Storage Layer: Data compression {#storage-layer-data-compression}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

また、ClickHouseのストレージ層は、異なるコーデックを使用して生のテーブルデータを追加的に（かつオプションで）圧縮します。

列ストアは、そのタイプとデータ分布が同じ値が一緒に配置されるため、このような圧縮に特に適しています。

ユーザーは、[指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema) することができ、カラムはさまざまな一般的な圧縮アルゴリズム（例：ZSTD）や、浮動小数点値用のGorillaやFPC、整数値用のDeltaやGCD、さらにはAESの暗号化コーデックを使用して圧縮されます。

データ圧縮は、データベーステーブルのストレージサイズを減少させるだけでなく、多くの場合、ローカルディスクやネットワークI/Oのスループットが低いため、クエリのパフォーマンスも向上させます。

🤿 これは、私たちのVLDB 2024論文のウェブ版の[ディスク上フォーマット](/academic_overview#3-1-on-disk-format)セクションで詳しく述べています。

## State-of-the-art query processing layer {#state-of-the-art-query-processing-layer}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/O5qecdQ7Y18?si=XVtOIuVd8NLbqyox" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

最後に、ClickHouseはベクトル化されたクエリ処理層を使用しており、クエリの実行を可能な限り並列化して、すべてのリソースを最大の速度と効率のために利用しています。

「ベクトル化」とは、クエリプランオペレーターが単一の行ではなく、バッチで中間結果行を渡すことを意味します。これにより、CPUキャッシュの利用が改善され、オペレーターは数値を同時に処理するためにSIMD命令を適用できます。実際、多くのオペレーターは、各SIMD命令セット世代ごとに1つのバージョンを持っています。ClickHouseは、実行されているハードウェアの能力に基づいて、最も最近で最速のバージョンを自動的に選択します。

現代のシステムには数十のCPUコアがあります。すべてのコアを利用するために、ClickHouseはクエリプランを複数のレーンに展開します。通常、1つのコアにつき1つのレーンです。各レーンはテーブルデータの不重複範囲を処理します。こうすることで、データベースのパフォーマンスは利用可能なコアの数に「垂直」にスケールします。

もし単一ノードがテーブルデータを保持するには小さすぎる場合、さらにノードを追加してクラスターを形成できます。テーブルは分割（「シャード」）でき、ノード間で分散されます。ClickHouseはテーブルデータを保存するすべてのノードでクエリを実行し、利用可能なノードの数に「水平」にスケールします。

🤿 これは、私たちのVLDB 2024論文のウェブ版の[クエリ処理層](/academic_overview#4-query-processing-layer)セクションで詳しく述べています。

## Meticulous attention to detail {#meticulous-attention-to-detail}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dccGLSuYWy0?si=rQ-Jp-z5Ik_-Rb8S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> **"ClickHouseは異常なシステムです - あなたたちは20種類のハッシュテーブルを持っています。あなたたちはほとんどのシステムが持つことのない、すべての素晴らしいものを持っています** **...** **ClickHouseの素晴らしいパフォーマンスは、すべてのこれらの専門的なコンポーネントによるものです"** [Andy Pavlo, Database Professor at CMU](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouseを[特徴付ける](https://www.youtube.com/watch?v=CAS2otEoerM)のは、低レベルの最適化に対する綿密な注意です。単に動作するデータベースを構築することは一つのことですが、多様なクエリタイプ、データ構造、分布、およびインデックス構成にわたって速度を提供するようにエンジニアリングすることこそが、「[異常なシステム](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)」の芸術が輝くところです。

**ハッシュテーブル。** ハッシュテーブルを例に取ってみましょう。ハッシュテーブルは、ジョインや集約で使用される中心的なデータ構造です。プログラマーとして、次のような設計決定を考慮する必要があります：

* 選択するハッシュ関数、
* 衝突解決： [オープンアドレッシング](https://en.wikipedia.org/wiki/Open_addressing) または [チェイニング](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)、
* メモリレイアウト：キーと値のための1つの配列または別々の配列？
* フィルファクター：いつ、どのようにサイズを変更すべきか？サイズ変更中に値をどのように移動させるか？
* 削除：ハッシュテーブルはエントリを排除することを許可すべきか？

サードパーティライブラリによって提供された標準的なハッシュテーブルは機能的には動作しますが、高速ではありません。優れたパフォーマンスを発揮するには、綿密なベンチマークテストと実験が必要です。

[ClickHouseのハッシュテーブルの実装](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions) は、クエリとデータの特性に基づいて、 **30以上のあらかじめコンパイルされたハッシュテーブルのバリアント** の中から1つを選択します。

**アルゴリズム。** アルゴリズムも同様です。たとえば、ソートに関して考慮すべきことは：

* 何をソートするのか：数値、タプル、文字列、または構造体？
* データはRAMに存在するか？
* ソートは安定している必要があるか？
* すべてのデータをソートする必要があるのか、それとも部分的なソートで十分か？

データ特性に依存するアルゴリズムは、一般的なアルゴリズムよりも優れたパフォーマンスを発揮することがよくあります。データ特性が事前に分からない場合、システムはさまざまな実装を試して、その時点で最も効果的なものを選択できます。例として、[ClickHouseにおけるLZ4デコンプレッションの実装についての論文](https://habr.com/en/company/yandex/blog/457612/)を参照してください。

🤿 これは、私たちのVLDB 2024論文のウェブ版の[包括的なパフォーマンス最適化](/academic_overview#4-4-holistic-performance-optimization)セクションで詳しく述べています。

## VLDB 2024 paper {#vldb-2024-paper}

2024年8月、私たちは初めての研究論文がVLDBに受理され、公開されました。
VLDBは非常に大規模なデータベースに関する国際会議であり、データ管理の分野でリーディングカンファレンスの一つと広く見なされています。
数百件の投稿の中から、VLDBは一般的に約20％の受理率を持っています。

論文の[PDF](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)や、ClickHouseの最も興味深いアーキテクチャやシステム設計コンポーネントを簡潔に説明する[ウェブ版](/academic_overview)を読むことができます。

私たちのCTOでありClickHouseの創設者であるAlexey Milovidovが論文を発表しました（スライドは[こちら](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)）その後、Q&Aが行われました（すぐに時間切れになりました！）。
録画されたプレゼンテーションはこちらで確認できます：

<iframe width="1024" height="576" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
