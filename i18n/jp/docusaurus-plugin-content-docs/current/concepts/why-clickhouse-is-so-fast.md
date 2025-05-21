---
sidebar_position: 1
sidebar_label: 'なぜ ClickHouse はこれほど速いのか？'
description: '速くなるように設計されています。クエリ実行性能は常に開発プロセスのトッププライオリティでしたが、ClickHouse が実際の生産システムになれるように、使いやすさ、スケーラビリティ、セキュリティなどのその他の重要な特性も考慮されていました。'
title: 'なぜ ClickHouse はこれほど速いのか？'
slug: /concepts/why-clickhouse-is-so-fast
---
```


# なぜ ClickHouse はこれほど速いのか？ {#why-clickhouse-is-so-fast}

データベースのパフォーマンスには、[データ指向性](/intro#row-oriented-vs-column-oriented-storage)以外にも多くの要因が寄与しています。次に、特に他の列指向データベースと比較して、ClickHouse がどのようにしてこれほど速いのかを詳細に説明します。

アーキテクチャの観点から、データベースは（少なくとも）ストレージ層とクエリ処理層で構成されています。ストレージ層はテーブルデータの保存、読み込み、維持を担当し、クエリ処理層はユーザークエリを実行します。他のデータベースと比較して、ClickHouse は両層において極めて速い挿入とSELECTクエリを可能にする革新を提供しています。

## ストレージ層：同時挿入が相互に隔離されている {#storage-layer-concurrent-inserts-are-isolated-from-each-other}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickHouse では、各テーブルは複数の「テーブルパーツ」で構成されています。ユーザーがテーブルにデータを挿入するたびに、[パーツ](/parts)が作成されます（INSERT文）。クエリは、クエリが開始された時点で存在するすべてのテーブルパーツに対して常に実行されます。

多すぎるパーツが蓄積されないように、ClickHouse はバックグラウンドで[マージ](/merges)操作を実行し、複数の小さなパーツを1つの大きなパーツに継続的に統合します。

このアプローチにはいくつかの利点があります。すべてのデータ処理は[バックグラウンドのパートマージ](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)にオフロードできるため、データ書き込みを軽量かつ非常に効率的に保つことができます。個別の挿入は「ローカル」であり、グローバル、すなわちテーブルごとのデータ構造を更新する必要がありません。その結果、複数の同時挿入は相互同期や既存テーブルデータとの同期を必要とせず、挿入はディスク I/O の速度でほぼ実行できます。

 holistic performance optimization section of the VLDB paper.

🤿 詳細については、[On-Disk Format](/docs/academic_overview#3-1-on-disk-format)セクションで当社の VLDB 2024 論文のウェブ版を参照してください。

## ストレージ層：同時挿入と SELECT が隔離されている {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

挿入は SELECT クエリから完全に隔離されており、挿入されたデータパーツのマージは、並行クエリに影響を与えることなくバックグラウンドで行われます。

🤿 詳細については、[Storage Layer](/docs/academic_overview#3-storage-layer)セクションで当社の VLDB 2024 論文のウェブ版を参照してください。

## ストレージ層：マージ時の計算 {#storage-layer-merge-time-computation}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

他のデータベースとは異なり、ClickHouse はすべての追加データ変換を[マージ](/merges)バックグラウンドプロセス中に行うことで、データ書き込みを軽量かつ効率的に保ちます。この例としては、以下のようなものがあります：

- **Replacing merges** は、入力パーツ内の行の最新バージョンのみを保持し、他の行バージョンを破棄します。Replacing merges は、マージ時のクリーンアップ操作と考えることができます。

- **Aggregating merges** は、入力パーツ内の中間集約状態を新しい集約状態に結合します。これは理解するのが難しいように思えますが、実際には増分集約を実装しているだけです。

- **TTL (有効期限) マージ** は、特定の時間ベースのルールに基づいて行を圧縮、移動、または削除します。

これらの変換の目的は、ユーザークエリが実行される時間からマージ時間に作業（計算）を移すことです。これは2つの理由から重要です：

一方で、ユーザークエリは、「変換された」データ、例えば事前に集約されたデータを活用できる場合、速度が大幅に速くなる可能性があります（時には1000倍以上）。

他方で、マージの実行時間の大部分は入力パーツの読み込みと出力パーツの保存に消費されます。マージ中にデータを変換するための追加の努力は、通常、マージの実行時間にあまり影響を与えません。これらすべての魔法は完全に透明で、クエリの結果（パフォーマンスを除いて）には影響を与えません。

🤿 詳細については、[Merge-time Data Transformation](/docs/academic_overview#3-3-merge-time-data-transformation)セクションで当社の VLDB 2024 論文のウェブ版を参照してください。

## ストレージ層：データのプルーニング {#storage-layer-data-pruning}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

実際には、多くのクエリは繰り返し実行されます。つまり、変更がなかったり、わずかに修正されたり（例：異なるパラメータ値）して、定期的に実行されます。同じまたは類似のクエリを何度も実行することで、インデックスを追加したり、データを再構成して頻繁にクエリが行えるようにすることができます。このアプローチは「データのプルーニング」とも呼ばれ、ClickHouse はこれを実現するための3つの技術を提供しています：

1. [主キーインデックス](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)は、テーブルデータのソート順を定義します。適切に選択された主キーは、上記のクエリのWHERE句のようなフィルタを、フルカラムスキャンの代わりに高速なバイナリサーチを使用して評価することを可能にします。より技術的に言うと、スキャンの実行時間はデータサイズの線形ではなく対数になります。

2. [テーブルプロジェクション](/sql-reference/statements/alter/projection)は、異なる主キーでソートされた同じデータを格納するテーブルの代替の内部バージョンです。複数の頻繁なフィルタ条件がある場合、プロジェクションは便利です。

3. [スキッピングインデックス](/optimize/skipping-indexes)は、カラム内に追加のデータ統計を埋め込む技術です。例えば、最小値と最大値、ユニーク値のセットなどです。スキッピングインデックスは主キーおよびテーブルプロジェクションとは直交し、カラム内のデータ分布に応じてフィルタ評価を大幅に高速化できます。

この3つの技術は、フルカラムリード中にできるだけ多くの行をスキップすることを目的としており、データを読む最も早い方法はデータを全く読まないことです。

🤿 詳細については、[Data Pruning](/docs/academic_overview#3-2-data-pruning)セクションで当社の VLDB 2024 論文のウェブ版を参照してください。

## ストレージ層：データ圧縮 {#storage-layer-data-compression}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

さらに、ClickHouse のストレージ層は、異なるコーデックを使用して生テーブルデータを追加的に（オプションで）圧縮します。

カラムストアは、同じ型の値とデータ分布が一緒に配置されるため、このような圧縮に特に適しています。

ユーザーは、さまざまな一般的な圧縮アルゴリズム（例えば ZSTD）や、浮動小数点値用の Gorilla や FPC、整数値用の Delta や GCD、さらには AES のような暗号化コーデックを使用してカラムが圧縮されることを[指定](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)できます。

データ圧縮は、データベーステーブルのストレージサイズを削減するだけでなく、多くの場合、クエリパフォーマンスを向上させることもあります。なぜなら、ローカルディスクやネットワーク I/O はしばしば低スループットによって制限されるからです。

🤿 詳細については、[On-Disk Format](/docs/academic_overview#3-1-on-disk-format)セクションで当社の VLDB 2024 論文のウェブ版を参照してください。

## 最新のクエリ処理層 {#state-of-the-art-query-processing-layer}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/O5qecdQ7Y18?si=XVtOIuVd8NLbqyox" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

最後に、ClickHouse はベクトル化されたクエリ処理層を使用して、クエリ実行を可能な限り並列化し、最大限の速度と効率を得るためにすべてのリソースを活用します。

「ベクトル化」とは、クエリプランオペレーターが中間結果行を単一行ではなくバッチで渡すことを意味します。これにより、CPUキャッシュの利用が向上し、オペレーターが同時に複数の値を処理するために SIMD 命令を適用できるようになります。実際、多くのオペレーターは、SIMD 命令セット世代ごとに1つずつ、複数のバージョンで提供されます。ClickHouse は、実行されるハードウェアの機能に基づいて、最新かつ最も高速なバージョンを自動的に選択します。

最新のシステムでは、数十の CPU コアがあります。すべてのコアを活用するために、ClickHouse はクエリプランを複数のレーンに展開し、通常はコアごとに1つずつのレーンを設けます。各レーンはテーブルデータの非重複範囲を処理します。こうすることで、データベースのパフォーマンスは利用可能なコアの数に応じて「垂直的」にスケールします。

単一のノードがテーブルデータを保持するには小さすぎる場合は、さらなるノードを追加してクラスタを形成できます。テーブルは「シャード」され、ノードに分散されます。ClickHouse はテーブルデータを格納するすべてのノードでクエリを実行し、その結果利用可能なノードの数に応じて「水平方向」にスケールします。

🤿 詳細については、[Query Processing Layer](/academic_overview#4-query-processing-layer)セクションで当社の VLDB 2024 論文のウェブ版を参照してください。

## 細部への徹底した注意 {#meticulous-attention-to-detail}

<iframe width="1024" height="576" src="https://www.youtube.com/embed/dccGLSuYWy0?si=rQ-Jp-z5Ik_-Rb8S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> **"ClickHouse は非常に特殊なシステムです - あなたたちは 20 種類のハッシュテーブルを持っています。あなたたちは、ほとんどのシステムが 1 件のハッシュテーブルを持っているのに対して、すべてのこれらの素晴らしいものを持っています。ClickHouse は、特化したコンポーネントがすべて揃っているため、驚異的なパフォーマンスを持っています"** [Andy Pavlo, CMU データベース教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouse が [他とは異なる](https://www.youtube.com/watch?v=CAS2otEoerM)のは、低レベルの最適化への徹底した注意によるものです。単に機能するデータベースを構築するのは一つのことですが、さまざまなクエリタイプ、データ構造、分布、インデックス構成にわたって高速を実現するためにエンジニアリングするのが「[特殊なシステム](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)" の真髄です。

**ハッシュテーブル。** ハッシュテーブルを例に取りましょう。ハッシュテーブルは、結合と集約で使用される中央データ構造です。プログラマーとしては、これらの設計上の決定を考慮する必要があります：

* 選ぶべきハッシュ関数、
* 衝突解決方法：[オープンアドレス法](https://en.wikipedia.org/wiki/Open_addressing)または[チェイニング](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)、
* メモリレイアウト：キーと値用に1つの配列、または分離された配列？
* フィルファクター：いつ、どのようにサイズを変更するか？サイズ変更中に値を移動する方法は？
* 削除：ハッシュテーブルはエントリを排除することを許可するべきか？

サードパーティライブラリが提供する標準のハッシュテーブルは機能的には動作しますが、速くはありません。優れたパフォーマンスを得るには、徹底したベンチマークと実験が必要です。

ClickHouse における[ハッシュテーブルの実装](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions)は、クエリとデータの特性に基づいて **30 種類以上の事前コンパイルされたハッシュテーブルのバリアント** のうちの1つを選択します。

**アルゴリズム。** アルゴリズムについても同様です。例えば、ソートの場合、考慮すべきは以下の通りです：

* 何がソートされるのか：数字、タプル、文字列、または構造？
* データは RAM にあるか？
* ソートは安定である必要があるか？
* すべてのデータをソートする必要があるのか、それとも部分的なソートで十分か？

データ特性に依存するアルゴリズムは、一般的なアルゴリズムよりも優れたパフォーマンスを発揮することがよくあります。データ特性が事前にわからない場合、システムはさまざまな実装を試み、実行時に最も適したものを選択できます。例えば、ClickHouse における LZ4 デコムプレッションの実装に関する[記事](https://habr.com/en/company/yandex/blog/457612/)を参照してください。

🤿 詳細については、[Holistic Performance Optimization](/academic_overview#4-4-holistic-performance-optimization)セクションで当社の VLDB 2024 論文のウェブ版を参照してください。

## VLDB 2024 論文 {#vldb-2024-paper}

2024年8月に、私たちの最初の研究論文が VLDB で受理されて公開されました。 VLDB は非常に大規模なデータベースに関する国際会議であり、データ管理分野の主要な会議の1つと広く見なされています。数百の提出の中で、VLDB の受理率は一般に約20%です。

[論文の PDF](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf) または、[ウェブ版](/docs/academic_overview)を読むことができます。これには、ClickHouse を迅速にする最も興味深いアーキテクチャとシステム設計要素の簡潔な説明が記載されています。

私たちの CTO で ClickHouse の創設者である Alexey Milovidov がこの論文を発表しました（スライドは[こちら](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)）、その後 Q&A（すぐに時間が足りなくなりました！）が行われました。こちらで録画されたプレゼンテーションをご覧いただけます：

<iframe width="1024" height="576" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
