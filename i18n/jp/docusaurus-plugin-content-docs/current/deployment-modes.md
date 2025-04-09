---
sidebar_label: デプロイメントモード
description: "ClickHouseは、すべて同じ強力なデータベースエンジンを使用する4つのデプロイメントオプションを提供し、特定のニーズに合わせて異なるパッケージ化を行います。"
title: デプロイメントモード
---

import chServer from '@site/static/images/deployment-modes/ch-server.png';
import chCloud from '@site/static/images/deployment-modes/ch-cloud.png';
import chLocal from '@site/static/images/deployment-modes/ch-local.png';
import chDB from '@site/static/images/deployment-modes/chdb.png';

ClickHouseは、ニーズに応じてさまざまな方法でデプロイできる多目的データベースシステムです。コアとなる部分では、すべてのデプロイメントオプションは**同じ強力なClickHouseデータベースエンジンを使用しています**。異なるのは、その操作方法と実行場所です。

大規模な分析を本番環境で実行する場合でも、ローカルデータ分析を行う場合でも、アプリケーションを構築する場合でも、あなたのユースケースに合わせたデプロイメントオプションがあります。基盤となるエンジンの一貫性により、すべてのデプロイメントモードで同じ高いパフォーマンスとSQLの互換性が得られます。
このガイドでは、ClickHouseをデプロイして使用する4つの主要な方法を探ります。

* ClickHouse Serverは、従来のクライアント/サーバーのデプロイメントに最適です
* ClickHouse Cloudは、完全に管理されたデータベース操作を提供します
* clickhouse-localは、コマンドラインデータ処理用です
* chDBは、アプリケーション内にClickHouseを直接組み込むためのものです

各デプロイメントモードには独自の強みと理想的なユースケースがあり、以下で詳しく探ります。

<iframe width="560" height="315" src="https://www.youtube.com/embed/EOXEW_-r10A?si=6IanDSJlRzN8f9Mo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## ClickHouse Server {#clickhouse-server}

ClickHouse Serverは、従来のクライアント/サーバーアーキテクチャを表しており、製品デプロイメントに最適です。このデプロイメントモードは、ClickHouseが知られる高スループットと低遅延のクエリを備えたフルOLAPデータベース機能を提供します。

<img src={chServer} alt="ClickHouse Server" class="image" style={{width: '50%'}} />
<br/>

デプロイメントの柔軟性に関しては、ClickHouse Serverは、開発またはテスト用にローカルマシンにインストールしたり、AWS、GCP、Azureなどの主要なクラウドプロバイダーにデプロイしたり、独自のオンプレミスハードウェアにセットアップしたりすることができます。大規模なオペレーションの場合、分散クラスターとして構成して負荷を処理し、高可用性を提供することも可能です。

このデプロイメントモードは、信頼性、パフォーマンス、およびフル機能へのアクセスが重要な本番環境での選択肢となります。

## ClickHouse Cloud {#clickhouse-cloud}

[ClickHouse Cloud](/cloud/overview)は、ClickHouseの完全に管理されたバージョンで、自分でデプロイメントを運用する際のオーバーヘッドを取り除いたものです。ClickHouse Serverのすべてのコア機能を維持しつつ、開発とオペレーションを効率化するための追加機能を強化しています。

<img src={chCloud} alt="ClickHouse Cloud" class="image" style={{width: '50%'}} />
<br/>

ClickHouse Cloudの大きな利点の1つは、その統合ツールです。[ClickPipes](/cloud/get-started/cloud-quick-start#clickpipes)は、堅牢なデータインジェクションフレームワークを提供し、複雑なETLパイプラインの管理なしにさまざまなソースからデータを簡単に接続してストリーミングすることを可能にします。このプラットフォームは、専用の[クエリAPI](/cloud/get-started/query-endpoints)も提供し、アプリケーションの構築を大幅に簡素化します。

ClickHouse CloudのSQLコンソールには、クエリをインタラクティブな視覚化に変換する強力な[ダッシュボード](/cloud/manage/dashboards)機能が含まれています。保存したクエリから構築したダッシュボードを作成および共有でき、クエリパラメータを通じてインタラクティブな要素を追加できます。これらのダッシュボードは、グローバルフィルターを使用して動的にすることができ、ユーザーがカスタマイズ可能なビューを通じてデータを探究することができるようになります。ただし、視覚化を見るためには、ユーザーが基底の保存されたクエリへの読み取りアクセスを持っている必要があることに注意しましょう。

監視および最適化のために、ClickHouse Cloudには組み込みのチャートと[クエリインサイト](/cloud/get-started/query-insights)が含まれています。これらのツールは、クラスターのパフォーマンスに対する深い可視性を提供し、クエリパターン、リソース使用量、および潜在的な最適化の機会を理解するのに役立ちます。このレベルの可観測性は、インフラ管理にリソースを割り当てることなく、高パフォーマンスの分析操作を維持する必要があるチームにとって特に価値があります。

サービスの管理された性質により、更新、バックアップ、スケーリング、セキュリティパッチについて心配する必要がありません。これらはすべて自動的に処理されます。これにより、データとアプリケーションに集中したい組織にとって理想的な選択肢となります。

## clickhouse-local {#clickhouse-local}

[clickhouse-local](/operations/utilities/clickhouse-local)は、スタンドアロン実行可能ファイルでClickHouseの完全な機能を提供する強力なコマンドラインツールです。これは基本的にClickHouse Serverと同じデータベースですが、サーバーインスタンスを実行せずにコマンドラインから直接ClickHouseのすべての機能を活用できるようにパッケージ化されています。

<img src={chLocal} alt="clickhouse-local" class="image" style={{width: '50%'}} />
<br/>

このツールは、特にローカルファイルやクラウドストレージサービスに保存されたデータと作業する際のアドホックデータ分析に優れています。さまざまなフォーマット（CSV、JSON、Parquetなど）のファイルを直接クエリし、ClickHouseのSQL方言を使用することができるため、迅速なデータ探索や一度限りの分析タスクに適しています。

clickhouse-localにはClickHouseのすべての機能が含まれているため、データ変換、フォーマット変換、または通常ClickHouse Serverで行うデータベース操作を行うことができます。主に一時的な操作に使用される一方で、必要に応じてClickHouse Serverと同じストレージエンジンを使用してデータを永続化することも可能です。

リモートテーブル関数とローカルファイルシステムへのアクセスが組み合わさることで、clickhouse-localは、ClickHouse Serverとローカルマシン上のファイル間でデータを結合する必要があるシナリオに特に役立ちます。これは、サーバーにアップロードしたくない敏感または一時的なローカルデータと作業する際に特に価値があります。

## chDB {#chdb}

[chDB](/chdb)は、プロセス内データベースエンジンとして組み込まれたClickHouseで、Pythonが主な実装ですが、Go、Rust、NodeJS、Bunでも利用可能です。このデプロイメントオプションは、ClickHouseの強力なOLAP機能をあなたのアプリケーションのプロセスに直接持ち込むものであり、別個のデータベースインストールが不要です。

<img src={chDB} alt="chDB - Embedded ClickHouse" class="image" style={{width: '50%'}} />
<br/>

chDBは、アプリケーションのエコシステムとのシームレスな統合を提供します。たとえばPythonでは、PandasやArrowといった一般的なデータサイエンスツールと効率的に連携するように最適化されており、Pythonのmemoryviewを介してデータのコピーオーバーヘッドを最小限に抑えます。これにより、ClickHouseのクエリパフォーマンスを既存のワークフロー内で活用したいデータサイエンティストやアナリストにとって特に価値があります。

chDBはclickhouse-localで作成されたデータベースにも接続できるため、データとのやり取りに柔軟性を持たせることが可能です。これにより、ローカル開発、Pythonでのデータ探索、より永続的なストレージソリューションの間でシームレスに移行することができ、データアクセスパターンを変更することなく作業を続けられます。
