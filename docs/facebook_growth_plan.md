# DVCalc Facebook Growth Plan

**Status:** Planning only — gated on reaching v1.0 (see "Before we start" below).
Not started.

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

Worth pinning down concretely rather than assuming — most of the feature
table in `CLAUDE.md` already reads "Done." Candidates for what's actually
gating launch:
- [ ] Decide the v1.0 feature bar (or confirm current feature set is enough)
- [ ] Phase 5 (banking/borrowing reminder emails) is coded but not deployed
      — decide if that ships before or after a Facebook push, since it's a
      natural thing to point new users toward
- [ ] Basic QA pass across resorts/room types/edge cases (multi-device)
- [ ] Custom domain — currently live only at the GitHub Pages URL
      (`kaseyriver11.github.io/DVCalc`), no `CNAME` file, no DNS set up.
      Decision needed: keep GitHub Pages as host and just point a bought
      domain at it (cheapest — buy domain, add `CNAME` file to repo,
      add DNS records, done), or migrate hosting elsewhere
      (Netlify/Cloudflare Pages) at the same time. Domain purchase itself
      has to be done by you (registrar + payment); I can handle the
      `CNAME`/DNS/repo-side config once it's bought.
- [ ] Confirm GoatCounter (`dvcalc.goatcounter.com`) is actually receiving
      pageviews, not just correctly embedded — log in and check
      (code-side setup verified 2026-09-05: account exists, tracking
      snippet present on all 9 pages consistently)
- [ ] A single "share this app" link/landing state you're comfortable
      putting in front of strangers

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

- [ ] Set a cadence: e.g. 1 Group discussion thread + 1-2 Page posts/week
      to start — sustainable beats ambitious
- [ ] Build a running content backlog from real app data: point chart
      YoY changes (`changes.html`), banking/borrowing deadline edge cases,
      booking-window-opening dates, split-stay math, Contract Value
      rankings (`contractvalue.html`)
- [ ] Put external links in the first comment, not the post caption
      (both Page and Group posts)

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
