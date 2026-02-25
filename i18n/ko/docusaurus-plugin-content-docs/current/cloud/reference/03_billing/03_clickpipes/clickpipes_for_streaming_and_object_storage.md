---
sidebar_label: '스트리밍 및 객체 스토리지'
slug: /cloud/reference/billing/clickpipes/streaming-and-object-storage
title: '스트리밍 및 객체 스토리지를 위한 ClickPipes'
description: '스트리밍 및 객체 스토리지용 ClickPipes 과금 개요'
doc_type: 'reference'
keywords: ['billing', 'clickpipes', 'streaming pricing', 'costs', 'pricing']
---

import ClickPipesFAQ from '../../../_snippets/_clickpipes_faq.md'


# 스트리밍 및 객체 스토리지를 위한 ClickPipes \{#clickpipes-for-streaming-object-storage\}

이 섹션에서는 스트리밍 및 객체 스토리지를 위한 ClickPipes의 요금 구조를 설명합니다.

## ClickPipes 요금 구조는 어떻게 구성되어 있습니까? \{#what-does-the-clickpipes-pricing-structure-look-like\}

두 가지 요소로 구성됩니다:

- **컴퓨트**: **단위당 시간당** 요금.
  컴퓨트는 ClickPipes 레플리카 파드가 데이터를 적극적으로 수집하는지 여부와 관계없이 파드를 실행하는 데 드는 비용을 의미합니다.
  모든 ClickPipes 유형에 적용됩니다.
- **수집된 데이터**: **GB당** 요금.
  수집된 데이터 요율은 레플리카 파드를 통해 전송되는 데이터에 대해 모든 스트리밍 ClickPipes
  (Kafka, Confluent, Amazon MSK, Amazon Kinesis, Redpanda, WarpStream, Azure Event Hubs)
  에 적용됩니다. 수집된 데이터 크기(GB)는 소스에서 수신한 바이트(압축 여부와 관계없이)를 기준으로 과금됩니다.

## ClickPipes 레플리카란 무엇입니까? \{#what-are-clickpipes-replicas\}

ClickPipes는 ClickHouse Cloud 서비스와 독립적으로 실행되고 확장되는
전용 인프라를 통해 원격 데이터 소스에서 데이터를 수집합니다.
이러한 이유로 전용 컴퓨트 레플리카를 사용합니다.

## 기본 레플리카 수와 해당 크기는 어떻게 됩니까? \{#what-is-the-default-number-of-replicas-and-their-size\}

각 ClickPipe는 기본적으로 1개의 레플리카로 제공되며, 이 레플리카에는 512 MiB RAM과 0.125 vCPU(XS)가 할당됩니다.
이는 ClickHouse 컴퓨트 유닛 **0.0625**에 해당합니다(1 유닛 = 8 GiB RAM, 2 vCPU).

## ClickPipes의 공개 가격은 어떻게 되나요? \{#what-are-the-clickpipes-public-prices\}

- Compute: 유닛 1개당 시간당 \$0.20 (기본 레플리카 크기 기준 레플리카 1개당 시간당 \$0.0125)
- 수집된 데이터: GB당 \$0.04

Compute 항목의 가격은 ClickPipe 내 레플리카의 **개수**와 **크기**에 따라 달라집니다. 기본 레플리카 크기는 수직 확장을 통해 조정할 수 있으며, 각 레플리카 크기의 시간당 가격은 다음과 같습니다:

| 레플리카 크기              | Compute 유닛 | RAM     | vCPU   | 시간당 가격    |
|----------------------------|---------------|---------|--------|----------------|
| Extra Small (XS) (기본값)  | 0.0625        | 512 MiB | 0.125. | $0.0125        |
| Small (S)                  | 0.125         | 1 GiB   | 0.25   | $0.025         |
| Medium (M)                 | 0.25          | 2 GiB   | 0.5    | $0.05          |
| Large (L)                  | 0.5           | 4 GiB   | 1.0    | $0.10          |
| Extra Large (XL)           | 1.0           | 8 GiB   | 2.0    | $0.20          |

## 예시로 보면 어떻게 보입니까? \{#how-does-it-look-in-an-illustrative-example\}

다음 예시는 별도로 언급하지 않는 한, M 크기 레플리카 1개를 기준으로 합니다.

<table><thead>
  <tr>
    <th></th>
    <th>24시간 동안 100GB</th>
    <th>24시간 동안 1TB</th>
    <th>24시간 동안 10TB</th>
  </tr></thead>
<tbody>
  <tr>
    <td>스트리밍 ClickPipe</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 100) = \$5.20</td>
    <td>(0.25 x 0.20 x 24) + (0.04 x 1000) = \$41.20</td>
    <td>레플리카 4개인 경우: <br></br> (0.25 x 0.20 x 24 x 4) + (0.04 x 10000) = \$404.80</td>
  </tr>
  <tr>
    <td>객체 스토리지 ClickPipe $^*$</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
    <td>(0.25 x 0.20 x 24) = \$1.20</td>
  </tr>
</tbody>
</table>

$^1$ _오케스트레이션을 위한 ClickPipes 컴퓨팅만 포함되며, 실제 데이터 전송은 기본 ClickHouse 서비스에서 처리되는 것으로 가정합니다._

## 스트리밍 및 객체 스토리지용 ClickPipes FAQ \{#faq-streaming-and-object-storage\}

<ClickPipesFAQ/>