import {
  checkerString,
  checkerNumber,
  filterDuplicates,
  fetchLevel,
} from '@helper/common';

test('checkerString test 1', async () => {
  expect(checkerString('2022-06-19')).toStrictEqual(true);
  expect(checkerString('202sadsa9')).toStrictEqual(true);
  expect(checkerString('2as fdsafds')).toStrictEqual(true);
  expect(checkerString('2as fd s a f  d s')).toStrictEqual(true);
});

test('checkerNumber test 1', async () => {
  expect(checkerNumber(4)).toStrictEqual(true);
  expect(checkerNumber(Number('1234'))).toStrictEqual(true);
  expect(checkerNumber(Number('dsafougfouegr'))).toStrictEqual(false);
  expect(checkerNumber(12345)).toStrictEqual(true);
});

test('filterDuplicates test 1', async () => {
  expect(filterDuplicates([1, 2, 3, 4, 5, 6, 7, 8])).toStrictEqual([
    1, 2, 3, 4, 5, 6, 7, 8,
  ]);
  expect(
    filterDuplicates([1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]),
  ).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  expect(
    filterDuplicates(['hello', 'hello', 'null', 'null', 'there', 'there']),
  ).toStrictEqual(['hello', 'null', 'there']);
});

test('fetchLevel test 1', async () => {
  expect(await fetchLevel(4)).toStrictEqual('');
  expect(await fetchLevel(0)).toStrictEqual('USER');
  expect(await fetchLevel(1)).toStrictEqual('FACILITATOR');
  expect(await fetchLevel(2)).toStrictEqual('ORGANIZER');
  expect(await fetchLevel(3)).toStrictEqual('');
  expect(await fetchLevel(-4)).toStrictEqual('');
});
