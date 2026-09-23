# To do: declutter Home

Status: noted, not started. Raised by the owner on September 22, 2026 while fixing UX2-07.

Home is becoming bloated with numbers, links, and bold text. It's the default landing spot (the brand and the installed app both open it as of 2026-09-22), and the app's framing is a contract manager with the calendar in support, so Home should answer "what do I need to know or do right now" at a glance rather than restate every page.

Observed on the current dashboard:
- The Membership Value card alone carries a payback line, a percent, a progress bar, a House Money estimate, two explanatory notes (assumptions and what "booked value" counts), an assumptions link, a Details link, and now a Record a booking button.
- The health banner, contract cards, and "Coming up" deadline list can repeat the same deadline in more than one place.
- Many figures are bold at once, so nothing stands out.

- [ ] Inventory every number, link, and bold run on Home at 390px with a real two-contract account; mark each as act-now, glanceable status, or detail that belongs on its own page.
- [ ] Keep one primary action per card; move secondary links behind the card's own "Details" destination.
- [ ] Move explanatory notes (model assumptions, what booked value counts) to tooltips or the destination page.
- [ ] Show each deadline in one place only.
- [ ] Reserve bold for the single figure per card that matters most.
- [ ] Verify at 390px and 360px, signed out, new owner with no contracts, and a multi-contract owner.

Related: the booking entry point added to the Membership Value card for UX2-07 (`home.js` `renderHouseMoneyWidget()`) should survive the cleanup — it was the owner's explicit request.
