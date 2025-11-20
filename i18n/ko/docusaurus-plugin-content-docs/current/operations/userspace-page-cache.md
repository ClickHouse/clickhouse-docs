---
'description': '프로세스 메모리에서 데이터를 캐시할 수 있는 캐싱 메커니즘으로, OS 페이지 캐시에 의존하지 않습니다.'
'sidebar_label': '사용자 공간 페이지 캐시'
'sidebar_position': 65
'slug': '/operations/userspace-page-cache'
'title': '사용자 공간 페이지 캐시'
'doc_type': 'reference'
---


# 사용자 공간 페이지 캐시

## 개요 {#overview}

> 사용자 공간 페이지 캐시는 OS 페이지 캐시에 의존하지 않고 프로세스 메모리에서 데이터를 캐시할 수 있는 새로운 캐싱 메커니즘입니다.

ClickHouse는 이미 [파일 시스템 캐시](/docs/operations/storing-data)를 제공하여 Amazon S3, Google Cloud Storage (GCS), Azure Blob Storage와 같은 원격 객체 저장소 위에서 캐싱할 수 있는 방법을 제공합니다. 사용자 공간 페이지 캐시는 일반 OS 캐싱이 충분한 성능을 발휘하지 못할 때 원격 데이터에 대한 접근 속도를 높이기 위해 설계되었습니다.

파일 시스템 캐시와 다음과 같은 방식으로 다릅니다:

| 파일 시스템 캐시                                        | 사용자 공간 페이지 캐시                     |
|---------------------------------------------------------|---------------------------------------|
| 데이터를 로컬 파일 시스템에 기록                      | 메모리에만 존재                          |
| 디스크 공간을 차지 (tmpfs에서 구성 가능)               | 파일 시스템과 독립적                   |
| 서버 재시작에 생존                                    | 서버 재시작에 생존하지 않음            |
| 서버의 메모리 사용량에 표시되지 않음                   | 서버의 메모리 사용량에 표시됨          |
| 디스크 및 메모리 (OS 페이지 캐시)에 모두 적합         | **디스크가 없는 서버에 적합**          |

## 구성 설정 및 사용법 {#configuration-settings-and-usage}

### 사용법 {#usage}

사용자 공간 페이지 캐시를 활성화하려면 먼저 서버에서 구성해야 합니다:

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
사용자 공간 페이지 캐시는 지정된 양의 메모리를 사용하지만, 이 메모리는 예약되지 않습니다. 다른 서버 필요로 인해 필요할 경우 메모리가 축출됩니다.
:::

다음으로 쿼리 수준에서 사용을 활성화합니다:

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 설정 {#settings}

| 설정                                                    | 설명                                                                                                                                                                                                                                                                                                            | 기본값     |
|----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `use_page_cache_for_disks_without_file_cache`            | 파일 시스템 캐시가 활성화되지 않은 원격 디스크에 대해 사용자 공간 페이지 캐시를 사용합니다.                                                                                                                                                                                                                       | `0`         |
| `use_page_cache_with_distributed_cache`                  | 분산 캐시가 사용될 때 사용자 공간 페이지 캐시를 사용합니다.                                                                                                                                                                                                                                                   | `0`         |
| `read_from_page_cache_if_exists_otherwise_bypass_cache`  | [`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache)와 유사하게, 사용자 공간 페이지 캐시를 수동 모드로 사용합니다.                                                                                   | `0`         |
| `page_cache_inject_eviction`                             | 사용자 공간 페이지 캐시는 일부 페이지를 무작위로 무효화할 수 있습니다. 테스트 용도입니다.                                                                                                                                                                                                                            | `0`         |
| `page_cache_block_size`                                  | 사용자 공간 페이지 캐시에 저장할 파일 청크의 크기(바이트 단위)입니다. 캐시를 통하는 모든 읽기는 이 크기의 배수로 반올림됩니다.                                                                                                                                                                                 | `1048576`   |
| `page_cache_history_window_ms`                           | 해제된 메모리가 사용자 공간 페이지 캐시에 사용되기 전에 지연됩니다.                                                                                                                                                                                                                                              | `1000`      |
| `page_cache_policy`                                      | 사용자 공간 페이지 캐시 정책 이름입니다.                                                                                                                                                                                                                                                                              | `SLRU`      |
| `page_cache_size_ratio`                                  | 사용자 공간 페이지 캐시에서 보호된 큐의 크기를 캐시의 총 크기에 대한 비율로 정의합니다.                                                                                                                                                                                                                       | `0.5`       |
| `page_cache_min_size`                                    | 사용자 공간 페이지 캐시의 최소 크기입니다.                                                                                                                                                                                                                                                                              | `104857600` |
| `page_cache_max_size`                                    | 사용자 공간 페이지 캐시의 최대 크기입니다. 캐시를 비활성화하려면 0으로 설정합니다. page_cache_min_size보다 클 경우, 캐시 크기는 이 범위 내에서 지속적으로 조정되어 사용 가능한 메모리 대부분을 사용하되, 총 메모리 사용량을 제한(`max_server_memory_usage`\[`_to_ram_ratio`\]) 아래로 유지합니다. | `0`         |
| `page_cache_free_memory_ratio`                           | 사용자 공간 페이지 캐시에서 비워 두어야 할 메모리 제한의 비율입니다. Linux의 min_free_kbytes 설정과 유사합니다.                                                                                                                                                                                           | `0.15`      |
| `page_cache_lookahead_blocks`                            | 사용자 공간 페이지 캐시 누락 시, 캐시에 없으면 기본 저장소에서 이 숫자만큼 연속 블록을 한 번에 읽습니다. 각 블록은 page_cache_block_size 바이트입니다.                                                                                                                                                             | `16`        |
| `page_cache_shards`                                      | 뮤텍스 경합을 줄이기 위해 이 숫자만큼 사용자 공간 페이지 캐시를 스트라이프 처리합니다. 실험적이며 성능 향상이 보장되지 않습니다.                                                                                                                                                                                           | `4`         |

## 관련 내용 {#related-content}
- [파일 시스템 캐시](/docs/operations/storing-data)
- [ClickHouse v25.3 릴리스 웨비나](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
