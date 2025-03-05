---
sidebar_position: 1
sidebar_label: ClickHouseはなぜそんなに速いのか？
description: "ClickHouseは高速であるように設計されました。クエリの実行パフォーマンスは開発プロセスにおいて常に最優先事項でしたが、ユーザーフレンドリーさ、スケーラビリティ、セキュリティなどの他の重要な特性も考慮され、ClickHouseが本物のプロダクションシステムになることができました。"
---


# ClickHouseはなぜそんなに速いのか？ {#why-clickhouse-is-so-fast}

他の要因も、データベースのパフォーマンスに寄与しています。通常、[データの配置](/intro#row-oriented-vs-column-oriented-storage)によるものです。次に、ClickHouseが特に他の列指向データベースと比較してなぜそんなに速いのかを詳細に説明します。

アーキテクチャの観点から見ると、データベースは（少なくとも）ストレージレイヤーとクエリ処理レイヤーで構成されています。ストレージレイヤーはテーブルデータの保存、ロード、維持を担当し、クエリ処理レイヤーはユーザーのクエリを実行します。ClickHouseは、非常に迅速な挿入とSELECTクエリを可能にする両方のレイヤーに革新を提供します。

## ストレージレイヤー: 同時挿入は相互に隔離されている {#storage-layer-concurrent-inserts-are-isolated-from-each-other}

<iframe width="768" height="432" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickHouseでは、各テーブルは複数の「テーブルパーツ」で構成されています。ユーザーがデータをテーブルに挿入するたび（INSERT文）、[パート](/parts)が作成されます。クエリは常に、クエリが開始した時点で存在するすべてのテーブルパーツに対して実行されます。

多くのパーツが蓄積されないように、ClickHouseはバックグラウンドで[マージ](/merges)操作を実行し、複数の小さなパーツを1つの大きなパーツに継続的に結合します。

このアプローチにはいくつかの利点があります：すべてのデータ処理は[バックグラウンドマージ計算](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)にオフロードでき、データ書き込みを軽量かつ非常に効率的に保つことができます。個々の挿入操作は「ローカル」として扱われ、グローバル、すなわちテーブルごとのデータ構造を更新する必要がありません。その結果、複数の同時挿入は互いに同期する必要がなく、既存のテーブルデータとの同期も不要であるため、挿入はディスクI/Oの速度に近い速度で実行できます。

 VLDB論文の全体的なパフォーマンス最適化セクション。

🤿 これについては、私たちのVLDB 2024論文の[オンディスクフォーマット](/docs/academic_overview#3-1-on-disk-format)のセクションで深掘りしています。

## ストレージレイヤー: 同時挿入と選択は隔離されている {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="768" height="432" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

挿入はSELECTクエリから完全に隔離されており、挿入されたデータパーツのマージはバックグラウンドで行われ、同時クエリに影響を与えません。

🤿 これについては、私たちのVLDB 2024論文の[ストレージレイヤー](/docs/academic_overview#3-storage-layer)のセクションで深掘りしています。

## ストレージレイヤー: マージ時の計算 {#storage-layer-merge-time-computation}

<iframe width="768" height="432" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

他のデータベースとは異なり、ClickHouseはすべての追加のデータ変換を[マージ](/merges)バックグラウンドプロセス中に行うことで、データ書き込みを軽量かつ効率的に保っています。これに含まれる例は次のとおりです：

- **置き換えマージ**：入力パーツにおいて行の最新バージョンのみを保持し、他のすべての行バージョンを破棄します。置き換えマージは、マージ時のクリーンアップ操作と考えることができます。

- **集約マージ**：入力パーツ内の中間的な集約状態を新しい集約状態に結合します。これは理解するのが難しいように思えるかもしれませんが、実際にはインクリメンタル集約を実装しているだけです。

- **TTL（有効期限）マージ**：特定の時間ベースのルールに基づいて、行を圧縮、移動、または削除します。

これらの変換の目的は、ユーザーのクエリが実行される時間からマージ時間に作業（計算）を移すことです。これは2つの理由から重要です：

一方では、ユーザーのクエリは、変換されたデータ、たとえば事前に集約されたデータを利用できる場合、時には1000倍以上速くなることがあります。

他方では、マージのランタイムの大部分は、入力パーツのロードと出力パーツの保存に消費されます。マージ中のデータ変換の追加の手間は、通常、マージのランタイムにあまり影響を与えません。これらすべての魔法は完全に透明であり、クエリの結果には（パフォーマンスを除いて）影響を与えません。

🤿 これについては、私たちのVLDB 2024論文の[マージ時のデータ変換](/docs/academic_overview#3-3-merge-time-data-transformation)のセクションで深掘りしています。

## ストレージレイヤー: データのプルーニング {#storage-layer-data-pruning}

<iframe width="768" height="432" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

実際には、多くのクエリが繰り返し実行されます。つまり、定期的に変わらず、またはわずかな修正（例：異なるパラメーター値）で実行されます。同じまたは類似のクエリを何度も実行することで、インデックスを追加したり、頻繁にクエリされるデータに対して、より迅速にアクセスできるようにデータを再構成したりできます。このアプローチは「データプルーニング」としても知られており、ClickHouseはこれに3つの技術を提供します：

1. [主キーインデックス](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)：テーブルデータのソート順を定義します。適切に選択された主キーは、上記のクエリでのWHERE句のようなフィルタを、全カラムスキャンではなく高速な二分探索を使用して評価することを可能にします。より技術的には、スキャンのランタイムはデータサイズに対して線形ではなく対数的になります。

2. [テーブルプロジェクション](/sql-reference/statements/alter/projection)：同じデータを保持しながら、異なる主キーでソートされたテーブルの代替内部バージョンです。プロジェクションは、複数の頻繁なフィルタ条件がある場合に有用です。

3. [スキッピングインデックス](/optimize/skipping-indexes)：カラムに最小および最大のカラム値、ユニーク値のセットなどの追加のデータ統計を埋め込むインデックスです。スキッピングインデックスは主キーやテーブルプロジェクションとは無関係で、カラム内のデータ分布に応じてフィルタの評価を大幅に高速化できます。

これら3つの技術はすべて、フルカラム読み込み中にできるだけ多くの行をスキップすることを目的としており、データを読む最速の方法は、全く読まないことです。

🤿 これについては、私たちのVLDB 2024論文の[データプルーニング](/docs/academic_overview#3-2-data-pruning)のセクションで深掘りしています。

## ストレージレイヤー: データ圧縮 {#storage-layer-data-compression}

<iframe width="768" height="432" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

そのほかに、ClickHouseのストレージレイヤーは、さまざまなコーデックを使用して生のテーブルデータを追加（およびオプションで）圧縮します。

列ストアは、同じタイプの値とデータ分布がまとめて配置されるため、そのような圧縮に特に適しています。

ユーザーは、カラムがさまざまな一般的な圧縮アルゴリズム（たとえばZSTD）または浮動小数点値用のGorillaおよびFPC、整数値用のDeltaおよびGCD、または暗号化コーデックとしてのAESなどの特別なコーデックを使用して圧縮されるように[指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)できます。

データ圧縮は、データベーステーブルのストレージサイズを減少させるだけでなく、多くの場合、クエリパフォーマンスを向上させることもあります。なぜなら、ローカルディスクやネットワークI/Oはしばしば低スループットによって制約されるからです。

🤿 これについては、私たちのVLDB 2024論文の[オンディスクフォーマット](/docs/academic_overview#3-1-on-disk-format)のセクションで深掘りしています。

## 最先端のクエリ処理レイヤー {#state-of-the-art-query-processing-layer}

最後に、ClickHouseはベクトル化されたクエリ処理レイヤーを使用し、クエリ実行を可能な限り並列化して速度と効率を最大化するために、すべてのリソースを利用します。

「ベクトル化」とは、クエリプランオペレーターが中間結果の行を単一行ではなくバッチで渡すことを意味します。これにより、CPUキャッシュの利用が向上し、オペレーターがSIMD命令を適用して複数の値を同時に処理できるようになります。実際、多くのオペレーターはSIMD命令セット生成ごとに1つずつ複数のバージョンで提供されます。ClickHouseは、実行されているハードウェアの能力に基づいて、最も新しいかつ最速のバージョンを自動的に選択します。

現代のシステムには数十のCPUコアがあります。すべてのコアを活用するために、ClickHouseはクエリプランを複数のレーンに展開し、通常は1コアにつき1レーンを使用します。各レーンはテーブルデータの不連続な範囲を処理します。このようにして、データベースのパフォーマンスは利用可能なコアの数に対して「垂直的」にスケールします。

単一ノードがテーブルデータを保持するには小さすぎる場合、さらなるノードを追加してクラスタを形成できます。テーブルは分割（「シャード」）され、ノード全体に分散されます。ClickHouseはテーブルデータを保持するすべてのノードでクエリを実行し、その結果、利用可能なノードの数に対して「水平的」にスケールします。

🤿 これについては、私たちのVLDB 2024論文の[クエリ処理レイヤー](/academic_overview#4-query-processing-layer)のセクションで深掘りしています。

## 細部への徹底した注意 {#meticulous-attention-to-detail}

> **「ClickHouseはフリークなシステムです - あなたたちは20のバージョンのハッシュテーブルを持っています。最も多くのシステムが1つのハッシュテーブルしか持っていない素晴らしいことを持っています…ClickHouseがこれほど素晴らしいパフォーマンスを持つのは、このスぺシャライズされたコンポーネントのすべてを持っているからです」** [Andy Pavlo、CMUのデータベース教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouseを[際立たせる](https://www.youtube.com/watch?v=CAS2otEoerM)のは、低レベルの最適化に対する徹底した注意です。ただ単に機能するデータベースを構築することは一つのことですが、多様なクエリタイプ、データ構造、分布、インデックス構成にわたってスピードを提供するように設計することが、「[フリークなシステム](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)」芸術の光を放ちます。

  
**ハッシュテーブル。** ハッシュテーブルを例に取りましょう。ハッシュテーブルは、結合や集約に使用される中心的なデータ構造です。プログラマーとしては、これらの設計決定を考慮する必要があります：

* 選択するハッシュ関数、  
* 衝突解決： [オープンアドレッシング](https://en.wikipedia.org/wiki/Open_addressing)または[チェイン法](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)、  
* メモリレイアウト：キーと値のための1つの配列または別々の配列？  
* フィルファクター：いつ、どのようにサイズ変更するか？サイズ変更中に値をどのように移動するか？  
* 削除：ハッシュテーブルはエントリを排除することを許可すべきか？

サードパーティライブラリによって提供される標準的なハッシュテーブルは機能的には動作しますが、速くはありません。素晴らしいパフォーマンスには徹底したベンチマーキングと実験が必要です。

ClickHouseの[ハッシュテーブル実装](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions)は、クエリとデータの特性に基づいて、**30以上の事前コンパイルされたハッシュテーブルバリアントのいずれかを選択**します。

**アルゴリズム。** アルゴリズムについても同様です。たとえば、ソートにおいて考慮すべき項目は以下の通りです：

* 何がソートされるのか：数値、タプル、文字列、または構造体？  
* データはRAM内に存在するか？  
* ソートは安定している必要があるか？  
* すべてのデータをソートする必要があるのか、それとも部分的なソートで足りるのか？

データの特性に依存するアルゴリズムは、一般的なアルゴリズムよりも性能が良いことがよくあります。データの特性が事前に知られていない場合、システムはさまざまな実装を試み、ランタイムで最も適したものを選択できます。例として、ClickHouseにおける[LZ4デコンプレッサーの実装方法に関する記事](https://habr.com/en/company/yandex/blog/457612/)を参照してください。

🤿 これについては、私たちのVLDB 2024論文の[全体的なパフォーマンス最適化](/academic_overview#4-4-holistic-performance-optimization)のセクションで深掘りしています。

## VLDB 2024論文 {#vldb-2024-paper}

2024年8月、私たちは最初の研究論文がVLDBで受理されて出版されました。 
VLDBは非常に大きなデータベースに関する国際会議であり、データ管理分野での主要な会議の1つと広く見なされています。 
何百もの応募の中で、VLDBの承認率は一般的に約20%です。

[論文のPDF](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)または、ClickHouseの最も興味深いアーキテクチャとシステム設計コンポーネントを簡潔に説明する[ウェブ版](/docs/academic_overview)を読むことができます。

当社のCTOでありClickHouseの創設者であるAlexey Milovidovが論文を発表しました（スライドは[こちら](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)）、その後のQ&Aセッションも行われましたが、すぐに時間がなくなってしまいました。 
記録されたプレゼンテーションは以下でご覧いただけます： 

<iframe width="768" height="432" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
