# common

Code shared by the frontend and the backend.

## Transition API

Zod schemas for Transition's API are generated from its OpenAPI spec into
[./src/transition/generated/](./src/transition/generated/), and exported as `Transition.Schema`:

```ts
import { Transition as Tr } from 'common';

Tr.Schema.PostApiV1RouteBody.safeParse(body);
```

To regenerate them, see the [root README](../README.md#transition-api).
