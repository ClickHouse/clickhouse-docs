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

# Snowflake から ClickHouse への移行 \{#snowflake-to-clickhouse-migration\}

> このドキュメントでは、Snowflake から ClickHouse へのデータ移行の概要を説明します。

Snowflake は、オンプレミスのレガシーなデータウェアハウス・ワークロードをクラウドへ移行することに主眼を置いたクラウド・データウェアハウスです。大規模な長時間実行レポートを実行するよう最適化されています。データセットがクラウドに移行されると、データ所有者は、このデータから他にどのような価値を引き出せるか、たとえば、これらのデータセットを用いて社内外向けのリアルタイム・アプリケーションを構築するといったことを考え始めます。そうした段階になると、しばしば ClickHouse のような、リアルタイム分析のために最適化されたデータベースが必要であることに気付きます。

## 比較 \{#comparison\}

このセクションでは、ClickHouse と Snowflake の主要な機能を比較します。

### 類似点 \{#similarities\}

Snowflake はクラウドベースのデータウェアハウスプラットフォームであり、
大規模なデータの保存、処理、および分析に対してスケーラブルかつ効率的なソリューションを提供します。
ClickHouse と同様に、Snowflake は既存技術の上に構築されているわけではなく、
独自の SQL クエリエンジンとカスタムアーキテクチャに基づいています。

Snowflake のアーキテクチャは、共有ストレージ (共有ディスク) アーキテクチャと
共有ナッシングアーキテクチャのハイブリッドとして説明されます。共有ストレージアーキテクチャとは、
S3 のようなオブジェクトストアを使用し、すべてのコンピュートノードからデータへアクセスできる構成です。
共有ナッシングアーキテクチャとは、各コンピュートノードがクエリに応答するために、
全データセットの一部をローカルに保存する構成です。理論的には、これにより両モデルの長所、
すなわち共有ディスクアーキテクチャのシンプルさと、共有ナッシングアーキテクチャのスケーラビリティを
同時に得ることができます。

この設計は、一次ストレージ媒体としてオブジェクトストレージに本質的に依存しており、
高い堅牢性とスケーラブルなスループット保証を提供しつつ、高い並行アクセス下でもほぼ無限に
スケールします。

以下の [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts) の画像は、
このアーキテクチャを示しています。

<Image img={snowflake_architecture} size="md" alt="Snowflake のアーキテクチャ" />

一方で、オープンソースかつクラウドホスト型のプロダクトである ClickHouse は、
共有ディスクアーキテクチャと共有ナッシングアーキテクチャの両方でデプロイできます。
後者はセルフマネージドなデプロイメントで一般的です。CPU とメモリを容易にスケール可能にする一方で、
共有ナッシング構成では、特にメンバーシップ変更時に、古典的なデータ管理上の課題と
データレプリケーションのオーバーヘッドが生じます。

このため、ClickHouse Cloud は Snowflake と概念的に類似した共有ストレージアーキテクチャを採用しています。
データは S3 や GCS などのオブジェクトストアに (単一コピーとして) 一度保存され、
事実上無制限のストレージと強力な冗長性保証を提供します。各ノードはこの単一コピーのデータにアクセスでき、
キャッシュ用途のローカル SSD をそれぞれ持ちます。ノードは必要に応じて CPU とメモリの追加リソースを
提供するためにスケールさせることができます。Snowflake と同様に、S3 のスケーラビリティ特性により、
クラスタ内に追加ノードが投入されても現在のノードで利用可能な I/O スループットに影響を与えないことで、
共有ディスクアーキテクチャの古典的な制約 (ディスク I/O およびネットワークのボトルネック) が
解消されます。

<Image img={cloud_architecture} size="md" alt="ClickHouse Cloud のアーキテクチャ" />

### Differences \{#differences\}

基盤となるストレージ形式やクエリエンジン以外にも、これらのアーキテクチャには
いくつか微妙な違いがあります。

* Snowflake ではコンピュートリソースは [warehouses](https://docs.snowflake.com/en/user-guide/warehouses)
  という概念で提供されます。これは一定サイズのノードを複数組み合わせたものです。
  Snowflake は自社の warehouse の具体的なアーキテクチャを公開していませんが、
  各ノードは 8 vCPU、16 GiB、200 GB のローカルストレージ（キャッシュ用）で構成されると
  [一般に理解されています](https://select.dev/posts/snowflake-warehouse-sizing)。
  ノード数は T シャツサイズに依存し、たとえば x-small は 1 ノード、small は 2、
  medium は 4、large は 8 ノード、といった具合です。これらの warehouse はデータとは
  独立しており、オブジェクトストレージ上にある任意のデータベースに対してクエリを
  実行できます。アイドル状態でクエリ負荷がない場合、warehouse は一時停止され、
  クエリを受信すると再開されます。ストレージコストは常に課金対象ですが、
  warehouse の料金はアクティブなときのみ発生します。

* ClickHouse Cloud もローカルキャッシュストレージを持つノードという、類似の原則を
  利用します。T シャツサイズではなく、ユーザーは合計のコンピュート量と利用可能な
  RAM を持つサービスをデプロイします。これにより、クエリ負荷に基づいて
  （定義された上限の範囲で）透過的に自動スケールが行われます。これは各ノードの
  リソースを増減することで垂直方向にスケールしたり、ノードの総数を増減することで
  水平方向にスケールしたりします。ClickHouse Cloud のノードは、Snowflake とは異なり
  CPU:メモリ比が 1:1 になっています。より疎な結合も可能ですが、
  サービスは Snowflake の warehouse と異なりデータと結合されています。ノードも
  アイドル状態になれば一時停止し、クエリが投入されると再開します。ユーザーは必要に
  応じてサービスを手動でリサイズすることもできます。

* ClickHouse Cloud のクエリキャッシュはノード固有であるのに対し、
  Snowflake のクエリキャッシュは warehouse とは独立したサービスレイヤーで提供されます。
  ベンチマークに基づくと、ClickHouse Cloud のノードキャッシュは Snowflake のものより
  高い性能を示します。

* Snowflake と ClickHouse Cloud は、クエリの同時実行数を増やすためのスケーリング
  アプローチが異なります。Snowflake は [multi-cluster warehouses](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses)
  として知られる機能でこれに対応します。この機能により、ユーザーは warehouse に
  クラスターを追加できます。これはクエリレイテンシの改善にはつながりませんが、
  追加の並列化を提供し、より高いクエリ同時実行性を可能にします。ClickHouse は
  垂直または水平スケーリングによりサービスにメモリと CPU を追加することで、
  これを実現します。本記事ではレイテンシに焦点を当てており、これらのサービスが
  より高い同時実行性にスケールする能力については掘り下げませんが、完全な比較には
  この検証も必要であると認識しています。ただし、Snowflake が
  [warehouse あたりの許可される同時実行クエリ数をデフォルトで 8 に制限している](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level)
  のに対し、ClickHouse はあらゆる同時実行テストにおいて良好な性能を示すと
  期待できます。比較として、ClickHouse Cloud はノードあたり最大 1000 件の
  クエリ実行を許可します。

* Snowflake の、データセットに対してコンピュートサイズを切り替える機能と、
  warehouse の高速な再開時間を組み合わせた能力は、アドホックなクエリ用途において
  非常に優れた体験を提供します。データウェアハウスおよびデータレイクのユースケースにおいて、
  これは他システムに対する優位性をもたらします。

### リアルタイム分析 \{#real-time-analytics\}

公開されている[ベンチマーク](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)データに基づくと、
ClickHouse はリアルタイム分析アプリケーションにおいて、以下の点で Snowflake を上回ります。

* **クエリレイテンシ**: Snowflake のクエリは、パフォーマンス最適化のためにテーブルへクラスタリングを適用した場合でも、
  クエリレイテンシがより大きくなります。われわれのテストでは、Snowflake は、フィルタ条件が Snowflake のクラスタリングキーや
  ClickHouse のプライマリキーの一部となっているクエリで ClickHouse と同等のパフォーマンスを達成するために、
  2 倍以上のコンピュートリソースを必要としました。Snowflake の
  [永続的なクエリキャッシュ](https://docs.snowflake.com/en/user-guide/querying-persisted-results)
  は、こうしたレイテンシの課題を一部相殺しますが、フィルタ条件がより多様な場合には効果が薄れます。
  また、基盤となるデータが変更されるとキャッシュエントリがテーブル変更に伴って無効化されるため、
  クエリキャッシュの有効性はさらに低下し得ます。本ベンチマークではアプリケーション上そうした状況は発生しませんが、
  実際のデプロイでは新しい最新データを挿入する必要があります。なお、ClickHouse のクエリキャッシュはノード固有であり、
  [トランザクション一貫性はありません](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)。
  そのため、[リアルタイム分析により適しています](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)。
  また、ユーザーはその利用についてきめ細かく制御でき、
  [クエリ単位](/operations/settings/settings#use_query_cache)での使用可否や
  [正確なサイズ](/operations/settings/settings#query_cache_max_size_in_bytes)、
  [クエリをキャッシュするかどうか](/operations/settings/settings#enable_writes_to_query_cache)
  （期間や必要な実行回数による制限を含む）、および
  [パッシブ利用のみとするかどうか](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings)
  を制御できます。

* **低コスト**: Snowflake のウェアハウスは、クエリが一定時間実行されないとサスペンドされるように構成できます。
  サスペンドされると課金は発生しません。実際には、この非アクティブ検知のしきい値は
  [60 秒までしか下げることができません](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)。
  ウェアハウスは、クエリが送信されると数秒以内に自動的に再開されます。
  Snowflake はウェアハウスが利用中のときだけリソースに課金するため、
  この挙動はアドホッククエリのようにアイドル状態であることが多いワークロードに適しています。

  しかし、多くのリアルタイム分析ワークロードでは、リアルタイムデータの継続的なインジェストと、
  顧客向けダッシュボードのような、アイドル状態の恩恵を受けない高頻度のクエリ実行が求められます。
  これは、ウェアハウスが常時フルにアクティブであり課金が発生することを意味します。
  その結果、アイドルによるコストメリットや、Snowflake が他の選択肢よりも高速に応答可能な状態へ
  復帰できることによるパフォーマンス上の優位性は打ち消されます。
  このようなアクティブ状態の要件と、アクティブ状態における 1 秒あたりのコストが ClickHouse Cloud の方が低いことを組み合わせると、
  ClickHouse Cloud はこの種のワークロードに対して大幅に低い総コストを提供します。

* **機能の予測可能な料金体系:** materialized view やクラスタリング（ClickHouse の `ORDER BY` に相当）は、
  リアルタイム分析ユースケースにおいて最高レベルのパフォーマンスを達成するために必要な機能です。
  これらの機能は Snowflake では追加料金の対象であり、クレジット単価を 1.5 倍に引き上げる
  上位ティアだけでなく、予測しづらいバックグラウンドコストが発生します。
  たとえば、materialized view とクラスタリングにはバックグラウンドでのメンテナンスコストが発生し、
  これは利用前に予測することが困難です。一方、ClickHouse Cloud では、
  これらの機能に対して追加コストは発生せず、挿入時の CPU とメモリ使用量の増加のみであり、
  高負荷の挿入ワークロード以外では通常無視できる程度です。
  われわれのベンチマークでは、こうした違いに加え、より低いクエリレイテンシと高い圧縮率により、
  ClickHouse ではコストが大幅に低くなることが確認されています。