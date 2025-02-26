---
sidebar_label: デプロイメントモード
description: "ClickHouseは、ニーズに応じて異なる形でパッケージ化された同じ強力なデータベースエンジンを持つ4つのデプロイメントオプションを提供します。"
title: デプロイメントモード
---

ClickHouseは、ニーズに応じて複数の異なる方法でデプロイできる多用途のデータベースシステムです。そのコアでは、すべてのデプロイメントオプションは**同じ強力なClickHouseデータベースエンジン**を使用していますが、違いはそのインタラクションの方法と実行される場所です。

大規模な分析を本番環境で実行する場合でも、ローカルデータ分析を行う場合でも、アプリケーションを構築する場合でも、あなたのユースケースに最適化されたデプロイメントオプションがあります。基盤となるエンジンの一貫性により、すべてのデプロイメントモードで同じ高性能とSQLコンパチビリティを得られます。
このガイドでは、ClickHouseをデプロイおよび使用する4つの主要な方法を探ります：

* 伝統的なクライアント/サーバー向けのClickHouse Server
* 完全に管理されたデータベース操作のためのClickHouse Cloud
* コマンドラインデータ処理用のclickhouse-local
* アプリケーションにClickHouseを直接組み込むためのchDB

各デプロイメントモードには、それぞれの強みと理想的なユースケースがあり、以下で詳細に探ります。 

<iframe width="560" height="315" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Serverは、伝統的なクライアント/サーバーアーキテクチャを表し、本番環境に最適です。このデプロイメントモードは、ClickHouseが知られる高スループットで低レイテンシのクエリを持つ完全なOLAPデータベース機能を提供します。

<img src={require('./images/deployment-modes/ch-server.png').default} alt='ClickHouse Cloud' class='image' style={{width: '50%'}} />
<br/>

デプロイメントの柔軟性に関しては、ClickHouse Serverは、開発やテストのためにローカルマシンにインストールしたり、AWS、GCP、Azureなどの主要なクラウドプロバイダーにデプロイしたり、独自のオンプレミスハードウェアにセットアップしたりできます。より大規模な運用のためには、分散クラスターとして構成され、負荷の増加を処理し、高可用性を提供できます。

このデプロイメントモードは、信頼性、パフォーマンス、および完全な機能アクセスが重要な本番環境にとっての選択肢となります。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview)は、独自のデプロイメントを運用するためのオーバーヘッドを取り除いた完全管理されたバージョンです。ClickHouse Serverのすべてのコア機能を維持しつつ、開発と運用を効率化するための追加機能で体験を向上させています。

<img src={require('./images/deployment-modes/ch-cloud.png').default} alt='ClickHouse Cloud' class='image' style={{width: '50%'}} />
<br/>

ClickHouse Cloudの主な利点は、その統合ツールです。[ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes)は、強力なデータ取り込みフレームワークを提供し、さまざまなソースからデータを簡単に接続およびストリーミングできます。これにより、複雑なETLパイプラインを管理することなくデータを扱うことができます。また、プラットフォームは専用の[クエリAPI](/cloud/get-started/query-endpoints)を提供し、アプリケーションを構築するのが非常に簡単になります。

ClickHouse CloudのSQLコンソールには、クエリをインタラクティブなビジュアライゼーションに変換できる強力な[ダッシュボード](/cloud/manage/dashboards)機能が含まれています。保存したクエリから構築されたダッシュボードを作成し、共有できるほか、クエリパラメータを介してインタラクティブ要素を追加することも可能です。これらのダッシュボードは、グローバルフィルターを使用して動的にすることができ、ユーザーがカスタマイズ可能なビューを介してデータを探ることができます。ただし、視覚化を表示するには、ユーザーが基盤となる保存されたクエリへの読み取りアクセスを持っている必要があることに留意してください。

監視と最適化のために、ClickHouse Cloudには組み込みのチャートと[クエリインサイト](/cloud/get-started/query-insights)が含まれています。これらのツールは、クラスターのパフォーマンスに深い可視性を提供し、クエリパターン、リソース使用状況、および潜在的な最適化の機会を理解するのに役立ちます。このレベルの可視性は、インフラ管理にリソースを割かずに高性能な分析オペレーションを維持する必要があるチームにとって特に価値があります。

サービスの管理された性質により、更新、バックアップ、スケーリング、またはセキュリティパッチの心配をする必要はありません。これらはすべて自動的に処理されます。これにより、データやアプリケーションに集中したい組織にとって理想的な選択肢となります。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local)は、スタンドアロンの実行可能ファイルでClickHouseの完全な機能を提供する強力なコマンドラインツールです。基本的にはClickHouse Serverと同じデータベースですが、サーバーインスタンスを実行せずにコマンドラインからClickHouseのすべての機能を活用できるようにパッケージ化されています。

<img src={require('./images/deployment-modes/ch-local.png').default} alt='ClickHouse Cloud' class='image' style={{width: '50%'}} />
<br/>

このツールは、特にローカルファイルやクラウドストレージサービスに保存されたデータでのアドホックなデータ分析に優れています。ClickHouseのSQL方言を使用して、さまざまな形式（CSV、JSON、Parquetなど）のファイルを直接クエリできます。これにより、迅速なデータ探索や一時的な分析タスクに最適な選択肢となります。

clickhouse-localはClickHouseのすべての機能を含んでいるため、データ変換、形式変換、または通常ClickHouse Serverで行う他のデータベース操作にも使用できます。主に一時的な操作に使用されますが、必要に応じてClickHouse Serverと同じストレージエンジンを使用してデータを永続化することもできます。

リモートテーブル機能とローカルファイルシステムへのアクセスの組み合わせにより、clickhouse-localはClickHouse Serverとローカルマシン上のファイル間でデータを結合する必要があるシナリオに特に便利です。これは、サーバーにアップロードしたくない機密または一時的なローカルデータを扱う際に特に価値があります。

## chDB {#chdb}

[chDB](/chdb)は、プロセス内データベースエンジンとして埋め込まれたClickHouseで、Pythonが主要な実装言語ですが、Go、Rust、NodeJS、Bunにも対応しています。このデプロイメントオプションは、ClickHouseの強力なOLAPの能力をアプリケーションのプロセスに直接取り入れ、別のデータベースインストールの必要性を排除します。

<img src={require('./images/deployment-modes/chdb.png').default} alt='ClickHouse Cloud' class='image' style={{width: '50%'}} />
<br/>

chDBは、アプリケーションのエコシステムとのシームレスな統合を提供します。Pythonの場合、PandasやArrowなどの一般的なデータサイエンスツールと効率的に動作するように最適化されており、Pythonのメモリビューを通じてデータコピーのオーバーヘッドを最小限に抑えます。これにより、ClickHouseのクエリパフォーマンスを既存のワークフロー内で活用したいデータサイエンティストやアナリストにとって特に価値があります。

chDBは、clickhouse-localで作成されたデータベースにも接続可能で、データとの作業方法に柔軟性を提供します。これにより、ローカル開発、Pythonでのデータ探索、より永続的なストレージソリューションへのシームレスな移行が可能になり、データアクセスパターンを変更することなく行えます。
