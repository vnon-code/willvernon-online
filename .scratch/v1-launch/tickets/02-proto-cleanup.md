---
title: Remove /proto leftovers
labels: [wayfinder:task]
status: closed
assignee:
blocked_by: []
---

## Question

Delete the /proto switcher, useProto, useProtoFx and the unused samples in public/proto/sfx now that the picks are built into the real components. Confirm nothing live imports them. AFK.

## Resolution (2026-10-05)

Already done in commit 12bf4a7, "Build the Landing picks into the real components". The switcher, useProto, useProtoFx, the Proto* components and public/proto/sfx were deleted, and grep finds no references left in `app/`. The ticket came from a stale summary.
