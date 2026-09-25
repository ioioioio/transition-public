# backend

## Transition API

The client and types for Transition's API are generated from its OpenAPI spec into
[./src/transition/generated/](./src/transition/generated/). The client reads Transition's address from the
`TRANSITION_ENDPOINT` environment variable, set in the root `.env`.

To regenerate them, see the [root README](../README.md#transition-api).
