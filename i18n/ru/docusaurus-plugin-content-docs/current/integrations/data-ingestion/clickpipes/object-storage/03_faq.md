---
sidebar_label: 'Часто задаваемые вопросы'
description: 'Часто задаваемые вопросы о ClickPipes для объектного хранилища'
slug: /integrations/clickpipes/object-storage/faq
sidebar_position: 1
title: 'Часто задаваемые вопросы'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---



## FAQ {#faq}

<details>
<summary>Поддерживает ли ClickPipes GCS-бакеты с префиксом `gs://`?</summary>

Нет. Для обеспечения совместимости мы просим заменить префикс вашего бакета `gs://` на `https://storage.googleapis.com/`.

</details>

<details>
<summary>Какие разрешения требуются для публичного GCS-бакета?</summary>

Для `allUsers` необходимо назначить соответствующую роль. Роль `roles/storage.objectViewer` должна быть назначена на уровне бакета. Эта роль даёт разрешение `storage.objects.list`, которое позволяет ClickPipes перечислять все объекты в бакете, что необходимо для первичного подключения и ингестии. В эту роль также входит разрешение `storage.objects.get`, которое необходимо для чтения или загрузки отдельных объектов в бакете. См. раздел [Google Cloud Access Control](https://cloud.google.com/storage/docs/access-control/iam-roles) для получения дополнительной информации.

</details>
