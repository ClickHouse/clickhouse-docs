---
slug: /deployment-modes
sidebar_label: 'デプロイメントモード'
description: 'ClickHouse は、同一の強力なデータベースエンジンを採用しつつ、それぞれのニーズに合わせてパッケージングが異なる 4 つのデプロイメントオプションを提供します。'
title: 'デプロイメントモード'
keywords: ['デプロイメントモード', 'chDB']
show_related_blogs: true
doc_type: 'guide'
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';
import Image from '@theme/IdealImage';

ClickHouse は多用途なデータベースシステムであり、ニーズに応じて複数の方法でデプロイできます。どのオプションでも本質的には **同じ強力な ClickHouse データベースエンジンを使用しており**、異なるのはどこで動作させ、どのように扱うかという点だけです。

本番環境で大規模な分析を実行する場合でも、ローカルでデータ分析を行う場合でも、アプリケーションを構築する場合でも、ユースケースに合わせたデプロイメントオプションが用意されています。基盤となるエンジンが一貫しているため、いずれのデプロイメントモードでも同じ高いパフォーマンスと SQL 互換性を得ることができます。
このガイドでは、ClickHouse をデプロイして利用する主な 4 つの方法を紹介します。

* 従来型のクライアント/サーバーデプロイメント向けの ClickHouse Server
* 完全マネージドなデータベース運用向けの ClickHouse Cloud
* コマンドラインでのデータ処理向けの clickhouse-local
* アプリケーションに ClickHouse を直接組み込むための chDB

各デプロイメントモードには、それぞれの強みと最適なユースケースがあり、以下で詳しく見ていきます。

<iframe width="1024" height="576" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />


## ClickHouse Server {#clickhouse-server}

ClickHouse Server は従来型のクライアント／サーバーアーキテクチャに基づいており、本番環境でのデプロイメントに最適です。このデプロイメントモードでは、ClickHouse が特長とする高スループットかつ低レイテンシなクエリを備えた、完全な OLAP データベース機能を提供します。

<Image img={chServer} alt="ClickHouse Server" size="sm"/>

<br/>

デプロイメントの柔軟性という観点では、ClickHouse Server は開発やテスト用途のためにローカルマシンへインストールできるほか、AWS、GCP、Azure などの主要なクラウドプロバイダーへデプロイしてクラウド環境で運用したり、自前のオンプレミス環境にセットアップしたりできます。より大規模な運用に対しては、分散クラスターとして構成し、負荷増加への対応と高可用性の実現が可能です。

このデプロイメントモードは、信頼性、パフォーマンス、そしてすべての機能を利用できることが重要となる本番環境における最有力な選択肢です。



## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview) は、自前のデプロイメント運用に伴うオペレーション負荷を取り除く、完全マネージド版の ClickHouse です。ClickHouse Server の中核となる機能はすべて維持しつつ、開発と運用を効率化するために設計された追加機能によって、利用体験を一段と高めます。

<Image img={chCloud} alt="ClickHouse Cloud" size="sm"/>

ClickHouse Cloud の主要な利点の 1 つは、統合されたツール群です。[ClickPipes](/getting-started/quick-start/cloud/#clickpipes) は堅牢なデータ インジェスト基盤を提供し、複雑な ETL パイプラインを管理することなく、さまざまなソースからデータを簡単に接続してストリーミングできるようにします。さらに、このプラットフォームは専用の [querying API](/cloud/get-started/query-endpoints) も提供しており、アプリケーションの構築を大幅に容易にします。

ClickHouse Cloud の SQL Console には強力な [dashboarding](/cloud/manage/dashboards) 機能が含まれており、クエリをインタラクティブな可視化に変換できます。保存済みクエリからダッシュボードを作成・共有でき、クエリパラメータを通じてインタラクティブな要素を追加することも可能です。これらのダッシュボードはグローバルフィルターを用いることで動的なものにでき、ユーザーはカスタマイズ可能なビューを通じてデータを探索できます。ただし、可視化を閲覧するには、ユーザーが基盤となる保存済みクエリに対して少なくとも読み取りアクセス権を持っている必要がある点に注意してください。

監視と最適化のために、ClickHouse Cloud には組み込みのチャートと [query insights](/cloud/get-started/query-insights) が用意されています。これらのツールはクラスターのパフォーマンスに関する深い可視性を提供し、クエリパターン、リソース利用状況、および最適化の機会を把握するのに役立ちます。このレベルのオブザーバビリティは、インフラ管理にリソースを割くことなく高パフォーマンスな分析基盤を維持する必要があるチームにとって、特に有用です。

マネージドサービスであることから、アップデート、バックアップ、スケーリング、セキュリティパッチについて心配する必要はありません — これらはすべて自動的に処理されます。そのため、データベース管理ではなく、自社のデータとアプリケーションに注力したい組織にとって理想的な選択肢となります。



## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local) は、単体の実行ファイルとして ClickHouse の完全な機能を提供する強力なコマンドラインツールです。基本的には ClickHouse Server と同じデータベースですが、サーバーインスタンスを起動することなくコマンドラインから直接 ClickHouse の機能をすべて活用できるようにパッケージされています。

<Image img={chLocal} alt="clickHouse-local" size="sm"/>

このツールはアドホックなデータ分析に優れており、とくにローカルファイルやクラウドストレージサービスに保存されたデータを扱う場合に便利です。さまざまな形式（CSV、JSON、Parquet など）のファイルを ClickHouse の SQL 方言で直接クエリできるため、迅速なデータ探索や単発の分析タスクに最適です。

clickhouse-local には ClickHouse の全機能が含まれているため、データ変換、フォーマット変換、あるいは通常 ClickHouse Server で行うその他のデータベース操作にも利用できます。主に一時的な処理に使われますが、必要に応じて ClickHouse Server と同じストレージエンジンを使ってデータを永続化することも可能です。

リモートテーブル関数とローカルファイルシステムへのアクセスを組み合わせることで、clickhouse-local は ClickHouse Server 上のデータとローカルマシン上のファイルを結合する必要があるシナリオでとくに有用です。サーバーにアップロードしたくない機密性の高いローカルデータや一時的なローカルデータを扱う場合に、きわめて有用です。



## chDB {#chdb}

[chDB](/chdb) は、プロセス内データベースエンジンとして組み込まれた ClickHouse であり、主な実装は Python ですが、Go、Rust、NodeJS、Bun 向けにも利用できます。このデプロイオプションにより、ClickHouse の強力な OLAP 機能をアプリケーションのプロセス内に直接組み込めるため、別途データベースをインストールする必要がなくなります。

<Image img={chDB} alt="chDB - 組み込み ClickHouse" size="sm"/>

chDB は、アプリケーションのエコシステムとのシームレスな統合を実現します。たとえば Python では、Pandas や Arrow といった一般的なデータサイエンスツールと効率的に連携できるよう最適化されており、Python の `memoryview` を通じてデータコピーのオーバーヘッドを最小限に抑えます。これにより、既存のワークフローの中で ClickHouse のクエリ性能を活用したいデータサイエンティストやアナリストにとって特に有用です。

chDB は、`clickhouse-local` で作成したデータベースに接続することもでき、データの扱い方に柔軟性をもたらします。これにより、ローカル開発、Python によるデータ探索、より永続的なストレージソリューション間を、データアクセスパターンを変更することなくシームレスに切り替えることができます。
