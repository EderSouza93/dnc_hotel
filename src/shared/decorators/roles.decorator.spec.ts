import { ROLES_KEY, Roles } from "./roles.decorator";
import { Role } from "@prisma/client";

describe('Roles Decorator', () => {
  it('should set metadata with the provided roles', () => {
    const decorator = Roles(Role.ADMIN, Role.USER);

    const target = class TestClass {};
    decorator(target);

    const roles = Reflect.getMetadata(ROLES_KEY, target);
    expect(roles).toEqual([Role.ADMIN, Role.USER]);
  });

  it('should set metadata with a single role', () => {
    const decorator = Roles(Role.ADMIN);

    const target = class TestClass {};
    decorator(target);

    const roles = Reflect.getMetadata(ROLES_KEY, target);
    expect(roles).toEqual([Role.ADMIN]);
  });
});
