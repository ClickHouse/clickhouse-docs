---
sidebar_position: 1
sidebar_label: 'ClickHouseはなぜこれほど速いのか？'
description: 'ClickHouseは速くなるように設計されています。クエリ実行のパフォーマンスは、開発プロセスにおいて常に最優先事項でしたが、ユーザーフレンドリーさ、スケーラビリティ、セキュリティなど他の重要な特性も考慮され、ClickHouseは実際の生産システムとなることができました。'
---


# ClickHouseはなぜこれほど速いのか？ {#why-clickhouse-is-so-fast}

データベースのパフォーマンスに寄与する要因は多岐にわたりますが、その中には [データの方向性](/intro#row-oriented-vs-column-oriented-storage) もあります。
次に、ClickHouseが他の列指向データベースと比較して特に速い理由を詳しく説明します。

アーキテクチャの観点から見ると、データベースは（少なくとも）ストレージレイヤーとクエリ処理レイヤーで構成されています。ストレージレイヤーはテーブルデータの保存、読み込み、維持を担当し、クエリ処理レイヤーはユーザークエリを実行します。他のデータベースと比較すると、ClickHouseは両方のレイヤーで革新を提供し、非常に速い挿入およびSelectクエリを可能にします。

## ストレージレイヤー：同時挿入は互いに隔離される {#storage-layer-concurrent-inserts-are-isolated-from-each-other}

<iframe width="768" height="432" src="https://www.youtube.com/embed/vsykFYns0Ws?si=hE2qnOf6cDKn-otP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

ClickHouseでは、各テーブルは複数の「テーブルパーツ」で構成されています。[パーツ](/parts)は、ユーザーがテーブルにデータを挿入するたびに作成されます（INSERTステートメント）。クエリは常に、クエリが開始された時点で存在するすべてのテーブルパーツに対して実行されます。

パーツがあまりにも多く蓄積されるのを避けるために、ClickHouseはバックグラウンドで[マージ](/merges)操作を実行し、複数の小さなパーツを1つの大きなパーツに継続的に統合します。

このアプローチにはいくつかの利点があります：すべてのデータ処理が[バックグラウンドのパートマージ](/concepts/why-clickhouse-is-so-fast#storage-layer-merge-time-computation)にオフロードされ、データ書き込みを軽量かつ非常に効率的に保つことができます。個々の挿入は「ローカル」であり、グローバルな、つまりテーブルごとのデータ構造を更新する必要がありません。その結果、複数の同時挿入は相互同期や既存のテーブルデータとの同期を必要とせず、したがって挿入はほぼディスクI/Oの速度で行うことができます。

これはVLDB論文の全体的なパフォーマンス最適化に関するセクションです。

🤿 詳細については、当社のVLDB 2024論文の[ディスク上フォーマット](/docs/academic_overview#3-1-on-disk-format)セクションでの深掘りをご覧ください。

## ストレージレイヤー：同時挿入とセレクトは隔離される {#storage-layer-concurrent-inserts-and-selects-are-isolated}

<iframe width="768" height="432" src="https://www.youtube.com/embed/dvGlPh2bJFo?si=F3MSALPpe0gAoq5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

挿入はSELECTクエリから完全に隔離されており、挿入されたデータパーツのマージはバックグラウンドで行われ、同時クエリに影響を与えません。

🤿 詳細については、当社のVLDB 2024論文の[ストレージレイヤー](/docs/academic_overview#3-storage-layer)セクションでの深掘りをご覧ください。

## ストレージレイヤー：マージ時間計算 {#storage-layer-merge-time-computation}

<iframe width="768" height="432" src="https://www.youtube.com/embed/_w3zQg695c0?si=g0Wa_Petn-LcmC-6" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

他のデータベースとは異なり、ClickHouseは追加のデータ変換を[マージ](/merges)バックグラウンドプロセス中に実行することでデータ書き込みを軽量かつ効率的に保ちます。これに関する例は以下のとおりです：

- **リプレースマージ**：これは、入力パーツ内の行の最新のバージョンのみを保持し、他の行のバージョンを破棄します。リプレースマージは、マージ時間のクリーンアップ操作と考えることができます。

- **集約マージ**：これは、入力パーツ内の中間集計状態を新しい集計状態にまとめます。これは理解するのが難しいように思えますが、実際にはインクリメンタル集計を実行しているだけです。

- **TTL（有効期限）マージ**：これは、特定の時間に基づくルールに基づいて行を圧縮、移動、または削除します。

これらの変換のポイントは、ユーザークエリの実行時ではなく、マージ時に作業（計算）を移行することです。これは二つの理由から重要です：

一つ目は、ユーザークエリが「変換」されたデータ、例えば事前に集約されたデータを活用できる場合、クエリの実行速度が大幅に向上し、時には1000倍以上速くなります。

二つ目は、マージの実行時間の大部分は、入力パーツの読み込みと出力パーツの保存に消費されます。マージ中のデータ変換に追加の労力がかかることは、通常はマージの実行時間にはあまり影響を与えません。これらすべての処理は完全に透明であり、クエリの結果（パフォーマンス以外）には影響を与えません。

🤿 詳細については、当社のVLDB 2024論文の[マージ時間データ変換](/docs/academic_overview#3-3-merge-time-data-transformation)セクションでの深掘りをご覧ください。

## ストレージレイヤー：データプルーニング {#storage-layer-data-pruning}

<iframe width="768" height="432" src="https://www.youtube.com/embed/UJpVAx7o1aY?si=w-AfhBcRIO-e3Ysj" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

実際には、多くのクエリは繰り返され、つまり変更されずに、またはわずかな修正（例：異なるパラメータ値）で定期的に実行されます。同じまたは類似のクエリを何度も実行することで、インデックスを追加したり、頻繁なクエリがより早くアクセスできるようにデータを再整理することができます。このアプローチは「データプルーニング」とも呼ばれ、ClickHouseはこれを実現するための3つのテクニックを提供しています：

1. [主キーインデックス](/guides/best-practices/sparse-primary-indexes#clickhouse-index-design)：これによりテーブルデータのソート順が定義されます。適切に選択された主キーは、上記のクエリのWHERE句などのフィルターを、高速な二分探索を用いて評価することを可能にします。より技術的に言えば、スキャンの実行時間はデータサイズに対して線形ではなく対数的になります。

2. [テーブルプロジェクション](/sql-reference/statements/alter/projection)：これは、データを同じく保存しながら、異なる主キーでソートされたテーブルの内部的な代替バージョンです。プロジェクションは、頻繁なフィルター条件が複数ある場合に便利です。

3. [スキッピングインデックス](/optimize/skipping-indexes)：これは、列に追加のデータ統計を埋め込むもので、例としては最小および最大のカラム値、一意の値の集合などがあります。スキッピングインデックスは主キーとテーブルプロジェクションとは直交しており、列内のデータ分布によってはフィルターの評価を大いに加速させることができます。

この3つのテクニックはすべて、全カラムの読み取り中にできるだけ多くの行をスキップすることを目指しています。データを読む最も速い方法は、まったく読まないことです。

🤿 詳細については、当社のVLDB 2024論文の[データプルーニング](/docs/academic_overview#3-2-data-pruning)セクションでの深掘りをご覧ください。

## ストレージレイヤー：データ圧縮 {#storage-layer-data-compression}

<iframe width="768" height="432" src="https://www.youtube.com/embed/MH10E3rVvnM?si=duWmS_OatCLx-akH" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

そのほかに、ClickHouseのストレージレイヤーは、生のテーブルデータを異なるコーデックを使用して追加（かつオプションで）圧縮します。

列ストレージは、同じタイプの値とデータ分布が一緒に配置されるため、圧縮に特に適しています。

ユーザーは、列がさまざまな一般的な圧縮アルゴリズム（ZSTDのような）や、浮動小数点値にはGorillaやFPC、整数値にはDeltaやGCD、または暗号化コーデックとしてAESを使用して圧縮されることを[指定する](https://clickhouse.com/blog/optimize-clickhouse-codecs-compression-schema)ことができます。

データ圧縮は、データベーステーブルのストレージサイズを削減するだけでなく、多くの場合、ローカルディスクやネットワークI/Oがしばしば低スループットに制約されているため、クエリパフォーマンスも向上させます。

🤿 詳細については、当社のVLDB 2024論文の[ディスク上フォーマット](/docs/academic_overview#3-1-on-disk-format)セクションでの深掘りをご覧ください。

## 最先端のクエリ処理レイヤー {#state-of-the-art-query-processing-layer}

<iframe width="768" height="432" src="https://www.youtube.com/embed/O5qecdQ7Y18?si=XVtOIuVd8NLbqyox" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

最後に、ClickHouseはベクター化クエリ処理レイヤーを利用し、クエリの実行をできるだけ並列化して、リソースを最大速度と効率で利用できるようにしています。

「ベクター化」とは、クエリプランの演算子が個々の行の代わりに、バッチで中間結果の行を渡すことを意味します。これにより、CPUキャッシュの利用が向上し、演算子はSIMD命令を適用して複数の値を一度に処理することができます。実際、多くの演算子はSIMD命令セット世代ごとに1つのバージョンがあり、ClickHouseは実行されるハードウェアの機能に基づいて、最も最近の高速なバージョンを自動的に選択します。

現代のシステムは何十ものCPUコアを持っています。すべてのコアを利用するために、ClickHouseはクエリプランを複数のレーンに展開します。通常は1コアごとに1レーンです。各レーンは、テーブルデータの非交差範囲を処理します。そのため、データベースのパフォーマンスは、利用可能なコア数に対して「垂直」にスケールします。

単一のノードがテーブルデータを保持するには小さすぎる場合、追加のノードを追加してクラスターを形成できます。テーブルは分割（「シャード」）され、ノード全体に分散されます。ClickHouseは、テーブルデータを格納するすべてのノードでクエリを実行し、利用可能なノード数に対して「水平」にスケールします。

🤿 詳細については、当社のVLDB 2024論文の[クエリ処理レイヤー](/academic_overview#4-query-processing-layer)セクションでの深掘りをご覧ください。

## 詳細への細心の注意 {#meticulous-attention-to-detail}

<iframe width="768" height="432" src="https://www.youtube.com/embed/dccGLSuYWy0?si=rQ-Jp-z5Ik_-Rb8S" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

> **「ClickHouseはフリークなシステムです - あなたたちは20のハッシュテーブルのバージョンを持っています。あなたたちはほとんどのシステムが1つのハッシュテーブルを持つのとは異なり、これらの素晴らしいコンポーネントを全て保有しています。** **…** **ClickHouseはこれらの特殊なコンポーネントを持っているため、素晴らしいパフォーマンスを持っています。」** [Andy Pavlo、CMUのデータベース教授](https://www.youtube.com/watch?v=Vy2t_wZx4Is&t=3579s)

ClickHouseが[際立っている](https://www.youtube.com/watch?v=CAS2otEoerM)のは、低レベルの最適化に対する細心の注意にあります。単に機能するデータベースを構築することは一つのことであり、多様なクエリタイプ、データ構造、分布、およびインデックス構成にわたって速度を提供できるように設計することが、「[フリークなシステム](https://youtu.be/Vy2t_wZx4Is?si=K7MyzsBBxgmGcuGU&t=3579)」のアートが際立つ点です。

  
**ハッシュテーブル。** 例としてハッシュテーブルを考えてみましょう。ハッシュテーブルは、結合や集約で使用される中心的なデータ構造です。プログラマーはこれらの設計決定を考慮する必要があります：

* 選択するハッシュ関数、  
* 衝突解決方法：[オープンアドレッシング](https://en.wikipedia.org/wiki/Open_addressing)または[チェイニング](https://en.wikipedia.org/wiki/Hash_table#Separate_chaining)、  
* メモリレイアウト：キーと値のために1つの配列を使用するか、別々の配列を使用するか？  
* 塞ぎ崩し率：いつ、どのようにサイズを変更するか？サイズ変更の際に値をどのように移動するか？  
* 削除：ハッシュテーブルはエントリーの退去を許可すべきか？

サードパーティライブラリから提供される標準的なハッシュテーブルは機能的には動作しますが、速くはありません。優れたパフォーマンスには、緻密なベンチマークと実験が必要です。

[ClickHouseにおけるハッシュテーブルの実装](https://clickhouse.com/blog/hash-tables-in-clickhouse-and-zero-cost-abstractions)では、クエリとデータの仕様に基づいて30以上のプリコンパイルされたハッシュテーブルのバリアントのうちの1つを選択します。

**アルゴリズム。** アルゴリズムについても同様です。例えば、ソートにおいて考慮すべきことは：

* ソートされるもの：数、タプル、文字列、または構造体？  
* データはRAMに存在するか？  
* ソートは安定している必要があるか？  
* すべてのデータをソートする必要があるか、それとも部分的なソートで十分か？

データの特性に基づくアルゴリズムは、一般的なアルゴリズムよりも優れたパフォーマンスを発揮することがあります。データの特性が事前に不明な場合、システムはさまざまな実装を試み、実行時に最も効果的なものを選択できます。例として、[ClickHouseにおけるLZ4の解凍がどのように実装されているかに関する記事](https://habr.com/en/company/yandex/blog/457612/)があります。

🤿 詳細については、当社のVLDB 2024論文の[全体的なパフォーマンス最適化](/academic_overview#4-4-holistic-performance-optimization)セクションでの深掘りをご覧ください。

## VLDB 2024論文 {#vldb-2024-paper}

2024年8月、私たちは初めての研究論文がVLDBで受理され、出版されました。 
VLDBは非常に大規模なデータベースに関する国際会議であり、データ管理の分野での主要な会議の一つと広く見なされています。 
数百件の提出の中で、VLDBは一般的に約20％の受理率を誇ります。

論文の[PDF](https://www.vldb.org/pvldb/vol17/p3731-schulze.pdf)や、ClickHouseの最も興味深いアーキテクチャやシステム設計要素の簡潔な説明を提供する[ウェブ版](/docs/academic_overview)を読むことができます。

私たちのCTOでありClickHouseの創設者であるアレクセイ・ミロビドフは、論文を発表しました（スライド[こちら](https://raw.githubusercontent.com/ClickHouse/clickhouse-presentations/master/2024-vldb/VLDB_2024_presentation.pdf)）、その後質疑応答（すぐに時間が過ぎ去ってしまいました）を行いました！ 
録画されたプレゼンテーションは以下でご覧いただけます：

<iframe width="768" height="432" src="https://www.youtube.com/embed/7QXKBKDOkJE?si=5uFerjqPSXQWqDkF" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
