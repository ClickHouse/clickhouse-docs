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

> このドキュメントでは、Snowflake から ClickHouse へのデータ移行の概要を説明します。

Snowflake は、レガシーなオンプレミスのデータウェアハウスワークロードをクラウドへ移行することを主な目的としたクラウドデータウェアハウスです。大規模環境で、長時間にわたって実行されるレポート処理に最適化されています。データセットがクラウドに移行されるにつれて、データ所有者は、このデータから他にどのような価値を引き出せるか、たとえばこれらのデータセットを利用して社内外向けのリアルタイムアプリケーションを支えることなどを考え始めます。そうした段階になると、多くの場合、ClickHouse のようなリアルタイム分析の提供に最適化されたデータベースが必要であることに気付きます。



## 比較 {#comparison}

このセクションでは、ClickHouse と Snowflake の主要な機能を比較します。

### 類似点 {#similarities}

Snowflake はクラウドベースのデータウェアハウスプラットフォームであり、大量の
データを保存・処理・分析するためのスケーラブルで効率的なソリューションを提供します。
ClickHouse と同様に、Snowflake は既存のテクノロジー上に構築されているわけではなく、
独自の SQL クエリエンジンとカスタムアーキテクチャに依存しています。

Snowflake のアーキテクチャは、共有ストレージ（共有ディスク）アーキテクチャと
共有ナッシングアーキテクチャのハイブリッドとして説明されます。共有ストレージ
アーキテクチャとは、S3 のようなオブジェクトストアを使用して、すべてのコンピュートノード
からデータにアクセスできる構成を指します。共有ナッシングアーキテクチャとは、
各コンピュートノードがクエリに応答するために、全体のデータセットの一部をローカルに
保持する構成を指します。理論的には、これは両方のモデルの利点を兼ね備えており、
共有ディスクアーキテクチャのシンプルさと共有ナッシングアーキテクチャのスケーラビリティを
同時に実現します。

この設計は、主要なストレージ媒体としてオブジェクトストレージに本質的に依存しており、
高い耐障害性とスケーラブルなスループット保証を維持しながら、同時アクセス下でも
ほぼ無限にスケールします。

以下の [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts)
の画像は、このアーキテクチャを示しています。

<Image img={snowflake_architecture} size="md" alt="Snowflake のアーキテクチャ" />

一方で、オープンソースかつクラウドでも提供されるプロダクトである ClickHouse は、
共有ディスクアーキテクチャと共有ナッシングアーキテクチャの両方でデプロイできます。
後者はセルフマネージドなデプロイメントで一般的です。CPU とメモリを容易にスケール
できる一方で、共有ナッシング構成は、特にメンバーシップ変更時に、古典的なデータ管理の
課題とデータレプリケーションのオーバーヘッドをもたらします。

このため、ClickHouse Cloud は Snowflake と概念的に類似した共有ストレージ
アーキテクチャを採用しています。データは S3 や GCS などのオブジェクトストアに
単一のコピー（single copy）として保存され、強力な冗長性保証を備えた、事実上無限の
ストレージを提供します。各ノードは、この単一コピーのデータにアクセスできると同時に、
キャッシュ用途のローカル SSD も持ちます。ノードは、必要に応じて追加の CPU とメモリ
リソースを提供するためにスケールできます。Snowflake と同様に、S3 のスケーラビリティ
特性により、クラスタ内の現在のノードで利用可能な I/O スループットが、ノード追加によって
影響を受けないようにすることで、共有ディスクアーキテクチャの古典的な制約
（ディスク I/O とネットワークのボトルネック）に対処します。

<Image img={cloud_architecture} size="md" alt="ClickHouse Cloud のアーキテクチャ" />

### 相違点 {#differences}

基盤となるストレージフォーマットやクエリエンジン以外にも、これらのアーキテクチャには
いくつかの微妙な違いがあります。

* Snowflake におけるコンピュートリソースは、
  [warehouses](https://docs.snowflake.com/en/user-guide/warehouses)
  という概念で提供されます。これらは、決められたサイズのノード群から構成されます。
  Snowflake は warehouse の具体的なアーキテクチャを公開していませんが、
  [一般的には](https://select.dev/posts/snowflake-warehouse-sizing)
  各ノードは 8 vCPU、16GiB、200GB のローカルストレージ（キャッシュ用）から構成されると
  されています。ノード数は T シャツサイズに依存し、たとえば x-small は 1 ノード、
  small は 2、medium は 4、large は 8、といった具合になります。これらの warehouse は
  データとは独立しており、オブジェクトストレージ上にある任意のデータベースに対して
  クエリを実行するために利用できます。クエリ負荷がなくアイドル状態の場合は
  warehouse は一時停止され、クエリが到着すると再開されます。ストレージコストは
  常に課金に反映されますが、warehouse はアクティブな間のみ課金されます。

* ClickHouse Cloud もローカルキャッシュストレージを持つノードという同様の原則を
  採用しています。T シャツサイズの代わりに、ユーザーは合計コンピュート量と利用可能な
  RAM を持つサービスをデプロイします。これは、クエリ負荷に基づいて（定義された範囲内で）
  透過的にオートスケールされます。すなわち、各ノードのリソースを増減することで垂直方向に、
  あるいはノード総数を増減することで水平方向にスケールします。ClickHouse Cloud の
  ノードは現在、Snowflake とは異なり、CPU とメモリの比率が 1:1 になっています。
  より緩い結合も可能ではありますが、現時点ではサービスは Snowflake の warehouse と
  異なりデータに結合されています。ノードはアイドル状態であれば一時停止され、
  クエリが発生すると再開されます。必要に応じてユーザーがサービスサイズを手動で
  変更することもできます。

* ClickHouse Cloud のクエリキャッシュは現在ノード固有であり、warehouse とは独立した
  サービスレイヤーで提供される Snowflake のキャッシュとは異なります。ベンチマークに
  基づくと、ClickHouse Cloud のノードキャッシュは Snowflake を上回る性能を示しています。



* Snowflake と ClickHouse Cloud は、クエリ同時実行数を増やすためのスケーリング手法が異なります。Snowflake は、[multi-cluster warehouses](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses) と呼ばれる機能によってこれに対応します。
  この機能により、ユーザーはウェアハウスにクラスターを追加できます。これによりクエリレイテンシが改善されることはありませんが、追加の並列化が可能になり、より高いクエリ同時実行数を許容できます。ClickHouse は、垂直スケーリングまたは水平スケーリングによってサービスにより多くのメモリと CPU を追加することで、同様のことを実現します。本ブログでは、より高い同時実行性へのスケーリングに関するこれらサービスの機能を詳細には扱わず、レイテンシに焦点を当てていますが、完全な比較のためにはこの検証も行うべきであると認識しています。ただし、[ウェアハウスごとの同時実行クエリ数をデフォルトで 8 に制限](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level) している Snowflake と比較すると、いかなる同時実行テストにおいても ClickHouse は良好な性能を発揮することが期待されます。
  比較として、ClickHouse Cloud はノードあたり最大 1000 クエリの実行を許可します。

* Snowflake は、データセットに対してコンピュートサイズを切り替える機能と、ウェアハウスの高速なレジューム時間を組み合わせることで、アドホッククエリにおいて優れた利用体験を提供します。データウェアハウスおよびデータレイクのユースケースでは、これは他のシステムに対する優位性となります。

### リアルタイム分析 {#real-time-analytics}

公開されている[ベンチマーク](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-)データに基づくと、
ClickHouse はリアルタイム分析アプリケーションにおいて、以下の領域で Snowflake を上回ります。

* **クエリレイテンシ**: Snowflake のクエリは、パフォーマンス最適化のためにテーブルにクラスタリングを適用している場合でも、より大きなクエリレイテンシを持ちます。弊社のテストでは、Snowflake は、フィルターが Snowflake のクラスタリングキーまたは ClickHouse のプライマリキーの一部であるクエリにおいて、ClickHouse と同等の性能を達成するために 2 倍以上のコンピュートリソースを必要としました。Snowflake の [persistent query cache](https://docs.snowflake.com/en/user-guide/querying-persisted-results) はこれらのレイテンシの課題の一部を相殺しますが、フィルター条件がより多様な場合には効果が薄くなります。このクエリキャッシュの有効性は、基盤となるデータの変更によってさらに低下する可能性があり、テーブルが変更されるとキャッシュエントリが無効化されます。本ベンチマークの対象アプリケーションではこの状況は発生していませんが、実際のデプロイメントでは新しい最新データを挿入する必要があります。なお、ClickHouse のクエリキャッシュはノード固有であり、[トランザクション一貫性はありません](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)。
  これにより、リアルタイム分析に[より適した](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)ものとなっています。ユーザーは、[クエリ単位での制御](/operations/settings/settings#use_query_cache)、[正確なサイズ指定](/operations/settings/settings#query_cache_max_size_in_bytes)、[クエリをキャッシュするかどうか](/operations/settings/settings#enable_writes_to_query_cache)（期間や必要実行回数の制限）、およびキャッシュを[受動的にのみ使用するかどうか](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings)といった、きめ細かな制御を行うことができます。

* **低コスト**: Snowflake のウェアハウスは、クエリの非アクティブ期間後にサスペンドされるよう設定できます。サスペンド状態になると、料金は発生しません。実際には、この非アクティブチェックは[最小で 60 秒までしか下げることができません](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)。
  ウェアハウスは、クエリを受信すると数秒以内に自動的にレジュームされます。Snowflake は、ウェアハウスが使用中の場合にのみリソースに対して課金するため、この挙動はアドホッククエリのように頻繁にアイドル状態になるワークロードに適しています。



  しかし、多くのリアルタイム分析ワークロードでは、継続的なリアルタイムデータのインジェストと、アイドル状態にしてもメリットが得られない（顧客向けダッシュボードのような）頻繁なクエリ実行が必要になります。これは、データウェアハウスを常時アクティブな状態で稼働させ、課金対象の状態にしておく必要があることを意味します。このことは、アイドル状態によるコスト削減効果を打ち消すだけでなく、Snowflake が代替手段よりも高速に応答可能な状態へ復帰できることに起因するパフォーマンス上の優位性も帳消しにしてしまいます。このアクティブ状態の要件と、アクティブ状態における 1 秒あたりコストが ClickHouse Cloud の方が低いことを組み合わせると、この種のワークロードに対して ClickHouse Cloud は総コストを大幅に低減できることになります。

* **機能の予測可能な料金:** マテリアライズドビューやクラスタリング（ClickHouse の ORDER BY と同等）は、リアルタイム分析ユースケースで最高レベルのパフォーマンスを達成するために必要です。これらの機能は Snowflake では追加料金の対象となり、コストを 1.5 倍に引き上げる上位ティアが必要になるだけでなく、予測しにくいバックグラウンドコストも発生します。たとえば、マテリアライズドビューにはバックグラウンドでのメンテナンスコストが発生し、クラスタリングにも同様のコストがかかりますが、これらは利用前に予測することが困難です。対照的に、ClickHouse Cloud では、これらの機能に追加コストは発生せず、挿入時に追加の CPU およびメモリを使用するのみであり、高頻度の挿入ワークロードユースケースを除けば通常は無視できる程度です。ベンチマークにおいて、こうした違いに加え、クエリレイテンシの低さと高い圧縮率により、ClickHouse ではコストを大幅に削減できることを確認しています。
