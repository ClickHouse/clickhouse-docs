---
slug: /deployment-modes
sidebar_label: 'デプロイモード'
description: 'ClickHouseは、特定のニーズに合わせて異なる形でパッケージ化された、同じ強力なデータベースエンジンを使用する4つのデプロイメントオプションを提供します。'
title: 'デプロイモード'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouseは、ニーズに応じて異なる方法でデプロイできる多機能なデータベースシステムです。その核心には、すべてのデプロイメントオプションが**同じ強力なClickHouseデータベースエンジンを使用している**という点があります – 違いは、それとのインタラクション方法や、どこで動作するかにあります。

大規模な分析を生産環境で実行している場合でも、ローカルでデータ分析を行っている場合でも、アプリケーションを構築している場合でも、あなたのユースケースに合わせたデプロイメントオプションがあります。基盤となるエンジンの一貫性により、すべてのデプロイモードで同じ高いパフォーマンスとSQL互換性が得られます。このガイドでは、ClickHouseをデプロイし使用するための4つの主要な方法を探ります。

* 従来のクライアント/サーバーデプロイメントのためのClickHouse Server
* 完全に管理されたデータベース操作のためのClickHouse Cloud
* コマンドラインでのデータ処理のためのclickhouse-local
* アプリケーションに直接ClickHouseを埋め込むためのchDB

各デプロイメントモードにはそれぞれの強みと理想的なユースケースがあり、それについて以下で詳しく探ります。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Serverは従来のクライアント/サーバーアーキテクチャを表しており、生産環境でのデプロイメントに最適です。このデプロイメントモードは、ClickHouseが得意とする高スループットと低レイテンシのクエリを持つ完全なOLAPデータベース機能を提供します。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

デプロイメントの柔軟性に関しては、ClickHouse Serverは開発やテストのためにローカルマシンにインストールすることも、AWS、GCP、Azureなどの主要なクラウドプロバイダーにデプロイしてクラウドベースの操作を行うことも、さらには自社のオンプレミスハードウェアにセットアップすることもできます。大規模な操作のためには、負荷の増加に対応し、高可用性を提供するために、分散クラスターとして構成することも可能です。

このデプロイメントモードは、信頼性、パフォーマンス、完全な機能アクセスが重要な生産環境にとって、最適な選択肢です。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview)は、あなた自身のデプロイメントを運用するためのオーバーヘッドを排除した完全に管理されたバージョンのClickHouseです。ClickHouse Serverのすべてのコア機能を維持しつつ、開発と運用を効率化するための追加機能で体験を向上させます。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloudの大きな利点は、その統合ツールです。[ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes)は、さまざまなソースからデータを簡単に接続してストリーミングできる堅牢なデータ取り込みフレームワークを提供します。このプラットフォームは、アプリケーションの構築を大幅に簡単にする専用の[クエリAPI](/cloud/get-started/query-endpoints)も提供しています。

ClickHouse CloudのSQLコンソールには、クエリをインタラクティブな視覚化に変換できる強力な[ダッシュボード](/cloud/manage/dashboards)機能が含まれています。保存したクエリから作成したダッシュボードを作成して共有でき、クエリパラメーターを通じてインタラクティブな要素を追加することもできます。これらのダッシュボードはグローバルフィルターを使用して動的にすることができ、ユーザーがカスタマイズ可能なビューを通じてデータを探ることができます。ただし、視覚化を表示するためには、ユーザーが基盤の保存されたクエリに対して少なくとも読み取りアクセス権を持っている必要があることに注意が必要です。

監視と最適化のために、ClickHouse Cloudには組み込みのチャートや[クエリインサイト](/cloud/get-started/query-insights)が含まれています。これらのツールは、クラスターのパフォーマンスを深く理解するための洞察を提供し、クエリパターン、リソース使用状況、および潜在的な最適化の機会を把握するのに役立ちます。このレベルの可観測性は、インフラ管理にリソースを割かずに高パフォーマンスの分析操作を維持する必要があるチームにとって特に価値があります。

このサービスの管理された性質により、更新、バックアップ、スケーリング、またはセキュリティパッチについて心配する必要がありません – すべて自動的に処理されます。これは、データとアプリケーションに集中したい組織にとって理想的な選択肢です。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local)は、スタンドアロンの実行可能ファイルでClickHouseの完全な機能を提供する強力なコマンドラインツールです。本質的にはClickHouse Serverと同じデータベースですが、サーバーインスタンスを実行することなく、コマンドラインからClickHouseのすべての機能を活用できるようにパッケージ化されています。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

このツールは、特にローカルファイルまたはクラウドストレージサービスに保存されたデータを使用してのアドホックデータ分析で優れています。ClickHouseのSQLダイアレクトを使用して、さまざまな形式（CSV、JSON、Parquetなど）のファイルに直接クエリを実行できるため、迅速なデータ探索や一時的な分析タスクに最適です。

clickhouse-localにはClickHouseのすべての機能が含まれているため、データの変換、フォーマットの変換、または通常ClickHouse Serverで行うデータベース操作のために使用できます。主に一時的な操作に使用されますが、必要に応じてClickHouse Serverと同じストレージエンジンを使用してデータを永続化することもできます。

リモートテーブル機能とローカルファイルシステムへのアクセスの組み合わせにより、clickhouse-localは、ClickHouse Serverとローカルマシン上のファイルとの間でデータを結合する必要があるシナリオに特に役立ちます。これは、サーバーにアップロードしたくない敏感または一時的なローカルデータを扱う際に特に貴重です。

## chDB {#chdb}

[chDB](/chdb)は、ClickHouseをプロセス内データベースエンジンとして埋め込んだもので、主にPythonで実装されていますが、Go、Rust、NodeJS、Bunでも利用可能です。このデプロイメントオプションは、ClickHouseの強力なOLAP機能をアプリケーションのプロセスに直接持ち込み、別のデータベースのインストールを必要としません。

<Image img={chDB} alt="chDB - Embedded ClickHouse" size="sm"/>

chDBは、アプリケーションのエコシステムとのシームレスな統合を提供します。たとえば、Pythonでは、PandasやArrowなどの一般的なデータサイエンスツールとの効率的な作業に最適化されており、Pythonのmemoryviewを通じてデータコピーのオーバーヘッドを最小限に抑えます。これにより、ClickHouseのクエリパフォーマンスを既存のワークフロー内で活用したいデータサイエンティストやアナリストにとって特に価値があります。

chDBは、clickhouse-localで作成されたデータベースにも接続できるため、データの扱い方に柔軟性があります。これにより、ローカル開発、Pythonでのデータ探索、およびより永続的なストレージソリューション間で、データアクセスパターンを変更することなくシームレスに移行することができます。
