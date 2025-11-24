---
'sidebar_label': '스트리밍 및 객체 저장소'
'slug': '/cloud/reference/billing/clickpipes/streaming-and-object-storage'
'title': 'ClickPipes를 위한 스트리밍 및 객체 저장소'
'description': '스트리밍 및 객체 저장소 ClickPipes의 청구 개요'
'doc_type': 'reference'
'keywords':
- 'billing'
- 'clickpipes'
- 'streaming pricing'
- 'costs'
- 'pricing'
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'


# ClickPipes for streaming and object storage {#clickpipes-for-streaming-object-storage}

이 섹션에서는 스트리밍 및 객체 저장소에 대한 ClickPipes의 가격 모델을 설명합니다.

## ClickPipes 가격 구조는 어떻게 생겼나요? {#what-does-the-clickpipes-pricing-structure-look-like}

이는 두 가지 차원으로 구성됩니다:

- **Compute**: 시간당 **단위당 가격**.
  Compute는 ClickPipes 복제본 파드가 데이터 수집을 적극적으로 하든 하지 않든 관계없이 실행하는 데 드는 비용을 나타냅니다.
  모든 ClickPipes 유형에 적용됩니다.
- **Ingested data**: **GB당 가격**.
  수집된 데이터 요금은 모든 스트리밍 ClickPipes에 적용됩니다
  (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs)
  복제본 파드를 통해 전송된 데이터에 대해. 수집된 데이터 크기(GB)는 소스에서 수신된 바이트 수에 따라 청구됩니다(압축 또는 비압축).

## ClickPipes 복제본이란 무엇인가요? {#what-are-clickpipes-replicas}

ClickPipes는 ClickHouse Cloud 서비스와 독립적으로 실행되고 확장되는 전용 인프라를 통해 원격 데이터 소스에서 데이터를 수집합니다.
이런 이유로 전용 컴퓨트 복제본을 사용합니다.

## 기본 복제본 수와 크기는 어떻게 되나요? {#what-is-the-default-number-of-replicas-and-their-size}

각 ClickPipe는 기본적으로 512 MiB의 RAM과 0.125 vCPU(XS)가 제공되는 1개의 복제본을 갖습니다.
이는 **0.0625** ClickHouse 컴퓨트 단위에 해당합니다(1 단위 = 8 GiB RAM, 2 vCPUs).

## ClickPipes의 공개 가격은 무엇인가요? {#what-are-the-clickpipes-public-prices}

- Compute: 시간당 \$0.20(기본 복제본 크기에 대해 시간당 \$0.0125)
- Ingested data: GB당 \$0.04

Compute 차원의 가격은 ClickPipe의 복제본 수와 크기에 따라 달라집니다. 기본 복제본 크기는 수직 확장을 통해 조정할 수 있으며, 각 복제본 크기는 다음과 같이 가격이 책정됩니다:

| 복제본 크기                   | 컴퓨트 단위 | RAM     | vCPU   | 시간당 가격   |
|----------------------------|---------------|---------|--------|----------------|
| Extra Small (XS) (기본)   | 0.0625        | 512 MiB | 0.125  | $0.0125        |
| Small (S)                  | 0.125         | 1 GiB   | 0.25   | $0.025         |
| Medium (M)                 | 0.25          | 2 GiB   | 0.5    | $0.05          |
| Large (L)                  | 0.5           | 4 GiB   | 1.0    | $0.10          |
| Extra Large (XL)           | 1.0           | 8 GiB   | 2.0    | $0.20          |

## 설명 예시는 어떤 모습인가요? {#how-does-it-look-in-an-illustrative-example}

다음 예시는 명시적으로 언급되지 않는 한 단일 M 크기의 복제본을 가정합니다.

<table><thead>
  <tr>
    <th></th>
    <th>24시간 동안 100 GB</th>
    <th>24시간 동안 1 TB</th>
    <th>24시간 동안 10 TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>스트리밍 ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>복제본 4개와 함께: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>객체 저장소 ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _단지 ClickPipes 컴퓨트만으로 오케스트레이션을 위한 것으로,
효율적인 데이터 전송은 기본 Clickhouse 서비스에 의해 가정됩니다._

## 스트리밍 및 객체 저장소 ClickPipes에 대한 FAQ {#faq-streaming-and-object-storage}

<ClickPipesFAQ/>
