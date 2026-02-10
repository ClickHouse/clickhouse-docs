---
slug: /cloud/managed-postgres/migrations/peerdb
sidebar_label: 'PeerDB'
title: 'PeerDB を使用して PostgreSQL データを移行する'
description: 'PeerDB を使用して PostgreSQL データを ClickHouse Managed Postgres に移行する方法について学びます'
keywords: ['postgres', 'postgresql', 'ロジカルレプリケーション', 'マイグレーション', 'データ転送', 'Managed Postgres', 'peerdb']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import sourcePeer from '@site/static/images/managed-postgres/peerdb/source-peer.png';
import targetPeer from '@site/static/images/managed-postgres/peerdb/target-peer.png';
import peers from '@site/static/images/managed-postgres/peerdb/peers.png';
import createMirror from '@site/static/images/managed-postgres/peerdb/create-mirror.png';
import tablePicker from '@site/static/images/managed-postgres/peerdb/table-picker.png';
import initialLoad from '@site/static/images/managed-postgres/peerdb/initial-load.png';
import mirrors from '@site/static/images/managed-postgres/peerdb/mirrors.png';


# PeerDB を使用して Managed Postgres に移行する \{#peerdb-migration\}

このガイドでは、PeerDB を使用して PostgreSQL データベースを ClickHouse Managed Postgres に移行するための手順をステップバイステップで説明します。

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="migration-guide-peerdb" />

## 前提条件 \{#migration-peerdb-prerequisites\}

- 移行元となる PostgreSQL データベースへのアクセス権限。
- データを移行先とする ClickHouse Managed Postgres インスタンス。
- PeerDB がインストールされているマシン。インストール手順については [PeerDB GitHub リポジトリ](https://github.com/PeerDB-io/peerdb?tab=readme-ov-file#get-started) を参照してください。リポジトリをクローンして `docker-compose up` を実行するだけです。このガイドでは **PeerDB UI** を使用します。PeerDB が起動すると、`http://localhost:3000` でアクセス可能になります。

## 移行前の考慮事項 \{#migration-peerdb-considerations-before\}

移行を開始する前に、以下の点を確認してください。

- **データベースオブジェクト**: PeerDB はソーススキーマに基づき、ターゲットデータベースにテーブルを自動作成します。ただし、索引、制約、トリガーなど一部のデータベースオブジェクトは自動的には移行されません。移行後に、これらのオブジェクトをターゲットデータベース上で手動で再作成する必要があります。
- **DDL の変更**: 継続的レプリケーションを有効にした場合、PeerDB は DML 操作（INSERT、UPDATE、DELETE）についてソースとターゲットのデータベースを同期し、ADD COLUMN 操作を伝播します。ただし、その他の DDL 変更（DROP COLUMN、ALTER COLUMN など）は自動的には伝播されません。スキーマ変更のサポートについての詳細は[こちら](/integrations/clickpipes/postgres/schema-changes)を参照してください。
- **ネットワーク接続性**: PeerDB を実行しているマシンから、ソースおよびターゲットの両方のデータベースへアクセス可能であることを確認してください。接続を許可するために、ファイアウォールルールやセキュリティグループの設定を変更する必要がある場合があります。

## ピアを作成する \{#migration-peerdb-create-peers\}

まず、ソースデータベースとターゲットデータベースそれぞれについてピアを作成する必要があります。ピアはデータベースへの接続を表します。PeerDB の UI で、サイドバーの「Peers」をクリックして「Peers」セクションを開きます。新しいピアを作成するには、`+ New peer` ボタンをクリックします。

### ソース側ピアの作成 \{#migration-peerdb-source-peer\}

ホスト、ポート、データベース名、ユーザー名、パスワードなどの接続情報を入力して、ソース PostgreSQL データベース用のピアを作成します。すべて入力したら、`Create peer` ボタンをクリックしてピアを保存します。

<Image img={sourcePeer} alt="ソース側ピアの作成" size="md" border />

### ターゲットピアの作成 \{#migration-peerdb-target-peer\}

同様に、必要な接続情報を入力して、ClickHouse Managed Postgres インスタンス用のピアを作成します。インスタンスの[接続情報](../connection)は、ClickHouse Cloud コンソールから取得できます。情報を入力したら、`Create peer` ボタンをクリックしてターゲットピアを作成します。

<Image img={targetPeer} alt="ターゲットピアの作成" size="md" border />

これで、「Peers」セクションにソースピアとターゲットピアの両方が表示されているはずです。

<Image img={peers} alt="ピア一覧" size="md" border />

## ミラーを作成する \{#migration-peerdb-create-mirror\}

次に、ソースとターゲットのピア間でのデータ移行プロセスを定義するミラーを作成します。PeerDB の UI でサイドバーの「Mirrors」をクリックして、「Mirrors」セクションに移動します。新しいミラーを作成するには、`+ New mirror` ボタンをクリックします。

<Image img={createMirror} alt="Create Mirror" size="md" border />

1. 移行内容がわかる名前をミラーに付けます。
2. ドロップダウンメニューから、先ほど作成したソースとターゲットのピアを選択します。
3. 初回移行の後もターゲットデータベースをソースと同期させたい場合は、継続的なレプリケーションを有効にすることができます。そうでない場合は、**Advanced settings** で **Initial copy only** を有効にして、1 回限りの移行を実行できます。
4. 移行したいテーブルを選択します。特定のテーブルだけを選択することも、ソースデータベース内のすべてのテーブルを選択することもできます。

<Image img={tablePicker} alt="Table Picker" size="md" border />

5. ミラー設定の構成が完了したら、`Create mirror` ボタンをクリックします。

「Mirrors」セクションに、作成したばかりのミラーが表示されるはずです。

<Image img={mirrors} alt="Mirrors List" size="md" border />

## 初回ロードの完了を待つ \{#migration-peerdb-initial-load\}

ミラーを作成すると、PeerDB はソースからターゲットデータベースへの初回データロードを開始します。ミラーをクリックし、**Initial load** タブを開くと、初回データ移行の進行状況を確認できます。

<Image img={initialLoad} alt="Initial Load Progress" size="md" border />

初回ロードが完了すると、移行が完了したことを示すステータスが表示されます。

## 初期ロードとレプリケーションの監視 \{#migration-peerdb-monitoring\}

ソースの peer をクリックすると、PeerDB が実行中のコマンド一覧を確認できます。例えば、次のようなものがあります。

1. まず、各テーブル内の行数を見積もるために COUNT クエリを実行します。
2. 次に、NTILE を使用したパーティション分割クエリを実行し、大きなテーブルをより小さな chunk に分割して、データ転送を効率化します。
3. その後、FETCH コマンドを実行してソースデータベースからデータを取得し、PeerDB がそれらをターゲットデータベースに同期します。

## 移行後のタスク \{#migration-peerdb-considerations\}

移行が完了したら、次の作業を実施してください。

- **データベースオブジェクトの再作成**: ターゲットデータベースでは、インデックス、制約、トリガーは自動では移行されないため、手動で再作成する必要があることに注意してください。
- **アプリケーションのテスト**: すべてが想定どおり動作していることを確認するため、ClickHouse Managed Postgres インスタンスに対してアプリケーションをテストしてください。
- **リソースのクリーンアップ**: 移行結果に満足し、アプリケーションの接続先を ClickHouse Managed Postgres に切り替えたら、リソースをクリーンアップするために PeerDB 上のミラーとピアを削除できます。

:::info Replication slots
継続的なレプリケーションを有効にした場合、PeerDB はソースの PostgreSQL データベース上に**レプリケーションスロット**を作成します。不要なリソース消費を避けるため、移行が完了した後はこのレプリケーションスロットをソースデータベースから手動で削除してください。
:::

## 参考資料 \{#migration-peerdb-references\}

- [ClickHouse マネージド Postgres のドキュメント](../)
- [CDC 作成のための PeerDB ガイド](https://docs.peerdb.io/mirror/cdc-pg-pg)
- [Postgres ClickPipe FAQ（PeerDB にも同様に適用されます）](../../../integrations/data-ingestion/clickpipes/postgres/faq.md)

## 次のステップ \{#migration-pgdump-pg-restore-next-steps\}

おめでとうございます！pg_dump と pg_restore を使用して、PostgreSQL データベースを ClickHouse Managed Postgres に正常に移行できました。これで Managed Postgres の各種機能や ClickHouse との連携を試す準備が整いました。スムーズに始められるよう、10 分で完了するクイックスタートを用意しています:

- [Managed Postgres クイックスタートガイド](../quickstart)