---
slug: /faq/operations/deploy-separate-storage-and-compute
title: 'ストレージとコンピュートを分離して ClickHouse をデプロイできますか？'
sidebar_label: 'ストレージとコンピュートを分離して ClickHouse をデプロイできますか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ストレージとコンピュートを分離して ClickHouse をデプロイできるかどうかについて回答します'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

結論としては「はい」です。

オブジェクトストレージ（S3、GCS）を、ClickHouse テーブルのデータ向けの弾力的なプライマリストレージバックエンドとして利用できます。[S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) と [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) のガイドが公開されています。この構成では、メタデータのみがコンピュートノード上にローカル保存されます。このセットアップでは、追加ノードはメタデータを複製するだけでよいため、コンピュートリソースを簡単にスケールアウトおよびスケールインできます。