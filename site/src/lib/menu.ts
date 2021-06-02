
import { reactive, provide, inject } from 'vue';

export const menuSymbol = Symbol('menu');
export const createMenu = () => reactive({ counter: 0 });

export const useState = () => inject(menuSymbol);
export const provideState = () => provide(
  menuSymbol,
  createMenu()
);
