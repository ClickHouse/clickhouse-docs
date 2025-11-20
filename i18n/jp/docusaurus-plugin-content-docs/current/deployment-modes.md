---
slug: /deployment-modes
sidebar_label: 'デプロイモード'
description: 'ClickHouse には 4 つのデプロイオプションがあり、いずれも同じ強力なデータベースエンジンを使用していますが、用途に応じて最適な形で提供されています。'
title: 'デプロイモード'
keywords: ['Deployment Modes', 'chDB']
show_related_blogs: true
doc_type: 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse は多用途なデータベースシステムであり、ニーズに応じてさまざまな形態でデプロイできます。根本的には、どのデプロイオプションでも **同じ強力な ClickHouse データベースエンジンが使用されており**、異なるのはどのように扱うかと、どこで実行するかという点だけです。

大規模な本番分析の実行、ローカル環境でのデータ分析、アプリケーションの構築など、どのような場合でもユースケースに合わせて設計されたデプロイオプションがあります。基盤となるエンジンが共通しているため、どのデプロイメントモードでも同じ高いパフォーマンスと SQL 互換性を得ることができます。
このガイドでは、ClickHouse をデプロイおよび利用する主な 4 つの方法を紹介します。

* 従来型のクライアント/サーバー型デプロイメント向けの ClickHouse Server
* 完全マネージドなデータベース運用向けの ClickHouse Cloud
* コマンドラインでのデータ処理向けの clickhouse-local
* アプリケーションに ClickHouse を直接組み込むための chDB

それぞれのデプロイメントモードには、それぞれの強みと最適なユースケースがあり、以下で詳しく説明します。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## ClickHouse Server {#clickhouse-server}

ClickHouse Serverは従来のクライアント/サーバーアーキテクチャを採用しており、本番環境へのデプロイに最適です。このデプロイモードでは、ClickHouseの特長である高スループットと低レイテンシのクエリを実現する、完全なOLAPデータベース機能を提供します。

<Image img={chServer} alt='ClickHouse Server' size='sm' />

<br />

デプロイの柔軟性という点では、ClickHouse Serverは開発やテスト用にローカルマシンにインストールすることも、クラウドベースの運用のためにAWS、GCP、Azureなどの主要なクラウドプロバイダーにデプロイすることも、自社のオンプレミスハードウェアにセットアップすることも可能です。大規模な運用では、負荷の増加に対応し高可用性を提供するために、分散クラスターとして構成することができます。

このデプロイモードは、信頼性、パフォーマンス、および全機能へのアクセスが重要となる本番環境において、第一の選択肢となります。


## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview)は、ClickHouseのフルマネージド版であり、自社でのデプロイメント運用に伴う運用負荷を解消します。ClickHouse Serverのすべてのコア機能を維持しながら、開発と運用を効率化するために設計された追加機能により、利用体験を向上させます。

<Image img={chCloud} alt='ClickHouse Cloud' size='sm' />

ClickHouse Cloudの主な利点は、統合されたツール群です。[ClickPipes](/getting-started/quick-start/cloud/#clickpipes)は堅牢なデータ取り込みフレームワークを提供し、複雑なETLパイプラインを管理することなく、さまざまなソースからデータを簡単に接続してストリーミングできます。また、専用の[クエリAPI](/cloud/get-started/query-endpoints)を提供しており、アプリケーション構築を大幅に容易にします。

ClickHouse CloudのSQLコンソールには、クエリをインタラクティブな可視化に変換できる強力な[ダッシュボード](/cloud/manage/dashboards)機能が含まれています。保存されたクエリから構築されたダッシュボードを作成・共有でき、クエリパラメータを通じてインタラクティブな要素を追加することができます。これらのダッシュボードはグローバルフィルタを使用して動的にすることができ、カスタマイズ可能なビューを通じてデータを探索できます。ただし、可視化を表示するには、基盤となる保存されたクエリに対して少なくとも読み取りアクセス権が必要であることに注意してください。

監視と最適化のために、ClickHouse Cloudには組み込みのチャートと[クエリインサイト](/cloud/get-started/query-insights)が含まれています。これらのツールは、クラスタのパフォーマンスに対する深い可視性を提供し、クエリパターン、リソース使用率、潜在的な最適化の機会を理解するのに役立ちます。このレベルの可観測性は、インフラストラクチャ管理にリソースを割くことなく、高性能な分析運用を維持する必要があるチームにとって特に価値があります。

マネージドサービスという性質上、更新、バックアップ、スケーリング、セキュリティパッチについて心配する必要はありません。これらはすべて自動的に処理されます。そのため、データベース管理ではなく、データとアプリケーションに集中したい組織にとって理想的な選択肢となります。


## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local)は、ClickHouseの全機能をスタンドアロン実行ファイルとして提供する強力なコマンドラインツールです。基本的にはClickHouse Serverと同じデータベースですが、サーバーインスタンスを起動することなく、コマンドラインから直接ClickHouseの全機能を利用できるようパッケージ化されています。

<Image img={chLocal} alt='clickHouse-local' size='sm' />

このツールは、特にローカルファイルやクラウドストレージサービスに保存されたデータを扱う際のアドホックなデータ分析に優れています。ClickHouseのSQL方言を使用して、さまざまな形式(CSV、JSON、Parquetなど)のファイルを直接クエリできるため、迅速なデータ探索や単発の分析タスクに最適です。

clickhouse-localはClickHouseの全機能を含んでいるため、データ変換、形式変換、またはClickHouse Serverで通常行うその他のデータベース操作に使用できます。主に一時的な操作に使用されますが、必要に応じてClickHouse Serverと同じストレージエンジンを使用してデータを永続化することも可能です。

リモートテーブル関数とローカルファイルシステムへのアクセスを組み合わせることで、clickhouse-localは、ClickHouse Serverとローカルマシン上のファイル間でデータを結合する必要があるシナリオで特に有用です。これは、サーバーにアップロードしたくない機密データや一時的なローカルデータを扱う際に特に価値があります。


## chDB {#chdb}

[chDB](/chdb)は、インプロセスデータベースエンジンとして組み込まれたClickHouseで、Pythonが主要な実装ですが、Go、Rust、NodeJS、Bunでも利用可能です。このデプロイメント方式により、ClickHouseの強力なOLAP機能をアプリケーションのプロセス内に直接組み込むことができ、別途データベースをインストールする必要がなくなります。

<Image img={chDB} alt='chDB - 組み込みClickHouse' size='sm' />

chDBは、アプリケーションのエコシステムとシームレスに統合できます。例えばPythonでは、PandasやArrowなどの一般的なデータサイエンスツールと効率的に連携するよう最適化されており、Python memoryviewを通じてデータコピーのオーバーヘッドを最小限に抑えます。これにより、既存のワークフロー内でClickHouseのクエリパフォーマンスを活用したいデータサイエンティストやアナリストにとって特に有用です。

chDBは、clickhouse-localで作成されたデータベースにも接続でき、データの扱い方に柔軟性をもたらします。これにより、データアクセスパターンを変更することなく、ローカル開発、Pythonでのデータ探索、より永続的なストレージソリューション間をシームレスに移行できます。
