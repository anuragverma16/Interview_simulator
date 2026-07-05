# InterviewIQ AI — UI Wireframes

## Design System
- **Theme**: Premium Dark (#0a0a0f base, #12121a surface)
- **Accent**: Neon gradients (cyan #00f5ff → purple #a855f7 → pink #ec4899)
- **Glass**: backdrop-blur-xl, bg-white/5, border-white/10
- **Typography**: Inter (body), Space Grotesk (headings)
- **Effects**: Floating orbs, particle canvas, mouse glow, stagger animations

---

## 1. Landing Page
```
┌──────────────────────────────────────────────────────────────┐
│ [Logo InterviewIQ]          Features  Pricing  Login [CTA]   │
├──────────────────────────────────────────────────────────────┤
│                    ✦ Particle Background ✦                    │
│                                                              │
│         Ace Your Next Interview with AI Intelligence         │
│              [Gradient Hero Text - GSAP reveal]              │
│                                                              │
│         [Start Free Trial]    [Watch Demo]                   │
│                                                              │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│    │ Resume  │  │ AI Mock │  │ Coding  │  │ Career  │    │
│    │Analyzer │  │Interview│  │Practice │  │Predict  │    │
│    └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
│                                                              │
│    ─── How It Works (3 steps, scroll-triggered) ───         │
│    ─── Stats Counter Animation ───                          │
│    ─── Testimonials Carousel ───                            │
│    ─── CTA Section ───                                      │
├──────────────────────────────────────────────────────────────┤
│ Footer: Links | Social | © 2026 InterviewIQ AI              │
└──────────────────────────────────────────────────────────────┘
```

## 2. Login / Signup
```
┌──────────────────────────────────────────────────────────────┐
│  Left: Animated gradient mesh + floating cards               │
│  Right: Glass card form                                       │
│         [Email] [Password] [Remember me]                      │
│         [Sign In Button - glow hover]                         │
│         OAuth divider | Sign up link                          │
└──────────────────────────────────────────────────────────────┘
```

## 3. Dashboard
```
┌────────┬─────────────────────────────────────────────────────┐
│ Sidebar│  Welcome back, {name}          [Notifications] [⚙]  │
│ ────── │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│ Dash   │  │ XP   │ │Inter-│ │Score │ │Streak│  (stat cards) │
│ Resume │  │Level │ │views │ │ Avg  │ │ Days │               │
│ Skills │  └──────┘ └──────┘ └──────┘ └──────┘               │
│ Inter- │  ┌─────────────────┐ ┌─────────────────┐            │
│ view   │  │ Progress Chart  │ │ Skill Rings     │            │
│ Coding │  │ (animated)      │ │ (SVG rings)     │            │
│ Career │  └─────────────────┘ └─────────────────┘            │
│ Roadmap│  ┌─────────────────────────────────────┐            │
│ Achieve│  │ Recent Interviews Table              │            │
│ Profile│  └─────────────────────────────────────┘            │
│ Settings│ ┌─────────────────────────────────────┐            │
│        │  │ Leaderboard (top 5)                  │            │
│ [Logout]│ └─────────────────────────────────────┘            │
└────────┴─────────────────────────────────────────────────────┘
```

## 4. Resume Analyzer
```
┌──────────────────────────────────────────────────────────────┐
│  [Upload Zone - drag & drop PDF]                             │
│  ┌────────────┐  ┌──────────────────────────────────────┐   │
│  │ ATS Score  │  │ Resume Score (circular progress)      │   │
│  │   78/100   │  │                                       │   │
│  └────────────┘  └──────────────────────────────────────┘   │
│  Skills Tags | Projects Cards | Education Timeline           │
│  Missing Keywords (red chips) | Suggestions (accordion)      │
└──────────────────────────────────────────────────────────────┘
```

## 5. Skill Gap Analyzer
```
┌──────────────────────────────────────────────────────────────┐
│  [Target Role Input] [Job Description Textarea] [Analyze]    │
│  Match: 72% ████████░░                                       │
│  ┌ Matched Skills ──┐  ┌ Missing Skills (priority) ──┐     │
│  │ ✓ React ✓ Node   │  │ ! Kubernetes  ! System Design│     │
│  └──────────────────┘  └──────────────────────────────┘     │
│  Learning Roadmap Timeline (horizontal scroll)               │
└──────────────────────────────────────────────────────────────┘
```

## 6. AI Interview Room
```
┌──────────────────────────────────────────────────────────────┐
│  Type: [HR][Tech][Behavioral][FAANG][Startup]  Diff: [●●●] │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ AI Avatar / Pulse   │  │ Question Card               │  │
│  │ Voice waveform      │  │ "Tell me about a time..."   │  │
│  │ [🎤 Record] [Stop]  │  │ [Text Answer Area]          │  │
│  └─────────────────────┘  │ [Submit] [Skip]             │  │
│                           └─────────────────────────────┘  │
│  Live Transcript panel | Confidence meter | Filler words     │
└──────────────────────────────────────────────────────────────┘
```

## 7. Coding Interview
```
┌──────────────────────────────────────────────────────────────┐
│  Problem Panel (left)     │  Monaco Editor (right)            │
│  Difficulty badge         │  [JS][Python][Java][C++] tabs     │
│  Description              │  Code editor with syntax          │
│  Examples                 │  [Run] [Submit for AI Review]     │
│  ─────────────────────────┼──────────────────────────────────│
│  AI Feedback Panel (bottom - expandable)                     │
│  Complexity: O(n) | Score: 85/100 | Suggestions              │
└──────────────────────────────────────────────────────────────┘
```

## 8. Admin Dashboard
```
┌────────┬─────────────────────────────────────────────────────┐
│ Admin  │  Platform Overview                                  │
│ Nav    │  Users | Interviews | Resumes | Active Today        │
│        │  User Management Table (search, filter, actions)    │
│        │  Activity Logs | Charts (registrations over time)   │
└────────┴─────────────────────────────────────────────────────┘
```
