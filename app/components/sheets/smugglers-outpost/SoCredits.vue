<script setup lang="ts">
import SheetCredits from '../_shared/SheetCredits.vue'
import { SO } from './story'

// PROTOTYPE (overnight run, Smuggler's Outpost; not a variant): the credits that close every variant here, through
// the shared credits block (sheets/_shared, TOOLS.md). PLACEHOLDER copy (story.ts).
</script>

<template>
  <SheetCredits :items="SO.credits" />
</template>
