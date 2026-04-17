export const injectable = () => (target: unknown) => target;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const inject = (_id: unknown) => (_target: unknown, _key: unknown, _index: unknown) => {};
export const Container = jest.fn();
export const LazyServiceIdentifier = jest.fn();
