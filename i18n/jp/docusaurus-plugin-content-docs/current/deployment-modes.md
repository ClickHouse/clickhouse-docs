---
slug: /deployment-modes
sidebar_label: 'デプロイ方法'
description: 'ClickHouse には 4 つのデプロイ方法があり、いずれも同じ強力なデータベースエンジンを使用していますが、用途に合わせて最適な形でパッケージ化されています。'
title: 'デプロイ方法'
keywords: ['Deployment Modes', 'chDB']
show_related_blogs: true
doc_type: 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse は多用途なデータベースシステムであり、ニーズに応じて複数の方法でデプロイできます。すべてのデプロイ方法の中核にあるのは、**同じ強力な ClickHouse データベースエンジンを使用している** という点であり、異なるのは「どのように操作するか」と「どこで動作するか」です。

本番環境で大規模な分析を実行する場合でも、ローカル環境でデータ分析を行う場合でも、アプリケーションを構築する場合でも、ユースケースに合わせたデプロイオプションが用意されています。基盤となるエンジンが共通であるため、どのデプロイモードでも同じ高いパフォーマンスと SQL 互換性を得ることができます。
このガイドでは、ClickHouse をデプロイおよび利用する主な 4 つの方法を解説します:

* 従来のクライアント/サーバー型デプロイ向けの ClickHouse Server
* フルマネージドなデータベース運用向けの ClickHouse Cloud
* コマンドラインでのデータ処理向けの clickhouse-local
* アプリケーションに ClickHouse を直接組み込むための chDB

それぞれのデプロイモードには独自の強みと最適なユースケースがあり、以下で詳しく説明します。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## ClickHouse Server {#clickhouse-server}

ClickHouse Serverは従来のクライアント/サーバーアーキテクチャを採用しており、本番環境へのデプロイに最適です。このデプロイモードでは、ClickHouseの特長である高スループットと低レイテンシのクエリを実現する、完全なOLAPデータベース機能を提供します。

<Image img={chServer} alt='ClickHouse Server' size='sm' />

<br />

デプロイの柔軟性という点では、ClickHouse Serverは開発やテスト用にローカルマシンにインストールすることも、クラウドベースの運用のためにAWS、GCP、Azureなどの主要クラウドプロバイダーにデプロイすることも、自社のオンプレミスハードウェアにセットアップすることも可能です。大規模な運用では、負荷の増加に対応し高可用性を提供するために、分散クラスタとして構成できます。

このデプロイモードは、信頼性、パフォーマンス、完全な機能へのアクセスが重要となる本番環境において、第一の選択肢となります。


## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview)は、ClickHouseのフルマネージド版であり、独自のデプロイメントを運用する際の運用負荷を軽減します。ClickHouse Serverのすべてのコア機能を維持しながら、開発と運用を効率化するために設計された追加機能により、ユーザー体験を向上させます。

<Image img={chCloud} alt='ClickHouse Cloud' size='sm' />

ClickHouse Cloudの主な利点は、統合されたツール群です。[ClickPipes](/getting-started/quick-start/cloud/#clickpipes)は堅牢なデータ取り込みフレームワークを提供し、複雑なETLパイプラインを管理することなく、さまざまなソースからデータを簡単に接続してストリーミングできます。また、プラットフォームは専用の[クエリAPI](/cloud/get-started/query-endpoints)を提供しており、アプリケーションの構築が大幅に容易になります。

ClickHouse CloudのSQLコンソールには、クエリをインタラクティブな可視化に変換できる強力な[ダッシュボード](/cloud/manage/dashboards)機能が含まれています。保存されたクエリから構築されたダッシュボードを作成して共有でき、クエリパラメータを通じてインタラクティブな要素を追加できます。これらのダッシュボードはグローバルフィルタを使用して動的にすることができ、カスタマイズ可能なビューを通じてデータを探索できます。ただし、可視化を表示するには、基盤となる保存されたクエリに対して少なくとも読み取りアクセス権が必要であることに注意してください。

監視と最適化のために、ClickHouse Cloudには組み込みのチャートと[クエリインサイト](/cloud/get-started/query-insights)が含まれています。これらのツールは、クラスタのパフォーマンスに対する詳細な可視性を提供し、クエリパターン、リソース使用率、潜在的な最適化の機会を理解するのに役立ちます。このレベルの可観測性は、インフラストラクチャ管理にリソースを割くことなく、高性能な分析運用を維持する必要があるチームにとって特に有用です。

マネージドサービスという性質により、更新、バックアップ、スケーリング、セキュリティパッチについて心配する必要はありません。これらはすべて自動的に処理されます。これにより、データベース管理ではなく、データとアプリケーションに集中したい組織にとって理想的な選択肢となります。


## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local)は、ClickHouseの全機能をスタンドアロン実行ファイルとして提供する強力なコマンドラインツールです。基本的にはClickHouse Serverと同じデータベースですが、サーバーインスタンスを起動することなく、コマンドラインから直接ClickHouseの全機能を利用できるようパッケージ化されています。

<Image img={chLocal} alt='clickHouse-local' size='sm' />

このツールは、特にローカルファイルやクラウドストレージサービスに保存されたデータを扱う際のアドホックなデータ分析に優れています。ClickHouseのSQL方言を使用して、様々な形式(CSV、JSON、Parquetなど)のファイルを直接クエリできるため、迅速なデータ探索や単発の分析タスクに最適な選択肢となります。

clickhouse-localはClickHouseの全機能を含んでいるため、データ変換、フォーマット変換、またはClickHouse Serverで通常行うその他のデータベース操作に使用できます。主に一時的な操作に使用されますが、必要に応じてClickHouse Serverと同じストレージエンジンを使用してデータを永続化することも可能です。

リモートテーブル関数とローカルファイルシステムへのアクセスを組み合わせることで、clickhouse-localは、ClickHouse Serverとローカルマシン上のファイル間でデータを結合する必要があるシナリオで特に有用です。これは、サーバーにアップロードしたくない機密データや一時的なローカルデータを扱う際に特に価値があります。


## chDB {#chdb}

[chDB](/chdb)は、ClickHouseをインプロセスデータベースエンジンとして組み込んだもので、Pythonが主要な実装ですが、Go、Rust、NodeJS、Bunでも利用可能です。このデプロイメント方式により、ClickHouseの強力なOLAP機能をアプリケーションのプロセス内に直接組み込むことができ、別途データベースをインストールする必要がなくなります。

<Image img={chDB} alt='chDB - 組み込みClickHouse' size='sm' />

chDBは、アプリケーションのエコシステムとシームレスに統合できます。例えばPythonでは、PandasやArrowなどの一般的なデータサイエンスツールと効率的に連携するよう最適化されており、Python memoryviewを通じてデータコピーのオーバーヘッドを最小限に抑えます。これにより、既存のワークフロー内でClickHouseのクエリパフォーマンスを活用したいデータサイエンティストやアナリストにとって特に有用です。

chDBは、clickhouse-localで作成されたデータベースにも接続でき、データの扱い方に柔軟性をもたらします。これにより、ローカル開発、Pythonでのデータ探索、より永続的なストレージソリューション間をシームレスに移行でき、データアクセスパターンを変更する必要がありません。
