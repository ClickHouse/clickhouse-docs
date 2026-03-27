---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm 클라우드 배포'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'GKE, EKS, AKS에 ClickStack을 배포하기 위한 클라우드별 구성'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes 클라우드 배포', '프로덕션 배포']
---

:::warning 차트 버전 2.x
이 페이지에서는 **v2.x** 서브차트 기반 Helm 차트를 다룹니다. 아직 v1.x 인라인 템플릿 차트를 사용 중이라면 [Helm 클라우드 배포 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1)를 참조하십시오. 마이그레이션 단계는 [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)에서 확인하십시오.
:::

이 가이드에서는 관리형 Kubernetes 서비스에 ClickStack을 배포하기 위한 클라우드별 구성을 다룹니다. 기본 설치 방법은 [메인 Helm 배포 가이드](/docs/use-cases/observability/clickstack/deployment/helm)를 참조하십시오.

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

GKE에 배포할 때는 클라우드별 네트워킹 동작으로 인해 특정 값을 재정의해야 할 수 있습니다.

### LoadBalancer DNS 이름 확인 문제 \{#loadbalancer-dns-resolution-issue\}

GKE의 LoadBalancer 서비스는 파드 간 통신이 클러스터 네트워크 내부에 머무르지 않고 외부 IP로 해석되는 내부 DNS 이름 확인 문제를 일으킬 수 있습니다. 이 문제는 특히 OTel collector가 OpAMP 서버에 연결할 때 영향을 줍니다.

**증상:**

* 클러스터 IP 주소와 함께 &quot;connection refused&quot; 오류가 표시되는 OTel collector 로그
* 다음과 같은 OpAMP 연결 실패: `dial tcp 34.118.227.30:4320: connect: connection refused`

**해결 방법:**

OpAMP 서버 URL에 정규화된 도메인 이름(FQDN)을 사용하십시오:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set hyperdx.config.OPAMP_SERVER_URL="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### GKE 예제 값 \{#gke-example-values\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

  config:
    OPAMP_SERVER_URL: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "pd-ssd"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "pd-ssd"
        resources:
          requests:
            storage: 10Gi
```

## Amazon EKS \{#amazon-eks\}

EKS 배포 시 다음과 같은 일반적인 구성을 고려하세요:

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "gp3"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "gp3"
        resources:
          requests:
            storage: 10Gi
```

AWS ALB 인그레스 구성에 대해서는 [추가 매니페스트 가이드](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests#aws-alb-ingress)와 [ALB 예제 값 파일](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/alb-ingress)을 참조하십시오.

## Azure AKS \{#azure-aks\}

AKS에 배포할 경우:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "managed-csi"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "managed-csi"
        resources:
          requests:
            storage: 10Gi
```

## 프로덕션 클라우드 배포 체크리스트 \{#production-cloud-deployment-checklist\}

클라우드 제공자에서 ClickStack을 프로덕션 환경에 배포하기 전에 다음 사항을 확인하십시오:

* [ ] 외부 도메인/IP에 맞게 `hyperdx.frontendUrl`을 올바르게 구성
* [ ] HTTPS 접근을 위해 TLS를 사용하는 인그레스를 설정
* [ ] 연결 문제가 발생하는 경우(특히 GKE) OpAMP 서버 URL을 FQDN으로 재정의
* [ ] ClickHouse 및 Keeper 볼륨 클레임의 스토리지 클래스를 구성
* [ ] 적절한 리소스 요청량과 제한을 설정
* [ ] 모니터링 및 경고를 활성화
* [ ] 백업 및 재해 복구를 구성
* [ ] `hyperdx.secrets` 또는 외부 시크릿을 통해 적절한 시크릿 관리를 구현

## 프로덕션 환경 모범 사례 \{#production-best-practices\}

### 리소스 관리 \{#resource-management\}

```yaml
hyperdx:
  deployment:
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: "2"
        memory: 4Gi

otel-collector:
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 200m
      memory: 256Mi
```

### 고가용성 \{#high-availability\}

```yaml
hyperdx:
  deployment:
    replicas: 3
    topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app.kubernetes.io/name: clickstack

  podDisruptionBudget:
    enabled: true
    minAvailable: 1
```

### 영구 스토리지 \{#persistent-storage\}

데이터 보존을 위해 operator CR 사양에서 영구 볼륨이 구성되어 있는지 확인하십시오.

```yaml
clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi

mongodb:
  spec:
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              storageClassName: "fast-ssd"
              accessModes: ["ReadWriteOnce"]
              resources:
                requests:
                  storage: 10Gi
```

**클라우드별 스토리지 클래스:**

* **GKE**: `pd-ssd` 또는 `pd-balanced`
* **EKS**: `gp3` 또는 `io2`
* **AKS**: `managed-premium` 또는 `managed-csi`

### 브라우저 호환성 참고 사항 \{#browser-compatibility-notes\}

HTTP 전용 배포(개발/테스트)에서는 보안 컨텍스트 요구 사항으로 인해 일부 브라우저에서 crypto API 오류가 발생할 수 있습니다. 프로덕션 배포에서는 항상 인그레스 구성을 통해 적절한 TLS 인증서와 함께 HTTPS를 사용하십시오.

TLS 설정 방법은 [인그레스 구성](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)을 참조하십시오.

## 다음 단계 \{#next-steps\}

* [구성 가이드](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 키, 시크릿 및 인그레스
* [배포 옵션](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 외부 시스템 구성
* [업그레이드 가이드](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x에서 v2.x로 마이그레이션
* [추가 매니페스트](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - 사용자 정의 Kubernetes 객체
* [메인 Helm 가이드](/docs/use-cases/observability/clickstack/deployment/helm) - 기본 설치
* [Cloud 배포 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - v1.x Cloud 구성