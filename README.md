# Redux Adapter

This package is the official Redux adapter for [BlueChip](https://github.com/mfpiccolo/blue-chip)

## Usage

```javascript
import { Actions } from "@blue-chip/core";
import reduxAdapter from "@blue-chip/redux-adapter";
import store from "./store";

export const actions = Actions.config({
  adapter: reduxAdapter,
  mutator: store.dispatch
});
```