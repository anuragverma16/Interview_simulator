# InterviewIQ AI — API Structure

Base URL: `/api/v1`

## Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | User signup | Public |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/logout` | Logout | User |
| GET | `/auth/me` | Get current user | User |

## Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/profile` | Get profile | User |
| PUT | `/users/profile` | Update profile | User |
| PUT | `/users/settings` | Update settings | User |
| GET | `/users/stats` | Get user stats | User |

## Resume
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/resume/upload` | Upload PDF resume | User |
| GET | `/resume` | List user resumes | User |
| GET | `/resume/:id` | Get resume analysis | User |
| DELETE | `/resume/:id` | Delete resume | User |
| POST | `/resume/:id/reanalyze` | Re-analyze resume | User |

## Skill Gap
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/skill-gap/analyze` | Compare resume vs role | User |
| GET | `/skill-gap` | List analyses | User |
| GET | `/skill-gap/:id` | Get analysis detail | User |
| PUT | `/skill-gap/:id/progress` | Update skill progress | User |

## Interviews
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/interviews/start` | Start interview session | User |
| POST | `/interviews/:id/answer` | Submit answer | User |
| POST | `/interviews/:id/follow-up` | Get follow-up question | User |
| POST | `/interviews/:id/complete` | Complete interview | User |
| GET | `/interviews` | Interview history | User |
| GET | `/interviews/:id` | Get interview detail | User |
| POST | `/interviews/voice/analyze` | Analyze voice transcript | User |

## Coding
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/coding/start` | Start coding session | User |
| POST | `/coding/:id/submit` | Submit code for review | User |
| GET | `/coding` | Coding history | User |
| GET | `/coding/:id` | Get session detail | User |

## Career
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/career/predict` | Generate career prediction | User |
| GET | `/career` | List predictions | User |
| GET | `/career/:id` | Get prediction detail | User |

## Roadmap
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/roadmap/generate` | Generate learning roadmap | User |
| GET | `/roadmap` | List roadmaps | User |
| GET | `/roadmap/:id` | Get roadmap detail | User |
| PUT | `/roadmap/:id/progress` | Update topic progress | User |

## Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard` | Dashboard analytics | User |
| GET | `/dashboard/leaderboard` | Leaderboard | User |

## Achievements
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/achievements` | All achievements | User |
| GET | `/achievements/user` | User achievements | User |

## Admin
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/stats` | Platform stats | Admin |
| GET | `/admin/users` | List users | Admin |
| PUT | `/admin/users/:id` | Update user | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |
| GET | `/admin/logs` | Admin activity logs | Admin |

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```

## Error Format
```json
{
  "success": false,
  "error": "Error message",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```
