# AI Gateway

Sole entry: `complete()`, `embed()`, `moderate()`.

Pipeline: resolveModel → loadPrompt → estimateCost → moderate → RESERVE → provider → CAPTURE|RELEASE
