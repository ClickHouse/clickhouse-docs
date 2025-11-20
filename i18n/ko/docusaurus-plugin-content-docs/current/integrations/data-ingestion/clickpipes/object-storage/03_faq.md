---
'sidebar_label': 'FAQ'
'description': '객체 저장소 ClickPipes에 대한 FAQ'
'slug': '/integrations/clickpipes/object-storage/faq'
'sidebar_position': 1
'title': 'FAQ'
'doc_type': 'reference'
'integration':
- 'support_level': 'core'
- 'category': 'clickpipes'
---

## FAQ {#faq}

<details>
<summary>Does ClickPipes support GCS buckets prefixed with `gs://`?</summary>

아니요. 상호 운용성 이유로 인해 `gs://` 버킷 접두사를 `https://storage.googleapis.com/`로 교체해 주시기 바랍니다.

</details>

<details>
<summary>What permissions does a GCS public bucket require?</summary>

`allUsers`는 적절한 역할 할당이 필요합니다. `roles/storage.objectViewer` 역할은 버킷 수준에서 부여되어야 합니다. 이 역할은 ClickPipes가 온보딩 및 수집에 필요한 버킷 내 모든 객체를 나열할 수 있도록 하는 `storage.objects.list` 권한을 제공합니다. 이 역할에는 버킷 내 개별 객체를 읽거나 다운로드하는 데 필요한 `storage.objects.get` 권한도 포함됩니다. 추가 정보는 [Google Cloud Access Control](https://cloud.google.com/storage/docs/access-control/iam-roles)을 참조하십시오.

</details>
