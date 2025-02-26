---
sidebar_position: 1
sidebar_label: ClickHouseはなぜこんなにも速いのか？
description: "高速化を目的として設計されました。クエリ実行性能は、開発プロセスにおいて常に最優先事項でしたが、ユーザーフレンドリーさ、スケーラビリティ、セキュリティなどの重要な特性も考慮され、ClickHouseが実際のプロダクションシステムとなることができました。"
---

# ClickHouseはなぜこんなにも速いのか？ {#why-clickhouse-is-so-fast}

データベースの性能には、[データの方向性](/intro#row-oriented-vs-column-oriented-storage)以外にも多くの要因が寄与します。
次に、ClickHouseが他の列指向データベースと比較して特に速い理由を詳細に説明します。

アーキテクチャの観点から、データベースは（少なくとも）ストレージ層とクエリ処理層で構成されています。ストレージ層はテーブルデータの保存、読み込み、維持を担当し、クエリ処理層はユーザークエリを実行します。他のデータベースと比較して、ClickHouseは両方の層で革新を提供し、非常に高速な挿入とSelectクエリを実現しています。

## ストレージ層：並行挿入が相互に隔離される {#storage-layer-concurrent-inserts-are-isolated-from-each-other}

<iframe width="768" height="432" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickHouseでは、各テーブルは複数の「テーブルパーツ」で構成されています。[パート](/parts)は、ユーザーがテーブルにデータを挿入するたびに（INSERT文）作成されます。クエリは常に、クエリが開始される時点で存在するすべてのテーブルパーツに対して実行されます。

過度に多くのパーツが蓄積されないように、ClickHouseはバックグラウンドで[マージ](/merges)操作を実行し、複数の小さなパーツを単一の大きなパーツに継続的に統合します。

このアプローチにはいくつかの利点があります。すべてのデータ処理を[バックグラウンドのパートマージにオフロード](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)することで、データの書き込みを軽量かつ高度に効率的に保つことができます。個々の挿入は「ローカル」であり、つまりグローバルな、すなわちテーブル毎のデータ構造を更新する必要がありません。その結果、複数の同時挿入は相互に同期する必要がなく、既存のテーブルデータとの同期も不要なため、挿入はディスクI/Oの速度でほぼ実行できるようになります。

## ストレージ層：並行挿入とSelectは相互に隔離される {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="768" height="432" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

挿入はSELECTクエリから完全に隔離されており、挿入したデータパーツのマージは、同時クエリに影響を与えずにバックグラウンドで行われます。

## ストレージ層：マージ時間の計算 {#storage-layer-merge-time-computation}

<iframe width="768" height="432" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

他のデータベースとは異なり、ClickHouseはすべての追加データ変換を[マージ](/merges)のバックグラウンドプロセスで実行することにより、データの書き込みを軽量かつ効率的に保っています。このような変換には以下が含まれます：

- **置き換えマージ**は、入力パーツ内の行の最新のバージョンのみを保持し、他のすべての行のバージョンを破棄します。置き換えマージは、マージ時のクリーンアップ操作と考えることができます。

- **集約マージ**は、入力パーツ内の中間集約状態を新しい集約状態に結合します。これは直感的には理解しにくいですが、実際には増分集約を実装しているに過ぎません。

- **TTL (有効期限) マージ**は、特定の時間ベースの規則に基づいて行を圧縮、移動、または削除します。

これらの変換の目的は、ユーザークエリの実行時からマージ時間への作業（計算）をシフトすることです。これは次の二つの理由で重要です：

一つには、ユーザークエリは「変換された」データ、例えば、事前に集約されたデータを活用することができれば、時に1000倍以上も速くなります。

もう一つには、マージの実行時間の大半は、入力パーツの読み込みと出力パーツの保存に費やされます。マージ中のデータ変換の追加作業は、通常、マージの実行時間にあまり影響を与えません。このすべての魔法は完全に透明であり、クエリの結果（性能を除く）には影響を与えません。

## ストレージ層：データのプルーニング {#storage-layer-data-pruning}

<iframe width="768" height="432" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

実際には、多くのクエリが繰り返し実行されます。つまり、元のまま、またはわずかな変更（例えば異なるパラメータ値）で定期的に実行されます。同じまたは類似のクエリを繰り返し実行することにより、インデックスの追加やデータの再編成を行い、頻繁にクエリにアクセスするのを早くすることができます。このアプローチは「データのプルーニング」としても知られており、ClickHouseはそのために3つの手法を提供します：

1. [主キーインデックス](/optimize/sparse-primary-indexes)は、テーブルデータのソート順を定義します。適切に選定された主キーにより、フィルター（上記クエリのWHERE句のような）を迅速な二分探索を使用して評価できます。技術的に言えば、スキャンの実行時間はデータサイズに対して線形ではなく対数にします。

2. [テーブルプロジェクション](/sql-reference/statements/alter/projection)は、異なる主キーでソートされた同じデータを保存するテーブルの代替内部バージョンです。複数の頻繁なフィルター条件がある場合に便利です。

3. [スキッピングインデックス](/optimize/skipping-indexes)は、カラムに追加のデータ統計を埋め込みます。例えば、最小および最大のカラム値、一意の値のセットなどです。スキッピングインデックスは主キーやテーブルプロジェクションに対して独立しており、カラム内のデータ分布に応じてフィルターの評価を大幅に加速できます。

これら3つの手法は、フルカラムリード中にできるだけ多くの行をスキップすることを目的としています。なぜなら、データを読む最も速い方法は、データを全く読まないことだからです。

## ストレージ層：データ圧縮 {#storage-layer-data-compression}

<iframe width="768" height="432" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

さらに、ClickHouseのストレージ層は、異なるコーデックを使用して生のテーブルデータを追加的（かつオプションで）圧縮します。

列ストアは、同じタイプとデータ分布の値が一緒に配置されているため、圧縮に特に適しています。

ユーザーは、さまざまな汎用圧縮アルゴリズム（ZSTDなど）や、浮動小数点値用のGorillaやFPC、整数値用のDeltaやGCD、さらにはAESのような暗号化コーデックを使用してカラムを圧縮するように[指定する](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)ことができます。

データ圧縮は、データベーステーブルのストレージサイズを縮小するだけでなく、多くの場合、ローカルディスクやネットワークI/Oが低スループットに制約されるため、クエリ性能も向上させます。

## 最先端のクエリ処理層 {#state-of-the-art-query-processing-layer}

最後に、ClickHouseはクエリの実行を可能な限り並列化するベクトル化されたクエリ処理層を使用し、最大の速度と効率のためにすべてのリソースを活用します。

「ベクトル化」とは、クエリプランオペレーターが、単一の行ではなくバッチで中間結果行を渡すことを意味します。これにより、CPUキャッシュの利用が向上し、オペレーターはSIMD命令を適用して複数の値を一度に処理することができます。実際、多くのオペレーターは、SIMD命令セット世代ごとに1つずつのバージョンを持っています。ClickHouseは実行されるハードウェアの能力に基づいて、最新かつ最速のバージョンを自動的に選択します。

現代のシステムには数十のCPUコアがあります。すべてのコアを利用するために、ClickHouseはクエリプランを複数のレーンに展開します。通常、一つのコアごとにレーンがあります。それぞれのレーンは、テーブルデータの非重複範囲を処理します。この仕組みにより、データベースの性能は利用可能なコアの数に応じて「垂直的」にスケールします。

単一のノードがテーブルデータを保持するには小さすぎる場合は、さらなるノードを追加してクラスターを形成することができます。テーブルを「シャーディング」してノード間に分散させることが可能です。ClickHouseはテーブルデータを保存するすべてのノードでクエリを実行し、利用可能なノードの数に応じて「水平的」にスケールします。

## 細部への徹底したこだわり {#meticulous-attention-to-detail}

> **"ClickHouseは型破りなシステムです - あなたたちには20バージョンのハッシュテーブルがあります。あなたたちにはほとんどのシステムが持つ1つのハッシュテーブルを超えた素晴らしいものがあります...ClickHouseは専門的なコンポーネントを備えているため、この驚くべきパフォーマンスを誇ります"** [アンドリュー・パブロ、CMUのデータベース教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouseを[際立たせる](https://www.youtube.com/watch?v=CAS2otEoerM)のは、その低レベル最適化への細部への徹底したこだわりです。単に動作するデータベースを構築することは一つのことであり、さまざまなクエリタイプ、データ構造、分布、およびインデックス構成のパフォーマンスを向上させるように設計することは、「[型破りなシステム](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)」の芸術で光ります。

  
**ハッシュテーブル。** ハッシュテーブルを例にとりましょう。ハッシュテーブルは、結合や集約で使用される中心的なデータ構造です。プログラマーとしては、これらの設計上の決定を考慮する必要があります：

* 選択するハッシュ関数、  
* 衝突解決： [オープンアドレッシング](https://en.wikipedia.org/wiki/Open_addressing) あるいは [チェイニング](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)、  
* メモリレイアウト：キーと値のための1つの配列または別々の配列？  
* フィルファクター：いつ、どのようにサイズ変更するか？サイズ変更中に値をどのように移動するか？  
* 削除：ハッシュテーブルはエントリの排除を許可するべきか？

サードパーティライブラリが提供する標準的なハッシュテーブルは機能的に動作しますが、速くはありません。優れたパフォーマンスには、徹底したベンチマーキングと実験が必要です。

[ClickHouseにおけるハッシュテーブル実装](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions)では、クエリとデータの具体的な内容に基づいて、**30以上の事前コンパイルされたハッシュテーブルバリアントの中から選択します**。

**アルゴリズム。** アルゴリズムについても同様です。例えば、ソートにおいて考慮すべきことは：

* ソートされるのは何か：数字、タプル、文字列、または構造体か？  
* データはRAMにあるか？  
* ソートは安定している必要があるか？  
* すべてのデータをソートするか、それとも部分的なソートで十分か？

データ特性に依存するアルゴリズムは、一般的なアルゴリズムよりも優れた性能を発揮することがあります。データ特性が事前にわからない場合、システムはさまざまな実装を試み、実行時に最も効果的なものを選択することができます。具体的な例として、[ClickHouseにおけるLZ4デコンプレッションの実装に関する記事](https://habr.com/en/company/yandex/blog/457612/)を参照してください。

## VLDB 2024 論文 {#vldb-2024-paper}

2024年8月に、私たちは初めての研究論文がVLDBで受理され、掲載されました。 
VLDBは非常に大きなデータベースに関する国際会議であり、データ管理分野でのトップカンファレンスの一つとして広く認識されています。 
何百もの応募の中で、VLDBは一般的に約20％の受理率を誇ります。

ClickHouseの最も興味深いアーキテクチャとシステム設計コンポーネントの簡潔な説明を提供する[PDF論文](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)を読むことができます。

Alexey Milovidov、私たちのCTOでありClickHouseの創造者がこの論文を発表しました（スライドは[こちら](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)）。その後Q&Aセッションがありましたが、すぐに時間切れになってしまいました！ 
録画されたプレゼンテーションをご覧になるには、以下をクリックしてください：

<iframe width="768" height="432" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
