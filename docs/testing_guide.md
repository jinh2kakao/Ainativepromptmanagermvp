# Product Tour Testing Guide

## Overview

The Product Tour is now split into two parts:
1.  **Dashboard Tour**: Points to the "Create First Prompt" button. (Key: `hasSeenDashboardTour`)
2.  **Creation Tour**: Guides through the prompt editor. (Key: `hasSeenGuestTour`)

## How to Check the Full Flow

### Step 1: Reset All Tour Data

Run this command in the browser console to reset both tours:

```javascript
localStorage.removeItem('hasSeenDashboardTour');
localStorage.removeItem('hasSeenGuestTour');
location.reload();
```

### Step 2: Dashboard Experience

1.  Ensure you are **Logged Out** (Guest Mode).
2.  Go to the **Dashboard** (root URL `/`).
3.  You should see a highlight on the **Test First Prompt (첫 프롬프트 만들기)** button.
4.  Click the button to proceed.

### Step 3: Creation Page Experience

1.  After clicking the button, you will be navigated to the `/prompts/new` page.
2.  Wait a moment (approx. 0.8s).
3.  You should see the second part of the tour welcoming you to the editor.

## Troubleshooting

-   **Dashboard tour not showing?**
    -   Check `hasSeenDashboardTour` key.
    -   Ensure you are explicitly on the dashboard.
-   **Creation tour not showing?**
    -   Check `hasSeenGuestTour` key.
