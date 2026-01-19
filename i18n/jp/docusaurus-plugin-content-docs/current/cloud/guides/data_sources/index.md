---
slug: /cloud/guides/data-sources
title: 'データソース'
hide_title: true
description: 'ClickHouse Cloud ガイドセクション用の目次ページ'
doc_type: 'landing-page'
keywords: ['クラウドガイド', 'ドキュメント', 'ハウツー', 'クラウド機能', 'チュートリアル']
---

## クラウド連携 \{#cloud-integrations\}

このセクションでは、追加の設定が必要な外部データソースと ClickHouse Cloud を連携させるためのガイドおよびリファレンスを掲載します。

| ページ                                                          | 説明                                                                      |
|-----------------------------------------------------------------|---------------------------------------------------------------------------|
| [Cloud IP addresses](/manage/data-sources/cloud-endpoints-api)  | 一部のテーブル関数や接続で必要となるネットワーク情報                      |
| [Accessing S3 data securely](/cloud/data-sources/secure-s3)     | ロールベースアクセスを用いて AWS S3 上の外部データソースへ安全にアクセス |
| [Accessing GCS data securely](/cloud/data-sources/secure-gcs)   | HMAC キーを用いて GCS 上の外部データソースへ安全にアクセス               |

## 外部データソースへの追加接続 \{#additional-connections-for-external-data-sources\}

### データインジェストのための ClickPipes \{#clickpipes-for-data-ingestion\}

ClickPipes を使用すると、複数のソースからのストリーミングデータを容易に統合できます。詳細については、「インテグレーション」ドキュメントの [ClickPipes](/integrations/clickpipes) を参照してください。

### 外部データソースとしてのテーブル関数 \{#table-functions-as-external-data-sources\}

ClickHouse は、外部データソースにアクセスするための各種テーブル関数をサポートしています。詳細については、SQL リファレンスセクションの [table functions](/sql-reference/table-functions) を参照してください。