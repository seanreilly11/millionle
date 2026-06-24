export type TierId =
  | 'dead-on' | 'within5' | 'within100' | 'within2500'
  | 'within50k' | 'within250k' | 'beyond'

const LADDER: { max: number; id: TierId }[] = [
  { max: 0,        id: 'dead-on'    },
  { max: 5,        id: 'within5'    },
  { max: 100,      id: 'within100'  },
  { max: 2500,     id: 'within2500' },
  { max: 50000,    id: 'within50k'  },
  { max: 250000,   id: 'within250k' },
  { max: Infinity, id: 'beyond'     },
]

export function tier(distance: number): TierId {
  return LADDER.find((t) => distance <= t.max)!.id
}
