# Walkthrough: Template Filtering Fix (Database Migration)

## Problem
템플릿 드롭다운에서 직무 분류 선택 시 필터링이 작동하지 않았습니다. 모든 직무분류의 템플릿이 표시되었습니다.

## Root Cause
데이터베이스와 프론트엔드 간의 카테고리 값 불일치:
- **데이터베이스**: 영문 스네이크 케이스 (`ui_structure`, `ux_research` 등)
- **프론트엔드**: 한글 값 (`UI 구조 및 레이아웃`, `사용자 리서치(UX Research)` 등)

API가 `subCategory` 파라미터로 한글 값을 받았지만, 데이터베이스에서 해당 값으로 카테고리를 찾을 수 없어 필터링이 실패했습니다.

## Solution
데이터베이스의 모든 카테고리 값을 프론트엔드 [`jobCategories.ts`](file:///Users/jinh/Ainativepromptmanagermvp/frontend/src/utils/jobCategories.ts)의 한글 값으로 마이그레이션했습니다.

### Migration Script
[`backend/scripts/migrate_category_values.py`](file:///Users/jinh/Ainativepromptmanagermvp/backend/scripts/migrate_category_values.py)

총 48개 카테고리 중 48개 모두 성공적으로 업데이트:
- 1차 실행: 34개 업데이트
- 2차 실행: 14개 추가 업데이트 (누락된 alternative names)

### Updated Category Values Examples

| Before (English) | After (Korean) |
|-----------------|---------------|
| `ui_structure` | `UI 구조 및 레이아웃` |
| `ux_research` | `사용자 리서치(UX Research)` |
| `frontend_dev` | `프론트엔드 개발` |
| `data_visualization` | `데이터 시각화` |
| `social_media` | `소셜 미디어(SNS)` |

## Verification

### Database Query Test
```bash
Looking for category with value: 사용자 리서치(UX Research)
Found category: 사용자 리서치(UX Research) (id: 10094c9b-986f-4426-ba39-7544b6bd3cc7)
Templates for this category: 6
```

✅ 필터링이 정상 작동합니다!

### API Endpoints Updated
1. **[`/api/templates`](file:///Users/jinh/Ainativepromptmanagermvp/backend/routers/templates.py#L19-L34)** (public)
   - Added `subCategory` query parameter
   - Filters by Korean category value

2. **[`/api/admin/templates`](file:///Users/jinh/Ainativepromptmanagermvp/backend/routers/admin.py#L300-L332)** (admin)
   - Also updated with `subCategory` parameter

### Frontend Changes
**[`PromptForm.tsx`](file:///Users/jinh/Ainativepromptmanagermvp/frontend/src/components/ui-generated/PromptForm.tsx#L67-L77)**
```tsx
// Changed from admin endpoint to public endpoint
const response = await api.get(`/api/templates?subCategory=${encodeURIComponent(subCategory)}`);
```

## Testing Steps
1. Navigate to `/prompts/new`
2. Select "서비스 & 프로덕트 기획" → "사용자 리서치(UX Research)"
3. **Expected**: Template dropdown shows only 6 templates for that subcategory
4. **Expected**: Default template auto-populates the form

## Files Modified
- ✅ [`backend/routers/templates.py`](file:///Users/jinh/Ainativepromptmanagermvp/backend/routers/templates.py) - Added subCategory filtering
- ✅ [`backend/routers/admin.py`](file:///Users/jinh/Ainativepromptmanagermvp/backend/routers/admin.py) - Added subCategory filtering  
- ✅ [`frontend/src/components/ui-generated/PromptForm.tsx`](file:///Users/jinh/Ainativepromptmanagermvp/frontend/src/components/ui-generated/PromptForm.tsx) - Use public API endpoint
- ✅ Database - All 48 categories migrated to Korean values

## Technical Notes
- Backend server is running with `--reload`, changes are active
- Migration is **one-time** and **idempotent** (safe to re-run)
- All existing templates remain linked correctly via `category_id` foreign keys
