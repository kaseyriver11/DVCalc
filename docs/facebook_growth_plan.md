# DVCalc Facebook Growth Plan

**Status:** v1.0 is effectively done (see "Before we start," updated
2026-09-06) — the gate this plan was waiting on has cleared. Growth work
itself hasn't started yet. See "Month 1 Plan" below for the concrete,
realistic first-30-days breakdown, written after directly correcting a
"0 to 10,000 in a month" target that isn't achievable through legitimate
organic growth (see that section for the honest numbers and why).

## Take on the Gemini plan

The overall shape (authority in existing groups → own group as the hub →
lean Page for broadcast → funnel into the app) is right for this niche.
DVC members are exactly the kind of obsessive, math-driven audience that
rewards a "the numbers person" reputation, and Facebook Groups genuinely do
get algorithmic priority over Pages. Two corrections worth making before
treating it as executable:

1. **"Answering questions" and "posting daily" can't both be automated the
   same way.** Facebook's Graph API has not allowed posting or commenting
   into Groups since the 2018 platform lockdown — there is no API path for
   an agent to answer questions in *other people's* groups. That has to be
   you, from your real profile. Scheduled/automated posting *is* available
   for a Page you administer (Meta's Graph API supports scheduled Page
   posts), so "daily hint" content on the Page is a legitimate future
   automation target — Group engagement is not, and trying to script it
   risks the personal account being banned for automated behavior.
2. **Disclosure, not concealment.** Answering as "the person who built a
   calculator for this" is fine and builds credibility — most group admins
   allow that once you're a real participant and not link-dropping.
   Answering *without* mentioning the affiliation and then having someone
   discover it reads as astroturfing and burns trust faster than not
   posting at all.

Net effect on the plan below: Phases 1 (group authority) and the
"answering questions" goal are **manual, you-only** work, at least at
first. Phase 3 (Page content) and content *drafting* for groups are where
I can actually help on a recurring basis.

**Decided 2026-09-05:**
- Group answering happens from the **personal profile**, never the Page —
  Pages read as brand accounts in Groups and undercut the "trusted expert"
  persona this plan depends on.
- Disclosure means: when the personal profile mentions the tool, say you
  built it ("I built a free calculator for this"). Never pose as an
  unaffiliated user who "found" your own tool.
- Start Phase 1 now, independent of v1.0/domain status — authority-
  building runs on a weeks-to-months timeline regardless of launch state,
  and you can soft-mention "I'm building a tool for this" pre-launch to
  build a curious audience to point at the app later.
- Phase 1 → 2/3 is a **stagger, not a hard gate**. Creating the Page costs
  nothing and can happen anytime. Hold off launching your own Group until
  a few weeks of real Phase 1 activity have built some personal
  credibility and a bank of real questions to seed it with — a group with
  no founder reputation and no seed content hits the classic cold-start
  problem.
- The daily "best weeks" resort series is a Page-content idea (Phase 3),
  and a good one — Graph API scheduled Page posts don't require Meta app
  review for posting to your own Page, so this is a realistic automation
  target once Phase 3 starts.

## Before we start: what "v1.0" means

- [x] ~~Decide the v1.0 feature bar~~ — current feature set confirmed enough.
- [x] ~~Phase 5 deployed~~ — banking/borrowing reminder emails fully live and
      tested against `dvcalc.app` as of 2026-09-06.
- [x] ~~Basic QA pass~~ — swept all 9 pages for console errors, verified nav
      links, did a code-level mobile responsiveness audit (see
      `dvcalc_v1_launch_checklist` artifact for the full rundown).
- [x] ~~Custom domain~~ — `dvcalc.app` purchased and live over HTTPS.
- [x] ~~Confirm GoatCounter is actually receiving pageviews~~ — confirmed,
      real traffic showing up.
- [x] ~~A single "share this app" link~~ — `dvcalc.app` itself is that link.

**v1.0 is done. This plan's own gate has cleared.**

## Month 1 Plan — realistic targets, week by week

**The honest number check first, since it shapes everything below:**
a brand-new Page with no existing audience, growing to 10,000 real
followers in 30 days through organic posting alone, isn't realistic —
Facebook's algorithm has suppressed new-Page organic reach for years, and
follower growth compounds slowly from zero. A defensible organic target for
month 1 is **low hundreds to roughly 1,000–2,000 real, engaged people**
across the Page and (if it launches this month) the Group combined — not
10,000. Hitting 10,000 for real would need paid ad spend, realistically
**$3,000–$15,000+** depending on targeting precision, which is a genuinely
different plan (ask if you want that one costed out instead). Buying
followers isn't on the table at all — fake followers actively hurt an
algorithm-scored Page and undercut the "trusted expert" positioning this
whole plan depends on.

This month is Phase 1 (authority-building) plus the *setup* half of Phase 2
— not a launch month. That's the trade for doing this for real instead of
buying a fake number.

**Week 1 — setup, no posting yet**
- [ ] Create the Page now (free, no reason to wait) — bio links straight to
      `dvcalc.app`, no content push yet
- [ ] Identify and join 4-6 high-traffic DVC Facebook groups with your real
      profile (DVC Fan, DVC Members, DVC Resale Community, etc.)
- [ ] Read each group's self-promotion rules before posting anything
- [ ] Adopt the link-tagging convention from Phase 0 below so results are
      measurable from day one, not guessed at in week 4

**Week 2-3 — Phase 1, for real**
- [ ] Answer real scenario/math questions in those groups from your
      *personal* profile, using the app, screenshot the result — no link
      unless asked, mention you built it if it comes up naturally
- [ ] Aim for 3-5 genuine, helpful answers per week — quality and
      real usefulness over frequency; this is reputation-building, not
      a posting quota
- [ ] Log every recurring question — that list becomes both future
      Group/Page content and a real feature-request signal
- [ ] Bring me the question text and I'll help you work out the numbers and
      draft a clear, non-spammy reply — I can't post it, that has to be you

**Week 4 — first real content, decide on the Group**
- [ ] If Phase 1 got real traction (people asking "what tool is this," a
      few genuine Page follows trickling in from your bio link), start
      Phase 3's content cadence softly: 1-2 Page posts this week using real
      DVCalc data (a `changes.html` year-over-year point swing, a
      `contractvalue.html` ranking) — not a hard sales push
- [ ] Decide whether to launch the dedicated Group yet, based on whether
      you now have both some personal credibility and a real bank of
      seed questions from weeks 2-3 — a Group with neither hits the
      classic cold-start problem
- [ ] End-of-month check-in: look at GoatCounter's tagged-link data (Phase 0)
      for what's actually driving clicks, not just what got likes

**Realistic end-of-month-1 outcome:** a real Page with a genuine, if small,
following; 4-6 groups where you're a recognized helpful presence; a content
backlog seeded from real questions; and a clear-eyed read on whether the
Group is ready to launch in month 2. That's a real foundation — not a
number, but a base an actual 10,000 could be built on over the following
few months, the way the rest of this doc's phases already lay out.

## Phase 0 — Instrumentation (before any posting)

- [ ] Adopt a link-tagging convention for anything shared on Facebook, so
      GoatCounter (already installed, `dvcalc.goatcounter.com`) can show
      what's working. Simplest option: distinct query param per channel,
      e.g. `?src=fb_group_dvcfan`, `?src=fb_page`, `?src=fb_group_own`.
- [ ] Set a plain-language success metric per phase (e.g. Phase 1: # of
      group replies that get a "what tool is this?" response; Phase 3:
      click-throughs per Page post) rather than only follower counts.

## Phase 1 — Authority in existing groups (manual, you)

- [ ] Identify and join 4-6 high-traffic DVC groups (DVC Fan, DVC Members,
      DVC Resale Community, etc.) with your real profile
- [ ] Read each group's rules re: self-promotion before posting anything
- [ ] For 2-4 weeks, answer scenario/math questions using the app,
      screenshot the result, no link in the post — mention the tool only
      if asked or in a low-key aside
- [ ] Track which questions come up repeatedly — that list becomes both
      the Group's seed content (Phase 3) and a feature-request backlog

**Where I help here:** bring me the question text from the group and I'll
run the numbers/screenshots through the app logic with you and help draft
a clear, non-spammy reply. I can't post it — that has to be your account.

## Phase 2 — Presence: Page + Group

- [ ] Create the Facebook Page (brand anchor, bio link, later ad option)
- [ ] Create the dedicated Group — name it around the *problem*, not the
      app (e.g. "DVC Point Strategy & Trip Budgeting"), per Gemini's framing
- [ ] Cross-link Page ↔ Group in both descriptions
- [ ] Write group rules that explicitly allow "tool/calculator" mentions
      in comments (since you'll want that norm for other members too)

## Phase 3 — Content engine (this is the recurring collaborative part)

- [x] ~~Set a cadence~~ — 1-2 Page posts/week + 1 Group thread/week, per the
      Month 1 plan above.
- [x] ~~Build a running content backlog~~ — **flagship series decided
      2026-09-06: "Resort Value Check."** One resort per post, real numbers
      straight from Contract Value's own ranking (150 pts, resale, full
      contract length, $35/pt @ 5% growth, 4% dues growth — same defaults
      every time, stated in each post). A full month's worth of specific,
      real-numbers posts (not templates) is drafted — see the "Resort Value
      Check" content-calendar artifact for the actual 8 Page posts + 4
      Group threads, including two standout angles found while building it:
      Grand Californian is the priciest resale resort by far ($261/pt) yet
      ranks only #11 for long-term value, and six resorts (OKW, Beach Club,
      BoardWalk, Boulder Ridge, Hilton Head, Vero Beach) cluster at the
      bottom purely because their contracts all expire in 2042 — not
      because they're worse resorts. Second series, to rotate in once this
      one's proven out: "Points Creep Watch" (YoY point chart increases,
      from `changes.html`).
- [ ] Put external links in the first comment, not the post caption
      (both Page and Group posts)

**Important caveat carried over from the Contract Value rankings:** Grand
Californian's and Aulani's cash rates in `data.js` are rough, clearly-flagged
*estimates* (`isEstimate: true`, see `docs/data_reproducibility.md`), not
observed prices. The Contract Value ranking above doesn't actually depend on
them (it uses one flat assumed vacation-value-per-point across every resort,
not resort-specific cash rates) — but avoid featuring those two resorts'
specific estimated cash numbers in public posts regardless, since they carry
real (±15-20%) uncertainty that's fine to show quietly in-app but riskier to
state as fact to a public audience.

**Where I help here:** this is the part worth turning into an actual
recurring session with me — e.g. a weekly working session where we pull
real numbers from the data files and I draft: one Group discussion
prompt, one Page post/infographic outline, and a short Reel script. You
review, tweak tone, and post. Once the cadence is proven out manually, the
*drafting* step (not the posting) is a reasonable candidate for a
scheduled job (`/schedule`) that hands you a ready-to-review content pack
each week — worth revisiting once Phase 3 has run manually for a few
weeks and we know what a "good post" actually looks like for this
audience.

## Phase 4 — Funnel

- [ ] Point specific scenarios discussed in the Group at specific tools
      (e.g. a split-stay question → link to the calendar's split-stay
      mode, not just the homepage)
- [ ] Revisit tagged-link data monthly: which channel/post type actually
      drives app opens, not just likes/comments

## Later idea (not now): customer service

Once there's real usage, "answering questions" could extend to in-app
support (a FAQ, or a lightweight assisted-reply tool for common
questions) rather than Facebook itself — Facebook's API restrictions make
that channel a poor fit for automation regardless of how the app-side
support gets built.
