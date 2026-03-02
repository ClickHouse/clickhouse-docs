---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 구성'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack Helm 배포를 위한 API 키, 시크릿, 인그레스 구성'
doc_type: 'guide'
keywords: ['ClickStack 구성', 'Helm 시크릿', 'API 키 설정', '인그레스 구성', 'TLS 설정']
---

이 가이드는 ClickStack Helm 배포를 위한 구성 옵션을 설명합니다. 기본 설치 방법은 [주요 Helm 배포 가이드](/docs/use-cases/observability/clickstack/deployment/helm)를 참조하십시오.

## API 키 설정 \{#api-key-setup\}

ClickStack 배포를 성공적으로 완료한 후 텔레메트리 데이터 수집을 활성화하기 위해 API 키를 구성합니다.

1. 구성된 인그레스 또는 서비스 엔드포인트를 통해 **HyperDX 인스턴스에 액세스합니다**.
2. **HyperDX 대시보드에 로그인**한 후 「Team settings」로 이동하여 API 키를 생성하거나 조회합니다.
3. 다음 방법 중 하나를 사용하여 **API 키로 배포 구성을 업데이트합니다**.

### 방법 1: values 파일을 사용한 Helm upgrade로 업데이트 \{#api-key-values-file\}

`values.yaml`에 API 키를 추가합니다:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

그런 다음 배포를 업그레이드하십시오:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```


### 방법 2: helm upgrade 명령과 --set 플래그를 사용하여 업데이트 \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```


### 변경 사항을 적용하기 위해 파드를 재시작하기 \{#restart-pods\}

API 키를 업데이트한 후, 새로운 구성을 적용하도록 파드를 재시작하십시오:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
차트는 API 키가 포함된 Kubernetes 시크릿(`<release-name>-app-secrets`)을 자동으로 생성합니다. 외부 시크릿을 사용하려는 경우가 아니라면 추가적인 시크릿 구성은 필요하지 않습니다.
:::


## 시크릿 관리 \{#secret-management\}

API 키, 데이터베이스 자격 증명 등과 같은 민감한 데이터는 Kubernetes 시크릿으로 관리합니다.

### 사전 구성된 시크릿 사용 \{#using-pre-configured-secrets\}

Helm 차트에는 기본 시크릿 템플릿이 [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)에 포함되어 있습니다. 이 파일은 시크릿 관리를 위한 기본 구조를 제공합니다.

시크릿을 수동으로 적용해야 하는 경우 제공된 `secrets.yaml` 템플릿을 수정한 후 적용하십시오.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: hyperdx-secret
  annotations:
    "helm.sh/resource-policy": keep
type: Opaque
data:
  API_KEY: <base64-encoded-api-key>
```

시크릿을 클러스터에 적용하십시오:

```shell
kubectl apply -f secrets.yaml
```


### 사용자 정의 시크릿 생성 \{#creating-a-custom-secret\}

사용자 정의 Kubernetes 시크릿을 직접 생성합니다:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```


### values.yaml에서 Secret 참조하기 \{#referencing-a-secret\}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## 인그레스 설정 \{#ingress-setup\}

도메인 이름을 통해 HyperDX UI 및 API에 접근할 수 있도록 하려면 `values.yaml`에서 인그레스를 활성화하십시오.

### 기본 인그레스 설정 \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 중요한 구성 참고 사항
`hyperdx.frontendUrl`은 인그레스 호스트 이름과 동일해야 하며 프로토콜까지 포함해야 합니다(예: `https://hyperdx.yourdomain.com`). 이렇게 해야 생성되는 모든 링크, 쿠키, 리디렉션이 올바르게 동작합니다.
:::


### TLS(HTTPS) 사용 설정 \{#enabling-tls\}

배포를 HTTPS로 보호하려면 다음을 수행하십시오.

**1. 인증서와 키를 사용하여 TLS 시크릿을 생성합니다.**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. 인그레스 구성에서 TLS를 활성화합니다.**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```


### 인그레스 설정 예시 \{#example-ingress-configuration\}

참고용으로 생성된 인그레스 리소스는 다음과 같습니다:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hyperdx-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: hyperdx.yourdomain.com
      http:
        paths:
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-clickstack-clickstack-app
                port:
                  number: 3000
  tls:
    - hosts:
        - hyperdx.yourdomain.com
      secretName: hyperdx-tls
```


### 일반적인 인그레스 구성 함정 \{#common-ingress-pitfalls\}

**경로 및 리라이트(rewrite) 구성:**

* Next.js 및 기타 SPA에서는 항상 위에 제시된 것처럼 정규식 경로와 리라이트 애너테이션(annotation)을 사용하십시오.
* 리라이트 없이 `path: /`만 사용하면 정적 리소스 제공이 동작하지 않게 됩니다.

**`frontendUrl`과 `ingress.host` 불일치:**

* 이 값들이 일치하지 않으면 쿠키, 리다이렉트, 에셋 로딩에 문제가 발생할 수 있습니다.

**TLS 구성 오류:**

* TLS 시크릿이 올바르며 인그레스에서 정확히 참조되고 있는지 확인하십시오.
* TLS가 활성화된 상태에서 HTTP로 애플리케이션에 접속하면 브라우저가 안전하지 않은 콘텐츠를 차단할 수 있습니다.

**인그레스 컨트롤러 버전:**

* 일부 기능(정규식 경로 및 리라이트 등)은 최신 버전의 nginx 인그레스 컨트롤러가 필요합니다.
* 다음 명령으로 버전을 확인하십시오.

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTel collector 인그레스 \{#otel-collector-ingress\}

추적, 메트릭, 로그용 OTel collector 엔드포인트를 인그레스를 통해 외부로 노출해야 하는 경우 `additionalIngresses` 구성을 사용하십시오. 이는 클러스터 외부에서 텔레메트리 데이터를 전송하거나 OTel collector에 사용자 지정 도메인을 사용하려는 경우에 유용합니다.

```yaml
hyperdx:
  ingress:
    enabled: true
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

* 이는 OTel collector 엔드포인트용 별도의 인그레스 리소스를 생성합니다.
* 별도의 도메인을 사용하고, 전용 TLS 설정을 구성하며, 커스텀 어노테이션을 적용할 수 있습니다.
* 정규식 경로 규칙을 사용하면 모든 OTLP 신호(traces, metrics, logs)를 단일 규칙으로 라우팅할 수 있습니다.

:::note
OTel collector를 외부로 노출할 필요가 없다면 이 구성은 건너뛰어도 됩니다. 대부분의 사용자에게는 일반 인그레스 설정으로 충분합니다.
:::


## 인그레스 문제 해결 \{#troubleshooting-ingress\}

**인그레스 리소스 확인:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**인그레스 컨트롤러 로그를 확인하세요:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**테스트 에셋 URL:**

정적 에셋이 HTML이 아니라 JS로 제공되는지 확인하려면 `curl`을 사용하십시오:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**브라우저 개발자 도구(DevTools):**

* Network 탭에서 404 응답이나 JS 대신 HTML을 반환하는 정적 리소스(assets)가 있는지 확인합니다.
* 콘솔에서 `Unexpected token <` 같은 오류를 확인합니다. (JS에 대해 HTML이 반환되었음을 의미합니다.)

**경로 재작성 확인:**

* 인그레스가 애셋 경로를 제거하거나 잘못 재작성하지 않는지 확인합니다.

**브라우저 및 CDN 캐시 삭제:**

* 변경 후 최신 애셋을 사용하도록 브라우저 캐시와 CDN/프록시 캐시를 모두 삭제합니다.


## 값 사용자 정의 \{#customizing-values\}

`--set` 플래그를 사용하여 설정 값을 사용자 정의할 수 있습니다:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

또는 사용자 지정 `values.yaml`을 생성하십시오. 기본값을 가져오려면 다음을 실행하십시오:

```shell
helm show values clickstack/clickstack > values.yaml
```

구성 예:

```yaml
replicaCount: 2

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

hyperdx:
  ingress:
    enabled: true
    host: hyperdx.example.com
```

사용자 지정 값을 적용하십시오:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## 다음 단계 \{#next-steps\}

- [배포 옵션](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 외부 시스템 연동 및 최소 구성 배포
- [Cloud 배포](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE, EKS, AKS 구성
- [Helm 기본 가이드](/docs/use-cases/observability/clickstack/deployment/helm) - 기본 설치