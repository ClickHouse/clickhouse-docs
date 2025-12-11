---
sidebar_label: '常见问题'
description: '关于对象存储 ClickPipes 的常见问题'
slug: /integrations/clickpipes/object-storage/faq
sidebar_position: 1
title: '常见问题'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---



## 常见问题解答 {#faq}

<details>
<summary>ClickPipes 是否支持以 `gs://` 为前缀的 GCS bucket？</summary>

不支持。出于互操作性考虑，请将 `gs://` bucket 前缀替换为 `https://storage.googleapis.com/`。

</details>

<details>
<summary>GCS 公共 bucket 需要哪些权限？</summary>

`allUsers` 需要被授予适当的角色。必须在 bucket 级别授予 `roles/storage.objectViewer` 角色。该角色提供 `storage.objects.list` 权限，使 ClickPipes 能够列出 bucket 中的所有对象，这是初始化接入和数据摄取所必需的。该角色还包含 `storage.objects.get` 权限，用于读取或下载 bucket 中的单个对象。更多信息请参见：[Google Cloud Access Control](https://cloud.google.com/storage/docs/access-control/iam-roles)。

</details>
