---
'slug': '/use-cases/observability/clickstack/migration/elastic/migrating-data'
'title': 'Elastic에서 ClickStack으로 데이터 마이그레이션'
'pagination_prev': null
'pagination_next': null
'sidebar_label': '데이터 마이그레이션'
'sidebar_position': 4
'description': 'Elastic에서 ClickHouse Observability Stack으로 데이터 마이그레이션'
'show_related_blogs': true
'keywords':
- 'ClickStack'
'doc_type': 'guide'
---

## 병렬 작업 전략 {#parallel-operation-strategy}

Elastic에서 ClickStack으로 관측 사례를 위해 마이그레이션할 때, 역사적 데이터를 마이그레이션하려고 시도하는 것보다는 **병렬 작업** 접근 방식을 권장합니다. 이 전략은 여러 가지 장점을 제공합니다:

1. **최소 위험**: 두 시스템을 동시에 운영함으로써 기존 데이터와 대시보드에 대한 접근을 유지하면서 ClickStack을 검증하고 사용자가 새 시스템에 익숙해지도록 합니다.
2. **자연스러운 데이터 만료**: 대부분의 관측 데이터는 제한된 보존 기간(일반적으로 30일 이하)을 가지므로, 데이터가 Elastic에서 만료됨에 따라 자연스러운 전환이 가능합니다.
3. **단순화된 마이그레이션**: 두 시스템 간의 역사적 데이터를 이동하기 위해 복잡한 데이터 전송 도구나 프로세스가 필요하지 않습니다.
<br/>
:::note 데이터 마이그레이션
Elasticsearch에서 ClickHouse로 필수 데이터를 마이그레이션하는 접근 방식을 ["데이터 마이그레이션"](#migrating-data) 섹션에서 보여줍니다. 이는 드물게 성능이 좋지 않기 때문에 더 큰 데이터 세트에는 사용해서는 안 됩니다 - Elasticsearch가 효율적으로 내보낼 수 있는 능력에 제한되며, JSON 형식만 지원됩니다.
:::

### 구현 단계 {#implementation-steps}

1. **이중 수집 구성**
<br/>
데이터 수집 파이프라인을 설정하여 Elastic과 ClickStack에 동시에 데이터를 전송합니다. 이를 달성하는 방법은 현재 수집을 위한 에이전트에 따라 다릅니다 - ["에이전트 마이그레이션"](/use-cases/observability/clickstack/migration/elastic/migrating-agents)를 참조하세요.

2. **보존 기간 조정**
<br/>
Elastic의 TTL 설정을 원하는 보존 기간에 맞게 구성합니다. ClickStack의 [TTL](/use-cases/observability/clickstack/production#configure-ttl)를 설정하여 같은 기간 동안 데이터를 유지합니다.

3. **검증 및 비교**:
<br/>
- 두 시스템에 대해 쿼리를 실행하여 데이터 일관성을 확인합니다.
- 쿼리 성능과 결과를 비교합니다.
- 대시보드와 알림을 ClickStack으로 마이그레이션합니다. 이는 현재 수동 프로세스입니다.
- 모든 주요 대시보드와 알림이 ClickStack에서 예상대로 작동하는지 확인합니다.

4. **점진적 전환**:
<br/>
- 데이터가 Elastic에서 자연스럽게 만료됨에 따라 사용자는 점점 ClickStack에 의존하게 됩니다.
- ClickStack에 대한 신뢰가 확립되면 쿼리와 대시보드를 리디렉션할 수 있습니다.

### 장기 보존 {#long-term-retention}

장기 보존 기간이 필요한 조직을 위해:

- 모든 데이터가 Elastic에서 만료될 때까지 두 시스템을 병렬로 실행합니다.
- ClickStack의 [계층화 저장소](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 기능이 장기 데이터를 효율적으로 관리하는 데 도움을 줄 수 있습니다.
- [물리화된 뷰](/materialized-view/incremental-materialized-view)를 사용하여 집계되거나 필터링된 역사적 데이터를 유지하면서 원시 데이터가 만료되도록 고려합니다.

### 마이그레이션 일정 {#migration-timeline}

마이그레이션 일정은 데이터 보존 요구 사항에 따라 달라집니다:

- **30일 보존**: 마이그레이션은 한 달 이내에 완료될 수 있습니다.
- **더 긴 보존**: 데이터가 Elastic에서 만료될 때까지 병렬 운영을 계속합니다.
- **역사적 데이터**: 절대적으로 필요하다면 특정 역사적 데이터를 가져오기 위해 [데이터 마이그레이션](#migrating-data)을 고려할 수 있습니다.

## 마이그레이션 설정 {#migration-settings}

Elastic에서 ClickStack으로 마이그레이션할 때, 인덱싱 및 저장 설정은 ClickHouse 아키텍처에 맞게 조정해야 합니다. Elasticsearch는 성능과 장애 내성을 위해 수평적 확장 및 샤딩에 의존하며 기본적으로 여러 샤드를 가집니다. 반면 ClickHouse는 수직적 확장에 최적화되어 있으며 일반적으로 더 적은 샤드에서 최상의 성능을 발휘합니다.

### 권장 설정 {#recommended-settings}

**단일 샤드**로 시작하고 수직적으로 확장하는 것을 권장합니다. 이 구성은 대부분의 관측 작업에 적합하며 관리와 쿼리 성능 조정을 단순화합니다.

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: 기본적으로 단일 샤드 멀티 복제본 아키텍처를 사용합니다. 저장소와 컴퓨트는 독립적으로 확장되어 예측할 수 없는 수집 패턴과 읽기 중심의 작업 부하를 가진 관측 사례에 적합합니다.
- **ClickHouse OSS**: 자체 관리 배포에서는 다음을 권장합니다:
  - 단일 샤드로 시작
  - 추가 CPU 및 RAM으로 수직적으로 확장
  - [계층화 저장소](/observability/managing-data#storage-tiers)를 사용하여 로컬 디스크를 S3 호환 객체 저장소로 확장
  - 높은 가용성이 필요한 경우 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) 사용
  - 장애 내성을 위해 [1개의 샤드 복제본](/engines/table-engines/mergetree-family/replication)이 일반적으로 관측 작업에서 충분합니다.

### 샤딩이 필요한 경우 {#when-to-shard}

샤딩이 필요할 수 있는 경우:

- 수집 속도가 단일 노드의 용량을 초과하는 경우(일반적으로 >500K 행/초)
- 테넌트 격리 또는 지역 데이터 분리가 필요한 경우
- 객체 저장소를 사용하더라도 총 데이터 세트가 단일 서버에 너무 큰 경우

샤딩이 필요한 경우 [수평 확장](/architecture/horizontal-scaling)을 참고하여 샤드 키 및 분산 테이블 설정에 대한 지침을 확인하시기 바랍니다.

### 보존 및 TTL {#retention-and-ttl}

ClickHouse는 MergeTree 테이블에서 [TTL 절차](/use-cases/observability/clickstack/production#configure-ttl)를 사용하여 데이터 만료를 관리합니다. TTL 정책은 다음과 같은 기능을 제공합니다:

- 만료된 데이터를 자동으로 삭제
- 오래된 데이터를 콜드 객체 저장소로 이동
- 최근에 자주 쿼리되는 로그만 빠른 디스크에 유지

ClickHouse의 TTL 구성을 기존 Elastic 보존 정책과 일치시켜 마이그레이션 동안 일관된 데이터 생애 주기를 유지하는 것을 권장합니다. 예제는 [ClickStack 프로덕션 TTL 설정](/use-cases/observability/clickstack/production#configure-ttl)을 참조하세요.

## 데이터 마이그레이션 {#migrating-data}

대부분의 관측 데이터에 대해 병렬 작업을 권장하지만, Elasticsearch에서 ClickHouse로의 직접 데이터 마이그레이션이 필요한 특정 경우가 있습니다:

- 데이터 풍부화를 위해 사용되는 작은 룩업 테이블(예: 사용자 매핑, 서비스 카탈로그)
- 관측 데이터와 관련된 Elasticsearch에 저장된 비즈니스 데이터, ClickHouse의 SQL 기능과 비즈니스 인텔리전스 통합이 Elasticsearch보다 데이터 유지 및 쿼리를 쉽게 만들어줍니다.
- 마이그레이션 동안 보존해야 하는 구성 데이터

이 접근 방식은 데이터 세트가 1천만 행 미만일 때만 유효하며, Elasticsearch의 내보내기 기능은 JSON 형식으로 HTTP를 통해 제한되며 더 큰 데이터 세트에 잘 확장되지 않습니다.

다음 단계는 ClickHouse에서 Elasticsearch 인덱스를 단일로 마이그레이션할 수 있습니다.

<VerticalStepper headerLevel="h3">

### 스키마 마이그레이션 {#migrate-scheme}

Elasticsearch에서 마이그레이션되는 인덱스에 대한 ClickHouse 테이블을 생성합니다. 사용자는 [Elasticsearch 타입을 ClickHouse](/use-cases/observability/clickstack/migration/elastic/types)와 매핑할 수 있습니다. 또는 사용자는 ClickHouse에서 JSON 데이터 타입을 사용하여 데이터 삽입 시 적절한 타입의 컬럼을 동적으로 생성하도록 할 수 있습니다.

`syslog` 데이터를 포함하는 인덱스에 대한 Elasticsearch 매핑을 고려해 보세요:

<details>
<summary>Elasticsearch 매핑</summary>

```javascripton
GET .ds-logs-system.syslog-default-2025.06.03-000001/_mapping
{
  ".ds-logs-system.syslog-default-2025.06.03-000001": {
    "mappings": {
      "_meta": {
        "managed_by": "fleet",
        "managed": true,
        "package": {
          "name": "system"
        }
      },
      "_data_stream_timestamp": {
        "enabled": true
      },
      "dynamic_templates": [],
      "date_detection": false,
      "properties": {
        "@timestamp": {
          "type": "date",
          "ignore_malformed": false
        },
        "agent": {
          "properties": {
            "ephemeral_id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "name": {
              "type": "keyword",
              "fields": {
                "text": {
                  "type": "match_only_text"
                }
              }
            },
            "type": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "cloud": {
          "properties": {
            "account": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "availability_zone": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "image": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "instance": {
              "properties": {
                "id": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "machine": {
              "properties": {
                "type": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            },
            "provider": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "region": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "service": {
              "properties": {
                "name": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                }
              }
            }
          }
        },
        "data_stream": {
          "properties": {
            "dataset": {
              "type": "constant_keyword",
              "value": "system.syslog"
            },
            "namespace": {
              "type": "constant_keyword",
              "value": "default"
            },
            "type": {
              "type": "constant_keyword",
              "value": "logs"
            }
          }
        },
        "ecs": {
          "properties": {
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "elastic_agent": {
          "properties": {
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "snapshot": {
              "type": "boolean"
            },
            "version": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "event": {
          "properties": {
            "agent_id_status": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "dataset": {
              "type": "constant_keyword",
              "value": "system.syslog"
            },
            "ingested": {
              "type": "date",
              "format": "strict_date_time_no_millis||strict_date_optional_time||epoch_millis",
              "ignore_malformed": false
            },
            "module": {
              "type": "constant_keyword",
              "value": "system"
            },
            "timezone": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "host": {
          "properties": {
            "architecture": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "containerized": {
              "type": "boolean"
            },
            "hostname": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "id": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "ip": {
              "type": "ip"
            },
            "mac": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "name": {
              "type": "keyword",
              "ignore_above": 1024
            },
            "os": {
              "properties": {
                "build": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "codename": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "family": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "kernel": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "name": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                },
                "platform": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "type": {
                  "type": "keyword",
                  "ignore_above": 1024
                },
                "version": {
                  "type": "keyword",
                  "ignore_above": 1024
                }
              }
            }
          }
        },
        "input": {
          "properties": {
            "type": {
              "type": "keyword",
              "ignore_above": 1024
            }
          }
        },
        "log": {
          "properties": {
            "file": {
              "properties": {
                "path": {
                  "type": "keyword",
                  "fields": {
                    "text": {
                      "type": "match_only_text"
                    }
                  }
                }
              }
            },
            "offset": {
              "type": "long"
            }
          }
        },
        "message": {
          "type": "match_only_text"
        },
        "process": {
          "properties": {
            "name": {
              "type": "keyword",
              "fields": {
                "text": {
                  "type": "match_only_text"
                }
              }
            },
            "pid": {
              "type": "long"
            }
          }
        },
        "system": {
          "properties": {
            "syslog": {
              "type": "object"
            }
          }
        }
      }
    }
  }
}
```
</details>

동일한 ClickHouse 테이블 스키마:

<details>
<summary>ClickHouse 스키마</summary>

```sql
SET enable_json_type = 1;

CREATE TABLE logs_system_syslog
(
    `@timestamp` DateTime,
    `agent` Tuple(
        ephemeral_id String,
        id String,
        name String,
        type String,
        version String),
    `cloud` Tuple(
        account Tuple(
            id String),
        availability_zone String,
        image Tuple(
            id String),
        instance Tuple(
            id String),
        machine Tuple(
            type String),
        provider String,
        region String,
        service Tuple(
            name String)),
    `data_stream` Tuple(
        dataset String,
        namespace String,
        type String),
    `ecs` Tuple(
        version String),
    `elastic_agent` Tuple(
        id String,
        snapshot UInt8,
        version String),
    `event` Tuple(
        agent_id_status String,
        dataset String,
        ingested DateTime,
        module String,
        timezone String),
    `host` Tuple(
        architecture String,
        containerized UInt8,
        hostname String,
        id String,
        ip Array(Variant(IPv4, IPv6)),
        mac Array(String),
        name String,
        os Tuple(
            build String,
            codename String,
            family String,
            kernel String,
            name String,
            platform String,
            type String,
            version String)),
    `input` Tuple(
        type String),
    `log` Tuple(
        file Tuple(
            path String),
        offset Int64),
    `message` String,
    `process` Tuple(
        name String,
        pid Int64),
    `system` Tuple(
        syslog JSON)
)
ENGINE = MergeTree
ORDER BY (`host.name`, `@timestamp`)
```

</details>

유의해야 할 사항:

- 중첩 구조를 표현하기 위해 튜플을 사용하며 점 표기법을 사용하지 않습니다.
- 매핑을 기반으로 적절한 ClickHouse 타입을 사용:
  - `keyword` → `String`
  - `date` → `DateTime`
  - `boolean` → `UInt8`
  - `long` → `Int64`
  - `ip` → `Array(Variant(IPv4, IPv6))`. 필드에 [`IPv4`](/sql-reference/data-types/ipv4) 및 [`IPv6`](/sql-reference/data-types/ipv6)의 혼합이 포함되어 있으므로 [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant)을 사용합니다.
  - `object` → 예측할 수 없는 구조의 syslog 객체에 대해 `JSON`.
- `host.ip` 및 `host.mac` 컬럼은 Elasticsearch에서 모든 타입이 배열인 것과 달리 명시적 `Array` 타입입니다.
- 효율적인 시간 기반 쿼리를 위해 타임스탬프 및 호스트 이름을 사용하여 `ORDER BY` 절이 추가됩니다.
- 로그 데이터에 최적화된 MergeTree를 엔진 타입으로 사용합니다.

**이 접근 방식은 스키마를 정적으로 정의하고 필요한 경우 JSON 타입을 선택적으로 사용하는 것 [이 권장됩니다](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures).**

이 엄격한 스키마는 여러 가지 장점이 있습니다:

- **데이터 검증** – 엄격한 스키마를 강제 적용하여 특정 구조를 제외한 칼럼 폭발의 위험을 피할 수 있습니다. 
- **칼럼 폭발의 위험을 피함**: JSON 타입은 잠재적으로 수천 개의 칼럼으로 확장할 수 있지만, 하위 칼럼이 전용 칼럼으로 저장될 경우 칼럼 파일 폭발이 발생하여 비효율적인 숫자가 생성되고 성능에 영향을 줄 수 있습니다. 이를 완화하기 위해 JSON에서 사용되는 기본 [동적 타입](/sql-reference/data-types/dynamic)에서 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 매개 변수가 고유 경로 수를 한정하며, 임계값에 도달하면 추가 경로가 전체 인코딩 형식을 사용하여 공유 칼럼 파일에 저장되어 성능과 저장 효율성을 유지하며 유연한 데이터 수집을 지원합니다. 그러나 이 공유 칼럼 파일에 접근하는 것은 성능이 떨어지지 않도록 주의해야 합니다. 하지만 JSON 칼럼은 [타입 힌트](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths)로 사용될 수 있습니다. "힌트" 칼럼은 전용 칼럼과 동일한 성능을 제공합니다.
- **경로 및 타입의 단순한 탐색**: JSON 타입은 [탐색 함수](/sql-reference/data-types/newjson#introspection-functions)를 지원하여 유추된 타입 및 경로를 알 수 있지만, 정적 구조는 예를 들어 `DESCRIBE`와 함께 탐색하기가 더 간단할 수 있습니다.
<br/>
대안으로 사용자는 단일 `JSON` 칼럼으로 테이블을 생성할 수 있습니다.

```sql
SET enable_json_type = 1;

CREATE TABLE syslog_json
(
 `json` JSON(`host.name` String, `@timestamp` DateTime)
)
ENGINE = MergeTree
ORDER BY (`json.host.name`, `json.@timestamp`)
```

:::note
우리는 `host.name` 및 `timestamp` 칼럼을 JSON 정의에 대한 타입 힌트로 제공하며, 이는 순서 지정/기본 키에서 사용됩니다. 이는 ClickHouse가 이 칼럼이 null이 아님을 알고, 사용할 하위 칼럼을 아는 데 도움이 됩니다(각 타입에 여러 개가 있을 수 있어 애매모호할 수 있습니다).
:::

후자의 접근은 더 간단하지만 프로토타입 및 데이터 엔지니어링 작업에 가장 적합합니다. 프로덕션의 경우, 꼭 필요한 경우가 아니면 정적 서브 구조에 대해서만 `JSON`을 사용하십시오.

스키마에서 JSON 타입을 사용하고 이를 효율적으로 적용하는 방법에 대한 자세한 내용은 ["스키마 설계하기"](/integrations/data-formats/json/schema)를 권장합니다.

### `elasticdump` 설치 {#install-elasticdump}

Elasticsearch에서 데이터를 내보내기 위해 [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump)를 권장합니다. 이 도구는 `node`가 필요하며 Elasticsearch와 ClickHouse 모두에 대한 네트워크 근접성이 있는 머신에 설치해야 합니다. 대부분의 내보내기에는 최소 4코어 및 16GB RAM을 가진 전용 서버를 권장합니다.

```shell
npm install elasticdump -g
```

`elasticdump`는 데이터 마이그레이션에 여러 가지 장점을 제공합니다:

- Elasticsearch REST API와 직접 상호 작용하여 적절한 데이터 내보내기를 보장합니다.
- 내보내기 과정 중 데이터 일관성을 유지하기 위해 포인트 인 타임(PIT) API를 사용하여 특정 순간에 데이터의 일관된 스냅샷을 생성합니다.
- 바로 JSON 형식으로 데이터를 내보내어 ClickHouse 클라이언트로 삽입하기 위해 스트리밍할 수 있습니다.

가능한 경우, ClickHouse, Elasticsearch 및 `elasticdump`를 동일한 가용성 영역 또는 데이터 센터에서 실행하여 네트워크 이그레스 최소화 및 처리량 극대화를 권장합니다.

### ClickHouse 클라이언트 설치 {#install-clickhouse-client}

`elasticdump`가 위치한 서버에 ClickHouse가 [설치되었는지 확인하세요](/install). **ClickHouse 서버를 시작하지 마세요** - 이러한 단계에서는 클라이언트만 필요합니다.

### 데이터 스트리밍 {#stream-data}

Elasticsearch와 ClickHouse 간에 데이터를 스트리밍하기 위해 `elasticdump` 명령을 사용하여 ClickHouse 클라이언트로 직접 출력을 파이핑합니다. 다음 명령은 잘 구조화된 테이블 `logs_system_syslog`에 데이터를 삽입합니다.

```shell

# export url and credentials
export ELASTICSEARCH_INDEX=.ds-logs-system.syslog-default-2025.06.03-000001
export ELASTICSEARCH_URL=
export ELASTICDUMP_INPUT_USERNAME=
export ELASTICDUMP_INPUT_PASSWORD=
export CLICKHOUSE_HOST=
export CLICKHOUSE_PASSWORD=
export CLICKHOUSE_USER=default


# command to run - modify as required
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONEachRow"
```

다음은 `elasticdump`의 옵션 사용에 대한 사항입니다:

- `type=data` - Elasticsearch에서 문서 내용만을 한정합니다.
- `input-index` - Elasticsearch 입력 인덱스입니다.
- `output=$` - 모든 결과를 stdout으로 리디렉션합니다.
- `sourceOnly` 플래그는 응답에서 메타데이터 필드를 생략하도록 합니다.
- `searchAfter` 플래그는 효율적인 결과 페이지 네비게이션을 위해 [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after)를 사용합니다.
- `pit=true`는 [지점 API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time)를 사용하여 쿼리 사이의 일관된 결과를 보장합니다.
<br/>
여기서 ClickHouse 클라이언트 매개변수(자격 증명 외):

- `max_insert_block_size=1000` - ClickHouse 클라이언트는 이 수의 행에 도달하면 데이터 전송을 보냅니다. 증가시키면 블록 형성 시간에 대한 대가로 처리량이 증가합니다 - 즉, 데이터가 ClickHouse에 나타나기까지 소요되는 시간이 증가합니다.
- `min_insert_block_size_bytes=0` - 서버 블록을 바이트별로 압축하지 않도록 설정합니다.
- `min_insert_block_size_rows=1000` - 서버 측에서 클라이언트의 블록을 압축합니다. 이 경우, rows가 즉시 나타나도록 `max_insert_block_size`로 설정합니다. 처리량을 개선하기 위해 증가시킬 수 있습니다.
- `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - 데이터를 [JSONEachRow 형식](/integrations/data-formats/json/other-formats)을 사용하여 삽입합니다. 이는 `logs_system_syslog`와 같은 정의된 스키마에 전송하는 경우 적합합니다.
<br/>
**사용자는 초당 수천 개의 행 처리량을 기대할 수 있습니다.**

:::note 단일 JSON 행 삽입
단일 JSON 칼럼에 삽입할 경우(위의 `syslog_json` 스키마를 참조), 동일한 삽입 명령을 사용할 수 있습니다. 그러나 사용자는 `JSONAsObject`를 대신하여 형식으로 지정해야 합니다. 예를 들어:

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
```

자세한 내용은 ["JSON을 객체로 읽기"](/integrations/data-formats/json/other-formats#reading-json-as-an-object)를 참조하세요.
:::

### 데이터 변환 (선택 사항) {#transform-data}

위의 명령은 Elasticsearch 필드를 ClickHouse 칼럼에 1:1 매핑한다고 가정합니다. 사용자는 종종 ClickHouse에 삽입하기 전에 Elasticsearch 데이터를 필터링하고 변환해야 합니다.

이는 [`input`](/sql-reference/table-functions/input) 테이블 함수를 사용하여 수행할 수 있으며, 이를 통해 stdout에서 모든 `SELECT` 쿼리를 실행할 수 있습니다.

앞서 언급한 데이터에서 `timestamp`와 `hostname` 필드만 저장하고자 하는 경우 ClickHouse 스키마는 다음과 같습니다:

```sql
CREATE TABLE logs_system_syslog_v2
(
    `timestamp` DateTime,
    `hostname` String
)
ENGINE = MergeTree
ORDER BY (hostname, timestamp)
```

이 테이블에 `elasticdump`에서 삽입하기 위해, 우리는 단순히 `input` 테이블 함수를 사용할 수 있습니다 - JSON 타입을 사용하여 필요한 칼럼을 동적으로 감지하고 선택합니다. 이 `SELECT` 쿼리는 필터를 포함할 수 있음에 유의하십시오.

```shell
elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
--min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
```

`@timestamp` 필드 이름을 이스케이프하고 `JSONAsObject` 입력 형식을 사용해야 할 필요성을 주의하십시오.

</VerticalStepper>
