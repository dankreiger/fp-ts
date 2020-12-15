import * as assert from 'assert'
import * as A from '../src/ReadonlyArray'
import { boundedNumber } from '../src/Bounded'
import {
  fold,
  getEndomorphismMonoid,
  getFunctionMonoid,
  getJoinMonoid,
  getMeetMonoid,
  getTupleMonoid,
  monoidAll,
  monoidAny,
  monoidString,
  monoidSum,
  getDualMonoid
} from '../src/Monoid'
import { pipe } from '../src/function'

describe('Monoid', () => {
  it('getTupleMonoid', () => {
    const M1 = getTupleMonoid(monoidString, monoidSum)
    assert.deepStrictEqual(pipe(['a', 1], M1.concat(['b', 2])), ['ab', 3])
    const M2 = getTupleMonoid(monoidString, monoidSum, monoidAll)
    assert.deepStrictEqual(pipe(['a', 1, true], M2.concat(['b', 2, false])), ['ab', 3, false])
  })

  it('fold', () => {
    assert.deepStrictEqual(fold(monoidSum)([1, 2, 3]), 6)
  })

  it('getFunctionMonoid', () => {
    const getPredicateMonoidAll = getFunctionMonoid(monoidAll)
    const getPredicateMonoidAny = getFunctionMonoid(monoidAny)

    const isLessThan10 = (n: number) => n <= 10
    const isEven = (n: number) => n % 2 === 0

    assert.deepStrictEqual(
      pipe([1, 2, 3, 40], A.filter(fold(getPredicateMonoidAll<number>())([isLessThan10, isEven]))),
      [2]
    )
    assert.deepStrictEqual(
      pipe([1, 2, 3, 40, 41], A.filter(fold(getPredicateMonoidAny<number>())([isLessThan10, isEven]))),
      [1, 2, 3, 40]
    )
  })

  it('getEndomorphismMonoid', () => {
    const M = getEndomorphismMonoid<number>()
    const inc = (n: number) => n + 1
    const double = (n: number) => n * 2
    const f = pipe(inc, M.concat(double))
    assert.deepStrictEqual(f(3), 8)
  })

  it('getMeetMonoid', () => {
    const M = getMeetMonoid(boundedNumber)
    assert.deepStrictEqual(fold(M)([]), +Infinity)
    assert.deepStrictEqual(fold(M)([1]), 1)
    assert.deepStrictEqual(fold(M)([1, -1]), -1)
  })

  it('getJoinMonoid', () => {
    const M = getJoinMonoid(boundedNumber)
    assert.deepStrictEqual(fold(M)([]), -Infinity)
    assert.deepStrictEqual(fold(M)([1]), 1)
    assert.deepStrictEqual(fold(M)([1, -1]), 1)
  })

  it('getDualMonoid', () => {
    const M = getDualMonoid(monoidString)
    assert.deepStrictEqual(pipe('a', M.concat('b')), 'ba')
    assert.deepStrictEqual(pipe('a', M.concat(M.empty)), 'a')
    assert.deepStrictEqual(pipe(M.empty, M.concat('a')), 'a')
  })
})
