---
'slug': '/deployment-modes'
'sidebar_label': 'デプロイメントモード'
'description': 'ClickHouseは、すべて同じ強力なデータベースエンジンを使用する4つのデプロイメントオプションを提供しており、特定のニーズに合わせて異なる形でパッケージ化されています。'
'title': 'デプロイメントモード'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouseは、ニーズに応じていくつかの異なる方法で展開できる多目的なデータベースシステムです。その核となるのは、すべての展開オプションが**同じ強力なClickHouseデータベースエンジンを使用する**ことです - 異なるのは、それとの対話方法と実行場所です。

大規模な分析を本番環境で実行している場合でも、ローカルデータ分析を行っている場合でも、アプリケーションを構築している場合でも、あなたのユースケースに合った展開オプションがあります。基盤となるエンジンの一貫性により、すべての展開モードで同様の高いパフォーマンスとSQL互換性が得られます。
このガイドでは、ClickHouseを展開および利用する主要な4つの方法を探ります：

* 伝統的なクライアント/サーバー展開のためのClickHouse Server
* 完全に管理されたデータベース操作のためのClickHouse Cloud
* コマンドラインデータ処理用のclickhouse-local
* アプリケーションに直接ClickHouseを埋め込むためのchDB

各展開モードには自身の強みと理想的なユースケースがあり、以下で詳しく探ります。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Serverは伝統的なクライアント/サーバーアーキテクチャを表し、本番環境に最適です。この展開モードは、高スループットおよび低レイテンシのクエリを伴う完全なOLAPデータベース機能を提供し、ClickHouseの特徴です。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

展開の柔軟性に関しては、ClickHouse Serverは、開発やテストのためにローカルマシンにインストールしたり、AWS、GCP、Azureなどの主要なクラウドプロバイダーに展開したり、オンプレミスのハードウェアに設定したりできます。より大規模な運用の場合、分散クラスターとして設定し、負荷の増加に対応し、高可用性を提供できます。

この展開モードは、信頼性、パフォーマンス、およびフル機能アクセスが重要な本番環境の標準的な選択肢です。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview)は、独自の展開を運用するためのオーバーヘッドを取り除いた完全管理型のClickHouseバージョンです。ClickHouse Serverのすべてのコア機能を保持しつつ、開発と運用をスムーズにする追加機能で体験を強化します。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloudの主な利点は、統合されたツールです。[ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes)は、複雑なETLパイプラインを管理せずに、さまざまなソースからデータを簡単に接続し、ストリームするための堅牢なデータ取り込みフレームワークを提供します。このプラットフォームは、アプリケーションを構築する際に大幅に簡素化された専用の[クエリAPI](/cloud/get-started/query-endpoints)も提供します。

ClickHouse CloudのSQLコンソールには、クエリをインタラクティブな視覚化に変換できる強力な[ダッシュボード](/cloud/manage/dashboards)機能が含まれています。保存されたクエリから構築されたダッシュボードを作成して共有することができ、クエリパラメータを通じてインタラクティブな要素を追加できます。これらのダッシュボードはグローバルフィルターを使用してダイナミックにすることができ、ユーザーはカスタマイズ可能なビューを通じてデータを探索できます - ただし、視覚化を表示するには、少なくとも保存されたクエリへの読み取りアクセスが必要です。

監視と最適化のために、ClickHouse Cloudには組み込みのチャートと[クエリインサイト](/cloud/get-started/query-insights)が含まれています。これらのツールは、クラスターのパフォーマンスに対する深い可視性を提供し、クエリパターン、リソースの使用状況、および最適化機会を理解する手助けをします。このレベルの可観測性は、高性能の分析運用を維持する必要があるチームにとって特に価値があります。

サービスの管理された性質により、更新、バックアップ、スケーリング、またはセキュリティパッチについて心配する必要はありません - これらはすべて自動的に処理されます。これにより、データやアプリケーションに集中したい組織にとって理想的な選択肢となります。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local)は、スタンドアロン実行可能ファイルでClickHouseの完全な機能を提供する強力なコマンドラインツールです。基本的にはClickHouse Serverと同じデータベースですが、サーバーインスタンスを実行せずにコマンドラインからClickHouseのすべての機能を直接活用できるようにパッケージ化されています。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

このツールは、ローカルファイルやクラウドストレージサービスに保存されたデータでのアドホックデータ分析に優れています。ClickHouseのSQL方言を使用して、さまざまな形式（CSV、JSON、Parquetなど）のファイルを直接クエリすることができ、迅速なデータ探索や一時的な分析タスクに最適な選択肢です。

clickhouse-localにはClickHouseのすべての機能が含まれているため、データ変換、形式変換、または通常ClickHouse Serverで行う他のデータベース操作に使用できます。主に一時的な操作に使用されますが、必要に応じてClickHouse Serverと同じストレージエンジンを使用してデータを保持することも可能です。

リモートテーブル関数とローカルファイルシステムへのアクセスの組み合わせにより、clickhouse-localはClickHouse Serverとローカルマシンのファイル間でデータを結合する必要があるシナリオで特に便利です。これは、サーバーにアップロードしたくない機密性の高いまたは一時的なローカルデータを扱う際に特に価値があります。

## chDB {#chdb}

[chDB](/chdb)は、プロセス内データベースエンジンとして埋め込まれたClickHouseであり、主にPythonが実装されていますが、Go、Rust、NodeJS、Bunでも利用可能です。この展開オプションは、ClickHouseの強力なOLAP機能をアプリケーションのプロセス内に直接取り込み、別のデータベースインストールの必要を排除します。

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDBはアプリケーションのエコシステムとのシームレスな統合を提供します。例えば、Pythonでは、PandasやArrowなどの一般的なデータサイエンスツールと効率的に連携するように最適化されており、Pythonのmemoryviewを介してデータコピーのオーバーヘッドを最小限に抑えています。これにより、ClickHouseのクエリパフォーマンスを既存のワークフロー内で利用したいデータサイエンティストやアナリストにとって特に価値があります。

chDBはまた、clickhouse-localで作成されたデータベースに接続できるため、データを扱う方法に柔軟性をもたらします。これにより、ローカル開発、Pythonでのデータ探索、およびより永続的なストレージソリューション間でシームレスに移行でき、データアクセスパターンを変更することなく利用できます。
