---
sidebar_label: '概要'
slug: /migrations/snowflake-overview
description: 'Snowflake から ClickHouse への移行'
keywords: ['Snowflake']
title: 'Snowflake から ClickHouse への移行'
show_related_blogs: true
doc_type: 'guide'
---

import snowflake_architecture from '@site/static/images/cloud/onboard/discover/use_cases/snowflake_architecture.png';
import cloud_architecture from '@site/static/images/cloud/onboard/discover/use_cases/cloud_architecture.png';
import Image from '@theme/IdealImage';


# Snowflake から ClickHouse への移行

> このドキュメントでは、Snowflake から ClickHouse へのデータ移行の概要を紹介します。

Snowflake は、主にレガシーなオンプレミスのデータウェアハウスのワークロードをクラウドへ移行することに特化したクラウドデータウェアハウスです。大規模な長時間実行レポートの処理に最適化されています。データセットがクラウドへ移行されると、データ所有者は、これらのデータセットを内部および外部向けのさまざまなユースケースのリアルタイムアプリケーションを支えるために活用するなど、このデータからさらにどのような価値を引き出せるかを考え始めます。こうした段階になると、多くの場合、ClickHouse のような、リアルタイム分析に最適化されたデータベースが必要だと気づきます。



## 比較 {#comparison}

このセクションでは、ClickHouseとSnowflakeの主要な機能を比較します。

### 類似点 {#similarities}

Snowflakeは、大量のデータの保存、処理、分析のためのスケーラブルで効率的なソリューションを提供するクラウドベースのデータウェアハウスプラットフォームです。

ClickHouseと同様に、Snowflakeは既存の技術をベースに構築されておらず、独自のSQLクエリエンジンとカスタムアーキテクチャに依存しています。

Snowflakeのアーキテクチャは、共有ストレージ(shared-disk)アーキテクチャとshared-nothingアーキテクチャのハイブリッドとして説明されています。共有ストレージアーキテクチャとは、S3などのオブジェクトストアを使用してすべてのコンピュートノードからデータにアクセスできるアーキテクチャです。shared-nothingアーキテクチャとは、各コンピュートノードがクエリに応答するためにデータセット全体の一部をローカルに保存するアーキテクチャです。理論上、これは両方のモデルの長所を兼ね備えています。つまり、shared-diskアーキテクチャのシンプルさとshared-nothingアーキテクチャのスケーラビリティです。

この設計は、主要なストレージメディアとしてオブジェクトストレージに根本的に依存しており、同時アクセス下でほぼ無限にスケールし、高い耐障害性とスケーラブルなスループット保証を提供します。

以下の[docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts)からの画像は、このアーキテクチャを示しています:

<Image img={snowflake_architecture} size='md' alt='Snowflakeアーキテクチャ' />

一方、オープンソースおよびクラウドホスト製品として、ClickHouseはshared-diskとshared-nothingの両方のアーキテクチャでデプロイできます。後者はセルフマネージドデプロイメントで一般的です。CPUとメモリを容易にスケールできる一方で、shared-nothing構成は、特にメンバーシップ変更時に、従来のデータ管理の課題とデータレプリケーションのオーバーヘッドをもたらします。

このため、ClickHouse Cloudは、Snowflakeと概念的に類似した共有ストレージアーキテクチャを利用しています。データはS3やGCSなどのオブジェクトストアに一度(単一コピー)保存され、強力な冗長性保証を備えた事実上無限のストレージを提供します。各ノードは、このデータの単一コピーと、キャッシュ目的の独自のローカルSSDにアクセスできます。ノードは、必要に応じて追加のCPUおよびメモリリソースを提供するためにスケールできます。Snowflakeと同様に、S3のスケーラビリティ特性は、追加のノードが追加されてもクラスタ内の既存ノードで利用可能なI/Oスループットが影響を受けないようにすることで、shared-diskアーキテクチャの従来の制限(ディスクI/Oとネットワークボトルネック)に対処します。

<Image img={cloud_architecture} size='md' alt='ClickHouse Cloudアーキテクチャ' />

### 相違点 {#differences}

基盤となるストレージフォーマットとクエリエンジンを除いて、これらのアーキテクチャはいくつかの微妙な点で異なります:

- Snowflakeのコンピュートリソースは、[ウェアハウス](https://docs.snowflake.com/en/user-guide/warehouses)という概念を通じて提供されます。
  これらは、それぞれ設定されたサイズの複数のノードで構成されます。Snowflakeはウェアハウスの具体的なアーキテクチャを公開していませんが、
  各ノードは8 vCPU、16GiB、および200GBのローカルストレージ(キャッシュ用)で構成されていると
  [一般的に理解されています](https://select.dev/posts/snowflake-warehouse-sizing)。
  ノード数はTシャツサイズに依存します。例えば、x-smallは1ノード、smallは2ノード、mediumは4ノード、largeは8ノードなどです。これらのウェアハウスはデータから独立しており、
  オブジェクトストレージ上に存在する任意のデータベースをクエリするために使用できます。アイドル状態でクエリ負荷がかかっていない場合、ウェアハウスは一時停止され、クエリを受信すると再開されます。ストレージコストは常に請求に反映されますが、ウェアハウスはアクティブな場合にのみ課金されます。

- ClickHouse Cloudは、ローカルキャッシュストレージを持つノードという同様の原則を利用しています。Tシャツサイズではなく、ユーザーは合計コンピュート量と利用可能なRAMを持つサービスをデプロイします。これは、クエリ負荷に基づいて(定義された制限内で)透過的に自動スケールします。各ノードのリソースを増減させる垂直スケーリング、またはノードの総数を増減させる水平スケーリングのいずれかです。ClickHouse Cloudノードは現在、Snowflakeの1:2とは異なり、1:1のCPU対メモリ比率を持っています。より緩い結合も可能ですが、Snowflakeウェアハウスとは異なり、サービスは現在データに結合されています。ノードはアイドル状態の場合は一時停止し、クエリを受けると再開します。ユーザーは必要に応じてサービスを手動でリサイズすることもできます。

- ClickHouse Cloudのクエリキャッシュは現在ノード固有ですが、Snowflakeのキャッシュはウェアハウスから独立したサービスレイヤーで提供されます。ベンチマークに基づくと、ClickHouse CloudのノードキャッシュはSnowflakeを上回るパフォーマンスを発揮します。


- Snowflake と ClickHouse Cloud は、クエリの同時実行数を増やすためのスケーリングに異なるアプローチを採用しています。Snowflake は [マルチクラスタウェアハウス](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses) として知られる機能を通じてこれに対処します。この機能により、ユーザーはウェアハウスにクラスタを追加できます。これはクエリレイテンシの改善にはつながりませんが、追加の並列化を提供し、より高いクエリ同時実行を可能にします。ClickHouse は、垂直または水平スケーリングを通じてサービスにメモリと CPU を追加することでこれを実現します。本記事では、これらのサービスがより高い同時実行数にスケールする能力については検証せず、レイテンシに焦点を当てていますが、完全な比較のためにはこの作業が必要であることを認識しています。ただし、Snowflake が [ウェアハウスに対してデフォルトで同時クエリ数を 8 に明示的に制限している](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level) ことを考えると、ClickHouse はあらゆる同時実行テストで優れたパフォーマンスを発揮すると予想されます。比較すると、ClickHouse Cloud はノードあたり最大 1000 のクエリを実行できます。

- Snowflake のデータセットに対するコンピュートサイズの切り替え機能と、ウェアハウスの高速再開時間により、アドホッククエリに優れた体験を提供します。データウェアハウスおよびデータレイクのユースケースにおいて、これは他のシステムに対する優位性となります。

### リアルタイム分析 {#real-time-analytics}

公開されている [ベンチマーク](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-) データに基づくと、ClickHouse はリアルタイム分析アプリケーションにおいて、以下の領域で Snowflake を上回るパフォーマンスを発揮します:

- **クエリレイテンシ**: Snowflake のクエリは、パフォーマンスを最適化するためにテーブルにクラスタリングが適用されている場合でも、より高いクエリレイテンシを示します。当社のテストでは、Snowflake のクラスタリングキーまたは ClickHouse のプライマリキーの一部であるフィルタが適用されるクエリにおいて、ClickHouse と同等のパフォーマンスを達成するために、Snowflake は 2 倍以上のコンピュートを必要とします。Snowflake の [永続的なクエリキャッシュ](https://docs.snowflake.com/en/user-guide/querying-persisted-results) はこれらのレイテンシの課題の一部を相殺しますが、フィルタ条件がより多様な場合には効果的ではありません。このクエリキャッシュの有効性は、基盤となるデータの変更によってさらに影響を受ける可能性があり、テーブルが変更されるとキャッシュエントリが無効化されます。これは当社のアプリケーションのベンチマークには該当しませんが、実際のデプロイメントでは新しい最新のデータを挿入する必要があります。ClickHouse のクエリキャッシュはノード固有であり、[トランザクション一貫性がない](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design) ため、リアルタイム分析に [より適している](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design) 点に注意してください。ユーザーは、[クエリごとの使用制御](/operations/settings/settings#use_query_cache)、[正確なサイズ](/operations/settings/settings#query_cache_max_size_in_bytes)、[クエリがキャッシュされるかどうか](/operations/settings/settings#enable_writes_to_query_cache)(期間または必要な実行回数の制限)、および [パッシブ使用のみ](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings) かどうかを制御する機能により、その使用を細かく制御できます。

- **低コスト**: Snowflake のウェアハウスは、クエリの非アクティブ期間後に一時停止するように設定できます。一時停止されると、料金は発生しません。実際には、この非アクティブチェックは [60 秒までしか短縮できません](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)。ウェアハウスは、クエリを受信すると数秒以内に自動的に再開されます。Snowflake はウェアハウスが使用中の場合にのみリソースに対して課金するため、この動作はアドホッククエリのように頻繁にアイドル状態になるワークロードに適しています。


  しかし、多くのリアルタイム分析ワークロードでは、継続的なリアルタイムデータの
取り込みと頻繁なクエリ実行が必要であり、（顧客向けダッシュボードなどのように）
アイドル状態にしてもメリットが得られません。これは、ウェアハウスを常に完全に稼働状態に
保ち、継続的に料金が発生する必要があることを意味します。これにより、アイドルによる
コストメリットだけでなく、Snowflake が他の選択肢よりも素早く応答可能な状態へ復帰できる
ことに起因するパフォーマンス上の利点も相殺されてしまいます。このような常時アクティブ状態の
要件に、ClickHouse Cloud のアクティブ状態に対する秒単位のコストがより低いことが
組み合わさることで、この種のワークロードでは ClickHouse Cloud は総コストを大幅に
低く抑えることができます。

* **機能の料金の予測しやすさ:** マテリアライズドビューやクラスタリング（ClickHouse の
`ORDER BY` に相当）といった機能は、リアルタイム分析ユースケースで最高レベルの
パフォーマンスを引き出すために不可欠です。これらの機能には Snowflake では追加料金が
発生し、クレジット単価を 1.5 倍に引き上げる上位ティアが必要になるだけでなく、
バックグラウンドで発生する予測しにくいコストも伴います。たとえば、マテリアライズド
ビューにはバックグラウンドのメンテナンスコストが発生し、クラスタリングも同様であり、
利用前にそのコストを見積もるのは困難です。これに対し、ClickHouse Cloud では、
これらの機能に追加料金は一切発生せず、挿入時の CPU とメモリ使用量の増加のみで、
高負荷な挿入ワークロードのユースケースを除けば通常は無視できる程度です。ベンチマーク
では、これらの違いに加え、クエリレイテンシの低さと高い圧縮率により、
ClickHouse ではコストを大幅に削減できることが確認されています。
