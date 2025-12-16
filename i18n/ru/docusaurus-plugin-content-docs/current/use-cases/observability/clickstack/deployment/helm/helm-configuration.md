---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Настройка Helm'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'Настройка ключей API, секретов и входного шлюза для развертываний ClickStack через Helm'
doc_type: 'guide'
keywords: ['Конфигурация ClickStack', 'Секреты Helm', 'Настройка ключей API', 'Конфигурация входного шлюза', 'Настройка TLS']
---

В этом руководстве рассматриваются параметры конфигурации для развертываний ClickStack через Helm. Для базовой установки см. [основное руководство по развертыванию Helm](/docs/use-cases/observability/clickstack/deployment/helm).

## Настройка API-ключа {#api-key-setup}

После успешного развертывания ClickStack настройте API-ключ для сбора телеметрических данных:

1. **Откройте экземпляр HyperDX** через настроенный входной шлюз или конечную точку сервиса
2. **Войдите в панель управления HyperDX** и перейдите в раздел Team settings, чтобы сгенерировать или получить API-ключ
3. **Обновите развертывание**, добавив API-ключ одним из следующих способов:

### Способ 1: обновление через `helm upgrade` с файлом values {#api-key-values-file}

Добавьте API-ключ в файл `values.yaml`:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

Затем обновите развертывание:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### Метод 2: Обновление через `helm upgrade` с флагом `--set` {#api-key-set-flag}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```

### Перезапустите поды, чтобы применить изменения {#restart-pods}

После обновления ключа API перезапустите поды, чтобы применить новую конфигурацию:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
Чарт автоматически создаёт секрет Kubernetes (`<release-name>-app-secrets`) с вашим API-ключом. Дополнительная настройка секрета не требуется, если вы не планируете использовать внешний секрет.
:::

## Управление секретами {#secret-management}

Для работы с конфиденциальными данными, такими как API-ключи или учетные данные для доступа к базе данных, используйте секреты Kubernetes.

### Использование предварительно настроенных секретов {#using-pre-configured-secrets}

Helm-чарт включает шаблон секрета по умолчанию, расположенный по адресу [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml). Этот файл задаёт базовую структуру для управления секретами.

Если вам нужно вручную применить секрет, измените и примените предоставленный шаблон `secrets.yaml`:

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

Примените секрет к кластеру:

```shell
kubectl apply -f secrets.yaml
```

### Создание пользовательского секрета {#creating-a-custom-secret}

Создайте вручную пользовательский секрет Kubernetes:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### Ссылка на Secret в values.yaml {#referencing-a-secret}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

## Настройка входного шлюза {#ingress-setup}

Чтобы открыть доступ к интерфейсу и API HyperDX по доменному имени, включите конфигурацию входного шлюза в файле `values.yaml`.

### Общая конфигурация входного шлюза {#general-ingress-configuration}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note Важное примечание по конфигурации
Значение `hyperdx.frontendUrl` должно совпадать с именем хоста входного шлюза и включать протокол (например, `https://hyperdx.yourdomain.com`). Это обеспечивает корректную работу всех сгенерированных ссылок, куки и перенаправлений.
:::

### Включение TLS (HTTPS) {#enabling-tls}

Чтобы защитить развертывание с помощью HTTPS:

**1. Создайте секрет TLS с вашим сертификатом и ключом:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. Включите TLS в конфигурации входного шлюза:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### Пример конфигурации входного шлюза {#example-ingress-configuration}

Для наглядности ниже показан сгенерированный ресурс входного шлюза:

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

### Частые проблемы с входным шлюзом {#common-ingress-pitfalls}

**Конфигурация пути и переписывания (rewrite):**

* Для Next.js и других SPA (одностраничных приложений) всегда используйте путь в виде регулярного выражения и аннотацию переписывания, как показано выше
* Не используйте просто `path: /` без переписывания, так как это нарушит раздачу статических ресурсов

**Несоответствие `frontendUrl` и `ingress.host`:**

* Если они не совпадают, вы можете столкнуться с проблемами с куки, перенаправлениями и загрузкой ресурсов

**Ошибочная конфигурация TLS:**

* Убедитесь, что ваш секрет TLS действителен и корректно указан во входном шлюзе
* Браузеры могут блокировать небезопасный контент, если вы обращаетесь к приложению по HTTP при включённом TLS

**Версия контроллера Ingress:**

* Некоторые возможности (например, `regex`-пути и правила переписывания) требуют более новых версий контроллера nginx Ingress
* Проверьте вашу версию командой:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## Входной шлюз для OTel collector {#otel-collector-ingress}

Если вам необходимо опубликовать конечные точки OTel collector (для трассировок, метрик и логов) через входной шлюз, используйте конфигурацию `additionalIngresses`. Это полезно для отправки телеметрических данных из‑вне кластера или при использовании пользовательского домена для collector.

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

* Это создаёт отдельный ресурс входного шлюза для конечных точек OTel collector
* Вы можете использовать другой домен, настроить отдельные параметры TLS и применить пользовательские аннотации
* Правило пути с использованием регулярного выражения позволяет направлять все сигналы OTLP (traces, metrics, logs) через одно правило

:::note
Если вам не нужно открывать OTel collector во внешний доступ, вы можете пропустить эту конфигурацию. Для большинства пользователей достаточно общей настройки входного шлюза.
:::

## Диагностика проблем с входным шлюзом {#troubleshooting-ingress}

**Проверьте ресурс входного шлюза:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Проверьте логи контроллера входного шлюза:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**Тестовые URL-адреса ресурсов:**

Используйте `curl`, чтобы проверить, что статические ресурсы отдаются как JavaScript, а не как HTML:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**Инструменты разработчика браузера:**

* Проверьте вкладку Network (или «Сеть») на наличие 404 или ресурсов, которые возвращают HTML вместо JS
* Ищите в консоли ошибки вида `Unexpected token <` (указывает на то, что вместо JS возвращается HTML)

**Проверьте переписывание путей:**

* Убедитесь, что входной шлюз не обрезает и не переписывает некорректно пути к статическим ресурсам

**Очистите кэш браузера и CDN:**

* После изменений очистите кэш браузера и кэш CDN/прокси, чтобы избежать использования устаревших версий ресурсов

## Настройка значений {#customizing-values}

Параметры можно настроить с помощью флагов `--set`:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

Или создайте собственный файл `values.yaml`. Чтобы получить значения по умолчанию:

```shell
helm show values clickstack/clickstack > values.yaml
```

Пример конфигурации:

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

Примените собственные значения:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## Дальнейшие шаги {#next-steps}

- [Варианты развертывания](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) — внешние системы и минимальные развертывания
- [Облачные развертывания](/docs/use-cases/observability/clickstack/deployment/helm-cloud) — конфигурации GKE, EKS и AKS
- [Основное руководство по Helm](/docs/use-cases/observability/clickstack/deployment/helm) — базовая установка