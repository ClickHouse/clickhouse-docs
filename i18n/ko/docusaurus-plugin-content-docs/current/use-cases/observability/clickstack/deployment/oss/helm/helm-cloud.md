---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm Cloud 배포'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'GKE, EKS, AKS에서 ClickStack을 배포하기 위한 Cloud 전용 구성'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes Cloud 배포', '운영 환경 배포']
---

이 가이드는 관리형 Kubernetes 서비스에서 ClickStack을 배포하기 위한 Cloud 전용 구성을 다룹니다. 기본 설치 절차는 [기본 Helm 배포 가이드](/docs/use-cases/observability/clickstack/deployment/helm)를 참조하십시오.

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

GKE에 배포할 때는 클라우드별 네트워크 동작 특성으로 인해 특정 값을 재정의해야 할 수도 있습니다.

### LoadBalancer DNS 이름 해석 문제 \{#loadbalancer-dns-resolution-issue\}

GKE의 LoadBalancer 서비스로 인해 파드 간 통신이 클러스터 네트워크 내부에 머무르지 않고 외부 IP로 이름이 해석되는 내부 DNS 이름 해석 문제가 발생할 수 있습니다. 이는 특히 OTel collector의 OpAMP 서버 연결에 영향을 줍니다.

**증상:**

* OTel collector 로그에 클러스터 IP 주소에 대한 「connection refused」 오류가 표시됨
* 다음과 같은 OpAMP 연결 실패 발생: `dial tcp 34.118.227.30:4320: connect: connection refused`

**해결 방법:**

OpAMP 서버 URL에 FQDN(정규화된 도메인 이름, Fully Qualified Domain Name)을 사용하십시오:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


### 기타 GKE 관련 고려 사항 \{#other-gke-considerations\}

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

EKS에 배포할 때는 다음과 같은 일반적인 구성을 고려하십시오:

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

AKS 배포 시:

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

어느 클라우드 제공업체에서든 프로덕션 환경에 ClickStack을 배포하기 전에 다음 사항을 확인하십시오.

- [ ] 외부 도메인/IP로 올바른 `frontendUrl`을 구성합니다.
- [ ] HTTPS 접근을 위해 TLS가 적용된 인그레스를 설정합니다.
- [ ] 연결 문제가 발생하는 경우(특히 GKE) `otel.opampServerUrl`을 FQDN으로 설정합니다.
- [ ] 파드 네트워크 CIDR에 맞게 `clickhouse.config.clusterCidrs`를 조정합니다.
- [ ] 프로덕션 워크로드용 영구 스토리지를 구성합니다.
- [ ] 적절한 리소스 요청량과 제한을 설정합니다.
- [ ] 모니터링과 알림을 활성화합니다.
- [ ] 백업 및 재해 복구를 구성합니다.
- [ ] 적절한 시크릿 관리 전략을 구현합니다.

## 운영 환경 모범 사례 \{#production-best-practices\}

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

데이터 보존을 위해 PersistentVolume 리소스가 구성되어 있는지 확인하십시오:

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

HTTP 전용 배포(개발/테스트)에서는 일부 브라우저에서 보안 컨텍스트 요구 사항으로 인해 crypto API 오류가 표시될 수 있습니다. 프로덕션 배포에서는 인그레스 구성을 통해 적절한 TLS 인증서를 사용하여 항상 HTTPS를 사용해야 합니다.

TLS 설정 방법은 [인그레스 구성(Ingress configuration)](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)을 참조하십시오.

## 다음 단계 \{#next-steps\}

- [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 키, 시크릿, 인그레스
- [배포 옵션](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 외부 시스템 구성
- [Helm 기본 가이드](/docs/use-cases/observability/clickstack/deployment/helm) - 기본 설치