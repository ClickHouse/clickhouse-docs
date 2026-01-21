---
slug: /cloud/managed-postgres/connection
sidebar_label: '接続'
title: 'Managed Postgres への接続'
description: 'ClickHouse Managed Postgres 向けの接続文字列、PgBouncer による接続プーリング、および TLS 構成'
keywords: ['postgres 接続', '接続文字列', 'pgbouncer', 'TLS', 'SSL']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import connectButton from '@site/static/images/managed-postgres/connect-button.png';
import connectModal from '@site/static/images/managed-postgres/connect-modal.png';
import tlsCaBundle from '@site/static/images/managed-postgres/tls-ca-bundle.png';

<PrivatePreviewBadge />


## 接続情報へのアクセス \{#accessing-connection-details\}

アプリケーションを Managed Postgres に接続するには、インスタンスの左サイドバーにある **Connect** ビューに移動します。

<Image img={connectButton} alt="左サイドバーの Connect をクリックして接続情報を表示" size="md" border/>

**Connect** をクリックすると、接続用の認証情報と、複数形式の接続文字列を表示するモーダルダイアログが開きます。

<Image img={connectModal} alt="認証情報と接続文字列形式を表示する接続モーダル" size="md" border/>

接続モーダルには次の情報が表示されます。

- **Username**: データベースユーザー (デフォルト: `postgres`)
- **Password**: データベースパスワード (デフォルトではマスクされており、目のアイコンをクリックすると表示)
- **Server**: Managed Postgres インスタンスのホスト名
- **Port**: PostgreSQL ポート (デフォルト: `5432`)

Managed Postgres はデータベースへのスーパーユーザーアクセスを提供しています。これらの認証情報を使用してスーパーユーザーとして接続することで、追加のユーザーを作成したり、データベースオブジェクトを管理したりできます。

## 接続文字列の形式 \{#connection-string\}

**Connect via** タブでは、アプリケーションの要件に合わせて、複数の形式で接続文字列が提供されます。

| Format | 説明 |
|--------|-------------|
| **url** | 標準的な接続 URL。形式は `postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>` |
| **psql** | psql コマンドラインツールで接続するための、すぐに使用できるコマンド |
| **env** | libpq ベースのクライアント向けの環境変数 |
| **yaml** | YAML 形式の設定 |
| **jdbc** | Java アプリケーション向けの JDBC 接続文字列 |

セキュリティ上の理由から、接続文字列内のパスワードはデフォルトでマスクされています。任意のフィールドまたは接続文字列の横にあるコピーアイコンをクリックすると、その内容をクリップボードに直接コピーできます。

## PgBouncer 接続プーリング \{#pgbouncer\}

Managed Postgres には、サーバーサイドの接続プーリング用に同梱の [PgBouncer](https://www.pgbouncer.org/) インスタンスが含まれています。PgBouncer は、特に次のようなアプリケーションにおいて、接続管理、パフォーマンス、およびリソース使用効率の向上に役立ちます。

- 多数の同時接続を開く
- 頻繁に接続を作成およびクローズする
- サーバーレスまたは一時的なコンピュート環境を使用する

接続プーリングを使用するには、接続モーダル上部の **via PgBouncer** トグルをクリックします。接続プール経由で接続がルーティングされるように接続情報が更新され、PostgreSQL へ直接接続する代わりにプーラー経由で接続されるようになります。

:::tip PgBouncer を使用すべきタイミング
アプリケーションが短時間で終了する接続を多数開く場合は PgBouncer を使用してください。長時間実行される接続や、トランザクションをまたいでプリペアドステートメントを使用するなど、接続プーリングと互換性のない PostgreSQL 機能を使うアプリケーションでは、直接接続してください。

PgBouncer 経由での ClickPipes を使った ClickHouse へのデータ移行はサポートされていません。
:::

## TLS 構成 \{#tls\}

すべての Managed Postgres インスタンスは TLS により暗号化されています。サポートされている TLS の最小バージョンは **TLS 1.3** です。

### クイック接続（TLS で暗号化） \{#quick-connection\}

デフォルトでは、証明書検証を行わない TLS 暗号化接続が使用されます。

```bash
psql 'postgresql://postgres:PASSWORD@your-instance.pg.clickhouse.cloud:5432/postgres'
```


### 検証済み TLS 接続（本番環境で推奨） \{#verified-tls\}

本番ワークロードでは、正しいサーバーと通信していることを確認するために、検証済みの TLS 接続を使用することを推奨します。そのためには、**Settings** タブから CA 証明書バンドルをダウンロードし、データベースクライアントの信頼済み証明書ストアに追加します。

<Image img={tlsCaBundle} alt="Settings タブから CA 証明書をダウンロード" size="md" border />

CA 証明書はお使いの Managed Postgres インスタンス専用であり、他のインスタンスでは使用できません。

検証済み TLS 接続を利用するには、`sslmode=verify-full` とダウンロードした証明書へのパスを指定します。

```bash
psql 'postgresql://postgres:PASSWORD@your-instance.pg.clickhouse.cloud:5432/postgres?sslmode=verify-full&sslrootcert=/path/to/ca-certificate.pem'
```
