---
slug: /cloud/guides/data-sources
title: 'データソース'
hide_title: true
description: 'ClickHouse Cloud ガイドセクションの目次ページ'
doc_type: 'landing-page'
keywords: ['cloud guides', 'documentation', 'how-to', 'cloud features', 'tutorials']
---



## クラウド統合 {#cloud-integrations}

このセクションでは、追加設定が必要な外部データソースとClickHouse Cloudを統合するためのガイドとリファレンスを提供します。

| ページ                                                           | 説明                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [クラウドIPアドレス](/manage/data-sources/cloud-endpoints-api) | 一部のテーブル関数と接続に必要なネットワーク情報 |
| [S3データへの安全なアクセス](/cloud/data-sources/secure-s3)    | ロールベースアクセスを使用したAWS S3外部データソースへのアクセス         |


## 外部データソースへの追加接続 {#additional-connections-for-external-data-sources}

### データ取り込み用のClickPipes {#clickpipes-for-data-ingestion}

ClickPipesを使用すると、複数のソースからのストリーミングデータを簡単に統合できます。詳細については、Integrationsドキュメントの[ClickPipes](/integrations/clickpipes)を参照してください。

### 外部データソースとしてのテーブル関数 {#table-functions-as-external-data-sources}

ClickHouseは、外部データソースにアクセスするための複数のテーブル関数をサポートしています。詳細については、SQLリファレンスセクションの[テーブル関数](/sql-reference/table-functions)を参照してください。
