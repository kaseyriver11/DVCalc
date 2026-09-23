// The site nav is hand-duplicated into every page (nav.js only runs the
// hamburger toggle -- there is no shared include and no build step), so
// nothing but this test stops one page from drifting a group label, losing
// a link, or highlighting the wrong tab after an edit touches only some of
// the copies. Structure is asserted against ONE expected shape here rather
// than "all files agree with each other", so a change made consistently
// everywhere but wrongly still has to be stated deliberately in this file.
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');

const ROOT = path.join(__dirname, '..');
const EXPECTED = [
  ['Overview', [['home.html', 'Home'], ['badges.html', 'Achievements']]],
  ['My Membership', [['account.html', 'My Contracts'], ['bookings.html', 'Bookings &amp; Stays'],
                     ['trips.html', 'Membership Value']]],
  ['Plan a Stay', [['index.html', 'Calendar'], ['compare.html', 'Compare Resorts'],
                   ['suggest.html', 'Suggest a Stay'], ['contractvalue.html', 'Contract Value']]],
  ['My Itineraries', [['itineraries.html', 'Saved Itineraries'],
                      ['itinerarycompare.html', 'Compare Itineraries']]],
];
// Every page that renders the nav. changes.html carries it but is not a nav
// destination itself, so it is the one page expected to have no active tab.
const PAGES = ['account.html', 'badges.html', 'bookings.html', 'changes.html', 'compare.html', 'contractvalue.html',
               'home.html', 'index.html', 'itineraries.html', 'itinerarycompare.html',
               'suggest.html', 'trips.html'];
const NO_ACTIVE_TAB = new Set(['changes.html']);

function navOf(file) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const block = html.match(/<div class="site-nav-links">([\s\S]*?)<\/div>\s*<span id="account-control"/);
  assert.ok(block, `${file}: no .site-nav-links block`);
  const groups = [...block[1].matchAll(/<span class="site-nav-group">([\s\S]*?)<\/span>\s*(?=<span class="site-nav-(?:divider|group)|$)/g)];
  return groups.map(g => {
    const label = g[1].match(/<span class="site-nav-group-label">([^<]*)</)[1];
    const links = [...g[1].matchAll(/<a href="([^"]+)"(?: class="(active)")?>([^<]*)</g)]
      .map(m => ({ href: m[1], text: m[3], active: Boolean(m[2]) }));
    return { label, links };
  });
}

for (const file of PAGES) {
  test(`${file} nav matches the expected structure`, () => {
    const groups = navOf(file);
    assert.deepEqual(groups.map(g => g.label), EXPECTED.map(([l]) => l));
    groups.forEach((g, i) => {
      assert.deepEqual(g.links.map(l => [l.href, l.text]), EXPECTED[i][1],
        `${file}: links under "${g.label}"`);
    });
  });

  test(`${file} highlights exactly its own tab`, () => {
    const active = navOf(file).flatMap(g => g.links).filter(l => l.active);
    if (NO_ACTIVE_TAB.has(file)) {
      assert.equal(active.length, 0, `${file} is not a nav destination`);
    } else {
      assert.equal(active.length, 1, `${file}: expected one active link`);
      assert.equal(active[0].href, file);
    }
  });
}

test('every nav destination is a real file, and every page with a nav is covered', () => {
  for (const [, links] of EXPECTED) {
    for (const [href] of links) {
      assert.ok(fs.existsSync(path.join(ROOT, href)), `nav links to missing file: ${href}`);
    }
  }
  const withNav = fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html'))
    .filter(f => fs.readFileSync(path.join(ROOT, f), 'utf8').includes('class="site-nav-links"'));
  assert.deepEqual(withNav.sort(), [...PAGES].sort(),
    'a page gained or lost the nav without this test being updated');
});
