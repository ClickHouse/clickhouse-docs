---
'slug': '/deployment-modes'
'sidebar_label': 'デプロイメントモード'
'description': 'ClickHouseは、特定のニーズに合わせて異なるパッケージで提供される同じ強力な DATABASE エンジンを使用する4つのデプロイメントオプションを提供します。'
'title': 'デプロイメントモード'
'keywords':
- 'Deployment Modes'
- 'chDB'
'show_related_blogs': true
'doc_type': 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouseは、ニーズに応じてさまざまな方法で展開できる多目的なデータベースシステムです。そのコアには、すべての展開オプションが**同じ強力なClickHouseデータベースエンジン**を使用しています - 違いは、それとどのように対話し、どこで実行するかです。

大規模な分析を本番環境で実行する場合でも、ローカルデータ分析を行う場合でも、アプリケーションを構築する場合でも、使用ケースに特化した展開オプションが用意されています。基盤となるエンジンの一貫性は、すべての展開モードで同じ高いパフォーマンスとSQL互換性を提供します。このガイドでは、ClickHouseを展開して使用する4つの主な方法について探ります。

* 伝統的なクライアント/サーバー展開のためのClickHouse Server
* 完全に管理されたデータベース操作のためのClickHouse Cloud
* コマンドラインデータ処理のためのclickhouse-local
* ClickHouseをアプリケーションに直接埋め込むchDB

各展開モードには独自の強みと理想的な使用ケースがあり、以下で詳細に探ります。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Serverは、伝統的なクライアント/サーバーアーキテクチャを表し、本番環境での展開に最適です。この展開モードは、高スループットで低遅延のクエリを備えた完全なOLAPデータベース機能を提供します。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

展開の柔軟性に関しては、ClickHouse Serverは開発やテストのためにローカルマシンにインストールすることも、AWS、GCP、Azureなどの主要なクラウドプロバイダーに展開することも、自前のオンプレミスハードウェアにセットアップすることもできます。より大規模な運用においては、負荷の増加に対応し、高可用性を提供するために分散クラスターとして構成できます。

この展開モードは、信頼性、パフォーマンス、完全な機能アクセスが重要な本番環境において選ばれる選択肢です。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview)は、自己展開を運用する手間を取り除いた完全管理型のClickHouseバージョンです。ClickHouse Serverのすべてのコア機能を維持しつつ、開発と運用を合理化するための追加機能が装備されています。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloudの主な利点の1つは、統合されたツールです。[ClickPipes](/getting-started/quick-start/cloud/#clickpipes)は、さまざまなソースからデータを簡単に接続しストリーミングできる堅牢なデータ取り込みフレームワークを提供し、複雑なETLパイプラインを管理することなく利用できます。このプラットフォームは専用の[クエリAPI](/cloud/get-started/query-endpoints)も提供し、アプリケーションの構築が大幅に簡素化されます。

ClickHouse CloudのSQLコンソールには、クエリをインタラクティブなビジュアリゼーションに変換する強力な[ダッシュボード](/cloud/manage/dashboards)機能があります。保存したクエリから作成したダッシュボードを作成・共有でき、クエリパラメーターを使ってインタラクティブな要素を追加できます。これらのダッシュボードはグローバルフィルターを使用して動的にすることができ、ユーザーがカスタマイズ可能なビューを通じてデータを探索できるようになります。ただし、視覚化を表示するためには、ユーザーが基盤となる保存されたクエリへの読み取りアクセスを持っている必要があります。

モニタリングと最適化のために、ClickHouse Cloudには内蔵のチャートと[クエリインサイト](/cloud/get-started/query-insights)が含まれており、クラスターのパフォーマンスについて深い可視性を提供します。これにより、クエリパターン、リソース利用状況、潜在的な最適化機会を理解するのに役立ちます。このレベルの観測可能性は、インフラ管理にリソースを割くことなく高パフォーマンスの分析業務を維持する必要があるチームにとって特に価値があります。

サービスの管理された性質により、アップデート、バックアップ、スケーリング、セキュリティパッチについて心配する必要がありません - これらはすべて自動的に処理されます。これにより、データやアプリケーションに集中したい組織にとって理想的な選択肢となっています。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local)は、スタンドアロン実行可能ファイル内でClickHouseの完璧な機能を提供する強力なコマンドラインツールです。本質的にはClickHouse Serverと同じデータベースですが、サーバーインスタンスを実行せずにコマンドラインからClickHouseのすべての機能を活用できるようにパッケージ化されています。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

このツールは、その場でのデータ分析に優れており、特にローカルファイルやクラウドストレージサービスに保存されたデータを扱う際に役立ちます。ClickHouseのSQLダイアレクトを使用して、さまざまなフォーマット（CSV、JSON、Parquetなど）のファイルを直接クエリできるため、迅速なデータ探索や一回限りの分析タスクに最適です。

clickhouse-localにはClickHouseのすべての機能が含まれているため、データ変換、フォーマット変換、または通常クリックハウスサーバーで行う他のデータベース操作に使用できます。主に一時的な操作に使用されますが、必要に応じてClickHouse Serverと同じストレージエンジンを使用してデータを保存することもできます。

リモートテーブル関数とローカルファイルシステムへのアクセスの組み合わせにより、clickhouse-localはClickHouse Serverとローカルマシン上のファイル間でデータを結合する必要があるシナリオに特に役立ちます。これは、サーバーにアップロードしたくないセンシティブまたは一時的なローカルデータを扱う際に特に価値があります。

## chDB {#chdb}

[chDB](/chdb)は、プロセス内データベースエンジンとして埋め込まれたClickHouseであり、Pythonが主な実装ですが、Go、Rust、NodeJS、Bunでも利用可能です。この展開オプションは、ClickHouseの強力なOLAP機能をアプリケーションのプロセス内に直接持ち込み、別のデータベースインストールの必要を排除します。

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDBは、アプリケーションのエコシステムとのシームレスな統合を提供します。例えば、Pythonでは、PandasやArrowなど一般的なデータサイエンスツールと効率的に機能するように最適化されており、Pythonのメモリビューを通じてデータコピーのオーバーヘッドを最小限に抑えます。これにより、既存のワークフロー内でClickHouseのクエリパフォーマンスを活用したいデータサイエンティストやアナリストにとって特に価値があります。

chDBは、clickhouse-localで作成されたデータベースにも接続可能で、データを扱う柔軟性を提供します。これにより、ローカル開発、Pythonでのデータ探索、より永続的なストレージソリューション間でデータアクセスパターンを変えることなくシームレスに移行できます。
