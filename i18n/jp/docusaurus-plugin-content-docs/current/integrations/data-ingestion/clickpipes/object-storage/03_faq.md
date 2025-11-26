---
sidebar_label: 'FAQ（よくある質問）'
description: 'オブジェクトストレージ向け ClickPipes に関する FAQ'
slug: /integrations/clickpipes/object-storage/faq
sidebar_position: 1
title: 'FAQ（よくある質問）'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---



## FAQ {#faq}

<details>
<summary>ClickPipes は `gs://` で始まる GCS バケットをサポートしますか？</summary>

いいえ。相互運用性の観点から、`gs://` バケットプレフィックスを `https://storage.googleapis.com/` に置き換えていただく必要があります。

</details>

<details>
<summary>GCS のパブリックバケットにはどのような権限が必要ですか？</summary>

`allUsers` には、適切なロールを割り当てる必要があります。`roles/storage.objectViewer` ロールをバケットレベルで付与してください。このロールは `storage.objects.list` 権限を提供し、ClickPipes がオンボーディングおよびインジェストのために、バケット内のすべてのオブジェクトを一覧表示できるようにします。また、このロールには `storage.objects.get` 権限も含まれており、バケット内の個々のオブジェクトを読み取ったりダウンロードしたりする際に必要です。詳細については、[Google Cloud Access Control](https://cloud.google.com/storage/docs/access-control/iam-roles) を参照してください。

</details>
