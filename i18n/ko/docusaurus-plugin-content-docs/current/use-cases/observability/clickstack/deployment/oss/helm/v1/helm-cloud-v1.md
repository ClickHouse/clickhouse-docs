---
slug: /use-cases/observability/clickstack/deployment/helm-cloud-v1
title: 'Helm Cloud 배포 (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 13
description: 'v1.x Helm 차트로 GKE, EKS 및 AKS에 ClickStack을 배포하기 위한 Cloud별 구성'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes Cloud 배포', '프로덕션 배포']
---

:::warning Deprecated — v1.x 차트
이 페이지는 유지관리 모드인 **v1.x** 인라인 템플릿 Helm 차트를 사용한 Cloud 배포를 설명합니다. v2.x 차트는 [Helm Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud)를 참조하십시오. 마이그레이션하려면 [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)를 참조하십시오.
:::

이 가이드는 관리형 Kubernetes 서비스에 ClickStack을 배포하기 위한 Cloud별 구성을 다룹니다. 기본 설치는 [기본 Helm 배포 가이드](/docs/use-cases/observability/clickstack/deployment/helm-v1)를 참조하십시오.

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

GKE에 배포하는 경우, Cloud별 네트워크 동작 특성으로 인해 일부 값을 재정의해야 할 수 있습니다.

### LoadBalancer DNS 이름 확인 문제 \{#loadbalancer-dns-resolution-issue\}

GKE의 LoadBalancer 서비스는 내부 DNS 이름 확인 문제를 일으킬 수 있으며, 이로 인해 파드 간 통신이 클러스터 네트워크 내부로 유지되지 않고 외부 IP로 확인될 수 있습니다. 이는 특히 OTel collector가 OpAMP 서버에 연결할 때 영향을 줍니다.

**증상:**

* 클러스터 IP 주소에 대해 &quot;connection refused&quot; 오류가 표시되는 OTel collector 로그
* 다음과 같은 OpAMP 연결 실패: `dial tcp 34.118.227.30:4320: connect: connection refused`

**해결 방법:**

OpAMP 서버 URL에 정규화된 도메인 이름(FQDN)을 사용하십시오:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### 기타 GKE 고려사항 \{#other-gke-considerations\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

# Adjust for GKE pod networking if needed
clickhouse:
  config:
    clusterCidrs:
      - "10.8.0.0/16"  # GKE commonly uses this range
      - "10.0.0.0/8"   # Fallback for other configurations
```

## Amazon EKS \{#amazon-eks\}

EKS 배포에서는 다음과 같은 일반적인 구성을 고려하십시오:

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"

# EKS typically uses these pod CIDRs
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"

# Enable ingress for production
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
```

## Azure AKS \{#azure-aks\}

AKS에 배포하는 경우:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"

# AKS pod networking
clickhouse:
  config:
    clusterCidrs:
      - "10.244.0.0/16"  # Common AKS pod CIDR
      - "10.0.0.0/8"
```

## 프로덕션 Cloud 배포 체크리스트 \{#production-cloud-deployment-checklist\}

Cloud 제공자 환경에서 ClickStack을 프로덕션에 배포하기 전에 다음 사항을 확인하십시오:

* [ ] 외부 도메인/IP에 맞는 `frontendUrl` 설정
* [ ] HTTPS 접속을 위해 TLS가 적용된 인그레스 설정
* [ ] 연결 문제가 발생하는 경우(특히 GKE) `otel.opampServerUrl`을 FQDN으로 재정의
* [ ] 파드 네트워크 CIDR에 맞게 `clickhouse.config.clusterCidrs` 조정
* [ ] 프로덕션 워크로드용 영구 스토리지 구성
* [ ] 적절한 리소스 요청량과 제한 설정
* [ ] 모니터링 및 알림 활성화
* [ ] 백업 및 재해 복구 구성
* [ ] 적절한 시크릿 관리 구현

## 프로덕션 환경 모범 사례 \{#production-best-practices\}

### 리소스 관리 \{#resource-management\}

```yaml
hyperdx:
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
```

### 고가용성 \{#high-availability\}

```yaml
hyperdx:
  replicaCount: 3

  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/name
                  operator: In
                  values:
                    - clickstack
            topologyKey: kubernetes.io/hostname
```

### 영구 스토리지 \{#persistent-storage\}

데이터를 보존할 수 있도록 영구 볼륨이 구성되어 있는지 확인하십시오.

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # Use cloud-specific storage class
```

**Cloud별 스토리지 클래스:**

* **GKE**: `pd-ssd` 또는 `pd-balanced`
* **EKS**: `gp3` 또는 `io2`
* **AKS**: `managed-premium` 또는 `managed-csi`

### 브라우저 호환성 참고 사항 \{#browser-compatibility-notes\}

HTTP만 사용하는 배포 환경(개발/테스트)에서는 보안 컨텍스트 요구 사항으로 인해 일부 브라우저에서 Crypto API 오류가 표시될 수 있습니다. 프로덕션 배포에서는 항상 인그레스 구성을 통해 적절한 TLS 인증서와 함께 HTTPS를 사용하십시오.

TLS 설정 지침은 [인그레스 구성](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#ingress-setup)을 참조하십시오.

## 다음 단계 \{#next-steps\}

* [구성 가이드 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API 키, 시크릿 및 인그레스
* [배포 옵션 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - 외부 시스템 구성
* [기본 Helm 가이드 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - 기본 설치
* [Cloud 배포 (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - v2.x용 Cloud 가이드
* [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x에서 v2.x로 마이그레이션