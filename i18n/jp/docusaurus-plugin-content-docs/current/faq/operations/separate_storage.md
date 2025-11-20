---
slug: /faq/operations/deploy-separate-storage-and-compute
title: 'ClickHouse をストレージとコンピュートを分離してデプロイすることは可能ですか？'
sidebar_label: 'ClickHouse をストレージとコンピュートを分離してデプロイすることは可能ですか？'
toc_hidden: true
toc_priority: 20
description: 'このページでは、ClickHouse をストレージとコンピュートを分離した構成でデプロイできるかどうかについて説明します'
doc_type: 'guide'
keywords: ['storage', 'disk configuration', 'data organization', 'volume management', 'storage tiers']
---

結論としては「はい」です。

オブジェクトストレージ（S3, GCS）を、ClickHouse テーブルのデータ向けのエラスティックなプライマリストレージバックエンドとして利用できます。[S3-backed MergeTree](/integrations/data-ingestion/s3/index.md) と [GCS-backed MergeTree](/integrations/data-ingestion/gcs/index.md) のガイドが公開されています。この構成では、コンピュートノード上にはメタデータのみがローカルに保存されます。このセットアップでは、追加ノードはメタデータを複製するだけでよいため、コンピュートリソースを容易にスケールアウトおよびスケールインできます。