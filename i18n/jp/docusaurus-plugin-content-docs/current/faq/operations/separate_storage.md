---
slug: /faq/operations/deploy-separate-storage-and-compute
title: 'ストレージとコンピュートを分離して ClickHouse をデプロイすることは可能ですか？'
sidebar_label: 'ストレージとコンピュートを分離して ClickHouse をデプロイすることは可能ですか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ストレージとコンピュートを分離して ClickHouse をデプロイすることが可能かどうかに回答します'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

結論から言うと「はい」です。

オブジェクトストレージ (S3、GCS) を、ClickHouse テーブルのデータに対するエラスティックなプライマリストレージバックエンドとして利用できます。[S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) と [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) のガイドが公開されています。この構成では、メタデータのみがコンピュートノード上にローカル保存されます。このセットアップでは、追加ノードはメタデータをレプリケートするだけでよいため、コンピュートリソースを容易にスケールアップおよびスケールダウンできます。