import { checkerString } from '@helper/common';

test('checkerString test 1', async () => {
  expect(checkerString('2022-06-19')).toStrictEqual(true);
  expect(checkerString('202sadsa9')).toStrictEqual(true);
  expect(checkerString('2as fdsafds')).toStrictEqual(true);
  expect(checkerString(null)).toStrictEqual(false);
  expect(checkerString(undefined)).toStrictEqual(false);
});
