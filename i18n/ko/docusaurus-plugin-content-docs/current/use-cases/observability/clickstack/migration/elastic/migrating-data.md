---
slug: /use-cases/observability/clickstack/migration/elastic/migrating-data
title: 'Elastic에서 ClickStack으로 데이터 마이그레이션'
pagination_prev: null
pagination_next: null
sidebar_label: '데이터 마이그레이션'
sidebar_position: 4
description: 'Elastic에서 ClickHouse Observability Stack으로 데이터 마이그레이션'
show_related_blogs: true
keywords: ['ClickStack']
doc_type: 'guide'
---

## 병행 운영 전략 \{#parallel-operation-strategy\}

관측성(Observability) 사용 사례에서 Elastic을 ClickStack으로 마이그레이션할 때는 과거 데이터를 이전하려고 시도하기보다는 **병행 운영** 방식을 권장합니다. 이 전략은 다음과 같은 장점이 있습니다.

1. **위험 최소화**: 두 시스템을 동시에 운영하면 기존 데이터와 대시보드에 계속 접근하면서 ClickStack을 검증하고, 사용자들이 새 시스템에 익숙해지도록 할 수 있습니다.
2. **자연스러운 데이터 만료**: 대부분의 관측성 데이터는 보존 기간이 제한적(일반적으로 30일 이하)이므로, Elastic에서 데이터가 만료됨에 따라 자연스럽게 전환이 이루어집니다.
3. **간소화된 마이그레이션**: 시스템 간 과거 데이터를 옮기기 위한 복잡한 데이터 전송 도구나 프로세스가 필요하지 않습니다.

<br/>

:::note Migrating data
["Migrating data"](#migrating-data) 섹션에서는 Elasticsearch에서 ClickHouse로 필수 데이터를 마이그레이션하는 방법을 보여 줍니다. 이는 Elasticsearch가 효율적으로 내보내는 능력에 제한을 받고 JSON 형식만 지원하므로, 성능이 잘 나오지 않는 경우가 많습니다. 따라서 대규모 데이터셋에는 사용하지 않는 것이 좋습니다.
:::

### 구현 단계 \{#implementation-steps\}

<VerticalStepper headerLevel="h4">

#### 이중 수집 구성 \{#configure-dual-ingestion\}

데이터 수집 파이프라인을 구성하여 데이터를 Elastic과 ClickStack 모두로 동시에 전송하도록 설정합니다. 

구체적인 방법은 현재 사용 중인 수집 에이전트에 따라 달라집니다. 자세한 내용은 ["Migrating Agents"](/use-cases/observability/clickstack/migration/elastic/migrating-agents)를 참고하십시오.

#### 보존 기간 조정 \{#adjust-retention-period\}

Elastic의 TTL 설정을 원하는 보존 기간에 맞게 구성합니다. 동일한 기간 동안 데이터를 유지하도록 ClickStack [TTL](/use-cases/observability/clickstack/production#configure-ttl)도 설정합니다.

#### 검증 및 비교 \{#validate-and-compare\}

- 두 시스템 모두에 대해 쿼리를 실행하여 데이터 일관성을 확인합니다.
- 쿼리 성능과 결과를 비교합니다.
- 대시보드와 알림을 ClickStack으로 마이그레이션합니다. 현재는 수동으로 수행해야 합니다.
- 모든 중요한 대시보드와 알림이 ClickStack에서 예상대로 동작하는지 검증합니다.

#### 점진적 전환 \{#graudal-transition\}

- Elastic에서 데이터가 자연스럽게 만료됨에 따라 ClickStack에 점점 더 많이 의존하게 됩니다.
- ClickStack에 대한 신뢰가 충분히 확보되면, 쿼리와 대시보드의 대상을 ClickStack으로 전환하기 시작할 수 있습니다.

</VerticalStepper>

### 장기 보관 \{#long-term-retention\}

보관 기간을 더 길게 설정해야 하는 조직의 경우:

- Elastic에서 모든 데이터의 보관 기간이 만료될 때까지 두 시스템을 병행 운영하십시오.
- ClickStack의 [tiered storage](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-multiple-volumes) 기능을 활용하여 장기 보관 데이터를 효율적으로 관리하십시오.
- 원시 데이터는 만료되도록 두면서 집계되거나 필터링된 이력 데이터를 유지하기 위해 [materialized views](/materialized-view/incremental-materialized-view) 사용을 고려하십시오.

### 마이그레이션 일정 \{#migration-timeline\}

마이그레이션 일정은 데이터 보존 요건에 따라 달라집니다.

- **30일 보존**: 마이그레이션을 한 달 이내에 완료할 수 있습니다.
- **더 긴 보존 기간**: Elastic에서 데이터가 만료될 때까지 병행 운영을 계속합니다.
- **과거 데이터**: 반드시 필요한 경우, 특정 과거 데이터를 가져오기 위해 [데이터 마이그레이션](#migrating-data)을 사용하는 방안을 고려할 수 있습니다.

## 설정 마이그레이션 \{#migration-settings\}

Elastic에서 ClickStack으로 마이그레이션할 때는 인덱싱 및 저장소 설정을 ClickHouse 아키텍처에 맞게 조정해야 합니다. Elasticsearch는 성능과 장애 허용을 위해 수평 확장과 세그먼트에 의존하며 기본적으로 여러 개의 세그먼트를 사용하지만, ClickHouse는 수직 확장에 최적화되어 있어 일반적으로 더 적은 수의 세그먼트를 사용할 때 가장 좋은 성능을 발휘합니다.

### 권장 설정 \{#recommended-settings\}

**단일 세그먼트**로 시작해 수직 확장하는 구성을 권장합니다. 이 구성은 대부분의 관측성 워크로드에 적합하며, 관리와 쿼리 성능 튜닝이 모두 단순해집니다.

- **[ClickHouse Cloud](https://clickhouse.com/cloud)**: 기본적으로 단일 세그먼트, 다중 레플리카 아키텍처를 사용합니다. 스토리지와 컴퓨트가 서로 독립적으로 확장되므로, 수집 패턴이 예측하기 어렵고 읽기 중심 워크로드가 많은 관측성 사용 사례에 적합합니다.
- **ClickHouse OSS**: 자가 관리형 배포에서는 다음을 권장합니다.
  - 단일 세그먼트로 시작
  - 추가 CPU와 RAM을 통해 수직 확장
  - S3 호환 객체 스토리지로 로컬 디스크를 확장하기 위해 [계층형 스토리지](/observability/managing-data#storage-tiers) 사용
  - 고가용성이 필요하다면 [`ReplicatedMergeTree`](/engines/table-engines/mergetree-family/replication) 사용
  - 장애 허용을 위해, 관측성 워크로드에서는 일반적으로 [세그먼트당 1개의 레플리카](/engines/table-engines/mergetree-family/replication)면 충분합니다.

### 세그먼트를 사용해야 할 때 \{#when-to-shard\}

다음과 같은 경우 세그먼트 구성이 필요할 수 있습니다.

- 수집 속도가 단일 노드의 처리 용량을 초과하는 경우(일반적으로 초당 500K 행 이상)
- 테넌트 격리 또는 리전별 데이터 분리가 필요한 경우
- 객체 스토리지를 사용하더라도 전체 데이터셋이 단일 서버에 담기에는 너무 큰 경우

세그먼트 구성이 필요한 경우, 세그먼트 키와 분산 테이블 설정에 대한 안내는 [Horizontal scaling](/architecture/horizontal-scaling)을 참고하십시오.

### 보존 및 TTL \{#retention-and-ttl\}

ClickHouse는 데이터 만료를 관리하기 위해 MergeTree 테이블에서 [TTL 절](/use-cases/observability/clickstack/production#configure-ttl)을 사용합니다. TTL 정책으로 다음을 수행할 수 있습니다.

- 만료된 데이터를 자동으로 삭제
- 오래된 데이터를 콜드 객체 스토리지로 이동
- 빠른 디스크에는 최근에 자주 조회되는 로그만 보존

마이그레이션 동안 일관된 데이터 라이프사이클을 유지하기 위해 기존 Elastic의 보존 정책에 ClickHouse TTL 구성을 맞추는 것이 좋습니다. 예시는 [ClickStack 운영 환경 TTL 구성](/use-cases/observability/clickstack/production#configure-ttl)을 참조하십시오.

## 데이터 마이그레이션 \{#migrating-data\}

대부분의 관측성 데이터에는 병렬 운영을 권장하지만, Elasticsearch에서 ClickHouse로 직접 데이터 마이그레이션이 필요할 수 있는 특정 사례가 있습니다:

- 데이터 보강에 사용되는 작은 조회용 테이블(예: 사용자 매핑, 서비스 카탈로그)
- 관측성 데이터와 연관시키기 위해 Elasticsearch에 저장된 비즈니스 데이터로서, ClickHouse의 SQL 기능과 비즈니스 인텔리전스 통합을 활용하면 Elasticsearch의 제한적인 쿼리 옵션에 비해 데이터를 더 쉽게 유지 관리하고 쿼리할 수 있는 경우
- 마이그레이션 과정에서 보존해야 하는 구성 데이터

이 방법은 Elasticsearch의 내보내기 기능이 HTTP를 통한 JSON으로 제한되어 있고 더 큰 데이터셋에는 잘 확장되지 않기 때문에, 1천만 행 미만의 데이터셋에만 적합합니다. 

다음 단계에서는 단일 Elasticsearch 인덱스를 ClickHouse로 마이그레이션하는 방법을 설명합니다.

<VerticalStepper headerLevel="h3">
  ### 스키마 마이그레이션

  Elasticsearch에서 마이그레이션할 인덱스를 위한 테이블을 ClickHouse에 생성하세요. [Elasticsearch 타입을 ClickHouse 타입에 매핑](/use-cases/observability/clickstack/migration/elastic/types)할 수 있습니다. 또는 ClickHouse의 JSON 데이터 타입을 사용하면 데이터 삽입 시 적절한 타입의 컬럼이 동적으로 생성됩니다.

  `syslog` 데이터를 포함하는 인덱스에 대한 다음 Elasticsearch 매핑을 참고하세요:

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

  이에 대응하는 ClickHouse 테이블 스키마:

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

  다음 사항에 유의하십시오:

  * 튜플은 점 표기(dot notation) 대신 중첩된 구조를 표현하는 데 사용됩니다.
  * 매핑에 따라 적절한 ClickHouse 타입을 사용했습니다:
    * `keyword` → `String`
    * `date` → `DateTime`
    * `boolean` → `UInt8`
    * `long` → `Int64`
    * `ip` → `Array(Variant(IPv4, IPv6))`. 이 필드는 [`IPv4`](/sql-reference/data-types/ipv4)와 [`IPv6`](/sql-reference/data-types/ipv6)가 섞여 있으므로 [`Variant(IPv4, IPv6)`](/sql-reference/data-types/variant)를 사용합니다.
    * `object` → 구조를 예측할 수 없는 syslog object에 대해 `JSON`을 사용합니다.
  * `host.ip` 및 `host.mac` 컬럼은 Elasticsearch에서 모든 타입이 배열인 것과는 달리, 명시적으로 `Array` 타입으로 지정되어 있습니다.
  * 시간 기반 조회를 효율적으로 수행할 수 있도록 타임스탬프와 호스트 이름을 사용하는 `ORDER BY` 절을 추가합니다
  * 로그 데이터에 최적화된 엔진 유형으로 `MergeTree`를 사용합니다

  **스키마를 정적으로 정의하고 필요한 경우 JSON 타입을 선택적으로 사용하는 접근 방식을 [권장합니다](/integrations/data-formats/json/schema#handling-semi-structured-dynamic-structures).**

  이 엄격한 스키마는 여러 가지 이점을 제공합니다:

  * **데이터 검증(Data validation)** – 엄격한 스키마를 적용하면 특정 구조를 제외하고는 컬럼 폭증 위험을 방지할 수 있습니다.
  * **컬럼 폭발 위험을 피함**: JSON 타입은 서브컬럼이 전용 컬럼으로 저장되므로 잠재적으로 수천 개의 컬럼까지 확장될 수 있지만, 이로 인해 지나치게 많은 컬럼 파일이 생성되어 성능에 영향을 주는 컬럼 파일 폭발이 발생할 수 있습니다. 이를 완화하기 위해 JSON에서 사용되는 기본 [Dynamic type](/sql-reference/data-types/dynamic)은 [`max_dynamic_paths`](/sql-reference/data-types/newjson#reading-json-paths-as-sub-columns) 파라미터를 제공하며, 이는 별도 컬럼 파일로 저장되는 고유 경로의 수를 제한합니다. 임계값에 도달하면, 추가 경로는 compact하게 인코딩된 형식을 사용하는 공유 컬럼 파일에 저장되어, 유연한 데이터 수집을 지원하면서도 성능과 저장 효율성을 유지합니다. 다만 이 공유 컬럼 파일에 접근하는 것은 그만큼 성능이 좋지 않습니다. 또한 JSON 컬럼은 [type hints](/integrations/data-formats/json/schema#using-type-hints-and-skipping-paths)와 함께 사용할 수 있습니다. 「힌트를 지정한」 컬럼은 전용 컬럼과 동일한 성능을 제공합니다.
  * **경로와 타입을 더 쉽게 살펴보기**: JSON 타입은 추론된 타입과 경로를 판별하기 위한 [introspection 함수](/sql-reference/data-types/newjson#introspection-functions)를 지원하지만, 정적인 구조는 예를 들어 `DESCRIBE`로 살펴보는 것이 더 간단할 수 있습니다.

  <br />

  또는 `JSON` 컬럼 하나로 테이블을 생성하셔도 됩니다.

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
  정렬/기본 키에서 사용되므로 JSON 정의에서 `host.name` 및 `timestamp` 컬럼에 대한 타입 힌트를 제공합니다. 이를 통해 ClickHouse는 해당 컬럼이 null이 아님을 인식하고 사용할 하위 컬럼을 정확히 파악할 수 있습니다(각 타입에 대해 여러 개가 존재할 수 있으므로 타입 힌트가 없으면 모호해집니다).
  :::

  후자의 방식은 더 간단하지만, 프로토타이핑 및 데이터 엔지니어링 작업에 가장 적합합니다. 프로덕션 환경에서는 필요한 경우에만 동적 하위 구조에 `JSON`을 사용하십시오.

  스키마에서 JSON 타입을 사용하는 방법과 효율적으로 적용하는 방법에 대한 자세한 내용은 [&quot;Designing your schema&quot;](/integrations/data-formats/json/schema) 가이드를 참고하시기 바랍니다.

  ### `elasticdump` 설치하기

  Elasticsearch에서 데이터를 내보내기 위해 [`elasticdump`](https://github.com/elasticsearch-dump/elasticsearch-dump)를 권장합니다. 이 도구는 `node`가 필요하며, Elasticsearch와 ClickHouse 모두에 네트워크 접근이 가능한 머신에 설치해야 합니다. 대부분의 내보내기 작업에는 최소 4코어와 16GB RAM을 갖춘 전용 서버를 권장합니다.

  ```shell
  npm install elasticdump -g
  ```

  `elasticdump`는 데이터 마이그레이션에 여러 가지 장점을 제공합니다:

  * Elasticsearch REST API와 직접 통신하여 데이터가 올바르게 내보내지도록 합니다.
  * Point-in-Time (PIT) API를 사용하여 내보내기 과정에서 데이터 일관성을 유지합니다. 이 API는 특정 시점의 데이터를 기준으로 일관된 스냅샷을 생성합니다.
  * 데이터를 JSON 형식으로 직접 내보내어 ClickHouse 클라이언트로 스트리밍해 삽입할 수 있습니다.

  가능하다면 네트워크 송신을 최소화하고 처리량을 극대화하기 위해 ClickHouse, Elasticsearch 및 `elastic dump`를 동일한 가용 영역 또는 데이터 센터에서 실행하시기를 권장합니다.

  ### ClickHouse 클라이언트 설치하기

  `elasticdump`가 위치한 [서버에 ClickHouse를 설치](/install)했는지 확인하세요. **ClickHouse 서버를 시작하지 마세요** - 이 단계에서는 클라이언트만 필요합니다.

  ### 데이터 스트리밍

  Elasticsearch와 ClickHouse 간에 데이터를 스트리밍하려면 `elasticdump` 명령을 사용하여 출력을 ClickHouse 클라이언트로 직접 파이프하십시오. 다음 명령은 잘 구조화된 테이블 `logs_system_syslog`에 데이터를 삽입합니다.

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

  `elasticdump`에 사용되는 다음 플래그에 유의하십시오:

  * `type=data` - Elasticsearch에서 응답이 문서 콘텐츠만 포함되도록 제한합니다.
  * `input-index` - 여기에서 사용하는 Elasticsearch 입력 인덱스입니다.
  * `output=$` - 모든 결과를 표준 출력(stdout)으로 리디렉션합니다.
  * `sourceOnly` 플래그는 응답에 메타데이터 필드가 포함되지 않도록 합니다.
  * 결과 페이지네이션을 효율적으로 수행하기 위해 [`searchAfter` API](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/paginate-search-results#search-after)를 사용하도록 설정하는 `searchAfter` 플래그입니다.
  * [point in time API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-open-point-in-time)를 사용할 때 쿼리 간 결과의 일관성을 보장하기 위해 `pit=true`를 설정합니다.

  <br />

  ClickHouse 클라이언트 매개변수는 다음과 같습니다(자격 증명 제외):

  * `max_insert_block_size=1000` - ClickHouse 클라이언트는 이 행 수에 도달하면 데이터를 전송합니다. 이 값을 늘리면 처리량은 향상되지만 블록을 구성하는 데 걸리는 시간이 길어져, 데이터가 ClickHouse에 나타날 때까지의 시간이 늘어납니다.
  * `min_insert_block_size_bytes=0` - 서버에서 바이트 단위 블록 병합을 비활성화합니다.
  * `min_insert_block_size_rows=1000` - 서버 측에서 클라이언트가 보낸 블록을 병합합니다. 여기서는 `max_insert_block_size`로 설정하여 행이 즉시 나타나도록 합니다. 처리량을 향상하려면 값을 늘리십시오.
  * `query="INSERT INTO logs_system_syslog FORMAT JSONAsRow"` - 데이터를 [JSONEachRow format](/integrations/data-formats/json/other-formats) 형식으로 삽입합니다. 이는 `logs_system_syslog`과 같이 스키마가 잘 정의된 테이블로 데이터를 전송하는 경우에 적합합니다.

  <br />

  **초당 수천 행 수준의 처리량을 기대할 수 있습니다.**

  :::note 단일 JSON 행에 삽입
  단일 JSON 컬럼에 삽입하는 경우(위의 `syslog_json` 스키마 참조), 동일한 insert 명령을 사용할 수 있습니다. 단, 형식으로 `JSONEachRow` 대신 `JSONAsObject`를 지정하십시오. 예:

  ```shell
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true | 
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog FORMAT JSONAsObject"
  ```

  자세한 내용은 [&quot;객체로 JSON 읽기&quot;](/integrations/data-formats/json/other-formats#reading-json-as-an-object)를 참조하세요.
  :::

  ### 데이터 변환(선택 사항)

  위 명령은 Elasticsearch 필드와 ClickHouse 컬럼 간의 1:1 매핑을 가정합니다. ClickHouse에 삽입하기 전에 Elasticsearch 데이터를 필터링하고 변환해야 하는 경우가 많습니다.

  이는 [`input`](/sql-reference/table-functions/input) 테이블 함수를 사용하여 구현할 수 있으며, 이를 통해 stdout에서 모든 `SELECT` 쿼리를 실행할 수 있습니다.

  이전 데이터에서 `timestamp`와 `hostname` 필드만 저장한다고 가정하겠습니다. ClickHouse 스키마는 다음과 같습니다:

  ```sql
  CREATE TABLE logs_system_syslog_v2
  (
      `timestamp` DateTime,
      `hostname` String
  )
  ENGINE = MergeTree
  ORDER BY (hostname, timestamp)
  ```

  `elasticdump`에서 이 테이블로 데이터를 삽입하려면 `input` 테이블 함수를 사용하면 됩니다. JSON 타입을 사용하여 필요한 컬럼을 동적으로 감지하고 선택합니다. 참고로 이 `SELECT` 쿼리에는 필터를 쉽게 포함할 수 있습니다.

  ```shell
  elasticdump --input=${ELASTICSEARCH_URL} --type=data --input-index ${ELASTICSEARCH_INDEX} --output=$ --sourceOnly --searchAfter --pit=true |
  clickhouse-client --host ${CLICKHOUSE_HOST} --secure --password ${CLICKHOUSE_PASSWORD} --user ${CLICKHOUSE_USER} --max_insert_block_size=1000 \
  --min_insert_block_size_bytes=0 --min_insert_block_size_rows=1000 --query="INSERT INTO test.logs_system_syslog_v2 SELECT json.\`@timestamp\` as timestamp, json.host.hostname as hostname FROM input('json JSON') FORMAT JSONAsObject"
  ```

  `@timestamp` 필드 이름을 이스케이프하고 `JSONAsObject` 입력 형식을 사용해야 한다는 점에 유의하십시오.
</VerticalStepper>