from typing import Dict

# AI Usage Limits (Daily)
# Free: 5 requests
# Pro: 40 requests
# Enterprise: 80 requests

AI_LIMITS: Dict[str, int] = {
    "FREE": 5,
    "PRO": 40,
    "enterprise": 80
}

# Fallback limit for unknown types
DEFAULT_LIMIT = 5
