---
description: '운영 체제 페이지 캐시에 의존하지 않고 프로세스 내 메모리에 데이터를 캐싱할 수 있게 해 주는 캐싱 메커니즘입니다.'
sidebar_label: '유저스페이스 페이지 캐시'
sidebar_position: 65
slug: /operations/userspace-page-cache
title: '유저스페이스 페이지 캐시'
doc_type: 'reference'
---



# 유저 스페이스 페이지 캐시 \{#userspace-page-cache\}



## 개요 \{#overview\}

> 유저 공간 페이지 캐시(userspace page cache)는 OS 페이지 캐시에만 의존하는 대신, 프로세스 내 메모리(in-process memory)에 데이터를 캐시할 수 있게 해 주는 새로운 캐싱 메커니즘입니다.

ClickHouse에는 이미 Amazon S3, Google Cloud Storage (GCS), Azure Blob Storage와 같은 원격 객체 스토리지 위에 캐싱 레이어를 제공하는 [Filesystem cache](/docs/operations/storing-data)가 있습니다. 유저 공간 페이지 캐시는 일반적인 OS 캐시만으로는 성능이 충분하지 않을 때 원격 데이터 접근 속도를 높이도록 설계되었습니다. 

이는 Filesystem cache와 다음과 같은 점에서 다릅니다:

| 파일시스템 캐시(Filesystem cache)                      | 유저 공간 페이지 캐시(Userspace page cache) |
|---------------------------------------------------------|---------------------------------------------|
| 데이터를 로컬 파일시스템에 기록함                      | 메모리에만 존재함                           |
| 디스크 공간을 차지함(tmpfs로도 구성 가능)              | 파일시스템과 독립적임                       |
| 서버 재시작 후에도 유지됨                              | 서버 재시작 후에는 유지되지 않음           |
| 서버 메모리 사용량에 나타나지 않음                     | 서버 메모리 사용량에 나타남                 |
| 디스크 기반 및 인메모리(OS 페이지 캐시) 모두에 적합함 | **디스크가 없는 서버에 적합함**             |



## 구성 설정 및 사용 \{#configuration-settings-and-usage\}

### 사용법 \{#usage\}

userspace 페이지 캐시를 활성화하려면 먼저 서버에서 이를 구성해야 합니다.

```bash
cat config.d/page_cache.yaml
page_cache_max_size: 100G
```

:::note
userspace 페이지 캐시는 지정된 메모리 양까지 사용할 수 있지만,
이 메모리가 미리 예약되는 것은 아닙니다. 서버의 다른 용도로 메모리가 필요하면
해당 메모리는 해제됩니다.
:::

다음으로, 쿼리 수준에서 사용을 활성화합니다:

```sql
SET use_page_cache_for_disks_without_file_cache=1;
```

### 설정 \{#settings\}

| Setting                                                 | Description                                                                                                                                                                                                          | Default     |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `use_page_cache_for_disks_without_file_cache`           | 파일시스템 캐시가 활성화되어 있지 않은 원격 디스크에 대해 userspace page cache를 사용합니다.                                                                                                                                                        | `0`         |
| `use_page_cache_with_distributed_cache`                 | distributed cache가 사용될 때 userspace page cache를 사용합니다.                                                                                                                                                                | `0`         |
| `read_from_page_cache_if_exists_otherwise_bypass_cache` | [`read_from_filesystem_cache_if_exists_otherwise_bypass_cache`](/docs/operations/settings/settings#read_from_filesystem_cache_if_exists_otherwise_bypass_cache)와 유사하게, 패시브(passive) 모드로 userspace page cache를 사용합니다. | `0`         |
| `page_cache_inject_eviction`                            | userspace page cache가 때때로 무작위로 일부 페이지를 제거(evict)합니다. 테스트용으로 사용됩니다.                                                                                                                                                   | `0`         |
| `page_cache_block_size`                                 | userspace page cache에 저장할 파일 청크(chunk)의 크기(바이트 단위)입니다. 캐시를 통해 수행되는 모든 읽기(read)는 이 크기의 배수로 반올림됩니다.                                                                                                                    | `1048576`   |
| `page_cache_history_window_ms`                          | 해제된(freed) 메모리를 userspace page cache가 다시 사용할 수 있기까지의 지연 시간(밀리초)입니다.                                                                                                                                                  | `1000`      |
| `page_cache_policy`                                     | userspace page cache 정책 이름입니다.                                                                                                                                                                                       | `SLRU`      |
| `page_cache_size_ratio`                                 | userspace page cache에서 보호된 큐(protected queue)의 크기를 캐시 전체 크기와 비교한 비율입니다.                                                                                                                                              | `0.5`       |
| `page_cache_min_size`                                   | userspace page cache의 최소 크기입니다.                                                                                                                                                                                      | `104857600` |
| `page_cache_max_size`                                   | userspace page cache의 최대 크기입니다. 0으로 설정하면 캐시를 비활성화합니다. `page_cache_min_size`보다 큰 경우, 사용 가능한 메모리 대부분을 활용하면서 전체 메모리 사용량을 한도(`max_server_memory_usage`[`_to_ram_ratio`]) 아래로 유지하도록 캐시 크기가 이 범위 내에서 지속적으로 조정됩니다.          | `0`         |
| `page_cache_free_memory_ratio`                          | userspace page cache가 사용하지 않고 비워 두어야 하는 메모리 한도의 비율입니다. Linux의 `min_free_kbytes` 설정과 유사합니다.                                                                                                                           | `0.15`      |
| `page_cache_lookahead_blocks`                           | userspace page cache 미스가 발생했을 때, 해당 블록들이 캐시에 없는 경우 기본 스토리지에서 한 번에 연속된 블록을 최대 이 개수만큼 읽습니다. 각 블록의 크기는 `page_cache_block_size` 바이트입니다.                                                                                  | `16`        |
| `page_cache_shards`                                     | 뮤텍스 경합을 줄이기 위해 userspace page cache를 이 개수만큼 세그먼트로 분산(stripe)합니다. 실험적인 기능이며, 성능이 향상되지 않을 수 있습니다.                                                                                                                      | `4`         |


## 관련 콘텐츠 \{#related-content\}
- [파일 시스템 캐시](/docs/operations/storing-data)
- [ClickHouse v25.3 릴리스 웨비나](https://www.youtube.com/live/iCKEzp0_Z2Q?feature=shared&t=1320)
