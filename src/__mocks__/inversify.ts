export const injectable = () => (_target: unknown) => _target;
export const inject = (_id: unknown) => (_target: unknown, _key: unknown, _index: unknown) => {};
export const Container = jest.fn();
export const LazyServiceIdentifier = jest.fn();
