# RFC: AI Matching

**Status:** Draft  
**Phase:** 8  
**Author:** Product / CTO  

## Summary

Score job/resume fit using AI — **enhancement only**, not replacement for search.

## Requirements

- Matching runs via `src/modules/ai/matching/` + queue  
- Graceful degradation when AI unavailable  
- Explainable scores (Phase 8+)  
- Token/cost tracking per plan  

## Non-Goals

- AI-only job discovery (search must work without AI)  

## Dependencies

- Phase 4 Jobs, Phase 5 Resumes  
- Phase 7 AI Gateway  

## Fallback

If AI down: hide match scores; search and apply still work.
