# shadcn/ui monorepo template

This template is for creating a monorepo with shadcn/ui.

## Usage

```bash
pnpm dlx shadcn@latest init
```

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

## Deployment Baseline (Azure VM + ACR + Docker Compose)

1. Copy `.env.example` to `.env` and fill all values.
2. Build and push images to your Azure Container Registry:
```bash
docker build -f apps/web/Dockerfile -t <acr-login-server>/<web-image>:<tag> .
docker build -f apps/server/Dockerfile -t <acr-login-server>/<server-image>:<tag> .
docker push <acr-login-server>/<web-image>:<tag>
docker push <acr-login-server>/<server-image>:<tag>
```
3. On the VM, login to ACR and run production compose:
```bash
docker login <acr-login-server>
docker compose --env-file .env -f compose.prod.yaml up -d
```

Use `compose.yaml` for local/dev builds and `compose.prod.yaml` for image-based deployments.
