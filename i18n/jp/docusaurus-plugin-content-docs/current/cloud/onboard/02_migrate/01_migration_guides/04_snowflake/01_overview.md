---
'sidebar_label': '概要'
'slug': '/migrations/snowflake-overview'
'description': 'Snowflake から ClickHouse への移行'
'keywords':
- 'Snowflake'
'title': 'Snowflake から ClickHouse への移行'
'show_related_blogs': true
'doc_type': 'guide'
---

import snowflake_architecture from '@site/static/images/cloud/onboard/discover/use_cases/snowflake_architecture.png';
import cloud_architecture from '@site/static/images/cloud/onboard/discover/use_cases/cloud_architecture.png';
import Image from '@theme/IdealImage';


# Snowflake から ClickHouse への移行

> この文書は、Snowflake から ClickHouse へのデータ移行の概要を提供します。

Snowflake は、従来のオンプレミスデータウェアハウスのワークロードをクラウドに移行することに主に焦点を当てたクラウドデータウェアハウスです。長時間実行されるレポートを大規模に実行するために最適化されています。データセットがクラウドに移行する際、データの所有者は内部および外部のユースケースのためにリアルタイムアプリケーションを強化するためにこれらのデータセットをどのように活用できるかを考え始めます。このような場合、リアルタイム分析を最適化したデータベース、例えば ClickHouse が必要であることに気づくことが多いです。

## 比較 {#comparison}

このセクションでは、ClickHouse と Snowflake の主要な機能を比較します。

### 類似点 {#similarities}

Snowflake は、データの保存、処理、分析のためのスケーラブルで効率的なソリューションを提供するクラウドベースのデータウェアハウスプラットフォームです。 
ClickHouse と同様に、Snowflake は既存の技術に基づいていませんが、独自の SQL クエリエンジンとカスタムアーキテクチャに依存しています。

Snowflake のアーキテクチャは、共有ストレージ（共有ディスク）アーキテクチャと共有無（shared-nothing）アーキテクチャのハイブリッドとして説明されます。共有ストレージアーキテクチャでは、データはすべてのコンピュートノードからアクセス可能で、S3 などのオブジェクトストアを使用します。共有無アーキテクチャでは、各コンピュートノードが完全なデータセットの一部をローカルに保存してクエリに応答します。この理論により、共有ディスクアーキテクチャのシンプルさと共有無アーキテクチャのスケーラビリティという、両方のモデルの良いところを享受できます。

この設計は根本的にオブジェクトストレージを主要なストレージメディアとして使用し、同時アクセス時にほぼ無限にスケーラブルでありながら、高い耐久性とスケーラブルなスループットの保証を提供します。

以下の画像は [docs.snowflake.com](https://docs.snowflake.com/en/user-guide/intro-key-concepts) からのアーキテクチャを示しています：

<Image img={snowflake_architecture} size="md" alt="Snowflake architecture" />

一方、オープンソースでクラウドホストされた製品である ClickHouse は、共有ディスクアーキテクチャと共有無アーキテクチャの両方にデプロイ可能です。後者は、セルフマネージドデプロイメントで一般的です。CPU とメモリを容易にスケーリングできる一方で、共有無構成は古典的なデータ管理の課題や、特にメンバーシップの変更時にデータ複製のオーバーヘッドをもたらします。

この理由から、ClickHouse Cloud は Snowflake に概念的に類似した共有ストレージアーキテクチャを利用しています。データはオブジェクトストア（単一のコピー）に一度保存され、S3 や GCS のように、ほぼ無限のストレージと強力な冗長性の保証を提供します。各ノードはこのデータの単一コピーに加え、キャッシュ目的の自身のローカル SSD にもアクセス可能です。ノードは、必要に応じて追加の CPU とメモリリソースを提供するためにスケーリングできます。Snowflake と同様に、S3 のスケーラビリティ特性は、追加のノードが追加されてもクラスタ内の現在のノードに利用可能な I/O スループットに影響を与えないようにすることで、共有ディスクアーキテクチャの古典的な制限（ディスクI/O とネットワークボトルネック）に対処します。

<Image img={cloud_architecture} size="md" alt="ClickHouse Cloud architecture" />

### 違い {#differences}

根本的なストレージフォーマットとクエリエンジンを除けば、これらのアーキテクチャにはいくつかの微妙な違いがあります：

* Snowflake では、コンピュートリソースは [ウェアハウス](https://docs.snowflake.com/en/user-guide/warehouses) の概念を通じて提供されます。これらは、設定サイズのノードの数で構成されています。Snowflake はウェアハウスの具体的なアーキテクチャを公表していませんが、各ノードは 8 vCPU、16GiB、および 200GB のローカルストレージ（キャッシュ用）で構成されていることが [一般に理解されています](https://select.dev/posts/snowflake-warehouse-sizing)。ノードの数は、Tシャツサイズに依存します。たとえば、x-small には 1 ノード、small には 2、medium には 4、large には 8 などがあります。これらのウェアハウスはデータとは独立しており、オブジェクトストレージに存在する任意のデータベースをクエリするために使用できます。アイドル状態でクエリ負荷を受けていない場合、ウェアハウスは一時停止され、クエリが受信されると再開します。ストレージコストは常に請求に反映されますが、ウェアハウスはアクティブなときのみ課金されます。

* ClickHouse Cloud では、ローカルキャッシュストレージを持つノードという同様の概念が利用されています。Tシャツサイズの代わりに、ユーザーは合計計算量と利用可能な RAM を持つサービスをデプロイします。これにより、クエリ負荷に基づいて（定義された制限内で）自動的にスケールします - ノードごとのリソースを増加（または減少）させる垂直スケーリング、またはノードの総数を増減させる水平スケーリングによってです。ClickHouse Cloud のノードは現在 1 CPU-to-memory 比率を持ち、Snowflake の 1 とは異なります。よりゆるい結合が可能ではありますが、サービスは現在データに結合されており、Snowflake のウェアハウスとは異なります。ノードもアイドル状態であれば一時停止し、クエリが発生すると再開します。必要に応じてユーザーはサービスを手動でサイズ変更することもできます。

* ClickHouse Cloud のクエリキャッシュは現在ノード固有であり、Snowflake のそれはウェアハウスとは独立したサービス層で提供されます。ベンチマークに基づくと、ClickHouse Cloud のノードキャッシュは Snowflake のものを上回っています。

* Snowflake と ClickHouse Cloud は、クエリの同時実行数を増やすための異なるアプローチを採用しています。Snowflake は、[マルチクラスタウェアハウス](https://docs.snowflake.com/en/user-guide/warehouses-multicluster#benefits-of-multi-cluster-warehouses) と呼ばれる機能を通じてこれに対処しています。この機能は、ユーザーがウェアハウスにクラスターを追加できるようにします。この方法はクエリのレイテンシを改善するわけではありませんが、追加の並列処理を提供し、より高いクエリの同時実行を可能にします。ClickHouse は、垂直または水平スケーリングを通じてサービスに追加のメモリと CPU を追加することによってこれを実現します。このブログでは、より高い同時実行性にスケールするこれらのサービスの能力を探究することはしませんが、レイテンシに焦点を当てることを認識しており、完全な比較のためにこの作業が行われるべきであると考えています。しかし、ClickHouse はあらゆる同時実行性テストで良好なパフォーマンスを発揮することが期待され、Snowflake は、[ウェアハウスの同時実行クエリ数をデフォルトで 8 に制限している](https://docs.snowflake.com/en/sql-reference/parameters#max-concurrency-level)ことを明示的に制限しています。それに対して ClickHouse Cloud は、ノードごとに最大 1000 クエリを実行することが可能です。

* Snowflake のデータセットのコンピュートサイズを切り替える能力と、ウェアハウスの迅速な再開時間によって、アドホッククエリのための優れたエクスペリエンスが提供されます。データウェアハウスおよびデータレイクのユースケースでは、これは他のシステムに対して利点を提供します。

### リアルタイム分析 {#real-time-analytics}

公開された [ベンチマーク](https://benchmark.clickhouse.com/#system=+%E2%98%81w|%EF%B8%8Fr|C%20c|nfe&type=-&machine=-ca2|gl|6ax|6ale|3al&cluster_size=-&opensource=-&tuned=+n&metric=hot&queries=-) データに基づくと、
ClickHouse は以下の点において Snowflake よりもリアルタイム分析アプリケーションで優れた性能を発揮します：

* **クエリレイテンシ**: Snowflake のクエリは、パフォーマンスを最適化するためにテーブルにクラスタリングが適用されていても、高いクエリレイテンシを示します。私たちのテストでは、Snowflake は、Snowflake のクラスタリングキーあるいは ClickHouse の主キーの一部であるフィルタが適用されるクエリにおいて、同等の ClickHouse のパフォーマンスを達成するために 2 倍以上の計算リソースを必要とします。Snowflake の [永続クエリキャッシュ](https://docs.snowflake.com/en/user-guide/querying-persisted-results) はこれらのレイテンシの課題のいくつかを軽減しますが、フィルタ基準がより多様である場合にはあまり効果的ではありません。このクエリキャッシュの効果は、データの変更によってさらに影響を受け、テーブルが変更されるとキャッシュエントリが無効になります。この場合、アプリケーションのベンチマークには当てはまりませんが、実際のデプロイメントでは新しい、最近のデータの挿入が必要です。ClickHouse のクエリキャッシュはノード固有で、[トランザクション整合性がない](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)ため、リアルタイム分析に [より適しています](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design)。ユーザーは、[クエリ毎にキャッシュの使用を制御する](https://operations/settings/settings#use_query_cache)、その [正確なサイズを制御する](https://operations/settings/settings#query_cache_max_size_in_bytes)、[クエリがキャッシュされるかを制御する](https://operations/settings/settings#enable_writes_to_query_cache) （持続時間や実行回数の制限）、そして [受動的に使用されるかを制御する](https://clickhouse.com/blog/introduction-to-the-clickhouse-query-cache-and-design#using-logs-and-settings) ことで、その使用について詳細な制御を持っています。

* **コスト削減**: Snowflake のウェアハウスは、クエリ非アクティビティの期間後に一時停止するように構成できます。一旦一時停止すると、料金は発生しません。実際には、この非アクティビティチェックは [60 秒にまでしか低下できません](https://docs.snowflake.com/en/sql-reference/sql/alter-warehouse)。クエリが受信されると、ウェアハウスは数秒以内に自動的に再開されます。Snowflake はウェアハウスが使用されているときのみリソースに対して課金されるため、この動作は、アドホッククエリのようにしばしばアイドル状態になるワークロードに対応します。

  しかし、リアルタイム分析の多くのワークロードでは、継続的なリアルタイムデータの取り込みや頻繁なクエリ実行が求められ、アイドル状態からの恩恵を受けないことが多いです（顧客向けのダッシュボードなど）。このため、ウェアハウスはしばしば完全にアクティブであり、課金が発生する必要があります。これにより、アイドル状態のコスト効果や、Snowflake の迅速な応答状態による利点が無効になります。このアクティブ状態の要件は、ClickHouse Cloud のアクティブ状態における低コストと相まって、これらのワークロードに対して ClickHouse Cloud が大幅に低い総コストを提供する結果になります。

* **機能の予測可能な価格設定**: Materialized View やクラスタリング（ClickHouse の ORDER BY に相当）などの機能は、リアルタイム分析ユースケースで最高の性能レベルに到達するために必要です。これらの機能は Snowflake で追加料金が発生し、単により高いティアを要求するため、クレジット単価を 1.5 倍に引き上げるだけでなく、予測不可能なバックグラウンドコストも発生します。たとえば、Materialized View は、使用前に予測が難しいバックグラウンドメンテナンスコストも発生します。それに対して、これらの機能は ClickHouse Cloud では追加コストが発生せず、通常、高い挿入ワークロード以外では無視できる程度の追加 CPU とメモリ使用が発生するだけです。私たちのベンチマークでも、これらの違いが、クエリレイテンシの低さや圧縮の高いことと相まって、ClickHouse のコストを大幅に削減することを観察しました。
