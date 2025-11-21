---
slug: /faq/operations/deploy-separate-storage-and-compute
title: 'ClickHouse をストレージとコンピュートを分離した構成でデプロイすることは可能ですか?'
sidebar_label: 'ClickHouse をストレージとコンピュートを分離した構成でデプロイすることは可能ですか?'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ClickHouse をストレージとコンピュートを分離した構成でデプロイできるかどうかについての回答を示します'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

端的に言えば「はい」です。

オブジェクトストレージ (S3, GCS) は、ClickHouse テーブル内のデータに対するスケーラブルなプライマリストレージバックエンドとして利用できます。[S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) と [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) のガイドが公開されています。この構成では、メタデータのみがコンピュートノード上にローカル保存されます。このセットアップでは、追加ノードはメタデータをレプリケートするだけで済むため、コンピュートリソースを容易にスケールアップおよびスケールダウンできます。