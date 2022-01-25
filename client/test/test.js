const { expectLoaded, expectPage, test } = require('@excaliburjs/testing');

test('A Rollup project', async (page) => {
  await expectLoaded();
  await expectPage('Sword', './test/images/actual-play.png').toBe('./test/images/expected-play.png');
});