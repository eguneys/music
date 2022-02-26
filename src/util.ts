export type Memo<A> = {
	(): A,
	clear(): void
}


export function memo<A>(f: () => A): Memo<A> {
  let v: A | undefined;

  const ret = (): A => {
    if (v === undefined) v = f();
    return v;
  };

  ret.clear = () => {
    v = undefined;
  };
  return ret;
}
